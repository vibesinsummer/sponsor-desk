// ─────────────────────────────────────────────────────────────
// 공문 작성기 (사이트의 '공문 작성' 탭)
//  · 부서 샘플 공문(docx) 4종과 같은 배치·서식으로 PDF를 만듦
//    (여백·글꼴 크기·빈 줄·표·이미지 크기를 docx 값 그대로 옮김)
//  · 직인 이미지만 "이 브라우저 안에만" 저장 (서버 전송·공개 X)
//
//  ▶ 문구를 바꾸려면 PROGRAMS 의 title/body/items 만 고치면 됩니다.
//    {중괄호} 자리는 자동으로 채워집니다:
//    {프로그램} {횟수} {날짜목록} {금액} {부가세} {연} {월} {노출횟수}
//  ▶ seq: 샘플 문서의 문단 순서 (빈 줄 포함). 기호 뜻:
//    D=기본 빈 줄(문단 뒤 간격 있음)  B=빈 줄  B11=11pt 빈 줄  B15=11pt·1.5줄 빈 줄  T=아주 작은 빈 줄(3pt)
//    P0,P1…=본문 문단  C='- 다 음 -'  I0,I1…=□ 항목  TBL=편성표  N=※ 별첨 문구  DATE=날짜  SIGN=대표이사 명의
//  ▶ inputs: 이 양식에만 필요한 입력칸 — dates(노출 날짜) / schedule(편성표) / count(노출 횟수)
// ─────────────────────────────────────────────────────────────
const SENDER = { company: "제이티비씨(주) 대표이사", name: "전 진 배", prefix: "JTBC" };
const TYPES = ["프로그램 협찬", "캠페인 협찬", "배너 협찬", "기타 공문"];
const P_1 = "1. 국내외 불확실한 경제 상황 속에서도 대한민국 경제발전을 위해 각고의 노력을 기울이고 계신 귀사의 무궁한 발전을 기원합니다.";
const P_2 = "2. 저희 JTBC는 지금까지의 경험을 바탕으로, 보다 알차고 의미있는 프로그램을 지속적으로 기획 및 제작하여 사회적으로 기여할 수 있도록 노력하겠습니다. 또한, 언제나처럼 책임있는 언론의 역할을 충실히 할 것을 약속드립니다. 많은 관심과 질책을 부탁드립니다.";
const PROGRAMS = {
  // ── 프로그램 협찬 ──────────────────────────
  "장르가머니": {
    type: "프로그램 협찬", file: "장르가머니", docx: "assets/templates/genre.docx", inputs: ["dates"], weekday: 5,
    title: "JTBC <{프로그램}> 프로그램 협찬 요청의 건",
    body: [
      P_1, P_2,
      "3. 매주 금요일 방송되는 '{프로그램}'는 뉴스처럼 빠르고, 교양처럼 풍부하며, 리얼리티처럼 생생한 경제 이야기를 전달하는 프로그램으로, 단순한 정보 전달을 넘어  금융소비자 보호라는 공익적 목적을 실현하고자 합니다. 복잡하고 딱딱한 경제 정보를 쉽게 풀어내어 시청자들이 현명한 투자 결정을 내릴 수 있도록 돕고, 투자 리스크에 대한 경각심을 고취시키며, 건전한 금융 문화를 조성하는 데 기여하고 있습니다.",
      "4. 이에 귀사와의 협력을 통해 양사의 브랜드 가치를 함께 높이고 국민의 금융 소양 향상에 기여할 수 있기를 희망하며 제작 지원을 정중히 요청 드리오니, 긍정적인 검토와 적극적인 협조 부탁 드립니다.감사합니다.",
    ],
    items: [
      ["제안 내용", "JTBC <{프로그램}> 프로그램 협찬"],
      ["제공 내역", "프로그램 종료시 기업로고 노출 {횟수}회 ({날짜목록})"],
      ["요청 금액", "{금액}원 (부가세 {부가세})"],
    ],
    note: "※ <{프로그램}> 프로그램 소개서 별첨.",
    seq: "D D P0 B P1 B P2 B P3 B C B11 I0 I1 I2 N B15 DATE B15 SIGN", sign: "indent",
  },
  "예능 프로그램": {
    type: "프로그램 협찬", file: "예능프로그램", docx: "assets/templates/yeneung.docx", inputs: ["schedule"],
    title: "JTBC 예능프로그램 협찬 요청의 건",
    body: [
      "1. 국내외 불확실한 경제 상황 속에서도 대한민국 경제발전을 위해 각고의 노력을 기울이며, 국민의 금융 동반자로서 따뜻하고 신뢰받는 서비스를 제공해 오신 귀사의 노고에 깊은 존경과 감사를 드립니다.",
      P_2,
      "3. JTBC는 창의적 기획과 진정성 있는 스토리텔링을 바탕으로 시청자들의 삶 속에 따뜻한 울림을 전하는 예능 프로그램을 제작해오고 있습니다. 웃음이라는 형식을 통해 세대를 아우르는 공감의 가치를 전하는 것이 JTBC 예능이 추구하는 중심 철학입니다.",
      "4. 이에 귀사의 사회공헌 철학과 금융 브랜드 이미지가 JTBC의 예능 프로그램의 취지와 깊이 맞닿아 있어 협찬 참여를 정중히 제안드리오니, 모쪼록 긍정적인 검토와 적극적인 협조를 부탁드립니다.",
      "감사합니다.",
    ],
    items: [
      ["제안 내용", "JTBC 예능 프로그램 협찬"],
      ["제공 내역", "프로그램 종료시 기업로고 노출 {횟수}회"],
      ["요청 금액", "{금액}원 (부가세 {부가세})"],
    ],
    tableHead: ["프로그램명", "편성", "개요", "방영일"],
    tableCols: ["27.5mm", "27.4mm", "65mm", "20.1mm"],
    schedule: "아는형님 | 토 21:00 | 형님학교에서 펼쳐지는 버라이어티 | \n톡파원25시 | 월 20:50 | 톡파원들이 전하는 각 나라 소식 | ",
    seq: "D P0 B P1 B P2 B P3 B P4 B C B11 I0 I1 T TBL T I2 B15 DATE B15 SIGN", sign: "center", signLead: "    ",
  },
  // ── 캠페인 협찬 ────────────────────────────
  "환경캠페인": {
    type: "캠페인 협찬", file: "환경캠페인", docx: "assets/templates/campaign.docx", inputs: ["count"], count: "23",
    title: "JTBC 환경캠페인 협찬 요청의 건",
    body: [
      P_1, P_2,
      "3. JTBC는 기후위기와 직면한 현대사회의 해법을 실천하고자 하는 의지를 담아 ‘JTBC 환경캠페인’을 진행하고 있습니다. 환경캠페인의 메인 슬로건은 ‘Coloring Your World, Coloring You Earth!’로서, 잃어가고 있는 지구의 색을 회복하고 찾자는 의미입니다. ‘지구-미래-내일’을 연결하는 주제를 지속적으로 알려 시청자들과 국민의 공감을 이끌어 내겠습니다. 이는 사회적 공기(公器)로서의 역할과 사회의 善순환 기능을 방기하지 않겠다는 저희의 다짐이기도 합니다.",
      "4. 이에 다음과 같이 귀사의 캠페인 제작 및 방송 편성에 따른 협찬 지원을 정중히 요청드리는 바입니다. 모쪼록 긍정적인 검토와 적극적인 협조를 부탁드립니다. 감사합니다.",
    ],
    items: [
      ["제안 내용", "JTBC 환경캠페인 제작 편성"],
      ["제공 내역", "캠페인 영상 內 협찬 기업 로고 노출 등"],
      ["요청 금액", "{금액}원 (부가세 {부가세})"],
      ["노출 횟수", "월 {노출횟수}회 전후 (60초 기준)"],
    ],
    seq: "D D P0 B P1 B P2 B P3 B C B11 I0 I1 I2 I3 B15 DATE B15 SIGN", sign: "center", signLead: "    ",
  },
  // ── 배너 협찬 ──────────────────────────────
  "온라인 배너": {
    type: "배너 협찬", file: "온라인 배너", docx: "assets/templates/banner.docx", inputs: [], datePad: true,
    title: "JTBC 온라인 배너광고 게재 요청의 건",
    body: [
      P_1, P_2,
      "3. 이에 다음과 같이 귀사의 온라인 배너광고 참여를 정중히 요청드리는 바입니다. 모쪼록 긍정적인 검토를 부탁드리며, 양사간 돈독한 우호관계를 위한 좋은 기회가 되기를 희망합니다. 감사합니다.",
    ],
    items: [
      ["제안 내용", "JTBC 뉴스홈페이지 및 모바일 배너 광고"],
      ["게재 기간", "{연}년 {월}월중"],
      ["요청 금액", "{금액}원 (부가세 {부가세})"],
      ["광고 규격", "PC – 1216 × 100 px / 모바일 – 353 × 100 px (메인 홈 / 메인 홈)"],
    ],
    seq: "D D D P0 B P1 B P2 B B B C B11 I0 I1 I2 I3 B B11 DATE B15 SIGN", sign: "center", signLead: " ",
  },
};

(function () {
  const LS = {
    get(k, d) { try { const v = localStorage.getItem("gm." + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem("gm." + k, JSON.stringify(v)); } catch {} },
    del(k) { try { localStorage.removeItem("gm." + k); } catch {} },
  };
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = (n) => String(n).padStart(2, "0");
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const thisMonth = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; };

  function hangul(n) {
    n = Math.floor(Math.abs(+n || 0));
    if (!n) return "영";
    const D = ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"], S = ["", "십", "백", "천"], B = ["", "만", "억", "조"];
    let out = "", g = 0;
    while (n > 0) {
      const part = n % 10000;
      if (part) { let s = ""; String(part).padStart(4, "0").split("").forEach((c, i) => { if (+c) s += D[+c] + S[3 - i]; }); out = s + B[g] + out; }
      n = Math.floor(n / 10000); g++;
    }
    return out;
  }
  function airDates(ym, weekday) {
    const [y, m] = ym.split("-").map(Number);
    if (!y || !m || weekday == null) return "";
    const out = [];
    for (let d = 1; d <= new Date(y, m, 0).getDate(); d++) if (new Date(y, m - 1, d).getDay() === weekday) out.push(`${m}/${d}`);
    return out.join(", ");
  }

  const firstProgram = Object.keys(PROGRAMS)[0];
  const st = {
    co: "", ref: "홍보실", schedule: "", count: "", type: PROGRAMS[firstProgram].type, program: firstProgram,
    month: thisMonth(), dates: "", amount: "", vat: "별도", date: today(), docnum: LS.get("lastDocnum", ""),
    seal: LS.get("seal", null),
  };
  const CUSTOM = () => LS.get("custom", {});
  const BASE = (name) => PROGRAMS[name] || CUSTOM()[name];
  const ALLNAMES = () => [...Object.keys(PROGRAMS), ...Object.keys(CUSTOM())];
  const P = () => {
    const b = BASE(st.program) || PROGRAMS[firstProgram];
    const o = LS.get("tpl." + st.program, null);
    return o ? Object.assign({}, b, o) : b;
  };
  const edited = () => !!LS.get("tpl." + st.program, null);
  const has = (k) => (P().inputs || []).includes(k);
  const namesOf = (t) => ALLNAMES().filter((k) => (BASE(k) || {}).type === t);
  const scheduleRows = () => st.schedule.split("\n").map((l) => l.split("|").map((c) => c.trim())).filter((r) => r[0]);
  const amountNum = () => +String(st.amount).replace(/[^0-9]/g, "") || 0;
  function resetForProgram() {
    const p = P();
    st.dates = airDates(st.month, p.weekday);
    st.schedule = LS.get("schedule." + st.program, p.schedule || "");
    st.count = LS.get("count." + st.program, p.count || "");
  }
  resetForProgram();

  function fill(t) {
    const list = st.dates.split(",").map((s) => s.trim()).filter(Boolean);
    const [yy, mm] = st.month.split("-").map(Number);
    const amt = amountNum();
    const map = {
      프로그램: st.program, 연: yy || "", 월: mm || "", 노출횟수: st.count || "",
      횟수: (has("schedule") ? scheduleRows().length : list.length) || "",
      날짜목록: list.join(", "), 금액: amt ? amt.toLocaleString("ko-KR") : "", 부가세: st.vat,
    };
    return t.replace(/\{(\S+?)\}/g, (_, k) => (k in map ? map[k] : _));
  }
  function docCode() {
    const [y, m] = (st.date || today()).split("-");
    return `${SENDER.prefix} ${y}-${m}-${st.docnum || ""}`;
  }
  function dateText() {
    const [y, m, d] = (st.date || "").split("-").map(Number);
    if (!y) return "";
    return P().datePad ? `${y}년  ${pad(m)}월  ${pad(d)}일` : `${y}년 ${m}월 ${d}일`;
  }

  // ───────── 공문 종이(A4) — 샘플 docx 의 문단 순서·서식 그대로 ─────────
  function block(tok, p) {
    const x = (cls, html = "") => `<div class="${cls}">${html || "&nbsp;"}</div>`;
    if (tok === "D") return x("w-p w-def");
    if (tok === "B") return x("w-p");
    if (tok === "B11") return x("w-p w-11");
    if (tok === "B15") return x("w-p w-11 w-15");
    if (tok === "T") return x("w-p w-3");
    if (tok === "C") return x("w-p w-c", "- 다&nbsp;&nbsp;&nbsp;음 –");
    if (tok === "N") return x("w-p", esc(fill(p.note || "")));
    if (tok === "DATE") return x("w-p w-11 w-15 w-c", esc(dateText()).replace(/  /g, "&nbsp;&nbsp;"));
    if (tok === "SIGN") {
      const seal = st.seal ? `<img class="w-seal" src="${st.seal}" alt="">` : "";
      const inner = `<b>${esc(SENDER.company)}&nbsp;&nbsp;</b><span class="w-name">${esc(SENDER.name)}${seal}</span>`;
      return p.sign === "indent" ? x("w-p w-14 w-sign-indent", inner) : x("w-p w-14 w-c", `<b class="w-lead">${(p.signLead || "").replace(/ /g, "&nbsp;")}</b>${inner}`);
    }
    if (tok === "TBL") {
      const head = p.tableHead, cols = p.tableCols || [];
      return `<table class="w-tbl"><colgroup>${cols.map((c) => `<col style="width:${c}">`).join("")}</colgroup>
        <tr>${head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr>
        ${scheduleRows().map((r) => `<tr>${head.map((_, i) => `<td>${esc(r[i] || "")}</td>`).join("")}</tr>`).join("")}</table>`;
    }
    let m;
    if ((m = /^P(\d+)$/.exec(tok))) return x("w-p", esc(fill(p.body[+m[1]] || "")));
    if ((m = /^I(\d+)$/.exec(tok))) { const it = p.items[+m[1]]; return it ? x("w-p", `□ ${esc(it[0])} : ${esc(fill(it[1]))}`) : ""; }
    return "";
  }
  function paper() {
    const p = P();
    return `<div class="gm-paper" id="gmPaper">
      <table class="w-head">
        <colgroup><col style="width:20mm"><col style="width:115.1mm"><col style="width:30mm"></colgroup>
        <tr class="w-r0"><td></td><td></td><td class="w-top"><img class="w-logo" src="assets/gm-logo.png" alt="JTBC"></td></tr>
        <tr><td><b>문서기호</b></td><td>${esc(docCode())}</td><td rowspan="4" class="w-top"><img class="w-addr" src="assets/gm-addr.png" alt=""></td></tr>
        <tr><td><b>수&nbsp;&nbsp;&nbsp;&nbsp;신</b></td><td>${esc(st.co)}</td></tr>
        <tr><td><b>참&nbsp;&nbsp;&nbsp;&nbsp;조</b></td><td>${esc(st.ref)}</td></tr>
        <tr><td><b>제&nbsp;&nbsp;&nbsp;&nbsp;목</b></td><td><b>${esc(fill(p.title))}</b></td></tr>
      </table>
      ${p.seq.split(/\s+/).map((t) => block(t, p)).join("")}
    </div>`;
  }

  function field(id, label, val, attrs = "") {
    return `<label class="gm-f"><span>${label}</span><input id="${id}" value="${esc(val)}" ${attrs}></label>`;
  }

  // ───────── 문구 수정 ─────────
  function editorHtml() {
    const p = P();
    return `<details class="gm-set" id="gmEdit" ${st.editOpen ? "open" : ""}><summary>문구 수정 <small>${edited() ? "<b class='gm-edited'>수정됨</b> · " : ""}제목·본문·항목을 고치면 이 브라우저의 '${esc(st.program)}' 양식에 저장</small></summary>
      <div class="gm-fields">
        <label class="gm-f"><span>제목</span><input id="gt_title" value="${esc(p.title)}"></label>
        ${p.body.map((b, i) => `<label class="gm-f"><span>본문 ${i + 1}</span><textarea id="gt_body_${i}" rows="${Math.min(7, Math.ceil(b.length / 42) + 1)}">${esc(b)}</textarea></label>`).join("")}
        ${p.items.map((it, i) => `<div class="gm-row gm-row-item"><label class="gm-f"><span>항목 ${i + 1} 이름</span><input id="gt_ik_${i}" value="${esc(it[0])}"></label><label class="gm-f"><span>내용</span><input id="gt_iv_${i}" value="${esc(it[1])}"></label></div>`).join("")}
        ${p.note != null ? `<label class="gm-f"><span>별첨 문구</span><input id="gt_note" value="${esc(p.note)}"></label>` : ""}
        <p class="gm-muted" style="padding:0">{금액} {부가세} {횟수} {날짜목록} {노출횟수} {연} {월} {프로그램} 자리는 입력값으로 자동으로 채워집니다.</p>
        <div class="gm-actions" style="padding:0">${edited() ? `<button type="button" class="gm-btn" data-gmreset="1">원래 문구로 되돌리기</button>` : ""}
          ${CUSTOM()[st.program] ? `<button type="button" class="gm-btn" data-gmdelcustom="1">이 올린 양식 삭제</button>` : ""}</div>
      </div></details>`;
  }
  function onEdit(e) {
    const id = e.target.id, p = P();
    const o = LS.get("tpl." + st.program, null) || { title: p.title, body: [...p.body], items: p.items.map((x) => [...x]), note: p.note };
    let m;
    if (id === "gt_title") o.title = e.target.value;
    else if (id === "gt_note") o.note = e.target.value;
    else if ((m = /^gt_body_(\d+)$/.exec(id))) o.body[+m[1]] = e.target.value;
    else if ((m = /^gt_ik_(\d+)$/.exec(id))) o.items[+m[1]][0] = e.target.value;
    else if ((m = /^gt_iv_(\d+)$/.exec(id))) o.items[+m[1]][1] = e.target.value;
    else return;
    LS.set("tpl." + st.program, o);
    refreshPreview();
  }

  // ───────── 새 공문 양식 올리기 (docx) ─────────
  function uploadHtml() {
    return `<details class="gm-set"><summary>새 공문 양식 올리기 <small>docx 공문을 올리면 그 서식으로 PDF·Word를 만듦 · 이 브라우저에 저장</small></summary>
      <div class="gm-fields">
        <div class="gm-row">
          <label class="gm-f"><span>양식 이름</span><input id="gu_name" placeholder="예: 신년 특집 프로그램"></label>
          <label class="gm-f"><span>공문 유형</span><select id="gu_type">${TYPES.map((t) => `<option>${esc(t)}</option>`).join("")}</select></label>
        </div>
        <label class="gm-btn" style="align-self:flex-start">docx 파일 선택<input type="file" id="gu_file" accept=".docx" hidden></label>
        <p class="gm-muted" style="padding:0">부서 샘플과 같은 구조(수신·참조·제목 표, 본문, '- 다 음 -', □ 항목, 날짜)면 자동으로 읽습니다. 다른 사람도 쓰게 하려면 파일을 관리자에게 보내 기본 양식으로 넣으면 됩니다.</p>
      </div></details>`;
  }

  // ───────── docx 다루기 (원본 서식 그대로 내용만 바꿈) ─────────
  const W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
  let zipLib = null;
  function loadZip() {
    if (window.JSZip) return Promise.resolve();
    if (zipLib) return zipLib;
    zipLib = new Promise((ok, no) => {
      const s2 = document.createElement("script");
      s2.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
      s2.onload = ok; s2.onerror = () => { zipLib = null; no(new Error("load")); };
      document.head.appendChild(s2);
    });
    return zipLib;
  }
  const tOf = (p) => [...p.getElementsByTagNameNS(W, "t")].map((t) => t.textContent).join("");
  function setText(p, text) {
    const ts = [...p.getElementsByTagNameNS(W, "t")];
    if (!ts.length) return;
    ts[0].textContent = text; ts[0].setAttribute("xml:space", "preserve");
    ts.slice(1).forEach((t) => { t.textContent = ""; });
  }
  // 문서 구조 읽기: 머리 표(수신·참조·제목), 본문 문단, 다음, □ 항목, ※, 날짜, 편성표
  function readDoc(doc) {
    const body = doc.getElementsByTagNameNS(W, "body")[0];
    const blocks = [...body.childNodes].filter((n) => n.namespaceURI === W && (n.localName === "p" || n.localName === "tbl"));
    const out = { head: {}, code: null, body: [], items: [], note: null, date: null, sched: null };
    const headTbl = blocks.find((b) => b.localName === "tbl" && /수\s*신/.test(tOf(b)));
    if (headTbl) {
      for (const tr of headTbl.getElementsByTagNameNS(W, "tr")) {
        const tcs = [...tr.childNodes].filter((n) => n.localName === "tc");
        if (tcs.length < 2) continue;
        const label = tOf(tcs[0]).replace(/\s/g, ""), cellP = tcs[1].getElementsByTagNameNS(W, "p")[0];
        if (label === "문서기호") out.code = cellP;
        if (["수신", "참조", "제목"].includes(label)) out.head[label] = cellP;
      }
    }
    let stage = "body";
    for (const b of blocks) {
      if (b === headTbl) continue;
      if (b.localName === "tbl") { if (stage === "items") out.sched = b; continue; }
      const t = tOf(b).trim();
      if (!t) continue;
      if (/^-\s*다\s*음\s*[-–]/.test(t)) { stage = "items"; continue; }
      if (/^\d{4}년\s*\d{1,2}월\s*\d{1,2}일$/.test(t)) { out.date = b; stage = "end"; continue; }
      if (stage === "body") out.body.push(b);
      else if (stage === "items") { if (/^※/.test(t)) out.note = b; else out.items.push(b); }
    }
    return out;
  }
  async function templateBuffer(p) {
    if (p.docxData) { const bin = atob(p.docxData.split(",")[1]); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u.buffer; }
    const r = await fetch(p.docx); if (!r.ok) throw new Error("틀 없음"); return r.arrayBuffer();
  }
  async function downloadDocx() {
    const msg = document.getElementById("gmMsg");
    if (!st.co || !amountNum()) { msg.textContent = "수신(협찬처)과 요청 금액을 입력해 주세요."; return; }
    const p = P();
    if (!p.docx && !p.docxData) { msg.textContent = "이 양식은 Word 틀이 없어 PDF로만 받을 수 있습니다."; return; }
    msg.textContent = "Word 파일 만드는 중…";
    try {
      await loadZip();
      const zip = await window.JSZip.loadAsync(await templateBuffer(p));
      const xml = await zip.file("word/document.xml").async("string");
      const doc = new DOMParser().parseFromString(xml, "application/xml");
      const d = readDoc(doc);
      if (d.code) setText(d.code, docCode());
      if (d.head["수신"]) setText(d.head["수신"], st.co);
      if (d.head["참조"]) setText(d.head["참조"], st.ref);
      if (d.head["제목"]) setText(d.head["제목"], fill(p.title));
      d.body.forEach((b, i) => setText(b, i < p.body.length ? fill(p.body[i]) : ""));
      d.items.forEach((b, i) => setText(b, i < p.items.length ? `□ ${p.items[i][0]} : ${fill(p.items[i][1])}` : ""));
      if (d.note) setText(d.note, p.note != null ? fill(p.note) : "");
      if (d.date) setText(d.date, dateText());
      if (d.sched && has("schedule")) {
        const trs = [...d.sched.childNodes].filter((n) => n.localName === "tr");
        const tpl = trs[1];
        if (tpl) {
          trs.slice(1).forEach((tr) => tr.parentNode.removeChild(tr));
          for (const r of scheduleRows()) {
            const tr = tpl.cloneNode(true);
            [...tr.childNodes].filter((n) => n.localName === "tc").forEach((tc, i) => { const pp = tc.getElementsByTagNameNS(W, "p")[0]; if (pp) setText(pp, r[i] || ""); });
            d.sched.appendChild(tr);
          }
        }
      }
      zip.file("word/document.xml", new XMLSerializer().serializeToString(doc));
      const blob = await zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      const name = `${(st.date || "").replace(/-/g, "")}_JTBC ${p.file || st.program} 협찬 공문_${st.co}.docx`.replace(/[\\/:*?"<>|]/g, "");
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      remember();
      msg.textContent = `저장했습니다: ${name}`;
    } catch (e) {
      msg.textContent = "Word 파일을 만들지 못했습니다. 인터넷 연결을 확인한 뒤 다시 눌러 주세요.";
    }
  }
  async function uploadTemplate(file) {
    const msg = document.getElementById("gmMsg");
    const name = (document.getElementById("gu_name").value || "").trim() || file.name.replace(/\.docx$/i, "").replace(/^\d{8}_/, "").replace(/_[^_]*$/, "").trim();
    const type = document.getElementById("gu_type").value;
    if (PROGRAMS[name]) { msg.textContent = `'${name}'은 기본 양식 이름이라 쓸 수 없습니다. 다른 이름을 넣어 주세요.`; return; }
    msg.textContent = "양식 읽는 중…";
    try {
      await loadZip();
      const buf = await file.arrayBuffer();
      const zip = await window.JSZip.loadAsync(buf);
      const doc = new DOMParser().parseFromString(await zip.file("word/document.xml").async("string"), "application/xml");
      const d = readDoc(doc);
      if (!d.head["제목"] || !d.body.length) { msg.textContent = "공문 구조(수신·참조·제목 표와 본문)를 찾지 못했습니다. 부서 공문 양식인지 확인해 주세요."; return; }
      const items = d.items.map((b) => {
        const t = tOf(b).trim().replace(/^□\s*/, "");
        const i = t.indexOf(":");
        let k = i >= 0 ? t.slice(0, i).trim() : t, v = i >= 0 ? t.slice(i + 1).trim() : "";
        if (/금액/.test(k)) v = "{금액}원 (부가세 {부가세})";
        return [k, v];
      });
      const body = d.body.map((b) => tOf(b).trim());
      const seq = ["D", "D", ...body.flatMap((_, i) => ["P" + i, "B"]), "C", "B11", ...items.map((_, i) => "I" + i), ...(d.note ? ["N"] : []), "B15", "DATE", "B15", "SIGN"].join(" ");
      const dataUrl = await new Promise((ok) => { const r = new FileReader(); r.onload = () => ok(r.result); r.readAsDataURL(file); });
      const all = CUSTOM();
      all[name] = { type, file: name, custom: true, inputs: [], title: tOf(d.head["제목"]).trim(), body, items, note: d.note ? tOf(d.note).trim() : null, seq, sign: "center", signLead: "", docxData: dataUrl };
      LS.set("custom", all);
      if (d.head["참조"]) st.ref = tOf(d.head["참조"]).trim() || st.ref;
      st.type = type; st.program = name; resetForProgram();
      st.editOpen = true;
      window.dispatchEvent(new Event("gm-rerender"));
      setTimeout(() => { const m2 = document.getElementById("gmMsg"); if (m2) m2.textContent = `'${name}' 양식을 등록했습니다. 아래 '문구 수정'에서 내용을 확인해 주세요.`; }, 50);
    } catch (e) {
      msg.textContent = "양식을 읽지 못했습니다. docx 파일인지 확인해 주세요.";
    }
  }
  function remember() {
    LS.set("co." + st.co, { ref: st.ref, program: st.program, amount: amountNum(), vat: st.vat });
    LS.set("lastDocnum", st.docnum);
    const log = LS.get("log", []); log.unshift({ date: st.date, co: st.co, program: P().file || st.program, amount: amountNum(), type: st.type });
    LS.set("log", log.slice(0, 200));
  }

  function html(D) {
    const names = D && D.companies ? D.companies.filter((c) => c.watch && !/전체/.test(c.name)).map((c) => c.name) : [];
    const amt = amountNum();
    return `<div class="gm">
      <div class="gm-grid">
        <form class="panel gm-form" id="gmForm" autocomplete="off" onsubmit="return false">
          <div class="hd"><h2>공문 내용</h2><span class="sub">매달 바뀌는 칸만 입력</span></div>
          <div class="gm-fields">
            <div class="gm-row">
              <label class="gm-f"><span>공문 유형</span><select id="gm_type">${TYPES.filter((t) => namesOf(t).length).map((t) => `<option ${t === st.type ? "selected" : ""}>${esc(t)}</option>`).join("")}</select></label>
              <label class="gm-f"><span>양식</span><select id="gm_program">${namesOf(st.type).map((k) => `<option value="${esc(k)}" ${k === st.program ? "selected" : ""}>${esc(k)}${CUSTOM()[k] ? " (올린 양식)" : ""}</option>`).join("")}</select></label>
            </div>
            <div class="gm-row">
              ${field("gm_co", "수신 (협찬처 정식 명칭)", st.co, 'placeholder="예: 엔에이치투자증권㈜"')}
              ${field("gm_ref", "참조", st.ref, 'placeholder="예: 홍보실"')}
            </div>
            <div class="gm-row">
              ${field("gm_month", "협찬 월", st.month, 'type="month"')}
              ${field("gm_date", "문서 날짜", st.date, 'type="date"')}
            </div>
            ${has("dates") ? field("gm_dates", "로고 노출 날짜 (쉼표로 구분, 자동 채움)", st.dates, 'placeholder="예: 10/24, 10/31"') : ""}
            ${has("count") ? field("gm_count", "월 노출 횟수", st.count, 'inputmode="numeric" placeholder="예: 23"') : ""}
            ${has("schedule") ? `<label class="gm-f"><span>편성표 — 한 줄에 한 프로그램, 칸은 | 로 구분 (프로그램명 | 편성 | 개요 | 방영일)</span><textarea id="gm_schedule" rows="4">${esc(st.schedule)}</textarea></label>` : ""}
            <div class="gm-row">
              ${field("gm_amount", "요청 금액(원)", amt ? amt.toLocaleString("ko-KR") : "", 'inputmode="numeric" placeholder="예: 10,000,000"')}
              <label class="gm-f"><span>부가세</span><select id="gm_vat"><option ${st.vat === "별도" ? "selected" : ""}>별도</option><option ${st.vat === "포함" ? "selected" : ""}>포함</option></select></label>
            </div>
            <div class="gm-han" id="gmHan">${amt ? `금 ${hangul(amt)}원` : "&nbsp;"}</div>
            ${field("gm_docnum", `문서기호 번호 <small id="gmCode">${esc(docCode())}</small>`, st.docnum, 'inputmode="numeric" placeholder="예: 2013"')}
          </div>
          <div class="gm-actions">
            <button type="button" class="gm-btn primary" id="gmPdf">PDF 다운로드</button>
            <button type="button" class="gm-btn" id="gmDocx">Word 다운로드</button>
            <span class="gm-msg" id="gmMsg"></span>
          </div>
${editorHtml()}
          ${uploadHtml()}
          <details class="gm-set"><summary>직인 이미지 <small>${st.seal ? "등록됨" : "미등록"} · 이 브라우저에만 저장, 사이트에 올라가지 않음</small></summary>
            <div class="gm-seal-box">
              ${st.seal ? `<img src="${st.seal}" alt="등록된 직인">` : `<span class="gm-muted">배경이 투명한 PNG 권장. 등록하면 대표이사 이름 위에 찍힙니다.</span>`}
              <label class="gm-btn">이미지 선택<input type="file" id="gm_img_seal" accept="image/*" hidden></label>
              ${st.seal ? `<button type="button" class="gm-btn" data-gmdel="seal">삭제</button>` : ""}
            </div>
            <p class="gm-muted">공용 PC에서는 사용 후 '삭제'를 눌러 주세요.</p>
          </details>
        </form>
        <div class="gm-preview-wrap" id="gmWrap"><div class="gm-scale" id="gmScale">${paper()}</div></div>
      </div>
    </div>`;
  }

  function setVal(id, v) { const el = document.getElementById(id); if (el) el.value = v; }
  function refreshPreview() {
    const sc = document.getElementById("gmScale"); if (!sc) return;
    sc.innerHTML = paper();
    const amt = amountNum();
    const h = document.getElementById("gmHan"); if (h) h.innerHTML = amt ? `금 ${hangul(amt)}원` : "&nbsp;";
    const c = document.getElementById("gmCode"); if (c) c.textContent = docCode();
    fit();
  }
  function fit() {
    const w = document.getElementById("gmWrap"), sc = document.getElementById("gmScale"), p = document.getElementById("gmPaper");
    if (!w || !sc || !p) return;
    const k = Math.min(1, (w.clientWidth - 24) / p.offsetWidth);
    sc.style.transform = `scale(${k})`;
    sc.style.height = p.offsetHeight * k + "px";
  }

  let lib = null;
  function loadLib() {
    if (window.html2pdf) return Promise.resolve();
    if (lib) return lib;
    lib = new Promise((ok, no) => {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      s.onload = ok; s.onerror = () => { lib = null; no(new Error("load")); };
      document.head.appendChild(s);
    });
    return lib;
  }
  async function download() {
    const msg = document.getElementById("gmMsg");
    if (!st.co || !amountNum()) { msg.textContent = "수신(협찬처)과 요청 금액을 입력해 주세요."; return; }
    msg.textContent = "PDF 만드는 중…";
    try {
      await loadLib();
      const holder = document.createElement("div");
      holder.style.cssText = "position:fixed;left:-10000px;top:0;";
      holder.innerHTML = paper();
      holder.firstElementChild.classList.add("gm-print");
      document.body.appendChild(holder);
      await Promise.all([...holder.querySelectorAll("img")].map((im) => (im.complete ? 0 : new Promise((r) => { im.onload = im.onerror = r; }))));
      const ymd = (st.date || "").replace(/-/g, "");
      const name = `${ymd}_JTBC ${P().file || st.program} 협찬 공문_${st.co}.pdf`.replace(/[\\/:*?"<>|]/g, "");
      await window.html2pdf().set({
        margin: 0, filename: name,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, backgroundColor: "#ffffff" },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      }).from(holder.firstElementChild).save();
      holder.remove();
      remember();
      msg.textContent = `저장했습니다: ${name}`;
    } catch (e) {
      msg.textContent = "PDF를 만들지 못했습니다. 인터넷 연결을 확인한 뒤 다시 눌러 주세요.";
    }
  }

  function onInput(e) {
    const id = e.target.id; if (!id || !id.startsWith("gm_") || id.startsWith("gm_img_") || id === "gm_type") return;
    const k = id.slice(3);
    if (k === "amount") { const n = e.target.value.replace(/[^0-9]/g, ""); st.amount = n; e.target.value = n ? (+n).toLocaleString("ko-KR") : ""; }
    else st[k] = e.target.value;
    if (k === "program") { resetForProgram(); window.dispatchEvent(new Event("gm-rerender")); return; }
    if (k === "month") { st.dates = airDates(st.month, P().weekday); setVal("gm_dates", st.dates); }
    if (k === "schedule" || k === "count") LS.set(k + "." + st.program, st[k]);
    if (k === "co") {
      const prev = LS.get("co." + st.co, null);
      if (prev) {
        Object.assign(st, { ref: prev.ref, amount: String(prev.amount), vat: prev.vat });
        setVal("gm_ref", prev.ref); setVal("gm_amount", (+prev.amount).toLocaleString("ko-KR")); setVal("gm_vat", prev.vat);
        if (BASE(prev.program) && prev.program !== st.program) { st.program = prev.program; st.type = BASE(prev.program).type; resetForProgram(); window.dispatchEvent(new Event("gm-rerender")); return; }
        const msg = document.getElementById("gmMsg"); if (msg) msg.textContent = "지난번 이 협찬처에 보낸 내용을 불러왔습니다.";
      }
    }
    refreshPreview();
  }

  let bound = false;
  function mount() {
    fit();
    document.querySelectorAll("#gmPaper img").forEach((im) => { if (!im.complete) im.onload = fit; });
    if (bound) return; bound = true;
    document.addEventListener("input", (e) => {
      if (!(e.target.closest && e.target.closest("#gmForm"))) return;
      if ((e.target.id || "").startsWith("gt_")) onEdit(e); else onInput(e);
    });
    document.addEventListener("toggle", (e) => { if (e.target.id === "gmEdit") st.editOpen = e.target.open; }, true);
    document.addEventListener("change", (e) => {
      const id = e.target.id || "";
      if (id === "gm_type") { st.type = e.target.value; st.program = namesOf(st.type)[0]; resetForProgram(); window.dispatchEvent(new Event("gm-rerender")); return; }
      if (["gm_vat", "gm_month", "gm_date", "gm_program"].includes(id)) onInput(e);
      if (id === "gu_file" && e.target.files[0]) { uploadTemplate(e.target.files[0]); return; }
      if (id === "gm_img_seal" && e.target.files[0]) {
        const r = new FileReader();
        r.onload = () => { st.seal = r.result; LS.set("seal", r.result); window.dispatchEvent(new Event("gm-rerender")); };
        r.readAsDataURL(e.target.files[0]);
      }
    });
    document.addEventListener("click", (e) => {
      if (e.target.id === "gmPdf") download();
      if (e.target.id === "gmDocx") downloadDocx();
      if (e.target.dataset && e.target.dataset.gmreset) { LS.del("tpl." + st.program); st.editOpen = true; window.dispatchEvent(new Event("gm-rerender")); }
      if (e.target.dataset && e.target.dataset.gmdelcustom) {
        const all = CUSTOM(); delete all[st.program]; LS.set("custom", all); LS.del("tpl." + st.program);
        st.type = PROGRAMS[firstProgram].type; st.program = firstProgram; resetForProgram(); window.dispatchEvent(new Event("gm-rerender"));
      }
      if (e.target.dataset && e.target.dataset.gmdel === "seal") { st.seal = null; LS.del("seal"); window.dispatchEvent(new Event("gm-rerender")); }
    });
    window.addEventListener("resize", fit);
  }

  window.GM = { html, mount, hangul, airDates };
})();
