import * as fs from 'fs-extra';
import * as path from 'path';
import { sync as globSync } from 'glob';
import { prerender, PrerenderSettings } from './prerender/prerender';

const RENDER_TIMEOUT = 10000;
const SRC_DIST = 'test/source/prerender/';
const TRG_DIST = 'test/actual/prerender/';
const EXP_DIST = 'test/expect/prerender/';

describe('ng-prerender', function() {
    const srcDir = path.resolve(process.cwd(), SRC_DIST);
    const targets = globSync(path.join(srcDir, '*/')).map(dir => path.basename(dir));
    for (let target of targets) {
        describe(target, function() {
            const dist = setUpTarget(target);
            const settings = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), SRC_DIST + target + '.json')).toString());
            settings.dist = dist;
            settings.port = 4000;
            it('rendering', function(done) {
                prerender(settings).then(() => {
                    expectEqualDist(target);
                    done();
                }).catch(err => done.fail('rendering failed with error: ' + err));
            }, RENDER_TIMEOUT);
        });
    }
});

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
