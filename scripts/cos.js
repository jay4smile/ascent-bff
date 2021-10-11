#!/usr/bin/env node

const args = require('args');
const Storage = require('ibm-cos-sdk');

const copyObjects = async (name, sub, options) => {
    const cosConf = process.env.STORAGE ? JSON.parse(process.env.STORAGE) : {
        endpoints: options.endpoints,
        apikey: options.apikey,
        resource_instance_id: options.instanceId
    };
    const config = {
        endpoint: cosConf.endpoints,
        apiKeyId: cosConf.apikey,
        serviceInstanceId: cosConf.resource_instance_id,
        signatureVersion: 'iam',
    };
    const cos = new Storage.S3(config);
    const objects = (await cos.listObjects({ Bucket: options.sourceBucket }).promise()).Contents;
    for (let index = 0; index < objects.length; index++) {
        const object = objects[index];
        if (object.Key) {
            console.log(object.Key);
            const body = (await cos.getObject({
                Bucket: options.sourceBucket,
                Key: object.Key
            }).promise()).Body;
            cos.putObject({
                Bucket: options.destBucket,
                Key: `${options.prefix}${object.Key}`,
                Body: body
            }, (putObjErr) => {
                if (putObjErr) {
                    console.log("error", putObjErr)
                }
            });
        }
    }
};

args
    .option('source-bucket', 'Source COS Bucket')
    .option('dest-bucket', 'Destination COS Bucket')
    .option('prefix', 'Prefix to add to destination objects', '')
    .option('endpoints', 'COS endpoints')
    .option('apikey', 'COS apikey')
    .option('instance-id', 'COS instance id')
    .command('copy', 'Copy objects from bucket to bucket', copyObjects)
    .example('./cos.js copy --source-bucket bucket1 --dest-bucket bucket2 -p obj_', 'Copy all objects from bucket1 to bucket2, prepending obj_ to destination objects.');

const flags = args.parse(process.argv);