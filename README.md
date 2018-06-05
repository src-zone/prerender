# Utilities for working with Angular CLI projects

This package currently contains one utility script: blx-transpile, which makes it possible to work with
es2015 (or newer) javascript imports in projects managed with Angular CLI.

## blx-transpile

If you want to build an Angular application for es5, Angular CLI has the
inconvenient limitation that you can't import Javascript sources that
use es2015 (or newer) syntax.

This utility makes it possible to create es5 compatible Angular applications,
even when you import third-party javascript code that uses es2015 (or newer)
syntax.

The blx-transpile script only works with Angular CLI 1.5.0 or later. So to get
started, install the latest Angular CLI for your project, and install this
utility:

```
npm install --save-dev @angular/cli @blox/ng-utils
```

Next in your package.json add/change the following scripts:

```
  "scripts": {
    ...
    "transpile": "blx-transpile --dir dist --verbose",
    "build": "ng build --prod && npm run transpile",
    ...
  },

```

What you just did:
* To create a build that is compatible with older browsers that don't support es2015 yet,
  we added a step to the build to transform the es2015 scripts to es5, and change the includes
  in the index.html to use those transpiled sources instead.

From now on, don't forget to use the npm goals `npm run start` and `npm run build`, instead
of calling `ng serve` and `ng build` for starting or building your app.

### options

| Option                   | Default              | Description                     |
| ------------------------ | -------------------- | ------------------------------- |
| `--dir PATH`             |                      | Specify the distribution directory to process |
| `--verbose`              | `false`              | Add extra output and show uglify warnings while processing files |
| `--keepOriginalScripts`  | `false`              | Keep the original es2015 bundles, don't delete them after the transformation |
| `--browsers`             |                      | Specify the browsers for which to transform the javascript sources. May result in smaller javascript bundles, when those browsers support parts of es2015 already. See http://browserl.ist/ for valid values and their meaning. You can also specify the browsers via config files, environment variables,  or via a `browserslist` option in your `package.json`, see [config browserslist](https://www.npmjs.com/package/browserslist#packagejson). Set this option to `ignore` to ignore all browserlist configuration and create javascript that is compatible with the largest set of browsers. |

## Quick Links

* [Instructions for using blx-transpile](https://blox.src.zone/material/guides/ie11)
* [Repository](https://github.com/src-zone/ng-utils)
* [Issues](https://github.com/src-zone/ng-utils/issues)
