import yaml from "js-yaml";
import CoffeeScript from "coffeescript";
import { remark } from "remark";
import remarkRehype from "remark-rehype";
import rehypeStringify from 'rehype-stringify'
import { VFile } from "vfile";

import { dirname } from 'path';
import { fileURLToPath } from 'url';
import Handlebars from "handlebars";

const __dirname = dirname(fileURLToPath(import.meta.url));

export function split(entangleText) {
	const [a, b, c] = entangleText.split("\n---\n");
	const content = a;
	const config = yaml.load(b);
	const code = CoffeeScript.compile(c, { bare: true });
	return { content, config, code };
}

function findVariables(markdown) {
	return (data) => {
		for (var match of markdown.matchAll(/\`[^`]*\$\{([^\}]+)\}[^`]*\`/g)) {
			const literal = match[0];
			const name = match[1];
			data[name] = {
				literal,
				location: [match.index, match.index + literal.length],
			};
		}
	};
}

function attachConfig(config) {
	return (data) => {
		for (const variable of Object.keys(config)) {
			data[variable] = {
				...data[variable],
				...config[variable],
			};
		}
	};
}

function trimChars(chars) {
	return (s) => {
		var out = s;
		while (out.length>0 && chars.includes(out[0])) {
			out = out.slice(1);
		}
		while (out.length>0 && chars.includes(out[out.length - 1])) {
			out = out.slice(0, out.length - 1);
		}
		return out;
	};
}

const TO_PREPEND_MAX = ["min", "max", "step", "format"];

const TO_EXCLUDE = ["literal", "location","initial"];

function renderContent(data) {
	return (markdown) => {
		// create spans
		const spans = {};
		Object.keys(data).forEach((varName) => {
			const attrs = data[varName];
			const literal = trimChars("`")(attrs.literal);
			const innerHTML = literal.replace(/\$\{[^\}]+\}/, "");
			const attributes = {};
			Object.keys(attrs).forEach((attr) => {
				var key = attr;
				if (TO_EXCLUDE.includes(attr)) {
					return;
				}
				if (TO_PREPEND_MAX.includes(attr)) {
					key = "data-" + attr;
				}
				attributes[key] = attrs[attr];
			});
			const attributesString = Object.keys(attributes)
				.map((key) => `${key}="${attributes[key]}"`)
				.join(" ");
			spans[varName] = `<span data-var="${varName}" ${attributesString}>${innerHTML}</span>`;
			markdown = markdown.replace(
				new RegExp(`\`[^\`]*\\$\\{${varName}\\}[^\`]*\``),
				// spans[varName]
				`\{\{\{${varName}\}\}\}`
			);
		});

		var markup = String(remark().use(remarkRehype).use(rehypeStringify).processSync(markdown));
		const template = Handlebars.compile(markup)
		var markup = template(spans)

		return markup
	};
}

function renderCode(data) {
	return (code) => {
		const initialObj = {};
		Object.keys(data)
			.filter((k) => "initial" in data[k])
			.forEach((k) => {
				const d = data[k];
				initialObj[k] = d.initial;
			});
		const initial = "const initial=" + JSON.stringify(initialObj);
		return { initial, updater: code.replace(/update/g,'updater') };
	};
}

export function parse(entangle) {
	var data = {};
	const { content, config, code } = split(entangle);
	findVariables(content)(data);
	attachConfig(config)(data);
	const markup = renderContent(data)(content);
	const { initial, updater } = renderCode(data)(code);
	return { markup, code: { initial, updater } };
}
