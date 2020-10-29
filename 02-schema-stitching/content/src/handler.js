// Dependencies included for all functions
require('aws-sdk');
require('bluebird');
require('lodash');

const { ApolloServer, gql } = require('apollo-server-lambda');

const videos = {
    'video-1': {
        contentId: 'video-1',
        duration: 300,
        url: 'https://some-cloudfront-location.com/video-1.mp4',  
    },
    'video-2': {
        contentId: 'video-2',
        duration: 300,
        url: 'https://some-cloudfront-location.com/video-2.mp4',  
    },
    'video-3': {
        contentId: 'video-3',
        duration: 300,
        url: 'https://some-cloudfront-location.com/video-3.mp4',  
    },
    'video-4': {
        contentId: 'video-4',
        duration: 300,
        url: 'https://some-cloudfront-location.com/video-4.mp4',  
    },
};

const typeDefs = gql`
    type VideoContent {
        contentId: ID!
        duration: Int
        url: String
    }

    type Query {
        contentById(contentId: String): VideoContent
        contentByIds(contentIds: [String]): [VideoContent]
    }
`;

const resolvers = {   
    Query: {
        contentById: (_, { contentId }) => videos[contentId],
        contentByIds: (_, { contentIds }) => {
            return contentIds.map(contentId => videos[contentId]);
        }
            
    }
}

const server = new ApolloServer({
    typeDefs,
    resolvers
});

exports.handler = server.createHandler();