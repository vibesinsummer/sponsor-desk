// 온라인 자료 수집기: 연합뉴스 인사·부고 + 구글 뉴스(기업 뉴스, 협찬 동향)
// 실행: node collect.js   → data.js 생성 (대시보드가 읽음)
const fs = require("fs");
const path = require("path");
const cfg = require("./config");

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36";
const OUT = path.join(__dirname, "data.json");
const BRIEF = path.join(__dirname, "briefing.json");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(url, tries = 3) {
  for (let i = 0; i <= tries; i++) {
    if (i) await sleep(1500 * i * i);
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA, "Accept-Language": "ko-KR,ko" }, signal: AbortSignal.timeout(20000) });
      if (r.ok) return await r.text();
    } catch (e) { /* retry */ }
  }
  console.warn("실패:", url);
  return "";
}
async function pool(items, n, fn) {
  const out = []; let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k], k); } }));
  return out;
}
const dec = (s) => s.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&#039;|&apos;/g, "'").replace(/&nbsp;/g, " ").replace(/&middot;/g, "·").replace(/&amp;/g, "&");
const strip = (s) => dec(s.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "")).replace(/[ \t]+/g, " ").trim();
// 같은 보도자료를 받아 쓴 비슷한 제목은 하나로 묶기 (글자 2-gram 유사도)
const grams = (s) => { const t = s.replace(/\[[^\]]*\]|[^가-힣A-Za-z0-9]/g, ""); const g = new Set(); for (let i = 0; i < t.length - 1; i++) g.add(t.slice(i, i + 2)); return g; };
function dedupe(items) {
  const kept = [];
  for (const it of items) {
    const g = grams(it.title);
    const dup = kept.find((k) => { let n = 0; for (const x of g) if (k._g.has(x)) n++; return n / Math.min(g.size, k._g.size || 1) > 0.55; });
    if (dup) { dup.dupes = (dup.dupes || 1) + 1; continue; }
    it._g = g; kept.push(it);
  }
  return kept.map(({ _g, ...rest }) => rest);
}
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function matcher(word) {
  // 영문 약칭(SK, LG, GS...)은 앞뒤가 영문자가 아닐 때만 매칭
  return /^[A-Za-z]/.test(word) ? new RegExp(`(^|[^A-Za-z])${esc(word)}(?![A-Za-z])`) : new RegExp(esc(word));
}
const companyRx = cfg.companies.map((c) => ({ name: c.name, broad: !!c.broad, rx: c.match.map(matcher), ex: c.exclude || [] }));
// 제목에서 기업 찾기. exclude 단어는 지우고 검사, broad(대학교 전체 등)는 기본적으로 제외
const isCompanyIn = (c, text) => { const t = c.ex.reduce((s, w) => s.split(w).join(" "), text); return c.rx.some((r) => r.test(t)); };
const findCompanies = (text, withBroad = false) => companyRx.filter((c) => (withBroad || !c.broad) && isCompanyIn(c, text)).map((c) => c.name);

function classify(text) {
  const tags = [];
  for (const [tag, words] of Object.entries(cfg.signals.opportunity)) if (words.some((w) => text.includes(w))) tags.push(tag);
  const clean = cfg.signals.cautionExcept.reduce((t, w) => t.split(w).join(" "), text);
  const caution = cfg.signals.caution.filter((w) => clean.includes(w));
  return { tags, caution };
}

// ---------- 구글 뉴스 RSS ----------
function parseRss(xml) {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => {
    const b = m[1];
    const pick = (t) => { const x = b.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`)); return x ? dec(x[1]).trim() : ""; };
    let title = pick("title"); const source = pick("source");
    if (source && title.endsWith(" - " + source)) title = title.slice(0, -(source.length + 3));
    title = title.replace(/s+-s+[^-]{1,20}$/, "").replace(/s+:s+[^:]{1,15}$/, "").trim();
    return { title, link: pick("link"), source, date: new Date(pick("pubDate")).toISOString() };
  });
}
async function gnews(q, days = 2) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q + ` when:${days}d`)}&hl=ko&gl=KR&ceid=KR:ko`;
  return parseRss(await get(url));
}

// ---------- 연합뉴스 인사/부고 ----------
function parseYnaList(html, section) {
  const items = [];
  const rx = /<a href="(https:\/\/www\.yna\.co\.kr\/view\/[^"?]+)\?section=[^"]*" class="tit-news">\s*<span class="title01">([^<]*)<\/span>[\s\S]*?(?:<p class="lead">([\s\S]*?)<\/p>)?[\s\S]*?<span class="txt-time">([^<]*)<\/span>/g;
  for (const m of html.matchAll(rx)) items.push({ link: m[1], title: dec(m[2]).trim(), lead: m[3] ? strip(m[3]) : "", time: m[4].trim(), section });
  return items;
}
function ynaBody(html) {
  const s = html.indexOf('class="story-news article"'); if (s < 0) return "";
  const e = html.indexOf('class="txt-copyright', s);
  const chunk = html.slice(s, e > 0 ? e : s + 20000);
  return [...chunk.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => strip(m[1])).join("\n");
}
// 인사 본문에서 홍보 관련 줄만 짧게 뽑기 (전문 재게시 X)
function prLines(body) {
  const parts = body.split(/(?=▲)|\n/).map((s) => s.trim()).filter((s) => s.startsWith("▲"));
  return parts.filter((p) => cfg.prKeywords.some((k) => (k === "PR" || k === "IR" ? matcher(k).test(p) : p.includes(k)))).map((p) => p.slice(0, 80)).slice(0, 6);
}

async function collectPeople(prev) {
  const cache = new Map((prev.personnel || []).map((x) => [x.link, x]));
  const pages = (base, n) => Array.from({ length: n }, (_, i) => (i ? `${base}/${i + 1}` : base));
  const urls = [...pages("https://www.yna.co.kr/people/personnel", 3), ...pages("https://www.yna.co.kr/people/obituary-notice", 3)];
  const html = await pool(urls, 2, (u) => get(u));
  const pHtml = html.slice(0, 3), oHtml = html.slice(3);
  const uniq = (arr) => [...new Map(arr.map((x) => [x.link, x])).values()];
  const personnel = uniq(pHtml.flatMap((h) => parseYnaList(h, "인사"))).filter((x) => /\d/.test(x.time) && !x.title.startsWith("[부고]"));
  const obituary = uniq(oHtml.flatMap((h) => parseYnaList(h, "부고"))).filter((x) => /\d/.test(x.time));

  // 인사 기사 본문을 읽어 대상 기업/홍보 라인 판별
  await pool(personnel, 3, async (it) => {
    const c = cache.get(it.link);
    if (c && c.size !== undefined) { Object.assign(it, { companies: findCompanies(it.title), pr: c.pr, size: c.size, isExec: c.isExec, lead: "" }); return; }
    const body = ynaBody(await get(it.link, 1));
    const text = it.title + "\n" + body;
    it.companies = findCompanies(it.title);
    it.pr = prLines(body);
    it.size = (body.match(/▲/g) || []).length;
    it.isExec = /임원|사장|대표|회장/.test(it.title + body.slice(0, 300));
    it.lead = "";
  });
  for (const it of obituary) {
    const t = it.title;
    it.companies = findCompanies(t);
    it.pr = cfg.prKeywords.some((k) => (k === "PR" || k === "IR" ? matcher(k).test(t) : t.includes(k)));
    it.exec = cfg.execKeywords.some((k) => t.includes(k));
    it.lead = "";
  }
  // 구글 뉴스로 대기업 임원인사 보완 (연합뉴스에 없는 그룹 정기인사)
  const execNews = (await Promise.all(["임원인사", "정기 인사 그룹", "홍보실장 선임 OR 커뮤니케이션실장 선임"].map((q) => gnews(q, 3))))
    .flat()
    .filter((n) => /인사|선임|승진|취임|내정/.test(n.title));
  const execUniq = dedupe(execNews.sort((a, b) => b.date.localeCompare(a.date)))
    .map((n) => ({ ...n, companies: findCompanies(n.title) }));
  return { personnel, obituary, execNews: execUniq.slice(0, 60) };
}

async function collectCompanyNews() {
  const res = await pool(cfg.companies, 3, async (c) => {
    // 한 단어짜리 검색어는 "정확히 일치"로 (구글이 비슷한 단어 기사로 채우는 것 방지)
    const q = c.q.split(" OR ").map((t) => (t.startsWith('"') || t.includes(" ") ? t : `"${t}"`)).join(" OR ");
    const items = await gnews(q, 2);
    return dedupe(items.sort((a, b) => b.date.localeCompare(a.date)))
      .map((n) => {
        const cls = classify(n.title);
        // 부정이슈는 제목에 그 기업 이름이 실제로 있을 때만 (검색에 딸려온 무관한 기사 제외)
        // rel = 제목에 그 기업이 실제로 등장 (검색에 딸려온 무관한 기사와 구분)
        const rel = isCompanyIn(companyRx.find((x) => x.name === c.name), n.title);
        if (!rel) cls.caution = [];
        return { ...n, company: c.name, group: c.group, watch: !!c.watch, rel, ...cls };
      })
      .filter((n) => n.rel || c.broad) // 제목에 기업 이름이 없는 기사는 버림
      .slice(0, 20)
      .sort((a, b) => b.date.localeCompare(a.date));
  });
  return res.flat();
}

async function collectSponsor() {
  const all = (await pool(cfg.sponsorQueries, 3, async (q) => (await gnews(q, 7)).map((n) => ({ ...n, query: q })))).flat();
  return dedupe(all.sort((a, b) => b.date.localeCompare(a.date)))
    .map((n) => ({
      ...n,
      companies: findCompanies(n.title),
      media: cfg.media.filter((m) => n.title.includes(m)),
      type: /PPL/.test(n.title) ? "PPL" : /제작지원|협찬|스폰서/.test(n.title) ? "협찬·제작지원" : /모델/.test(n.title) ? "광고모델" : /브랜디드/.test(n.title) ? "브랜디드" : /광고|캠페인/.test(n.title) ? "광고 캠페인" : "기타",
    }))
    .filter((n) => (n.type !== "기타" || n.companies.length) && !/^\[해외|해외 크리에이티브/.test(n.title))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 120);
}

(async () => {
  const t0 = Date.now();
  let prev = {};
  try { prev = JSON.parse(fs.readFileSync(OUT, "utf8")); } catch {}
  // node collect.js people → 인사·부고만 새로 받고 나머지는 직전 데이터 유지
  const peopleOnly = process.argv[2] === "people";
  const [people, news, sponsor] = await Promise.all([
    collectPeople(prev),
    peopleOnly ? prev.news || [] : collectCompanyNews(),
    peopleOnly ? prev.sponsor || [] : collectSponsor(),
  ]);
  // 수집이 막혀 비어 버린 항목은 직전 데이터 유지
  const keep = (cur, key, min) => (cur.length >= min ? cur : (console.warn(key + ": 수집 부족, 직전 데이터 유지"), prev[key] || cur));
  people.personnel = keep(people.personnel, "personnel", 5);
  people.obituary = keep(people.obituary, "obituary", 5);
  people.execNews = keep(people.execNews, "execNews", 3);
  let briefing = null;
  try { briefing = JSON.parse(fs.readFileSync(BRIEF, "utf8")); } catch {}
  const data = {
    updated: peopleOnly ? prev.updated : new Date().toISOString(),
    peopleUpdated: new Date().toISOString(),
    companies: cfg.companies.map(({ name, group, watch }) => ({ name, group, watch: !!watch })),
    news: keep(news, "news", 100), sponsor: keep(sponsor, "sponsor", 10), ...people, briefing,
  };
  // node collect.js brief → 전체 수집 + 규칙 기반 브리핑 새로 작성 (오전 9시)
  if (process.argv[2] === "brief") {
    data.briefing = require("./briefing")(data);
    fs.writeFileSync(BRIEF, JSON.stringify(data.briefing, null, 2));
  }
  // 인사·부고 단체 메시지 (오전·오후) 갱신
  data.digest = require("./digest")(data, prev.digest);
  fs.writeFileSync(OUT, JSON.stringify(data));
  console.log(`완료 ${((Date.now() - t0) / 1000).toFixed(1)}초 | 기업뉴스 ${news.length} · 협찬동향 ${sponsor.length} · 인사 ${people.personnel.length} · 임원인사(타매체) ${people.execNews.length} · 부고 ${people.obituary.length}`);
})();
