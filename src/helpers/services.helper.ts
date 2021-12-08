import { Inject } from 'typescript-ioc';

import {
    Catalog,
    CatalogLoader,
    Module,
} from '@cloudnativetoolkit/iascable';

import { repository } from '@loopback/repository';

import { ControlMappingRepository } from '../repositories';

import {
    createNodeRedisClient,
    WrappedNodeRedisClient
} from 'handy-redis';

import catalogConfig from '../config/catalog.config'
import { Controls } from '../models';

/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */

const catalogUrl = catalogConfig.url;

export interface Service extends Module {
    controls?: Controls[]
}

export class ServiceHelper {
    @Inject loader!: CatalogLoader;
    client: WrappedNodeRedisClient;
    catalog: Catalog;

    constructor(
        @repository(ControlMappingRepository)
        protected controlMappingRepository: ControlMappingRepository,
    ) {
        this.client = createNodeRedisClient(6379, "localhost");
    }

    getCatalog(): Promise<Catalog> {
        return new Promise((resolve, reject) => {
            if (this.catalog) {
                return resolve(this.catalog);
            } else {
                this.loader.loadCatalog(catalogUrl)
                    .then(catalog => {
                        this.catalog = catalog;
                        return resolve(catalog);
                    })
                    .catch(err => reject(err));
            }
        });
    }

    getServices(): Promise<Module[]> {
        return new Promise((resolve, reject) => {
            this.client.get("automation-modules")
                .then(modules => {
                    if (modules) {
                        return resolve(JSON.parse(modules));
                    } else {
                        this.getCatalog()
                            .then(catalog => {
                                this.client.set("automation-modules", JSON.stringify(catalog.modules))
                                    .finally(() => resolve(catalog.modules));
                            })
                            .catch(err => reject(err));
                    }
                })
                .catch(err => reject(err));
        });
    }

    getService(id: string, filter?: any): Promise<Service> {
        return new Promise((resolve, reject) => {
            this.getServices()
                .then(modules => {
                    const module = modules.find(m => m.name === id);
                    if (module) {
                        if (filter?.include?.includes('controls')) {
                            const service: Service = module;
                            this.controlMappingRepository.find({ where: { service_id: { eq: module.name } }, include: ['control'] })
                                .then(mappings => {
                                    const flags: { [id: string]: boolean } = {};
                                    service.controls = mappings.map(m => m.control).filter(function (control) {
                                        if (flags[control.id]) {
                                            return false;
                                        }
                                        flags[control.id] = true;
                                        return true;
                                    });
                                }).catch(err => reject(err));
                        } else resolve(module);
                    } else reject(`Service ${id} not found`);
                })
                .catch(err => reject(err));
        });
    }
}