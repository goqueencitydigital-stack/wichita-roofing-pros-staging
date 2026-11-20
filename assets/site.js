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
function closeLB(){if(lb&&lb.classList.contains('on')){lb.classList.remove('on');if(lb._ret)lb._ret.focus()}}
if(lb){
  d.querySelectorAll('[data-lb]').forEach(function(b){b.addEventListener('click',function(){lb.querySelector('img').src=b.dataset.lb;lb.querySelector('img').alt=b.dataset.alt||'';lb.querySelector('p').textContent=b.dataset.alt||'';lb._ret=b;lb.classList.add('on');lb.querySelector('button').focus()})});
  lb.addEventListener('click',function(e){if(e.target===lb||e.target.tagName==='BUTTON')closeLB()});
}

/* click-to-load maps (keeps third-party requests off until asked) */
d.querySelectorAll('[data-map]').forEach(function(b){b.addEventListener('click',function(){var f=d.createElement('iframe');f.src=b.dataset.map;f.title=b.dataset.title||'Map';f.loading='lazy';f.referrerPolicy='no-referrer-when-downgrade';var w=b.closest('.map');w.innerHTML='';w.appendChild(f)})});

/* forms (staging: validate + confirm; nothing is transmitted) */
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
d.querySelectorAll('form[data-review]').forEach(function(f){
  f.addEventListener('submit',function(e){
    e.preventDefault();if(!validate(f))return;
    var data={};new FormData(f).forEach(function(v,k){data[k]=v});
    track('form_submit',{form_id:f.dataset.formId||'',service:data.service||'',page_path:location.pathname,staging_review_only:true});
    var ok=f.parentNode.querySelector('.form-ok');f.hidden=true;if(ok){ok.style.display='block';ok.tabIndex=-1;ok.focus()}
  });
});

/* prefill from calculator */
try{var pf=JSON.parse(sessionStorage.getItem('wrp_estimate')||'null');if(pf){d.querySelectorAll('form[data-form-id=inspection]').forEach(function(f){var m=f.querySelector('[name=message]');if(m&&!m.value)m.value=pf.note;var s=f.querySelector('[name=service]');if(s&&!s.value)s.value='Replacement'})}}catch(e){}

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
  cf.addEventListener('submit',function(e){e.preventDefault();calc();if(cf.dataset.done){try{sessionStorage.setItem('wrp_estimate',JSON.stringify(cf._est))}catch(x){}track('calculator_estimate',{squares:+(cf.querySelector('.calc-sq')||{}).textContent.split(' ')[0]||0});var t=d.querySelector(cf.dataset.next||'#inspect');if(t){var m=t.querySelector('[name=message]');try{m.value=JSON.parse(sessionStorage.getItem('wrp_estimate')).note}catch(x){};var s=t.querySelector('[name=service]');if(s)s.value='Replacement';t.scrollIntoView({behavior:RM?'auto':'smooth'});var fn=t.querySelector('input');if(fn)fn.focus({preventScroll:true})}else location.href=BASE+'/free-inspection/#inspect'}});
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
