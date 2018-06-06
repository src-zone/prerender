let links = [];
if (location.href.endsWith('4000/')) {
  links.push('link1');
  links.push('link2');
  links.push('link2/');
  links.push('dir1/dir2/dir3/link3/');
  links.push('link4/');
  links.push('/index/');
}
let html = '<ul>';
for (let link of links)
  html += '<li><a href="' + link + '">link</a></li>';
html += '</ul>';
document.querySelector('div[render-app]').innerHTML = html;
document.querySelector('div[render-app]').setAttribute('ng-version', '5.0.5');
