'use strict';

const AWS = require('aws-sdk'); 
const uuid = require('uuid');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.get = async (event) => {

  var params = {
    TableName: process.env.DYNAMODB_TABLE,
    Select: "ALL_ATTRIBUTES"
  };

const {Items} = await dynamoDb.scan(params).promise()

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        todos : Items
      },
      null,
      2
    ),
  };

};

module.exports.post = async (event) => {

  const requestBody = JSON.parse(event.body);

  const timestamp = new Date().getTime();

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      Id: uuid.v1(),
      text: requestBody.text,
      checked: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };

  const result = await dynamoDb.put(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'New Todo Added',
      },
      null,
      2
    ),
  };

};

module.exports.delete = async (event) => {

  const requestBody = JSON.parse(event.body);

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      Id: requestBody.Id,
    },
  };

  await dynamoDb.delete(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Delete Sucessfull',
      },
      null,
      2
    ),
  };

};

module.exports.update = async (event) => {

  const requestBody = JSON.parse(event.body);
  const timestamp = new Date().getTime();

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      Id: requestBody.Id,
    },
    ExpressionAttributeNames: {
      '#todo_text': 'text',
    },
    ExpressionAttributeValues: {
      ':text': requestBody.text,
      ':checked': requestBody.checked,
      ':updatedAt': timestamp,
    },
    UpdateExpression: 'SET #todo_text = :text, checked = :checked, updatedAt = :updatedAt',
    ReturnValues: 'ALL_NEW',
  };

  await dynamoDb.update(params).promise()

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: `Updated ${requestBody.Id} Successfully`,
      },
      null,
      2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};