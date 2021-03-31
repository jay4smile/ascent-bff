import {
    Count,
    CountSchema,
    Where,
    repository,
    Filter
} from '@loopback/repository';
import {
    del,
    get,
    post,
    patch,
    requestBody,
    getModelSchemaRef,
    response,
    param
} from '@loopback/rest';
import { Controls, ControlMapping, Services, Architectures } from '../models';
import { ServicesRepository, ControlsRepository, ControlMappingRepository, ArchitecturesRepository } from '../repositories';

export class ControlMappingController {
    constructor(
        @repository(ControlMappingRepository)
        public controlMappingRepository: ControlMappingRepository,
        @repository(ControlsRepository)
        protected controlsRepository: ControlsRepository,
        @repository(ArchitecturesRepository)
        protected architecturesRepository: ArchitecturesRepository,
        @repository(ServicesRepository)
        protected servicesRepository: ServicesRepository
    ) { }

    @get('/control-mapping')
    @response(200, {
        description: 'Array of ControlMapping model instances',
        content: {
            'application/json': {
                schema: {
                    type: 'array',
                    items: getModelSchemaRef(ControlMapping),
                },
            },
        },
    })
    async find(
        @param.filter(ControlMapping) filter?: Filter<ControlMapping>,
    ): Promise<ControlMapping[]> {
        return this.controlMappingRepository.find(filter);
    }

    @get('/controls/{id}/services')
    @response(200, {
        description: 'Services impacted by a control',
        content: {
            'application/json': {
                schema: {
                    type: 'array',
                    items: getModelSchemaRef(Services),
                },
            },
        },
    })
    async findControlServices(
        @param.path.string('id') id: typeof Controls.prototype.control_id,
        @param.filter(Services) filter?: Filter<Services>,
    ): Promise<Services[]> {
        return this.controlsRepository.services(id).find(filter);
    }

    @get('/controls/{id}/architectures')
    @response(200, {
        description: 'Architectures impacted by a control',
        content: {
            'application/json': {
                schema: {
                    type: 'array',
                    items: getModelSchemaRef(Architectures),
                },
            },
        },
    })
    async findControlArchitectures(
        @param.path.string('id') id: typeof Controls.prototype.control_id,
        @param.filter(Architectures) filter?: Filter<Architectures>,
    ): Promise<Architectures[]> {
        return this.controlsRepository.architectures(id).find(filter);
    }

    @get('/services/{id}/controls')
    @response(200, {
        description: 'Controls that impact a service',
        content: {
            'application/json': {
                schema: {
                    type: 'array',
                    items: getModelSchemaRef(Controls),
                },
            },
        },
    })
    async findServiceControls(
        @param.path.string('id') id: typeof Services.prototype.service_id,
        @param.filter(Services) filter?: Filter<Controls>,
    ): Promise<Controls[]> {
        return this.servicesRepository.controls(id).find(filter);
    }

    @post('/control-mapping', {
        responses: {
            '200': {
                description: 'Control Mapping model instance',
                content: { 'application/json': { schema: getModelSchemaRef(ControlMapping) } },
            },
        },
    })
    async create(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(ControlMapping, {
                        title: 'NewControlMapping'
                    }),
                },
            },
        }) cm: ControlMapping,
    ): Promise<ControlMapping> {
        if (cm.control_id) {
            await this.controlsRepository.findById(cm.control_id);
        }
        if (cm.service_id) {
            await this.servicesRepository.findById(cm.service_id);
        }
        if (cm.arch_id) {
            await this.architecturesRepository.findById(cm.arch_id);
        }
        if (!(cm.service_id || cm.arch_id)) {
            return Promise.reject(new Error("You must set a service ID or an architecture ID."));
        }
        return this.controlMappingRepository.create(cm);
    }

    @patch('/control-mapping/{id}', {
        responses: {
            '200': {
                description: 'Control Mapping model instance',
                content: { 'application/json': { schema: getModelSchemaRef(ControlMapping) } },
            },
        },
    })
    async updateById(
        @param.path.string('id') id: string,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(ControlMapping, { partial: true }),
                },
            },
        }) cm: ControlMapping,
    ): Promise<ControlMapping> {
        await this.controlMappingRepository.updateById(id, cm);
        return this.controlMappingRepository.findById(id);
    }

    @del('/control-mapping', {
        responses: {
            '200': {
                description: 'Control Mapping DELETE success count',
                content: { 'application/json': { schema: CountSchema } },
            },
        },
    })
    async delete(
        @requestBody({
            content: {
              'application/json': {
                schema: getModelSchemaRef(ControlMapping, {partial: true}),
              },
            },
          }) mapping: Where<ControlMapping>,
    ): Promise<Count> {
        // eslint-disable-next-line no-prototype-builtins
        if (!((mapping.hasOwnProperty('control_id') && mapping.hasOwnProperty('arch_id')) || (mapping.hasOwnProperty('control_id') && mapping.hasOwnProperty('service_id')))) {
            return Promise.reject(new Error("You must set a control ID and a component ID."));
        }
        return this.controlMappingRepository.deleteAll(mapping);
    }
}
