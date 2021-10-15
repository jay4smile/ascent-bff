#!/usr/bin/env node

const { MongoClient } = require('mongodb');
const loader = new (require('@cloudnativetoolkit/iascable').CatalogLoader)();


mongodbServices = JSON.parse(process.env.DATABASE_PROD);

const mongodbConn = mongodbServices.connection.mongodb;
const mongodbComposed = mongodbConn.composed[0];
const ca = [Buffer.from(mongodbConn.certificate.certificate_base64, 'base64')];

MongoClient.connect(mongodbComposed, { ssl: true, sslCA: ca }, (err, client) => {

    if (err) throw err;

    const db = client.db("ibmclouddb");
    db.collection('Services').find({}).toArray(function(err, items) {
        loader.loadCatalog('https://modules.cloudnativetoolkit.dev/index.yaml')
            .then(catalog => {
                const newServices = [];
                catalog.modules.forEach(module => {
                    if (!items.find(service => service.cloud_automation_id === module.name)) {
                        newServices.push({
                            "_id" : module.name,
                            "grouping" : "Compute",
                            "ibm_catalog_service" : module.name,
                            "desc" : module.description,
                            "deployment_method" : "terraform",
                            "provision" : "Terraform",
                            "cloud_automation_id" : module.name,
                            "fs_validated" : false
                        });
                    }
                });
                if (newServices.length) {
                    db.collection('Services').insertMany(newServices, (result) => {
                        console.log(result);
                        client.close();
                    });
                }
            })
            .catch(err => console.log);
      });
});
