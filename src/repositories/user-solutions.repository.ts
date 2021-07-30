import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {UserSolutions, UserSolutionsRelations} from '../models';

export class UserSolutionsRepository extends DefaultCrudRepository<
  UserSolutions,
  typeof UserSolutions.prototype.id,
  UserSolutionsRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(UserSolutions, dataSource);
  }
}
