import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {ControlDetails, ControlDetailsRelations} from '../models';

export class ControlDetailsRepository extends DefaultCrudRepository<
  ControlDetails,
  typeof ControlDetails.prototype.id,
  ControlDetailsRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(ControlDetails, dataSource);
  }
}
