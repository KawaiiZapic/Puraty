import initialize from "@/utils/initialize";
import { Network } from "@/venera-lib/Network";
import assert from "tests/assert";

await initialize();

const HTTP_BIN_URL = "https://httpbin.org"

assert.ok("GET", Network.get(HTTP_BIN_URL + "/get").then(v => v.status === 200));
assert.ok("POST", Network.post(HTTP_BIN_URL + "/post").then(v => v.status === 200));
assert.ok("PATCH", Network.patch(HTTP_BIN_URL + "/patch").then(v => v.status === 200));
assert.ok("DELETE", Network.delete(HTTP_BIN_URL + "/delete").then(v => v.status === 200));
assert.ok("PUT", Network.put(HTTP_BIN_URL + "/put").then(v => v.status === 200));

assert.eq(
  "POST with headers", 
  Network.post(
    HTTP_BIN_URL + "/post", 
    { "X-Puraty-H1": "Value" }
  ).then(v => {
    return JSON.parse(v.body).headers["X-Puraty-H1"];
  }), 
  "Value"
);

const payload = JSON.stringify({ "A": "B" });
assert.eq(
  "POST with body", 
  Network.post(
    HTTP_BIN_URL + "/post",
    {
      "Content-Type": "application/json"
    },
    payload
  ).then(v => {
    return JSON.parse(v.body).data;
  }), 
  payload
);

assert.ok("Get cookies when empty", async () => {
  return (await Network.getCookies(HTTP_BIN_URL)).length === 0;
});
assert.eq(
  "Set cookies", 
  Network.setCookies(HTTP_BIN_URL, [
    { name: "test", value: "value", domain: new URL(HTTP_BIN_URL).hostname },
    { name: "test2", value: "value2", domain: new URL(HTTP_BIN_URL).hostname }
  ]), 
  void 0
);
assert.ok("Get cookies", async () => {
  const cookies = (await Network.getCookies(HTTP_BIN_URL));
  return cookies.find(v => v.name === "test")?.value === "value" 
    && cookies.find(v => v.name === "test2")?.value === "value2";
});
assert.ok("Request with cookies", async () => {
  const resp = JSON.parse((await Network.get(HTTP_BIN_URL + "/cookies")).body).cookies;
  return resp?.test === "value" && resp?.test2 === "value2";
});
assert.eq("Delete cookies", async () => {
  Network.deleteCookies(HTTP_BIN_URL);
  return (await Network.getCookies(HTTP_BIN_URL)).length;
}, 0);
assert.ok("Request without cookies", async () => {
  const resp = JSON.parse((await Network.get(HTTP_BIN_URL + "/cookies")).body).cookies;
  return typeof resp?.test === "undefined" && typeof resp?.test2 === "undefined"
});