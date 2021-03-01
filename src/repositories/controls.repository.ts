import { Getter, inject } from '@loopback/core';
import { HasOneRepositoryFactory, HasManyThroughRepositoryFactory, DefaultCrudRepository, repository } from '@loopback/repository';
import { MongodbDataSource } from '../datasources';
import { Nist, Controls, Services, ControlMapping } from '../models';
import { NistRepository, ServicesRepository, ControlMappingRepository } from '../repositories';

export class ControlsRepository extends DefaultCrudRepository<
  Controls,
  typeof Controls.prototype.control_id
  > {

  public readonly nist: HasOneRepositoryFactory<Nist, typeof Nist.prototype.number>;

  public readonly services: HasManyThroughRepositoryFactory<
    Services,
    typeof Services.prototype.service_id,
    ControlMapping,
    typeof Controls.prototype.control_id
  >;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
    @repository.getter('NistRepository')
    protected nistRepositoryGetter: Getter<NistRepository>,
    @repository.getter('ServicesRepository')
    protected servicesRepositoryGetter: Getter<ServicesRepository>,
    @repository.getter('ControlMappingRepository')
    protected controlMappingRepositoryGetter: Getter<ControlMappingRepository>
  ) {
    super(Controls, dataSource);

    this.nist = this.createHasOneRepositoryFactoryFor(
      'nist',
      nistRepositoryGetter,
    );
    this.registerInclusionResolver('nist', this.nist.inclusionResolver);

    this.services = this.createHasManyThroughRepositoryFactoryFor(
      'services',
      servicesRepositoryGetter,
      controlMappingRepositoryGetter
    );
    this.registerInclusionResolver('services', this.services.inclusionResolver);
  }
}
