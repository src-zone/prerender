import * as puppeteer from 'puppeteer';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as express from 'express';
import * as chalk from 'chalk';

// Settings:
export interface PrerenderSettings {
    dist: string,
    template: string,
    seed: string,
    bootstrap: string[],
    appId: string,
    port: number,
    htmlSuffix?: string
}

// Data accumulated during rendering:
interface RenderScope {
    todoPages: Set<string>,
    donePages: Set<string>,
    browser: puppeteer.Browser,
    settings: PrerenderSettings,
    templateFile: string,
    templateContent: string,
    originalTemplateContent: string,
    host: string
}

const log = console.log;

export async function prerender(settings: PrerenderSettings) {
    let renderScope = await initializeRenderScope(settings);

    let templateRenderedContent: string | null = null;
    // During the rendering any request for the template should return
    // the template as created by createTemplate. After the rest of the site
    // is rendererd, we will overwrite this with the actual rendered content:
    fs.writeFileSync(renderScope.templateFile, renderScope.templateContent);

    const server = startServer(renderScope);
    const page = await renderScope.browser.newPage();
    page.setViewport({ width: 1200, height: 900 });

    do {
        templateRenderedContent = await renderNextPage(renderScope, page, templateRenderedContent);
    } while (renderScope.todoPages.size !== 0)

    // Closes browser & server:
    await page.close();
    await renderScope.browser.close();
    server.close();

    if (templateRenderedContent) {
        fs.writeFileSync(renderScope.templateFile, templateRenderedContent);
        log(chalk.default.green(`Overwrite seed template: ${renderScope.templateFile}`));
    } else {
        fs.writeFileSync(renderScope.templateFile, renderScope.originalTemplateContent);
        log(chalk.default.green(`Seed template is not a (linked) page, overwriting with original content: ${renderScope.templateFile}`));        
    }
}

async function renderNextPage(renderScope: RenderScope, page: puppeteer.Page, templateRenderedContent: string | null) {
    const pagePath = renderScope.todoPages.values().next().value;
    await page.goto(`${renderScope.host}/${pagePath}`);

    // Get the html for the page:
    const ext = renderScope.settings.htmlSuffix ? renderScope.settings.htmlSuffix : '';
    const file = path.join(renderScope.settings.dist, pagePath + ext);
    
    let content: string = await page.content();
    harvestNewLinks(renderScope, pagePath, page);
    content = await rewriteHead(content, renderScope.settings, renderScope.browser);
    content = await rewriteBody(content, renderScope.templateContent, renderScope.settings, renderScope.browser);

    const dir = path.dirname(file);
    fs.mkdirsSync(dir);
    if (file.toLowerCase() !== renderScope.templateFile.toLowerCase()) {
        fs.writeFileSync(file, content);
        log(chalk.default.green(`Rendered: ${file}`));
    } else {// render at the end, since it will overwrite the template
        log(chalk.default.green(`Rendered: ${file} (not written yet since this is also the seed template)`));
        templateRenderedContent = content;
    }

    // Compute new todoPages & donePages:
    renderScope.donePages.add(pagePath);
    renderScope.todoPages.delete(pagePath);

    return templateRenderedContent;
}

async function harvestNewLinks(renderScope: RenderScope, pagePath: string, page: puppeteer.Page) {
    let hrefs: string[] = await page.evaluate(/* istanbul ignore next */() => {
        let elms = (<any>document).querySelectorAll('a[href]');
        let hrefs = [];
        for (let i = 0; i != elms.length; ++i)
            hrefs.push(elms.item(i).getAttribute('href'));
        return hrefs;
    });
    hrefs
        .filter(h => h != null)
        .map(h => h.startsWith(renderScope.host) ? h.substring(renderScope.host.length) : h)
        .map(h => h.indexOf('#') !== -1 ? h.substring(0, h.indexOf('#')) : h)
        .filter(h => h.indexOf("://") == -1)
        .map(h => h.trim())
        .filter(h => h.length > 0)
        .map(h => pathFromRoot(pagePath, h)).forEach(s => {
            if (!renderScope.donePages.has(s) && !renderScope.todoPages.has(s))
                renderScope.todoPages.add(s);
        });
}

function pathFromRoot(pagePath: string, linkPath: string) {
    if (linkPath.startsWith('/')) {
        while (linkPath.startsWith('/')) linkPath = linkPath.substring(1);
        return linkPath;
    }
    let idx = pagePath.lastIndexOf('/');
    let currentPath = (idx == -1) ? '' : pagePath.substring(0, idx);
    while (linkPath.startsWith('../')) {
        if (currentPath.length > 0) {
            idx = currentPath.lastIndexOf('/');
            currentPath = (idx == -1) ? '' : pagePath.substring(0, idx);
        }
        linkPath = linkPath.substring(3);
    }
    let result = currentPath.length ? (currentPath + '/' + linkPath) : linkPath;
    return result;
}

async function initializeRenderScope(settings: PrerenderSettings) {
    // Getting the html content for the default html to bootstrap pages:
    const templateFile = path.join(settings.dist, settings.template);
    const originalTemplateContent = fs.readFileSync(templateFile).toString();
    const browser = await puppeteer.launch();    
    return {
        todoPages: new Set([settings.seed]),
        donePages: new Set<string>(),
        browser: browser,
        settings: settings,
        templateFile: templateFile,
        templateContent: await createTemplate(originalTemplateContent, browser),
        originalTemplateContent: originalTemplateContent,
        host: `http://localhost:${settings.port}`
    }
}

async function createTemplate(originalContent: string, browser: any): Promise<string> {
    let page = await browser.newPage();
    await page.setJavaScriptEnabled(false);
    await page.setContent(originalContent);
    await page.evaluate(/* istanbul ignore next */() => {
        let elms = (<any>document).querySelectorAll('head > *');
        for (let i = 0; i != elms.length; ++i)
            elms[i].setAttribute('ng-tsz-prerender', 'source');
    });
    const result = await page.content();
    page.close();
    return result;
}

async function rewriteHead(content: string, settings: PrerenderSettings, browser: any): Promise<string> {
    let page = await browser.newPage();
    await page.setJavaScriptEnabled(false);
    await page.setContent(content);
    await page.evaluate(/* istanbul ignore next */(appId: string) => {
        let elms = (<any>document).querySelectorAll('head > *');
        for (let i = 0; i != elms.length; ++i) {
            if (elms[i].getAttribute('ng-tsz-prerender') === 'source')
                elms[i].removeAttribute('ng-tsz-prerender')
            else if (elms[i].tagName === 'STYLE' && appId)
                elms[i].setAttribute('ng-transition', appId);
            else
                elms[i].parentElement.removeChild(elms[i]);
        }
    }, settings.appId);
    const result = await page.content();
    page.close();
    return result;
}

async function rewriteBody(content: string, templateContent: string, settings: PrerenderSettings, browser: any): Promise<string> {
    let pageTarget = await browser.newPage();
    let pageTemplate = await browser.newPage();
    await pageTarget.setJavaScriptEnabled(false);
    await pageTemplate.setJavaScriptEnabled(false);
    await pageTarget.setContent(content);
    await pageTemplate.setContent(templateContent);
    let templateBody = await pageTemplate.evaluate(/* istanbul ignore next */() => document.body.outerHTML);
    let app = await pageTarget.evaluate(/* istanbul ignore next */(selector: string) => {
        let elm = document.querySelector(selector);
        return elm ? elm.outerHTML : null
    }, settings.bootstrap[0]);
    await pageTarget.evaluate(/* istanbul ignore next */(body: string, selector: string, app: string) => {
        let headCnt = document.querySelectorAll('head').length;
        document.body.outerHTML = body;
        // replacing body outerHTML for some reason adds a second head element, remove it:
        let heads = document.querySelectorAll('head');
        for (let i = headCnt; i < heads.length; ++i)
            heads[i].parentElement!.removeChild(heads[i]);
        let elm = document.querySelector(selector);
        if (elm)
            elm.outerHTML = app;
    }, templateBody, settings.bootstrap[0], app);
    const result = await pageTarget.content();
    pageTarget.close();
    pageTemplate.close();
    return result;
}

function startServer(renderScope: RenderScope) {
    const app = express();
    // Serve static files as is:
    app.get('*.*', express.static(renderScope.settings.dist));
    // Serve templateContent for any other request:
    app.get('*', (_, res) => res.send(renderScope.templateContent));
    // Start the express server:
    const server = app.listen(renderScope.settings.port);
    log(chalk.default.green(`Prerender server started and listening at ${renderScope.host}`));
    return server;
}
