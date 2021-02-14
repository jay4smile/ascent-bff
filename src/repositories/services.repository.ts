import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Services, ServicesRelations} from '../models';

export class ServicesRepository extends DefaultCrudRepository<
  Services,
  typeof Services.prototype.service_id,
  ServicesRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(Services, dataSource);
  }
}
