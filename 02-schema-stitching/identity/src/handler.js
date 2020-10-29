// Dependencies included for all functions
require('aws-sdk');
require('bluebird');
require('lodash');

const { ApolloServer, gql } = require('apollo-server-lambda');

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
    type User {
        userId: ID!
        name: String
    }

    type Query {
        userById(userId: String): User
        usersByIds(userIds: [String]): [User]
    }
`;

const resolvers = {   
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
    typeDefs,
    resolvers
});

exports.handler = server.createHandler();