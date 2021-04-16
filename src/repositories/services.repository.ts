import { Getter, inject } from '@loopback/core';
import { HasManyThroughRepositoryFactory, DefaultCrudRepository, repository } from '@loopback/repository';
import { MongodbDataSource } from '../datasources';
import { Services, Controls, ControlMapping } from '../models';
import { ControlsRepository, ControlMappingRepository } from '../repositories';

export class ServicesRepository extends DefaultCrudRepository<
  Services,
  typeof Services.prototype.service_id
  > {

  public readonly controls: HasManyThroughRepositoryFactory<
    Controls,
    typeof Controls.prototype.id,
    ControlMapping,
    typeof Services.prototype.service_id
  >;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
    @repository.getter('ControlsRepository')
    protected controlsRepositoryGetter: Getter<ControlsRepository>,
    @repository.getter('ControlMappingRepository')
    protected controlMappingRepositoryGetter: Getter<ControlMappingRepository>
  ) {
    super(Services, dataSource);

    this.controls = this.createHasManyThroughRepositoryFactoryFor(
      'controls',
      controlsRepositoryGetter,
      controlMappingRepositoryGetter
    );
    this.registerInclusionResolver('controls', this.controls.inclusionResolver);
  }
}
