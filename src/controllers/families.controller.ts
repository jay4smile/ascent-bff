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
import {Families} from '../models';
import {FamiliesRepository} from '../repositories';

export class FamiliesController {
  constructor(
    @repository(FamiliesRepository)
    public familiesRepository : FamiliesRepository,
  ) {}

  @post('/families')
  @response(200, {
    description: 'Families model instance',
    content: {'application/json': {schema: getModelSchemaRef(Families)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Families, {
            title: 'NewFamilies',
            
          }),
        },
      },
    })
    families: Families,
  ): Promise<Families> {
    return this.familiesRepository.create(families);
  }

  @get('/families/count')
  @response(200, {
    description: 'Families model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Families) where?: Where<Families>,
  ): Promise<Count> {
    return this.familiesRepository.count(where);
  }

  @get('/families')
  @response(200, {
    description: 'Array of Families model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Families, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Families) filter?: Filter<Families>,
  ): Promise<Families[]> {
    return this.familiesRepository.find(filter);
  }

  @patch('/families')
  @response(200, {
    description: 'Families PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Families, {partial: true}),
        },
      },
    })
    families: Families,
    @param.where(Families) where?: Where<Families>,
  ): Promise<Count> {
    return this.familiesRepository.updateAll(families, where);
  }

  @get('/families/{id}')
  @response(200, {
    description: 'Families model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Families, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Families, {exclude: 'where'}) filter?: FilterExcludingWhere<Families>
  ): Promise<Families> {
    return this.familiesRepository.findById(id, filter);
  }

  @patch('/families/{id}')
  @response(204, {
    description: 'Families PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Families, {partial: true}),
        },
      },
    })
    families: Families,
  ): Promise<void> {
    await this.familiesRepository.updateById(id, families);
  }

  @put('/families/{id}')
  @response(204, {
    description: 'Families PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() families: Families,
  ): Promise<void> {
    await this.familiesRepository.replaceById(id, families);
  }

  @del('/families/{id}')
  @response(204, {
    description: 'Families DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.familiesRepository.deleteById(id);
  }
}
