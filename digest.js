// 인사·부고 단체 메시지 자동 작성 — 부서에서 실제 공유해 온 양식·선별 기준 그대로
//
//  보내는 때
//   · 평일 오전(10시 업데이트) / 오후(16시 업데이트) 하루 2번
//   · 주말은 오전·오후 구분 없이 하루 1번 ("11월 22일  기업인사 내용입니다.")
//   · 각 메시지는 "직전 메시지 이후" 올라온 소식만 담음 (월요일 오전 = 일요일 메시지 이후)
//
//  선별 기준 (그동안 공유한 메시지 기준)
//   · 인사: 기업·그룹·금융 업계 단체(예: 은행연합회) 인사. 정부·공공기관·대학·병원·언론사 등은 제외
//   · 부고: 기업 회장·부회장·사장·대표급 본인/가족 부고만 (팀장·임원·전직·기자 등 제외)
//
//  메시지 형식
//    11월 23일 오후 기업인사 내용입니다.
//    참고 부탁드립니다.
//    (인사: 삼성글로벌리서치, 애경그룹/ 부고: 없음)
//
//    인사
//    삼성글로벌리서치: https://www.yna.co.kr/view/...?section=people/personnel
const cfg = require("./config");

// 기업이 아닌 곳 (기관명 끝말)
const EXCLUDE = /(부|청|처|위원회|시|도|군|구|공사|공단|대학교|대학|학교|학원|병원|의료원|법원|검찰청|경찰청|국회|교육원|교육청|재단|진흥원|연구원|연구소|공항|항만|신문|일보|방송|뉴스|통신|매거진|미디어|언론|TV|KBS|MBC|SBS|EBS|YTN|CBS|MBN|센터|박물관|미술관|관|원)$/;
// 기업이 아닌 곳 (이름에 들어 있으면 제외)
const EXCLUDE_ANY = /신문|일보|방송|뉴스|헤럴드|리뷰|타임스|데일리|투데이|저널|미디어|매거진|KBS|MBC|SBS|EBS|YTN|CBS|국회|시청|구청|도청|군청|경찰|검찰|법원|정부|부처|국립|공단|공사$/;
// 일반 기사 제목 첫 단어가 기관명이 아닌 경우
const NOT_ORG = /^(차기|신임|새|신규|올해|내년|첫|전|前|현|故|이번|정기|그룹|회장|사장|대표|대기업|재계|기업|금융권|업계|주요|서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)$/;
// 언론사지만 그동안 공유해 온 곳 (예외로 포함)
const MEDIA_OK = /^(연합뉴스|연합뉴스TV)$/;
const IS_PERSONNEL = /인사|선임|승진|내정|취임|대표|사장|회장|임원|CEO/;
// 부고: 회장·사장·대표급만
const OBIT_ROLE = /(부회장|회장|사장|대표이사|대표|의장|창업주|오너)/;
const OBIT_ROLE_EXCLUDE = /부사장|기자|교수|의원|장관|논설|국장|PD|앵커|변호사|판사|검사|원장|총장|이사장|협회|조합/;

const KST = 9 * 3600 * 1000;
const kst = (d = new Date()) => new Date(d.getTime() + KST); // UTC 필드로 한국 시각을 읽기 위한 변환
function ynaDate(t, now) {
  const m = /^(\d{2})-(\d{2}) (\d{2}):(\d{2})$/.exec(t || "");
  if (!m) return null;
  let y = kst(now).getUTCFullYear();
  if (+m[1] > kst(now).getUTCMonth() + 1) y--;
  return new Date(Date.UTC(y, +m[1] - 1, +m[2], +m[3], +m[4]) - KST);
}
const kstAt = (k, hh) => new Date(Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate(), hh) - KST);
const isWeekend = (k) => [0, 6].includes(k.getUTCDay());

function slotOf(now) {
  const k = kst(now);
  if (isWeekend(k)) return "";
  return k.getUTCHours() < 13 ? "오전" : "오후";
}
// 직전 메시지가 없을 때 쓰는 기본 시작 시각
function defaultFrom(now) {
  const k = kst(now), slot = slotOf(now);
  if (slot === "오후") return kstAt(k, 10);
  const prev = new Date(k.getTime()); prev.setUTCDate(prev.getUTCDate() - 1);
  return kstAt(prev, 16);
}

const cleanLabel = (s) => s.replace(/^\[인사\]\s*/, "").replace(/[,，…·]+$/, "").trim();
// 제목에 들어 있는 관심 기업 표기 그대로 (예: '전국은행연합회' 대신 기사 속 '은행연합회')
function matchedWord(title) {
  for (const c of cfg.companies) for (const w of c.match) if (w.length >= 2 && title.includes(w)) return w;
  return null;
}
function personnelLabel(p) {
  const t = p.title;
  if (/^\[인사\]/.test(t)) return cleanLabel(t);
  if (!IS_PERSONNEL.test(t)) return null;
  const first = cleanLabel(t.split(/[\s…]/)[0]).replace(/['"‘’“”]/g, "");
  const known = matchedWord(t);
  // 첫 단어에 관심 기업 이름이 없고 기사에는 있으면(예: '이재근 KB금융 회장…') 기업 이름을 씀
  if (known && !(first || "").includes(known)) return known;
  if (first && !NOT_ORG.test(first) && /[가-힣A-Za-z]/.test(first) && first.length <= 20) return first;
  return known;
}
function obitLabel(o) {
  if (!/^\[부고\]/.test(o.title)) return null;
  const m = /\(([^)]+)\)/.exec(o.title);
  if (!m) return null;
  const aff = m[1].trim();
  if (/^(전|前)\s/.test(aff) || OBIT_ROLE_EXCLUDE.test(aff) || !OBIT_ROLE.test(aff)) return null;
  const org = aff.split(/\s+/)[0];
  if (!org || OBIT_ROLE.test(org) || EXCLUDE.test(org) || EXCLUDE_ANY.test(org) || /스포츠|엔터|매거진/.test(org)) return null;
  return org;
}

function build(D, now = new Date(), from = defaultFrom(now)) {
  const slot = slotOf(now), to = now;
  const inWin = (t) => { const d = ynaDate(t, now); return d && d > from && d <= to; };
  const seen = new Set(), people = [];
  for (const p of D.personnel || []) {
    if (!inWin(p.time)) continue;
    const label = personnelLabel(p);
    if (!label || seen.has(label) || (!MEDIA_OK.test(label) && (EXCLUDE.test(label) || EXCLUDE_ANY.test(label)))) continue;
    seen.add(label);
    people.push({ label, link: p.link + "?section=people/personnel" });
  }
  const seenO = new Set(), obits = [];
  for (const o of D.obituary || []) {
    if (!inWin(o.time)) continue;
    const label = obitLabel(o);
    if (!label || seenO.has(o.link)) continue;
    seenO.add(o.link);
    obits.push({ label, link: o.link + "?section=people/obituary-notice", title: o.title.replace(/^\[부고\]\s*/, "") });
  }
  const k = kst(now);
  const day = `${k.getUTCMonth() + 1}월 ${k.getUTCDate()}일`;
  const head = `${slot ? `${day} ${slot}` : `${day} `} 기업인사 내용입니다.\n참고 부탁드립니다.\n` +
    `(인사: ${people.map((x) => x.label).join(", ") || "없음"}/ 부고: ${[...new Set(obits.map((x) => x.label))].join(", ") || "없음"})`;
  let text = head;
  if (people.length) text += "\n\n인사\n" + people.map((x) => `${x.label}: ${x.link}`).join("\n");
  if (obits.length) text += "\n\n부고\n" + obits.map((x) => `${x.label}: ${x.link}`).join("\n");
  return { date: k.toISOString().slice(0, 10), slot, made: now.toISOString(), range: [from.toISOString(), to.toISOString()], people, obits, text };
}

// 이번 실행 결과를 기록에 넣기
//  · 같은 날짜·같은 오전/오후(주말은 그날 하나)는 최신으로 교체
//  · 시작 시각 = 직전 '다른' 메시지가 끝난 시각 (없으면 기본값)
//  · 최근 14일 보관
module.exports = function updateDigest(D, prevDigest, now = new Date()) {
  const k = kst(now), date = k.toISOString().slice(0, 10), slot = slotOf(now);
  // 이미 보낸 메시지는 확정: 오전은 10:30, 오후·주말은 17:05 이후 실행에서 다시 고치지 않음
  //  (그 뒤에 올라온 소식은 다음 메시지로 넘어감)
  const hour = k.getUTCHours() + k.getUTCMinutes() / 60;
  const exists = (prevDigest || []).some((e) => e.date === date && e.slot === slot);
  // 작성 시작: 오전 메시지는 10:00 업데이트부터, 오후·주말 메시지는 16:30 업데이트부터 (그 전 실행은 메시지를 건드리지 않음)
  if ((slot === "오전" && hour < 10) || (slot !== "오전" && hour < 16.5)) return prevDigest || [];
  if (exists && ((slot === "오전" && hour >= 10.5) || (slot !== "오전" && hour >= 17.08))) return prevDigest;
  const others =(prevDigest || []).filter((e) => !(e.date === date && e.slot === slot));
  const last = others.filter((e) => e.range && new Date(e.range[1]) < now).sort((a, b) => b.range[1].localeCompare(a.range[1]))[0];
  const from = last ? new Date(last.range[1]) : defaultFrom(now);
  const list = [...others, build(D, now, from)];
  list.sort((a, b) => b.made.localeCompare(a.made));
  const cutoff = kst(new Date(now.getTime() - 14 * 86400000)).toISOString().slice(0, 10);
  return list.filter((e) => e.date >= cutoff);
};
module.exports.build = build;
