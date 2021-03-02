import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  Architectures,
  Bom,
} from '../models';
import {ArchitecturesRepository} from '../repositories';

export class ArchitecturesBomController {
  constructor(
    @repository(ArchitecturesRepository) protected architecturesRepository: ArchitecturesRepository,
  ) { }

  @get('/architectures/{id}/boms', {
    responses: {
      '200': {
        description: 'Array of Architectures has many Bom',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Bom)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Bom>,
  ): Promise<Bom[]> {
    return this.architecturesRepository.boms(id).find(filter);
  }

  @post('/architectures/{id}/boms', {
    responses: {
      '200': {
        description: 'Architectures model instance',
        content: {'application/json': {schema: getModelSchemaRef(Bom)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Architectures.prototype.arch_id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Bom, {
            title: 'NewBomInArchitectures',
            exclude: ['_id'],
            optional: ['arch_id']
          }),
        },
      },
    }) bom: Omit<Bom, '_id'>,
  ): Promise<Bom> {
    return this.architecturesRepository.boms(id).create(bom);
  }

  @patch('/architectures/{id}/boms', {
    responses: {
      '200': {
        description: 'Architectures.Bom PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Bom, {partial: true}),
        },
      },
    })
    bom: Partial<Bom>,
    @param.query.object('where', getWhereSchemaFor(Bom)) where?: Where<Bom>,
  ): Promise<Count> {
    return this.architecturesRepository.boms(id).patch(bom, where);
  }

  @del('/architectures/{id}/boms', {
    responses: {
      '200': {
        description: 'Architectures.Bom DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Bom)) where?: Where<Bom>,
  ): Promise<Count> {
    return this.architecturesRepository.boms(id).delete(where);
  }
}
