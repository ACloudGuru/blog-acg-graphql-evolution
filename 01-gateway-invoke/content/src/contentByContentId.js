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

const handler = async (event) => {
    console.log(JSON.stringify({ event }, null, 2));

    const contentIds = event.args && event.args.contentIds || [];

    console.log(JSON.stringify({ contentIds }, null, 2));

    const content = contentIds
        .map(contentId => videos[contentId])

    console.log(JSON.stringify({ content }, null, 2));

    return content;
};

module.exports = { handler };