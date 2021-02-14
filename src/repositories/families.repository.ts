import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Families, FamiliesRelations} from '../models';

export class FamiliesRepository extends DefaultCrudRepository<
  Families,
  typeof Families.prototype.family,
  FamiliesRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(Families, dataSource);
  }
}
