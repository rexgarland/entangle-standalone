"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.parse = exports.split = void 0;
var yaml = require("js-yaml");
var CoffeeScript = require("coffeescript");
var remark_1 = require("remark");
var remark_rehype_1 = require("remark-rehype");
function split(mangleText) {
    var _a = mangleText.split("\n---\n"), a = _a[0], b = _a[1], c = _a[2];
    var content = a;
    var config = yaml.load(b);
    var code = CoffeeScript.compile(c, { bare: true });
    return { content: content, config: config, code: code };
}
exports.split = split;
function findVariables(markdown) {
    return function (data) {
        for (var _i = 0, _a = markdown.matchAll(/\`[^`]*\$\{([^\}]+)\}[^`]*\`/g); _i < _a.length; _i++) {
            var match = _a[_i];
            var literal = match[0];
            var name_1 = match[1];
            data[name_1] = {
                literal: literal,
                location: [match.index, match.index + literal.length]
            };
        }
    };
}
function attachConfig(config) {
    return function (data) {
        for (var _i = 0, _a = Object.keys(config); _i < _a.length; _i++) {
            var variable = _a[_i];
            data[variable] = __assign(__assign({}, data[variable]), config[variable]);
        }
    };
}
function trimChars(chars) {
    return function (s) {
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
var TO_PREPEND_MAX = [
    "min",
    "max",
    "step",
    "format",
];
var TO_EXCLUDE = [
    "literal"
];
function renderContent(data) {
    return function (markdown) {
        // create spans
        var spans = {};
        Object.keys(data).forEach(function (varName) {
            var attrs = data[varName];
            var literal = trimChars('`')(attrs.literal);
            var innerHTML = literal.replace(/\$\{[^\}]+\}/, '');
            var attributes = {};
            Object.keys(attrs).forEach(function (attr) {
                var key = attr;
                if (TO_EXCLUDE.includes(attr)) {
                    return;
                }
                if (TO_PREPEND_MAX.includes(attr)) {
                    key = 'data-' + attr;
                }
                attributes[key] = attrs[attr];
            });
            var attributesString = Object.keys(attributes).map(function (key) { return "".concat(key, "=\"").concat(attributes[key], "\""); }).join(' ');
            spans[varName] = "<span ".concat(attributesString, ">").concat(innerHTML, "</span>");
            markdown = markdown.replace(/`\`[^`]*\$\{${varName}\}[^`]*\``/, spans[varName]);
        });
        return String((0, remark_1.remark)().use(remark_rehype_1["default"]).processSync(markdown));
    };
}
function renderCode(data) {
    return function (code) {
        var initialObj = {};
        Object.keys(data).filter(function (k) { return ('initial' in data[k]); }).forEach(function (k) {
            var d = data[k];
            initialObj[k] = d.initial;
        });
        var initial = 'const initial=' + JSON.stringify(initialObj);
        return { initial: initial, updater: code };
    };
}
function parse(mangle) {
    var data = {};
    var _a = split(mangle), content = _a.content, config = _a.config, code = _a.code;
    findVariables(content)(data);
    attachConfig(config)(data);
    var markup = renderContent(data)(content);
    var _b = renderCode(data)(code), initial = _b.initial, updater = _b.updater;
    return { markup: markup, code: { initial: initial, updater: updater } };
}
exports.parse = parse;
