import * as chalk from 'chalk';
import { prerender } from './prerender/prerender';
import { readConfig } from './prerender/cli';

try {
    const config = readConfig();
    prerender(config).then(() => console.log(chalk.green('Done!')));
} catch (err) {
    console.error(chalk.red('Error: ', err));
    process.exit(1);
}
