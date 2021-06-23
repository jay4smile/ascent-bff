import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {SolutionArchitectures, SolutionArchitecturesRelations} from '../models';

export class SolutionArchitecturesRepository extends DefaultCrudRepository<
  SolutionArchitectures,
  typeof SolutionArchitectures.prototype.id,
  SolutionArchitecturesRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(SolutionArchitectures, dataSource);
  }
}
