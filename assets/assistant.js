/* Wichita Roofing Pros — website chat assistant.
   Staging: answers come only from the website's own approved content (assistant.json).
   Production: set data-endpoint on #wrp-chat to a server endpoint that calls the chosen AI model
   with the same content as grounding; the widget then sends messages there and falls back to local answers. */
(function(){
'use strict';
var d=document,root=d.getElementById('wrp-chat');if(!root)return;
var BASE=d.documentElement.getAttribute('data-base')||'',EP=root.dataset.endpoint||'',KB=null,PRICE=505,state={};
window.dataLayer=window.dataLayer||[];
function track(ev,o){o=o||{};o.event=ev;window.dataLayer.push(o)}
var launcher=root.querySelector('.chat-launch'),panel=root.querySelector('.chat-panel'),log=root.querySelector('.chat-log'),form=root.querySelector('.chat-form'),inp=form.querySelector('input'),chips=root.querySelector('.chat-chips');
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function add(who,html){var m=d.createElement('div');m.className='msg '+who;m.innerHTML=html;log.appendChild(m);log.scrollTop=log.scrollHeight;return m}
function link(u,t){return '<a href="'+BASE+u+'">'+esc(t)+'</a>'}
function open(){panel.hidden=false;launcher.setAttribute('aria-expanded','true');if(!log.children.length)greet();setTimeout(function(){inp.focus()},50);track('chat_open',{page_path:location.pathname})}
function close(){panel.hidden=true;launcher.setAttribute('aria-expanded','false');launcher.focus()}
launcher.addEventListener('click',function(){panel.hidden?open():close()});
root.querySelector('.chat-x').addEventListener('click',close);
panel.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
function load(cb){if(KB)return cb();fetch(BASE+'/assets/assistant.json').then(function(r){return r.json()}).then(function(j){KB=j;cb()}).catch(function(){KB={items:[]};cb()})}
function greet(){
  add('bot','Hi, I’m the Wichita Roofing Pros assistant. Ask me about leaks, hail damage, replacement, financing or warranties, or get a quick price estimate.<br><span class="es">¿Prefiere español? Hablamos Español — llame al <a href="tel:+13167421900">(316) 742-1900</a>.</span>');
  setChips(['Get a price estimate','My roof is leaking','We just had hail','Financing options','Schedule a free inspection']);
}
function setChips(a){chips.innerHTML='';a.forEach(function(t){var b=d.createElement('button');b.type='button';b.textContent=t;b.addEventListener('click',function(){send(t)});chips.appendChild(b)})}
var STOP={the:1,a:1,an:1,my:1,i:1,is:1,are:1,do:1,does:1,you:1,your:1,of:1,to:1,for:1,in:1,on:1,and:1,or:1,it:1,what:1,how:1,can:1,we:1,me:1,be:1,with:1,should:1,need:1,will:1,if:1,that:1,this:1,our:1,have:1,has:1,ks:1,wichita:1,kansas:1};
var SYN={leaking:'leak',leaks:'leak',leaky:'leak',drip:'leak',dripping:'leak',stain:'leak',hailstorm:'hail',storm:'hail',wind:'hail',price:'cost',pricing:'cost',quote:'cost',estimate:'cost',much:'cost',cheap:'cost',expensive:'cost',finance:'financing',loan:'financing',payment:'financing',payments:'financing',monthly:'financing',guarantee:'warranty',warranties:'warranty',transfer:'warranty',transferable:'warranty',flat:'commercial',business:'commercial',tpo:'commercial',gutter:'gutters',guards:'gutters',siding:'siding',vinyl:'siding',smartside:'siding',espanol:'spanish',español:'spanish',spanish:'spanish',hours:'hours',open:'hours',where:'area',areas:'area',serve:'area',city:'area',inspect:'inspection',inspections:'inspection',free:'inspection',replace:'replacement',replacing:'replacement',new:'replacement',metal:'metal',shingle:'shingles',shingles:'shingles',slate:'slate',insurance:'insurance',claim:'insurance',adjuster:'insurance'};
function toks(s){return (s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').match(/[a-z0-9]+/g)||[]).filter(function(w){return !STOP[w]&&w.length>1}).map(function(w){return SYN[w]||w.replace(/s$/,'')})}
function best(q){var qt=toks(q),top=null,ts=0;if(!qt.length)return null;KB.items.forEach(function(it){if(!it._t)it._t=toks(it.q+' '+(it.k||''));var s=0;qt.forEach(function(w){if(it._t.indexOf(w)>=0)s+=(it.k&&it.k.indexOf(w)>=0)?2.2:1});s=s/Math.sqrt(it._t.length+2);if(it.w)s*=it.w;if(s>ts){ts=s;top=it}});return ts>0.28?top:null}
function fmt(n){return '$'+Math.round(n).toLocaleString('en-US')}
function calcFlow(t){
  if(state.calc==='ask'){var n=parseFloat((t.match(/[\d,.]+/)||[''])[0].replace(/,/g,''));
    if(!n){add('bot','Please enter a number — your roof size in squares (for example “24”) or your home’s footprint in square feet (for example “1800 sq ft”).');return true}
    var sq=/sq\s*ft|square\s*f|sqft|ft/i.test(t)||n>120?n*1.118/100:n,est=sq*PRICE;
    add('bot','That’s about <b>'+sq.toFixed(1)+' squares</b>. At $505 per square, the estimated replacement price is <b>'+fmt(est)+'</b>.'+(n>120?' (I assumed a medium 6/12 pitch; steeper roofs have more surface.)':'')+'<br>Your final price is confirmed in writing after a free inspection. '+link('/roof-cost-calculator/','Open the full calculator')+' · '+link('/free-inspection/#inspect','Book the free inspection'));
    try{sessionStorage.setItem('wrp_estimate',JSON.stringify({sq:sq,est:est,note:'Chat estimate: about '+sq.toFixed(1)+' squares × $505 = '+fmt(est)+'. Please confirm with a free inspection.'}))}catch(e){}
    track('calculator_estimate',{source:'chat',squares:+sq.toFixed(1)});state.calc=null;setChips(['Schedule a free inspection','Financing options','What affects the price?']);return true}
  return false;
}
function leadFlow(t){
  if(!state.lead)return false;
  var L=state.lead;
  if(L.step==='name'){L.name=t;L.step='phone';add('bot','Thanks, '+esc(t.split(' ')[0])+'. What’s the best phone number to reach you?');return true}
  if(L.step==='phone'){if(t.replace(/\D/g,'').length<10){add('bot','Please enter a 10-digit phone number.');return true}L.phone=t;L.step='need';add('bot','Got it. Briefly, what’s going on with your roof?');return true}
  if(L.step==='need'){L.need=t;state.lead=null;track('chat_lead',{staging_review_only:true});add('bot','Thank you. <b>Staging preview:</b> this request was not sent. On the live site it goes to the Wichita Roofing Pros office, who call back during business hours (Mon–Fri 8AM–7PM, Sat 10AM–6PM). For anything urgent, call <a href="tel:+13167421900">(316) 742-1900</a>.');setChips(['Get a price estimate','Financing options']);return true}
  return false;
}
function local(t){
  var low=t.toLowerCase();
  if(/estimate|calculat|how much|price|cost|quote/.test(low)&&!/repair/.test(low)){state.calc='ask';add('bot','I can give you a quick replacement estimate at <b>$505 per roofing square</b> (100 sq ft of roof). How big is your roof? Enter squares (like “24”) or your home’s footprint in square feet (like “1800 sq ft”).');setChips([]);return}
  if(/schedule|book|appointment|call me|contact|callback|free inspection/.test(low)){state.lead={step:'name'};add('bot','Happy to set that up. You can '+link('/free-inspection/#inspect','use the inspection form')+' or call <a href="tel:+13167421900">(316) 742-1900</a>. Or leave your details here — what’s your name?');setChips([]);return}
  var it=best(t);
  if(it){add('bot',it.a+(it.u?'<br>'+link(it.u,it.l||'Read more'):''));setChips(it.next||['Get a price estimate','Schedule a free inspection'])}
  else{add('bot','I don’t want to guess on that one. The office can answer it directly at <a href="tel:+13167421900">(316) 742-1900</a>, or I can take your details for a callback.');setChips(['Schedule a free inspection','Get a price estimate'])}
}
function send(t){
  t=(t||'').trim();if(!t)return;add('me',esc(t));inp.value='';
  load(function(){
    if(calcFlow(t)||leadFlow(t))return;
    if(EP){var typing=add('bot','…');fetch(EP,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:t,page:location.pathname})}).then(function(r){return r.json()}).then(function(j){typing.innerHTML=j.reply_html||esc(j.reply||'')}).catch(function(){typing.remove();local(t)});return}
    local(t);
  });
}
form.addEventListener('submit',function(e){e.preventDefault();send(inp.value)});
})();
