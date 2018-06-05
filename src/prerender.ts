const { join } = require('path');
import { PrerenderSettings, prerender } from './prerender/prerender';

// Settings:
const PORT = 4000;
const HOST = `http://localhost:${PORT}`;
const DIST = join(process.cwd(), 'dist');
const SEED = 'material';
const ELM = 'blox-app';

prerender({
  dist: DIST,
  template: SEED + '.html',
  seed: SEED,
  bootstrap: [ELM],
  appId: 'prerender',
  port: PORT
}).then(() => console.log('Done!'))
  .catch(err => {
    console.error('Error: ', err);
    process.exit(1);
});
