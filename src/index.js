import fs from "node:fs";
import { parse } from "./parse.js";

import { dirname } from 'path';
import { fileURLToPath } from 'url';

import path from "path";
import Handlebars from "handlebars";

const __dirname = dirname(fileURLToPath(import.meta.url));

function build(mangleFile, outFile) {

	const mangle = fs.readFileSync(mangleFile, "utf8");
	const { markup, code } = parse(mangle);

	// render js
	const jsSource = fs.readFileSync(
		path.join(__dirname, "tangle/example.template.js"),
		"utf8"
	);
	const jsTemplate = Handlebars.compile(jsSource);
	const js = jsTemplate(code);
	fs.writeFileSync(path.join(__dirname, "tangle/example.js"), js, "utf8");


	// browserify

	import browserify from 'browserify'
	var b = browserify()
	b.add(path.join(__dirname, 'tangle/example.js'))
	var out = fs.createWriteStream('dist/bundle.js', 'utf8')
	b.bundle().pipe(out)

	out.on('finish', () => {

		// get template
		const html = fs.readFileSync(path.join(__dirname, 'tangle/example.template.html'), 'utf8');
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
		fs.writeFileSync(outFile, output, 'utf8');
	})
}

module.exports = {
	build
}