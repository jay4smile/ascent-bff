import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Nist, NistRelations} from '../models';

export class NistRepository extends DefaultCrudRepository<
  Nist,
  typeof Nist.prototype.number,
  NistRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(Nist, dataSource);
  }
}
