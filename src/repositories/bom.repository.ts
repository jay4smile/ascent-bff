import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Bom, BomRelations} from '../models';

export class BomRepository extends DefaultCrudRepository<
  Bom,
  typeof Bom.prototype._id,
  BomRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(Bom, dataSource);
  }
}
