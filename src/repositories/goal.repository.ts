import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Goal} from '../models';

export class GoalRepository extends DefaultCrudRepository<
  Goal,
  typeof Goal.prototype.goal_id
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(Goal, dataSource);
  }
}
