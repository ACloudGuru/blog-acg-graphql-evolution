const { graphql } = require('graphql');
const { makeExecutableSchema } = require('graphql-tools');

const AWSXRay = require('aws-xray-sdk-core');

const typeDefs = `
    type VideoContent {
        contentId: ID!
        duration: Int
        url: String
    }

    type Episode {
        episodeId: ID!
        title: String
        content: VideoContent
    }

    type Series {
        seriesId: ID!
        title: String
        episodes: [Episode]
    }

    type Query {
        allSeries: [Series]
    }
`;

const getInvokeBody = (lambdaResponse) => {
    return JSON.parse(lambdaResponse.Payload)
}

const resolvers = {   
    Episode: {
        content: async ({ contentId }, __, { lambda }) => {
            const response = await lambda
                .invoke({ 
                    FunctionName: 'content-dev-contentByContentId',
                    Payload: JSON.stringify({ contentId }),
                })
                .promise();

            return getInvokeBody(response);
        }
    },
    
    Series: {
        episodes: async ({ seriesId }, __, { lambda }) => {
            const response = await lambda
                .invoke({ 
                    FunctionName: 'series-dev-episodesBySeriesId',
                    Payload: JSON.stringify({ seriesId }),
                })
                .promise();

            console.log(JSON.stringify({ response }))

            return getInvokeBody(response);
        }
    },

    Query: {
        allSeries: async (_, __, { lambda }) => {
            const response = await lambda
                .invoke({ FunctionName: 'series-dev-allSeries' })
                .promise();

            return getInvokeBody(response);
        }
    }
}

const handler = async (event, context) => {
    const payload = JSON.parse(event.body);

    // Only defined in the handler and required for serverless offline
    const AWS = process.env._X_AMZN_TRACE_ID
        ? AWSXRay.captureAWS(require('aws-sdk'))
        : require('aws-sdk');

    const lambda = new AWS.Lambda();

    const response = await graphql(
        makeExecutableSchema({ typeDefs, resolvers }),
        payload.query,
        null,
        { lambda }
    );

    return {
        statusCode: 200,
        body: JSON.stringify({ response }, null, 2)
    };
};

module.exports = { handler }