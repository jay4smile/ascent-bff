import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Architectures, ArchitecturesRelations, Bom} from '../models';
import {BomRepository} from './bom.repository';

export class ArchitecturesRepository extends DefaultCrudRepository<
  Architectures,
  typeof Architectures.prototype.arch_id,
  ArchitecturesRelations
> {

  public readonly boms: HasManyRepositoryFactory<Bom, typeof Architectures.prototype.arch_id>;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('BomRepository') protected bomRepositoryGetter: Getter<BomRepository>,
  ) {
    super(Architectures, dataSource);
    this.boms = this.createHasManyRepositoryFactoryFor('boms', bomRepositoryGetter,);
    this.registerInclusionResolver('boms', this.boms.inclusionResolver);
  }
}
