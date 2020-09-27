const { ApolloServer } = require('apollo-server-lambda');
const { ApolloGateway } = require('@apollo/gateway');
const AWSXRay = require('aws-xray-sdk');
AWSXRay.captureHTTPsGlobal(require('https'));

const https = require('https');
const httpsAgent = new https.Agent({ keepAlive: true });

const axios = require('axios');

const gateway = new ApolloGateway({
    serviceList: [
      { name: 'series', url: 'https://yi3yqefld5.execute-api.us-east-1.amazonaws.com/dev/graphql' },
      { name: 'content', url: 'https://lxjy04ydvi.execute-api.us-east-1.amazonaws.com/dev/graphql' },
    ],
    fetcher: axios.create({ httpsAgent })
});

const server = new ApolloServer({
    gateway,
    // Disable subscriptions (not currently supported with ApolloGateway)
    subscriptions: false,
});

exports.handler = server.createHandler();