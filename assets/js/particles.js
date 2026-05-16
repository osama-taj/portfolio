/**
 * CODE PARTICLES ENGINE — multi-section
 * Works on: #code-canvas (hero), #skills-canvas (skills), #contact-canvas (contact)
 */
(function () {

  const SYMBOLS = [
    '</', '/>', '{}', '()', '[]', '=>', '===', '!==',
    '::', '&&', '||', '++', '--', '//', '/*', '*/',
    '{', '}', '(', ')', '[', ']', '<', '>',
    ';', ':', '.', ',', '=', '!', '+', '?',
    '@', '$', '#', '%', '~', '^', '&', '*',
  ];

  const LANGS = [
    'Flutter', 'Python', 'SQL', 'PHP',
    'Dart', 'Firebase', 'Laravel', 'ML',
    'API', 'Git', 'Docker', 'NoSQL',
    'Bloc', 'REST', 'JSON', 'HTML',
  ];

  function randomToken(langRatio) {
    return Math.random() < langRatio
      ? LANGS[Math.floor(Math.random() * LANGS.length)]
      : SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  }

  const DARK_COLORS = [
    'rgba(245,158,11,{a})',
    'rgba(167,139,250,{a})',
    'rgba(99,102,241,{a})',
    'rgba(100,220,255,{a})',
    'rgba(52,211,153,{a})',
    'rgba(248,113,113,{a})',
  ];
  const LIGHT_COLORS = [
    'rgba(180,110,0,{a})',
    'rgba(109,40,217,{a})',
    'rgba(67,56,202,{a})',
    'rgba(8,145,178,{a})',
    'rgba(4,120,87,{a})',
    'rgba(185,28,28,{a})',
  ];

  function isDark() {
    return document.documentElement.getAttribute('data-theme') !== 'light';
  }
  function pickColor() {
    const pool = isDark() ? DARK_COLORS : LIGHT_COLORS;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  class Particle {
    constructor(w, h, instant, langRatio) {
      this.langRatio = langRatio;
      this.reset(w, h, instant);
    }
    reset(w, h, instant) {
      this.token  = randomToken(this.langRatio);
      this.isLang = LANGS.includes(this.token);
      this.fontSize = this.isLang ? 10 + Math.random()*5 : 9 + Math.random()*13;

      if (instant) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
      } else {
        const e = Math.floor(Math.random()*4);
        if      (e===0){this.x=Math.random()*w; this.y=-30;}
        else if (e===1){this.x=w+30; this.y=Math.random()*h;}
        else if (e===2){this.x=Math.random()*w; this.y=h+30;}
        else           {this.x=-30; this.y=Math.random()*h;}
      }

      const spd=0.15+Math.random()*0.4, ang=Math.random()*Math.PI*2;
      this.vx=Math.cos(ang)*spd; this.vy=Math.sin(ang)*spd;
      this.waveAmp=0.25+Math.random()*0.45;
      this.waveFreq=0.0018+Math.random()*0.003;
      this.wavePhase=Math.random()*Math.PI*2;
      this.rotation=Math.random()*Math.PI*2;
      this.rotSpeed=(Math.random()-0.5)*0.005;
      this.life=0;
      this.maxLife=280+Math.random()*420;
      this.fadeIn=55+Math.random()*55;
      this.fadeOut=70+Math.random()*60;
      this.colorTpl=pickColor();
      this.scalePhase=Math.random()*Math.PI*2;
      this.scaleSpeed=0.007+Math.random()*0.009;
    }
    update(w,h){
      this.life++;
      this.x+=this.vx+Math.sin(this.life*this.waveFreq+this.wavePhase)*this.waveAmp;
      this.y+=this.vy;
      this.rotation+=this.rotSpeed;
      this.scalePhase+=this.scaleSpeed;
      let a;
      if(this.life<this.fadeIn) a=this.life/this.fadeIn;
      else if(this.life>this.maxLife-this.fadeOut) a=(this.maxLife-this.life)/this.fadeOut;
      else a=1;
      this.alpha=Math.max(0,Math.min(1,a))*0.42;
      return this.life>=this.maxLife||this.x<-80||this.x>w+80||this.y<-80||this.y>h+80;
    }
    draw(ctx){
      ctx.save();
      ctx.translate(this.x,this.y);
      ctx.rotate(this.rotation);
      const sc=1+Math.sin(this.scalePhase)*0.055;
      ctx.scale(sc,sc);
      const color=this.colorTpl.replace('{a}',this.alpha);
      if(this.isLang){
        const pad=5,fh=this.fontSize+pad*2;
        ctx.font=`600 ${this.fontSize}px 'JetBrains Mono',monospace`;
        const tw=ctx.measureText(this.token).width, fw=tw+pad*2+8;
        ctx.beginPath();
        ctx.roundRect(-fw/2,-fh/2,fw,fh,fh/2);
        ctx.fillStyle=this.colorTpl.replace('{a}',this.alpha*0.16);
        ctx.fill();
        ctx.strokeStyle=color; ctx.lineWidth=0.75; ctx.stroke();
        ctx.fillStyle=color; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(this.token,0,0);
      } else {
        ctx.font=`500 ${this.fontSize}px 'JetBrains Mono',monospace`;
        ctx.fillStyle=color; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(this.token,0,0);
      }
      ctx.restore();
    }
  }

  class Scene {
    constructor(canvasId, count, langRatio, opacity){
      this.canvas=document.getElementById(canvasId);
      if(!this.canvas) return;
      this.ctx=this.canvas.getContext('2d');
      this.count=count; this.langRatio=langRatio;
      this.particles=[]; this.w=this.h=0;
      this.raf=null; this.active=false;
      this.canvas.style.opacity=opacity;
      this._resize(); this._spawnAll();
      this._setupIO(); this._setupResize();
    }
    _resize(){
      const el=this.canvas.parentElement;
      this.w=this.canvas.width=el.offsetWidth||window.innerWidth;
      this.h=this.canvas.height=el.offsetHeight||400;
    }
    _spawn(instant){ this.particles.push(new Particle(this.w,this.h,instant,this.langRatio)); }
    _spawnAll(){ for(let i=0;i<this.count;i++) this._spawn(true); }
    _tick(){
      const {ctx,w,h}=this;
      ctx.clearRect(0,0,w,h);
      while(this.particles.length<this.count) this._spawn(false);
      this.particles=this.particles.filter(p=>{
        const dead=p.update(w,h);
        if(!dead) p.draw(ctx);
        return !dead;
      });
      this.raf=requestAnimationFrame(()=>this._tick());
    }
    _start(){ if(this.active) return; this.active=true; this._tick(); }
    _stop(){ this.active=false; cancelAnimationFrame(this.raf); }
    _setupIO(){
      const io=new IntersectionObserver(e=>{
        e[0].isIntersecting?this._start():this._stop();
      },{threshold:0.05});
      io.observe(this.canvas.parentElement);
    }
    _setupResize(){
      let t;
      window.addEventListener('resize',()=>{
        clearTimeout(t); t=setTimeout(()=>this._resize(),180);
      });
    }
    recolor(){ this.particles.forEach(p=>{p.colorTpl=pickColor();}); }
  }

  function boot(){
    const hero    = new Scene('code-canvas',    55, 0.32, 0.55);
    const skills  = new Scene('skills-canvas',  40, 0.45, 0.50);
    const contact = new Scene('contact-canvas', 35, 0.38, 0.48);

    document.addEventListener('visibilitychange',()=>{
      [hero,skills,contact].forEach(s=>{
        if(!s.canvas) return;
        if(document.hidden) s._stop();
        else { s.active=false; s._start(); }
      });
    });

    const mo=new MutationObserver(()=>{
      [hero,skills,contact].forEach(s=>s.canvas&&s.recolor());
    });
    mo.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  }

  document.readyState==='loading'
    ? document.addEventListener('DOMContentLoaded',boot)
    : boot();
})();
