import * as yaml from "js-yaml";
import * as CoffeeScript from 'coffeescript'
import { remark } from 'remark'
import remarkRehype from 'remark-rehype'
import { VFile } from 'vfile'


interface VariableRaw {
	format?: string
	[key: string]: any
}

interface InputVariableRaw extends VariableRaw {
	class: string
	min?: number
	max?: number
	initial: number
}

interface Config {
	[key: string]: InputVariableRaw | VariableRaw
}

interface ParserOutput {
	content: string
	config: Config
	code: string
}

export function split(mangleText: string): ParserOutput {
	const [a, b, c] = mangleText.split("\n---\n");
	const content = a;
	const config = yaml.load(b) as Config;
	const code = CoffeeScript.compile(c, { bare: true });
	return { content, config, code }
}

interface Variable extends VariableRaw {
	literal: string
	location: [number, number]
}

interface InputVariable extends Variable, InputVariableRaw { }

interface Data {
	[key: string]: Variable
}

function findVariables(markdown: string) {
	return (data: Data) => {
		for (var match of markdown.matchAll(/\`[^`]*\$\{([^\}]+)\}[^`]*\`/g)) {
			const literal = match[0]
			const name = match[1]
			data[name] = {
				literal,
				location: [match.index as number, (match.index as number) + literal.length]
			}
		}
	}
}

function attachConfig(config: Config) {
	return (data: Data) => {
		for (const variable of Object.keys(config)) {
			data[variable] = {
				...data[variable],
				...config[variable]
			}
		}
	}
}

function trimChars(chars: string) {
	return (s: string) => {
		var out = s
		while (chars.includes(out[0])) {
			out = out.slice(1)
		}
		while (chars.includes(out[out.length - 1])) {
			out = out.slice(out.length - 1, out.length)
		}
		return out
	}
}

const TO_PREPEND_MAX = [
	"min",
	"max",
	"step",
	"format",
]

const TO_EXCLUDE = [
	"literal"
]

function renderContent(data: Data) {
	return (markdown: string): string => {
		// create spans
		const spans: { [key: string]: any } = {}
		Object.keys(data).forEach(varName => {
			const attrs = data[varName]
			const literal = trimChars('`')(attrs.literal)
			const innerHTML = literal.replace(/\$\{[^\}]+\}/, '')
			const attributes: { [key: string]: string } = {}
			Object.keys(attrs).forEach(attr => {
				var key = attr
				if (TO_EXCLUDE.includes(attr)) {
					return
				}
				if (TO_PREPEND_MAX.includes(attr)) {
					key = 'data-' + attr
				}
				attributes[key] = attrs[attr]
			})
			const attributesString = Object.keys(attributes).map(key => `${key}="${attributes[key]}"`).join(' ')
			spans[varName] = `<span ${attributesString}>${innerHTML}</span>`
			markdown = markdown.replace(/`\`[^`]*\$\{${varName}\}[^`]*\``/, spans[varName])
		})
		return String(remark().use(remarkRehype).processSync(markdown))
	}
}

function renderCode(data: Data) {
	return (code: string) => {
		const initialObj: { [key: string]: any } = {}
		Object.keys(data).filter(k => ('initial' in data[k])).forEach(k => {
			const d = data[k] as InputVariable
			initialObj[k] = d.initial
		})
		const initial = 'const initial=' + JSON.stringify(initialObj)
		return { initial, updater: code }
	}

}

export function parse(mangle: string) {
	var data = {}
	const { content, config, code } = split(mangle)
	findVariables(content)(data)
	attachConfig(config)(data)
	const markup = renderContent(data)(content)
	const {initial, updater} = renderCode(data)(code)
	return { markup, code: {initial, updater} }
}