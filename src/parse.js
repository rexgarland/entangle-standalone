import yaml from "js-yaml";
import CoffeeScript from "coffeescript";
import { remark } from "remark";
import remarkRehype from "remark-rehype";
import { VFile } from "vfile";

export function split(mangleText) {
	const [a, b, c] = mangleText.split("\n---\n");
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
		while (chars.includes(out[0])) {
			out = out.slice(1);
		}
		while (chars.includes(out[out.length - 1])) {
			out = out.slice(out.length - 1, out.length);
		}
		return out;
	};
}

const TO_PREPEND_MAX = ["min", "max", "step", "format"];

const TO_EXCLUDE = ["literal"];

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
			spans[varName] = `<span ${attributesString}>${innerHTML}</span>`;
			markdown = markdown.replace(
				/`\`[^`]*\$\{${varName}\}[^`]*\``/,
				spans[varName]
			);
		});
		return String(remark().use(remarkRehype).processSync(markdown));
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
		return { initial, updater };
	};
}

export function parse(mangle) {
	var data = {};
	const { content, config, code } = split(mangle);
	findVariables(content)(data);
	attachConfig(config)(data);
	const markup = renderContent(data)(content);
	const { initial, updater } = renderCode(data)(code);
	return { markup, code: { initial, updater } };
}
