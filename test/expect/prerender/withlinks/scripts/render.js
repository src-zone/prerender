let links = [];
if (location.href.endsWith('index.html')) {
  links.push('link1.html');
  links.push('link2.html');
  links.push(location.href.substring(location.href.lastIndexOf('/')) + '#abc');
} else if (location.href.endsWith('link1.html')) {
    links.push('index.html');
    links.push('dir1/dir2/dir3/link3.html');
    links.push('link4.html');
} else if (location.href.endsWith('link3.html')) {
    links.push('../../link5.html');
    links.push('../../../link4.html');
    links.push('../../../../../link4.html');    
} else {
    links.push('#index');
    links.push('#aap.html');
    links.push(location.href + '#abc');
}
let html = '<ul>';
for (let link of links)
  html += '<li><a href="' + link + '">link</a></li>';
html += '</ul>';
document.querySelector('div[render-app]').innerHTML = html;
document.querySelector('div[render-app]').setAttribute('ng-version', '5.0.5');
