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

// 주요영업처 기사 제목에서 '날짜 + 행사' 찾기 → 캘린더 (뉴스 감지, 정확도 100% 아님)
const EVENT_WORD = /박람회|전시회|전시|페스티벌|축제|시상식|기념식|컨퍼런스|콘퍼런스|포럼|세미나|론칭|런칭|출시|오픈|개최|개막|팝업|행사|설명회|마라톤|콘서트|공연|쇼케이스|발표회|간담회|기념|창립|출범|기공식|준공식|착공식|오픈런|사전예약|사전 예약/;
const EVENT_NOT = /주가|목표가|실적|분기|증시|코스피|코스닥|청약|마감시황|리포트|연속|시행|만기|배당|금리|환율|선고|재판|공판|조사|소환/;
function eventDate(title, iso) {
  const a = new Date(new Date(iso).getTime() + KST);
  const ay = a.getUTCFullYear(), am = a.getUTCMonth() + 1, ad = a.getUTCDate();
  let m = /(\d{1,2})월\s*(\d{1,2})일/.exec(title), mon, day;
  if (m) { mon = +m[1]; day = +m[2]; }
  else if ((m = /(?:^|[^\d월.~\-/])(\d{1,2})일(?=\s*(?:부터|까지|~|에|간|\s|,|·|$))/.exec(title))) {
    // '10일 만에', '3일간' 처럼 기간을 뜻하는 경우 제외
    const after = title.slice(m.index + m[0].length, m.index + m[0].length + 4);
    if (/^\s*(만|간|째|동안|연속|새)/.test(after)) return null;
    day = +m[1]; mon = am;
    // 월 없이 '○일'만 있으면 이번 달의 오늘 이후 날짜만 인정 (지난 날짜를 다음 달로 넘기지 않음)
    if (day < ad - 1) return null;
  }
  else return null;
  if (mon > 12) mon -= 12;
  let y = ay; if (mon < am - 6) y++;
  const dt = new Date(Date.UTC(y, mon - 1, day));
  if (dt.getUTCMonth() !== mon - 1 || dt.getUTCDate() !== day) return null;
  const diff = (dt - Date.UTC(ay, am - 1, ad)) / 86400000;
  if (diff < -1 || diff > 120) return null; // 지난 행사·너무 먼 날짜 제외
  return dt.toISOString().slice(0, 10);
}
function updateNewsEvents(D, now) {
  const E = read("newsevents.json", []);
  const have = new Set(E.map((e) => e.company + norm(e.title)));
  for (const n of D.news || []) {
    if (!n.watch || !n.rel || !EVENT_WORD.test(n.title) || EVENT_NOT.test(n.title)) continue;
    const date = eventDate(n.title, n.date);
    if (!date) continue;
    const key = n.company + norm(n.title);
    if (have.has(key)) continue;
    // 같은 기업·같은 날짜 행사는 한 건만
    if (E.some((e) => e.company === n.company && e.date === date)) continue;
    have.add(key);
    E.push({ date, company: n.company, title: n.title, link: n.link, source: n.source, found: kstDay(now) });
  }
  const keepFrom = kstDay(new Date(now.getTime() - 14 * 86400000));
  const out = E.filter((e) => e.date >= keepFrom).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 400);
  write("newsevents.json", out);
  return out;
}

module.exports = function updateRecords(D, now = new Date()) {
  updateHistory(D, now);
  const prlog = updatePrlog(D, now);
  const anniv = updateAnniv(D, now);
  const newsEvents = updateNewsEvents(D, now);
  return { prlog, anniv, newsEvents };
};
module.exports.eventDate = eventDate;
