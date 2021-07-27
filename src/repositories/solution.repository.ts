import {
  inject,
  Getter
} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasManyThroughRepositoryFactory,
  repository
} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {
  Solution,
  SolutionRelations,
  Architectures,
  SolutionArchitectures,
  User,
  UserSolutions
} from '../models';
import {
  ArchitecturesRepository,
  SolutionArchitecturesRepository,
  UserRepository,
  UserSolutionsRepository
} from '../repositories';

export class SolutionRepository extends DefaultCrudRepository<
  Solution,
  typeof Solution.prototype.id,
  SolutionRelations
> {

  public readonly architectures: HasManyThroughRepositoryFactory<
    Architectures,
    typeof Architectures.prototype.arch_id,
    SolutionArchitectures,
    typeof SolutionArchitectures.prototype.id
  >;

  public readonly owners: HasManyThroughRepositoryFactory<
    User,
    typeof User.prototype.email,
    UserSolutions,
    typeof UserSolutions.prototype.id
  >;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
    @repository.getter('ArchitecturesRepository')
    protected architecturesRepositoryGetter: Getter<ArchitecturesRepository>,
    @repository.getter('SolutionArchitecturesRepository')
    protected solutionArchitecturesRepositoryGetter: Getter<SolutionArchitecturesRepository>,
    @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('UserSolutionsRepository') protected userSolutionsRepositoryGetter: Getter<UserSolutionsRepository>
  ) {
    super(Solution, dataSource);

    this.architectures = this.createHasManyThroughRepositoryFactoryFor(
      'architectures',
      architecturesRepositoryGetter,
      solutionArchitecturesRepositoryGetter
    );
    this.registerInclusionResolver('architectures', this.architectures.inclusionResolver);

    this.owners = this.createHasManyThroughRepositoryFactoryFor(
      'owners',
      userRepositoryGetter,
      userSolutionsRepositoryGetter
    );
    this.registerInclusionResolver('owners', this.owners.inclusionResolver);
  }
}
