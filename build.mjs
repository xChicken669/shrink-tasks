
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";



import { minify } from "terser";

const LIMIT = 3072;
const src = readFileSync("src/index.html", "utf8");

let html = "";
for (const part of src.split(/(<script>[\s\S]*?<\/script>|<style>[\s\S]*?<\/style>)/)) {
  if (part.startsWith("<script>")) {
    const { code } = await minify(part.slice(8, -9), { toplevel: true, compress: { passes: 3 } });
    html += "<script>" + code + "</script>";
    
  } else if (part.startsWith("<style>")) {
    html += part.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").replace(/\s*([{};:,>])\s*/g, "$1").replace(/;}/g, "}");
  } else {

    
    html += part.replace(/<!--[\s\S]*?-->/g, "").replace(/\s+/g, " ").replace(/>\s+</g, "><").trim();
  }
}
const uri = "data:text/html," + html.replace(/%/g, "%25").replace(/#/g, "%23").replace(/\n/g, "%0A");
mkdirSync("dist", { recursive: true });
writeFileSync("dist/index.html", html);

writeFileSync("dist/uri.txt", uri);
const bytes = Buffer.byteLength(uri);
console.log(`${bytes} / ${LIMIT} bytes`);
if (bytes > LIMIT) process.exitCode = 1;
