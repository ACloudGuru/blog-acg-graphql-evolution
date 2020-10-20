const identities = {
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

    const userIds = event.args && event.args.userIds || [];

    console.log(JSON.stringify({ userIds }, null, 2));

    const users = userIds
        .map(userId => identities[userId])

    console.log(JSON.stringify({ users }, null, 2));

    return users
};

module.exports = { handler };