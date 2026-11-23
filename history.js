// 매 수집 때 기록을 쌓아 두는 파일 3개
//  · history.json : 주요영업처별 최근 35일 기사·인사·부고 (기업 요약 탭)
//  · prlog.json   : 홍보·커뮤니케이션·마케팅 라인 인사 누적 (홍보 담당자 명단 탭)
//  · anniv.json   : 뉴스에서 찾은 기업 창립기념일 (캘린더 탭)
const fs = require("fs");
const path = require("path");
const cfg = require("./config");

const KST = 9 * 3600 * 1000;
const kstDay = (d) => new Date(new Date(d).getTime() + KST).toISOString().slice(0, 10);
function ynaISO(t, now) {
  const m = /^(\d{2})-(\d{2}) (\d{2}):(\d{2})$/.exec(t || "");
  if (!m) return null;
  const k = new Date(now.getTime() + KST);
  let y = k.getUTCFullYear();
  if (+m[1] > k.getUTCMonth() + 1) y--;
  return new Date(Date.UTC(y, +m[1] - 1, +m[2], +m[3], +m[4]) - KST).toISOString();
}
const read = (f, d) => { try { return JSON.parse(fs.readFileSync(path.join(__dirname, f), "utf8")); } catch { return d; } };
const write = (f, v) => fs.writeFileSync(path.join(__dirname, f), JSON.stringify(v));
const norm = (t) => t.replace(/\[[^\]]*\]|[^가-힣A-Za-z0-9]/g, "").slice(0, 28);
const watchNames = new Set(cfg.companies.filter((c) => c.watch).map((c) => c.name));

function updateHistory(D, now) {
  const H = read("history.json", {});
  const cutoff = new Date(now.getTime() - 35 * 86400000).toISOString();
  const add = (co, item) => {
    const arr = (H[co] ||= []);
    const k = item.kind + norm(item.title);
    const old = arr.find((x) => x.kind + norm(x.title) === k);
    if (old) { old.dupes = Math.max(old.dupes || 1, item.dupes || 1); return; }
    arr.push(item);
  };
  for (const n of D.news || []) {
    if (!n.watch || !n.rel) continue;
    add(n.company, { kind: "news", date: n.date, title: n.title, link: n.link, source: n.source, tags: n.tags, caution: n.caution, dupes: n.dupes || 1 });
  }
  for (const p of D.personnel || []) {
    const iso = ynaISO(p.time, now); if (!iso) continue;
    for (const co of (p.companies || []).filter((c) => watchNames.has(c))) add(co, { kind: "people", date: iso, title: p.title, link: p.link, pr: p.pr || [] });
  }
  for (const o of D.obituary || []) {
    const iso = ynaISO(o.time, now); if (!iso) continue;
    for (const co of (o.companies || []).filter((c) => watchNames.has(c))) add(co, { kind: "obit", date: iso, title: o.title, link: o.link });
  }
  for (const co of Object.keys(H)) {
    H[co] = H[co].filter((x) => x.date >= cutoff).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 60);
    if (!H[co].length) delete H[co];
  }
  write("history.json", H);
}

function updatePrlog(D, now) {
  const L = read("prlog.json", []);
  const have = new Set(L.map((x) => x.link));
  for (const p of D.personnel || []) {
    if (!p.pr || !p.pr.length || have.has(p.link)) continue;
    const iso = ynaISO(p.time, now); if (!iso) continue;
    L.push({
      date: iso, org: p.title.replace(/^\[인사\]\s*/, "").trim(), companies: p.companies || [],
      lines: p.pr.map((l) => l.replace(/^▲\s*/, "").trim()), link: p.link,
    });
  }
  L.sort((a, b) => b.date.localeCompare(a.date));
  const out = L.slice(0, 500);
  write("prlog.json", out);
  return out;
}

// "창립 61주년", "창사 30주년" 등 → 기업별 기념일(월-일)
function updateAnniv(D, now) {
  const A = read("anniv.json", {});
  for (const n of D.news || []) {
    if (!n.watch || !n.rel) continue;
    const m = /(창립|창사|설립|창업|개교|출범)\s*(\d{1,3})\s*주년/.exec(n.title);
    if (!m) continue;
    const day = kstDay(n.date);
    const prev = A[n.company];
    if (prev && prev.seen >= day) continue;
    A[n.company] = { md: day.slice(5), what: m[1], years: +m[2], year: +day.slice(0, 4), title: n.title, link: n.link, seen: day };
  }
  write("anniv.json", A);
  return A;
}

module.exports = function updateRecords(D, now = new Date()) {
  updateHistory(D, now);
  const prlog = updatePrlog(D, now);
  const anniv = updateAnniv(D, now);
  return { prlog, anniv };
};
