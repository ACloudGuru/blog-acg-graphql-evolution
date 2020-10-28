const { ApolloServer, gql } = require('apollo-server-lambda');
const { buildFederatedSchema } = require('@apollo/federation');

const series = [
    { 
        seriesId: 'aws-this-week',
        title: 'AWS This Week'
    },
    { 
        seriesId: 'acg-projects',
        title: 'ACG Projects'
    }
];

const episodesBySeriesId = {
    'aws-this-week': [
        { 
            seriesId: 'aws-this-week',
            episodeId: 'episode-1',
            title: 'AWS This Week Episode #1',
            contentId: 'video-1',
            userId: 'auth0|123',
            free: true,
        },
        { 
            seriesId: 'aws-this-week',
            episodeId: 'episode-2',
            title: 'AWS This Week Episode #2',
            contentId: 'video-2',
            userId: 'auth0|123',
            free: true,
        },
    ],
    'acg-projects': [
        { 
            seriesId: 'acg-projects',
            episodeId: 'episode-1',
            title: 'Learn how to deploy lambda #1',
            contentId: 'video-3',
            userId: 'auth0|456',
            free: false,
        },
        { 
            seriesId: 'acg-projects',
            episodeId: 'episode-2',
            title: 'Learn how to deploy serverless applications in S3 #2',
            contentId: 'video-4',
            userId: 'auth0|456',
            free: false,
        },
    ]
};


const typeDefs = gql`
    extend type VideoContent @key(fields: "contentId") {
        contentId: ID! @external
    }

    extend type User @key(fields: "userId") {
        userId: ID! @external
    }

    type Episode {
        episodeId: ID!
        seriesId: ID!
        title: String
        content: VideoContent
        userId: ID!
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

// Business logic
const validateContentAccess = (principalId, episode, content) => {   
    if (episode.free) {
        return content;
    }

    if (!episode.free && principalId) { 
        return content;
    }

    return null;
}

const resolvers = {   
    Episode: {
        author(episode) {
            return { __typename: "User", userId: episode.userId };
        },

        // Note: We are making a conditional connection based on business logic,
        //      This approach makes it hard to mask only specific properties from the
        //      content service. Might be best to handle with RPC and having the series
        //      own the type
        content(episode, _args, context) {
            const principalId = context.event.headers.Authorisation || null;

            return validateContentAccess(
                principalId,
                episode,
                { __typename: "VideoContent", contentId: episode.contentId }
            );
        }
    },
    
    Series: {
        episodes: ({ seriesId }) => episodesBySeriesId[seriesId]
    },

    Query: {
        allSeries: () => series
    }
}

const server = new ApolloServer({
    schema: buildFederatedSchema([{ typeDefs, resolvers }]),
    context: context => context
});

exports.handler = server.createHandler();