
import fs from "node:fs";
import {parse} from './parse.js'

`
3. render the html
	- map min, max to data-min, data-max
	- create a span element
4. render script
5. place in a template
`

import path from 'path'

const mangle = fs.readFileSync("examples/cookies.mangle", "utf8");
const {markup, code} = parse(mangle);

// get template
const html = fs.readFileSync(path.join(__dirname, 'tangle/example.html'));
const template = Handlebars.compile(html);

// get data
const data = {
	style: fs.readFileSync(path.join(__dirname, 'tangle/example.css'), 'utf8'),
	tangleKitStyle: fs.readFileSync(path.join(__dirname, 'tangle/TangleKit/TangleKit.css'), 'utf8'),
	markup,
	script: fs.readFileSync('dist/bundle.js', 'utf8')
}

// save
const output = template(data);
fs.writeFileSync('dist/document.html', output, 'utf8');