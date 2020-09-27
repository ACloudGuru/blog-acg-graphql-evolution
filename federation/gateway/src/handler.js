const { ApolloServer } = require('apollo-server-lambda');
const { ApolloGateway } = require('@apollo/gateway');
const AWSXRay = require('aws-xray-sdk');
AWSXRay.captureHTTPsGlobal(require('https'));

const https = require('https');
const httpsAgent = new https.Agent({ keepAlive: true });

const axios = require('axios');

const URLList = {
  offline: [
    { name: 'series', url: 'http://localhost:3001/dev/graphql' },
    { name: 'content', url: 'http://localhost:3003/dev/graphql' },
  ],
  online: [
    { name: 'series', url: 'https://yi3yqefld5.execute-api.us-east-1.amazonaws.com/dev/graphql' },
    { name: 'content', url: 'https://lxjy04ydvi.execute-api.us-east-1.amazonaws.com/dev/graphql' },
  ],
}

const serviceList = process.env.IS_OFFLINE
  ? URLList.offline
  : URLList.online;

const gateway = new ApolloGateway({
    serviceList,
    fetcher: axios.create({ httpsAgent })
});

const server = new ApolloServer({
    gateway,
    // Disable subscriptions (not currently supported with ApolloGateway)
    subscriptions: false,
});

exports.handler = server.createHandler();