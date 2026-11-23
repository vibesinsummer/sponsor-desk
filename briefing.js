// 규칙 기반 자동 브리핑 (AI·유료 서비스 없이 수집 데이터만으로 작성)
// collect.js 가 "brief" 모드로 실행될 때 호출됨

// 더 구체적인 신호를 먼저 본다 (행동 문구 선택 순서)
const OPP = ["사회공헌·ESG", "행사·기념일", "마케팅·캠페인", "투자·신사업", "신제품·론칭"];
const OPP_ACTION = {
  "신제품·론칭": "신제품 런칭 광고·PPL 제안",
  "마케팅·캠페인": "캠페인 초기. 추가 매체 집행 제안",
  "투자·신사업": "기업 이미지 광고·특별 다큐 패키지 대상",
  "사회공헌·ESG": "공익·나눔 캠페인 패키지 제안",
  "행사·기념일": "행사 연계 협찬 제안",
};
const SPONSOR_ACTION = {
  "광고모델": "신규 캠페인 광고주. 매체 확장 제안",
  "광고 캠페인": "신규 캠페인 광고주. 매체 확장 제안",
  "PPL": "협찬 수요 확인, 레퍼런스로 활용",
  "협찬·제작지원": "협찬 수요 확인, 레퍼런스로 활용",
  "브랜디드": "브랜디드 콘텐츠 상품 제안",
};

const KST = 9 * 3600 * 1000;
const kstNow = () => new Date(Date.now() + KST);
// 연합뉴스 목록 시각 "11-19 16:09"(한국시간) → Date
function ynaDate(t) {
  const m = /^(\d{2})-(\d{2}) (\d{2}):(\d{2})$/.exec(t || "");
  if (!m) return new Date(0);
  const now = kstNow();
  let y = now.getUTCFullYear();
  if (+m[1] > now.getUTCMonth() + 1) y--; // 1월에 보는 12월 기사
  return new Date(Date.UTC(y, +m[1] - 1, +m[2], +m[3], +m[4]) - KST);
}
const within = (d, days) => Date.now() - d.getTime() < days * 86400000;
const cnt = (n) => (n.dupes > 1 ? ` (보도 ${n.dupes}건)` : "");
const md = (d) => { const k = new Date(d.getTime() + KST); return `${k.getUTCMonth() + 1}/${k.getUTCDate()}`; };
function onePerCompany(items, key, limit) {
  const seen = new Set(), out = [];
  for (const it of items) { const k = key(it); if (seen.has(k)) continue; seen.add(k); out.push(it); if (out.length >= limit) break; }
  return out;
}
// 같은 소식을 다룬 비슷한 제목 걸러내기
const grams = (s) => { const t = s.replace(/[^가-힣A-Za-z0-9]/g, ""); const g = new Set(); for (let i = 0; i < t.length - 1; i++) g.add(t.slice(i, i + 2)); return g; };
function distinct(items, limit) {
  const out = [];
  for (const it of items) {
    const g = grams(it.title);
    if (out.some((o) => { let n = 0; for (const x of g) if (o._g.has(x)) n++; return n / Math.min(g.size, o._g.size || 1) > 0.35; })) continue;
    out.push(Object.assign({}, it, { _g: g })); if (out.length >= limit) break;
  }
  return out;
}
const byDupes = (a, b) => (b.dupes || 1) - (a.dupes || 1) || b.date.localeCompare(a.date);

module.exports = function makeBriefing(D) {
  const watchSet = new Set(D.companies.filter((c) => c.watch).map((c) => c.name));
  const isWatch = (names) => (names || []).some((n) => watchSet.has(n));
  const kstDay = kstNow().getUTCDay(); // 0=일 1=월
  const winH = kstDay === 1 ? 72 : 26; // 월요일엔 주말 포함
  const fresh = (iso) => Date.now() - new Date(iso).getTime() < winH * 3600000;
  const freshY = (t) => Date.now() - ynaDate(t).getTime() < winH * 3600000;
  const short = (t, n = 70) => (t.length > n ? t.slice(0, n - 1) + "…" : t);
  const strip = (t) => t.replace(/^\[(인사|부고)\]\s*/, "");
  const wNews0 = D.news.filter((n) => n.watch && fresh(n.date));
  // 부정 키워드가 기사 1건에만 스친 경우는 잡음 → 보도 합계 2건 이상인 기업만 부정이슈로 인정
  const negScore = {};
  // 심각한 단어(유출·횡령·사망 등)는 1건이라도 인정, 약한 단어(논란·소송·적자 등)는 보도 2건 이상일 때만
  const SEVERE = ["유출", "횡령", "배임", "압수수색", "구속", "기소", "사망", "숨져", "리콜", "해킹", "파업", "불매", "갑질"];
  for (const n of wNews0) if (n.caution.length) negScore[n.company] = (negScore[n.company] || 0) + (n.dupes || 1) + (n.caution.some((w) => SEVERE.includes(w)) ? 1 : 0);
  const wNews = wNews0.map((n) => (n.caution.length && negScore[n.company] < 2 ? { ...n, caution: [] } : n));

  // ───────── ① 오늘 꼭 볼 것 (최대 5건): 실제로 움직여야 하는 것만 ─────────
  const cand = [];
  for (const p of D.personnel.filter((p) => p.pr.length && freshY(p.time))) {
    cand.push({ type: "people", label: "홍보 라인 교체", prio: isWatch(p.companies) ? 1 : 3,
      company: p.companies[0] || strip(p.title), title: p.pr.slice(0, 2).join(" · ").replace(/▲\s*/g, ""),
      link: p.link, when: md(ynaDate(p.time)), action: "신임 담당자 축하 연락" });
  }
  for (const o of D.obituary.filter((o) => freshY(o.time) && (isWatch(o.companies) || o.pr))) {
    cand.push({ type: "obit", label: "부고", prio: isWatch(o.companies) ? 1 : 4,
      company: o.companies[0] || "홍보·언론", title: strip(o.title), link: o.link, when: md(ynaDate(o.time)), action: "조문·조화 여부 결정" });
  }
  for (const n of onePerCompany(wNews.filter((n) => n.caution.length).sort(byDupes), (n) => n.company, 99)) {
    cand.push({ type: "neg", label: "부정이슈", prio: (n.dupes || 1) >= 3 ? 2 : 5, dupes: n.dupes || 1,
      company: n.company, title: n.title, link: n.link, when: md(new Date(n.date)), action: "신규 제안 보류, 추이 확인" });
  }
  for (const n of onePerCompany(wNews.filter((n) => n.tags.includes("인사·조직") && /대표|사장|회장|선임|내정|취임/.test(n.title)).sort(byDupes), (n) => n.company, 99)) {
    cand.push({ type: "people", label: "경영진 인사", prio: 3, dupes: n.dupes || 1,
      company: n.company, title: n.title, link: n.link, when: md(new Date(n.date)), action: "홍보 라인 변동 확인" });
  }
  cand.sort((a, b) => a.prio - b.prio || (b.dupes || 1) - (a.dupes || 1));
  const must = [], perType = {}, seenCo = new Set();
  for (const c of cand) {
    if (must.length >= 5) break;
    if ((perType[c.type] || 0) >= 2 || seenCo.has(c.type + c.company)) continue;
    perType[c.type] = (perType[c.type] || 0) + 1; seenCo.add(c.type + c.company);
    must.push({ ...c, title: short(c.title, 80) });
  }
  // 부족하면 유형 제한 없이 채움
  for (const c of cand) { if (must.length >= 5) break; if (!must.some((m) => m.link === c.link)) must.push({ ...c, title: short(c.title, 80) }); }
  must.forEach((m) => { delete m.prio; delete m.dupes; });

  // ───────── ② 주요 이슈: 주요영업처 기사를 주제별로 묶기 ─────────
  const THEMES = [
    { key: "neg", name: "부정이슈", test: (n) => n.caution.length, action: "해당사 신규 제안 보류, 추이 확인" },
    { key: "people", name: "인사·조직 변화", test: (n) => n.tags.includes("인사·조직"), action: "홍보 라인 변동 확인, 축하 연락" },
    { key: "esg", name: "사회공헌·나눔", test: (n) => n.tags.includes("사회공헌·ESG"), action: "연말 나눔·공익 캠페인 제안 적기" },
    { key: "launch", name: "신제품·서비스 출시", test: (n) => n.tags.includes("신제품·론칭"), action: "런칭 광고·PPL 제안" },
    { key: "mkt", name: "마케팅·캠페인", test: (n) => n.tags.includes("마케팅·캠페인"), action: "캠페인 매체 확장 제안" },
    { key: "invest", name: "투자·수주·신사업", test: (n) => n.tags.includes("투자·신사업"), action: "기업 이미지 광고·다큐 패키지 제안" },
    { key: "event", name: "행사·기념일", test: (n) => n.tags.includes("행사·기념일"), action: "행사 연계 협찬 제안" },
  ];
  const bucket = Object.fromEntries(THEMES.map((t) => [t.key, []]));
  for (const n of wNews) { const t = THEMES.find((t) => t.test(n)); if (t) bucket[t.key].push(n); }
  const themes = THEMES.map((t) => {
    const arr = bucket[t.key].sort(byDupes);
    const cos = onePerCompany(arr, (n) => n.company, 99).map((n) => ({ name: n.company, note: t.key === "neg" ? n.caution.join("·") : "", link: n.link, title: n.title }));
    return { key: t.key, title: t.name, action: t.action, count: cos.length, companies: cos,
      top: arr[0] ? { title: short(arr[0].title, 90), link: arr[0].link, source: arr[0].source, company: arr[0].company } : null };
  }).filter((t) => t.count >= (t.key === "neg" ? 1 : 2))
    .sort((a, b) => (a.key === "neg" ? -1 : b.key === "neg" ? 1 : b.count - a.count))
    .slice(0, 5);

  // ───────── ③ 주요영업처 현황판: 전 기업 상태 타일 ─────────
  const groups = [...new Set(D.companies.filter((c) => c.watch).map((c) => c.group))];
  const board = groups.map((g) => ({
    group: g,
    items: D.companies.filter((c) => c.watch && c.group === g).map((c) => {
      const arr = wNews.filter((n) => n.company === c.name).sort(byDupes);
      const status = !arr.length ? "none" : arr.some((n) => n.caution.length) ? "neg" : arr.some((n) => n.tags.includes("인사·조직")) ? "people" : arr.some((n) => n.tags.some((t) => OPP.includes(t))) ? "opp" : "normal";
      return { name: c.name, status, count: arr.length,
        news: arr.slice(0, 4).map((n) => ({ title: n.title, link: n.link, source: n.source, date: n.date, neg: n.caution.length > 0 })) };
    }),
  }));

  // ───────── ④ 접어 두는 목록: 경조사·협찬 동향 ─────────
  const obAll = D.obituary.filter((o) => within(ynaDate(o.time), 3) && (o.pr || o.companies.length || o.exec));
  const obituary = [...obAll.filter((o) => isWatch(o.companies) || o.pr), ...obAll.filter((o) => !(isWatch(o.companies) || o.pr)).slice(0, 3)]
    .map((o) => ({ title: strip(o.title), link: o.link, when: md(ynaDate(o.time)), watch: isWatch(o.companies) }));
  const sponsor = distinct(D.sponsor.filter((s) => SPONSOR_ACTION[s.type] || isWatch(s.companies))
    .sort((a, b) => (isWatch(b.companies) ? 1 : 0) - (isWatch(a.companies) ? 1 : 0) || byDupes(a, b)), 6)
    .map((s) => ({ title: s.title, link: s.link, type: s.type, source: s.source }));

  const negN = board.flatMap((g) => g.items).filter((i) => i.status === "neg").length;
  const liveN = board.flatMap((g) => g.items).filter((i) => i.status !== "none").length;
  return {
    date: kstNow().toISOString().slice(0, 10),
    auto: true,
    v: 2,
    winH,
    headline: `꼭 볼 것 ${must.length}건 · 부정이슈 ${negN}곳 · 소식 있는 주요영업처 ${liveN}/${watchSet.size}곳`,
    must, themes, board, obituary, sponsor,
  };
};
