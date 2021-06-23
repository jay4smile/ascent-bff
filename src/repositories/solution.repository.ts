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
import {Solution, SolutionRelations, Architectures, SolutionArchitectures} from '../models';
import {
  ArchitecturesRepository,
  SolutionArchitecturesRepository
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

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
    @repository.getter('ArchitecturesRepository')
    protected architecturesRepositoryGetter: Getter<ArchitecturesRepository>,
    @repository.getter('SolutionArchitecturesRepository')
    protected solutionArchitecturesRepositoryGetter: Getter<SolutionArchitecturesRepository>
  ) {
    super(Solution, dataSource);

    this.architectures = this.createHasManyThroughRepositoryFactoryFor(
      'architectures',
      architecturesRepositoryGetter,
      solutionArchitecturesRepositoryGetter
    );
    this.registerInclusionResolver('architectures', this.architectures.inclusionResolver);
  }
}
