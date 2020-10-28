const { ApolloServer } = require('apollo-server-lambda');
const { ApolloGateway, RemoteGraphQLDataSource } = require('@apollo/gateway');
const AWSXRay = require('aws-xray-sdk');
AWSXRay.captureHTTPsGlobal(require('https'));

const https = require('https');
const httpsAgent = new https.Agent({ keepAlive: true });

const axios = require('axios');

class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  willSendRequest({ request, context }) {
    request.http.headers.set('Authorization', context.principalId);
  }
}


const gateway = new ApolloGateway({
    serviceList: [
        { name: 'series', url: process.env.SERIES_URL },
        { name: 'content', url: process.env.CONTENT_URL },
        { name: 'identity', url: process.env.IDENTITY_URL },  
    ],
    fetcher: axios.create({ httpsAgent }),
    buildService({ url }) {
      return new AuthenticatedDataSource({ url });
    },  
});

const server = new ApolloServer({
    gateway,

    context: (context) => {
      const principalId = context.event.headers.Authorization || null;

      return { principalId };
    },

    // Disable subscriptions (not currently supported with ApolloGateway)
    subscriptions: false,
});

exports.handler = server.createHandler();