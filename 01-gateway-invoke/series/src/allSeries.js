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

const handler = async (event, context) => {
    console.log(JSON.stringify({ event }, null, 2));

    return series;
};

module.exports = { handler }