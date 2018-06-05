const { join } = require('path');
import * as fs from 'fs-extra';
import * as path from 'path';
import * as yargs from 'yargs';
import * as chalk from 'chalk';
import { prerender } from './prerender/prerender';
import { prerenderConfig } from './prerender/cli';

prerender(prerenderConfig)
    .then(() => console.log(chalk.default.green('Done!')))
    .catch(err => {
        console.error(chalk.default.red('Error: ', err));
        process.exit(1);
    });
