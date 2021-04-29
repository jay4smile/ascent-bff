const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;

mongodbServices = JSON.parse(process.env.DATABASE)

console.log("Database Connection"+mongodbServices);

const mongodbConn = mongodbServices.connection.mongodb;
const mongodbComposed = mongodbConn.composed[0];
const ca = [Buffer.from(mongodbConn.certificate.certificate_base64, 'base64')];

const dbname = "ibmclouddb-dev";
// const dbname = "ibmclouddb";

MongoClient.connect(mongodbComposed, { ssl: true, sslCA: ca }, (err, client) => {

    if (err) throw err;

    console.log(client.topology.clientInfo);

    let db = client.db(dbname);
    db.collection('Services').updateMany({ "grouping": "middleware" },{ $set: { "grouping": "Middleware" } }, (res) => console.log(res));
    db.collection('Services').updateMany({ "grouping": "dev-tools" },{ $set: { "grouping": "Developer Tools" }}, (res) => console.log(res));
    db.collection('Services').updateMany({ "grouping": "databases" },{ $set: { "grouping": "Databases" }}, (res) => console.log(res));
    db.collection('Services').updateMany({ "grouping": "app-dev" },{ $set: { "grouping": "Developer Tools" }}, (res) => console.log(res));
    db.collection('Services').updateMany({ "grouping": "compute" },{ $set: { "grouping": "Compute" }}, (res) => console.log(res));
    db.collection('Services').updateMany({ "grouping": "IAM" },{ $set: { "grouping": "Security & Identity" }}, (res) => console.log(res));
    db.collection('Services').updateMany({ "grouping": "network" },{ $set: { "grouping": "Network" }}, (res) => console.log(res));
    db.collection('Services').updateMany({ "grouping": "security" },{ $set: { "grouping": "Security & Identity" }}, (res) => console.log(res));
    db.collection('Services').updateMany({ "grouping": "storage" },{ $set: { "grouping": "Storage" }}, (res) => console.log(res));
    db.collection('Services').updateMany({ "grouping": "sre-tools" },{ $set: { "grouping": "SRE Tools" }}, (res) => console.log(res));
    db.collection('Services').updateMany({ "deployment_method": "managed_service" },{ $set: { "deployment_method": "Managed Service" } }, (res) => console.log(res));
    db.collection('Services').updateMany({ "deployment_method": "operator" },{ $set: { "deployment_method": "Operator" } }, (res) => console.log(res));
    db.collection('Services').updateMany({ "deployment_method": "platform" },{ $set: { "deployment_method": "Platform" } }, (res) => console.log(res));
    db.collection('Services').updateMany({ "deployment_method": "platform-script" },{ $set: { "deployment_method": "Platform" } }, (res) => console.log(res));
    db.collection('Services').updateMany({ "provision": "terraform" },{ $set: { "provision": "Terraform" } }, (res) => console.log(res));
    db.collection('Services').updateMany({ "provision": "operator" },{ $set: { "provision": "Operator" } }, (res) => console.log(res));
    db.collection('Services').updateMany({ "provision": "ansible" },{ $set: { "provision": "Ansible" } }, (res) => console.log(res));
    db.collection('Services').updateMany({ "provision": "helm" },{ $set: { "provision": "Helm" } }, (res) => console.log(res));
    // db.collection('Bom').createIndex( { arch_id: 1, service_id: 1 }, { unique: true } );
    // db = client.db(maindb);
    // db.collection('ControlMapping').createIndex( { control_id: 1, service_id: 1, arch_id: 1, control_subsections: 1, scc_profile: 1 }, { unique: true } );
    // db.collection('Bom').createIndex( { arch_id: 1, service_id: 1 }, { unique: true } );
    client.close();
});
