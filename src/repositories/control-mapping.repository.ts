import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {ControlMapping} from '../models';

export class ControlMappingRepository extends DefaultCrudRepository<
  ControlMapping,
  typeof ControlMapping.prototype.id
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(ControlMapping, dataSource);
  }
}
