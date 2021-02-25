import {expect} from '@loopback/testlab';
import {ArchitectureMapperBffApplication} from '../..';
import {RestServer, RestBindings} from '@loopback/rest';
const Dredd = require('dredd');

describe('API (acceptance)', () => {
  let app: ArchitectureMapperBffApplication;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  let dredd: any;
  before(initEnvironment);
  after(async () => {
    await app.stop();
  });

  it('conforms to the specification', done => {
    dredd.run((err: Error, stats: object) => {
      if (err) return done(err);
      expect(stats).to.containDeep({
        failures: 0,
        errors: 0,
        skipped: 0,
      });
      done();
    });
  });

  async function initEnvironment() {
    app = new ArchitectureMapperBffApplication();
    const server = await app.getServer(RestServer);
    // For testing, we'll let the OS pick an available port by setting
    // RestBindings.PORT to 0.
    server.bind(RestBindings.PORT).to(0);
    // app.start() starts up the HTTP server and binds the acquired port
    // number to RestBindings.PORT.
    await app.boot();
    await app.start();
    // Get the real port number.
    const port = await server.get(RestBindings.PORT);
    const baseUrl = `http://localhost:${port}`;
    const config: object = {
      endpoint: baseUrl
    };
    dredd = new Dredd(config);
  }
});
