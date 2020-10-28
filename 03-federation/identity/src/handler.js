const { ApolloServer, gql } = require('apollo-server-lambda');
const { buildFederatedSchema } = require('@apollo/federation');

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

const typeDefs = gql`
    type User @key(fields: "userId") {
        userId: ID!
        name: String
    }

    type Query {
        userById(userId: String): User
        usersByIds(userIds: [String]): [User]
    }
`;

const resolvers = {   
    User: {
        __resolveReference(reference) {
            return identities[reference.userId];
        },
    },

    Query: {
        userById: (_, { userId }) => {
            return identities[userId];
        },
        usersByIds: (_, { userIds }) => {
            return userIds
                .map(userId => identities[userId]);
        }                
    }
}

const server = new ApolloServer({
    schema: buildFederatedSchema([{ typeDefs, resolvers }])
});

exports.handler = server.createHandler();