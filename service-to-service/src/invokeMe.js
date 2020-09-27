const AWSXRay = require('aws-xray-sdk-core');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));

const dynamodb = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();


const handler = async (event, context) => {
    const ddbWriteResponse = await dynamodb.put({
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Item: {
            user_id: 'user_id_test',
            value: '123',
        }
    })
    .promise();

    console.log('Write Response from DDB: ', JSON.stringify({ ddbWriteResponse }, null, 2));

    const ddbReadResponse = await dynamodb.get({
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: { 
            user_id: 'user_id_test'
        },
    })
    .promise();

    console.log('Read Response from DDB: ', JSON.stringify({ ddbReadResponse }, null, 2));

    const snsPushlishResponse = await sns.publish({
        Message : 'test',
        TopicArn : `arn:aws:sns:us-east-1:${process.env.AWS_ACCOUNT_ID}:${process.env.SNS_TOPIC_NAME}`,
    })
    .promise();

    console.log('SNS Publish Response: ', JSON.stringify({ snsPushlishResponse }, null, 2));

    return {
        statusCode: 200,
        body: JSON.stringify({ event }, null, 2),
    };
};

module.exports = { handler }