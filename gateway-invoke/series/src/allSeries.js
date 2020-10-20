const series = [
    { 
        seriesId: 'aws-this-week',
        title: 'AWS This Week'
    },
    { 
        seriesId: 'azure-this-week',
        title: 'Azure This Week'
    }
]

const handler = async (event, context) => {
    console.log(JSON.stringify({ event }, null, 2));

    return series;
};

module.exports = { handler }