let links = [];
if (location.href.endsWith('index')) {
  links.push('link1');
  links.push('link2');
  links.push('link2/');
  links.push('link4/');
  links.push('/index/');
  links.push(location.href.substring(location.href.lastIndexOf('/')) + '#abc');
} else if (location.href.endsWith('link1')) {
    links.push('index');
    links.push('dir1/dir2/dir3/link3');
}
let html = '<ul>';
for (let link of links)
  html += '<li><a href="' + link + '">link</a></li>';
html += '</ul>';
document.querySelector('div[render-app]').innerHTML = html;
document.querySelector('div[render-app]').setAttribute('ng-version', '5.0.5');
