(() => {
  'use strict';
  const domains = [...document.querySelectorAll('[data-domain]')];
  const stage = document.getElementById('stage');
  const fallback = document.getElementById('object-fallback');
  const motionButton = document.querySelector('.motion-toggle');
  const navLinks = [...document.querySelectorAll('.domain-nav a')];
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
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
    const anchor = narrow ? Math.min(window.innerHeight * .8, 570) : window.innerHeight * .56;
    let chosen = 0;
    domains.forEach((el, i) => {if (el.getBoundingClientRect().top <= anchor) chosen = i;});
    changeDomain(chosen);
    const rect = domains[chosen].getBoundingClientRect();
    progress = isStill() ? 1 : ease(clamp((anchor - rect.top + 55) / Math.max(180, rect.height * .6), 0, 1));
    stage.style.setProperty('--copy-x', (-48 * (1 - progress)) + 'px');
    stage.style.setProperty('--cards-y', (38 * (1 - progress)) + 'px');
    stage.style.setProperty('--assembly-opacity', String(.3 + progress * .7));
    document.querySelector('.construction-page').style.transform = isStill() ? 'rotate(-3deg)' : 'rotate(' + (-7 + progress * 4) + 'deg)';
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
        const p = still ? 1 : progress;
        this.objects.forEach((object, i) => {
          const combined = active === 3;
          object.setVisible(combined || i === active);
          if (!object.visible) return;
          const source = object.texture.getSourceImage();
          const desired = combined ? Math.min(w * .26, h * .47) : Math.min(w * .49, h * .81);
          const size = desired / Math.max(source.width, source.height);
          const positions = [[.70,.28],[.86,.56],[.70,.73]];
          const x = combined ? w*positions[i][0] : w*(.70 + .18*(1-p));
          const y = combined ? h*positions[i][1] : h*(.43 - .15*(1-p));
          object.setPosition(x,y).setScale(size*(1.05-.05*p)).setRotation((combined ? [-.2,.2,-.12][i] : -.1) + (still ? 0 : (1-p)*.45)).setAlpha(.25+.75*p);
        });
      }
      update() {this.paint();}
    }
    game = new Phaser.Game({type:Phaser.AUTO,parent:'phaser-stage',transparent:true,banner:false,audio:{noAudio:true},render:{antialias:true},scale:{mode:Phaser.Scale.RESIZE,width:stage.clientWidth,height:stage.clientHeight},scene:[AssemblyScene],fps:{target:40,forceSetTimeOut:true}});
    new ResizeObserver(() => {if (game && game.scale) game.scale.resize(stage.clientWidth,stage.clientHeight); schedule();}).observe(stage);
    window.addEventListener('pagehide', event => {if (!event.persisted && game) game.destroy(true);});
  } catch (error) {
    stage.classList.remove('phaser-ready');
    if (game) game.destroy(true);
    console.warn('Scena decorativă nu este disponibilă. Conținutul rămâne accesibil.');
  }
})();
