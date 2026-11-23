// ─────────────────────────────────────────────────────────────
// 공문 작성기 (사이트의 '공문 작성' 탭)
//  · 기업명·금액·날짜만 넣으면 협찬금 청구 공문을 PDF로 내려받음
//  · 입력 내용·발신 정보·직인 이미지는 모두 "이 브라우저 안에만" 저장됨 (서버로 전송 X)
//
//  ▶ 공문 문구를 바꾸려면 아래 TEMPLATE 만 고치면 됩니다.
//    {중괄호} 자리는 자동으로 채워집니다:
//    {기업명} {수신자} {연} {월} {기간} {내용} {금액} {계좌}
// ─────────────────────────────────────────────────────────────
const TEMPLATE = {
  sample: true, // 실제 부서 양식으로 바꾸면 false 로 (화면의 '예시 문구' 안내가 사라짐)
  title: "{연}년 {월}월 협찬금 청구의 건",
  body: [
    "1. 귀사의 무궁한 발전을 기원합니다.",
    "2. 당사와 귀사 간 협찬 계약에 따라 {연}년 {월}월분 협찬금을 아래와 같이 청구하오니, 기한 내 지급하여 주시기 바랍니다.",
  ],
  itemsTitle: "- 아      래 -",
  items: [
    ["협찬 내용", "{내용}"],
    ["협찬 기간", "{기간}"],
    ["청구 금액", "{금액}"],
    ["입금 계좌", "{계좌}"],
  ],
  attach: "세금계산서 1부.",
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

  // 숫자 → 공문식 한글 금액 (10000000 → 일천만)
  function hangul(n) {
    n = Math.floor(Math.abs(+n || 0));
    if (!n) return "영";
    const D = ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"], S = ["", "십", "백", "천"], B = ["", "만", "억", "조"];
    let out = "", g = 0;
    while (n > 0) {
      const part = n % 10000;
      if (part) {
        let s = "";
        String(part).padStart(4, "0").split("").forEach((c, i) => { if (+c) s += D[+c] + S[3 - i]; });
        out = s + B[g] + out;
      }
      n = Math.floor(n / 10000); g++;
    }
    return out;
  }

  const DEFAULT_SENDER = { org: "", signer: "", dept: "", person: "", tel: "", email: "", addr: "", account: "", prefix: "" };
  const st = {
    co: "", to: "홍보팀장", content: "", month: thisMonth(), amount: "", vat: "별도", date: today(), docno: "",
    sender: Object.assign({}, DEFAULT_SENDER, LS.get("sender", {})),
    seal: LS.get("seal", null),
  };

  function period(ym) {
    const [y, m] = ym.split("-").map(Number);
    if (!y || !m) return "";
    const last = new Date(y, m, 0).getDate();
    return `${y}. ${m}. 1. ~ ${y}. ${m}. ${last}.`;
  }
  function nextDocNo() {
    const s = st.sender, ym = st.month.replace("-", "");
    const seq = (LS.get("seq." + ym, 0) || 0) + 1;
    return `${s.prefix || "협찬"}-${ym}-${String(seq).padStart(3, "0")}`;
  }
  function fill(t) {
    const [y, m] = st.month.split("-").map(Number);
    const amt = +String(st.amount).replace(/[^0-9]/g, "") || 0;
    const money = amt ? `금 ${hangul(amt)}원정 (₩${amt.toLocaleString("ko-KR")}, 부가세 ${st.vat})` : "금        원정 (₩      , 부가세 " + st.vat + ")";
    const map = { 기업명: st.co || "○○○", 수신자: st.to, 연: y || "", 월: m || "", 기간: period(st.month), 내용: st.content || "○○○ 협찬", 금액: money, 계좌: st.sender.account || "(발신 정보에서 입력)" };
    return t.replace(/\{(\S+?)\}/g, (_, k) => (k in map ? map[k] : _));
  }

  // ───────── 공문 종이(A4) ─────────
  function paper() {
    const s = st.sender, kor = "가나다라마바사아자차카타파하";
    const dt = st.date ? st.date.replace(/-/g, ". ") + "." : "";
    return `<div class="gm-paper" id="gmPaper">
      <div class="gm-org">${esc(s.org || "(회사명)")}</div>
      <table class="gm-head">
        <tr><th>수신</th><td>${esc(fill("{기업명} {수신자}"))}</td></tr>
        <tr><th>(경유)</th><td></td></tr>
        <tr><th>제목</th><td><b>${esc(fill(TEMPLATE.title))}</b></td></tr>
      </table>
      <div class="gm-body">
        ${TEMPLATE.body.map((p) => `<p>${esc(fill(p))}</p>`).join("")}
        <p class="gm-center">${esc(TEMPLATE.itemsTitle)}</p>
        ${TEMPLATE.items.map(([k, v], i) => `<p class="gm-item">${kor[i]}. ${esc(k)} : ${esc(fill(v))}</p>`).join("")}
        <p class="gm-attach">붙임&nbsp;&nbsp;${esc(TEMPLATE.attach)}&nbsp;&nbsp;끝.</p>
      </div>
      <div class="gm-sign"><span>${esc(s.signer || "(발신 명의)")}</span>${st.seal ? `<img class="gm-seal" src="${st.seal}" alt="">` : ""}</div>
      <div class="gm-foot">
        <div>담당 ${esc(s.person)}${s.dept ? ` (${esc(s.dept)})` : ""}</div>
        <div>시행 ${esc(st.docno)} (${esc(dt)})</div>
        <div>${esc(s.addr)}</div>
        <div>전화 ${esc(s.tel)}${s.email ? ` / ${esc(s.email)}` : ""}</div>
      </div>
    </div>`;
  }

  function field(id, label, val, attrs = "") {
    return `<label class="gm-f"><span>${label}</span><input id="${id}" value="${esc(val)}" ${attrs}></label>`;
  }

  function html(D) {
    if (!st.docno) st.docno = nextDocNo();
    const names = (D && D.companies ? D.companies.filter((c) => c.watch && !/전체/.test(c.name)).map((c) => c.name) : []);
    const s = st.sender;
    const amt = +String(st.amount).replace(/[^0-9]/g, "") || 0;
    return `<div class="gm">
      ${TEMPLATE.sample ? `<div class="gm-note">지금 공문 문구는 <b>예시</b>입니다. 부서 양식을 주시면 같은 문구로 바꿔 드립니다.</div>` : ""}
      <div class="gm-grid">
        <form class="panel gm-form" id="gmForm" autocomplete="off" onsubmit="return false">
          <div class="hd"><h2>공문 내용</h2><span class="sub">입력 내용은 이 브라우저에만 저장</span></div>
          <div class="gm-fields">
            ${field("gm_co", "협찬처", st.co, 'list="gmCoList" placeholder="기업명 입력 또는 선택"')}
            <datalist id="gmCoList">${names.map((n) => `<option value="${esc(n)}">`).join("")}</datalist>
            ${field("gm_to", "수신자", st.to, 'placeholder="예: 홍보팀장"')}
            ${field("gm_content", "협찬 내용", st.content, 'placeholder="예: ○○ 프로그램 제작 협찬"')}
            <div class="gm-row">
              ${field("gm_month", "청구 월", st.month, 'type="month"')}
              ${field("gm_date", "시행 일자", st.date, 'type="date"')}
            </div>
            <div class="gm-row">
              ${field("gm_amount", "청구 금액(원)", amt ? amt.toLocaleString("ko-KR") : "", 'inputmode="numeric" placeholder="예: 10,000,000"')}
              <label class="gm-f"><span>부가세</span><select id="gm_vat"><option ${st.vat === "별도" ? "selected" : ""}>별도</option><option ${st.vat === "포함" ? "selected" : ""}>포함</option></select></label>
            </div>
            <div class="gm-han" id="gmHan">${amt ? `금 ${hangul(amt)}원정` : "&nbsp;"}</div>
            ${field("gm_docno", "문서번호", st.docno)}
          </div>
          <div class="gm-actions">
            <button type="button" class="gm-btn primary" id="gmPdf">PDF 다운로드</button>
            <span class="gm-msg" id="gmMsg"></span>
          </div>

          <details class="gm-set" ${s.org ? "" : "open"}><summary>발신 정보 <small>처음 한 번만 입력 · 이 브라우저에 저장</small></summary>
            <div class="gm-fields">
              ${field("gs_org", "회사명(상단)", s.org, 'placeholder="예: 주식회사 ○○○"')}
              ${field("gs_signer", "발신 명의(하단)", s.signer, 'placeholder="예: 주식회사 ○○○ 대표이사"')}
              <div class="gm-row">${field("gs_dept", "부서", s.dept)}${field("gs_person", "담당자", s.person)}</div>
              <div class="gm-row">${field("gs_tel", "전화", s.tel)}${field("gs_email", "이메일", s.email)}</div>
              ${field("gs_addr", "주소", s.addr)}
              ${field("gs_account", "입금 계좌", s.account, 'placeholder="예: ○○은행 000-000-000000 (예금주)"')}
              ${field("gs_prefix", "문서번호 앞글자", s.prefix, 'placeholder="예: 커뮤2국"')}
            </div>
          </details>

          <details class="gm-set"><summary>직인 이미지 <small>${st.seal ? "등록됨" : "미등록"} · 이 브라우저에만 저장, 사이트에 올라가지 않음</small></summary>
            <div class="gm-seal-box">
              ${st.seal ? `<img src="${st.seal}" alt="등록된 직인">` : `<span class="gm-muted">배경이 투명한 PNG를 권장합니다.</span>`}
              <label class="gm-btn">이미지 선택<input type="file" id="gm_seal" accept="image/*" hidden></label>
              ${st.seal ? `<button type="button" class="gm-btn" id="gmSealDel">직인 삭제</button>` : ""}
            </div>
            <p class="gm-muted">공용 PC에서는 사용 후 '직인 삭제'를 눌러 주세요.</p>
          </details>
        </form>

        <div class="gm-preview-wrap" id="gmWrap"><div class="gm-scale" id="gmScale">${paper()}</div></div>
      </div>
    </div>`;
  }

  function refreshPreview() {
    const sc = document.getElementById("gmScale"); if (!sc) return;
    sc.innerHTML = paper();
    const amt = +String(st.amount).replace(/[^0-9]/g, "") || 0;
    const h = document.getElementById("gmHan"); if (h) h.innerHTML = amt ? `금 ${hangul(amt)}원정` : "&nbsp;";
    fit();
  }
  function fit() {
    const w = document.getElementById("gmWrap"), sc = document.getElementById("gmScale"), p = document.getElementById("gmPaper");
    if (!w || !sc || !p) return;
    const k = Math.min(1, (w.clientWidth - 2) / p.offsetWidth);
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
      s.onload = ok; s.onerror = () => { lib = null; no(new Error("PDF 도구를 불러오지 못했습니다")); };
      document.head.appendChild(s);
    });
    return lib;
  }
  async function download() {
    const msg = document.getElementById("gmMsg");
    const amt = +String(st.amount).replace(/[^0-9]/g, "") || 0;
    if (!st.co || !amt) { msg.textContent = "협찬처와 금액을 입력해 주세요."; return; }
    msg.textContent = "PDF 만드는 중…";
    try {
      await loadLib();
      const holder = document.createElement("div");
      holder.style.cssText = "position:fixed;left:-10000px;top:0;";
      holder.innerHTML = paper();
      holder.firstElementChild.classList.add("gm-print"); // 그림자 제거·높이 살짝 줄여 빈 2쪽 방지
      document.body.appendChild(holder);
      const [y, m] = st.month.split("-");
      const name = `${st.co}_${y}년${+m}월_협찬금청구공문.pdf`.replace(/[\\/:*?"<>|]/g, "");
      await window.html2pdf().set({
        margin: 0, filename: name,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, backgroundColor: "#ffffff" },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      }).from(holder.firstElementChild).save();
      holder.remove();
      // 기업별 마지막 입력값 기억 + 이번 달 문서번호 순번 증가
      LS.set("co." + st.co, { to: st.to, content: st.content, amount: amt, vat: st.vat });
      const ym = st.month.replace("-", ""), m2 = /-(\d+)$/.exec(st.docno);
      if (m2) LS.set("seq." + ym, Math.max(LS.get("seq." + ym, 0) || 0, +m2[1]));
      msg.textContent = `저장했습니다: ${name}`;
      st.docno = nextDocNo();
      const dn = document.getElementById("gm_docno"); if (dn) dn.value = st.docno;
    } catch (e) {
      msg.textContent = "PDF를 만들지 못했습니다. 인터넷 연결을 확인한 뒤 다시 눌러 주세요.";
    }
  }

  function onInput(e) {
    const id = e.target.id; if (!id) return;
    if (id.startsWith("gs_")) { st.sender[id.slice(3)] = e.target.value; LS.set("sender", st.sender); if (id === "gs_prefix") { st.docno = nextDocNo(); const dn = document.getElementById("gm_docno"); if (dn) dn.value = st.docno; } refreshPreview(); return; }
    if (!id.startsWith("gm_")) return;
    const k = id.slice(3);
    if (k === "amount") { const n = e.target.value.replace(/[^0-9]/g, ""); st.amount = n; e.target.value = n ? (+n).toLocaleString("ko-KR") : ""; }
    else if (k !== "seal") st[k] = e.target.value;
    if (k === "co") { // 이 기업에 예전에 보낸 값이 있으면 불러오기
      const prev = LS.get("co." + st.co, null);
      if (prev) { Object.assign(st, { to: prev.to, content: prev.content, amount: String(prev.amount), vat: prev.vat });
        for (const [f, v] of [["gm_to", prev.to], ["gm_content", prev.content], ["gm_amount", (+prev.amount).toLocaleString("ko-KR")], ["gm_vat", prev.vat]]) { const el = document.getElementById(f); if (el) el.value = v; }
        const msg = document.getElementById("gmMsg"); if (msg) msg.textContent = "지난번 이 기업에 보낸 내용을 불러왔습니다."; }
    }
    if (k === "month") { st.docno = nextDocNo(); const dn = document.getElementById("gm_docno"); if (dn) dn.value = st.docno; }
    refreshPreview();
  }

  let bound = false;
  function mount() {
    fit();
    if (bound) return; bound = true;
    document.addEventListener("input", (e) => { if (e.target.closest && e.target.closest("#gmForm")) onInput(e); });
    document.addEventListener("change", (e) => {
      if (e.target.id === "gm_vat" || e.target.id === "gm_month" || e.target.id === "gm_date") onInput(e);
      if (e.target.id === "gm_seal" && e.target.files[0]) {
        const r = new FileReader();
        r.onload = () => { st.seal = r.result; LS.set("seal", st.seal); window.dispatchEvent(new Event("gm-rerender")); };
        r.readAsDataURL(e.target.files[0]);
      }
    });
    document.addEventListener("click", (e) => {
      if (e.target.id === "gmPdf") download();
      if (e.target.id === "gmSealDel") { st.seal = null; LS.del("seal"); window.dispatchEvent(new Event("gm-rerender")); }
    });
    window.addEventListener("resize", fit);
  }

  window.GM = { html, mount, hangul };
})();
