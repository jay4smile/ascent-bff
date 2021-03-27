const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;

mongodbServices = JSON.parse(process.env.DATABASE_TEST)

console.log("Database Connection"+mongodbServices);

const mongodbConn = mongodbServices.connection.mongodb;
const mongodbComposed = mongodbConn.composed[0];
const ca = [Buffer.from(mongodbConn.certificate.certificate_base64, 'base64')];

const testdb = "ibmcloudtestdb";
const maindb = "ibmclouddb";

MongoClient.connect(mongodbComposed, { ssl: true, sslCA: ca }, (err, client) => {

    if (err) throw err;

    console.log(client.topology.clientInfo);

    let db = client.db(testdb);
    db.collection('ControlMapping').createIndex( { control_id: 1, service_id: 1, arch_id: 1 }, { unique: true } );
    db = client.db(maindb);
    db.collection('ControlMapping').createIndex( { control_id: 1, service_id: 1, arch_id: 1 }, { unique: true } );
    db = client.db(maindb);
    db.collection('Bom').createIndex( { arch_id: 1, service_id: 1 }, { unique: true } );
    db = client.db(maindb);
    db.collection('Bom').createIndex( { arch_id: 1, service_id: 1 }, { unique: true } );

    client.close();
});
