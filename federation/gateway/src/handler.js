const { ApolloServer } = require('apollo-server-lambda');
const { ApolloGateway } = require('@apollo/gateway');

const AWSXRay = require('aws-xray-sdk-core');

// TODO: HTTP or APIGateway

const gateway = new ApolloGateway({
    serviceList: [
      { name: 'series', url: 'http://localhost:3001/dev/graphql' },
      { name: 'content', url: 'http://localhost:3003/dev/graphql' },
    ],
  });
  

const server = new ApolloServer({
    gateway,
    // Disable subscriptions (not currently supported with ApolloGateway)
    subscriptions: false,
});

exports.handler = server.createHandler();