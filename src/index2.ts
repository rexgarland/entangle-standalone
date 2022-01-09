import * as fs from "node:fs";
import {parse} from './parse.js'

`
3. render the html
	- map min, max to data-min, data-max
	- create a span element
4. render script
5. place in a template
`

import * as path from 'path'
import * as browserify from 'browserify'

const mangle = fs.readFileSync("examples/cookies.mangle", "utf8");
const {markup, code} = parse(mangle);

import * as Handlebars from 'handlebars'

// render js
const jsSource = fs.readFileSync(path.join(__dirname, 'tangle/example.template.js'), 'utf8');
const jsTemplate = Handlebars.compile(jsSource);
const js = jsTemplate(code)
fs.writeFileSync(path.join(__dirname, 'tangle/example.js'), js, 'utf8')

// bundle it
var b = browserify();
b.add(path.join(__dirname, 'tangle/example.js'));
// browserify src/tangle/example.js -o dist/bundle.js
const bundleFs = fs.createWriteStream('dist/bundle.js', 'utf8')

bundleFs.on('error', () => {
	console.log('there was an error')
})

bundleFs.on('close', () => {
	console.log('there was an close')
})

bundleFs.on('end', () => {

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

	process.exit(0)

})

b.bundle().pipe(bundleFs)

