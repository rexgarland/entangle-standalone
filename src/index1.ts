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

const mangle = fs.readFileSync("examples/cookies.mangle", "utf8");
const {markup, code} = parse(mangle);

import * as Handlebars from 'handlebars'

// render js
const jsSource = fs.readFileSync(path.join(__dirname, 'tangle/example.template.js'), 'utf8');
const jsTemplate = Handlebars.compile(jsSource);
const js = jsTemplate(code)
fs.writeFileSync(path.join(__dirname, 'tangle/example.js'), js, 'utf8')

