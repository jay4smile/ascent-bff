// Load Application Parameters

import conf from './conf';
import _ from 'lodash';

export class Services {
  private static instance: Services;

  private _services: Map<string, string> = new Map<string, string>();

  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor() {

    // Validate Env Exists and add to the nconf singleton
    const secrets:string = conf.get(`secrets`);

    for ( const secret of Object.keys(secrets) ) {

      // @ts-ignore
      if (_.isUndefined( process.env[secrets[secret]] ) ) {
        console.log('Secret ' + secret + ' not defined');
      } else {
        // Store Secrets Binding in memory for access by the application
        let value = '';
        try {
          // @ts-ignore
          value = JSON.parse(process.env[secrets[secret]]);
        } catch {
          // @ts-ignore
          value = process.env[secrets[secret]];
        }
        // Place Environment Variable into Map for value key pair access
        this._services.set(secret, value);

      }
    }

  }

  /**
   * The static method that controls the access to the singleton instance.
   *
   * This implementation let you subclass the Singleton class while keeping
   * just one instance of each subclass around.
   */
  public static getInstance(): Services {
    if (!Services.instance) {
      Services.instance = new Services();
    }

    return Services.instance;
  }

  /**
   * Finally, any singleton should define some business logic, which can be
   * executed on its instance.
   */
  public getService(serviceName:string) {
    return this._services.get(serviceName);

  }
  public isLocal() {
    // Check if local
    const env = process.env.NODE_ENV || 'development';
    let isLocal = false;
    if (env === 'development' ) {
      isLocal = true;
    }
    return isLocal;
  }
}

export default Services;
