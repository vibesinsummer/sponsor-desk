// 인사·부고 단체 메시지 자동 작성 (오전·오후 하루 2번)
//  · 오전(10시 업데이트): 전 영업일 16:00 이후 ~ 지금  (월요일 오전은 금요일 16:00 이후)
//  · 오후(16시 업데이트): 오늘 10:00 이후 ~ 지금
//  · 기업 소식만: 정부·공공기관·대학·언론사 등은 아래 EXCLUDE 단어로 제외
//
//  메시지 형식 (부서 단체 메시지 양식 그대로):
//    11월 23일 오후 기업인사 내용입니다.
//    참고 부탁드립니다.
//    (인사: 삼성글로벌리서치, 애경그룹/ 부고: 없음)
//
//    인사
//    삼성글로벌리서치: https://www.yna.co.kr/view/...?section=people/personnel

// 기업이 아닌 곳으로 보고 뺄 단어 (기관명 끝/포함)
const EXCLUDE = /(부|청|처|원|위원회|시|도|군|구|공사|공단|공기업|대학교|대학|대|학교|학원|병원|의료원|법원|검찰|경찰|국회|교육|재단|협회|연합회|조합|진흥원|연구원|연구소|공항|항만|신문|일보|방송|뉴스|통신|매거진|미디어|언론|KBS|MBC|SBS|EBS|YTN|CBS|TV조선|채널A|MBN|교수|의원|장관|차관|대사관|공보|교회|성당|사찰)$|교육청|시청|구청|군청|도청|지방|국립|한국은행|정부|공사$|공단$/;
const EXCLUDE_ANY = /신문|일보|방송|뉴스|KBS|MBC|SBS|EBS|YTN|CBS|기자|헤럴드|리뷰|타임스|데일리|투데이|저널|미디어|매일|스포츠|경제신문|경향|한겨레|대학|교수|국회|시청|구청|도청|경찰|검찰|법원|장관|공보|정부|부처/;
// 일반 기사 제목 첫 단어가 기업명이 아닌 경우
const NOT_ORG = /^(차기|신임|새|신규|올해|내년|첫|전|前|현|故|이번|정기|그룹|회장|사장|대표|대기업|재계|기업|금융권|업계|주요)$/;
const ROLE_EXCLUDE = /기자|교수|의원|장관|논설|국장|PD|앵커|변호사|판사|검사/;
const IS_PERSONNEL = /인사|선임|승진|내정|취임|대표|사장|회장|임원|CEO/;

const KST = 9 * 3600 * 1000;
const kst = (d = new Date()) => new Date(d.getTime() + KST); // UTC 필드로 한국 시각을 읽기 위한 변환
function ynaDate(t, now) {
  const m = /^(\d{2})-(\d{2}) (\d{2}):(\d{2})$/.exec(t || "");
  if (!m) return null;
  let y = kst(now).getUTCFullYear();
  if (+m[1] > kst(now).getUTCMonth() + 1) y--;
  return new Date(Date.UTC(y, +m[1] - 1, +m[2], +m[3], +m[4]) - KST);
}
// 한국 날짜 d(UTC 필드 기준)의 hh:00 시각
const kstAt = (k, hh) => new Date(Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate(), hh) - KST);

function windowFor(now) {
  const k = kst(now);
  const slot = k.getUTCHours() < 13 ? "오전" : "오후";
  if (slot === "오후") return { slot, from: kstAt(k, 10), to: now };
  // 오전: 직전 평일 16:00부터
  const prev = new Date(k.getTime());
  do { prev.setUTCDate(prev.getUTCDate() - 1); } while ([0, 6].includes(prev.getUTCDay()));
  return { slot, from: kstAt(prev, 16), to: now };
}

const cleanLabel = (s) => s.replace(/^\[인사\]\s*/, "").replace(/[,，…·]+$/, "").trim();
function personnelLabel(p) {
  const t = p.title;
  if (/^\[인사\]/.test(t)) return cleanLabel(t);
  if (!IS_PERSONNEL.test(t)) return null; // 일반 기사는 인사 기사일 때만
  const first = cleanLabel(t.split(/[\s…]/)[0]).replace(/['"‘’“”]/g, "");
  if (first && !NOT_ORG.test(first) && /[가-힣A-Za-z]/.test(first) && first.length <= 20) return first;
  return p.companies && p.companies.length ? p.companies[0] : null;
}
function obitLabel(o) {
  if (!/^\[부고\]/.test(o.title)) return null;
  const m = /\(([^)]+)\)/.exec(o.title);
  if (!m) return null;
  const aff = m[1].replace(/^(전|前)\s*/, "").trim();
  if (ROLE_EXCLUDE.test(aff)) return null;
  const org = aff.split(/\s+/)[0];
  if (!org || EXCLUDE.test(org) || EXCLUDE_ANY.test(org)) return null;
  return org;
}

function build(D, now = new Date()) {
  const { slot, from, to } = windowFor(now);
  const inWin = (t) => { const d = ynaDate(t, now); return d && d >= from && d <= to; };
  const seen = new Set();
  const people = [];
  for (const p of D.personnel || []) {
    if (!inWin(p.time)) continue;
    const label = personnelLabel(p);
    if (!label || EXCLUDE.test(label) || EXCLUDE_ANY.test(label) || seen.has(label)) continue;
    seen.add(label);
    people.push({ label, link: p.link + "?section=people/personnel" });
  }
  const seenO = new Set();
  const obits = [];
  for (const o of D.obituary || []) {
    if (!inWin(o.time)) continue;
    const label = obitLabel(o);
    if (!label || seenO.has(o.link)) continue;
    seenO.add(o.link);
    obits.push({ label, link: o.link + "?section=people/obituary-notice", title: o.title.replace(/^\[부고\]\s*/, "") });
  }
  const k = kst(now);
  const head = `${k.getUTCMonth() + 1}월 ${k.getUTCDate()}일 ${slot} 기업인사 내용입니다.\n참고 부탁드립니다.\n` +
    `(인사: ${people.map((x) => x.label).join(", ") || "없음"}/ 부고: ${[...new Set(obits.map((x) => x.label))].join(", ") || "없음"})`;
  let text = head;
  if (people.length) text += "\n\n인사\n" + people.map((x) => `${x.label}: ${x.link}`).join("\n");
  if (obits.length) text += "\n\n부고\n" + obits.map((x) => `${x.label}: ${x.link}`).join("\n");
  return {
    date: k.toISOString().slice(0, 10), slot, made: now.toISOString(),
    range: [from.toISOString(), to.toISOString()], people, obits, text,
  };
}

// 이번 실행 결과를 기록에 넣기 (같은 날짜·같은 오전/오후는 최신으로 교체, 최근 14일 보관)
module.exports = function updateDigest(D, prevDigest, now = new Date()) {
  const cur = build(D, now);
  const list = (prevDigest || []).filter((e) => !(e.date === cur.date && e.slot === cur.slot));
  list.push(cur);
  list.sort((a, b) => (b.date + b.slot).localeCompare(a.date + a.slot));
  const cutoff = kst(new Date(now.getTime() - 14 * 86400000)).toISOString().slice(0, 10);
  return list.filter((e) => e.date >= cutoff);
};
module.exports.build = build;
