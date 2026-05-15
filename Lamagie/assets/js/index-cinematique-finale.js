
(function(){
  const wrap=document.querySelector('.portal-wrap');
  const img=document.querySelector('.portal-img');
  const canvas=document.getElementById('cinemaCanvas');
  if(!wrap||!img||!canvas) return;
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx=canvas.getContext('2d');
  let W=0,H=0,DPR=1;
  let stars=[], dust=[], nodes=[], comets=[];
  let mouse={x:.5,y:.5};

  window.addEventListener('mousemove', e=>{
    mouse.x=e.clientX/innerWidth;
    mouse.y=e.clientY/innerHeight;
  }, {passive:true});

  function setup(){
    const rect=wrap.getBoundingClientRect();
    DPR=Math.min(window.devicePixelRatio||1,2);
    W=rect.width;
    H=rect.height || W*0.75;
    canvas.width=W*DPR;
    canvas.height=H*DPR;
    canvas.style.width=W+'px';
    canvas.style.height=H+'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);

    stars=Array.from({length:115},()=>({
      x:Math.random()*W,
      y:Math.random()*H,
      r:.28+Math.random()*1.25,
      p:Math.random()*Math.PI*2,
      s:.003+Math.random()*.015,
      gold:Math.random()>.38
    }));

    dust=Array.from({length:70},()=>({
      x:Math.random()*W,
      y:Math.random()*H,
      r:.25+Math.random()*.85,
      vx:(Math.random()-.5)*.045,
      vy:-.012-Math.random()*.03,
      a:.025+Math.random()*.06
    }));

    nodes=Array.from({length:32},()=>({
      x:Math.random()*W,
      y:Math.random()*H,
      p:Math.random()*Math.PI*2,
      s:.001+Math.random()*.003
    }));

    comets=[
      {x:-.15*W,y:.28*H,vx:.18,vy:.045,len:160,a:0,delay:120},
      {x:1.10*W,y:.70*H,vx:-.14,vy:-.035,len:130,a:0,delay:860}
    ];
  }

  function halo(x,y,r,a,color='217,191,114'){
    const g=ctx.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0,`rgba(${color},${a})`);
    g.addColorStop(.35,`rgba(${color},${a*.32})`);
    g.addColorStop(1,`rgba(${color},0)`);
    ctx.fillStyle=g;
    ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
  }

  function drawShip(x,y,scale,flip=false,alpha=.22){
    ctx.save();
    ctx.translate(x,y);
    ctx.scale(flip?-scale:scale,scale);
    ctx.globalAlpha=alpha;
    ctx.strokeStyle='rgba(217,191,114,.52)';
    ctx.fillStyle='rgba(6,12,22,.55)';
    ctx.lineWidth=.8;
    ctx.beginPath();
    ctx.ellipse(0,0,34,9,0,0,Math.PI*2);
    ctx.fill();ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(8,0,16,4,0,0,Math.PI*2);
    ctx.strokeStyle='rgba(111,184,255,.55)';
    ctx.stroke();
    const g=ctx.createLinearGradient(-95,0,-30,0);
    g.addColorStop(0,'rgba(111,184,255,0)');
    g.addColorStop(1,'rgba(111,184,255,.38)');
    ctx.strokeStyle=g;
    ctx.beginPath();ctx.moveTo(-95,0);ctx.lineTo(-30,0);ctx.stroke();
    ctx.restore();
    ctx.globalAlpha=1;
  }

  let t0=performance.now();
  function draw(now){
    if(!W||!H) setup();
    const t=now-t0;
    ctx.clearRect(0,0,W,H);

    // Halos sur zones lumineuses de l'image : centre astrolabe, livre, étoiles basses
    const pulse=.5+Math.sin(t*.0012)*.5;
    halo(W*.50,H*.155,95+pulse*24,.06+pulse*.035);
    halo(W*.76,H*.47,115+pulse*28,.07+pulse*.035);
    halo(W*.50,H*.90,120+pulse*30,.05+pulse*.035);
    halo(W*.30,H*.84,70+pulse*14,.04+pulse*.02);

    // Constellations fines
    for(let i=0;i<nodes.length;i++){
      const a=nodes[i];
      const ax=a.x+Math.sin(t*a.s+a.p)*4;
      const ay=a.y+Math.cos(t*a.s+a.p)*4;
      for(let j=i+1;j<nodes.length;j++){
        const b=nodes[j];
        const bx=b.x+Math.sin(t*b.s+b.p)*4;
        const by=b.y+Math.cos(t*b.s+b.p)*4;
        const d=Math.hypot(ax-bx,ay-by);
        if(d<120){
          ctx.strokeStyle=`rgba(217,191,114,${(1-d/120)*.12})`;
          ctx.lineWidth=.42;
          ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.stroke();
        }
      }
    }

    // Étoiles irrégulières
    stars.forEach(st=>{
      st.p += st.s;
      const alpha=.10+Math.sin(st.p)*.23;
      const col=st.gold?'217,191,114':'111,184,255';
      ctx.beginPath();
      ctx.arc(st.x,st.y,st.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(${col},${Math.max(alpha,.035)})`;
      ctx.fill();
      if(st.r>1.05 && alpha>.12){
        halo(st.x,st.y,st.r*5,alpha*.18,col);
      }
    });

    // Poussières lumineuses
    dust.forEach(d=>{
      d.x+=d.vx; d.y+=d.vy;
      if(d.y<-10){d.y=H+10; d.x=Math.random()*W;}
      if(d.x<-10)d.x=W+10; if(d.x>W+10)d.x=-10;
      ctx.beginPath();
      ctx.arc(d.x,d.y,d.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(240,220,155,${d.a})`;
      ctx.fill();
    });

    // Étoiles filantes rares
    comets.forEach(c=>{
      if(c.delay>0){c.delay--; return;}
      c.x += c.vx; c.y += c.vy;
      c.a = Math.min(.55, c.a+.008);
      const ang=Math.atan2(c.vy,c.vx);
      const tx=c.x-Math.cos(ang)*c.len;
      const ty=c.y-Math.sin(ang)*c.len;
      const grad=ctx.createLinearGradient(c.x,c.y,tx,ty);
      grad.addColorStop(0,`rgba(255,248,220,${c.a})`);
      grad.addColorStop(.2,`rgba(217,191,114,${c.a*.55})`);
      grad.addColorStop(1,'rgba(217,191,114,0)');
      ctx.strokeStyle=grad;
      ctx.lineWidth=1.2;
      ctx.beginPath();ctx.moveTo(c.x,c.y);ctx.lineTo(tx,ty);ctx.stroke();
      if(c.x>W+220 || c.x<-220 || c.y<-160 || c.y>H+160){
        c.x=c.vx>0?-180:W+180;
        c.y=(.18+Math.random()*.55)*H;
        c.delay=900+Math.floor(Math.random()*1000);
        c.a=0;
      }
    });

    // Navires subtils en surcouche, avec parallax minuscule
    const mx=(mouse.x-.5)*12, my=(mouse.y-.5)*8;
    drawShip(W*.22+mx,H*.25+my,.55,false,.18);
    drawShip(W*.76-mx,H*.18-my,.48,true,.16);

    requestAnimationFrame(draw);
  }

  if(img.complete) setup();
  img.addEventListener('load',setup);
  window.addEventListener('resize',setup,{passive:true});
  requestAnimationFrame(draw);
})();
