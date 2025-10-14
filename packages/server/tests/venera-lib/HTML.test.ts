import assert from "tests/assert";

import { HtmlDocument } from "@/venera-lib/HTML";

const html = `<!doctype html>
<html>
<head>
  <title>Test Page</title>
</head>
<body id="body">
  <div id="div-1" class="div-1">
    <div id="div-2">
      content-2
      <img src="/" class="child-image">
      <div id="div-2__inner">content-2__inner</div>
    </div>
    <div id="div-3"><b>content-3</b></div>
    <a id="a-1" href="#">content-a</a>
  </div>
</body>
</html>`;

const document = new HtmlDocument(html);
assert.ok("parse html doc", document);

assert.ok("get element by id", document.getElementById("div-1"));
assert.eq("query selector", document.querySelector("div")?.id, "div-1");
assert.eq("query selector all", document.querySelectorAll("div").length, 4);
assert.eq(
	"query selector for non exist element",
	document.querySelector("h1"),
	null
);
assert.eq(
	"query selector all for non exist element",
	document.querySelectorAll("h1").length,
	0
);

const el = document.querySelector("#div-1")!;
assert.eq("get attributes", Object.keys(el.attributes).length, 2);
assert.eq("querySelector", el.querySelector("img")?.attributes.src, "/");
assert.eq("querySelectorAll", el.querySelectorAll("div").length, 3);
assert.eq("children", el.children.length, 3);
assert.eq("parent", el.parent.id, "body");
assert.eq("classNames", el.classNames.length, 1);
assert.eq("id", el.id, "div-1");

const child = el.children[1];
assert.eq("child is wanted child node", child.id, "div-3");
assert.eq("text", child.text, "content-3");
assert.eq("innerHTML", child.innerHTML, `<b>content-3</b>`);
assert.eq("prevEl", child.previousElementSibling?.id, "div-2");
assert.eq("nextEl", child.nextElementSibling?.id, "a-1");
assert.eq(
	"nextEl should return null when there is not next el",
	child.nextElementSibling?.nextElementSibling,
	null
);
assert.eq(
	"prevEl should return null when there is not prev el",
	child.previousElementSibling?.previousElementSibling,
	null
);
