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
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {Architectures} from '../models';
import {ArchitecturesRepository} from '../repositories';

export class ArchitecturesController {
  constructor(
    @repository(ArchitecturesRepository)
    public architecturesRepository : ArchitecturesRepository,
  ) {}

  @post('/architectures')
  @response(200, {
    description: 'Architectures model instance',
    content: {'application/json': {schema: getModelSchemaRef(Architectures)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Architectures, {
            title: 'NewArchitectures',
            
          }),
        },
      },
    })
    architectures: Architectures,
  ): Promise<Architectures> {
    return this.architecturesRepository.create(architectures);
  }

  @get('/architectures/count')
  @response(200, {
    description: 'Architectures model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Architectures) where?: Where<Architectures>,
  ): Promise<Count> {
    return this.architecturesRepository.count(where);
  }

  @get('/architectures')
  @response(200, {
    description: 'Array of Architectures model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Architectures, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Architectures) filter?: Filter<Architectures>,
  ): Promise<Architectures[]> {
    return this.architecturesRepository.find(filter);
  }

  @patch('/architectures')
  @response(200, {
    description: 'Architectures PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Architectures, {partial: true}),
        },
      },
    })
    architectures: Architectures,
    @param.where(Architectures) where?: Where<Architectures>,
  ): Promise<Count> {
    return this.architecturesRepository.updateAll(architectures, where);
  }

  @get('/architectures/{id}')
  @response(200, {
    description: 'Architectures model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Architectures, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Architectures, {exclude: 'where'}) filter?: FilterExcludingWhere<Architectures>
  ): Promise<Architectures> {
    return this.architecturesRepository.findById(id, filter);
  }

  @patch('/architectures/{id}')
  @response(200, {
    description: 'Architectures model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Architectures, {includeRelations: true}),
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Architectures, {partial: true}),
        },
      },
    })
    architectures: Architectures,
  ): Promise<Architectures> {
    await this.architecturesRepository.updateById(id, architectures);
    return this.architecturesRepository.findById(id);
  }

  @del('/architectures/{id}')
  @response(204, {
    description: 'Architectures DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.architecturesRepository.deleteById(id);
  }
}
