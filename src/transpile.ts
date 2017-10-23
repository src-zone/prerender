import * as fs from 'fs';
import * as path from 'path';
import { sync as globSync } from 'glob';
import * as babel from 'babel-core';
const uglify = require('uglify-es');
const replace = require('buffer-replace');

// read arguments:
let verbose = false;
let keepOriginalScripts = false;
let dir: string | null = null;
let skipUglify = false;

// default babel options:
let babelOptions: babel.TransformOptions = {
    compact: true,
    comments: false,
    minified: true,
    babelrc: false,
    presets: ['env']
};

// default uglify options:
let uglifyOptions = {
    ecma: 5,  // never transfrom existing es5 into es6+ code
    warnings: verbose ? 'verbose' : false,
    ie8: false,
    mangle: true,
    compress: true,
    output: {
        ascii_only: true,
        comments: false
    }
};

function validateHasNextArgument(args: string[], index: number, option: string, message: string) {
    if ((index + 1) >= args.length) {
        throw new Error('ng-transpile option ' + option + ' ' + message);
    }
    return args[index + 1];
}

let options = false;
for (let index = 0; index < process.argv.length; ++index) {
    let val = process.argv[index];
    if (val === '--verbose') {
        verbose = true;
    } else if (val === '--keepOriginalScripts') {
        keepOriginalScripts = true;
    } else if (val == '--dir') {
        dir = validateHasNextArgument(process.argv, index++, '--dir', 'not followed by directory');
    } else if (val == '--browsers') {
        const argument = validateHasNextArgument(process.argv, index++, '--browsers', 'not followed by browserslist');
        if (argument.trim() === 'ignore') {
            babelOptions.presets = [['env', {ignoreBrowserslistConfig: true}]];
        } else {
            babelOptions.presets = [['env', {targets: {browsers: argument.split(',').map(query => query.trim())}}]];
        }
    } else if (options) {
        throw new Error('ng-transpile unrecognized option: ' + val);
    } else {
        options = val.indexOf('ng-transpile') !== -1;
    }
}

if (!dir) {
    throw new Error('ng-transpile missing --dir option for source directory');
}

// path of rootDir:
const rootDir = path.resolve(process.cwd(), dir);

// get a list of all javascript scripts that must be transpiled:
const jsSources = globSync(path.join(rootDir, '*.bundle.js')).map(js => path.basename(js));
const htmlSources = globSync(path.join(rootDir, '*.html')).map(js => path.basename(js));

function getTranspiledName(name: string) {
    return name.replace(/\.js$/, '.es5.js');
}

function quoteRegexp(str: string) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
}

// transpile sources:
jsSources.forEach((name: string) => {
    if (verbose) {
        process.stdout.write('transpiling ' + (skipUglify ? '' : 'and minifying ') + name + ' to: ' + getTranspiledName(name));
    }
    let output = babel.transformFileSync(path.join(rootDir, name), babelOptions).code;
    if (!output) {
        process.stdout.write(' [failed]\n');
        throw Error('transpilation failed');
    }
    if (!skipUglify) {
        const uglified = uglify.minify(output, uglifyOptions);
        const error = (<any>uglified).error;
        if (error) {
            process.stdout.write(' [failed]\n');            
            throw new Error('Uglify error: ' + error);
        }
        output = uglified.code;
    }
    fs.writeFileSync(path.join(rootDir, getTranspiledName(name)), output);
    if (verbose) {
        process.stdout.write(' [done]\n');
    }
});

// adapt html to include the transpiled scripts:
htmlSources.forEach((name: string) => {
    if (verbose) {
        process.stdout.write('adapting ' + name + ' to use transpiled sources');
    }
    let source = fs.readFileSync(path.join(rootDir, name));
    jsSources.forEach((jsName: string) => {
        source = replace(source, jsName, getTranspiledName(jsName));
    });
    fs.writeFileSync(path.join(rootDir, name), source);
    if (verbose) {
        process.stdout.write(' [done]\n');        
    }
});

// delete original scripts:
if (!keepOriginalScripts) {
    jsSources.forEach((name: string) => {
        fs.unlinkSync(path.join(rootDir, name));
        if (verbose) {
            process.stdout.write('deleted: ' + name + '\n');
        }            
    });
}
