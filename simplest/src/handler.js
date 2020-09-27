const handler = async (event, context) => {
    console.log(JSON.stringify({ event }, null, 2));

    return {
        statusCode: 200,
        body: JSON.stringify({ event }, null, 2)
    };
};

module.exports = { handler }