const { graphql } = require('graphql');
const { makeExecutableSchema } = require('graphql-tools');

const DataLoader = require('dataloader');

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
        author: ({ authorId }, __, { dataloaders: { userByUserIdLoader }}) => {
            return userByUserIdLoader.load(authorId)
        },     
    },
    
    Series: {
        episodes: ({ seriesId }, __, { dataloaders: { episodesBySeriesIdLoader }}) => {
            return episodesBySeriesIdLoader.load(seriesId)
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

const makeDataloaders = ({ principalId, lambda }) => ({
    userByUserIdLoader: new DataLoader(async (userIds) => {
        const response = await lambda
            .invoke({ 
                FunctionName: 'identity-dev-userByUserId',
                Payload: JSON.stringify({ args: { userIds }}),
            })
            .promise();

        return getInvokeBody(response);
    }),

    episodesBySeriesIdLoader: new DataLoader(async (seriesIds) => {
        const response = await lambda
            .invoke({ 
                FunctionName: 'series-dev-episodesBySeriesId',
                Payload: JSON.stringify({ args: { seriesIds }, context: { principalId }}),
            })
            .promise();

        return getInvokeBody(response);
    })
});

const handler = async (event, context) => {
    console.log(JSON.stringify({ event }, null, 2));

    const payload = JSON.parse(event.body);
    const principalId = event.headers.Authorization || null;

    // Only defined in the handler and required for serverless offline
    const AWS = process.env._X_AMZN_TRACE_ID
        ? AWSXRay.captureAWS(require('aws-sdk'))
        : require('aws-sdk');

    const lambda = new AWS.Lambda();

    const dataloaders = makeDataloaders({ lambda, principalId })

    const response = await graphql(
        makeExecutableSchema({ typeDefs, resolvers }),
        payload.query,
        null,
        { dataloaders, lambda }
    );

    return {
        statusCode: 200,
        body: JSON.stringify({ response }, null, 2)
    };
};

module.exports = { handler }