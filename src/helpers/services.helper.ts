import { Inject } from 'typescript-ioc';

import {
    Catalog,
    CatalogCategoryModel,
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

export interface CatExt extends CatalogCategoryModel {
    categoryName?: string;
}

export interface Service extends Module {
    category: string;
    categoryName?: string;
    service_id?: string;
    fullname?: string;
    ibm_catalog_id?: string;
    fs_validated?: boolean;
    controls?: Controls[]
}

const unique = (modules: Module[]) => {
    return modules.filter((m, ix) => modules.findIndex(m2 => m2.name === m.name) === ix);
}

const servicesFromCatalog = (catalog:Catalog) => {
    const cats:CatExt[] = catalog.categories;
    const services:Service[] = [];
    for (const cat of cats ) {
        if (cat.modules) for (const m of cat.modules) {
            services.push({
                ...m,
                category: cat.category,
                categoryName: cat.categoryName
            });
        }
    }
    return unique(services);
}

export class ServicesHelper {
    @Inject loader!: CatalogLoader;
    client: WrappedNodeRedisClient;
    catalog: Catalog;

    constructor() {
        if (process.env.NODE_ENV !== "test") this.client = createNodeRedisClient(6379, "localhost");
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

    getServices(): Promise<Service[]> {
        return new Promise((resolve, reject) => {
            if (this.client) {
                this.client.get("automation-modules")
                    .then(modules => {
                        if (modules) {
                            const parsedModules:Module[] = JSON.parse(modules);
                            return resolve(parsedModules);
                        } else {
                            this.getCatalog()
                                .then(catalog => {
                                    const services = servicesFromCatalog(catalog);
                                    this.client.set("automation-modules", JSON.stringify(services))
                                        .finally(() => resolve(services));
                                })
                                .catch(err => reject(err));
                        }
                    })
                    .catch(err => reject(err));
            } else {
                this.getCatalog()
                    .then(catalog => resolve(servicesFromCatalog(catalog)))
                    .catch(err => reject(err));
            }
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