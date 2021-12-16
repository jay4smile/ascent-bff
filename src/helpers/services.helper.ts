import { Inject } from 'typescript-ioc';

import {
    Catalog,
    CatalogLoader,
    Module,
} from '@cloudnativetoolkit/iascable';

import {
    createNodeRedisClient,
    WrappedNodeRedisClient
} from 'handy-redis';

import catalogConfig from '../config/catalog.config'
import { Controls } from '../models';

/* eslint-disable @typescript-eslint/naming-convention */

const catalogUrl = catalogConfig.url;

export interface Service extends Module {
    service_id?: string;
    fullname?: string;
    ibm_catalog_id?: string;
    fs_validated?: boolean;
    controls?: Controls[]
}

export class ServicesHelper {
    @Inject loader!: CatalogLoader;
    client: WrappedNodeRedisClient;
    catalog: Catalog;

    constructor() {
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

    getService(id: string): Promise<Service> {
        return new Promise((resolve, reject) => {
            this.getServices()
                .then(modules => {
                    const module = modules.find(m => m.name === id);
                    if (module) {
                        resolve(module);
                    } else reject(`Service ${id} not found`);
                })
                .catch(err => reject(err));
        });
    }
}