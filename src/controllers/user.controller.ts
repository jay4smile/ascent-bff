import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  response,
  getModelSchemaRef
} from '@loopback/rest';
import {Architectures} from '../models';
import {UserRepository} from '../repositories';

export class UserController {
  constructor(
    @repository(UserRepository) public userRepository : UserRepository,
  ) {}

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
}
