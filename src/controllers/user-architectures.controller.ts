import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {UserArchitectures} from '../models';
import {UserArchitecturesRepository} from '../repositories';

export class UserArchitecturesController {
  constructor(
    @repository(UserArchitecturesRepository)
    public userArchitecturesRepository : UserArchitecturesRepository,
  ) {}

  @post('/user-architectures')
  @response(200, {
    description: 'UserArchitectures model instance',
    content: {'application/json': {schema: getModelSchemaRef(UserArchitectures)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserArchitectures, {
            title: 'NewUserArchitectures',
            exclude: ['id'],
          }),
        },
      },
    })
    userArchitectures: Omit<UserArchitectures, 'id'>,
  ): Promise<UserArchitectures> {
    return this.userArchitecturesRepository.create(userArchitectures);
  }

  @get('/user-architectures/count')
  @response(200, {
    description: 'UserArchitectures model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(UserArchitectures) where?: Where<UserArchitectures>,
  ): Promise<Count> {
    return this.userArchitecturesRepository.count(where);
  }

  @get('/user-architectures')
  @response(200, {
    description: 'Array of UserArchitectures model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(UserArchitectures, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(UserArchitectures) filter?: Filter<UserArchitectures>,
  ): Promise<UserArchitectures[]> {
    return this.userArchitecturesRepository.find(filter);
  }

  @patch('/user-architectures')
  @response(200, {
    description: 'UserArchitectures PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserArchitectures, {partial: true}),
        },
      },
    })
    userArchitectures: UserArchitectures,
    @param.where(UserArchitectures) where?: Where<UserArchitectures>,
  ): Promise<Count> {
    return this.userArchitecturesRepository.updateAll(userArchitectures, where);
  }

  @get('/user-architectures/{id}')
  @response(200, {
    description: 'UserArchitectures model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(UserArchitectures, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(UserArchitectures, {exclude: 'where'}) filter?: FilterExcludingWhere<UserArchitectures>
  ): Promise<UserArchitectures> {
    return this.userArchitecturesRepository.findById(id, filter);
  }

  @patch('/user-architectures/{id}')
  @response(200, {
    description: 'UserArchitectures PATCHed instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(UserArchitectures, {includeRelations: true}),
      },
    }
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UserArchitectures, {partial: true}),
        },
      },
    })
    userArchitectures: UserArchitectures,
  ): Promise<UserArchitectures> {
    await this.userArchitecturesRepository.updateById(id, userArchitectures)
    return this.userArchitecturesRepository.findById(id);
  }

  @put('/user-architectures/{id}')
  @response(204, {
    description: 'UserArchitectures PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() userArchitectures: UserArchitectures,
  ): Promise<void> {
    await this.userArchitecturesRepository.replaceById(id, userArchitectures);
  }

  @del('/user-architectures/{id}')
  @response(204, {
    description: 'UserArchitectures DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.userArchitecturesRepository.deleteById(id);
  }
}
