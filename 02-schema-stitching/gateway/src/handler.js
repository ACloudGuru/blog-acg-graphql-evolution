const { print, graphql } = require('graphql');
const { wrapSchema, introspectSchema  } = require('@graphql-tools/wrap');
const { stitchSchemas } = require('@graphql-tools/stitch');
const { batchDelegateToSchema } = require('@graphql-tools/batch-delegate');
const _ = require('lodash');
const AWSXRay = require('aws-xray-sdk');
AWSXRay.captureHTTPsGlobal(require('https'));

const https = require('https');
const httpsAgent = new https.Agent({ keepAlive: true });

const axios = require('axios');

const executorWithUrl = (url, headers) => async ({ document, variables }) => {
  const query = print(document);
  
  const axiosClient = axios.create({ httpsAgent });

  const fetchResult = await axiosClient({
    url,
    method: 'POST',
    headers: Object.assign(
        { 'Content-Type': 'application/json' },
        headers
    ),
    data: JSON.stringify({ query, variables })
  });

  return fetchResult.data;
};

// Cache per container
const introspectUrl = _.memoize(url =>
    introspectSchema(executorWithUrl(url))
);

const getSchema = async (url, headers) => {
    const schema = wrapSchema({
        schema: await introspectUrl(url),
        executor: executorWithUrl(url, headers)
    });
    return schema;
}

const handler = async (event) => {
    const payload = JSON.parse(event.body);
    const principalId = event.headers.Authorization || null;

    const headers = {
        Authorization: principalId,
    }

    const [ 
        seriesSchema,
        contentSchema,
        identitySchema,
    ] = await Promise.all([
        getSchema(process.env.SERIES_URL, headers),
        getSchema(process.env.CONTENT_URL, headers),            
        getSchema(process.env.IDENTITY_URL, headers),
    ]);

    const mergedSchemas = stitchSchemas({
        subschemas: [
            seriesSchema,
            contentSchema,
            identitySchema    
        ],
        typeDefs: `
            extend type Episode {
                author: User
            }
        `,
        resolvers: {
            Episode: {
                author: {
                  selectionSet: `{ authorId }`,
                  resolve(episode, _args, context, info) {
                    return batchDelegateToSchema({
                      schema: identitySchema,
                      operation: 'query',
                      fieldName: 'usersByIds',
                      key: episode.authorId,
                      argsFromKeys: (ids) => ({ userIds: ids }),
                      context,
                      info,
                    });
                  },
                },
            }
        }
    });

    const response = await graphql(
        mergedSchemas,
        payload.query
    );

    return {
        statusCode: 200,
        body: JSON.stringify(response, null, 2)
    };
};

module.exports = { handler }