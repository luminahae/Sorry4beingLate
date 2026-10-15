/* =========================================================
   그러니까, 제가 왜 늦었냐면.. — 사과문 생성기
   API 키 없이도 내장 생성기가 자동으로 사과문을 만들어 줍니다.
   ========================================================= */

/* ---------- 뷰 전환 ---------- */
const views = {
  splash: document.getElementById('view-splash'),
  form: document.getElementById('view-form'),
  loading: document.getElementById('view-loading'),
  result: document.getElementById('view-result'),
};
function show(name){
  Object.values(views).forEach(v => v.classList.remove('is-active'));
  views[name].classList.add('is-active');
  views[name].style.display = 'block';
  Object.entries(views).forEach(([k,v]) => { if(k!==name) v.style.display=''; });
  window.scrollTo({top:0, behavior:'instant'});
}

/* ---------- 스플래시: 사과(🍎) 밀어서 시작 ---------- */
const dragzone = document.getElementById('dragzone');
const knob = document.getElementById('appleKnob');
let dragging = false, startX = 0, maxX = 0;

function knobStart(x){ dragging = true; startX = x - knob.offsetLeft; maxX = dragzone.clientWidth - knob.offsetWidth - 12; }
function knobMove(x){
  if(!dragging) return;
  let pos = Math.max(0, Math.min(maxX, x - startX));
  knob.style.left = pos + 'px';
  if(pos >= maxX - 4){ dragging = false; launch(); }
}
function knobEnd(){ if(dragging){ dragging = false; knob.style.transition='left .3s'; knob.style.left='0px'; setTimeout(()=>knob.style.transition='',300);} }
function launch(){ knob.style.left = maxX + 'px'; setTimeout(()=>{ show('form'); knob.style.left='0px'; }, 260); }

knob.style.position='absolute'; knob.style.left='0px';
knob.addEventListener('mousedown', e=>{ e.preventDefault(); knobStart(e.clientX); });
window.addEventListener('mousemove', e=> knobMove(e.clientX));
window.addEventListener('mouseup', knobEnd);
knob.addEventListener('touchstart', e=> knobStart(e.touches[0].clientX), {passive:true});
window.addEventListener('touchmove', e=>{ if(dragging){ knobMove(e.touches[0].clientX);} }, {passive:true});
window.addEventListener('touchend', knobEnd);
knob.addEventListener('click', ()=>{ show('form'); });
document.getElementById('skipSplash').addEventListener('click', ()=> show('form'));

/* ---------- 헤더 단어 애니메이션 ---------- */
const rotWords = ["사과문을","변명을","반성문을","해명을","위로를","진심을"];
let rotI = 0;
const rotEl = document.getElementById('animatedText');
setInterval(()=>{
  if(!rotEl) return;
  rotEl.style.opacity = '0';
  setTimeout(()=>{ rotI = (rotI+1)%rotWords.length; rotEl.textContent = rotWords[rotI]; rotEl.style.opacity='1'; }, 400);
}, 2600);

/* ---------- 글자수 카운터 ---------- */
document.querySelectorAll('.field input').forEach(inp=>{
  const counter = document.querySelector(`.field__count[data-for="${inp.id}"]`);
  if(!counter) return;
  const max = inp.getAttribute('maxlength');
  const upd = ()=> counter.textContent = `${inp.value.length}/${max}`;
  inp.addEventListener('input', upd); upd();
});

/* ---------- 상세 설정 토글 ---------- */
const detailToggle = document.getElementById('detailToggle');
const detail = document.getElementById('detail');
detailToggle.addEventListener('click', ()=>{
  const open = detail.hasAttribute('hidden');
  if(open){ detail.removeAttribute('hidden'); } else { detail.setAttribute('hidden',''); }
  detailToggle.classList.toggle('is-open', open);
});

/* ---------- T/F 슬라이더 → 형용사 ---------- */
// 왼쪽(T·논리) → 오른쪽(F·감성) 순서
const ADJ = ["노골적인","무례할 정도로 솔직한","거침없는","직접적인","솔직한",
  "직선적인","명확한","단호한","논리적인","냉정한",
  "동정심 많은","감동적인","공감적인","이해심 있는","배려 깊은",
  "인정 많은","관대한","민감한","따뜻한","애정 어린"];
const tfRange = document.getElementById('tfRange');
const toneWord = document.getElementById('toneWord');
function adjByTF(v){ return ADJ[Math.min(19, Math.floor(v/5.1))]; }
tfRange.addEventListener('input', ()=> toneWord.textContent = adjByTF(+tfRange.value));
toneWord.textContent = adjByTF(+tfRange.value);

/* ---------- localStorage: API 키 ---------- */
const apikeyInput = document.getElementById('apikey');
apikeyInput.value = localStorage.getItem('s4bl_key') || '';
apikeyInput.addEventListener('change', ()=> localStorage.setItem('s4bl_key', apikeyInput.value.trim()));

/* =========================================================
   사과문 생성기 (내장)
   ========================================================= */
const rand = arr => arr[Math.floor(Math.random()*arr.length)];

function collect(){
  return {
    to: document.getElementById('to').value.trim(),
    intent: document.getElementById('intent').value.trim(),
    goal: document.getElementById('goal').value.trim(),
    from: document.getElementById('from').value.trim(),
    type: document.getElementById('type').value.trim(),
    etc: document.getElementById('etc').value.trim(),
    len: +document.getElementById('lengthRange').value,   // 0=장문 100=단문
    tf:  +document.getElementById('tfRange').value,        // 0=T 100=F
  };
}

// 가벼운 변명 풀 (앱의 본질적 유머)
const EXCUSES = [
  "예상치 못한 일이 겹치는 바람에",
  "제 부주의로 시간을 잘못 계산해서",
  "마음은 진작 도착했는데 몸이 늦어서",
  "챙겨야 할 것들이 한꺼번에 몰리는 바람에",
  "스스로도 아쉬울 만큼 준비가 부족해서",
];

function buildLetter(d){
  const F = d.tf >= 50;                 // 감성 register
  const strong = Math.abs(d.tf-50) > 30; // 강한 톤
  const adj = adjByTF(d.tf);
  const short = d.len >= 66;            // 단문형
  const long  = d.len <= 33;            // 장문형
  const to = d.to || "여러분";
  const name = d.from || "";

  /* --- 제목 --- */
  const titlePool = F
    ? [`${to}께 진심을 담아 전하는 사과`, `늦었지만, 마음만은 진심인 사과의 말씀`, `${adj} 마음으로 드리는 사과`]
    : [`상황을 있는 그대로 전하는 사과`, `${to}께 드리는 솔직한 사과의 말씀`, `${adj} 사과와 앞으로의 다짐`];
  const title = "제목: " + rand(titlePool);

  /* --- 문단 조립 --- */
  const P = [];

  // 1) 인사
  P.push(F
    ? rand([`${to}, 안녕하세요.`, `${to}께 조심스럽게 이 글을 씁니다.`, `먼저 ${to}께 인사드립니다.`])
    : rand([`${to}께 알립니다.`, `${to}, 바로 본론부터 말씀드리겠습니다.`, `${to}께 사실 그대로 전합니다.`]));

  // 2) 상황 인정 (사용자 입력을 대시로 분리해 조사 충돌 방지)
  const intent = d.intent || "이번 일";
  P.push(F
    ? rand([`「${intent}」 — 그 일로 마음 불편하셨을 생각을 하니 저도 마음이 무겁습니다.`,
            `「${intent}」 — 돌이켜보면 제가 더 신경 썼어야 했습니다.`,
            `「${intent}」 — 죄송한 마음이 계속 남아 이렇게 글을 씁니다.`])
    : rand([`「${intent}」 — 변명 없이 상황부터 말씀드립니다.`,
            `「${intent}」 — 이 부분은 명백히 제 잘못입니다.`,
            `「${intent}」 — 이에 대한 책임은 전적으로 저에게 있습니다.`]));

  // 3) 핵심 사과
  P.push(F
    ? rand([`정말 죄송합니다. 짧게라도 제 진심이 전해졌으면 합니다.`,
            `진심으로 사과드립니다. 어떤 말로도 부족하다는 걸 압니다.`,
            `죄송합니다. ${adj} 마음으로 용서를 구합니다.`])
    : rand([`사과드립니다. 원인은 분명하고, 핑계는 대지 않겠습니다.`,
            `잘못을 인정합니다. 같은 일이 반복되지 않도록 하겠습니다.`,
            `죄송합니다. 상황과 책임을 정확히 알고 있습니다.`]));

  // 4) 이유(변명) — 장문/중간에서만
  if(!short){
    P.push(`${rand(EXCUSES)} 이런 결과가 생겼습니다.` +
      (F ? " 그래도 이유가 사과를 대신할 수는 없다고 생각합니다." : " 이유는 이유일 뿐, 결과에 대한 책임은 집니다."));
  }

  // 5) 다짐 / 의도
  if(d.goal){
    P.push(F
      ? `${d.goal}. 이 마음이 말뿐이 되지 않도록 행동으로 보여드리겠습니다.`
      : `${d.goal}. 구체적으로 다음부터 바로 실천하겠습니다.`);
  }

  // 6) 기타
  if(d.etc){ P.push(`${d.etc}.`); }

  // 7) 맺음 — 장문에서만 한 줄 더
  if(long){
    P.push(F
      ? rand([`다시 한번 너그러운 이해를 부탁드립니다. 늘 감사합니다.`,
              `부족한 저를 믿어주셔서 감사하고, 또 죄송합니다.`])
      : rand([`이상입니다. 신뢰를 회복할 기회를 주시면 감사하겠습니다.`,
              `끝까지 읽어주셔서 감사합니다. 결과로 증명하겠습니다.`]));
  }

  let body = P.join(short ? "\n" : "\n\n");

  /* --- 형식 반영 --- */
  if(d.type){
    if(/카톡|카카오|문자|메시지|dm|디엠/i.test(d.type)){
      body = body.replace(/\n\n/g, "\n");   // 메신저는 짧게
    }
    if(/손편지|편지/.test(d.type)){
      body = `To. ${to}\n\n` + body;
    }
  }

  const sign = name ? `— ${name} 드림` : `— 진심을 담아`;
  return { title, body, sign, type:d.type };
}

/* =========================================================
   GPT 경로 (선택)
   ========================================================= */
async function buildLetterGPT(d, key){
  const adj = adjByTF(d.tf);
  const len = d.len<=33 ? "장문(3~5문단)" : d.len>=66 ? "단문(2~3문장)" : "중간 길이";
  const prompt =
`너는 한국어 사과문을 대신 써 주는 작가야. 아래 조건으로 자연스러운 사과문을 작성해줘.
- 사과 대상: ${d.to}
- 상황: ${d.intent}
- 전하고 싶은 의도/다짐: ${d.goal}
${d.from?`- 보내는 사람: ${d.from}`:""}
${d.type?`- 글의 형식: ${d.type}`:""}
${d.etc?`- 꼭 넣을 내용: ${d.etc}`:""}
- 톤: ${adj} 느낌 (${d.tf>=50?"감성·공감 중심":"논리·팩트 중심"})
- 길이: ${len}
첫 줄에 "제목: ..." 형태의 제목을 넣고, 그 아래 본문을 써줘. 군더더기 설명 없이 사과문만.`;

  const res = await fetch("https://api.openai.com/v1/chat/completions",{
    method:"POST",
    headers:{ "Content-Type":"application/json", "Authorization":"Bearer "+key },
    body: JSON.stringify({
      model:"gpt-4o-mini", temperature:0.8, max_tokens:900,
      messages:[{role:"system",content:"You are a warm, articulate Korean apology-letter writer."},
                {role:"user",content:prompt}]
    })
  });
  if(!res.ok) throw new Error("api");
  const j = await res.json();
  const text = j.choices?.[0]?.message?.content?.trim() || "";
  const lines = text.split("\n");
  const title = lines[0].startsWith("제목") ? lines[0] : "제목: 사과의 말씀";
  const body = (lines[0].startsWith("제목") ? lines.slice(1) : lines).join("\n").trim();
  return { title, body, sign: d.from?`— ${d.from} 드림`:"— 진심을 담아", type:d.type };
}

/* =========================================================
   생성 실행
   ========================================================= */
const form = document.getElementById('excuseForm');
const loadingStatus = document.getElementById('loadingStatus');
const LOAD_MSGS = ["진심을 문장으로 옮기는 중…","적절한 단어를 고르는 중…","조금만 더 정중하게 다듬는 중…","마음을 담는 중…"];
let current = null;

form.addEventListener('submit', e=>{ e.preventDefault(); generate(); });

async function generate(){
  const d = collect();
  if(!d.to || !d.intent || !d.goal){ alert("대상·상황·의도는 꼭 입력해 주세요."); return; }

  show('loading');
  let msgI=0; const timer=setInterval(()=>{ msgI=(msgI+1)%LOAD_MSGS.length; loadingStatus.textContent=LOAD_MSGS[msgI]; },700);

  const key = apikeyInput.value.trim();
  const t0 = performance.now();
  try{
    current = key ? await buildLetterGPT(d, key) : buildLetter(d);
  }catch(err){
    console.warn("GPT 실패, 내장 생성기로 대체:", err);
    current = buildLetter(d);
  }
  const wait = Math.max(0, 1300 - (performance.now()-t0));  // 로딩 연출 최소 시간
  setTimeout(()=>{ clearInterval(timer); render(current); show('result'); }, wait);
}

function render(l){
  document.getElementById('letterTitle').textContent = l.title;
  document.getElementById('letterBody').textContent = l.body;
  document.getElementById('letterSign').textContent = l.sign;
}

/* ---------- 결과 버튼 ---------- */
document.getElementById('editBtn').addEventListener('click', ()=> show('form'));
document.getElementById('regenBtn').addEventListener('click', ()=> generate());
document.getElementById('homeBtn').addEventListener('click', ()=>{
  knob.style.transition='left .3s'; knob.style.left='0px';
  setTimeout(()=>knob.style.transition='',300);
  show('splash');
});

document.getElementById('copyBtn').addEventListener('click', async ()=>{
  const text = `${current.title}\n\n${current.body}\n\n${current.sign}`;
  try{
    if(navigator.share){ await navigator.share({ title:"사과문", text }); return; }
  }catch(_){/* 공유 취소시 복사로 폴백 */}
  try{ await navigator.clipboard.writeText(text); toast("복사됐어요! 붙여넣기 해보세요"); }
  catch(_){ toast("복사에 실패했어요"); }
});

document.getElementById('imageBtn').addEventListener('click', ()=> saveAsImage(current));

/* ---------- 토스트 ---------- */
const toastEl = document.getElementById('toast');
let toastTimer;
function toast(msg){
  toastEl.textContent = msg; toastEl.classList.add('is-show');
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>toastEl.classList.remove('is-show'),1900);
}

/* =========================================================
   이미지로 저장 (canvas)
   ========================================================= */
function saveAsImage(l){
  if(!l) return;
  const W=800, pad=56;
  const canvas=document.createElement('canvas');
  const ctx=canvas.getContext('2d');

  // 본문 줄바꿈 계산
  ctx.font='26px "Gowun Dodum", sans-serif';
  const bodyLines=[];
  l.body.split("\n").forEach(par=>{
    if(par===""){ bodyLines.push(""); return; }
    let line="";
    for(const ch of par){
      if(ctx.measureText(line+ch).width > W-pad*2){ bodyLines.push(line); line=ch; }
      else line+=ch;
    }
    bodyLines.push(line);
  });

  const titleH=70, lineH=42, signH=70, footH=60;
  const H = pad + titleH + 24 + bodyLines.length*lineH + signH + footH + pad;
  canvas.width=W; canvas.height=H;

  // 배경
  ctx.fillStyle="#ffffff"; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle="#a7d3f0"; ctx.lineWidth=6; ctx.strokeRect(14,14,W-28,H-28);

  let y=pad+8;
  // 브랜드
  ctx.fillStyle="#2f80ed"; ctx.font='34px "Nanum Pen Script", cursive';
  ctx.fillText("🙏 그러니까", pad, y+6);
  y+=48;

  // 제목
  ctx.fillStyle="#1e63c4"; ctx.font='bold 30px "Gaegu","Gowun Dodum",sans-serif';
  wrapFill(ctx, l.title, pad, y, W-pad*2, 38);
  y+=titleH;
  ctx.strokeStyle="#a7d3f0"; ctx.lineWidth=2; ctx.setLineDash([6,6]);
  ctx.beginPath(); ctx.moveTo(pad,y); ctx.lineTo(W-pad,y); ctx.stroke(); ctx.setLineDash([]);
  y+=34;

  // 본문
  ctx.fillStyle="#2c3a4c"; ctx.font='26px "Gowun Dodum",sans-serif';
  bodyLines.forEach(ln=>{ ctx.fillText(ln, pad, y); y+=lineH; });

  // 서명
  y+=18; ctx.fillStyle="#42546b"; ctx.font='24px "Gowun Dodum",sans-serif';
  ctx.textAlign="right"; ctx.fillText(l.sign, W-pad, y); ctx.textAlign="left";

  // 푸터
  ctx.fillStyle="#9aa9bd"; ctx.font='18px "Gowun Dodum",sans-serif';
  ctx.fillText("그러니까, 제가 왜 늦었냐면.. · 사과문 생성기", pad, H-pad+6);

  const url=canvas.toDataURL("image/png");
  const a=document.createElement('a');
  a.href=url; a.download="사과문.png"; a.click();
  toast("이미지로 저장했어요");
}

function wrapFill(ctx,text,x,y,maxW,lh){
  let line="", yy=y;
  for(const ch of text){
    if(ctx.measureText(line+ch).width>maxW){ ctx.fillText(line,x,yy); line=ch; yy+=lh; }
    else line+=ch;
  }
  ctx.fillText(line,x,yy);
}
