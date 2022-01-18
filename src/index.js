import fs from "node:fs";
import { parse } from "./parse.js";

import { dirname } from 'path';
import { fileURLToPath } from 'url';

import path from "path";
import Handlebars from "handlebars";

import browserify from 'browserify'
import tempy from 'tempy'

const __dirname = dirname(fileURLToPath(import.meta.url));

export default function entangle(entangleFile, outFile) {

	const entangle = fs.readFileSync(entangleFile, "utf8");
	const { markup, code } = parse(entangle);

	// render js
	const jsSource = fs.readFileSync(
		path.join(__dirname, "../templates/example.template.js"),
		"utf8"
	);
	const jsTemplate = Handlebars.compile(jsSource);
	const js = jsTemplate(code);
	fs.writeFileSync(path.join(__dirname, "tangle/example.js"), js, "utf8");


	// browserify
	var bundleFile = tempy.file()
	var b = browserify()
	b.add(path.join(__dirname, 'tangle/example.js'))
	var out = fs.createWriteStream(bundleFile, 'utf8')
	b.bundle().pipe(out)

	out.on('finish', () => {

		// get template
		const html = fs.readFileSync(path.join(__dirname, '../templates/example.template.html'), 'utf8');
		const template = Handlebars.compile(html);

		// get data
		const data = {
			markup,
			script: fs.readFileSync(bundleFile, 'utf8')
		}

		// save
		const output = template(data);
		fs.writeFileSync(outFile, output, 'utf8');
	})
}