import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

import assert from 'assert';
import * as _ from 'lodash';
import {Services} from '../appenv';

const services = Services.getInstance();

// The services object is a map named by service so we extract the one for MongoDB
const mongodbServices:any = services.getService('database');

// This check ensures there is a services for MongoDB databases
assert(!_.isUndefined(mongodbServices), 'backend must be bound to mongodb service');

// We now take the first bound MongoDB service and extract it's credentials object
const mongodbConn = mongodbServices.connection.mongodb;
const mongodbComposed = mongodbServices.connection.mongodb.composed[0];

// Read the CA certificate and assign that to the CA variable
const ca = [Buffer.from(mongodbConn.certificate.certificate_base64, 'base64')];

// Extract the database username and password
const authentication = mongodbConn.authentication;
const username: string = authentication.username;
const password: string = authentication.password;

// Extract the MongoDB URIs
const connectionPath = mongodbConn.hosts;

// tslint:disable-next-line:max-line-length
//const connectionString = `mongodb://${username}:${password}@${connectionPath[0].hostname}:${connectionPath[0].port},${connectionPath[1].hostname}:${connectionPath[1].port}/?replicaSet=replset`;

const config = {
  name: 'mongodb',
  debug: true,
  connector: 'mongodb',
  url: mongodbComposed,
  user: username,
  password : password,
  host: connectionPath[0].hostname,
  database: 'ibmclouddb',
  authSource: 'admin',
  useNewUrlParser: true,
  ssl: true,
  sslValidate: true,
  checkServerIdentity: false,
  sslCA: ca,
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class MongodbDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'mongodb';
  static readonly defaultConfig = config;

  constructor(
    @inject('mongodb', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
