import * as fs from 'fs-extra';
import * as path from 'path';
import * as tmp from 'tmp';
import * as yargs from 'yargs';
import { sync as globSync } from 'glob';
import { prerender, PrerenderSettings } from './prerender/prerender';
import { readConfig } from './prerender/cli';

describe('prerender cli', (() => {
    it('missing default config throws', (() => {
        expect(() => {
            yargs([]).argv;
            let settings = readConfig();
        }).toThrowError(/.* no such file or directory.*/);
    }));

    it('missing named config throws', (() => {
        expect(() => {
            yargs(['--config', 'doesnotexist.json']).argv;
            let settings = readConfig();
        }).toThrowError(/.* no such file or directory.*doesnotexist.json.*/);
    }));

    it('empty config not allowed', (() => {
        expect(() => {tryConfig({}); }).toThrowError(/.* field is missing.*/);
    }));

    it('unknown fields not allowed', (() => {
        expect(() => {tryConfig({unknown: 'xyz'}); }).toThrowError(/.* unrecognized field unknown.*/);
    }));

    it('default values substituted for unassigned fields', (() => {
        expect(JSON.stringify(tryConfig({
            bootstrap: ['boot-element'],
            appId: 'myApp',
        }))).toEqual(JSON.stringify({
            root: 'dist',
            template: 'index.html',
            seed: 'index.html',
            port: 8080,
            bootstrap: ['boot-element'],
            appId: 'myApp'
        }));
    }));

    it('required fields must be given', (() => {
        expect(() => {tryConfig({bootstrap: ['boot-element']}); }).toThrowError(/.* field is missing.*/);
    }));

    it('fields must have expected type', (() => {
        expect(() => {
            tryConfig({bootstrap: ['boot-element'],appId: 'myApp', port: 'wrong'}); }
        ).toThrowError(/.* must have a number value.*/);
    }));

    it('array type fields must have an array value', (() => {
        expect(() => {
            tryConfig({bootstrap: 'boot-element', appId: 'myApp'}); }
        ).toThrowError(/.* must be an array.*/);
    }));

    it('required array fields must not be empty', (() => {
        expect(() => {
            tryConfig({bootstrap: [], appId: 'myApp'}); }
        ).toThrowError(/.* must not be empty.*/);
    }));

    it('array field values must have correct type', (() => {
        expect(() => {
            tryConfig({bootstrap: [1, 2, 3], appId: 'myApp'}); }
        ).toThrowError(/.* must have string members only.*/);
    }));

    it('', (() => {

    }));

    function tryConfig(config: any) {
        yargs(['--config', writeConfig(config)]).argv;
        return readConfig();
    }

    function writeConfig(config: any) {
        let tmpFile = tmp.fileSync();
        fs.writeFileSync(tmpFile.name, JSON.stringify(config));
        return tmpFile.name;
    }
}));

describe('prerender rendering', (() => {
    const RENDER_TIMEOUT = 10000;
    const SRC_DIST = 'test/source/prerender/';
    const TRG_DIST = 'test/actual/prerender/';
    const EXP_DIST = 'test/expect/prerender/';
    const srcDir = path.resolve(process.cwd(), SRC_DIST);
    const targets = globSync(path.join(srcDir, '*/')).map(dir => path.basename(dir));
    for (let target of targets) {
        describe(target, (() => {
            const root = setUpTarget(target);
            const settings = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), SRC_DIST + target + '.json')).toString());
            settings.root = root;
            settings.port = 4000;
            it('rendering', ((done) => {
                prerender(settings).then(() => {
                    expectEqualDist(target);
                    done();
                }).catch(err => done.fail('rendering failed with error: ' + err));
            }), RENDER_TIMEOUT);
        }));
    }

    function expectEqualDist(resource: string) {
        const expectDir = path.resolve(process.cwd(), EXP_DIST + resource);
        const actualDir = path.resolve(process.cwd(), TRG_DIST + resource);
        const expectFiles = globSync(path.join(expectDir, '**/*'), {nodir: true}).map(file => path.relative(expectDir, file));
        const actualFiles = globSync(path.join(actualDir, '**/*'), {nodir: true}).map(file => path.relative(actualDir, file));
    
        const notExpected = expectFiles.filter(f => actualFiles.indexOf(f) === -1);
        const expectedButMissing = actualFiles.filter(f => expectFiles.indexOf(f) === -1);
        expect("missing files: [" + expectedButMissing + "]; unexpected files: [" + notExpected + "]")
            .toEqual("missing files: []; unexpected files: []");
        actualFiles.forEach(file => {
            const actualContent = fs.readFileSync(path.join(actualDir, file));
            const expectContent = fs.readFileSync(path.join(expectDir, file));
            expect(expectContent.equals(actualContent)).toBeTruthy('files differ: ' + file);
        });
    }
    
    function setUpTarget(resource: string) {
        const rootDir = path.resolve(process.cwd(), SRC_DIST + resource);
        const targetDir = path.resolve(process.cwd(), TRG_DIST + resource);
        const files = globSync(path.join(rootDir, '**/*.*')).map(file => path.relative(rootDir, file));
        fs.mkdirsSync(targetDir);
        fs.emptyDirSync(targetDir);
        files.forEach(file => {
            const target = path.resolve(targetDir, file);
            fs.mkdirsSync(path.dirname(target));
            fs.copyFileSync(path.resolve(rootDir, file), target);
        });
        return targetDir;
    }    
}));
