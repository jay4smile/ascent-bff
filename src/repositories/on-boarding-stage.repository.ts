import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {OnBoardingStage, OnBoardingStageRelations} from '../models';

export class OnBoardingStageRepository extends DefaultCrudRepository<
  OnBoardingStage,
  typeof OnBoardingStage.prototype.id,
  OnBoardingStageRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(OnBoardingStage, dataSource);
  }
}
