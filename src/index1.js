import fs from "node:fs";
import {parse} from './parse.js'

import path from 'path'

const mangle = fs.readFileSync("examples/cookies.mangle", "utf8");
const {markup, code} = parse(mangle);

import Handlebars from 'handlebars'

// render js
const jsSource = fs.readFileSync(path.join(__dirname, 'tangle/example.template.js'), 'utf8');
const jsTemplate = Handlebars.compile(jsSource);
const js = jsTemplate(code)
fs.writeFileSync(path.join(__dirname, 'tangle/example.js'), js, 'utf8')

