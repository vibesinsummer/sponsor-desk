// GitHub Pages에 올릴 사이트(_site 폴더) 만들기
// index.html(본문 조각)을 완전한 웹 문서로 감싸고 data.json을 함께 복사
const fs = require("fs");
const path = require("path");

const src = fs.readFileSync(path.join(__dirname, "index.html"), "utf8");
const cut = src.indexOf("<header>");
const head = src.slice(0, cut);   // <title>, 글꼴, <style>
const body = src.slice(cut);      // 화면과 스크립트

const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<style>body{margin:0}[hidden]{display:none!important}</style>
${head}</head>
<body>
${body}
</body>
</html>
`;

const out = path.join(__dirname, "_site");
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "index.html"), html);
fs.copyFileSync(path.join(__dirname, "data.json"), path.join(out, "data.json"));
fs.writeFileSync(path.join(out, ".nojekyll"), "");
fs.writeFileSync(path.join(out, "robots.txt"), "User-agent: *\nDisallow: /\n");
console.log("사이트 생성 완료:", out);
