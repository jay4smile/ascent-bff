import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {MappingGoals, MappingGoalsRelations} from '../models';

export class MappingGoalsRepository extends DefaultCrudRepository<
  MappingGoals,
  typeof MappingGoals.prototype.id,
  MappingGoalsRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(MappingGoals, dataSource);
  }
}
