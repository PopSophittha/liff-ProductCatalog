const CONFIG = {
  API_URL: "https://script.google.com/macros/s/AKfycbydh86pmdzuzmrUEEMY7Rs2tuIIPpM66Jedq3NYoXZltW6V9xAf--E7BG_vSfoZAvNkKw/exec",
  LIFF_ID: ""
};
const state={catalog:null,mode:null,screen:"login",parent:null,category:null,brand:null,company:null,page:1,session:null,productSource:null,productTab:null};
const $=s=>document.querySelector(s), app=$("#app"), title=$("#title"), backBtn=$("#backBtn");
document.addEventListener("DOMContentLoaded",async()=>{if(CONFIG.LIFF_ID&&window.liff){try{await liff.init({liffId:CONFIG.LIFF_ID})}catch(e){console.warn(e)}}backBtn.addEventListener("click",goBack);showLogin();});
function showLogin(){state.screen="login";backBtn.classList.add("hidden");title.textContent="เข้าสู่ระบบ";app.innerHTML=`<div class="loginCard"><div class="loginLogo">📦</div><h2>Product Catalog</h2><p class="muted">กรุณาเข้าสู่ระบบเพื่อใช้งาน</p><form id="loginForm"><label>Staff ID<input id="staffId" autocomplete="username" required></label><label>Password<input id="password" type="password" autocomplete="current-password" required></label><button class="primary" type="submit">เข้าสู่ระบบ</button></form><div id="loginError"></div></div>`;$("#loginForm").onsubmit=async e=>{e.preventDefault();const er=$("#loginError");er.innerHTML=`<div class="loading small">กำลังตรวจสอบ…</div>`;try{const res=await api("login",{staffId:$("#staffId").value.trim(),password:$("#password").value});state.session=res.data;state.catalog=null;showHome()}catch(err){er.innerHTML=`<div class="error">${esc(err.message)}</div>`}}}
function showHome(){state.screen="home";state.mode=null;state.parent=null;state.category=null;state.brand=null;state.company=null;state.page=1;backBtn.classList.add("hidden");title.textContent="เลือกมุมมองสินค้า";const admin=state.session?.role==="Admin";app.innerHTML=`<div class="userBar"><b>${esc(state.session?.name||"")}</b><span>${esc(state.session?.role||"")}</span><button id="logoutBtn">ออกจากระบบ</button></div><div class="mode"><button onclick="chooseMode('category')">📂 หมวดหมู่</button><button onclick="chooseMode('brand')">🏷️ Brand</button>${admin?`<button onclick="chooseMode('company')">🏪 ร้านค้า</button>`:""}</div>`;$("#logoutBtn").onclick=()=>{state.session=null;state.catalog=null;showLogin()}}
async function ensureCatalog(){if(state.catalog)return;app.innerHTML=`<div class="loading">กำลังโหลดสารบัญ…</div>`;const res=await api("catalog");state.catalog=res.data}
async function chooseMode(mode){state.mode=mode;state.screen=mode==="category"?"parents":mode==="brand"?"brands":"companies";title.textContent=mode==="category"?"เลือกหมวดหมู่":mode==="brand"?"เลือก Brand":"เลือกร้านค้า";backBtn.classList.remove("hidden");try{await ensureCatalog();mode==="category"?renderParents():mode==="brand"?renderBrands():renderCompanies()}catch(e){app.innerHTML=`<div class="error">${esc(e.message)}</div>`}}
function renderParents(){const ps=state.catalog.category.parents||[];app.innerHTML=`<input class="search" id="parentSearch" placeholder="ค้นหาหมวดหมู่หลัก"><div class="sectionTitle">Parent Category</div><div id="list" class="grid">${ps.map((p,i)=>`<button class="card" data-i="${i}"><div class="name">${esc(p.name)}</div><div class="muted">${p.categories.length} หมวดหมู่</div></button>`).join("")}</div>`;const list=$("#list");list.querySelectorAll(".card").forEach(b=>b.onclick=()=>{state.parent=ps[+b.dataset.i];state.screen="categories";title.textContent=state.parent.name;renderCategories()});$("#parentSearch").oninput=e=>{const q=e.target.value.toLowerCase();list.querySelectorAll(".card").forEach((b,i)=>b.style.display=ps[i].name.toLowerCase().includes(q)?"":"none")}}
function renderCategories(){const cs=state.parent.categories||[];app.innerHTML=`<div class="sectionTitle">Category</div><div class="grid">${cs.map((c,i)=>`<button class="card" data-i="${i}"><div class="code">${esc(c.code)}</div><div class="name">${esc(c.name)}</div><div class="muted">ดู Sub Category + ตัวอย่างสินค้า</div></button>`).join("")}</div>`;app.querySelectorAll(".card").forEach(b=>b.onclick=()=>openCategory(cs[+b.dataset.i]))}
async function openCategory(cat){state.category=cat;state.page=1;state.screen="category";title.textContent=cat.name;app.innerHTML=`<div class="loading">กำลังโหลด…</div>`;try{renderCategory((await api("category",{code:cat.code,page:1})).data)}catch(e){app.innerHTML=`<div class="error">${esc(e.message)}</div>`}}
function renderCategory(data){const subs=data.subCategories||[],p=data.preview;app.innerHTML=`<div class="sectionTitle">เลือกหมวดหมู่ย่อย</div>${subs.map(s=>`<div class="sub"><button data-tab="${escAttr(s.name)}">${esc(s.name)}</button><span class="arrow">›</span></div>`).join("")}<div class="previewHead"><div><div class="sectionTitle" style="margin-bottom:2px">ตัวอย่างสินค้า</div><div class="muted">${rangeText(p)}</div></div></div><div id="products">${p.items.map(productHTML).join("")||`<div class="loading">ยังไม่มีสินค้า</div>`}</div>${pagerHTML(p)}`;bindProductClicks();app.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>openSubCategory(b.dataset.tab));bindPager(p,async page=>renderCategory((await api("category",{code:state.category.code,page})).data))}
async function openSubCategory(tab){state.screen="subcategory";state.page=1;state.productTab=tab;title.textContent=tab;app.innerHTML=`<div class="loading">กำลังโหลด…</div>`;try{renderSubCategory((await api("subcategory",{code:state.category.code,tab,page:1})).data)}catch(e){app.innerHTML=`<div class="error">${esc(e.message)}</div>`}}
function renderSubCategory(data){const p=data.products;app.innerHTML=`<div class="muted">Sub Category: ${esc(data.tab)}</div><div id="products">${p.items.map(productHTML).join("")||`<div class="loading">ยังไม่มีสินค้า</div>`}</div>${pagerHTML(p)}`;bindProductClicks();bindPager(p,async page=>renderSubCategory((await api("subcategory",{code:state.category.code,tab:data.tab,page})).data))}
function renderBrands(){const bs=state.catalog.brand||[];app.innerHTML=`<input class="search" id="brandSearch" placeholder="ค้นหา Brand"><div class="sectionTitle">Brand</div><div id="list" class="grid">${bs.map((b,i)=>`<button class="card" data-i="${i}"><div class="code">${esc(b.code)}</div><div class="name">${esc(b.display||b.name||b.nameTH)}</div></button>`).join("")}</div>`;app.querySelectorAll(".card").forEach(b=>b.onclick=()=>openBrand(bs[+b.dataset.i]));$("#brandSearch").oninput=e=>{const q=e.target.value.toLowerCase();$("#list").querySelectorAll(".card").forEach((b,i)=>b.style.display=[bs[i].name,bs[i].nameTH,bs[i].code].join(" ").toLowerCase().includes(q)?"":"none")}}
async function openBrand(b){state.brand=b;state.page=1;state.screen="brand";title.textContent=b.display||b.name||b.nameTH||"Brand";app.innerHTML=`<div class="loading">กำลังโหลดสินค้า…</div>`;try{renderBrand((await api("brand",{code:b.code,page:1})).data)}catch(e){app.innerHTML=`<div class="error">${esc(e.message)}</div>`}}
function renderBrand(data){const p=data.preview;app.innerHTML=`<div class="muted">Brand: ${esc(data.brand.display||data.brand.name||"")}</div><div class="muted" style="margin-top:4px">${rangeText(p)}</div><div id="products">${p.items.map(productHTML).join("")||`<div class="loading">ยังไม่มีสินค้า</div>`}</div>${pagerHTML(p)}`;bindProductClicks();bindPager(p,async page=>renderBrand((await api("brand",{code:data.brand.code,page})).data))}
function renderCompanies(){const cs=state.catalog.company||[];app.innerHTML=`<input class="search" id="companySearch" placeholder="ค้นหาร้านค้า"><div class="sectionTitle">ร้านค้า</div><div id="list" class="grid">${cs.map((c,i)=>`<button class="card" data-i="${i}"><div class="code">${esc(c.code)}</div><div class="name">${esc(c.display||c.name||c.nameTH)}</div></button>`).join("")}</div>`;app.querySelectorAll(".card").forEach(b=>b.onclick=()=>openCompany(cs[+b.dataset.i]));$("#companySearch").oninput=e=>{const q=e.target.value.toLowerCase();$("#list").querySelectorAll(".card").forEach((b,i)=>b.style.display=[cs[i].name,cs[i].nameTH,cs[i].display,cs[i].code].join(" ").toLowerCase().includes(q)?"":"none")}}
async function openCompany(c){state.company=c;state.page=1;state.screen="company";title.textContent=c.display||c.name||"ร้านค้า";app.innerHTML=`<div class="loading">กำลังโหลดสินค้า…</div>`;try{renderCompany((await api("company",{code:c.code,page:1})).data)}catch(e){app.innerHTML=`<div class="error">${esc(e.message)}</div>`}}
function renderCompany(data){const p=data.preview;app.innerHTML=`<div class="muted">ร้านค้า: ${esc(data.company.display||data.company.name||"")}</div><div class="muted" style="margin-top:4px">${rangeText(p)}</div><div id="products">${p.items.map(productHTML).join("")||`<div class="loading">ยังไม่มีสินค้า</div>`}</div>${pagerHTML(p)}`;bindProductClicks();bindPager(p,async page=>renderCompany((await api("company",{code:data.company.code,page})).data))}
function productHTML(x){const img=x.image?`<img class="thumb" loading="lazy" referrerpolicy="no-referrer" src="${escAttr(x.image)}" onerror="imgFallback(this)">`:`<div class="thumb empty">🛍️</div>`;return `<button class="product productBtn" data-file="${escAttr(x.sourceFileId||"")}" data-sheet="${escAttr(x.sheetName||"")}" data-row="${escAttr(x.rowNumber||"")}">${img}<div class="productText"><div class="pname">${esc(x.name||"ไม่ระบุชื่อสินค้า")}</div><div class="meta">${esc(x.brand||"")} ${x.barcode?"• "+esc(x.barcode):""}</div><div class="meta">${esc(x.unit||"")}</div>${x.currentPrice?`<div class="price">฿${esc(x.currentPrice)}</div>`:""}</div></button>`}
function bindProductClicks(){app.querySelectorAll(".productBtn").forEach(b=>b.onclick=()=>{state.productSource=state.screen;state.productTab=state.screen==="subcategory"?title.textContent:"";openProductDetail(b.dataset.file,b.dataset.sheet,+b.dataset.row)})}
async function openProductDetail(fileId,sheet,row){state.screen="product";title.textContent="รายละเอียดสินค้า";app.innerHTML=`<div class="loading">กำลังโหลดรายละเอียดสินค้า…</div>`;try{renderProductDetail((await api("product",{fileId,sheet,row})).data)}catch(e){app.innerHTML=`<div class="error">${esc(e.message)}</div>`}}
function renderProductDetail(data){
  const e=data.employee||{};
  const image=data.image?`<img class="detailImage" loading="lazy" referrerpolicy="no-referrer" src="${escAttr(data.image)}" onerror="imgFallback(this)">`:`<div class="detailImage empty">🛍️</div>`;
  const barcodeVisual=e.barcode?renderBarcode(e.barcode):'';
  const titleName=[e.displayName,e.unit?`(${e.unit})`:'' ].filter(Boolean).join(' ');
  const price=(label,value)=>value?`<div class="priceLine"><span>${esc(label)}</span><b>฿${esc(value)}</b></div>`:'';
  const chip=(value)=>value?`<span class="optionChip">${esc(value)}</span>`:'';
  const status=(label,value)=>value?`<div class="statusLine"><span>${esc(label)}</span><b>${esc(value)}</b></div>`:'';
  let html=`<div class="detailCard">
    ${image}
    <div class="detailRole">${data.role==="Admin"?"Admin • ข้อมูลสินค้า + ข้อมูลร้านค้า":"พนักงาน • ข้อมูลสำหรับพนักงาน"}</div>
    <div class="productHero">
      ${(e.category||e.subCategory)?`<div class="categoryPath detailCategoryTop">${esc(e.category||'')}${e.subCategory?` <span>›</span> ${esc(e.subCategory)}`:''}</div>`:''}
      ${barcodeVisual}
      <h2 class="productTitleCentered">${esc(titleName||'ไม่ระบุชื่อสินค้า')}</h2>
    </div>
    <section class="detailSection">
      ${price('Net cost',e.netCost)}
      ${(e.salePrice||e.thaiPrice)?`<div class="saleThaiLine">
        <span class="saleLabel">ราคาขาย</span>
        <span class="saleValue">
          ${e.salePrice?`<strong>฿${esc(e.salePrice)}</strong>`:''}
          ${e.thaiPrice?`<span class="thaiInline"> / คนไทย <strong>฿${esc(e.thaiPrice)}</strong></span>`:''}
        </span>
      </div>`:''}
      ${(e.level1||e.level2)?`<div class="priceCombo priceLevels">
        <span>(${e.level1?`฿${esc(e.level1)}`:''}${e.level1&&e.level2?' &gt; ':''}${e.level2?`฿${esc(e.level2)}`:''})</span>
      </div>`:''}
      ${price('พนักงาน',e.staffPrice)}
    </section>
    ${(e.opt1||e.opt2||e.opt3||e.opt4)?`<section class="detailSection"><div class="sectionCaption">ตัวเลือก</div><div class="optionList">${chip(e.opt1)}${chip(e.opt2)}${chip(e.opt3)}${chip(e.opt4)}</div></section>`:''}
    ${(e.isDiscon||e.isDisorder)?`<section class="detailSection"><div class="sectionCaption">สถานะสินค้า</div>${status('isDiscon?',e.isDiscon)}${status('isDisorder?',e.isDisorder)}</section>`:''}`;
  if(data.role==='Admin') html+=renderAdminSection(data.admin||{});
  html+='</div>';
  app.innerHTML=html;
}

function renderBarcode(value){
  const raw=String(value==null?'':value).trim();
  if(!raw) return '';
  const digits=raw.replace(/\D/g,'');
  if(/^\d{13}$/.test(digits)) return renderEAN13(digits);
  return renderCode39(raw);
}
function renderEAN13(code){
  const L={0:'0001101',1:'0011001',2:'0010011',3:'0111101',4:'0100011',5:'0110001',6:'0101111',7:'0111011',8:'0110111',9:'0001011'};
  const G={0:'0100111',1:'0110011',2:'0011011',3:'0100001',4:'0011101',5:'0111001',6:'0000101',7:'0010001',8:'0001001',9:'0010111'};
  const R={0:'1110010',1:'1100110',2:'1101100',3:'1000010',4:'1011100',5:'1001110',6:'1010000',7:'1000100',8:'1001000',9:'1110100'};
  const parity=['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL'];
  let bits='101', p=parity[+code[0]];
  for(let i=1;i<=6;i++) bits+=(p[i-1]==='L'?L:G)[+code[i]];
  bits+='01010';
  for(let i=7;i<=12;i++) bits+=R[+code[i]];
  bits+='101';
  return barcodeSvg(bits,code,'EAN-13');
}
function renderCode39(value){
  const map={
    '0':'101001101101','1':'110100101011','2':'101100101011','3':'110110010101',
    '4':'101001101011','5':'110100110101','6':'101100110101','7':'101001011011',
    '8':'110100101101','9':'101100101101','A':'110101001011','B':'101101001011',
    'C':'110110100101','D':'101011001011','E':'110101100101','F':'101101100101',
    'G':'101010011011','H':'110101001101','I':'101101001101','J':'101011001101',
    'K':'110101010011','L':'101101010011','M':'110110101001','N':'101011010011',
    'O':'110101101001','P':'101101101001','Q':'101010110011','R':'110101011001',
    'S':'101101011001','T':'101011011001','U':'110010101011','V':'100110101011',
    'W':'110011010101','X':'100101101011','Y':'110010110101','Z':'100110110101',
    '-':'100101011011','.':'110010101101',' ':'100110101101','$':'100100100101',
    '/':'100100101001','+':'100101001001','%':'101001001001','*':'100101101101'
  };
  let text=String(value).toUpperCase().replace(/[^0-9A-Z\-. $/+%]/g,'');
  if(!text) return `<div class="barcodeNumberOnly">${esc(value)}</div>`;
  let bits='', encoded='*'+text+'*';
  for(const ch of encoded){ if(bits) bits+='0'; bits+=map[ch]; }
  return barcodeSvg(bits,value,'CODE 39');
}
function barcodeSvg(bits,label,type){
  const quiet=10,module=2,barH=62,width=(bits.length+quiet*2)*module;
  let bars='';
  for(let i=0;i<bits.length;i++) if(bits[i]==='1') bars+=`<rect x="${(i+quiet)*module}" y="0" width="${module}" height="${barH}"/>`;
  return `<div class="barcodeVisual" aria-label="${escAttr(type+' '+label)}"><svg viewBox="0 0 ${width} 82" role="img" preserveAspectRatio="xMidYMid meet"><rect width="${width}" height="82" fill="white"/><g fill="black">${bars}</g><text x="${width/2}" y="78" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" letter-spacing="1">${esc(label)}</text></svg></div>`;
}

function renderAdminSection(a){
  const pair=(label,name,price)=>name||price?`<div class="adminPair"><span><b>${esc(label)}</b>${name?` = ${esc(name)}`:''}</span><b>${price?`฿${esc(price)}`:''}</b></div>`:'';
  const check=(label,v)=>{
    const s=String(v==null?'':v).trim();
    if(!s) return '';
    const yes=['TRUE','1','YES','Y','ใช่','✓','☑'].includes(s.toUpperCase());
    const no=['FALSE','0','NO','N','ไม่','✗','☐'].includes(s.toUpperCase());
    return `<span class="adminCheck ${yes?'checked':''}"><span class="checkBox">${yes?'✓':' '}</span><span>${esc(label)}</span><small>${yes?'TRUE':no?'FALSE':esc(s)}</small></span>`;
  };
  return `<section class="adminSection"><div class="adminTitle">ข้อมูลสำหรับ Admin</div>
    ${pair('บริษัท',a.companyName,a.companyPrice)}
    ${pair('ร้านที่ 1',a.shop1,a.shop1Price)}
    ${pair('ร้านที่ 2',a.shop2,a.shop2Price)}
    ${pair('ร้านที่ 3',a.shop3,a.shop3Price)}
    ${pair('ออนไลน์',a.onlineChannel,a.onlinePrice)}
    ${(a.registrationNo||a.licenseNo)?`<div class="adminBlock"><b>อย./เลขจดแจ้ง</b><div class="adminTags">${a.registrationNo?`<span class="adminTag">อย./เลขจดแจ้ง: ${esc(a.registrationNo)}</span>`:''}${a.licenseNo?`<span class="adminTag">เลขทะเบียน: ${esc(a.licenseNo)}</span>`:''}</div></div>`:''}
    ${(a.herbalGeneral||a.herbalPlace)?`<div class="adminBlock"><b>ยาสมุนไพร</b><div class="adminTags">${check('ขายทั่วไป',a.herbalGeneral)}${check('สถานที่อนุญาติ',a.herbalPlace)}</div></div>`:''}
    ${(a.modernGeneric||a.modernDangerous||a.modernTopical)?`<div class="adminBlock"><b>ยาแผนปัจจุบัน</b><div class="adminTags">${check('ยาสามัญ',a.modernGeneric)}${check('ยาอันตราย',a.modernDangerous)}${check('ยาใช้เฉพาะที่',a.modernTopical)}</div></div>`:''}
    ${(a.doc9||a.doc11||a.doc10_12)?`<div class="adminBlock"><b>เอกสาร</b><div class="adminTags">${check('ขย9',a.doc9)}${check('ขย11',a.doc11)}${check('ขย10, 12',a.doc10_12)}</div></div>`:''}
    ${a.refrigerated?`<div class="adminBlock"><b>จัดเก็บในตู้เย็น</b><div class="adminTags">${check('จัดเก็บในตู้เย็น',a.refrigerated)}</div></div>`:''}
    ${a.remarks?`<div class="adminBlock"><b>remarks</b><div class="remarks">${esc(a.remarks)}</div></div>`:''}
  </section>`;
}
function rangeText(p){return `แสดง ${p.items.length?((p.page-1)*p.pageSize+1):0}–${Math.min(p.page*p.pageSize,p.total)} จาก ${p.total} รายการ`}
function pagerHTML(p){if(!p||p.totalPages<=1)return "";const pages=[],start=Math.max(1,p.page-2),end=Math.min(p.totalPages,p.page+2);for(let i=start;i<=end;i++)pages.push(`<button class="pageBtn ${i===p.page?'pageNum':''}" data-page="${i}">${i}</button>`);return `<div class="pager"><button class="pageBtn" data-page="${p.page-1}" ${p.page<=1?"disabled":""}>‹</button>${pages.join("")}<button class="pageBtn" data-page="${p.page+1}" ${p.page>=p.totalPages?"disabled":""}>›</button></div>`}
function bindPager(p,fn){app.querySelectorAll("[data-page]").forEach(b=>b.onclick=()=>{const page=+b.dataset.page;if(page>=1&&page<=p.totalPages&&page!==p.page)fn(page).catch(e=>app.innerHTML=`<div class="error">${esc(e.message)}</div>`)})}
function goBack(){if(state.screen==="product"){if(state.productSource==="category"&&state.category){state.screen="category";title.textContent=state.category.name;openCategory(state.category)}else if(state.productSource==="subcategory"&&state.category){state.screen="subcategory";title.textContent=state.productTab;openSubCategory(state.productTab)}else if(state.productSource==="brand"&&state.brand){state.screen="brand";title.textContent=state.brand.display||state.brand.name;openBrand(state.brand)}else if(state.productSource==="company"&&state.company){state.screen="company";title.textContent=state.company.display||state.company.name;openCompany(state.company)}}else if(state.screen==="subcategory"){state.screen="category";title.textContent=state.category.name;openCategory(state.category)}else if(state.screen==="brand"){state.screen="brands";title.textContent="เลือก Brand";renderBrands()}else if(state.screen==="company"){state.screen="companies";title.textContent="เลือกร้านค้า";renderCompanies()}else if(state.screen==="category"){state.screen="categories";title.textContent=state.parent.name;renderCategories()}else if(["categories","parents","brands","companies"].includes(state.screen)){showHome()}}
function api(action,params={}){return new Promise((resolve,reject)=>{const callback="cb_"+Date.now()+"_"+Math.floor(Math.random()*100000),script=document.createElement("script"),q=new URLSearchParams({action,...params,token:state.session?.token||"",callback});window[callback]=data=>{cleanup();if(data&&data.ok)resolve(data);else reject(new Error(data?.error||"API error"))};script.onerror=()=>{cleanup();reject(new Error("เชื่อมต่อ Apps Script ไม่สำเร็จ"))};script.src=CONFIG.API_URL+"?"+q.toString();document.body.appendChild(script);function cleanup(){delete window[callback];script.remove()}})}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}function escAttr(v){return esc(v)}function imgFallback(img){img.outerHTML='<div class="thumb empty">🛍️</div>'}
