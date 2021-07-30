import {
  repository,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {UserOnBoarding} from '../models';
import {UserOnBoardingRepository} from '../repositories';

/* eslint-disable @typescript-eslint/naming-convention */

export class UserOnBoardingController {
  constructor(
    @repository(UserOnBoardingRepository)
    public userOnBoardingRepository : UserOnBoardingRepository,
  ) {}

  @post('/user-onboarding')
  @response(200, {
    description: 'UserOnBoarding model instance',
    content: {'application/json': {schema: getModelSchemaRef(UserOnBoarding)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserOnBoarding, {
            title: 'NewUserOnBoarding',
            exclude: ['id'],
          }),
        },
      },
    })
    userOnBoarding: Omit<UserOnBoarding, 'id'>,
  ): Promise<UserOnBoarding> {
    const existing = await this.userOnBoardingRepository.find({where: {and: [{control_id: userOnBoarding.control_id}, {user_id: userOnBoarding.user_id}]}});
    if (existing.length) {
      await this.userOnBoardingRepository.updateById(existing[0].id, {status: userOnBoarding.status});
      return this.userOnBoardingRepository.findById(existing[0].id);
    }
    return this.userOnBoardingRepository.create(userOnBoarding);
  }

  @get('/user/{email}/onboarding')
  @response(200, {
    description: 'Array of UserOnBoarding model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(UserOnBoarding, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.path.string('email') email: string,
  ): Promise<UserOnBoarding[]> {
    return this.userOnBoardingRepository.find({
      where: {user_id: email}
    });
  }

  @patch('/user-onboarding/{id}')
  @response(204, {
    description: 'UserOnBoarding PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserOnBoarding, {partial: true}),
        },
      },
    })
    userOnBoarding: UserOnBoarding,
  ): Promise<void> {
    await this.userOnBoardingRepository.updateById(id, userOnBoarding);
  }

  @del('/user-onboarding/{id}')
  @response(204, {
    description: 'UserOnBoarding DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.userOnBoardingRepository.deleteById(id);
  }
}
