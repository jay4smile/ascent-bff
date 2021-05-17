// Configuration Loading with nconf

import nconf from 'nconf';
import fs from 'fs';
import path from 'path';

nconf.use('memory');

nconf.overrides({
});

nconf.argv();
nconf.env({separator: '__'});

const confdir = nconf.get('conf') || path.join('config', process.env.NODE_ENV ?? 'staging');

if ( fs.existsSync( confdir ) && fs.statSync( confdir ).isDirectory() ) {
  console.log( 'Configuration directory: ' + confdir );
  fs.readdirSync(confdir)
    .filter(elem => (path.extname(elem) === '.json'))
    .sort()
    .forEach(file => {
      const filepath = path.normalize( path.join( confdir, file ) );
      nconf.file( file, { file : filepath } );
      console.log('Loading ' + filepath);
    });
} else {
  console.log( 'Config directory Not Found:', confdir, 'exiting' );
  console.log('Please specify configuration directory');
  process.exit(1);
}

export default nconf;
