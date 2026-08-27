(() => {
  'use strict';
  const domains = [...document.querySelectorAll('[data-domain]')];
  const stage = document.getElementById('stage');
  const fallback = document.getElementById('object-fallback');
  const motionButton = document.querySelector('.motion-toggle');
  const navLinks = [...document.querySelectorAll('.domain-nav a')];
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 800px)');
  const density = () => mobile.matches ? Math.min(3, Math.max(2, window.devicePixelRatio || 1)) : 1;
  const data = [
    { label: 'Florării', eyebrow: 'FLORĂRIE', title: ['Flori.', 'Pentru orice poveste.'], asset: 'flower' },
    { label: 'Înfrumusețare', eyebrow: 'ÎNFRUMUSEȚARE', title: ['Frumusețe.', 'În stilul tău.'], asset: 'scissors' },
    { label: 'Auto', eyebrow: 'AUTO', title: ['Îngrijire.', 'Până la detaliu.'], asset: 'car' },
    { label: 'Altul', eyebrow: 'AFACEREA TA', title: ['Ideea ta.', 'Prinde contur.'], asset: 'flower' }
  ];
  let active = 0, progress = 1, paused = media.matches, game = null, scene = null, scheduled = false;
  let stageVisible = true;
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const ease = n => 1 - Math.pow(1 - n, 3);
  const isStill = () => paused || media.matches;

  function changeDomain(index) {
    if (active === index && stage.dataset.ready) return;
    active = index;
    stage.dataset.ready = 'true';
    const info = data[active];
    const title = document.getElementById('demo-title');
    title.replaceChildren(document.createTextNode(info.title[0]), document.createElement('br'), document.createTextNode(info.title[1]));
    document.querySelector('.demo-eyebrow').textContent = info.eyebrow;
    document.getElementById('scene-category').textContent = String(active + 1).padStart(2, '0') + ' / ' + info.label;
    document.getElementById('scene-count').textContent = String(active + 1).padStart(2, '0');
    fallback.src = './images/' + info.asset + '.png';
    navLinks.forEach((a, i) => { if (i === active) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    domains.forEach((el, i) => el.classList.toggle('is-active', i === active));
  }
  function sync() {
    scheduled = false;
    const narrow = window.innerWidth <= 540;
    const desktopAnchor = narrow ? Math.min(window.innerHeight * .8, 570) : window.innerHeight * .56;
    const stickyBottom = document.querySelector('.scene-sticky').getBoundingClientRect().bottom;
    const anchor = mobile.matches && narrow ? Math.min(window.innerHeight - 32, stickyBottom + 90) : desktopAnchor;
    let chosen = 0;
    domains.forEach((el, i) => {if (el.getBoundingClientRect().top <= anchor) chosen = i;});
    changeDomain(chosen);
    const rect = domains[chosen].getBoundingClientRect();
    progress = isStill() ? 1 : ease(clamp((anchor - rect.top + 55) / Math.max(180, rect.height * .6), 0, 1));
    stage.style.setProperty('--copy-x', ((mobile.matches ? -20 : -48) * (1 - progress)) + 'px');
    stage.style.setProperty('--cards-y', ((mobile.matches ? 18 : 38) * (1 - progress)) + 'px');
    stage.style.setProperty('--assembly-opacity', String(mobile.matches ? 1 : .3 + progress * .7));
    document.querySelector('.construction-page').style.transform = mobile.matches ? 'none' : isStill() ? 'rotate(-3deg)' : 'rotate(' + (-7 + progress * 4) + 'deg)';
    if (scene) scene.paint();
  }
  function schedule() {if (!scheduled) {scheduled = true; requestAnimationFrame(sync);}}
  function setMotion() {
    document.documentElement.classList.toggle('motion-off', isStill());
    motionButton.setAttribute('aria-pressed', String(isStill()));
    motionButton.textContent = isStill() ? 'Pornește animațiile' : 'Oprește animațiile';
    motionButton.disabled = media.matches;
    if (media.matches) motionButton.textContent = 'Mișcare redusă activă';
    if (game && game.loop) {
      if (isStill() || !stageVisible || document.hidden) game.loop.sleep();
      else game.loop.wake();
    }
    schedule();
  }
  motionButton.hidden = false;
  motionButton.addEventListener('click', () => {paused = !paused; setMotion();});
  media.addEventListener('change', () => {paused = media.matches; setMotion();});
  window.addEventListener('scroll', schedule, {passive: true});
  window.addEventListener('resize', schedule, {passive: true});
  document.addEventListener('visibilitychange', setMotion);
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => {stageVisible = entries[0].isIntersecting; setMotion();}, {rootMargin:'100px'}).observe(stage);
  if (mobile.matches) {
    const arrowPaths={'↗':'M4 12 12 4M4 4h8v8','↓':'M8 3v10M3 8l5 5 5-5','↑':'M8 13V3M3 8l5-5 5 5'};
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const texts=[];
    while(walker.nextNode()){const node=walker.currentNode;if(/[↗↓↑]/.test(node.nodeValue)&&!node.parentElement.closest('script,style'))texts.push(node);}
    texts.forEach(node=>{const fragment=document.createDocumentFragment();node.nodeValue.split(/([↗↓↑])/).forEach(part=>{
      if(!arrowPaths[part]){fragment.append(document.createTextNode(part));return;}
      const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 16 16');svg.setAttribute('class','mobile-arrow');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
      const line=document.createElementNS('http://www.w3.org/2000/svg','path');line.setAttribute('d',arrowPaths[part]);svg.append(line);fragment.append(svg);
    });node.replaceWith(fragment);});
  }
  changeDomain(0);
  setMotion();
  sync();

  // Only decorative objects are drawn in Phaser; all content and controls stay in HTML.
  if (!window.Phaser) return;
  try {
    class AssemblyScene extends Phaser.Scene {
      constructor() {super('Assembly');}
      preload() {
        ['flower', 'scissors', 'car'].forEach(key => this.load.image(key, './images/' + key + '.png'));
      }
      create() {
        if (!['flower','scissors','car'].every(key => this.textures.exists(key))) {game.destroy(true); return;}
        this.objects = ['flower','scissors','car'].map(key => this.add.image(0, 0, key));
        scene = this;
        stage.classList.add('phaser-ready');
        this.scale.on('resize', () => this.paint());
        this.paint();
        setMotion();
      }
      paint() {
        if (!this.objects) return;
        const w = this.scale.width, h = this.scale.height;
        const still = isStill();
        let p = still ? 1 : progress;
        let blendStep = 1;
        if (mobile.matches && !still) {
          const now = performance.now();
          const dt = Math.min(64, now - (this.lastMobileFrame || now - 16));
          this.lastMobileFrame = now;
          blendStep = 1 - Math.exp(-dt / 85);
          if (this.previousMobileDomain !== active) {this.mobileProgress = Math.min(this.mobileProgress ?? p, .35);this.previousMobileDomain = active;}
          this.mobileProgress = (this.mobileProgress ?? p) + (p - (this.mobileProgress ?? p)) * blendStep;
          p = this.mobileProgress;
        }
        this.objects.forEach((object, i) => {
          const combined = active === 3;
          const targetVisible = combined || i === active;
          if (mobile.matches) {
            this.mobileOpacity ??= [0,1,2].map(index => active === 3 || index === active ? 1 : 0);
            this.mobileOpacity[i] = still ? Number(targetVisible) : this.mobileOpacity[i] + (Number(targetVisible) - this.mobileOpacity[i]) * blendStep;
            object.setVisible(this.mobileOpacity[i] > .005);
          } else object.setVisible(targetVisible);
          if (!object.visible) return;
          const source = object.texture.getSourceImage();
          const desired = combined ? Math.min(w * .26, h * .47) : Math.min(w * (mobile.matches ? .37 : .49), h * (mobile.matches ? .72 : .81));
          const size = desired / Math.max(source.width, source.height);
          const positions = [[.70,.28],[.86,.56],[.70,.73]];
          const x = combined ? w*positions[i][0] : w*(mobile.matches ? .75 + .08*(1-p) : .70 + .18*(1-p));
          const y = combined ? h*positions[i][1] : h*(mobile.matches ? .44 - .05*(1-p) : .43 - .15*(1-p));
          object.setPosition(x,y).setScale(size*(mobile.matches ? 1 : 1.05-.05*p)).setRotation((combined ? [-.2,.2,-.12][i] : -.1) + (still ? 0 : (1-p)*(mobile.matches ? .12 : .45))).setAlpha(mobile.matches ? this.mobileOpacity[i] : .25+.75*p);
        });
      }
      update() {this.paint();}
    }
    game = new Phaser.Game({type:Phaser.AUTO,parent:'phaser-stage',transparent:true,banner:false,audio:{noAudio:true},render:{antialias:true},scale:{mode:mobile.matches?Phaser.Scale.FIT:Phaser.Scale.RESIZE,width:Math.round(stage.clientWidth*density()),height:Math.round(stage.clientHeight*density())},scene:[AssemblyScene],fps:{target:mobile.matches?60:40,forceSetTimeOut:!mobile.matches}});
    new ResizeObserver(() => {if (game && game.scale) {if(mobile.matches) game.scale.setGameSize(Math.round(stage.clientWidth*density()),Math.round(stage.clientHeight*density())); else game.scale.resize(stage.clientWidth,stage.clientHeight);} schedule();}).observe(stage);
    window.addEventListener('pagehide', event => {if (!event.persisted && game) game.destroy(true);});
  } catch (error) {
    stage.classList.remove('phaser-ready');
    if (game) game.destroy(true);
    console.warn('Scena decorativă nu este disponibilă. Conținutul rămâne accesibil.');
  }
})();
