const { ApolloServer, gql } = require('apollo-server-lambda');
const { buildFederatedSchema } = require('@apollo/federation');

const typeDefs = gql`
    type VideoContent @key(fields: "contentId") {
        contentId: ID!
        duration: Int
        url: String
    }

    # Used for resolving
    extend type Episode @key(fields: "episodeId") {
        episodeId: ID! @external
        contentFromContentService: VideoContent
    }
`;

const videos = {
    'video-1': {
        contentId: 'video-1',
        seriesId: 'aws-this-week',
        episodeId: 'episode-1',
        duration: 300,
        url: 'https://some-cloudfront-location.com/video-1.mp4',  
    },
    'video-2': {
        contentId: 'video-2',
        seriesId: 'aws-this-week',
        episodeId: 'episode-2',
        duration: 300,
        url: 'https://some-cloudfront-location.com/video-2.mp4',  
    },
    'video-3': {
        contentId: 'video-3',
        seriesId: 'azure-this-week',
        episodeId: 'episode-1',
        duration: 300,
        url: 'https://some-cloudfront-location.com/video-3.mp4',  
    },
    'video-4': {
        contentId: 'video-4',
        seriesId: 'azure-this-week',
        episodeId: 'episode-2',
        duration: 300,
        url: 'https://some-cloudfront-location.com/video-4.mp4',  
    },
};

const resolvers = {   
    // Used for resolving
    VideoContent: {
        __resolveReference(reference) {
            return videos[reference.contentId];
        }
    },

    Episode: {
        // Used for extending
        contentFromContentService(episode) {
            console.log(episode)
            return videos['video-1'];
        }
    }
}

const server = new ApolloServer({
    schema: buildFederatedSchema([{ typeDefs, resolvers }])
});

exports.handler = server.createHandler();