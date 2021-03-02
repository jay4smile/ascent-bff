import {
    repository,
    Filter
} from '@loopback/repository';
import {
    get,
    getModelSchemaRef,
    response,
    param
} from '@loopback/rest';
import { Controls, ControlMapping, Services, Architectures } from '../models';
import { ServicesRepository, ControlsRepository, ControlMappingRepository } from '../repositories';

export class ControlMappingController {
    constructor(
        @repository(ControlMappingRepository)
        public controlMappingRepository: ControlMappingRepository,
        @repository(ControlsRepository)
        protected controlsRepository: ControlsRepository,
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
}
