// Pip Midnight Nursery - FINAL FIXED SCRIPT - Dispatch Exact Route
const $ = (s) => document.querySelector(s);
let audioCtx, isMuted = false, starsFound = 0, pipClicks = 0, dreams = 1235, isDispatching = false;
const odometerEl = $('#odometer');
const starCanvas = $('#starfieldCanvas'), sparkleCanvas = $('#sparkleCanvas');
const sCtx = starCanvas?.getContext('2d'), spCtx = sparkleCanvas?.getContext('2d');

function resizeCanvas(){[starCanvas,sparkleCanvas].forEach(c=>{if(!c)return; c.width=innerWidth; c.height=innerHeight});}
resizeCanvas(); addEventListener('resize', resizeCanvas);

// Starfield
let stars = Array.from({length:140},()=>({x:Math.random()*innerWidth, y:Math.random()*innerHeight, r:Math.random()*2+0.3, s:Math.random()*0.6+0.2, a:Math.random()}));
function drawStars(){if(!sCtx)return; sCtx.clearRect(0,0,starCanvas.width,starCanvas.height); stars.forEach(st=>{sCtx.globalAlpha=0.4+Math.sin(Date.now()*0.001+st.a)*0.4; sCtx.fillStyle='#fff'; sCtx.beginPath(); sCtx.arc(st.x,st.y,st.r,0,Math.PI*2); sCtx.fill(); st.y+=st.s; if(st.y>innerHeight) st.y=0;}); requestAnimationFrame(drawStars);} drawStars();

// Sparkle Trail + Pip eye follow
let sparkles=[], mouse={x:innerWidth/2,y:innerHeight/2}, last={x:0,y:0};
addEventListener('mousemove', e=>{
  mouse.x=e.clientX; mouse.y=e.clientY;
  if(Math.hypot(e.clientX-last.x, e.clientY-last.y)>5){
    sparkles.push({x:e.clientX,y:e.clientY,vx:(Math.random()-0.5)*2,vy:(Math.random()-0.5)*2-1,life:1,decay:0.018+Math.random()*0.02,char:['✦','★','✧','˚','⋆'][Math.floor(Math.random()*5)]});
    last={...mouse};
  }
  const pip=$('.pip-hero-img'); if(pip){const dx=(mouse.x-innerWidth/2)/innerWidth; const dy=(mouse.y-innerHeight/2)/innerHeight; pip.style.transform=`translate(${dx*24}px,${dy*14}px) rotate(${dx*6}deg)`;}
});
function drawSparkles(){if(!spCtx)return; spCtx.clearRect(0,0,sparkleCanvas.width,sparkleCanvas.height); sparkles.forEach(s=>{spCtx.globalAlpha=s.life; spCtx.font=`${12+14*s.life}px Fredoka`; spCtx.fillStyle=['#ff8fa3','#ffd6a8','#7dd3fc'][Math.floor(Math.random()*3)]; spCtx.fillText(s.char,s.x,s.y); s.x+=s.vx; s.y+=s.vy; s.life-=s.decay;}); sparkles=sparkles.filter(s=>s.life>0); requestAnimationFrame(drawSparkles);} drawSparkles();

// Audio
function ensureAudio(){if(!audioCtx) audioCtx=new (window.AudioContext||window.webkitAudioContext)(); if(audioCtx.state==='suspended') audioCtx.resume();}
function playTone(freq,dur=0.5,type='sine'){if(isMuted)return; ensureAudio(); const o=audioCtx.createOscillator(), g=audioCtx.createGain(); o.type=type; o.frequency.value=freq; o.connect(g); g.connect(audioCtx.destination); g.gain.setValueAtTime(0.0001,audioCtx.currentTime); g.gain.exponentialRampToValueAtTime(0.35,audioCtx.currentTime+0.05); g.gain.exponentialRampToValueAtTime(0.0001,audioCtx.currentTime+dur); o.start(); o.stop(audioCtx.currentTime+dur);}

$('#muteBtn')?.addEventListener('click',()=>{isMuted=!isMuted; $('#muteBtn').textContent=isMuted?'🔇 Audio: OFF':'🔊 Audio: ON'; $('#muteBtn').classList.toggle('active',isMuted); if(!isMuted) ensureAudio();});
$('#moodBtn')?.addEventListener('click',()=>{document.body.classList.toggle('day-mode'); const isDay=document.body.classList.contains('day-mode'); $('#moodLabel').textContent=isDay?'Sunny Nap Noon':'Cozy Midnight'; $('#moodBtn').textContent=isDay?'☀️ Toggle Night':'🌙 Toggle Day/Night'; playTone(isDay?523.25:196,0.6,isDay?'triangle':'sine');});
$('#chaosBtn')?.addEventListener('click',()=>{document.body.classList.toggle('chaos'); const on=document.body.classList.contains('chaos'); $('#chaosBtn').textContent=on?'🌀 Chaos: ON':'✨ Chaos Mode'; $('#chaosBtn').classList.toggle('active',on); playTone(on?440:330,0.3,'square'); spawnConfetti(12);});

// Lullaby Lab
document.querySelectorAll('.synth-pad').forEach(b=>{
  b.addEventListener('click',()=>{playTone(parseFloat(b.dataset.note),0.9,'triangle'); b.classList.add('playing'); setTimeout(()=>b.classList.remove('playing'),300);});
});
const seq=[261.63,329.63,392,523.25,392,329.63,261.63];
$('#playFullLullaby')?.addEventListener('click',async()=>{for(let f of seq){playTone(f,0.7,'sine'); await new Promise(r=>setTimeout(r,320));}});

// Lantern
let lanternHue=40;
$('#cycleLanternColor')?.addEventListener('click',()=>{lanternHue=(lanternHue+70)%360; $('#lanternMediaBox').style.filter=`hue-rotate(${lanternHue}deg) brightness(${($('#glowSlider')?.value||80)/100+0.5})`; playTone(300+lanternHue,0.4);});
$('#glowSlider')?.addEventListener('input',e=>{$('#lanternMediaBox').style.filter=`brightness(${e.target.value/100+0.5}) hue-rotate(${lanternHue}deg)`;});
$('#lanternMediaBox')?.addEventListener('mousemove',()=>{if(Math.random()<0.05 && starsFound<5){starsFound++; playTone(600+starsFound*120,0.4); if(starsFound===5){spawnConfetti(30); $('#lanternMediaBox').classList.add('glow');}}});

// === FIXED: Dispatch Delivery - EXACT ROUTE PAR ===
$('#dispatchRouteBtn')?.addEventListener('click',()=>{
  if(isDispatching) return;
  isDispatching=true;
  const pathEl = document.getElementById('routePath');
  const sprite = document.getElementById('deliverySprite');
  const btn = document.getElementById('dispatchRouteBtn');
  const routeLabel = document.getElementById('routeLabel');
  
  if(!pathEl || !sprite){isDispatching=false; return;}
  
  const pathLength = pathEl.getTotalLength();
  let progress = 0;
  const speed = 2.2; // speed control
  btn.textContent = '🚀 Delivering...';
  btn.disabled = true;
  if(routeLabel) routeLabel.textContent = 'Sector B: In Transit...';
  pathEl.style.stroke = '#ffd6a8';
  pathEl.style.filter = 'drop-shadow(0 0 6px #ff8fa3)';

  function animate(){
    progress += speed;
    if(progress >= pathLength){
      // Finished
      const endPoint = pathEl.getPointAtLength(pathLength);
      sprite.setAttribute('cx', endPoint.x);
      sprite.setAttribute('cy', endPoint.y);
      btn.textContent = '✅ Delivered!';
      if(routeLabel) routeLabel.textContent = 'Sector B: Delivered! ✨';
      playTone(659,0.3); setTimeout(()=>playTone(784,0.5),150);
      dreams+=12; if(odometerEl) odometerEl.textContent=String(dreams).padStart(2,'0').replace(/\B(?=(\d{3})+(?!\d))/g,',');
      spawnConfetti(28);
      setTimeout(()=>{
        btn.textContent = '🚀 Dispatch Delivery';
        btn.disabled = false;
        isDispatching=false;
        pathEl.style.stroke='#38bdf8';
        pathEl.style.filter='none';
        sprite.setAttribute('cx','20'); sprite.setAttribute('cy','50');
        if(routeLabel) routeLabel.textContent='Sector B: Attic Lofts';
      },1800);
      return;
    }
    const pt = pathEl.getPointAtLength(progress);
    sprite.setAttribute('cx', pt.x);
    sprite.setAttribute('cy', pt.y);
    // Glow pulse on move
    if(progress % 40 < 2) playTone(200+progress,0.07,'sawtooth');
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
});

// Odometer
setInterval(()=>{if(!isDispatching){dreams+=Math.floor(Math.random()*2); if(odometerEl) odometerEl.textContent=String(dreams).toLocaleString().padStart(2,'0');}},2800);

// Easter Eggs
let eggClicks=0; const eggBox=$('#secretEggBox');
function handleEgg(){eggClicks++; playTone(350+eggClicks*60,0.5,'triangle'); $('#eggIcon').textContent=['💤','😴','👀','✨','🎉'][Math.min(eggClicks,4)]; $('#eggText').textContent=eggClicks<3?'Keep tapping! Pip is waking...':eggClicks<5?'Almost awake!':'🎉 EASTER EGG UNLOCKED! Pip is AWAKE! Confetti dreams!'; if(eggClicks>=5){spawnConfetti(40); eggClicks=0;}}
eggBox?.addEventListener('click',handleEgg);
$('.character-viewport')?.addEventListener('click',()=>{pipClicks++; playTone(300+pipClicks*50,0.4,'triangle'); if(pipClicks>=5){spawnConfetti(35); $('.pip-hero-img')?.animate([{transform:'scale(1)'},{transform:'scale(1.3) rotate(8deg)'},{transform:'scale(1)'}],{duration:500}); pipClicks=0;}});

// Modal
$('#aboutBtn')?.addEventListener('click',()=>{$('#characterModal').classList.add('open');});
$('#closeModal')?.addEventListener('click',()=>{$('#characterModal').classList.remove('open');});
$('#characterModal')?.addEventListener('click',e=>{if(e.target.id==='characterModal') e.currentTarget.classList.remove('open');});

// Confetti + Progress
function spawnConfetti(n=25){for(let i=0;i<n;i++){const c=document.createElement('div'); c.className='confetti'; c.textContent=['🌟','☁️','🎵','💤','✦'][Math.floor(Math.random()*5)]; c.style.left=Math.random()*100+'vw'; c.style.fontSize=(14+Math.random()*18)+'px'; c.style.animationDelay=(Math.random()*0.6)+'s'; document.body.appendChild(c); setTimeout(()=>c.remove(),2300);}}
addEventListener('scroll',()=>{const p=scrollY/(document.body.scrollHeight-innerHeight)*100; const bar=$('.progress-bar'); if(bar) bar.style.width=p+'%';});
