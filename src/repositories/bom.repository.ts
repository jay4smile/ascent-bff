import { Getter, inject } from '@loopback/core';
import {
  HasOneRepositoryFactory,
  DefaultCrudRepository,
  repository,
} from '@loopback/repository';
import { MongodbDataSource } from '../datasources';
import { Bom, Services } from '../models';
import { ServicesRepository } from '../repositories';

export class BomRepository extends DefaultCrudRepository<
  Bom,
  typeof Bom.prototype._id
> {
  public readonly service: HasOneRepositoryFactory<Services, typeof Services.prototype.service_id>;
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
    @repository.getter('ServicesRepository')
    servicesRepositoryGetter: Getter<ServicesRepository>,
  ) {
    super(Bom, dataSource);
    this.service = this.createHasOneRepositoryFactoryFor(
      'service',
      servicesRepositoryGetter,
    );
    this.registerInclusionResolver('service', this.service.inclusionResolver);
  }
}
