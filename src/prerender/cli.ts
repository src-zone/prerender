import * as fs from 'fs-extra';
import * as path from 'path';
import * as yargs from 'yargs';
import { PrerenderSettings } from './prerender';

let args = yargs
    .usage('prerender: prerender your spa sites for speed & seo!')
    .options({
        config: {
            type: "string",
            describe: "Path to the config file",
            default: "prerender.conf.json",
				    requiresArg: true
			  }
    })
    .help().alias("help", "h")
    .version().alias("version", "v")
    .argv;

const defaultSettings: Partial<PrerenderSettings> = {
    dist: 'dist',
    template: 'index.html',
    seed: 'index.html',
    port: 8080,
};
export const prerenderConfig: PrerenderSettings = {
    ...defaultSettings,
    ...JSON.parse(fs.readFileSync(path.resolve(process.cwd(), args.config)).toString())
};
for (let field in prerenderConfig) {
    if (['dist', 'template', 'seed', 'bootstrap', 'appId', 'port', 'htmlSuffix'].indexOf(field) === -1)
        throw new Error(args.config + ': unrecognized field ' + field);
}
checkType(prerenderConfig, 'dist', 'string');
checkType(prerenderConfig, 'template', 'string');
checkType(prerenderConfig, 'seed', 'string');
checkArrayType(prerenderConfig, 'bootstrap', 'string');
checkType(prerenderConfig, 'appId', 'string');
checkType(prerenderConfig, 'port', 'number');
checkType(prerenderConfig, 'htmlSuffix', 'string', true);

function checkType(settings: any, field: string, type: string, optional = false) {
    if (optional && settings[field] == null)
        return;
    else if (settings[field] == null)
        throw new Error(args.config + ': ' + field + ' field is missing');
    if (!(typeof settings[field] === type))
        throw new Error(args.config + ': ' + field + ' must have a ' + type + ' value');
}

function checkArrayType(settings: any, field: string, type: string, optional = false) {
    if (optional && (settings[field] == null || (Array.isArray(settings[field] && settings[field].length === 0))))
        return;
    if (settings[field] == null)
        throw new Error(args.config + ': ' + field + ' field is missing');
    if (!Array.isArray(settings[field]))
        throw new Error(args.config + ': ' + field + ' must be an array');
    if (settings[field].length === 0)
        throw new Error(args.config + ': ' + field + ' must not be empty');
    for (let e of settings[field])
        if (!(typeof e === type))
            throw new Error(args.config + ': ' + field + ' must have ' + type + ' members only');
}
