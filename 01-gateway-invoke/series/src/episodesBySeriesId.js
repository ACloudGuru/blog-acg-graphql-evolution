const AWSXRay = require('aws-xray-sdk-core');

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

const getContentByIds = (contentIds) => {
    const AWS = process.env._X_AMZN_TRACE_ID
        ? AWSXRay.captureAWS(require('aws-sdk'))
        : require('aws-sdk');

    const lambda = new AWS.Lambda();

    return lambda
        .invoke({ 
            FunctionName: 'content-dev-contentByContentId',
            Payload: JSON.stringify({ args: { contentIds } }),
        })
        .promise()
        .then(lambdaResponse => JSON.parse(lambdaResponse.Payload));
}

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

const getValidatedEpisodesBySeriesIds = async ({ seriesIds, principalId }) => {
    const seriesEpisodes = seriesIds
        .map(seriesId => episodesBySeriesId[seriesId]);

    const content = await getContentByIds(
        seriesEpisodes
            .flat()
            .map(episode => episode.contentId)
    );

    const contentByContentId = content.reduce((acc, content) => {
        acc[content.contentId] = content;
        return acc;
    }, {});

    // Restrict access if series episode is not free
    const episodesWithContent = seriesEpisodes.map(se => se.map(episode => ({
        ...episode,
        content: validateContentAccess(
            principalId,
            episode,
            contentByContentId[episode.contentId]
        )
    })));

    return episodesWithContent;
};

const handler = async (event) => {
    console.log(JSON.stringify({ event }, null, 2));
        
    const principalId = event.context && event.context.principalId;
    
    const seriesIds = event.args && event.args.seriesIds || [];

    console.log(JSON.stringify({ seriesIds }, null, 2));

    const seriesEpisodes = await getValidatedEpisodesBySeriesIds({ 
        seriesIds,
        principalId
    });

    console.log(JSON.stringify({ seriesEpisodes }, null, 2));

    return seriesEpisodes;
};

module.exports = { handler };