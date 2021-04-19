import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, HasOneRepositoryFactory, repository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {ControlMapping, Profile, Services} from '../models';
import {ProfileRepository, ServicesRepository} from '../repositories';

export class ControlMappingRepository extends DefaultCrudRepository<
  ControlMapping,
  typeof ControlMapping.prototype.id
> {
  public readonly profile: HasOneRepositoryFactory<Profile, typeof Profile.prototype.id>;
  public readonly service: HasOneRepositoryFactory<Services, typeof Services.prototype.service_id>;
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
    @repository.getter('ProfileRepository')
    protected profileRepositoryGetter: Getter<ProfileRepository>,
    @repository.getter('ServicesRepository')
    protected serviceRepositoryGetter: Getter<ServicesRepository>
  ) {
    super(ControlMapping, dataSource);
    this.profile = this.createHasOneRepositoryFactoryFor(
      'profile',
      profileRepositoryGetter,
    );
    this.registerInclusionResolver('profile', this.profile.inclusionResolver);
    this.service = this.createHasOneRepositoryFactoryFor(
      'service',
      serviceRepositoryGetter,
    );
    this.registerInclusionResolver('service', this.service.inclusionResolver);
  }
}
