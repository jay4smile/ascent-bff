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
import {Bom} from '../models';
import {BomRepository} from '../repositories';

export class BomController {
  constructor(
    @repository(BomRepository)
    public bomRepository : BomRepository,
  ) {}

  @post('/boms')
  @response(200, {
    description: 'Bom model instance',
    content: {'application/json': {schema: getModelSchemaRef(Bom)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Bom, {
            title: 'NewBom',
            exclude: ['_id'],
          }),
        },
      },
    })
    bom: Omit<Bom, '_id'>,
  ): Promise<Bom> {
    return this.bomRepository.create(bom);
  }

  @get('/boms/count')
  @response(200, {
    description: 'Bom model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Bom) where?: Where<Bom>,
  ): Promise<Count> {
    return this.bomRepository.count(where);
  }

  @get('/boms')
  @response(200, {
    description: 'Array of Bom model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Bom, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Bom) filter?: Filter<Bom>,
  ): Promise<Bom[]> {
    return this.bomRepository.find(filter);
  }

  @patch('/boms')
  @response(200, {
    description: 'Bom PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Bom, {partial: true}),
        },
      },
    })
    bom: Bom,
    @param.where(Bom) where?: Where<Bom>,
  ): Promise<Count> {
    return this.bomRepository.updateAll(bom, where);
  }

  @get('/boms/{id}')
  @response(200, {
    description: 'Bom model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Bom, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Bom, {exclude: 'where'}) filter?: FilterExcludingWhere<Bom>
  ): Promise<Bom> {
    return this.bomRepository.findById(id, filter);
  }

  @patch('/boms/{id}')
  @response(200, {
    description: 'Controls model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Bom),
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Bom, {partial: true}),
        },
      },
    })
    bom: Bom,
  ): Promise<Bom> {
    await this.bomRepository.updateById(id, bom);
    return this.bomRepository.findById(id);
  }

  @del('/boms/{id}')
  @response(204, {
    description: 'Bom DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.bomRepository.deleteById(id);
  }
}
