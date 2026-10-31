/* Lista de equipaje: persistencia local */
const PACK_KEY='andrea-packing-v1';
const packItems=[...document.querySelectorAll('[data-pack]')];
let packed={};try{packed=JSON.parse(localStorage.getItem(PACK_KEY)||'{}')}catch{}
function renderPacking(){let count=0;packItems.forEach(x=>{x.checked=!!packed[x.dataset.pack];if(x.checked)count++});const out=document.querySelector('#packing-progress');if(out)out.textContent=count+' de '+packItems.length+' listos';}
packItems.forEach(x=>x.addEventListener('change',()=>{packed[x.dataset.pack]=x.checked;localStorage.setItem(PACK_KEY,JSON.stringify(packed));renderPacking()}));renderPacking();


/* Checklist de documentación: progreso guardado en este dispositivo. */
const DOC_KEY='andrea-documents-v1';
const docItems=[...document.querySelectorAll('[data-doc]')];
let docsReady={};try{docsReady=JSON.parse(localStorage.getItem(DOC_KEY)||'{}')}catch{}
function renderDocuments(){let count=0;docItems.forEach(x=>{x.checked=!!docsReady[x.dataset.doc];if(x.checked)count++});const out=document.querySelector('#documents-progress');if(out)out.textContent=count+' de '+docItems.length+' documentos y tareas listos';}
docItems.forEach(x=>x.addEventListener('change',()=>{docsReady[x.dataset.doc]=x.checked;localStorage.setItem(DOC_KEY,JSON.stringify(docsReady));renderDocuments()}));renderDocuments();

/* Itinerario y lugares cargados desde data.js */
const visitedKey='andrea-visited-v1';let visited={};try{visited=JSON.parse(localStorage.getItem(visitedKey)||'{}')}catch{}
const itinerary=document.querySelector('#itinerary-grid');
if(itinerary&&Array.isArray(typeof BARCELONA_DAYS!=='undefined'?BARCELONA_DAYS:null)){itinerary.innerHTML=BARCELONA_DAYS.map(d=>'<article class="itinerary-card"><span>'+d.day+'</span><h3>'+d.title+'</h3><p>'+d.route+'</p><small>'+d.pause+'</small></article>').join('');}
const placesRoot=document.querySelector('#places-grid'),searchBox=document.querySelector('#place-search'),filterBox=document.querySelector('#place-filter');
function renderPlaces(){if(!placesRoot||!Array.isArray(typeof BARCELONA_PLACES!=='undefined'?BARCELONA_PLACES:null))return;const q=(searchBox?.value||'').trim().toLocaleLowerCase('es');const filter=filterBox?.value||'todos';const found=BARCELONA_PLACES.filter(p=>(filter==='todos'||p.type===filter)&&[p.name,p.description,p.tip].join(' ').toLocaleLowerCase('es').includes(q));placesRoot.innerHTML=found.map((p)=>{const key=BARCELONA_PLACES.indexOf(p);return '<article class="place-card"><div class="place-icon">'+p.icon+'</div><div class="place-type">'+(p.type==='gratis'?'VISITA GRATUITA':'VISITA CON COSTE')+'</div><h3>'+p.name+'</h3><p>'+p.description+'</p><p class="place-price">'+p.price+'</p><p class="place-tip">'+p.tip+'</p><div class="place-actions"><label><input type="checkbox" data-visited="'+key+'" '+(visited[key]?'checked':'')+'> Ya lo visité</label><a href="'+p.url+'" target="_blank" rel="noopener noreferrer">Web oficial / información ↗</a></div></article>'}).join('')||'<p class="small">No hay lugares que coincidan con esa búsqueda.</p>';}
searchBox?.addEventListener('input',renderPlaces);filterBox?.addEventListener('change',renderPlaces);
placesRoot?.addEventListener('change',e=>{const x=e.target.closest('[data-visited]');if(!x)return;visited[x.dataset.visited]=x.checked;localStorage.setItem(visitedKey,JSON.stringify(visited));});
renderPlaces();

/* Dibujo: inicializa solo cuando la página está visible y el canvas tiene tamaño */
document.querySelectorAll('.envelope').forEach(b=>b.addEventListener('click',()=>{
 const body=b.nextElementSibling;
 if(!body)return;
 body.classList.toggle('open');
 b.setAttribute('aria-expanded',body.classList.contains('open')?'true':'false');
}));
const canvas=document.querySelector('#drawing');
if(canvas){
 const ctx=canvas.getContext('2d');
 let drawing=false;
 let savedDrawing=localStorage.getItem('andrea-drawing-v1');
 let lastWidth=0,lastHeight=0;
 const dpr=()=>Math.max(1,window.devicePixelRatio||1);
 function resizeDrawing(){
  const width=Math.floor(canvas.getBoundingClientRect().width);
  if(width<=0)return;
  const height=300,scale=dpr();
  const pixelWidth=Math.round(width*scale),pixelHeight=Math.round(height*scale);
  if(canvas.width===pixelWidth&&canvas.height===pixelHeight)return;
  let snapshot=savedDrawing;
  if(canvas.width>0&&canvas.height>0){
   try{snapshot=canvas.toDataURL('image/png');savedDrawing=snapshot;}catch{}
  }
  canvas.width=pixelWidth;canvas.height=pixelHeight;
  ctx.setTransform(scale,0,0,scale,0,0);
  ctx.lineCap='round';ctx.lineJoin='round';
  if(snapshot){
   const img=new Image();
   img.onload=()=>{if(canvas.width>0)ctx.drawImage(img,0,0,width,height);};
   img.src=snapshot;
  }
  lastWidth=width;lastHeight=height;
 }
 if('ResizeObserver' in window){
  const observer=new ResizeObserver(resizeDrawing);
  observer.observe(canvas);
 }
 window.addEventListener('resize',resizeDrawing);
 window.addEventListener('pageshow',resizeDrawing);
 resizeDrawing();
 const point=e=>{
  const r=canvas.getBoundingClientRect();
  return [e.clientX-r.left,e.clientY-r.top];
 };
 canvas.addEventListener('pointerdown',e=>{
  if(canvas.width===0||canvas.getBoundingClientRect().width===0)return;
  drawing=true;canvas.setPointerCapture(e.pointerId);
  const [x,y]=point(e);ctx.beginPath();ctx.moveTo(x,y);
 });
 canvas.addEventListener('pointermove',e=>{
  if(!drawing)return;
  const [x,y]=point(e);
  const color=document.querySelector('#pen-color');
  const size=document.querySelector('#pen-size');
  ctx.strokeStyle=color?.value||'#b87996';
  ctx.lineWidth=Number(size?.value||3);
  ctx.lineTo(x,y);ctx.stroke();
 });
 const stopDrawing=()=>{
  if(!drawing)return;
  drawing=false;
  try{savedDrawing=canvas.toDataURL('image/png');localStorage.setItem('andrea-drawing-v1',savedDrawing);}catch{}
 };
 canvas.addEventListener('pointerup',stopDrawing);
 canvas.addEventListener('pointercancel',stopDrawing);
 document.querySelector('#clear-drawing')?.addEventListener('click',()=>{
  if(canvas.width>0)ctx.clearRect(0,0,canvas.width/dpr(),canvas.height/dpr());
  savedDrawing=null;localStorage.removeItem('andrea-drawing-v1');
 });
 document.querySelector('#save-drawing')?.addEventListener('click',()=>{
  if(canvas.width===0)return;
  const a=document.createElement('a');a.download='recuerdo-andrea.png';a.href=canvas.toDataURL('image/png');a.click();
 });
}
const budgetFields=[...document.querySelectorAll('.budget-field')];
const budgetTotal=document.querySelector('#budget-total');
function updateBudget(){if(!budgetTotal)return;const total=budgetFields.reduce((n,x)=>n+(Number(x.value)||0),0);budgetTotal.textContent=new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(total);localStorage.setItem('andrea-budget-v1',JSON.stringify(budgetFields.map(x=>x.value)));}
try{const saved=JSON.parse(localStorage.getItem('andrea-budget-v1')||'[]');budgetFields.forEach((x,i)=>x.value=saved[i]||'')}catch{}
budgetFields.forEach(x=>x.addEventListener('input',updateBudget));updateBudget();

/* Respaldo completo del diario para transferir avances entre dispositivos. */
(() => {
 const keys=['andrea-packing-v1','andrea-documents-v1','andrea-visited-v1','andrea-budget-v1','barcelona-ahorro-v1','andrea-drawing-v1'];
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

/* Tipo de cambio EUR/MXN: referencia diaria y calculadora */
(() => {
 const midEl=document.querySelector('#exchange-mid');
 if(!midEl)return;
 const buyEl=document.querySelector('#exchange-buy');
 const sellEl=document.querySelector('#exchange-sell');
 const statusEl=document.querySelector('#exchange-status');
 const updatedEl=document.querySelector('#exchange-updated');
 const mode=document.querySelector('#exchange-mode');
 const amount=document.querySelector('#exchange-amount');
 const amountLabel=document.querySelector('#exchange-amount-label');
 const result=document.querySelector('#exchange-result');
 let rate=null, rateDate='';
 const money=(value,currency)=>new Intl.NumberFormat('es-MX',{style:'currency',currency,maximumFractionDigits:2}).format(value);
 function calculate(){
  if(!rate||!amount||!result)return;
  const value=Math.max(0,Number(amount.value)||0);
  if(mode.value==='eur'){
   amountLabel.firstChild.textContent='Cantidad en euros ';
   result.textContent=money(value*rate,'MXN');
  }else{
   amountLabel.firstChild.textContent='Cantidad en pesos mexicanos ';
   result.textContent=(value/rate).toLocaleString('es-MX',{maximumFractionDigits:2})+' EUR';
  }
 }
 async function refresh(){
  try{
   const response=await fetch('https://api.frankfurter.dev/v2/rate/eur/mxn',{cache:'no-store'});
   if(!response.ok)throw new Error('No se pudo consultar el servicio');
   const data=await response.json();
   if(!Number.isFinite(Number(data.rate)))throw new Error('Respuesta inválida');
   rate=Number(data.rate);rateDate=data.date||'';
   midEl.textContent=money(rate,'MXN');
   buyEl.textContent=money(rate*1.02,'MXN');
   sellEl.textContent=money(rate*0.98,'MXN');
   statusEl.textContent='Referencia disponible';
   updatedEl.textContent='Dato publicado: '+(rateDate||'fecha no disponible')+' · consulta '+new Date().toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'});
   calculate();
  }catch(error){
   statusEl.textContent='No se pudo actualizar';
   updatedEl.textContent='Revisa tu conexión e inténtalo más tarde.';
   if(!rate)midEl.textContent=buyEl.textContent=sellEl.textContent='—';
  }
 }
 mode?.addEventListener('change',calculate);
 amount?.addEventListener('input',calculate);
 refresh();
 window.setInterval(refresh,30*60*1000);
})();
