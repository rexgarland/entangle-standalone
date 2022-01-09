const fs = require('fs');
const path = require('path');

const Handlebars = require("handlebars");

// get template
const html = fs.readFileSync(path.join(__dirname, 'example.html'), 'utf8');
const template = Handlebars.compile(html);

// get data
const data = {
	style: fs.readFileSync(path.join(__dirname, 'example.css'), 'utf8'),
	tangleKitStyle: fs.readFileSync(path.join(__dirname, 'TangleKit/TangleKit.css'), 'utf8'),
	markup: fs.readFileSync(path.join(__dirname, 'markup.html'))
	script: fs.readFileSync('dist/bundle.js', 'utf8')
}

// save
const output = template(data);
fs.writeFileSync('dist/document.html', output, 'utf8');

