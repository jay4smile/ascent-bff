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
import {Nist} from '../models';
import {NistRepository} from '../repositories';

export class NistController {
  constructor(
    @repository(NistRepository)
    public nistRepository : NistRepository,
  ) {}

  @post('/nist')
  @response(200, {
    description: 'Nist model instance',
    content: {'application/json': {schema: getModelSchemaRef(Nist)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Nist, {
            title: 'NewNist',
            exclude: ['_id'],
          }),
        },
      },
    })
    nist: Omit<Nist, '_id'>,
  ): Promise<Nist> {
    return this.nistRepository.create(nist);
  }

  @get('/nist/count')
  @response(200, {
    description: 'Nist model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Nist) where?: Where<Nist>,
  ): Promise<Count> {
    return this.nistRepository.count(where);
  }

  @get('/nist')
  @response(200, {
    description: 'Array of Nist model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Nist, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Nist) filter?: Filter<Nist>,
  ): Promise<Nist[]> {
    return this.nistRepository.find(filter);
  }

  @patch('/nist')
  @response(200, {
    description: 'Nist PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Nist, {partial: true}),
        },
      },
    })
    nist: Nist,
    @param.where(Nist) where?: Where<Nist>,
  ): Promise<Count> {
    return this.nistRepository.updateAll(nist, where);
  }

  @get('/nist/{id}')
  @response(200, {
    description: 'Nist model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Nist, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Nist, {exclude: 'where'}) filter?: FilterExcludingWhere<Nist>
  ): Promise<Nist> {
    return this.nistRepository.findById(id, filter);
  }

  @patch('/nist/{id}')
  @response(204, {
    description: 'Nist PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Nist, {partial: true}),
        },
      },
    })
    nist: Nist,
  ): Promise<void> {
    await this.nistRepository.updateById(id, nist);
  }

  @put('/nist/{id}')
  @response(204, {
    description: 'Nist PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() nist: Nist,
  ): Promise<void> {
    await this.nistRepository.replaceById(id, nist);
  }

  @del('/nist/{id}')
  @response(204, {
    description: 'Nist DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.nistRepository.deleteById(id);
  }
}
