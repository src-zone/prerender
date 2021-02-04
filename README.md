# Prerender your SPA

An Single Page Application prerenderer to generate static HTML pages for each URL of the SPA.
This utility crawls your SPA, and saves the prerendered HTML for each location of the SPA.

Advantages of prerendering an SPA:
* By storing the prerendered HTML for each location, SEO will improve. Many search engine indexers are very limited in being able to execute javascript and index the full content of each location. Prerender solves that issue, since it serves each page with fully rendered HTML.
* Performance improvement: The HTML content of your SPA is available before all Javascript is executed. Website visitors spend less time waiting for the first content to appear (as it apeears immediately) when they load your website.

# Documentation TODOs
* Describe limitations and usecases
* Compare with Server Side Rendering and explain when to use one over the other
* Instructions for usage with Angular and Vue.
* Document prerender.conf and the command line
