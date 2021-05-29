import { Getter, inject } from '@loopback/core';
import { HasOneRepositoryFactory, HasManyThroughRepositoryFactory, DefaultCrudRepository, repository } from '@loopback/repository';
import { MongodbDataSource } from '../datasources';
import { Nist, Controls, Services, ControlMapping, Architectures, ControlDetails } from '../models';
import { NistRepository, ServicesRepository, ControlMappingRepository, ArchitecturesRepository, ControlDetailsRepository } from '../repositories';

export class ControlsRepository extends DefaultCrudRepository<
  Controls,
  typeof Controls.prototype.id
> {

  public readonly nist: HasOneRepositoryFactory<Nist, typeof Nist.prototype.number>;
  public readonly controlDetails: HasOneRepositoryFactory<ControlDetails, typeof ControlDetails.prototype.id>;

  public readonly services: HasManyThroughRepositoryFactory<
    Services,
    typeof Services.prototype.service_id,
    ControlMapping,
    typeof Controls.prototype.id
  >;

  public readonly architectures: HasManyThroughRepositoryFactory<
    Architectures,
    typeof Architectures.prototype.arch_id,
    ControlMapping,
    typeof Controls.prototype.id
  >;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
    @repository.getter('NistRepository')
    protected nistRepositoryGetter: Getter<NistRepository>,
    @repository.getter('ControlDetailsRepository')
    protected controlDetailsRepositoryGetter: Getter<ControlDetailsRepository>,
    @repository.getter('ServicesRepository')
    protected servicesRepositoryGetter: Getter<ServicesRepository>,
    @repository.getter('ArchitecturesRepository')
    protected architecturesRepositoryGetter: Getter<ArchitecturesRepository>,
    @repository.getter('ControlMappingRepository')
    protected controlMappingRepositoryGetter: Getter<ControlMappingRepository>
  ) {
    super(Controls, dataSource);

    this.nist = this.createHasOneRepositoryFactoryFor(
      'nist',
      nistRepositoryGetter,
    );
    this.registerInclusionResolver('nist', this.nist.inclusionResolver);

    this.controlDetails = this.createHasOneRepositoryFactoryFor(
      'controlDetails',
      controlDetailsRepositoryGetter,
    );
    this.registerInclusionResolver('controlDetails', this.controlDetails.inclusionResolver);

    this.services = this.createHasManyThroughRepositoryFactoryFor(
      'services',
      servicesRepositoryGetter,
      controlMappingRepositoryGetter
    );
    this.registerInclusionResolver('services', this.services.inclusionResolver);

    this.architectures = this.createHasManyThroughRepositoryFactoryFor(
      'architectures',
      architecturesRepositoryGetter,
      controlMappingRepositoryGetter
    );
    this.registerInclusionResolver('architectures', this.architectures.inclusionResolver);
  }
}
