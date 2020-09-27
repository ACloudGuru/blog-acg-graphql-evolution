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

const handler = async (event, context) => {
    console.log(JSON.stringify({ event }, null, 2));

    return episodes[event.seriesId];
};

module.exports = { handler };