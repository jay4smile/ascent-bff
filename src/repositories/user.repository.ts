import {inject, Getter} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasManyThroughRepositoryFactory,
  repository
} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {
  User,
  UserRelations,
  Architectures,
  UserArchitectures,
  Solution,
  UserSolutions
} from '../models';
import {
  ArchitecturesRepository,
  UserArchitecturesRepository,
  SolutionRepository,
  UserSolutionsRepository
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

  public readonly solutions: HasManyThroughRepositoryFactory<
    Solution,
    typeof Solution.prototype.id,
    UserSolutions,
    typeof UserSolutions.prototype.id
  >;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
    @repository.getter('ArchitecturesRepository')
    protected architecturesRepositoryGetter: Getter<ArchitecturesRepository>,
    @repository.getter('UserArchitecturesRepository')
    protected userArchitecturesRepositoryGetter: Getter<UserArchitecturesRepository>,
    @repository.getter('SolutionRepository')
    protected solutionRepositoryGetter: Getter<SolutionRepository>,
    @repository.getter('UserSolutionsRepository')
    protected userSolutionsRepositoryGetter: Getter<UserSolutionsRepository>
  ) {
    super(User, dataSource);

    this.architectures = this.createHasManyThroughRepositoryFactoryFor(
      'architectures',
      architecturesRepositoryGetter,
      userArchitecturesRepositoryGetter
    );
    this.registerInclusionResolver('architectures', this.architectures.inclusionResolver);

    this.solutions = this.createHasManyThroughRepositoryFactoryFor(
      'solutions',
      solutionRepositoryGetter,
      userSolutionsRepositoryGetter
    );
    this.registerInclusionResolver('solutions', this.solutions.inclusionResolver);
  }
}
