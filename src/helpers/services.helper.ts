import { Inject } from 'typescript-ioc';

import {
    BillOfMaterial,
    BillOfMaterialModel,
    Catalog,
    CatalogLoader,
    Module,
    ModuleSelector,
    OutputFile, OutputFileType,
    //OutputFileType,
    SingleModuleVersion,
    TerraformBuilder,
    buildBomVariables,
    buildBomModule,
    TerraformComponent, UrlFile,
    //UrlFile
} from '@cloudnativetoolkit/iascable';

import {
    createNodeRedisClient,
    WrappedNodeRedisClient
} from 'handy-redis';

import catalogConfig from '../config/catalog.config'

const catalogUrl = catalogConfig.url;

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

    getModules(): Promise<Module[]> {
        return new Promise((resolve, reject) => {
            this.client.get("automation-modules")
            .then(modules => {
                if (modules) {
                    return resolve(JSON.parse(modules));
                } else {
                    this.getCatalog()
                    .then(catalog => {
                        this.client.set("automation-modules", JSON.stringify(catalog.modules));
                        return resolve(catalog.modules);
                    })
                    .catch(err => reject(err));
                }
            })
            .catch(err => reject(err));
        });
    }
}