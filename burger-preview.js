/* Both previews use the customisation form's current ingredient selections. */
(function(){
const original=window.buildCustomiseBody, topping=window.toggleTopping, sauce=window.toggleSauce;
const close=window.closeCustomise;
let active;
const colors={bun:['#f9c579','#a6531e'],beef:['#81503a','#29140e'],chicken:['#eab05a','#995022'],veggie:['#9d8c49','#4c4621'],cheese:['#ffd65b','#ed9209'],lettuce:['#9bd64b','#286c24'],tomato:['#ff6951','#a51e16'],onion:['#e9b7e4','#88407f'],cucumber:['#d9e9a1','#4d8a32'],pickle:['#b4c75a','#596a23'],egg:['#fffdf0','#d9c8a0'],halloumi:['#fff1c8','#bc783b'],sauce:['#f3ae75','#a64a28']};
function layer(type,key){
 const [a,b]=colors[type]; const g='g-'+key;
 let shape='', details='';
 if(type==='bun'){shape='<path d="M20 45 Q24 78 65 80 H235 Q276 78 280 45 Q270 18 150 18 Q30 18 20 45Z"/>'; }
 else if(type==='cheese'){shape='<path d="M20 35 Q150 12 280 35 L258 54 220 48 180 70 139 49 92 61 48 49Z"/>';}
 else if(type==='lettuce'){shape='<path d="M15 40 Q5 20 30 24 Q40 4 64 24 Q85 7 104 22 Q130 2 151 22 Q175 4 198 22 Q225 6 246 24 Q280 8 285 38 L269 55 244 46 222 59 193 47 169 60 145 47 120 59 94 47 70 59 44 47Z"/>';}
 else if(type==='onion'){shape='<ellipse cx="100" cy="40" rx="76" ry="21" fill="none" stroke="'+a+'" stroke-width="11"/><ellipse cx="205" cy="40" rx="70" ry="20" fill="none" stroke="'+b+'" stroke-width="9"/>';}
 else if(type==='egg'){shape='<path d="M20 42 Q30 9 85 20 Q130 3 180 18 Q250 5 280 43 Q275 67 210 61 Q160 76 110 60 Q40 70 20 42Z"/>';details='<ellipse cx="151" cy="37" rx="35" ry="18" fill="#f9b51b"/>';}
 else if(['tomato','cucumber','pickle'].includes(type)){shape=[70,150,230].map(x=>'<ellipse cx="'+x+'" cy="42" rx="57" ry="24" stroke="'+b+'" stroke-width="5"/>').join('');}
 else {shape='<path d="M18 39 Q18 12 150 12 Q282 12 282 39 L280 53 Q270 72 150 72 Q30 72 20 53Z"/>';if(['beef','chicken','veggie','halloumi'].includes(type))details=Array.from({length:26},(_,i)=>'<path d="M'+(32+i*9)+' '+(33+(i%4)*5)+' l5 8" stroke="#28150d" stroke-width="3" opacity=".35"/>').join('');}
 return '<svg viewBox="0 0 300 85" aria-hidden="true"><defs><linearGradient id="'+g+'" x2="0" y2="1"><stop stop-color="'+a+'"/><stop offset="1" stop-color="'+b+'"/></linearGradient></defs><g fill="url(#'+g+')">'+shape+'</g>'+details+'</svg>';
}
function top(){return '<svg viewBox="0 0 300 110" aria-hidden="true"><defs><linearGradient id="bb-top" x2="0" y2="1"><stop stop-color="#ffcf88"/><stop offset=".55" stop-color="#d78b36"/><stop offset="1" stop-color="#96501e"/></linearGradient></defs><path fill="url(#bb-top)" d="M17 83 C18 32 70 6 150 6 S282 32 283 83 Q280 104 150 104 Q20 104 17 83Z"/>'+Array.from({length:35},(_,i)=>{let x=48+(i*37)%204,y=28+(i*13)%49;return '<ellipse cx="'+x+'" cy="'+y+'" rx="4" ry="1.7" fill="#fff0c7" transform="rotate('+((i*19)%100-50)+' '+x+' '+y+')"/>';}).join('')+'</svg>';}
function orderLayers(){
 const n=currentItem.name.toLowerCase(), t=selectedToppings, all=t.has('All Salad')&&!t.has('Plain')&&!t.has('No Veggie');
 const patty=n.includes('chicken')?'chicken':n.includes('vegg')?'veggie':'beef';
 const layers=[['bun','base'],[patty,'patty1']];
 if(/half/.test(n))layers.push([patty,'patty2']);
 if((n.includes('cheese')||t.has('Cheese'))&&!t.has('No Cheese'))layers.push(['cheese','cheese']);
 if(t.has('Extra Cheese'))layers.push(['cheese','extra']);
 if(n.includes('egg')||t.has('Egg'))layers.push(['egg','egg']);
 if(t.has('Halloumi x2'))layers.push(['halloumi','hall1'],['halloumi','hall2']);
 if(all||t.has('Lettuce'))layers.push(['lettuce','lettuce']);
 if(all||t.has('Tomato'))layers.push(['tomato','tomato']);
 if(all||t.has('Cucumber'))layers.push(['cucumber','cucumber']);
 if((all||t.has('Onion'))&&!t.has('No Onion'))layers.push(['onion','onion']);
 if(t.has('Pickle'))layers.push(['pickle','pickle']);
 if([...selectedSauces].some(x=>!['Salt','Vinegar'].includes(x)))layers.push(['sauce','sauce']);
 layers.push(['top','top']);
 return layers;
}

function render(){
 if(!active)return;
 const {panel, fallback, summary, viewer, featured} = active;
 const layers = orderLayers();
 const spread = panel.classList.contains('bb-exploded');
 if(viewer) {
   viewer.update(layers, spread, [...selectedSauces].filter(name => !['Salt','Vinegar'].includes(name)));
 } else if (!featured) {
   renderFallback(fallback, layers, spread);
 }
 summary.textContent = [...selectedToppings, ...selectedSauces].join(' · ') || 'Choose your favourite toppings below';
}

function renderFallback(host, layers, spread){
 const existing=new Map([...host.children].map(el=>[el.dataset.key,el]));
 const step=Math.min(spread?36:20, (spread?220:145)/(layers.length-1));
 layers.forEach(([type,key],i)=>{let el=existing.get(key);if(!el){el=document.createElement('div');el.className='bb-layer';el.dataset.key=key;el.innerHTML=type==='top'?top():layer(type,key);host.append(el);el.animate?.([{opacity:0},{opacity:1}],{duration:300});}existing.delete(key);el.style.bottom=(14+i*step)+'px';el.style.zIndex=i+1;});
 existing.forEach(el=>el.remove());
}

function unmount(){
 active?.viewer?.unmount();
 active = undefined;
}

window.buildCustomiseBody = function(type){
 unmount();
 original(type);
 if(!/burger|pounder/i.test(currentItem.name))return;

 const featured = currentItem.name === 'Half Pounder with Cheese';
 const panel = document.createElement('section');
 panel.className = 'bb-preview';
 panel.innerHTML = `
   <div class="bb-heading">
     <span>BUILD YOUR BURGER</span>
     <div class="bb-actions">
       <button type="button" class="bb-reset" hidden>Reset view</button>
       <button type="button" class="bb-explode" aria-pressed="false" ${featured ? 'hidden' : ''}>Explode view</button>
     </div>
   </div>
   ${featured ? '<div class="bb-photo"><img src="IMG_0352.png" alt="Half Pounder with Cheese menu photo"></div>' : '<div id="bb-stack" role="img" aria-label="Illustrative burger preview"></div>'}
   <div class="bb-stage" hidden></div>
   <p id="bb-rotate-help" hidden>Drag to rotate · Arrow keys to adjust</p>
   <p id="bb-summary" aria-live="polite"></p>`;

 const fallback = panel.querySelector(featured ? '.bb-photo' : '#bb-stack');
 const stage = panel.querySelector('.bb-stage');
 const reset = panel.querySelector('.bb-reset');
 const explode = panel.querySelector('.bb-explode');
 const help = panel.querySelector('#bb-rotate-help');
 const session = {panel, fallback, featured, summary: panel.querySelector('#bb-summary')};
 active = session;
 document.getElementById('customiseBody').prepend(panel);
 const returnToPreview = document.createElement('button');
 if (featured) {
   returnToPreview.type = 'button';
   returnToPreview.className = 'bb-view-sauce';
   returnToPreview.textContent = 'View 3D burger';
   returnToPreview.hidden = true;
   returnToPreview.onclick = () => {
     document.getElementById('customiseModalInner').scrollTop = 0;
     reset.focus({ preventScroll: true });
   };
   document.querySelector('#bdy-sauces .acc-subtitle').after(returnToPreview);
 }

 function show3D(enabled){
   stage.hidden = reset.hidden = help.hidden = !enabled;
   fallback.hidden = enabled;
   if (featured) explode.hidden = returnToPreview.hidden = !enabled;
 }

 explode.onclick = function(){
   const on = panel.classList.toggle('bb-exploded');
   this.setAttribute('aria-pressed', String(on));
   this.textContent = on ? 'Stack view' : 'Explode view';
   render();
 };
 reset.onclick = () => session.viewer?.reset();
 render();

 const showFallback = () => {
   if(active !== session)return;
   session.viewer?.unmount();
   session.viewer = undefined;
   show3D(false);
   render();
 };
 import('./burger-3d.js').then(async ({mountBurger3D, loadHalfPounderModels}) => {
   if(active !== session)return;
   const ingredients = featured ? await loadHalfPounderModels() : undefined;
   if(active !== session)return;
   session.viewer = mountBurger3D(stage, showFallback, ingredients);
   show3D(true);
   render();
 }).catch(showFallback);
};
window.closeCustomise = function(...args){unmount();return close(...args);};
window.toggleTopping = function(...args){topping(...args);render();};
window.toggleSauce = function(...args){sauce(...args);render();};
})();
