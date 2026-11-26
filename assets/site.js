(function(){
'use strict';
var d=document,root=d.documentElement;root.classList.remove('no-js');
var RM=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
window.dataLayer=window.dataLayer||[];
function track(ev,o){o=o||{};o.event=ev;window.dataLayer.push(o)}
var BASE=root.getAttribute('data-base')||'';

/* phone + CTA click events (preserved conversion events) */
d.addEventListener('click',function(e){
  var a=e.target.closest('a');if(!a)return;
  var h=a.getAttribute('href')||'';
  if(h.indexOf('tel:')===0){track('phone_click',{link_url:h,link_text:(a.textContent||'').trim().slice(0,60),page_path:location.pathname});
    /* preserved from the live site: GA4 call-tracking event */
    if(typeof window.gtag==='function')window.gtag('event','phone_call_click',{phone_number:h.replace('tel:',''),link_text:a.innerText||'',page_location:location.href});}
  else if(/free-inspection|#inspect/.test(h))track('cta_click',{cta:'schedule_inspection',link_text:(a.textContent||'').trim().slice(0,60)});
  else if(/wisetack/.test(h))track('financing_prequalify_click',{link_url:h});
});

/* nav */
var hdr=d.querySelector('.site-header'),mb=d.querySelector('.menu-btn');
if(mb)mb.addEventListener('click',function(){var h=mb.closest('.hdr')||hdr;d.documentElement.style.setProperty('--menu-top',Math.round(h.getBoundingClientRect().bottom)+'px');var o=d.body.classList.toggle('menu-open');mb.setAttribute('aria-expanded',o)});
d.querySelectorAll('.nav>li>button').forEach(function(b){
  b.addEventListener('click',function(){var li=b.parentNode,o=!li.classList.contains('open');
    d.querySelectorAll('.nav>li.open').forEach(function(x){if(x!==li){x.classList.remove('open');x.firstElementChild.setAttribute('aria-expanded','false')}});
    li.classList.toggle('open',o);b.setAttribute('aria-expanded',o)});
});
d.addEventListener('keydown',function(e){if(e.key==='Escape'){d.querySelectorAll('.nav>li.open').forEach(function(x){x.classList.remove('open')});d.body.classList.remove('menu-open');closeLB()}});
d.addEventListener('click',function(e){if(!e.target.closest('.nav'))d.querySelectorAll('.nav>li.open').forEach(function(x){x.classList.remove('open')})});

/* hero loop: poster first, video only if motion allowed and connection OK */
var hv=d.querySelector('.hero video');
if(hv){
  var c=navigator.connection||{},slow=c.saveData||/(^|-)2g/.test(c.effectiveType||'');
  var tg=d.querySelector('.media-toggle');
  if(RM||slow){hv.remove();if(tg)tg.remove()}
  else{
    var mob=window.matchMedia('(max-width:760px)').matches;
    hv.querySelectorAll('source').forEach(function(s){var src=s.getAttribute(mob?'data-m':'data-d');if(src)s.src=src});
    hv.load();var p=hv.play();if(p&&p.catch)p.catch(function(){if(tg)tg.dataset.state='paused';setIcon()});
    function setIcon(){if(!tg)return;var paused=hv.paused;tg.setAttribute('aria-label',paused?'Play background video':'Pause background video');tg.innerHTML=paused?'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4l13 8-13 8z"/></svg>':'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>'}
    hv.addEventListener('play',setIcon);hv.addEventListener('pause',setIcon);
    if(tg)tg.addEventListener('click',function(){hv.paused?hv.play():hv.pause()});
  }
}

/* click-to-play videos */
d.querySelectorAll('.vid-btn').forEach(function(b){
  b.addEventListener('click',function(){
    var w=b.parentNode,v=d.createElement('video');
    v.controls=true;v.playsInline=true;v.preload='auto';v.setAttribute('playsinline','');
    v.poster=b.dataset.poster||'';
    var s=d.createElement('source');s.src=b.dataset.src;s.type='video/mp4';v.appendChild(s);
    if(b.dataset.vtt){var t=d.createElement('track');t.kind='captions';t.srclang='en';t.label='English';t.src=b.dataset.vtt;t.default=true;v.appendChild(t)}
    w.replaceChild(v,b);v.play().catch(function(){});
    track('video_play',{video_title:b.dataset.title||''});
  });
});

/* slideshow (labeled project slideshow from real stills) */
d.querySelectorAll('.slideshow').forEach(function(ss){
  var f=ss.querySelectorAll('figure'),i=0,t=null,playing=!RM;
  var pb=ss.querySelector('[data-ss=pause]'),nb=ss.querySelector('[data-ss=next]'),bb=ss.querySelector('[data-ss=prev]');
  function show(n){f[i].classList.remove('on');i=(n+f.length)%f.length;f[i].classList.add('on')}
  function run(){clearInterval(t);if(playing)t=setInterval(function(){show(i+1)},4200);if(pb){pb.textContent=playing?'❚❚':'►';pb.setAttribute('aria-label',playing?'Pause slideshow':'Play slideshow')}}
  if(pb)pb.addEventListener('click',function(){playing=!playing;run()});
  if(nb)nb.addEventListener('click',function(){show(i+1)});
  if(bb)bb.addEventListener('click',function(){show(i-1)});
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)clearInterval(t);else run()})});io.observe(ss);
});

/* before/after */
d.querySelectorAll('.ba').forEach(function(ba){
  var r=ba.querySelector('input');function u(){ba.style.setProperty('--pos',r.value+'%')}
  r.addEventListener('input',u);u();
});

/* tabs */
d.querySelectorAll('[role=tablist]').forEach(function(tl){
  var tabs=tl.querySelectorAll('[role=tab]');
  tabs.forEach(function(t,ix){
    t.addEventListener('click',function(){sel(ix)});
    t.addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();var n=(ix+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;sel(n);tabs[n].focus()}});
  });
  function sel(ix){tabs.forEach(function(t,j){var on=j===ix;t.setAttribute('aria-selected',on);t.tabIndex=on?0:-1;d.getElementById(t.getAttribute('aria-controls')).hidden=!on})}
});

/* filters */
d.querySelectorAll('[data-filter-group]').forEach(function(g){
  var items=d.querySelectorAll(g.dataset.filterGroup),state={};
  g.querySelectorAll('button').forEach(function(b){
    b.addEventListener('click',function(){
      var k=b.dataset.k,v=b.dataset.v;state[k]=v;
      g.querySelectorAll('button[data-k="'+k+'"]').forEach(function(x){x.setAttribute('aria-pressed',x===b)});
      var shown=0;items.forEach(function(it){var ok=true;for(var kk in state){if(state[kk]!=='all'&&(' '+(it.dataset[kk]||'')+' ').indexOf(' '+state[kk]+' ')<0)ok=false}it.hidden=!ok;if(ok)shown++});
      var c=d.querySelector(g.dataset.count);if(c)c.textContent=shown;
    });
  });
});

/* lightbox */
var lb=d.querySelector('.lightbox');
if(lb&&!lb.querySelector('img')){var lbi=d.createElement('img');lbi.alt='';lbi.decoding='async';lb.insertBefore(lbi,lb.querySelector('p'))}
function closeLB(){if(lb&&lb.classList.contains('on')){lb.classList.remove('on');if(lb._ret)lb._ret.focus()}}
if(lb){
  d.querySelectorAll('[data-lb]').forEach(function(b){b.addEventListener('click',function(){lb.querySelector('img').src=b.dataset.lb;lb.querySelector('img').alt=b.dataset.alt||'';lb.querySelector('p').textContent=b.dataset.alt||'';lb._ret=b;lb.classList.add('on');lb.querySelector('button').focus()})});
  lb.addEventListener('click',function(e){if(e.target===lb||e.target.tagName==='BUTTON')closeLB()});
}

/* click-to-load maps (keeps third-party requests off until asked) */
d.querySelectorAll('[data-map]').forEach(function(b){b.addEventListener('click',function(){var f=d.createElement('iframe');f.src=b.dataset.map;f.title=b.dataset.title||'Map';f.loading='lazy';f.referrerPolicy='no-referrer-when-downgrade';var w=b.closest('.map');w.innerHTML='';w.appendChild(f)})});

/* forms */
function validate(f){
  var ok=true,first=null;
  f.querySelectorAll('[required]').forEach(function(el){
    var w=el.closest('.fld'),v=(el.value||'').trim(),bad=!v;
    if(!bad&&el.type==='email')bad=!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    if(!bad&&el.type==='tel')bad=v.replace(/\D/g,'').length<10;
    if(!bad&&el.name==='zip'&&v)bad=!/^\d{5}(-\d{4})?$/.test(v);
    if(w)w.classList.toggle('bad',bad);el.setAttribute('aria-invalid',bad);
    if(bad){ok=false;if(!first)first=el}
  });
  var z=f.querySelector('[name=zip]');if(z&&z.value&&!/^\d{5}(-\d{4})?$/.test(z.value.trim())){z.closest('.fld').classList.add('bad');ok=false;first=first||z}
  if(first)first.focus();return ok;
}
/* lead delivery: posts to the Apps Script relay set in <html data-lead> */
var T0=Date.now();
try{var qs=new URLSearchParams(location.search),u=['utm_source','utm_medium','utm_campaign','utm_term','gclid'].map(function(k){return qs.get(k)?k.replace('utm_','')+'='+qs.get(k):''}).filter(Boolean).join(' · ');if(u)sessionStorage.setItem('wrp_utm',u);if(!sessionStorage.getItem('wrp_ref')&&d.referrer&&d.referrer.indexOf(location.host)<0)sessionStorage.setItem('wrp_ref',d.referrer)}catch(e){}
/* spam screening (mirrors the lead relay's filter) */
function clean_(v){return v==null?'':String(v).trim()}
var PITCH_RE = /\b(seo|backlinks?|search engine|google (page|ranking)|page 1 of google|first page of google|rank(ing)? (higher|#?1)|web ?design|website (design|redesign)|lead generation|marketing (agency|services)|guest post|reddit|crypto|bitcoin|forex|loan offer|business funding|virtual assistant|reply (with )?["']?interested|unsubscribe|outsourc)/i;
function gibberish_(s) {
  // Random-character strings: long tokens that flip between lower and upper case or have no vowels.
  var words = clean_(s).split(/[^A-Za-z]+/).filter(function (w) { return w.length >= 8; });
  return words.some(function (w) {
    var flips = (w.slice(1).match(/[a-z](?=[A-Z])/g) || []).length;
    var consonantRun = /[bcdfghjklmnpqrstvwxz]{6,}/i.test(w);
    var noVowels = !/[aeiouy]/i.test(w);
    return flips >= 2 || consonantRun || noVowels;
  });
}
function spamCheck_(d) {
  var score = 0, why = [], strong = false;
  function hit(pts, reason) { score += pts; why.push(reason); if (pts >= 2) strong = true; }
  var first = clean_(d.first), last = clean_(d.last), name = clean_(d.name) || (first + ' ' + last).trim();
  var msg = clean_(d.message) + ' ' + clean_(d.need), email = clean_(d.email).toLowerCase();
  var addr = clean_(d.address), zip = clean_(d.zip), phone = clean_(d.phone).replace(/\D/g, '');
  if (d.website_url) hit(3, 'hidden spam-trap field filled');
  if (d.t && Number(d.t) < 2500) hit(3, 'form sent ' + d.t + ' ms after page load');
  if (gibberish_(name)) hit(2, 'random characters in name');
  if (gibberish_(msg)) hit(1, 'random characters in message');
  if (addr && gibberish_(addr)) hit(1, 'random characters in address');
  if (addr && !/\d/.test(addr) && addr.split(/\s+/).length < 2) hit(1, 'address is not a street address');
  if (/^\d{5}$/.test(zip) && !/^6[67]/.test(zip)) hit(1, 'ZIP ' + zip + ' is outside Kansas');
  var local = email.split('@')[0] || '';
  if ((local.match(/\./g) || []).length >= 3) hit(1, 'email uses the dotted-address trick');
  if (/\.(site|online|xyz|top|click|shop|store|icu|buzz|live)$/.test(email)) hit(1, 'disposable-style email domain');
  if (PITCH_RE.test(msg) || PITCH_RE.test(name)) hit(2, 'sales-pitch wording');
  if (/https?:\/\/|www\.|\.(com|net|org|io)\b/i.test(msg)) hit(1, 'link in message');
  if (/^1?(800|888|877|866|855|844|833)/.test(phone) || /^(\d)\1{6,}/.test(phone) || /^1?\d{3}555\d{4}$/.test(phone)) hit(1, 'fake or toll-free phone');
  return { score: score, block: (strong && score >= 3) || score >= 5, reasons: why };
}
window.wrpSpamCheck=spamCheck_;
function sendLead(form,data){
  var ep=d.documentElement.getAttribute('data-lead');if(!ep)return;
  data.form=form;data.page=location.href;data.title=d.title;data.t=Date.now()-T0;
  try{data.utm=sessionStorage.getItem('wrp_utm')||'';data.ref=sessionStorage.getItem('wrp_ref')||''}catch(e){}
  if(/[?&]testlead=1/.test(location.search))data.test=true;
  var sc=spamCheck_(data);if(sc.block){data.filtered=sc.reasons.join('; ');if(!d.documentElement.hasAttribute('data-lead-filter'))return}
  try{fetch(ep,{method:'POST',mode:'no-cors',keepalive:true,headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(data)})}catch(e){}
}
window.wrpSendLead=sendLead;
d.querySelectorAll('form[data-review]').forEach(function(f){
  f.addEventListener('submit',function(e){
    e.preventDefault();if(!validate(f))return;
    var data={};new FormData(f).forEach(function(v,k){data[k]=v});
    track('form_submit',{form_id:f.dataset.formId||'',service:data.service||'',page_path:location.pathname});
    sendLead(f.dataset.formId||'form',data);
    var ok=f.parentNode.querySelector('.form-ok');f.hidden=true;if(ok){ok.style.display='block';ok.tabIndex=-1;ok.focus()}
  });
});

/* prefill from calculator */
try{var pf=JSON.parse(sessionStorage.getItem('wrp_estimate')||'null');if(pf){d.querySelectorAll('form[data-form-id=inspection]').forEach(function(f){var m=f.querySelector('[name=message]');if(m&&!m.value)m.value=pf.note;var s=f.querySelector('[name=service]');if(s&&!s.value)s.value='Roof Replacement'})}}catch(e){}

/* quote calculator — $505 per square */
var PRICE=505;
d.querySelectorAll('.calc').forEach(function(cf){
  var out=cf.querySelector('.calc-out'),modeEls=cf.querySelectorAll('[name=mode]');
  function mode(){var m='footprint';modeEls.forEach(function(r){if(r.checked)m=r.value});cf.querySelectorAll('[data-mode]').forEach(function(x){x.hidden=x.dataset.mode!==m});return m}
  function fmt(n){return '$'+Math.round(n).toLocaleString('en-US')}
  function calc(){
    var m=mode(),sq=0,lo=0,hi=0;
    if(m==='squares'){sq=parseFloat(cf.querySelector('[name=squares]').value)||0;lo=hi=sq}
    else{var fp=parseFloat(cf.querySelector('[name=footprint]').value)||0;var pitch=parseFloat(cf.querySelector('[name=pitch]').value)||1.118;sq=fp*pitch/100;lo=sq*0.9;hi=sq*1.1}
    if(sq<=0){out.innerHTML='<p class="calc-hint">Enter your roof size to see an estimate.</p>';return}
    var est=sq*PRICE,html='<p class="calc-k">Estimated roof size</p><p class="calc-sq">'+sq.toFixed(1)+' squares</p><p class="calc-k">Estimated replacement price</p><p class="calc-total">'+fmt(est)+'</p>';
    if(m!=='squares')html+='<p class="calc-range">Likely range from footprint measuring: '+fmt(lo*PRICE)+' – '+fmt(hi*PRICE)+'</p>';
    html+='<p class="calc-basis">Based on $505 per roofing square (100 sq ft of roof surface). Your final price is confirmed in writing after a free roof inspection.</p>';
    out.innerHTML=html;
    var note='Online estimate: about '+sq.toFixed(1)+' squares × $505 = '+fmt(est)+'. Please confirm with a free inspection.';
    cf._est={sq:sq,est:est,note:note};
    cf.dataset.done='1';
  }
  cf.addEventListener('input',calc);cf.addEventListener('change',calc);
  cf.addEventListener('submit',function(e){e.preventDefault();calc();if(cf.dataset.done){try{sessionStorage.setItem('wrp_estimate',JSON.stringify(cf._est))}catch(x){}track('calculator_estimate',{squares:+(cf.querySelector('.calc-sq')||{}).textContent.split(' ')[0]||0});var t=d.querySelector(cf.dataset.next||'#inspect');if(t){var m=t.querySelector('[name=message]');try{m.value=JSON.parse(sessionStorage.getItem('wrp_estimate')).note}catch(x){};var s=t.querySelector('[name=service]');if(s)s.value='Roof Replacement';t.scrollIntoView({behavior:RM?'auto':'smooth'});var fn=t.querySelector('input');if(fn)fn.focus({preventScroll:true})}else location.href=BASE+'/free-inspection/#inspect'}});
  calc();
});

/* reveal */
if(!RM&&'IntersectionObserver' in window){var ro=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');ro.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});d.querySelectorAll('.rv').forEach(function(el){ro.observe(el)})}else d.querySelectorAll('.rv').forEach(function(el){el.classList.add('in')});

/* sticky bar never covers content: body already padded on small screens; hide while a form field is focused */
var bar=d.querySelector('.mbar');
if(bar){d.addEventListener('focusin',function(e){if(e.target.matches('input,select,textarea'))bar.style.display='none'});d.addEventListener('focusout',function(){bar.style.display=''})}
})();
/* reading progress */
(function(){var b=document.querySelector('.read-progress span');if(!b)return;function f(){var h=document.documentElement,s=h.scrollTop,m=h.scrollHeight-h.clientHeight;b.style.width=(m>0?s/m*100:0)+'%'}addEventListener('scroll',f,{passive:true});f()})();
(function(){var de=document.documentElement,t=0;function f(){de.classList.toggle('scrolled',scrollY>innerHeight*.6)}addEventListener('scroll',function(){if(!t){t=1;requestAnimationFrame(function(){t=0;f()})}},{passive:true});f()})();

/* gallery filter + lightbox paging */
(function(){
  var d=document,f=d.querySelector('.gx-filter');if(!f)return;
  var tiles=[].slice.call(d.querySelectorAll('.gx')),cnt=d.getElementById('gx-count');
  f.querySelectorAll('button').forEach(function(b){b.addEventListener('click',function(){
    var c=b.dataset.gcat,n=0;f.querySelectorAll('button').forEach(function(x){x.setAttribute('aria-pressed',x===b)});
    tiles.forEach(function(t){var ok=c==='all'||t.dataset.cat===c;t.hidden=!ok;if(ok){n++;t.classList.add('in')}});
    if(cnt)cnt.textContent=n+' photos shown';
  })});
  var lb=d.querySelector('.lightbox');if(!lb)return;
  function vis(){return tiles.filter(function(t){return !t.hidden}).map(function(t){return t.querySelector('[data-lb]')})}
  function go(step){var v=vis(),i=v.indexOf(lb._ret);if(i<0)return;var b=v[(i+step+v.length)%v.length];var im=lb.querySelector('img');im.src=b.dataset.lb;im.alt=b.dataset.alt||'';lb._ret=b}
  ['prev','next'].forEach(function(k){var b=d.createElement('button');b.type='button';b.className='lb-nav lb-'+k;b.setAttribute('aria-label',k==='prev'?'Previous photo':'Next photo');b.innerHTML=k==='prev'?'&#8249;':'&#8250;';b.addEventListener('click',function(e){e.stopPropagation();go(k==='prev'?-1:1)});lb.appendChild(b)});
  d.addEventListener('keydown',function(e){if(!lb.classList.contains('on'))return;if(e.key==='ArrowRight')go(1);if(e.key==='ArrowLeft')go(-1);if(e.key==='Escape'){lb.classList.remove('on');if(lb._ret)lb._ret.focus()}});
})();
(function(){var reels=[].slice.call(document.querySelectorAll('.reel'));
reels.forEach(function(li){var v=li.querySelector('video'),b=li.querySelector('[data-reel-play]');if(!v||!b)return;
b.addEventListener('click',function(){reels.forEach(function(o){var ov=o.querySelector('video');if(ov&&ov!==v&&!ov.paused)ov.pause()});
v.controls=true;li.classList.add('is-playing');var p=v.play();if(p&&p.catch)p.catch(function(){});try{v.focus({preventScroll:true})}catch(e){}
if(window.dataLayer)window.dataLayer.push({event:'social_click',cta:'reel-play',reel:li.getAttribute('data-reel')||''})});
v.addEventListener('ended',function(){li.classList.remove('is-playing');v.controls=false;v.load()})})})();
/* preselect service category on service pages */
(function(){var m=location.pathname.match(/\/services\/([a-z-]+)\//);if(!m)return;var map={'residential-roofing':'Residential Roofing','roof-replacement':'Roof Replacement','roof-repair':'Roof Repair','commercial-roofing':'Commercial Roofing','siding-trim':'Siding & Trim','gutters-gutter-guards':'Gutters & Gutter Guards'};var v=map[m[1]];if(!v)return;document.querySelectorAll('select[name="service"]').forEach(function(s){if(s.value)return;for(var i=0;i<s.options.length;i++){if(s.options[i].text===v){s.selectedIndex=i;break}}})})();
/* interactive checklist */
(function(){document.querySelectorAll('[data-chklist]').forEach(function(w){var bx=w.querySelectorAll('[data-chk]'),bar=w.querySelector('[data-chk-bar]'),n=w.querySelector('[data-chk-n]'),msg=w.querySelector('[data-chk-msg]'),cta=w.querySelector('[data-chk-cta]');function up(){var c=0;bx.forEach(function(b){if(b.checked)c++});n.textContent=c;bar.style.width=(c/bx.length*100)+'%';msg.textContent=c?(c>2?'Several signs — worth a professional look soon.':'Keep an eye on it, and have it checked.'):'Tick anything you have noticed.';cta.hidden=!c}bx.forEach(function(b){b.addEventListener('change',up)})})})();
/* attic ventilation estimator */
(function(){var w=document.querySelector('[data-ventcalc]');if(!w)return;var i=w.querySelector('input'),q=function(k){return w.querySelector('[data-vc="'+k+'"]')},f=function(x){return Math.round(x).toLocaleString()};function up(){var a=Math.max(0,Math.min(20000,+i.value||0)),A=a/150,B=a/300;q('a').textContent=A.toFixed(1);q('ai').textContent=f(A*144);q('b').textContent=B.toFixed(1);q('bi').textContent=f(B*144);q('in').textContent='~'+f(B*144*.55);q('ex').textContent='~'+f(B*144*.45)}i.addEventListener('input',up);up()})();

(function(){var st=document.querySelector('.pl-stage');if(!st)return;var svg=st.querySelector('svg'),cap=document.getElementById('pl-cap'),fx=st.querySelector('.pl-fx'),al=st.querySelector('.pl-alert');
var cur={shingles:'Onyx Black',siding:'Arctic White',trim:'White'},sky='sun',VAR={shingles:'--roof',siding:'--sid',trim:'--trim'},SK={sun:'a sunny day',dusk:'sunset',night:'night',hail:'a hailstorm'};
function desc(){cap.textContent='Illustrated home with '+cur.shingles+' shingles, '+cur.siding+' siding and '+cur.trim+' trim at '+SK[sky]}
function pick(b){var k=b.dataset.k;b.parentNode.querySelectorAll('.pl-sw').forEach(function(x){x.setAttribute('aria-checked',x===b?'true':'false')});svg.style.setProperty(VAR[k],b.dataset.v);cur[k]=b.dataset.n;document.querySelector('[data-out='+k+']').textContent=b.dataset.n;desc()}
function hail(on){fx.innerHTML='';if(!on)return;var ns='http://www.w3.org/2000/svg';for(var i=0;i<46;i++){var c=document.createElementNS(ns,'circle');c.setAttribute('cx',Math.round(Math.random()*800));c.setAttribute('cy',Math.round(-Math.random()*60));c.setAttribute('r',(1.6+Math.random()*2.6).toFixed(1));c.style.animationDuration=(0.7+Math.random()*0.7).toFixed(2)+'s';c.style.animationDelay=(-Math.random()*1.4).toFixed(2)+'s';fx.appendChild(c)}}
function setSky(k){sky=k;st.dataset.sky=k;document.querySelectorAll('.pl-chip').forEach(function(x){x.setAttribute('aria-checked',x.dataset.sky===k?'true':'false')});hail(k==='hail');al.hidden=k!=='hail';desc()}
document.querySelectorAll('.pl-sw').forEach(function(b){b.addEventListener('click',function(){pick(b)})});
document.querySelectorAll('.pl-chip').forEach(function(b){b.addEventListener('click',function(){setSky(b.dataset.sky)})});
document.querySelectorAll('.pl-row[role=radiogroup]').forEach(function(g){g.addEventListener('keydown',function(e){var bs=[].slice.call(g.children),i=bs.indexOf(document.activeElement);if(i<0)return;var d=(e.key==='ArrowRight'||e.key==='ArrowDown')?1:(e.key==='ArrowLeft'||e.key==='ArrowUp')?-1:0;if(!d)return;e.preventDefault();var n=bs[(i+d+bs.length)%bs.length];n.focus();n.click()})});
document.querySelector('.pl-rand').addEventListener('click',function(){['Shingles','Siding','Trim'].forEach(function(g){var bs=document.querySelectorAll('[aria-label="'+g+' color"] .pl-sw');pick(bs[Math.floor(Math.random()*bs.length)])});var ks=['sun','dusk','night','hail'];setSky(ks[Math.floor(Math.random()*ks.length)])});
document.querySelector('.pl-go').addEventListener('click',function(){var m=document.getElementById('msg3'),f=document.querySelector('.fx-form');var t='I designed a look on your website: '+cur.shingles+' shingles, '+cur.siding+' siding and '+cur.trim+' trim. I would like a free roof inspection and to talk about options.';if(m){m.value=t;m.dispatchEvent(new Event('input',{bubbles:true}))}if(f){f.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(function(){var n=f.querySelector('input');if(n)n.focus({preventScroll:true})},700)}else{location.href='/free-inspection/'}});
})();
