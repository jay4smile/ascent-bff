import {inject, Getter} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  HasManyThroughRepositoryFactory,
  repository
} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {
  Architectures,
  ArchitecturesRelations,
  Bom,
  User,
  UserArchitectures
} from '../models';
import {
  BomRepository,
  UserRepository,
  UserArchitecturesRepository
} from '.';

export class ArchitecturesRepository extends DefaultCrudRepository<
  Architectures,
  typeof Architectures.prototype.arch_id,
  ArchitecturesRelations
> {

  public readonly boms: HasManyRepositoryFactory<Bom, typeof Architectures.prototype.arch_id>;

  public readonly owners: HasManyThroughRepositoryFactory<
    User,
    typeof User.prototype.email,
    UserArchitectures,
    typeof UserArchitectures.prototype.id
  >;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
    @repository.getter('BomRepository') protected bomRepositoryGetter: Getter<BomRepository>,
    @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
    @repository.getter('UserArchitecturesRepository') protected userArchitecturesRepositoryGetter: Getter<UserArchitecturesRepository>
  ) {
    super(Architectures, dataSource);
    this.boms = this.createHasManyRepositoryFactoryFor('boms', bomRepositoryGetter,);
    this.registerInclusionResolver('boms', this.boms.inclusionResolver);
    this.owners = this.createHasManyThroughRepositoryFactoryFor(
      'owners',
      userRepositoryGetter,
      userArchitecturesRepositoryGetter
    );
    this.registerInclusionResolver('owners', this.owners.inclusionResolver);
  }
}
