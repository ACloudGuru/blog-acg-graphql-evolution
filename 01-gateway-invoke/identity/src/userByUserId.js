const users = {
    'auth0|123': {
        userId: 'auth0|123',
        name: 'Sam K',
    },
    'auth0|456': {
        userId: 'auth0|456',
        name: 'Ryan K',
    },
};

const handler = async (event, context) => {
    console.log(JSON.stringify({ event }, null, 2));

    return users[event.args && event.args.userId];
};

module.exports = { handler };