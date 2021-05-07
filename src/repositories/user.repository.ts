import {inject, Getter} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasManyThroughRepositoryFactory,
  repository
} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {User, UserRelations, Architectures, UserArchitectures} from '../models';
import {
  ArchitecturesRepository,
  UserArchitecturesRepository
} from '../repositories';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.email,
  UserRelations
> {

  public readonly architectures: HasManyThroughRepositoryFactory<
    Architectures,
    typeof Architectures.prototype.arch_id,
    UserArchitectures,
    typeof UserArchitectures.prototype.id
  >;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
    @repository.getter('ArchitecturesRepository')
    protected architecturesRepositoryGetter: Getter<ArchitecturesRepository>,
    @repository.getter('UserArchitecturesRepository')
    protected userArchitecturesRepositoryGetter: Getter<UserArchitecturesRepository>
  ) {
    super(User, dataSource);

    this.architectures = this.createHasManyThroughRepositoryFactoryFor(
      'architectures',
      architecturesRepositoryGetter,
      userArchitecturesRepositoryGetter
    );
    this.registerInclusionResolver('architectures', this.architectures.inclusionResolver);
  }
}
