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
import {Controls} from '../models';
import {ControlsRepository} from '../repositories';

export class ControlsController {
  constructor(
    @repository(ControlsRepository)
    public controlsRepository : ControlsRepository,
  ) {}

  @post('/controls')
  @response(200, {
    description: 'Controls model instance',
    content: {'application/json': {schema: getModelSchemaRef(Controls)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Controls, {
            title: 'NewControls',
            exclude: ['_id'],
          }),
        },
      },
    })
    controls: Omit<Controls, '_id'>,
  ): Promise<Controls> {
    return this.controlsRepository.create(controls);
  }

  @get('/controls/count')
  @response(200, {
    description: 'Controls model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Controls) where?: Where<Controls>,
  ): Promise<Count> {
    return this.controlsRepository.count(where);
  }

  @get('/controls')
  @response(200, {
    description: 'Array of Controls model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Controls, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Controls) filter?: Filter<Controls>,
  ): Promise<Controls[]> {
    return this.controlsRepository.find(filter);
  }

  @patch('/controls')
  @response(200, {
    description: 'Controls PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Controls, {partial: true}),
        },
      },
    })
    controls: Controls,
    @param.where(Controls) where?: Where<Controls>,
  ): Promise<Count> {
    return this.controlsRepository.updateAll(controls, where);
  }

  @get('/controls/{id}')
  @response(200, {
    description: 'Controls model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Controls, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Controls, {exclude: 'where'}) filter?: FilterExcludingWhere<Controls>
  ): Promise<Controls> {
    return this.controlsRepository.findById(id, filter);
  }

  @patch('/controls/{id}')
  @response(204, {
    description: 'Controls PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Controls, {partial: true}),
        },
      },
    })
    controls: Controls,
  ): Promise<void> {
    await this.controlsRepository.updateById(id, controls);
  }

  @put('/controls/{id}')
  @response(204, {
    description: 'Controls PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() controls: Controls,
  ): Promise<void> {
    await this.controlsRepository.replaceById(id, controls);
  }

  @del('/controls/{id}')
  @response(204, {
    description: 'Controls DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.controlsRepository.deleteById(id);
  }
}
