import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, HasOneRepositoryFactory, repository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {ControlMapping, Profile} from '../models';
import {ProfileRepository} from '../repositories';

export class ControlMappingRepository extends DefaultCrudRepository<
  ControlMapping,
  typeof ControlMapping.prototype.id
> {
  public readonly profile: HasOneRepositoryFactory<Profile, typeof Profile.prototype.id>;
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
    @repository.getter('ProfileRepository')
    protected profileRepositoryGetter: Getter<ProfileRepository>
  ) {
    super(ControlMapping, dataSource);
    this.profile = this.createHasOneRepositoryFactoryFor(
      'profile',
      profileRepositoryGetter,
    );
    this.registerInclusionResolver('profile', this.profile.inclusionResolver);
  }
}
