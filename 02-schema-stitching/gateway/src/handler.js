const { fetch } = require('cross-fetch');
const { print, graphql } = require('graphql');
const { wrapSchema, introspectSchema  } = require('@graphql-tools/wrap');
const { stitchSchemas } = require('@graphql-tools/stitch');
const { batchDelegateToSchema } = require('@graphql-tools/batch-delegate');

const executorWithUrl = (url, headers) => async ({ document, variables }) => {
  const query = print(document);
  const fetchResult = await fetch(url, {
    method: 'POST',
    headers: Object.assign(
        { 'Content-Type': 'application/json' },
        headers
    ),
    body: JSON.stringify({ query, variables })
  });
  return fetchResult.json();
};

const getSchema = async (url) => {
    const executor = executorWithUrl(url)

    const schema = wrapSchema({
        schema: await introspectSchema(executor),
        executor,
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
        getSchema('http://localhost:4000/dev/graphql', headers), // Series
        getSchema('http://localhost:5000/dev/graphql', headers), // Content            
        getSchema('http://localhost:6000/dev/graphql', headers), // Identity
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
        body: JSON.stringify({ response }, null, 2)
    };
};

module.exports = { handler }