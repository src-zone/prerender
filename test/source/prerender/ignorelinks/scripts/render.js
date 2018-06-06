let links = [];
links.push('javascript:void(0)');
links.push('javascript:window.history.back()');
let html = '';
for (let link of links)
  html += '<a href="' + link + '">link</a><br/>\n';
document.querySelector('div[render-app]').innerHTML = html;
