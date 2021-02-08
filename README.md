# ✨ Pre-render your SPA

Pre-renders a Single Page web Application (SPA) into static HTML pages. This utility crawls your SPA, and saves the prerendered HTML for each location of the SPA. Advantages of pre-rendering an SPA:
* Improves **SEO**. By storing pre-rendered HTML for each location (url) of your website, SEO will improve for search engines that are not (always) able to execute (all) Javascript while indexing your site (Google, Bing, DuckDuckGo, ...).
* Improves **performance**: The full HTML for all prerendered locations (URL's) of your website is available directly after the loading of the HTML, before all Javascript is executed. Website visitors spend less time waiting for the first content to appear (as it apeears immediately) when they load your website.

## 👓 Examples

* The [Blox Material Documentation](https://material.src.zone/) website is prerendered with `prerender`. The config file used for the `prerender`: [prerender.conf.json](https://github.com/src-zone/material/blob/master/site/prerender.conf.json).

## 📖 Documentation TODOs
* Describe limitations and usecases
* Compare with Server Side Rendering and explain when to use one over the other

## 💡 Usage

```
$ prerender --help

prerender: prerender your spa sites for speed & seo!

Options:
      --config   Path to the config file
                                       [string] [default: "prerender.conf.json"]
  -h, --help     Show help                                             [boolean]
  -v, --version  Show version number                                   [boolean]
```

All configuration is handled in the json config file, with a default name of `prerender.conf.json`.

## ⚙️ Configuration

The default prerender configuration file is:

```json
{
    "root": "dist",
    "template": "index.html",
    "seed": ["index.html"],
    "transition": "blx-transition",
    "port": 8080
}
```

The config can be tuned with the following settings:

| Field            | Type     | Default  | Documentation |
| ---              | ---      | ---      | --- |
| `root`           | `string`   | `"dist"` | The root directory for the website. Typically the `dist` folder when building an SPA web application. |
| `template`       | `string`   | `"index.html"` | The HTML file that bootstraps the web application. Typically `index.html`. This should refer to the filename as it is stored in the `root` folder. *Not* the name of the file as used in the browser url. |
| `seed`           | `string[]` |`["index.html"]` | The url(s) to start the prerender from (i.e. the crawl seeds). Typically `"/"` or `"index"` or `\"index.html"`.  |
| `bootstrap`      | `string[]` | | CSS selector for the HTML element(s) on the page that contain (and bootstrap) the web application. Thus the element(s) that are not yet fully rendered in the original `template`, but will be after the Javascript code has executed in the browser. In an Angular application this is the selector of the bootstrap component of the application. Prerender records the changes to matching elements, and the changes to the `HEAD` section of each page. All other chenges are ignored, when creating the static HTML. |
| `transition`     | `string`   | `blx-transition` | Many SPA's do not only render a part of the document body (the element indicated with the `bootstrap` option) in the browser. They will also add or update elements to the `HEAD` section of the html. A web application may e.g. add `STYLE` tags, or update `META` tags for different url's of the SPA. The prerender utility will add the attribute provided in this option to all `HEAD` elements that were dynamically added to the page. This allows for a run-time transition, in which the the web-application removes elements with these tags, to undo changes made during the prerender. This can be an attribute name or an attribute name followed by an equals sign, followed by a value. E.g. `blx-transition`, or `blx-transition=my-app`. For angular applications you should set this to e.g. `"ng-transition=my-app"`, and then add the `BrowserModule` as `BrowserModule.withServerTransition({appId: 'my-app'})` to your `NgModule` imports. |
| `port`           | `number`   | `8080` |  The port to use for the server while prerendering your site. The default is 8080, but any valid open port will do. |
| `htmlSuffix`     | `string`   | | Suffix to add to generated pages. This option should be used if your webserver is configured to serve requests for page urls by adding e.g. an `".html"` suffix. When set to `".html"`, this will store page `a/b/name` as `a/b/name.html`. |
| `directoryIndex` | `string`   | | Sets the file that will be used for page urls that end with a `/`. Thus page `a/b/` will be stored as a file under the name directoryIndex in the `a/b` directory. If not set, the page will be stored under the name of the directory with the htmlSuffix added. So when directoryIndex is not set, and htmlSuffix = `.html`, page `a/b/` will be stored under `a/b.html`. If directoryIndex is set to `index.html`, the same page would be stored as `a/b/index.html`. |
