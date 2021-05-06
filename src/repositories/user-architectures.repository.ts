import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {UserArchitectures, UserArchitecturesRelations} from '../models';

export class UserArchitecturesRepository extends DefaultCrudRepository<
  UserArchitectures,
  typeof UserArchitectures.prototype.id,
  UserArchitecturesRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(UserArchitectures, dataSource);
  }
}
