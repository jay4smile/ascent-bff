import { Inject } from 'typescript-ioc';

import {
    billOfMaterialFromYaml,
    BillOfMaterialModule,
    Catalog,
    CatalogCategoryModel,
    CatalogLoader,
    ModuleSelector
} from '@cloudnativetoolkit/iascable';

import {
    createNodeRedisClient,
    WrappedNodeRedisClient
} from 'handy-redis';

import yaml from 'js-yaml';

import catalogConfig from '../config/catalog.config'
import { Architectures, Bom, Controls } from '../models';

import first from '../util/first';
import { semanticVersionDescending, semanticVersionFromString } from '../util/semantic-version';

/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-throw-literal */

const catalogUrl = catalogConfig.url;

const CATALOG_KEY = 'automation-catalog';
const MODULES_KEY = 'automation-modules';

const isPending = (versions: string[] = []): boolean => {
    return versions.length === 0 || (versions.length === 1 && versions[0] === 'v0.0.0')
}
const isBeta = (versions: string[] = []): boolean => {
    return first(versions.map(semanticVersionFromString).sort(semanticVersionDescending)).filter(ver => ver.major === 0).isPresent()
}

export interface BomModule {
    name?: string;
    alias?: string;
    variables?: object[];
    dependencies?: object[];
}

export interface CatExt extends CatalogCategoryModel {
    categoryName?: string;
}

export interface ModuleSummary {
    id: string;
    name: string;
    alias?: string;
    aliasIds?: string[];
    category: string;
    description?: string;
    platforms: string[];
    provider?: 'ibm' | 'k8s';
    tags?: string[];
    displayName?: string;
    ibmCatalogId?: string;
    fsReady?: string;
    documentation?: string;
    versions: string[];
    bomModule?: BillOfMaterialModule;
}

export interface Service extends ModuleSummary {
    category: string;
    categoryName?: string;
    service_id?: string;
    fullname?: string;
    ibm_catalog_id?: string;
    fs_validated?: boolean;
    status?: string;
    controls?: Controls[];
}

const unique = (modules: ModuleSummary[]) => {
    return modules.filter((m, ix) => modules.findIndex(m2 => m2.name === m.name) === ix);
}

const servicesFromCatalog = (catalog: Catalog) => {
    const cats: CatExt[] = catalog.categories;
    const services: Service[] = [];
    for (const cat of cats) {
        if (cat.modules) for (const m of cat.modules) {
            const versions = m.versions?.map(v => v.version);
            const mSummary: ModuleSummary = {
                ...m,
                versions: m.versions.map(v => v.version)
            }
            services.push({
                ...mSummary,
                status: isPending(versions) ? 'pending' : isBeta(versions) ? 'beta' : 'released',
                category: cat.category,
                categoryName: cat.categoryName
            });
        }
    }
    return unique(services);
}

export class ServicesHelper {
    @Inject loader!: CatalogLoader;
    @Inject moduleSelector!: ModuleSelector;
    client: WrappedNodeRedisClient;
    catalog: Catalog;

    constructor() {
        if (process.env.NODE_ENV !== "test") this.client = createNodeRedisClient(6379, "localhost");
    }

    /**
     * Fetch catalog from catalogUrl
     * @returns Automation Catalog
     */
    private fetchCatalog(): Promise<Catalog> {
        return new Promise((resolve, reject) => {
            this.loader.loadCatalogFromUrl(catalogUrl)
                .then(catalog => {
                    console.log(`Automation Catalog fetched from ${catalogUrl}`);
                    if (this.client) this.client.set(CATALOG_KEY, catalog)
                        .finally(() => console.log(`Automation Catalog stored in cache`));
                    this.catalog = this.loader.parseYaml(catalog);
                    return resolve(this.catalog);
                })
                .catch(err => reject(err));
        });
    }

    /**
     * Loads catalog from Redis, or fetch it from catalogUrl
     * @returns Automation Catalog
     */
    getCatalog(): Promise<Catalog> {
        return new Promise((resolve, reject) => {
            if (this.catalog) {
                resolve(this.catalog);
            } else {
                if (this.client) {
                    this.client.get(CATALOG_KEY)
                        .then(catalog => {
                            if (catalog) {
                                console.log(`Automation Catalog retrieved from cache`);
                                this.catalog = this.loader.parseYaml(catalog);
                                resolve(this.catalog);
                            } else {
                                resolve(this.fetchCatalog());
                            }
                        })
                        .catch(err => reject(err));
                } else {
                    resolve(this.fetchCatalog());
                }
            }
        });
    }

    /**
     * Parse BOM yaml
     * @returns Arch and Boms models generated from yaml
     */
    async parseBomYaml(yamlString: string, publicArch: boolean): Promise<{ arch: Architectures, boms: Bom[] }> {
        let bom;
        try {
            bom = billOfMaterialFromYaml(yamlString);
        } catch (error) {
            throw { message: `Failed to load bom yaml`, details: error };
        }
        const yamlBom = yaml.load(yamlString);
        delete yamlBom.spec.modules;
        const arch: Architectures = new Architectures({
            arch_id: bom.metadata.name,
            name: bom.metadata.annotations?.displayName ?? bom.metadata.name,
            short_desc: bom.metadata.annotations?.description ?? `${bom.metadata.name} Bill of Materials.`,
            long_desc: bom.metadata.annotations?.description ?? `${bom.metadata.name} Bill of Materials.`,
            public: publicArch,
            platform: bom.metadata.labels?.platform,
            yaml: yaml.dump(yamlBom)
        });
        const bomYaml = yaml.load(yamlString);
        const boms:Bom[] = [];
        const bomModules:BomModule[] = bomYaml.spec.modules;
        const catalog = await this.getCatalog();
        for (const m of bom.spec.modules) {
            if (typeof m === 'string') throw new Error('BOM modules must not be of type string.');
            const bomModule = bomModules.find(m2 => m2.name === m.name);
            try {
                await this.moduleSelector.validateBillOfMaterialModuleConfigYaml(catalog, m.name ?? '', yaml.dump(bomModule));
            } catch (error) {
                console.log(error);
                throw { message: `Module ${m.name} yaml config validation failed.`, details: error };
            }
            boms.push(new Bom({
                arch_id: arch.arch_id,
                service_id: m.name,
                desc: m.alias ?? m.name,
                yaml: yaml.dump(bomModules.find(m2 => m2.name === m.name))
            }));
        }
        return { arch: arch, boms: boms };
    }

    /**
     * Validate BOM module yaml config
     * @returns Arch and Boms models generated from yaml
     */
    async validateBomModuleYaml(yamlString: string, moduleRef: string): Promise<void> {
        try {
            const catalog = await this.getCatalog();
            await this.moduleSelector.validateBillOfMaterialModuleConfigYaml(catalog, moduleRef, yamlString);
        } catch (error) {
            throw { message: `Module ${moduleRef} yaml config validation failed.`, details: error };
        }
    }

    /**
     * Loads services from Redis, or fetch them from catalog
     * @returns List of Catalog Services
     */
    getServices(): Promise<Service[]> {
        return new Promise((resolve, reject) => {
            if (this.client) {
                this.client.get(MODULES_KEY)
                    .then(modules => {
                        if (modules) {
                            console.log(`Automation Modules retrieved from the cache`);
                            const parsedModules: ModuleSummary[] = JSON.parse(modules);
                            return resolve(parsedModules);
                        } else {
                            this.getCatalog()
                                .then(catalog => {
                                    const services = servicesFromCatalog(catalog);
                                    for (const s of services) {
                                        this.client.set(`module-${s.name}`, JSON.stringify(s))
                                            .finally(() => console.log(`Automation Module stored in cache -> ${s.name}`));
                                    }
                                    this.client.set(MODULES_KEY, JSON.stringify(services))
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

    /**
     * Get specific service by id
     * @returns Service
     */
    getService(id: string): Promise<Service> {
        return new Promise((resolve, reject) => {
            if (this.client) {
                this.client.get(`module-${id}`)
                    .then(service => {
                        if (service) {
                            console.log(`Automation Module retrieved from the cache -> ${id}`);
                            return resolve(JSON.parse(service));
                        } else {
                            this.getServices()
                                .then(modules => {
                                    const module = modules.find(m => m.name === id);
                                    if (module) {
                                        resolve(module);
                                    } else reject(`Module ${id} not found`);
                                })
                                .catch(err => reject(err));
                        }
                    })
                    .catch(err => reject(err));
            } else {
                this.getServices()
                    .then(modules => {
                        const module = modules.find(m => m.name === id);
                        if (module) {
                            resolve(module);
                        } else reject(`Module ${id} not found`);
                    })
                    .catch(err => reject(err));
            }
        });
    }
}