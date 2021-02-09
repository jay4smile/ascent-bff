import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Controls, ControlsRelations} from '../models';

export class ControlsRepository extends DefaultCrudRepository<
  Controls,
  typeof Controls.prototype.control_id,
  ControlsRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(Controls, dataSource);
  }
}
