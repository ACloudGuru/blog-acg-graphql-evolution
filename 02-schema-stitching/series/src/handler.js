// Dependencies included for all functions
require('aws-sdk');
require('bluebird');
require('lodash');

const { graphql } = require('graphql');
const { makeExecutableSchema } = require('graphql-tools');
const { gql } = require('graphql-request');
const DataLoader = require('dataloader');
const AWSXRay = require('aws-xray-sdk');
AWSXRay.captureHTTPsGlobal(require('https'));
const https = require('https');
const httpsAgent = new https.Agent({ keepAlive: true });

const axios = require('axios');

const series = [
    { 
        seriesId: 'aws-this-week',
        title: 'AWS This Week'
    },
    { 
        seriesId: 'acg-projects',
        title: 'ACG Projects'
    }
]

const episodesBySeriesId = {
    'aws-this-week': [
        { 
            seriesId: 'aws-this-week',
            episodeId: 'episode-1',
            title: 'AWS This Week Episode #1',
            contentId: 'video-1',
            authorId: 'auth0|123',
            free: true,
        },
        { 
            seriesId: 'aws-this-week',
            episodeId: 'episode-2',
            title: 'AWS This Week Episode #2',
            contentId: 'video-2',
            authorId: 'auth0|123',
            free: true,
        },
    ],
    'acg-projects': [
        { 
            seriesId: 'acg-projects',
            episodeId: 'episode-1',
            title: 'Learn how to deploy lambda #1',
            contentId: 'video-3',
            authorId: 'auth0|456',
            free: false,
        },
        { 
            seriesId: 'acg-projects',
            episodeId: 'episode-2',
            title: 'Learn how to deploy serverless applications in S3 #2',
            contentId: 'video-4',
            authorId: 'auth0|456',
            free: false,
        },
    ]
};

const typeDefs = gql`
    type EpisodeVideoContent {
        contentId: ID!
        duration: Int
        url: String
    }

    type Episode {
        episodeId: ID!
        seriesId: ID!
        title: String
        content: EpisodeVideoContent
        authorId: String
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
        // Apply business logic
        content(episode, args, { principalId, dataloaders: { contentByIdsLoader }}) {
            return contentByIdsLoader.load(episode.contentId)
                .then(content => validateContentAccess(principalId, episode, content))
        }
    },
    
    Series: {
        episodes: ({ seriesId }) => episodesBySeriesId[seriesId]
    },

    Query: {
        allSeries: () => series
    }
}

const makeDataloaders = () => ({
    contentByIdsLoader: new DataLoader(async (contentIds) => {
        const axiosClient = axios.create({ httpsAgent });

        const query = gql`
            query ($contentIds: [String]) {
                contentByIds(contentIds: $contentIds) {
                    contentId
                    duration
                    url
                }
            }
        `;

        const fetchResult = await axiosClient({
          url: process.env.CONTENT_URL,
          method: 'POST',
          headers: Object.assign(
              { 'Content-Type': 'application/json' }
          ),
          data: JSON.stringify({ query, variables: { contentIds } })
        });
      
        return fetchResult.data.data.contentByIds;
    }),
});

const handler = async (event) => {
    const payload = JSON.parse(event.body);
    const principalId = event.headers.Authorization || null;
        
    const schema = makeExecutableSchema({
        typeDefs,
        resolvers
    });

    const dataloaders = makeDataloaders();

    const response = await graphql(
        schema,
        payload.query,
        null,
        { dataloaders, principalId }
    );

    return {
        statusCode: 200,
        body: JSON.stringify(response, null, 2)
    };
}

module.exports = { handler }