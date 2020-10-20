const { graphql } = require('graphql');
const { makeExecutableSchema } = require('graphql-tools');

const AWSXRay = require('aws-xray-sdk-core');

const typeDefs = `
    type VideoContent {
        contentId: ID!
        duration: Int
        url: String
    }

    type User {
        userId: ID!
        name: String
    }

    type Episode {
        episodeId: ID!
        title: String
        content: VideoContent
        author: User
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
        author: async ({ authorId }, __, { lambda }) => {
            const response = await lambda
                .invoke({ 
                    FunctionName: 'identity-dev-userByUserId',
                    Payload: JSON.stringify({ args: { userId: authorId } }),
                })
                .promise();

            console.log(JSON.stringify({ response }))

            return getInvokeBody(response);
        },        
    },
    
    Series: {
        episodes: async ({ seriesId }, __, { lambda, principalId }) => {
            const response = await lambda
                .invoke({ 
                    FunctionName: 'series-dev-episodesBySeriesId',
                    Payload: JSON.stringify({ args: { seriesId }, context: { principalId }}),
                })
                .promise();

            console.log(JSON.stringify({ response }))

            return getInvokeBody(response);
        },
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
    console.log(JSON.stringify({ event }, null, 2));

    const payload = JSON.parse(event.body);
    const principalId = event.headers.Authorization || null;

    // Only defined in the handler and required for serverless offline
    const AWS = process.env._X_AMZN_TRACE_ID
        ? AWSXRay.captureAWS(require('aws-sdk'))
        : require('aws-sdk');

    const lambda = new AWS.Lambda();

    const response = await graphql(
        makeExecutableSchema({ typeDefs, resolvers }),
        payload.query,
        null,
        { lambda, principalId }
    );

    return {
        statusCode: 200,
        body: JSON.stringify({ response }, null, 2)
    };
};

module.exports = { handler }