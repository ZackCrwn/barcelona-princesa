(() => {
const savingSection=document.querySelector('#saving-section');
if(savingSection){document.querySelector('#standalone-savings').appendChild(savingSection);savingSection.closest('.book-content').remove();}
const backupTools=document.querySelector('.backup-tools');
if(backupTools)document.querySelector('#backup-tools-slot').appendChild(backupTools);
const pages=[...document.querySelectorAll('.book-content')];let current=0;
const show=n=>{current=Math.max(0,Math.min(pages.length-1,n));pages.forEach((p,i)=>p.classList.toggle('active',i===current));document.querySelector('#page-count').textContent=(current+1)+' / '+pages.length;document.querySelector('#prev').disabled=current===0;document.querySelector('#next').textContent=current===pages.length-1?'Volver al índice':'Siguiente página →';};
document.querySelector('#open-book').addEventListener('click',()=>{document.querySelector('#cover').hidden=true;document.querySelector('#reader').hidden=false;show(0)});
document.querySelector('#prev').addEventListener('click',()=>show(current-1));document.querySelector('#next').addEventListener('click',()=>show(current===pages.length-1?0:current+1));
document.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>show(Number(b.dataset.page))));
document.querySelectorAll('[data-open-panel]').forEach(b=>b.addEventListener('click',()=>{document.querySelector('#cover').hidden=true;document.querySelector('#reader').hidden=true;document.querySelector('#standalone-panel').hidden=false;document.querySelectorAll('.standalone-view').forEach(v=>v.hidden=true);const target=document.querySelector('#standalone-'+b.dataset.openPanel);if(target)target.hidden=false;}));
document.querySelectorAll('[data-close-panel]').forEach(b=>b.addEventListener('click',()=>{document.querySelector('#standalone-panel').hidden=true;document.querySelector('#cover').hidden=false;}));
document.querySelectorAll('[data-direct-page]').forEach(b=>b.addEventListener('click',()=>{document.querySelector('#cover').hidden=true;document.querySelector('#reader').hidden=false;show(Number(b.dataset.directPage));}));

/* Lista de equipaje: persistencia local */
const PACK_KEY='andrea-packing-v1';
const packItems=[...document.querySelectorAll('[data-pack]')];
let packed={};try{packed=JSON.parse(localStorage.getItem(PACK_KEY)||'{}')}catch{}
function renderPacking(){let count=0;packItems.forEach(x=>{x.checked=!!packed[x.dataset.pack];if(x.checked)count++});const out=document.querySelector('#packing-progress');if(out)out.textContent=count+' de '+packItems.length+' listos';}
packItems.forEach(x=>x.addEventListener('change',()=>{packed[x.dataset.pack]=x.checked;localStorage.setItem(PACK_KEY,JSON.stringify(packed));renderPacking()}));renderPacking();

/* Itinerario y lugares cargados desde data.js */
const visitedKey='andrea-visited-v1';let visited={};try{visited=JSON.parse(localStorage.getItem(visitedKey)||'{}')}catch{}
const itinerary=document.querySelector('#itinerary-grid');
if(itinerary&&Array.isArray(typeof BARCELONA_DAYS!=='undefined'?BARCELONA_DAYS:null)){itinerary.innerHTML=BARCELONA_DAYS.map(d=>'<article class="itinerary-card"><span>'+d.day+'</span><h3>'+d.title+'</h3><p>'+d.route+'</p><small>'+d.pause+'</small></article>').join('');}
const placesRoot=document.querySelector('#places-grid'),searchBox=document.querySelector('#place-search'),filterBox=document.querySelector('#place-filter');
function renderPlaces(){if(!placesRoot||!Array.isArray(typeof BARCELONA_PLACES!=='undefined'?BARCELONA_PLACES:null))return;const q=(searchBox?.value||'').trim().toLocaleLowerCase('es');const filter=filterBox?.value||'todos';const found=BARCELONA_PLACES.filter(p=>(filter==='todos'||p.type===filter)&&[p.name,p.description,p.tip].join(' ').toLocaleLowerCase('es').includes(q));placesRoot.innerHTML=found.map((p)=>{const key=BARCELONA_PLACES.indexOf(p);return '<article class="place-card"><div class="place-icon">'+p.icon+'</div><div class="place-type">'+(p.type==='gratis'?'VISITA GRATUITA':'VISITA CON COSTE')+'</div><h3>'+p.name+'</h3><p>'+p.description+'</p><p class="place-price">'+p.price+'</p><p class="place-tip">'+p.tip+'</p><div class="place-actions"><label><input type="checkbox" data-visited="'+key+'" '+(visited[key]?'checked':'')+'> Ya lo visité</label><a href="'+p.url+'" target="_blank" rel="noopener noreferrer">Web oficial / información ↗</a></div></article>'}).join('')||'<p class="small">No hay lugares que coincidan con esa búsqueda.</p>';}
searchBox?.addEventListener('input',renderPlaces);filterBox?.addEventListener('change',renderPlaces);
placesRoot?.addEventListener('change',e=>{const x=e.target.closest('[data-visited]');if(!x)return;visited[x.dataset.visited]=x.checked;localStorage.setItem(visitedKey,JSON.stringify(visited));});
renderPlaces();

/* Dibujo: conserva el trabajo en este dispositivo */
document.querySelectorAll('.envelope').forEach(b=>b.addEventListener('click',()=>{const body=b.nextElementSibling;body.classList.toggle('open');b.setAttribute('aria-expanded',body.classList.contains('open')?'true':'false')}));
const canvas=document.querySelector('#drawing');if(canvas){const ctx=canvas.getContext('2d');let drawing=false;const DRAW_KEY='andrea-drawing-v1';let savedDrawing=localStorage.getItem(DRAW_KEY);const resize=()=>{const old=document.createElement('canvas');old.width=canvas.width;old.height=canvas.height;old.getContext('2d').drawImage(canvas,0,0);canvas.width=canvas.clientWidth*devicePixelRatio;canvas.height=300*devicePixelRatio;ctx.scale(devicePixelRatio,devicePixelRatio);ctx.drawImage(old,0,0,old.width,old.height,0,0,canvas.clientWidth,300);ctx.lineCap='round';ctx.lineJoin='round';if(savedDrawing){const img=new Image();img.onload=()=>ctx.drawImage(img,0,0,canvas.clientWidth,300);img.src=savedDrawing;}};resize();window.addEventListener('resize',resize);const point=e=>{const r=canvas.getBoundingClientRect();return [e.clientX-r.left,e.clientY-r.top]};canvas.addEventListener('pointerdown',e=>{drawing=true;canvas.setPointerCapture(e.pointerId);const [x,y]=point(e);ctx.beginPath();ctx.moveTo(x,y)});canvas.addEventListener('pointermove',e=>{if(!drawing)return;const [x,y]=point(e);ctx.strokeStyle=document.querySelector('#pen-color').value;ctx.lineWidth=Number(document.querySelector('#pen-size').value);ctx.lineTo(x,y);ctx.stroke()});canvas.addEventListener('pointerup',()=>{drawing=false;try{localStorage.setItem(DRAW_KEY,canvas.toDataURL('image/png'))}catch{}});document.querySelector('#clear-drawing').addEventListener('click',()=>{ctx.clearRect(0,0,canvas.width,canvas.height);localStorage.removeItem(DRAW_KEY);});document.querySelector('#save-drawing').addEventListener('click',()=>{const a=document.createElement('a');a.download='recuerdo-andrea.png';a.href=canvas.toDataURL('image/png');a.click()});}
})();
const budgetFields=[...document.querySelectorAll('.budget-field')];
const budgetTotal=document.querySelector('#budget-total');
function updateBudget(){if(!budgetTotal)return;const total=budgetFields.reduce((n,x)=>n+(Number(x.value)||0),0);budgetTotal.textContent=new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(total);localStorage.setItem('andrea-budget-v1',JSON.stringify(budgetFields.map(x=>x.value)));}
try{const saved=JSON.parse(localStorage.getItem('andrea-budget-v1')||'[]');budgetFields.forEach((x,i)=>x.value=saved[i]||'')}catch{}
budgetFields.forEach(x=>x.addEventListener('input',updateBudget));updateBudget();

/* Respaldo completo del diario para transferir avances entre dispositivos. */
(() => {
 const keys=['andrea-packing-v1','andrea-visited-v1','andrea-budget-v1','barcelona-ahorro-v1','andrea-drawing-v1'];
 const exportButton=document.querySelector('#export-trip-backup');
 const importInput=document.querySelector('#import-trip-backup');
 if(!exportButton||!importInput)return;
 exportButton.addEventListener('click',()=>{
   const payload={format:'andrea-trip-backup',version:1,createdAt:new Date().toISOString(),data:{}};
   keys.forEach(k=>{const value=localStorage.getItem(k);if(value!==null)payload.data[k]=value;});
   const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
   const url=URL.createObjectURL(blob);const a=document.createElement('a');
   a.href=url;a.download='respaldo-diario-andrea.json';a.click();
   setTimeout(()=>URL.revokeObjectURL(url),1000);
 });
 importInput.addEventListener('change',async()=>{
   const file=importInput.files?.[0];if(!file)return;
   try{
     const backup=JSON.parse(await file.text());
     if(backup.format!=='andrea-trip-backup'||backup.version!==1||!backup.data||typeof backup.data!=='object')throw new Error('Formato no reconocido');
     const valid=keys.filter(k=>typeof backup.data[k]==='string');
     if(!valid.length)throw new Error('No hay datos compatibles en el respaldo');
     if(!confirm('Se restaurarán '+valid.length+' grupos de datos en este dispositivo. Los datos actuales de esos grupos serán reemplazados. ¿Continuar?'))return;
     valid.forEach(k=>localStorage.setItem(k,backup.data[k]));
     alert('Respaldo restaurado. La página se actualizará para cargar tus avances.');
     location.reload();
   }catch(e){alert('No se pudo restaurar el archivo. Usa una copia exportada desde este diario.');}
   finally{importInput.value='';}
 });
})();
