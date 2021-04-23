import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, HasOneRepositoryFactory, HasManyThroughRepositoryFactory, repository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {ControlMapping, Profile, Controls, Services, Goal} from '../models';
import {ProfileRepository, ControlsRepository, ServicesRepository, GoalRepository, MappingGoalsRepository} from '../repositories';

export class ControlMappingRepository extends DefaultCrudRepository<
  ControlMapping,
  typeof ControlMapping.prototype.id
> {
  public readonly profile: HasOneRepositoryFactory<Profile, typeof Profile.prototype.id>;
  public readonly control: HasOneRepositoryFactory<Controls, typeof Controls.prototype.id>;
  public readonly service: HasOneRepositoryFactory<Services, typeof Services.prototype.service_id>;

  public readonly goals: HasManyThroughRepositoryFactory<
    Goal,
    typeof Goal.prototype.goal_id,
    ControlMapping,
    typeof ControlMapping.prototype.id
  >;
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
    @repository.getter('ProfileRepository')
    protected profileRepositoryGetter: Getter<ProfileRepository>,
    @repository.getter('ControlsRepository')
    protected controlRepositoryGetter: Getter<ControlsRepository>,
    @repository.getter('ServicesRepository')
    protected serviceRepositoryGetter: Getter<ServicesRepository>,
    @repository.getter('GoalRepository')
    protected goalRepositoryGetter: Getter<GoalRepository>,
    @repository.getter('MappingGoalsRepository')
    protected mappingGoalsRepositoryGetter: Getter<MappingGoalsRepository>
  ) {
    super(ControlMapping, dataSource);
    this.profile = this.createHasOneRepositoryFactoryFor(
      'profile',
      profileRepositoryGetter,
    );
    this.registerInclusionResolver('profile', this.profile.inclusionResolver);
    this.control = this.createHasOneRepositoryFactoryFor(
      'control',
      controlRepositoryGetter,
    );
    this.registerInclusionResolver('control', this.control.inclusionResolver);
    this.service = this.createHasOneRepositoryFactoryFor(
      'service',
      serviceRepositoryGetter,
    );
    this.registerInclusionResolver('service', this.service.inclusionResolver);

    this.goals = this.createHasManyThroughRepositoryFactoryFor(
      'goals',
      goalRepositoryGetter,
      mappingGoalsRepositoryGetter
    );
    this.registerInclusionResolver('goals', this.goals.inclusionResolver);
  }
}
