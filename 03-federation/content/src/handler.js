const { ApolloServer, gql } = require('apollo-server-lambda');
const { buildFederatedSchema } = require('@apollo/federation');
const _ = require('lodash/fp');

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
    type VideoContent @key(fields: "contentId") {
        contentId: ID!
        duration: Int
        url: String
    }
`;

const resolvers = {   
    VideoContent: {
        __resolveReference(reference) {
            return videos[reference.contentId];
        }
    }
}

const server = new ApolloServer({
    schema: buildFederatedSchema([{ typeDefs, resolvers }])
});

exports.handler = server.createHandler();