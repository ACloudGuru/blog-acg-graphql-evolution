const { ApolloServer, gql } = require('apollo-server-lambda');
const { buildFederatedSchema } = require('@apollo/federation');

const series = [
    { 
        seriesId: 'aws-this-week',
        title: 'AWS This Week'
    },
    { 
        seriesId: 'azure-this-week',
        title: 'Azure This Week'
    }
];

const episodes = {
    'aws-this-week': [
        { 
            seriesId: 'aws-this-week',
            episodeId: 'episode-1',
            title: 'AWS This Week Episode #1',
            contentId: 'video-1',
        },
        { 
            seriesId: 'aws-this-week',
            episodeId: 'episode-2',
            title: 'AWS This Week Episode #2',
            contentId: 'video-2',
        },
    ],
    'azure-this-week': [
        { 
            seriesId: 'azure-this-week',
            episodeId: 'episode-1',
            title: 'Azure This Week Episode #1',
            contentId: 'video-3',
        },
        { 
            seriesId: 'azure-this-week',
            episodeId: 'episode-2',
            title: 'Azure This Week Episode #2',
            contentId: 'video-4',
        },
    ]
};

const typeDefs = gql`
    # Used for resolving
    extend type VideoContent @key(fields: "contentId") {
        contentId: ID! @external
        seriesId: ID! @external
    }

    type Episode @key(fields: "seriesId") @key(fields: "episodeId") {
        episodeId: ID!
        seriesId: ID!
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

const resolvers = {   
    Episode: {
        __resolveReference(reference) {
            // console.log('Episode.__resolveReference', JSON.stringify({ reference }, null, 2));
            return episodes['aws-this-week'][0];
        },

        // Used for resolving
        content(episode) {
            console.log('Episode.content', JSON.stringify({ episode }, null, 2));
            return { __typename: "VideoContent", contentId: episode.contentId, test: '123' };
        }
    },
    
    // TODO: Consider how the episode should fetch itself
    Series: {
        episodes: ({ seriesId }) => episodes[seriesId]
    },

    Query: {
        allSeries: () => series
    }
}

const server = new ApolloServer({
    schema: buildFederatedSchema([{ typeDefs, resolvers }])
});

exports.handler = server.createHandler();