import {Getter, inject} from '@loopback/core';
import {HasOneRepositoryFactory, DefaultCrudRepository, repository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Nist, Controls, ControlsRelations} from '../models';
import {NistRepository} from '../repositories';

export class ControlsRepository extends DefaultCrudRepository<
  Controls,
  typeof Controls.prototype.control_id,
  ControlsRelations
> {
  
  public readonly nist: HasOneRepositoryFactory <Nist, typeof Nist.prototype.number>;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
    @repository.getter('NistRepository')
    protected nistRepositoryGetter: Getter<NistRepository>,
  ) {
    super(Controls, dataSource);

    this.nist = this.createHasOneRepositoryFactoryFor(
      'nist',
      nistRepositoryGetter,
    );
    this.registerInclusionResolver('nist', this.nist.inclusionResolver);
  }
}
