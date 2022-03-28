import {
  repository,
} from '@loopback/repository';
import {
  param, get, response, getModelSchemaRef, patch, requestBody
} from '@loopback/rest';
import {Architectures, User} from '../models';
import {UserRepository} from '../repositories';

export class UserController {
  constructor(
    @repository(UserRepository) public userRepository : UserRepository,
  ) {}

  @get('/users/{id}')
  @response(200, {
    description: 'User model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {includeRelations: true}),
      },
    },
  })
  async getById(
    @param.path.string('id') id: string,
  ): Promise<User> {
    return this.userRepository.findById(id);
  }

  @get('/users/{id}/architectures')
  @response(200, {
    description: 'User architectures',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Architectures, {includeRelations: true}),
        },
      },
    }
  })
  async findUserArchitecturesById(
    @param.path.string('id') email: string,
  ): Promise<Architectures[]> {
    await this.userRepository.findById(email);
    return this.userRepository.architectures(email).find();
  }

  @patch('/users/{id}')
  @response(200, {
    description: 'User model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {includeRelations: true}),
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true, exclude: ['email']}),
        },
      },
    }) user: User,
  ): Promise<User> {
    await this.userRepository.updateById(id, user);
    return this.userRepository.findById(id);
  }

}
