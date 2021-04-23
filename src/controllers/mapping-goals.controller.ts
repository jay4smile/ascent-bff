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
import {MappingGoals} from '../models';
import {MappingGoalsRepository} from '../repositories';

export class MappingGoalsController {
  constructor(
    @repository(MappingGoalsRepository)
    public mappingGoalsRepository : MappingGoalsRepository,
  ) {}

  @post('/mapping-goals')
  @response(200, {
    description: 'MappingGoals model instance',
    content: {'application/json': {schema: getModelSchemaRef(MappingGoals)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(MappingGoals, {
            title: 'NewMappingGoals',
            exclude: ['id'],
          }),
        },
      },
    })
    mappingGoals: Omit<MappingGoals, 'id'>,
  ): Promise<MappingGoals> {
    return this.mappingGoalsRepository.create(mappingGoals);
  }

  @get('/mapping-goals/count')
  @response(200, {
    description: 'MappingGoals model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(MappingGoals) where?: Where<MappingGoals>,
  ): Promise<Count> {
    return this.mappingGoalsRepository.count(where);
  }

  @get('/mapping-goals')
  @response(200, {
    description: 'Array of MappingGoals model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(MappingGoals, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(MappingGoals) filter?: Filter<MappingGoals>,
  ): Promise<MappingGoals[]> {
    return this.mappingGoalsRepository.find(filter);
  }

  @patch('/mapping-goals')
  @response(200, {
    description: 'MappingGoals PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(MappingGoals, {partial: true}),
        },
      },
    })
    mappingGoals: MappingGoals,
    @param.where(MappingGoals) where?: Where<MappingGoals>,
  ): Promise<Count> {
    return this.mappingGoalsRepository.updateAll(mappingGoals, where);
  }

  @get('/mapping-goals/{id}')
  @response(200, {
    description: 'MappingGoals model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(MappingGoals, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(MappingGoals, {exclude: 'where'}) filter?: FilterExcludingWhere<MappingGoals>
  ): Promise<MappingGoals> {
    return this.mappingGoalsRepository.findById(id, filter);
  }

  @patch('/mapping-goals/{id}')
  @response(204, {
    description: 'MappingGoals PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(MappingGoals, {partial: true}),
        },
      },
    })
    mappingGoals: MappingGoals,
  ): Promise<void> {
    await this.mappingGoalsRepository.updateById(id, mappingGoals);
  }

  @put('/mapping-goals/{id}')
  @response(204, {
    description: 'MappingGoals PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() mappingGoals: MappingGoals,
  ): Promise<void> {
    await this.mappingGoalsRepository.replaceById(id, mappingGoals);
  }

  @del('/mapping-goals/{id}')
  @response(204, {
    description: 'MappingGoals DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.mappingGoalsRepository.deleteById(id);
  }
}
