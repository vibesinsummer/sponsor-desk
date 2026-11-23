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

  // 0) 주요영업처 소식: 소식이 있는 주요영업처는 빠짐없이 모두 (기업당 대표 기사 1건 + 나머지 건수)
  const watch = [];
  for (const c of D.companies.filter((c) => c.watch)) {
    const arr = D.news.filter((n) => n.company === c.name && fresh(n.date)).sort(byDupes);
    if (!arr.length) continue;
    const lead = arr.find((n) => n.caution.length) || arr.find((n) => n.tags.some((t) => OPP.includes(t) || t === "인사·조직")) || arr[0];
    const total = arr.reduce((s, n) => s + (n.dupes || 1), 0);
    const tag = lead.tags.find((t) => OPP.includes(t));
    watch.push({
      company: c.name,
      text: `${c.name}: ${lead.title}${arr.length > 1 ? ` 외 ${arr.length - 1}건` : ""} (관련 보도 ${total}건)`,
      action: lead.caution.length ? `부정이슈('${lead.caution.join("·")}'). 신규 제안 전 추이 확인`
        : lead.tags.includes("인사·조직") ? "인사 소식. 홍보 라인 변동 여부 확인"
        : tag ? OPP_ACTION[tag] : "동향 파악, 담당자 안부 연락 소재로 활용",
      rank: lead.caution.length ? 0 : lead.tags.includes("인사·조직") ? 1 : tag ? 2 : 3,
      total,
    });
  }
  watch.sort((a, b) => a.rank - b.rank || b.total - a.total);
  const watchItems = watch.map(({ text, action }) => ({ text, action }));

  // 1) 인사: 홍보 라인 변동 + 주요영업처 인사는 전부, 그 외 관심 기업은 일부
  const recentP = D.personnel.filter((p) => within(ynaDate(p.time), 3));
  const prP = D.personnel.filter((p) => p.pr.length && within(ynaDate(p.time), 7));
  const people = prP.map((p) => ({
    text: `${p.title.replace(/^\[인사\]\s*/, "")}: ${p.pr.join(", ").replace(/▲\s*/g, "")}`.slice(0, 160),
    action: "신임 홍보 담당자 축하 인사, 미팅 요청",
  }));
  for (const p of recentP.filter((p) => !p.pr.length && isWatch(p.companies))) {
    people.push({ text: `${p.title} (${md(ynaDate(p.time))})`, action: "주요영업처 인사. 홍보 라인 변동 여부 확인" });
  }
  for (const n of onePerCompany(D.execNews.filter((n) => n.companies.length).sort(byDupes), (n) => n.companies[0], 20)) {
    if (!isWatch(n.companies) && people.length >= 8) continue;
    if (people.some((x) => x.text.includes(n.companies[0]))) continue;
    people.push({ text: n.title + cnt(n), action: "그룹 정기인사. 홍보 라인 변동 여부 확인" });
  }

  // 2) 제안 포인트: 주요영업처 우선, 많이 보도된 순, 기업당 1건
  const oppAll = D.news.filter((n) => fresh(n.date) && !n.caution.length && n.tags.some((t) => OPP.includes(t)))
    .sort((a, b) => (b.watch ? 1 : 0) - (a.watch ? 1 : 0) || byDupes(a, b));
  const opp = onePerCompany(oppAll, (n) => n.company, 8)
    .map((n) => ({ text: `${n.company}: ${n.title}${cnt(n)}`, action: OPP_ACTION[n.tags.find((t) => OPP.includes(t))] }));

  // 3) 부정이슈: 주요영업처는 전부, 그 외는 상위 몇 건
  const cauAll = onePerCompany(D.news.filter((n) => n.caution.length && fresh(n.date)).sort((a, b) => (b.watch ? 1 : 0) - (a.watch ? 1 : 0) || byDupes(a, b)), (n) => n.company, 99);
  const caution = cauAll.filter((n, i) => n.watch || i < 5)
    .map((n) => ({ text: `${n.company}: ${n.title}${cnt(n)}`, action: `'${n.caution.join("·")}' 관련. 신규 제안 전 이슈 추이 확인` }));

  // 4) 경조사: 주요영업처·홍보 라인은 전부, 그 외 임원은 일부 (최근 3일)
  const obAll = D.obituary.filter((o) => within(ynaDate(o.time), 3) && (o.pr || o.companies.length || o.exec));
  const obit = [...obAll.filter((o) => isWatch(o.companies) || o.pr), ...obAll.filter((o) => !(isWatch(o.companies) || o.pr)).slice(0, 3)]
    .map((o) => ({ text: `${o.title.replace(/^\[부고\]\s*/, "")} (${md(ynaDate(o.time))})`,
      action: isWatch(o.companies) ? "주요영업처 경조사. 조문·조화 여부 결정" : o.pr ? "홍보 담당자 경조사. 조문·조화 여부 결정" : "관계 확인 후 조문 여부 결정" }));

  // 5) 광고·협찬 동향: 주요영업처 언급 우선
  const sponsor = distinct(D.sponsor.filter((s) => SPONSOR_ACTION[s.type] || isWatch(s.companies))
    .sort((a, b) => (isWatch(b.companies) ? 1 : 0) - (isWatch(a.companies) ? 1 : 0) || byDupes(a, b)), 6)
    .map((s) => ({ text: s.title + cnt(s), action: SPONSOR_ACTION[s.type] || "주요영업처 광고·협찬 소식. 내용 확인" }));

  const cauW = cauAll.filter((n) => n.watch).length;
  const headline = `주요영업처 ${watchSet.size}곳 중 ${watch.length}곳에 새 소식이 있습니다(최근 ${winH}시간). 부정이슈 ${cauW}곳, 홍보 라인 인사 ${prP.length}건, 주요 부고 ${obit.length}건.`;

  return {
    date: kstNow().toISOString().slice(0, 10),
    auto: true,
    headline,
    sections: [
      { title: `주요영업처 소식 (${watch.length}곳)`, kind: "watch", items: watchItems },
      { title: "인사 체크: 홍보 라인 교체", kind: "people", items: people },
      { title: "부정이슈", kind: "caution", items: caution },
      { title: "오늘의 제안 포인트", kind: "opportunity", items: opp },
      { title: "경조사 체크", kind: "obituary", items: obit },
      { title: "광고·협찬 동향", kind: "sponsor", items: sponsor },
    ].filter((s) => s.items.length),
  };
};
