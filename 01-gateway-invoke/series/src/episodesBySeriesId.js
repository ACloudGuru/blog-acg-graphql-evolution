const AWS = require('aws-sdk');

const lambda = new AWS.Lambda();

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

const getContentById = (contentId) => {
    return lambda
        .invoke({ 
            FunctionName: 'content-dev-contentByContentId',
            Payload: JSON.stringify({ args: { contentId } }),
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

const handler = async (event) => {
    console.log(JSON.stringify({ event }, null, 2));
    
    const principalId = event.context && event.context.principalId;
    
    const episodes = episodesBySeriesId[event.args && event.args.seriesId];

    const content = await Promise.all(
        episodes
            .map(episode => episode.contentId)
            .map(getContentById)
    );

    console.log(JSON.stringify({ content }, null, 2));

    const contentByContentId = content.reduce((acc, content) => {
        acc[content.contentId] = content;
        return acc;
    }, {});

    console.log(JSON.stringify({ contentByContentId }, null, 2));

    const episodesWithContent = episodes.map(episode => ({
        ...episode,
        content: validateContentAccess(
            principalId,
            episode,
            contentByContentId[episode.contentId]
        )
    }));

    console.log(JSON.stringify({ episodesWithContent }, null, 2));

    return episodesWithContent;
};

module.exports = { handler };