'use strict';

const uuid = require('uuid');
const aws = require('aws-sdk');
const dynamodb = require('./dynamodb');

const s3 = new aws.S3({ apiVersion: '2006-03-01' });

module.exports.importDBZJsonToDynamodDB = (event, context, callback) => {
  console.log(event);
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));
  const params = {
    Bucket: bucket,
    Key: key,
  };

  s3.getObject(params, (err, data) => {
    var charactersArray = JSON.parse(data.Body.toString())['characters'];
    charactersArray.forEach(element => {
      const timestamp = new Date().getTime();
      const paramsDb = {
        TableName: process.env.DYNAMODB_TABLE,
        Item: {
          name: element.id,
          id: uuid.v1(),
          race: element.race,
          gender: element.gender,
          bio: element.bio,
          health: element.health,
          attack: element.attack,
          defense: element.defense,
          kiRestoreSpeed: element.kiRestoreSpeed
        },
      };
      dynamodb.put(paramsDb, (error) => {
        if (error) {
          console.log(error);
        }
      });
    });
    callback(null, data.ContentType);
  });
};
