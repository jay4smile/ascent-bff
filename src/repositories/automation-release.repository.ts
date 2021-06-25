import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {AutomationRelease, AutomationReleaseRelations} from '../models';

export class AutomationReleaseRepository extends DefaultCrudRepository<
  AutomationRelease,
  typeof AutomationRelease.prototype.id,
  AutomationReleaseRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(AutomationRelease, dataSource);
  }
}
