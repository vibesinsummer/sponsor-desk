// ─────────────────────────────────────────────────────────────
// 공문 작성기 (사이트의 '공문 작성' 탭)
//  · 협찬처·금액·날짜만 넣으면 프로그램 협찬 요청 공문을 PDF로 내려받음
//  · 발신 명의·주소·로고·직인 이미지는 모두 "이 브라우저 안에만" 저장 (서버로 전송·공개 X)
//
//  ▶ 공문은 3종: 프로그램 협찬 / 캠페인 협찬 / 배너 협찬 (TYPES)
//  ▶ 문구를 바꾸거나 새 프로그램·캠페인·배너를 추가하려면 아래 PROGRAMS 에 한 덩어리 추가
//    type 에 위 3종 중 하나를 적으면 해당 유형 메뉴에 나타납니다.
//    {중괄호} 자리는 자동으로 채워집니다:
//    {프로그램} {횟수} {날짜목록} {금액} {부가세} {연} {월} {노출횟수}
//  ▶ inputs: 이 양식에만 필요한 입력칸 — dates(노출 날짜) / schedule(편성표) / count(노출 횟수)
//  ▶ weekday: 방송 요일 (0=일 1=월 … 5=금 6=토) → 선택한 달의 방송일을 자동으로 채움
//  ▶ 어떤 유형에 등록된 양식이 하나도 없으면 '양식 준비 중'으로 표시되고 PDF가 만들어지지 않습니다.
// ─────────────────────────────────────────────────────────────
const TYPES = ["프로그램 협찬", "캠페인 협찬", "배너 협찬"];
const PROGRAMS = {
  // ── 프로그램 협찬 ──────────────────────────
  "장르가머니": {
    type: "프로그램 협찬", file: "장르가머니",
    inputs: ["dates"],          // 로고 노출 날짜 (방송 요일로 자동 채움)
    weekday: 5,
    title: "JTBC <{프로그램}> 프로그램 협찬 요청의 건",
    body: [
      "1. 국내외 불확실한 경제 상황 속에서도 대한민국 경제발전을 위해 각고의 노력을 기울이고 계신 귀사의 무궁한 발전을 기원합니다.",
      "2. 저희 JTBC는 지금까지의 경험을 바탕으로, 보다 알차고 의미있는 프로그램을 지속적으로 기획 및 제작하여 사회적으로 기여할 수 있도록 노력하겠습니다. 또한, 언제나처럼 책임있는 언론의 역할을 충실히 할 것을 약속드립니다. 많은 관심과 질책을 부탁드립니다.",
      "3. 매주 금요일 방송되는 '{프로그램}'는 뉴스처럼 빠르고, 교양처럼 풍부하며, 리얼리티처럼 생생한 경제 이야기를 전달하는 프로그램으로, 단순한 정보 전달을 넘어 금융소비자 보호라는 공익적 목적을 실현하고자 합니다. 복잡하고 딱딱한 경제 정보를 쉽게 풀어내어 시청자들이 현명한 투자 결정을 내릴 수 있도록 돕고, 투자 리스크에 대한 경각심을 고취시키며, 건전한 금융 문화를 조성하는 데 기여하고 있습니다.",
      "4. 이에 귀사와의 협력을 통해 양사의 브랜드 가치를 함께 높이고 국민의 금융 소양 향상에 기여할 수 있기를 희망하며 제작 지원을 정중히 요청 드리오니, 긍정적인 검토와 적극적인 협조 부탁 드립니다. 감사합니다.",
    ],
    items: [
      ["제안 내용", "JTBC <{프로그램}> 프로그램 협찬"],
      ["제공 내역", "프로그램 종료시 기업로고 노출 {횟수}회 ({날짜목록})"],
      ["요청 금액", "{금액}원 (부가세 {부가세})"],
    ],
    note: "※ <{프로그램}> 프로그램 소개서 별첨.",
  },
  "예능 프로그램": {
    type: "프로그램 협찬", file: "예능프로그램",
    inputs: ["schedule"],       // 편성표 (프로그램명 | 편성 | 개요 | 방영일) — 줄 수가 노출 횟수
    title: "JTBC 예능프로그램 협찬 요청의 건",
    body: [
      "1. 국내외 불확실한 경제 상황 속에서도 대한민국 경제발전을 위해 각고의 노력을 기울이며, 국민의 금융 동반자로서 따뜻하고 신뢰받는 서비스를 제공해 오신 귀사의 노고에 깊은 존경과 감사를 드립니다.",
      "2. 저희 JTBC는 지금까지의 경험을 바탕으로, 보다 알차고 의미있는 프로그램을 지속적으로 기획 및 제작하여 사회적으로 기여할 수 있도록 노력하겠습니다. 또한, 언제나처럼 책임있는 언론의 역할을 충실히 할 것을 약속드립니다. 많은 관심과 질책을 부탁드립니다.",
      "3. JTBC는 창의적 기획과 진정성 있는 스토리텔링을 바탕으로 시청자들의 삶 속에 따뜻한 울림을 전하는 예능 프로그램을 제작해오고 있습니다. 웃음이라는 형식을 통해 세대를 아우르는 공감의 가치를 전하는 것이 JTBC 예능이 추구하는 중심 철학입니다.",
      "4. 이에 귀사의 사회공헌 철학과 금융 브랜드 이미지가 JTBC의 예능 프로그램의 취지와 깊이 맞닿아 있어 협찬 참여를 정중히 제안드리오니, 모쪼록 긍정적인 검토와 적극적인 협조를 부탁드립니다.",
      "감사합니다.",
    ],
    items: [
      ["제안 내용", "JTBC 예능 프로그램 협찬"],
      ["제공 내역", "프로그램 종료시 기업로고 노출 {횟수}회"],
      "TABLE",                  // 편성표가 들어가는 자리
      ["요청 금액", "{금액}원 (부가세 {부가세})"],
    ],
    tableHead: ["프로그램명", "편성", "개요", "방영일"],
    schedule: "아는형님 | 토 21:00 | 형님학교에서 펼쳐지는 버라이어티 | \n톡파원25시 | 월 20:50 | 톡파원들이 전하는 각 나라 소식 | ",
  },
  // ── 캠페인 협찬 ────────────────────────────
  "환경캠페인": {
    type: "캠페인 협찬", file: "환경캠페인",
    inputs: ["count"],          // 월 노출 횟수
    count: "23",
    title: "JTBC 환경캠페인 협찬 요청의 건",
    body: [
      "1. 국내외 불확실한 경제 상황 속에서도 대한민국 경제발전을 위해 각고의 노력을 기울이고 계신 귀사의 무궁한 발전을 기원합니다.",
      "2. 저희 JTBC는 지금까지의 경험을 바탕으로, 보다 알차고 의미있는 프로그램을 지속적으로 기획 및 제작하여 사회적으로 기여할 수 있도록 노력하겠습니다. 또한, 언제나처럼 책임있는 언론의 역할을 충실히 할 것을 약속드립니다. 많은 관심과 질책을 부탁드립니다.",
      "3. JTBC는 기후위기와 직면한 현대사회의 해법을 실천하고자 하는 의지를 담아 ‘JTBC 환경캠페인’을 진행하고 있습니다. 환경캠페인의 메인 슬로건은 ‘Coloring Your World, Coloring You Earth!’로서, 잃어가고 있는 지구의 색을 회복하고 찾자는 의미입니다. ‘지구-미래-내일’을 연결하는 주제를 지속적으로 알려 시청자들과 국민의 공감을 이끌어 내겠습니다. 이는 사회적 공기(公器)로서의 역할과 사회의 善순환 기능을 방기하지 않겠다는 저희의 다짐이기도 합니다.",
      "4. 이에 다음과 같이 귀사의 캠페인 제작 및 방송 편성에 따른 협찬 지원을 정중히 요청드리는 바입니다. 모쪼록 긍정적인 검토와 적극적인 협조를 부탁드립니다. 감사합니다.",
    ],
    items: [
      ["제안 내용", "JTBC 환경캠페인 제작 편성"],
      ["제공 내역", "캠페인 영상 內 협찬 기업 로고 노출 등"],
      ["요청 금액", "{금액}원 (부가세 {부가세})"],
      ["노출 횟수", "월 {노출횟수}회 전후 (60초 기준)"],
    ],
  },
  // ── 배너 협찬 ──────────────────────────────
  "온라인 배너": {
    type: "배너 협찬", file: "온라인 배너",
    inputs: [],                 // 게재 기간은 '협찬 월'로 자동
    title: "JTBC 온라인 배너광고 게재 요청의 건",
    body: [
      "1. 국내외 불확실한 경제 상황 속에서도 대한민국 경제발전을 위해 각고의 노력을 기울이고 계신 귀사의 무궁한 발전을 기원합니다.",
      "2. 저희 JTBC는 지금까지의 경험을 바탕으로, 보다 알차고 의미있는 프로그램을 지속적으로 기획 및 제작하여 사회적으로 기여할 수 있도록 노력하겠습니다. 또한, 언제나처럼 책임있는 언론의 역할을 충실히 할 것을 약속드립니다. 많은 관심과 질책을 부탁드립니다.",
      "3. 이에 다음과 같이 귀사의 온라인 배너광고 참여를 정중히 요청드리는 바입니다. 모쪼록 긍정적인 검토를 부탁드리며, 양사간 돈독한 우호관계를 위한 좋은 기회가 되기를 희망합니다. 감사합니다.",
    ],
    items: [
      ["제안 내용", "JTBC 뉴스홈페이지 및 모바일 배너 광고"],
      ["게재 기간", "{연}년 {월}월중"],
      ["요청 금액", "{금액}원 (부가세 {부가세})"],
      ["광고 규격", "PC – 1216 × 100 px / 모바일 – 353 × 100 px (메인 홈 / 메인 홈)"],
    ],
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

  // 숫자 → 한글 금액 (10000000 → 일천만)
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
  // 선택한 달의 방송 요일 날짜들 → "10/24, 10/31"
  function airDates(ym, weekday) {
    const [y, m] = ym.split("-").map(Number);
    if (!y || !m || weekday == null) return "";
    const out = [];
    for (let d = 1; d <= new Date(y, m, 0).getDate(); d++) if (new Date(y, m - 1, d).getDay() === weekday) out.push(`${m}/${d}`);
    return out.join(", ");
  }

  const DEFAULT_SENDER = { signer: "", addr: "", prefix: "JTBC" };
  const firstProgram = Object.keys(PROGRAMS)[0];
  const st = {
    co: "", ref: "홍보실", schedule: "", count: "", type: PROGRAMS[firstProgram].type, program: firstProgram, month: thisMonth(), dates: "", amount: "", vat: "별도", date: today(), docnum: "",
    sender: Object.assign({}, DEFAULT_SENDER, LS.get("sender", {})),
    logo: LS.get("logo", null), seal: LS.get("seal", null),
  };
  function resetForProgram() {
    const p = PROGRAMS[st.program];
    st.dates = airDates(st.month, p.weekday);
    st.schedule = LS.get("schedule." + st.program, p.schedule || "");
    st.count = LS.get("count." + st.program, p.count || "");
  }
  resetForProgram();
  st.docnum = LS.get("lastDocnum", "");

  const P = () => PROGRAMS[st.program] || PROGRAMS[firstProgram];
  const has = (k) => (P().inputs || []).includes(k);
  const scheduleRows = () => st.schedule.split("\n").map((l) => l.split("|").map((c) => c.trim())).filter((r) => r[0]);
  const namesOf = (t) => Object.keys(PROGRAMS).filter((k) => PROGRAMS[k].type === t);
  const typeReady = () => namesOf(st.type).length > 0;
  const amountNum = () => +String(st.amount).replace(/[^0-9]/g, "") || 0;
  function fill(t) {
    const list = st.dates.split(",").map((s) => s.trim()).filter(Boolean);
    const rows = scheduleRows();
    const [yy, mm] = st.month.split("-").map(Number);
    const amt = amountNum();
    const map = { 프로그램: st.program, 연: yy || "", 월: mm || "", 노출횟수: st.count || "○", 횟수: (has("schedule") ? rows.length : list.length) || "○", 날짜목록: list.join(", ") || "○/○", 금액: amt ? amt.toLocaleString("ko-KR") : "", 부가세: st.vat };
    return t.replace(/\{(\S+?)\}/g, (_, k) => (k in map ? map[k] : _));
  }
  function docCode() {
    const [y, m] = st.month.split("-");
    return `${st.sender.prefix || "JTBC"} ${y}-${m}-${st.docnum || "____"}`;
  }

  // ───────── 공문 종이(A4): 샘플(docx)과 같은 배치 ─────────
  function paper() {
    if (!typeReady()) return `<div class="gm-paper gm-empty" id="gmPaper"><div>'${esc(st.type)}' 양식 준비 중</div></div>`;
    const s = st.sender, p = P();
    const [y, m, d] = (st.date || "").split("-").map(Number);
    const dateK = y ? `${y}년 ${m}월 ${d}일` : "";
    return `<div class="gm-paper" id="gmPaper">
      <table class="gm-top"><tr>
        <td class="gm-logo">${st.logo ? `<img src="${st.logo}" alt="">` : `<span class="gm-ph">로고</span>`}</td>
        <td class="gm-code"><div class="k">문서기호</div><div class="v">${esc(docCode())}</div></td>
        <td class="gm-addr">${esc(s.addr || "(주소·전화는 발신 정보에서 입력)").replace(/\n/g, "<br>")}</td>
      </tr></table>
      <table class="gm-head">
        <tr><th>수&nbsp;&nbsp;&nbsp;&nbsp;신</th><td>${esc(st.co || "○○○")}</td></tr>
        <tr><th>참&nbsp;&nbsp;&nbsp;&nbsp;조</th><td>${esc(st.ref)}</td></tr>
        <tr><th>제&nbsp;&nbsp;&nbsp;&nbsp;목</th><td><b>${esc(fill(p.title))}</b></td></tr>
      </table>
      <div class="gm-body">
        ${p.body.map((t) => `<p>${esc(fill(t))}</p>`).join("")}
        <p class="gm-center">- 다&nbsp;&nbsp;&nbsp;음 -</p>
        ${p.items.map((it) => it === "TABLE" ? schedTable(p) : `<p class="gm-item">□ ${esc(it[0])} : ${esc(fill(it[1]))}</p>`).join("")}
        ${p.note ? `<p class="gm-note2">${esc(fill(p.note))}</p>` : ""}
      </div>
      <div class="gm-date">${esc(dateK)}</div>
      <div class="gm-sign"><span>${esc(s.signer || "(발신 명의: 발신 정보에서 입력)")}${st.seal ? `<img class="gm-seal" src="${st.seal}" alt="">` : ""}</span></div>
    </div>`;
  }

  function schedTable(p) {
    const head = p.tableHead || ["프로그램명", "편성", "개요", "방영일"];
    return `<table class="gm-tbl"><tr>${head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr>${
      scheduleRows().map((r) => `<tr>${head.map((_, i) => `<td>${esc(r[i] || "")}</td>`).join("")}</tr>`).join("")}</table>`;
  }
  function field(id, label, val, attrs = "") {
    return `<label class="gm-f"><span>${label}</span><input id="${id}" value="${esc(val)}" ${attrs}></label>`;
  }
  function imgSlot(key, label, hint) {
    const v = st[key];
    return `<div class="gm-seal-box"><b class="gm-slot">${label}</b>
      ${v ? `<img src="${v}" alt="">` : `<span class="gm-muted">${hint}</span>`}
      <label class="gm-btn">이미지 선택<input type="file" id="gm_img_${key}" accept="image/*" hidden></label>
      ${v ? `<button type="button" class="gm-btn" data-gmdel="${key}">삭제</button>` : ""}</div>`;
  }

  function html(D) {
    const names = D && D.companies ? D.companies.filter((c) => c.watch && !/전체/.test(c.name)).map((c) => c.name) : [];
    const s = st.sender, amt = amountNum();
    const ready = s.signer && st.logo;
    return `<div class="gm">
      ${ready ? "" : `<div class="gm-note">처음 쓰실 때 아래 <b>발신 정보</b>(대표이사 명의·주소)와 <b>로고·직인 이미지</b>를 한 번만 등록해 주세요. 이 브라우저에만 저장되고 사이트에는 올라가지 않습니다.</div>`}
      <div class="gm-grid">
        <form class="panel gm-form" id="gmForm" autocomplete="off" onsubmit="return false">
          <div class="hd"><h2>공문 내용</h2><span class="sub">매달 바뀌는 칸만 입력</span></div>
          <div class="gm-fields">
            <div class="gm-row">
              ${field("gm_co", "수신 (협찬처 정식 명칭)", st.co, 'list="gmCoList" placeholder="예: 엔에이치투자증권㈜"')}
              ${field("gm_ref", "참조", st.ref, 'placeholder="예: 홍보실"')}
            </div>
            <datalist id="gmCoList">${names.map((n) => `<option value="${esc(n)}">`).join("")}</datalist>
            <div class="gm-row">
              <label class="gm-f"><span>공문 유형</span><select id="gm_type">${TYPES.map((t) => `<option ${t === st.type ? "selected" : ""}>${esc(t)}${namesOf(t).length ? "" : " (양식 준비 중)"}</option>`).join("")}</select></label>
              <label class="gm-f"><span>${esc(st.type.replace(" 협찬", ""))}</span><select id="gm_program" ${typeReady() ? "" : "disabled"}>${namesOf(st.type).map((k) => `<option ${k === st.program ? "selected" : ""}>${esc(k)}</option>`).join("") || "<option>—</option>"}</select></label>
            </div>
            ${typeReady() ? "" : `<div class="gm-note">'${esc(st.type)}' 공문은 아직 실제 양식이 등록되지 않았습니다. 샘플 공문을 주시면 같은 문구로 추가해 드립니다.</div>`}
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
            <span class="gm-msg" id="gmMsg"></span>
          </div>

          <details class="gm-set" ${s.signer ? "" : "open"}><summary>발신 정보 <small>처음 한 번만 · 이 브라우저에 저장</small></summary>
            <div class="gm-fields">
              ${field("gs_signer", "발신 명의 (하단)", s.signer, 'placeholder="예: ○○○(주) 대표이사 ○ ○ ○"')}
              <label class="gm-f"><span>주소·연락처 (오른쪽 위, 줄바꿈 가능)</span><textarea id="gs_addr" rows="4" placeholder="주소&#10;t 전화번호&#10;f 팩스번호&#10;홈페이지">${esc(s.addr)}</textarea></label>
              ${field("gs_prefix", "문서기호 앞글자", s.prefix, 'placeholder="예: JTBC"')}
            </div>
          </details>
          <details class="gm-set" ${st.logo ? "" : "open"}><summary>로고·직인 이미지 <small>이 브라우저에만 저장, 사이트에 올라가지 않음</small></summary>
            ${imgSlot("logo", "로고", "왼쪽 위에 들어갈 회사 로고")}
            ${imgSlot("seal", "직인", "배경이 투명한 PNG 권장")}
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
    if (!typeReady()) { msg.textContent = `'${st.type}' 양식이 아직 없어 PDF를 만들 수 없습니다.`; return; }
    if (!st.co || !amountNum()) { msg.textContent = "수신(협찬처)과 요청 금액을 입력해 주세요."; return; }
    msg.textContent = "PDF 만드는 중…";
    try {
      await loadLib();
      const holder = document.createElement("div");
      holder.style.cssText = "position:fixed;left:-10000px;top:0;";
      holder.innerHTML = paper();
      holder.firstElementChild.classList.add("gm-print"); // 그림자 제거·높이 살짝 줄여 빈 2쪽 방지
      document.body.appendChild(holder);
      const ymd = (st.date || "").replace(/-/g, "");
      const name = `${ymd}_JTBC ${P().file || st.program} 협찬 공문_${st.co}.pdf`.replace(/[\\/:*?"<>|]/g, "");
      await window.html2pdf().set({
        margin: 0, filename: name,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, backgroundColor: "#ffffff" },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      }).from(holder.firstElementChild).save();
      holder.remove();
      LS.set("co." + st.co, { ref: st.ref, program: st.program, amount: amountNum(), vat: st.vat });
      LS.set("lastDocnum", st.docnum);
      msg.textContent = `저장했습니다: ${name}`;
    } catch (e) {
      msg.textContent = "PDF를 만들지 못했습니다. 인터넷 연결을 확인한 뒤 다시 눌러 주세요.";
    }
  }

  function onInput(e) {
    const id = e.target.id; if (!id) return;
    if (id.startsWith("gs_")) { st.sender[id.slice(3)] = e.target.value; LS.set("sender", st.sender); refreshPreview(); return; }
    if (!id.startsWith("gm_") || id.startsWith("gm_img_") || id === "gm_type") return;
    const k = id.slice(3);
    if (k === "amount") { const n = e.target.value.replace(/[^0-9]/g, ""); st.amount = n; e.target.value = n ? (+n).toLocaleString("ko-KR") : ""; }
    else st[k] = e.target.value;
    if (k === "program") { resetForProgram(); window.dispatchEvent(new Event("gm-rerender")); return; }
    if (k === "month") { st.dates = airDates(st.month, P().weekday); setVal("gm_dates", st.dates); }
    if (k === "schedule" || k === "count") LS.set(k + "." + st.program, st[k]);
    if (k === "co") { // 이 협찬처에 예전에 보낸 값 불러오기
      const prev = LS.get("co." + st.co, null);
      if (prev) {
        Object.assign(st, { ref: prev.ref, amount: String(prev.amount), vat: prev.vat });
        if (PROGRAMS[prev.program]) { st.program = prev.program; st.type = PROGRAMS[prev.program].type; }
        setVal("gm_ref", prev.ref); setVal("gm_amount", (+prev.amount).toLocaleString("ko-KR")); setVal("gm_vat", prev.vat); setVal("gm_program", st.program);
        const msg = document.getElementById("gmMsg"); if (msg) msg.textContent = "지난번 이 협찬처에 보낸 내용을 불러왔습니다.";
      }
    }
    refreshPreview();
  }

  let bound = false;
  function mount() {
    fit();
    if (bound) return; bound = true;
    document.addEventListener("input", (e) => { if (e.target.closest && e.target.closest("#gmForm")) onInput(e); });
    document.addEventListener("change", (e) => {
      const id = e.target.id || "";
      if (id === "gm_type") { st.type = e.target.value.replace(" (양식 준비 중)", ""); const n = namesOf(st.type); if (n.length) { st.program = n[0]; resetForProgram(); } window.dispatchEvent(new Event("gm-rerender")); return; }
      if (["gm_vat", "gm_month", "gm_date", "gm_program"].includes(id)) onInput(e);
      if (id.startsWith("gm_img_") && e.target.files[0]) {
        const key = id.slice(7), r = new FileReader();
        r.onload = () => { st[key] = r.result; LS.set(key, r.result); window.dispatchEvent(new Event("gm-rerender")); };
        r.readAsDataURL(e.target.files[0]);
      }
    });
    document.addEventListener("click", (e) => {
      if (e.target.id === "gmPdf") download();
      const del = e.target.dataset && e.target.dataset.gmdel;
      if (del) { st[del] = null; LS.del(del); window.dispatchEvent(new Event("gm-rerender")); }
    });
    window.addEventListener("resize", fit);
  }

  window.GM = { html, mount, hangul, airDates };
})();
