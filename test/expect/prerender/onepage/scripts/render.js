document.querySelector('div[render-app]').textContent = 'this is the rendered root element';
document.querySelector('div[render-app]').setAttribute('ng-version', '5.0.5');

var style = document.createElement('style');
style.textContent = 'div.some-class { color: blue; }';
document.querySelector('head').appendChild(style);
var script1 = document.createElement('script');
script1.type = 'text/javascript';
script1.textContent = 'console.log(\'added script1\');';
document.querySelector('head').appendChild(script1);
var script2 = document.createElement('script');
script2.type = 'text/javascript';
script2.textContent = 'console.log(\'added script2\');';
document.querySelector('body').appendChild(script2);
