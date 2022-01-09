"use strict";
exports.__esModule = true;
var fs = require("node:fs");
var parse_js_1 = require("./parse.js");
"\n3. render the html\n\t- map min, max to data-min, data-max\n\t- create a span element\n4. render script\n5. place in a template\n";
var path = require("path");
var mangle = fs.readFileSync("examples/cookies.mangle", "utf8");
var _a = (0, parse_js_1.parse)(mangle), markup = _a.markup, code = _a.code;
var Handlebars = require("handlebars");
// render js
var jsSource = fs.readFileSync(path.join(__dirname, 'tangle/example.template.js'), 'utf8');
var jsTemplate = Handlebars.compile(jsSource);
var js = jsTemplate(code);
fs.writeFileSync(path.join(__dirname, 'tangle/example.js'), js, 'utf8');
