/* Wichita Roofing Pros roof cost calculator — $505 per roofing square */
(function(){
var d=document,f=d.querySelector('form.cx');if(!f)return;
var PRICE=+f.dataset.price||505,WT=f.dataset.wt,RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
var O={};f.querySelectorAll('[data-o]').forEach(function(e){O[e.dataset.o]=e});
var fp=f.querySelector('[name=footprint]'),sqI=f.querySelector('[name=squares]');
function $(n){return '$'+Math.round(n).toLocaleString('en-US')}
function num(n){return Math.round(n).toLocaleString('en-US')}
function mode(){var m=f.querySelector('[name=mode]:checked');return m?m.value:'footprint'}
function pitch(){var p=f.querySelector('[name=pitch]:checked');return p||f.querySelector('[name=pitch]')}
function syncRange(name,v){var r=f.querySelector('.cx-range[data-for='+name+']');if(r){r.value=v;fill(r)}}
function fill(r){var p=(r.value-r.min)/(r.max-r.min)*100;r.style.setProperty('--p',Math.max(0,Math.min(100,p))+'%')}
function chips(){f.querySelectorAll('.cx-chip').forEach(function(c){var i=c.dataset.set==='footprint'?fp:sqI;c.setAttribute('aria-pressed',String(+c.dataset.v===+i.value))})}
var shown=0,raf=0;
function animate(to){cancelAnimationFrame(raf);if(RM){O.total.textContent=$(to);shown=to;return}var from=shown,t0=performance.now();(function st(t){var k=Math.min(1,(t-t0)/450),e=1-Math.pow(1-k,3),v=from+(to-from)*e;O.total.textContent=$(v);if(k<1)raf=requestAnimationFrame(st);else shown=to})(t0)}
function calc(){
  var m=mode(),sq,lo,hi,pf=1,area,fpv=0;
  f.querySelectorAll('[data-mode]').forEach(function(x){x.hidden=x.dataset.mode!==m});
  if(m==='squares'){sq=Math.max(0,parseFloat(sqI.value)||0);lo=hi=sq;area=sq*100}
  else{fpv=Math.max(0,parseFloat(fp.value)||0);pf=parseFloat(pitch().value)||1.118;area=fpv*pf;sq=area/100;lo=sq*.9;hi=sq*1.1}
  var est=sq*PRICE;animate(est);
  O.fprow.hidden=O.pfrow.hidden=m==='squares';
  O.fp.textContent=num(fpv)+' sq ft';O.pf.textContent='×'+pf.toFixed(3);
  O.area.textContent=num(area)+' sq ft';O.sq.textContent=sq.toFixed(1)+' squares';O.total2.textContent=$(est);
  O.bandwrap.hidden=m==='squares';
  if(m!=='squares'){O.lo.textContent=$(lo*PRICE);O.hi.textContent=$(hi*PRICE)}
  var fin;
  if(est>=500&&est<=25000)fin='<p><b>Financing may fit this project.</b> Wisetack offers $500–$25,000* for qualifying roofing projects, with terms of 3–60 months*. Checking uses a soft credit check.</p><a class="link-arrow" href="'+WT+'" target="_blank" rel="noopener">Check Financing Options</a>';
  else if(est>25000)fin='<p><b>Financing for part of the project.</b> Wisetack offers $500–$25,000* for qualifying roofing projects. We can talk through options at your inspection.</p><a class="link-arrow" href="'+WT+'" target="_blank" rel="noopener">Check Financing Options</a>';
  else fin='';
  O.fin.innerHTML=fin?fin+'<small>*All financing is subject to credit approval.</small>':'';
  O.fin.hidden=!fin;
  var note=m==='squares'?'Online estimate: '+sq.toFixed(1)+' squares × $505 = '+$(est)+'. Please confirm with a free inspection.'
    :'Online estimate: '+num(fpv)+' sq ft footprint, '+pitch().dataset.r+'/12 pitch, about '+sq.toFixed(1)+' squares × $505 = '+$(est)+' (range '+$(lo*PRICE)+'–'+$(hi*PRICE)+'). Please confirm with a free inspection.';
  f._est={sq:sq,est:est,note:note};
  chips();
  f.querySelectorAll('.cx-live').forEach(function(l){l.querySelector('b').textContent=$(est);l.querySelector('span').textContent=' · '+sq.toFixed(1)+' squares'});
  try{var q=m==='squares'?'?sq='+sqI.value:'?fp='+fp.value+'&p='+pitch().dataset.r;history.replaceState(null,'',location.pathname+q+location.hash)}catch(x){}
}
/* restore from link */
var Q=new URLSearchParams(location.search);
if(Q.get('sq')){f.querySelector('[name=mode][value=squares]').checked=true;sqI.value=Q.get('sq')}
else if(Q.get('fp')){fp.value=Q.get('fp');var pr=f.querySelector('[name=pitch][data-r="'+Q.get('p')+'"]');if(pr)pr.checked=true}
syncRange('footprint',fp.value);syncRange('squares',sqI.value);
f.addEventListener('input',function(e){var t=e.target;
  if(t.classList.contains('cx-range')){(t.dataset.for==='footprint'?fp:sqI).value=t.value;fill(t)}
  else if(t===fp)syncRange('footprint',t.value);else if(t===sqI)syncRange('squares',t.value);
  calc()});
f.addEventListener('change',calc);
f.addEventListener('click',function(e){var c=e.target.closest('.cx-chip');if(c){var i=c.dataset.set==='footprint'?fp:sqI;i.value=c.dataset.v;syncRange(c.dataset.set,c.dataset.v);calc()}
  var cp=e.target.closest('[data-copy]');if(cp){var s=cp.querySelector('span'),txt=location.href;function ok(){s.textContent='Link Copied';setTimeout(function(){s.textContent='Copy Link'},2200)}
    if(navigator.clipboard)navigator.clipboard.writeText(txt).then(ok,function(){prompt('Copy this link',txt)});else prompt('Copy this link',txt)}});
f.addEventListener('submit',function(e){e.preventDefault();calc();
  try{sessionStorage.setItem('wrp_estimate',JSON.stringify(f._est))}catch(x){}
  (window.dataLayer=window.dataLayer||[]).push({event:'calculator_estimate',squares:+f._est.sq.toFixed(1)});
  var t=d.querySelector('#inspect');
  if(t){var mm=t.querySelector('[name=message]');if(mm)mm.value=f._est.note;var s=t.querySelector('[name=service]');if(s)s.value='Roof Replacement';t.scrollIntoView({behavior:RM?'auto':'smooth'});var fn=t.querySelector('input:not([type=hidden])');if(fn)fn.focus({preventScroll:true})}
  else location.href='/free-inspection/#inspect'});
calc();
})();
