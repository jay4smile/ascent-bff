import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {UserOnBoarding, UserOnBoardingRelations} from '../models';

export class UserOnBoardingRepository extends DefaultCrudRepository<
  UserOnBoarding,
  typeof UserOnBoarding.prototype.id,
  UserOnBoardingRelations
> {
  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource,
  ) {
    super(UserOnBoarding, dataSource);
  }
}
