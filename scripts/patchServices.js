#!/usr/bin/env node

const { loadFont } = require('jimp');
const {
    MongoClient
} = require('mongodb');

const serviceMapping = [{
    name: "ibm-container-platform",
    ibm_catalog_id: "containers-kubernetes"
}, {
    name: "ocp-cluster",
    ibm_catalog_id: "openshift"
}, {
    name: "ibm-ocp-vpc",
    ibm_catalog_id: "openshift"
}, {
    name: "ibm-iks-vpc",
    ibm_catalog_id: "containers-kubernetes"
}, {
    name: "ocp-login",
    ibm_catalog_id: ""
}, {
    name: "argocd",
    ibm_catalog_id: ""
}, {
    name: "artifactory",
    ibm_catalog_id: ""
}, {
    name: "dashboard",
    ibm_catalog_id: ""
}, {
    name: "jenkins",
    ibm_catalog_id: ""
}, {
    name: "openshift-cicd",
    ibm_catalog_id: ""
}, {
    name: "pactbroker",
    ibm_catalog_id: ""
}, {
    name: "sonarqube",
    ibm_catalog_id: ""
}, {
    name: "swaggereditor",
    ibm_catalog_id: ""
}, {
    name: "tekton",
    ibm_catalog_id: ""
}, {
    name: "tekton-resources",
    ibm_catalog_id: ""
}, {
    name: "turbonomic",
    ibm_catalog_id: ""
}, {
    name: "console-link-job",
    ibm_catalog_id: ""
}, {
    name: "ocp-buildah-unprivileged",
    ibm_catalog_id: ""
}, {
    name: "argocd-bootstrap",
    ibm_catalog_id: ""
}, {
    name: "vsi-argocd-bootstrap",
    ibm_catalog_id: ""
}, {
    name: "gitops-repo",
    ibm_catalog_id: ""
}, {
    name: "gitops-namespace",
    ibm_catalog_id: ""
}, {
    name: "gitops-console-link-job",
    ibm_catalog_id: ""
}, {
    name: "gitops-artifactory",
    ibm_catalog_id: ""
}, {
    name: "gitops-dashboard",
    ibm_catalog_id: ""
}, {
    name: "gitops-pact-broker",
    ibm_catalog_id: ""
}, {
    name: "gitops-sonarqube",
    ibm_catalog_id: ""
}, {
    name: "gitops-image-registry",
    ibm_catalog_id: ""
}, {
    name: "gitops-tekton-resources",
    ibm_catalog_id: ""
}, {
    name: "ibm-onboard-fs-account",
    ibm_catalog_id: ""
}, {
    name: "ibm-resource-group",
    ibm_catalog_id: ""
}, {
    name: "ibm-account-access-group",
    ibm_catalog_id: "iam-groups"
}, {
    name: "ibm-access-group",
    ibm_catalog_id: "iam-groups"
}, {
    name: "ibm-account-users",
    ibm_catalog_id: ""
}, {
    name: "ibm-add-access-group-users",
    ibm_catalog_id: ""
}, {
    name: "ibm-iam-service-authorization",
    ibm_catalog_id: ""
}, {
    name: "ibm-container-registry",
    ibm_catalog_id: "container-registry"
}, {
    name: "ibm-image-registry",
    ibm_catalog_id: ""
}, {
    name: "ocp-image-registry",
    ibm_catalog_id: ""
}, {
    name: "k8s-image-registry",
    ibm_catalog_id: ""
}, {
    name: "namespace",
    ibm_catalog_id: ""
}, {
    name: "olm",
    ibm_catalog_id: ""
}, {
    name: "ibm-cp-catalog",
    ibm_catalog_id: ""
}, {
    name: "ibm-cp-platform-navigator",
    ibm_catalog_id: ""
}, {
    name: "ibm-appid",
    ibm_catalog_id: "appid"
}, {
    name: "ibm-kms",
    ibm_catalog_id: "kms"
}, {
    name: "key-protect",
    ibm_catalog_id: "kms"
}, {
    name: "hpcs",
    ibm_catalog_id: "hs-crypto"
}, {
    name: "hpcs-initialization",
    ibm_catalog_id: ""
}, {
    name: "ibm-kms-key",
    ibm_catalog_id: ""
}, {
    name: "ibm-mongodb",
    ibm_catalog_id: "databases-for-mongodb"
}, {
    name: "ibm-object-storage",
    ibm_catalog_id: "cloud-object-storage"
}, {
    name: "ibm-object-storage-bucket",
    ibm_catalog_id: ""
}, {
    name: "ibm-redis",
    ibm_catalog_id: "databases-for-redis"
}, {
    name: "cp-app-connect",
    ibm_catalog_id: "appconnect"
}, {
    name: "ibm-hbdbaas-postgresql",
    ibm_catalog_id: "hyperp-dbaas-postgresql"
}, {
    name: "ibm-hpdbaas-mongodb",
    ibm_catalog_id: "hyperp-dbaas-mongodb"
}, {
    name: "ibm-event-streams",
    ibm_catalog_id: "messagehub"
}, {
    name: "ibm-event-streams-topic",
    ibm_catalog_id: ""
}, {
    name: "ibm-cert-manager",
    ibm_catalog_id: "cloudcerts"
}, {
    name: "ibm-cert-manager-cert",
    ibm_catalog_id: ""
}, {
    name: "ibm-vpc",
    ibm_catalog_id: "is.vpc"
}, {
    name: "ibm-vpc-gateways",
    ibm_catalog_id: "is.public-gateway"
}, {
    name: "ibm-vpc-subnets",
    ibm_catalog_id: "is.subnet"
}, {
    name: "ibm-vpc-ssh",
    ibm_catalog_id: ""
}, {
    name: "ibm-vpe-gateway",
    ibm_catalog_id: "is.endpoint-gateway"
}, {
    name: "vsi-bastion",
    ibm_catalog_id: ""
}, {
    name: "vsi-vpn",
    ibm_catalog_id: ""
}, {
    name: "ibm-vpc-vsi",
    ibm_catalog_id: "is.instance"
}, {
    name: "ibm-transit-gateway",
    ibm_catalog_id: "transit.gateway"
}, {
    name: "ibm-flow-logs",
    ibm_catalog_id: "is.flow-log-collector"
}, {
    name: "ibm-vpc-vpn-gateway",
    ibm_catalog_id: ""
}, {
    name: "ibm-vpn-server",
    ibm_catalog_id: "vpn-service-broker"
}, {
    name: "source-control",
    ibm_catalog_id: ""
}, {
    name: "ibm-activity-tracker",
    ibm_catalog_id: "logdnaat"
}, {
    name: "logdna",
    ibm_catalog_id: "logdna"
}, {
    name: "ibm-logdna-bind",
    ibm_catalog_id: ""
}, {
    name: "sysdig",
    ibm_catalog_id: "090c2c10-8c38-11e8-bec2-493df9c49eb8"
}, {
    name: "sysdig-bind",
    ibm_catalog_id: ""
}, {
    name: "scc-collector",
    ibm_catalog_id: ""
}, {
    name: "sealed-secret-cert",
    ibm_catalog_id: ""
}, {
    name: "cluster-config",
    ibm_catalog_id: ""
}]

mongodbServices = JSON.parse(process.env.DATABASE_PROD);

const mongodbConn = mongodbServices.connection.mongodb;
const mongodbComposed = mongodbConn.composed[0];
const ca = [Buffer.from(mongodbConn.certificate.certificate_base64, 'base64')];

MongoClient.connect(mongodbComposed, {
    ssl: true,
    sslCA: ca
}, (err, client) => {

    if (err) throw err;

    const db = client.db(process.env.DB_NAME || "ibmclouddb-dev");
    db.collection('Services').find({}).toArray(function (err, services) {
        db.collection('Bom').find({}).toArray(function (err, boms) {
            const newServices = [];
            for (service of services) {
                if (service.cloud_automation_id) {
                    db.collection('Bom').updateMany(
                        // query 
                        {
                            "service_id" : service._id
                        },
                        // update 
                        {
                            $set: {
                                "service_id" : service.cloud_automation_id
                            }
                        },
                        // options 
                        {
                            "multi" : true,  // update only one document 
                            "upsert" : false  // insert a new document, if no existing document match the query 
                        }
                    );
                    db.collection('ControlMapping').updateMany(
                        // query 
                        {
                            "service_id" : service._id
                        },
                        // update 
                        {
                            $set: {
                                "service_id" : service.cloud_automation_id
                            }
                        },
                        // options 
                        {
                            "multi" : true,  // update only one document 
                            "upsert" : false  // insert a new document, if no existing document match the query 
                        }
                    );
                    newServices.push({
                        _id: service.cloud_automation_id,
                        fullname: service.ibm_catalog_service,
                        ibm_catalog_id: serviceMapping.find(m => m.name === service.cloud_automation_id)?.ibm_catalog_id,
                        fs_validated: service.fs_validated
                    });
                }
            }
            var flags = {};
            var newServicesUnique = newServices.filter(function(entry) {
                if (flags[entry._id]) {
                    return false;
                }
                flags[entry._id] = true;
                return true;
            });
            if (newServicesUnique.length) {
                db.collection('Services').deleteMany({})
                .then(() => {
                    db.collection('Services').insertMany(newServicesUnique)
                    .then((inserted) => {
                        console.log(inserted);
                        console.log(inserted?.length);
                        client.close();
                    }).catch((error) => {
                        console.log(error);
                        client.close();
                    })
                })
                .catch((error) => {
                    console.log(error);
                    client.close();
                })
            } else {
                console.log("No services to add, closing client.")
                client.close();
            }
        });
    });
});