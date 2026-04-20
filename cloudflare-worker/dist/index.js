var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// node_modules/turndown/lib/turndown.browser.es.js
function extend(destination) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];
    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) destination[key] = source[key];
    }
  }
  return destination;
}
__name(extend, "extend");
function repeat(character, count) {
  return Array(count + 1).join(character);
}
__name(repeat, "repeat");
function trimLeadingNewlines(string) {
  return string.replace(/^\n*/, "");
}
__name(trimLeadingNewlines, "trimLeadingNewlines");
function trimTrailingNewlines(string) {
  var indexEnd = string.length;
  while (indexEnd > 0 && string[indexEnd - 1] === "\n") indexEnd--;
  return string.substring(0, indexEnd);
}
__name(trimTrailingNewlines, "trimTrailingNewlines");
function trimNewlines(string) {
  return trimTrailingNewlines(trimLeadingNewlines(string));
}
__name(trimNewlines, "trimNewlines");
var blockElements = ["ADDRESS", "ARTICLE", "ASIDE", "AUDIO", "BLOCKQUOTE", "BODY", "CANVAS", "CENTER", "DD", "DIR", "DIV", "DL", "DT", "FIELDSET", "FIGCAPTION", "FIGURE", "FOOTER", "FORM", "FRAMESET", "H1", "H2", "H3", "H4", "H5", "H6", "HEADER", "HGROUP", "HR", "HTML", "ISINDEX", "LI", "MAIN", "MENU", "NAV", "NOFRAMES", "NOSCRIPT", "OL", "OUTPUT", "P", "PRE", "SECTION", "TABLE", "TBODY", "TD", "TFOOT", "TH", "THEAD", "TR", "UL"];
function isBlock(node) {
  return is(node, blockElements);
}
__name(isBlock, "isBlock");
var voidElements = ["AREA", "BASE", "BR", "COL", "COMMAND", "EMBED", "HR", "IMG", "INPUT", "KEYGEN", "LINK", "META", "PARAM", "SOURCE", "TRACK", "WBR"];
function isVoid(node) {
  return is(node, voidElements);
}
__name(isVoid, "isVoid");
function hasVoid(node) {
  return has(node, voidElements);
}
__name(hasVoid, "hasVoid");
var meaningfulWhenBlankElements = ["A", "TABLE", "THEAD", "TBODY", "TFOOT", "TH", "TD", "IFRAME", "SCRIPT", "AUDIO", "VIDEO"];
function isMeaningfulWhenBlank(node) {
  return is(node, meaningfulWhenBlankElements);
}
__name(isMeaningfulWhenBlank, "isMeaningfulWhenBlank");
function hasMeaningfulWhenBlank(node) {
  return has(node, meaningfulWhenBlankElements);
}
__name(hasMeaningfulWhenBlank, "hasMeaningfulWhenBlank");
function is(node, tagNames) {
  return tagNames.indexOf(node.nodeName) >= 0;
}
__name(is, "is");
function has(node, tagNames) {
  return node.getElementsByTagName && tagNames.some(function(tagName) {
    return node.getElementsByTagName(tagName).length;
  });
}
__name(has, "has");
var markdownEscapes = [[/\\/g, "\\\\"], [/\*/g, "\\*"], [/^-/g, "\\-"], [/^\+ /g, "\\+ "], [/^(=+)/g, "\\$1"], [/^(#{1,6}) /g, "\\$1 "], [/`/g, "\\`"], [/^~~~/g, "\\~~~"], [/\[/g, "\\["], [/\]/g, "\\]"], [/^>/g, "\\>"], [/_/g, "\\_"], [/^(\d+)\. /g, "$1\\. "]];
function escapeMarkdown(string) {
  return markdownEscapes.reduce(function(accumulator, escape) {
    return accumulator.replace(escape[0], escape[1]);
  }, string);
}
__name(escapeMarkdown, "escapeMarkdown");
var rules = {};
rules.paragraph = {
  filter: "p",
  replacement: /* @__PURE__ */ __name(function(content) {
    return "\n\n" + content + "\n\n";
  }, "replacement")
};
rules.lineBreak = {
  filter: "br",
  replacement: /* @__PURE__ */ __name(function(content, node, options) {
    return options.br + "\n";
  }, "replacement")
};
rules.heading = {
  filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
  replacement: /* @__PURE__ */ __name(function(content, node, options) {
    var hLevel = Number(node.nodeName.charAt(1));
    if (options.headingStyle === "setext" && hLevel < 3) {
      var underline = repeat(hLevel === 1 ? "=" : "-", content.length);
      return "\n\n" + content + "\n" + underline + "\n\n";
    } else {
      return "\n\n" + repeat("#", hLevel) + " " + content + "\n\n";
    }
  }, "replacement")
};
rules.blockquote = {
  filter: "blockquote",
  replacement: /* @__PURE__ */ __name(function(content) {
    content = trimNewlines(content).replace(/^/gm, "> ");
    return "\n\n" + content + "\n\n";
  }, "replacement")
};
rules.list = {
  filter: ["ul", "ol"],
  replacement: /* @__PURE__ */ __name(function(content, node) {
    var parent = node.parentNode;
    if (parent.nodeName === "LI" && parent.lastElementChild === node) {
      return "\n" + content;
    } else {
      return "\n\n" + content + "\n\n";
    }
  }, "replacement")
};
rules.listItem = {
  filter: "li",
  replacement: /* @__PURE__ */ __name(function(content, node, options) {
    var prefix = options.bulletListMarker + "   ";
    var parent = node.parentNode;
    if (parent.nodeName === "OL") {
      var start = parent.getAttribute("start");
      var index = Array.prototype.indexOf.call(parent.children, node);
      prefix = (start ? Number(start) + index : index + 1) + ".  ";
    }
    var isParagraph = /\n$/.test(content);
    content = trimNewlines(content) + (isParagraph ? "\n" : "");
    content = content.replace(/\n/gm, "\n" + " ".repeat(prefix.length));
    return prefix + content + (node.nextSibling ? "\n" : "");
  }, "replacement")
};
rules.indentedCodeBlock = {
  filter: /* @__PURE__ */ __name(function(node, options) {
    return options.codeBlockStyle === "indented" && node.nodeName === "PRE" && node.firstChild && node.firstChild.nodeName === "CODE";
  }, "filter"),
  replacement: /* @__PURE__ */ __name(function(content, node, options) {
    return "\n\n    " + node.firstChild.textContent.replace(/\n/g, "\n    ") + "\n\n";
  }, "replacement")
};
rules.fencedCodeBlock = {
  filter: /* @__PURE__ */ __name(function(node, options) {
    return options.codeBlockStyle === "fenced" && node.nodeName === "PRE" && node.firstChild && node.firstChild.nodeName === "CODE";
  }, "filter"),
  replacement: /* @__PURE__ */ __name(function(content, node, options) {
    var className = node.firstChild.getAttribute("class") || "";
    var language = (className.match(/language-(\S+)/) || [null, ""])[1];
    var code = node.firstChild.textContent;
    var fenceChar = options.fence.charAt(0);
    var fenceSize = 3;
    var fenceInCodeRegex = new RegExp("^" + fenceChar + "{3,}", "gm");
    var match;
    while (match = fenceInCodeRegex.exec(code)) {
      if (match[0].length >= fenceSize) {
        fenceSize = match[0].length + 1;
      }
    }
    var fence = repeat(fenceChar, fenceSize);
    return "\n\n" + fence + language + "\n" + code.replace(/\n$/, "") + "\n" + fence + "\n\n";
  }, "replacement")
};
rules.horizontalRule = {
  filter: "hr",
  replacement: /* @__PURE__ */ __name(function(content, node, options) {
    return "\n\n" + options.hr + "\n\n";
  }, "replacement")
};
rules.inlineLink = {
  filter: /* @__PURE__ */ __name(function(node, options) {
    return options.linkStyle === "inlined" && node.nodeName === "A" && node.getAttribute("href");
  }, "filter"),
  replacement: /* @__PURE__ */ __name(function(content, node) {
    var href = escapeLinkDestination(node.getAttribute("href"));
    var title = escapeLinkTitle(cleanAttribute(node.getAttribute("title")));
    var titlePart = title ? ' "' + title + '"' : "";
    return "[" + content + "](" + href + titlePart + ")";
  }, "replacement")
};
rules.referenceLink = {
  filter: /* @__PURE__ */ __name(function(node, options) {
    return options.linkStyle === "referenced" && node.nodeName === "A" && node.getAttribute("href");
  }, "filter"),
  replacement: /* @__PURE__ */ __name(function(content, node, options) {
    var href = escapeLinkDestination(node.getAttribute("href"));
    var title = cleanAttribute(node.getAttribute("title"));
    if (title) title = ' "' + escapeLinkTitle(title) + '"';
    var replacement;
    var reference;
    switch (options.linkReferenceStyle) {
      case "collapsed":
        replacement = "[" + content + "][]";
        reference = "[" + content + "]: " + href + title;
        break;
      case "shortcut":
        replacement = "[" + content + "]";
        reference = "[" + content + "]: " + href + title;
        break;
      default:
        var id = this.references.length + 1;
        replacement = "[" + content + "][" + id + "]";
        reference = "[" + id + "]: " + href + title;
    }
    this.references.push(reference);
    return replacement;
  }, "replacement"),
  references: [],
  append: /* @__PURE__ */ __name(function(options) {
    var references = "";
    if (this.references.length) {
      references = "\n\n" + this.references.join("\n") + "\n\n";
      this.references = [];
    }
    return references;
  }, "append")
};
rules.emphasis = {
  filter: ["em", "i"],
  replacement: /* @__PURE__ */ __name(function(content, node, options) {
    if (!content.trim()) return "";
    return options.emDelimiter + content + options.emDelimiter;
  }, "replacement")
};
rules.strong = {
  filter: ["strong", "b"],
  replacement: /* @__PURE__ */ __name(function(content, node, options) {
    if (!content.trim()) return "";
    return options.strongDelimiter + content + options.strongDelimiter;
  }, "replacement")
};
rules.code = {
  filter: /* @__PURE__ */ __name(function(node) {
    var hasSiblings = node.previousSibling || node.nextSibling;
    var isCodeBlock = node.parentNode.nodeName === "PRE" && !hasSiblings;
    return node.nodeName === "CODE" && !isCodeBlock;
  }, "filter"),
  replacement: /* @__PURE__ */ __name(function(content) {
    if (!content) return "";
    content = content.replace(/\r?\n|\r/g, " ");
    var extraSpace = /^`|^ .*?[^ ].* $|`$/.test(content) ? " " : "";
    var delimiter = "`";
    var matches = content.match(/`+/gm) || [];
    while (matches.indexOf(delimiter) !== -1) delimiter = delimiter + "`";
    return delimiter + extraSpace + content + extraSpace + delimiter;
  }, "replacement")
};
rules.image = {
  filter: "img",
  replacement: /* @__PURE__ */ __name(function(content, node) {
    var alt = escapeMarkdown(cleanAttribute(node.getAttribute("alt")));
    var src = escapeLinkDestination(node.getAttribute("src") || "");
    var title = cleanAttribute(node.getAttribute("title"));
    var titlePart = title ? ' "' + escapeLinkTitle(title) + '"' : "";
    return src ? "![" + alt + "](" + src + titlePart + ")" : "";
  }, "replacement")
};
function cleanAttribute(attribute) {
  return attribute ? attribute.replace(/(\n+\s*)+/g, "\n") : "";
}
__name(cleanAttribute, "cleanAttribute");
function escapeLinkDestination(destination) {
  var escaped = destination.replace(/([<>()])/g, "\\$1");
  return escaped.indexOf(" ") >= 0 ? "<" + escaped + ">" : escaped;
}
__name(escapeLinkDestination, "escapeLinkDestination");
function escapeLinkTitle(title) {
  return title.replace(/"/g, '\\"');
}
__name(escapeLinkTitle, "escapeLinkTitle");
function Rules(options) {
  this.options = options;
  this._keep = [];
  this._remove = [];
  this.blankRule = {
    replacement: options.blankReplacement
  };
  this.keepReplacement = options.keepReplacement;
  this.defaultRule = {
    replacement: options.defaultReplacement
  };
  this.array = [];
  for (var key in options.rules) this.array.push(options.rules[key]);
}
__name(Rules, "Rules");
Rules.prototype = {
  add: /* @__PURE__ */ __name(function(key, rule) {
    this.array.unshift(rule);
  }, "add"),
  keep: /* @__PURE__ */ __name(function(filter) {
    this._keep.unshift({
      filter,
      replacement: this.keepReplacement
    });
  }, "keep"),
  remove: /* @__PURE__ */ __name(function(filter) {
    this._remove.unshift({
      filter,
      replacement: /* @__PURE__ */ __name(function() {
        return "";
      }, "replacement")
    });
  }, "remove"),
  forNode: /* @__PURE__ */ __name(function(node) {
    if (node.isBlank) return this.blankRule;
    var rule;
    if (rule = findRule(this.array, node, this.options)) return rule;
    if (rule = findRule(this._keep, node, this.options)) return rule;
    if (rule = findRule(this._remove, node, this.options)) return rule;
    return this.defaultRule;
  }, "forNode"),
  forEach: /* @__PURE__ */ __name(function(fn) {
    for (var i = 0; i < this.array.length; i++) fn(this.array[i], i);
  }, "forEach")
};
function findRule(rules2, node, options) {
  for (var i = 0; i < rules2.length; i++) {
    var rule = rules2[i];
    if (filterValue(rule, node, options)) return rule;
  }
  return void 0;
}
__name(findRule, "findRule");
function filterValue(rule, node, options) {
  var filter = rule.filter;
  if (typeof filter === "string") {
    if (filter === node.nodeName.toLowerCase()) return true;
  } else if (Array.isArray(filter)) {
    if (filter.indexOf(node.nodeName.toLowerCase()) > -1) return true;
  } else if (typeof filter === "function") {
    if (filter.call(rule, node, options)) return true;
  } else {
    throw new TypeError("`filter` needs to be a string, array, or function");
  }
}
__name(filterValue, "filterValue");
function collapseWhitespace(options) {
  var element = options.element;
  var isBlock2 = options.isBlock;
  var isVoid2 = options.isVoid;
  var isPre = options.isPre || function(node2) {
    return node2.nodeName === "PRE";
  };
  if (!element.firstChild || isPre(element)) return;
  var prevText = null;
  var keepLeadingWs = false;
  var prev = null;
  var node = next(prev, element, isPre);
  while (node !== element) {
    if (node.nodeType === 3 || node.nodeType === 4) {
      var text = node.data.replace(/[ \r\n\t]+/g, " ");
      if ((!prevText || / $/.test(prevText.data)) && !keepLeadingWs && text[0] === " ") {
        text = text.substr(1);
      }
      if (!text) {
        node = remove(node);
        continue;
      }
      node.data = text;
      prevText = node;
    } else if (node.nodeType === 1) {
      if (isBlock2(node) || node.nodeName === "BR") {
        if (prevText) {
          prevText.data = prevText.data.replace(/ $/, "");
        }
        prevText = null;
        keepLeadingWs = false;
      } else if (isVoid2(node) || isPre(node)) {
        prevText = null;
        keepLeadingWs = true;
      } else if (prevText) {
        keepLeadingWs = false;
      }
    } else {
      node = remove(node);
      continue;
    }
    var nextNode = next(prev, node, isPre);
    prev = node;
    node = nextNode;
  }
  if (prevText) {
    prevText.data = prevText.data.replace(/ $/, "");
    if (!prevText.data) {
      remove(prevText);
    }
  }
}
__name(collapseWhitespace, "collapseWhitespace");
function remove(node) {
  var next2 = node.nextSibling || node.parentNode;
  node.parentNode.removeChild(node);
  return next2;
}
__name(remove, "remove");
function next(prev, current, isPre) {
  if (prev && prev.parentNode === current || isPre(current)) {
    return current.nextSibling || current.parentNode;
  }
  return current.firstChild || current.nextSibling || current.parentNode;
}
__name(next, "next");
var root = typeof window !== "undefined" ? window : {};
function canParseHTMLNatively() {
  var Parser = root.DOMParser;
  var canParse = false;
  try {
    if (new Parser().parseFromString("", "text/html")) {
      canParse = true;
    }
  } catch (e) {
  }
  return canParse;
}
__name(canParseHTMLNatively, "canParseHTMLNatively");
function createHTMLParser() {
  var Parser = /* @__PURE__ */ __name(function() {
  }, "Parser");
  {
    if (shouldUseActiveX()) {
      Parser.prototype.parseFromString = function(string) {
        var doc = new window.ActiveXObject("htmlfile");
        doc.designMode = "on";
        doc.open();
        doc.write(string);
        doc.close();
        return doc;
      };
    } else {
      Parser.prototype.parseFromString = function(string) {
        var doc = document.implementation.createHTMLDocument("");
        doc.open();
        doc.write(string);
        doc.close();
        return doc;
      };
    }
  }
  return Parser;
}
__name(createHTMLParser, "createHTMLParser");
function shouldUseActiveX() {
  var useActiveX = false;
  try {
    document.implementation.createHTMLDocument("").open();
  } catch (e) {
    if (root.ActiveXObject) useActiveX = true;
  }
  return useActiveX;
}
__name(shouldUseActiveX, "shouldUseActiveX");
var HTMLParser = canParseHTMLNatively() ? root.DOMParser : createHTMLParser();
function RootNode(input, options) {
  var root2;
  if (typeof input === "string") {
    var doc = htmlParser().parseFromString(
      // DOM parsers arrange elements in the <head> and <body>.
      // Wrapping in a custom element ensures elements are reliably arranged in
      // a single element.
      '<x-turndown id="turndown-root">' + input + "</x-turndown>",
      "text/html"
    );
    root2 = doc.getElementById("turndown-root");
  } else {
    root2 = input.cloneNode(true);
  }
  collapseWhitespace({
    element: root2,
    isBlock,
    isVoid,
    isPre: options.preformattedCode ? isPreOrCode : null
  });
  return root2;
}
__name(RootNode, "RootNode");
var _htmlParser;
function htmlParser() {
  _htmlParser = _htmlParser || new HTMLParser();
  return _htmlParser;
}
__name(htmlParser, "htmlParser");
function isPreOrCode(node) {
  return node.nodeName === "PRE" || node.nodeName === "CODE";
}
__name(isPreOrCode, "isPreOrCode");
function Node(node, options) {
  node.isBlock = isBlock(node);
  node.isCode = node.nodeName === "CODE" || node.parentNode.isCode;
  node.isBlank = isBlank(node);
  node.flankingWhitespace = flankingWhitespace(node, options);
  return node;
}
__name(Node, "Node");
function isBlank(node) {
  return !isVoid(node) && !isMeaningfulWhenBlank(node) && /^\s*$/i.test(node.textContent) && !hasVoid(node) && !hasMeaningfulWhenBlank(node);
}
__name(isBlank, "isBlank");
function flankingWhitespace(node, options) {
  if (node.isBlock || options.preformattedCode && node.isCode) {
    return {
      leading: "",
      trailing: ""
    };
  }
  var edges = edgeWhitespace(node.textContent);
  if (edges.leadingAscii && isFlankedByWhitespace("left", node, options)) {
    edges.leading = edges.leadingNonAscii;
  }
  if (edges.trailingAscii && isFlankedByWhitespace("right", node, options)) {
    edges.trailing = edges.trailingNonAscii;
  }
  return {
    leading: edges.leading,
    trailing: edges.trailing
  };
}
__name(flankingWhitespace, "flankingWhitespace");
function edgeWhitespace(string) {
  var m = string.match(/^(([ \t\r\n]*)(\s*))(?:(?=\S)[\s\S]*\S)?((\s*?)([ \t\r\n]*))$/);
  return {
    leading: m[1],
    // whole string for whitespace-only strings
    leadingAscii: m[2],
    leadingNonAscii: m[3],
    trailing: m[4],
    // empty for whitespace-only strings
    trailingNonAscii: m[5],
    trailingAscii: m[6]
  };
}
__name(edgeWhitespace, "edgeWhitespace");
function isFlankedByWhitespace(side, node, options) {
  var sibling;
  var regExp;
  var isFlanked;
  if (side === "left") {
    sibling = node.previousSibling;
    regExp = / $/;
  } else {
    sibling = node.nextSibling;
    regExp = /^ /;
  }
  if (sibling) {
    if (sibling.nodeType === 3) {
      isFlanked = regExp.test(sibling.nodeValue);
    } else if (options.preformattedCode && sibling.nodeName === "CODE") {
      isFlanked = false;
    } else if (sibling.nodeType === 1 && !isBlock(sibling)) {
      isFlanked = regExp.test(sibling.textContent);
    }
  }
  return isFlanked;
}
__name(isFlankedByWhitespace, "isFlankedByWhitespace");
var reduce = Array.prototype.reduce;
function TurndownService(options) {
  if (!(this instanceof TurndownService)) return new TurndownService(options);
  var defaults = {
    rules,
    headingStyle: "setext",
    hr: "* * *",
    bulletListMarker: "*",
    codeBlockStyle: "indented",
    fence: "```",
    emDelimiter: "_",
    strongDelimiter: "**",
    linkStyle: "inlined",
    linkReferenceStyle: "full",
    br: "  ",
    preformattedCode: false,
    blankReplacement: /* @__PURE__ */ __name(function(content, node) {
      return node.isBlock ? "\n\n" : "";
    }, "blankReplacement"),
    keepReplacement: /* @__PURE__ */ __name(function(content, node) {
      return node.isBlock ? "\n\n" + node.outerHTML + "\n\n" : node.outerHTML;
    }, "keepReplacement"),
    defaultReplacement: /* @__PURE__ */ __name(function(content, node) {
      return node.isBlock ? "\n\n" + content + "\n\n" : content;
    }, "defaultReplacement")
  };
  this.options = extend({}, defaults, options);
  this.rules = new Rules(this.options);
}
__name(TurndownService, "TurndownService");
TurndownService.prototype = {
  /**
   * The entry point for converting a string or DOM node to Markdown
   * @public
   * @param {String|HTMLElement} input The string or DOM node to convert
   * @returns A Markdown representation of the input
   * @type String
   */
  turndown: /* @__PURE__ */ __name(function(input) {
    if (!canConvert(input)) {
      throw new TypeError(input + " is not a string, or an element/document/fragment node.");
    }
    if (input === "") return "";
    var output = process.call(this, new RootNode(input, this.options));
    return postProcess.call(this, output);
  }, "turndown"),
  /**
   * Add one or more plugins
   * @public
   * @param {Function|Array} plugin The plugin or array of plugins to add
   * @returns The Turndown instance for chaining
   * @type Object
   */
  use: /* @__PURE__ */ __name(function(plugin) {
    if (Array.isArray(plugin)) {
      for (var i = 0; i < plugin.length; i++) this.use(plugin[i]);
    } else if (typeof plugin === "function") {
      plugin(this);
    } else {
      throw new TypeError("plugin must be a Function or an Array of Functions");
    }
    return this;
  }, "use"),
  /**
   * Adds a rule
   * @public
   * @param {String} key The unique key of the rule
   * @param {Object} rule The rule
   * @returns The Turndown instance for chaining
   * @type Object
   */
  addRule: /* @__PURE__ */ __name(function(key, rule) {
    this.rules.add(key, rule);
    return this;
  }, "addRule"),
  /**
   * Keep a node (as HTML) that matches the filter
   * @public
   * @param {String|Array|Function} filter The unique key of the rule
   * @returns The Turndown instance for chaining
   * @type Object
   */
  keep: /* @__PURE__ */ __name(function(filter) {
    this.rules.keep(filter);
    return this;
  }, "keep"),
  /**
   * Remove a node that matches the filter
   * @public
   * @param {String|Array|Function} filter The unique key of the rule
   * @returns The Turndown instance for chaining
   * @type Object
   */
  remove: /* @__PURE__ */ __name(function(filter) {
    this.rules.remove(filter);
    return this;
  }, "remove"),
  /**
   * Escapes Markdown syntax
   * @public
   * @param {String} string The string to escape
   * @returns A string with Markdown syntax escaped
   * @type String
   */
  escape: /* @__PURE__ */ __name(function(string) {
    return escapeMarkdown(string);
  }, "escape")
};
function process(parentNode) {
  var self = this;
  return reduce.call(parentNode.childNodes, function(output, node) {
    node = new Node(node, self.options);
    var replacement = "";
    if (node.nodeType === 3) {
      replacement = node.isCode ? node.nodeValue : self.escape(node.nodeValue);
    } else if (node.nodeType === 1) {
      replacement = replacementForNode.call(self, node);
    }
    return join(output, replacement);
  }, "");
}
__name(process, "process");
function postProcess(output) {
  var self = this;
  this.rules.forEach(function(rule) {
    if (typeof rule.append === "function") {
      output = join(output, rule.append(self.options));
    }
  });
  return output.replace(/^[\t\r\n]+/, "").replace(/[\t\r\n\s]+$/, "");
}
__name(postProcess, "postProcess");
function replacementForNode(node) {
  var rule = this.rules.forNode(node);
  var content = process.call(this, node);
  var whitespace = node.flankingWhitespace;
  if (whitespace.leading || whitespace.trailing) content = content.trim();
  return whitespace.leading + rule.replacement(content, node, this.options) + whitespace.trailing;
}
__name(replacementForNode, "replacementForNode");
function join(output, replacement) {
  var s1 = trimTrailingNewlines(output);
  var s2 = trimLeadingNewlines(replacement);
  var nls = Math.max(output.length - s1.length, replacement.length - s2.length);
  var separator = "\n\n".substring(0, nls);
  return s1 + separator + s2;
}
__name(join, "join");
function canConvert(input) {
  return input != null && (typeof input === "string" || input.nodeType && (input.nodeType === 1 || input.nodeType === 9 || input.nodeType === 11));
}
__name(canConvert, "canConvert");

// src/index.js
var LINK_HEADER = [
  '</docs/api-reference.html>; rel="service-doc"; type="text/html"',
  '</docs/>; rel="help"; type="text/html"',
  '</sitemap.xml>; rel="sitemap"; type="application/xml"',
  '</privacy/>; rel="privacy-policy"; type="text/html"',
  '</robots.txt>; rel="describedby"; type="text/plain"'
].join(", ");
var index_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/commits") {
      return handleCommits(request, url, env);
    }
    return handleProxy(request, url);
  }
};
function acceptsMarkdown(request) {
  const accept = request.headers.get("Accept") || "";
  return accept.includes("text/markdown");
}
__name(acceptsMarkdown, "acceptsMarkdown");
async function handleProxy(request, url) {
  const wantsMarkdown = acceptsMarkdown(request);
  const originHeaders = stripHopByHop(request.headers);
  if (wantsMarkdown) {
    originHeaders.set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
  }
  const originUrl = new URL(url.pathname + url.search, "https://applehealthdata.com");
  const originReq = new Request(originUrl.toString(), {
    method: request.method,
    headers: originHeaders,
    body: request.method === "GET" || request.method === "HEAD" ? void 0 : request.body,
    redirect: "manual",
    cf: {
      resolveOverride: "krumjahn.github.io",
      // Bypass edge cache for markdown requests so we always get fresh HTML to convert
      cacheEverything: false,
      cacheTtl: wantsMarkdown ? 0 : void 0
    }
  });
  const originRes = await fetch(originReq);
  const contentType = originRes.headers.get("Content-Type") || "";
  const isHtml = contentType.includes("text/html");
  const headers = new Headers(originRes.headers);
  if (isHtml) {
    headers.set("Link", LINK_HEADER);
  }
  if (isHtml && wantsMarkdown) {
    const html = await originRes.text();
    const td = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" });
    const markdown = td.turndown(html);
    headers.set("Content-Type", "text/markdown; charset=utf-8");
    headers.set("X-Markdown-Tokens", String(Math.ceil(markdown.length / 4)));
    headers.delete("Content-Length");
    headers.delete("Content-Encoding");
    return new Response(markdown, {
      status: originRes.status,
      statusText: originRes.statusText,
      headers
    });
  }
  return new Response(originRes.body, {
    status: originRes.status,
    statusText: originRes.statusText,
    headers
  });
}
__name(handleProxy, "handleProxy");
async function handleCommits(request, url, env) {
  const origin = request.headers.get("Origin") || "";
  const allowedOrigins = /* @__PURE__ */ new Set([
    "https://applehealthdata.com",
    "https://www.applehealthdata.com",
    "http://localhost:8787"
  ]);
  const corsHeaders = {
    "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "https://applehealthdata.com",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  const owner = env.GITHUB_OWNER;
  const repo = env.GITHUB_REPO;
  const page = clampInt(url.searchParams.get("page") ?? "1", 1, 200);
  const perPage = clampInt(url.searchParams.get("per_page") ?? "10", 1, 50);
  if (!env.GITHUB_TOKEN) {
    return new Response(JSON.stringify({ error: "Missing GitHub token" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
  const ghUrl = `https://api.github.com/repos/${owner}/${repo}/commits?page=${page}&per_page=${perPage}`;
  const ghRes = await fetch(ghUrl, {
    headers: {
      "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
      "User-Agent": "applehealthdata-changelog-worker",
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    }
  });
  const rateHeaders = {
    "X-RateLimit-Limit": ghRes.headers.get("X-RateLimit-Limit") || "",
    "X-RateLimit-Remaining": ghRes.headers.get("X-RateLimit-Remaining") || "",
    "X-RateLimit-Reset": ghRes.headers.get("X-RateLimit-Reset") || ""
  };
  const bodyText = await ghRes.text();
  return new Response(bodyText, {
    status: ghRes.status,
    headers: {
      ...corsHeaders,
      ...rateHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=120"
    }
  });
}
__name(handleCommits, "handleCommits");
function stripHopByHop(headers) {
  const out = new Headers(headers);
  const hopByHop = [
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailers",
    "transfer-encoding",
    "upgrade",
    "host"
  ];
  for (const h of hopByHop) out.delete(h);
  return out;
}
__name(stripHopByHop, "stripHopByHop");
function clampInt(value, min, max) {
  const n = parseInt(String(value), 10);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}
__name(clampInt, "clampInt");
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
