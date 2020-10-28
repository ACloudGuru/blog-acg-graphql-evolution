const { ApolloServer, gql } = require('apollo-server-lambda');
const { buildFederatedSchema } = require('@apollo/federation');
const _ = require('lodash/fp');

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


const typeDefs = gql`
    type VideoContent @key(fields: "contentId") @key(fields: "seriesId")  {
        contentId: ID!
        seriesId: ID!
        episodeId: ID!
        duration: Int
        url: String
        episode: Episode
    }

    # Used for extending
    extend type Episode @key(fields: "episodeId") {
        episodeId: ID! @external                        # @external means it exists in another service
        contentFromContentService: VideoContent
    }
`;

const resolvers = {   
    // Used for resolving
    VideoContent: {
        __resolveReference(reference) {
            console.log('VideoContent.__resolveReference', JSON.stringify({ reference }, null, 2));
            return videos[reference.contentId];
        },
        episode(content) {
            // console.log('VideoContent.episode', JSON.stringify({ content }, null, 2));
            return { __typename: "Episode", episodeId: content.episodeId };
        }
    },
    
    // Used for extending
    Episode: {
        contentFromContentService(episode) {
            // console.log(JSON.stringify({ episode }, null, 2));

            const contentByEpisodeId = _.flow([
                _.values,
                _.find(['episodeId', episode.episodeId])
            ]);

            return contentByEpisodeId(videos);
        }
    }
}

const server = new ApolloServer({
    schema: buildFederatedSchema([{ typeDefs, resolvers }])
});

exports.handler = server.createHandler();