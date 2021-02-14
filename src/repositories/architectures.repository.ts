import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Architectures, ArchitecturesRelations} from '../models';

export class ArchitecturesRepository extends DefaultCrudRepository<
  Architectures,
  typeof Architectures.prototype._id,
  ArchitecturesRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(Architectures, dataSource);
  }
}
