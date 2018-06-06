const { join } = require('path');
import * as fs from 'fs-extra';
import * as path from 'path';
import * as yargs from 'yargs';
import * as chalk from 'chalk';
import { prerender } from './prerender/prerender';
import { readConfig } from './prerender/cli';

try {
    const config = readConfig();
    prerender(config).then(() => console.log(chalk.default.green('Done!')));
} catch (err) {
    console.error(chalk.default.red('Error: ', err));
    process.exit(1);
}
