// Main UI script: theme, form handling, smooth scroll and gallery preview
(function(){
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  const saved = localStorage.getItem('theme');
  function applyTheme(t){
    if(t === 'dark') root.setAttribute('data-theme','dark');
    else root.removeAttribute('data-theme');
    if(toggle) toggle.textContent = t === 'dark' ? '☀️' : '🌙';
  }
  applyTheme(saved || 'light');
  if(toggle) toggle.addEventListener('click', ()=>{
    const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('theme', next);
  });

  // Year
  const y = new Date().getFullYear();
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = y;

  // Contact form using mailto: opens user's mail client with prefilled message
  const form = document.getElementById('contactForm');
  if(form){
    form.addEventListener('submit', e=>{
      e.preventDefault();
      const to = form.dataset.mailto || '';
      if(!to){
        alert('請設定聯絡信箱：編輯 contact form 的 data-mailto 屬性。');
        return;
      }
      const fd = new FormData(form);
      const name = fd.get('name') || '';
      const email = fd.get('email') || '';
      const message = fd.get('message') || '';
      const subject = `網站聯絡：${name || '訪客'}`;
      const body = `姓名: ${name}\n電子郵件: ${email}\n\n${message}`;
      const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      // open user's mail client in a new tab/window
      window.open(mailto, '_blank');
    });
  }

  // Smooth scrolling
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', e=>{
      const href = a.getAttribute('href');
      if(href && href.length > 1){
        const target = document.querySelector(href);
        if(target){
          e.preventDefault();
          target.scrollIntoView({behavior:'smooth',block:'start'});
        }
      }
    });
  });

  // Gallery: ornament hover preview
  const preview = document.getElementById('preview');
  const previewImg = preview ? preview.querySelector('img') : null;
  const previewCaption = preview ? preview.querySelector('.caption') : null;

  function showPreview(photo, caption, rect){
    if(!preview) return;
    if(previewImg) previewImg.src = photo;
    if(previewCaption) previewCaption.textContent = caption || '';
    // If there's space on the right, show there; otherwise place below (handled by CSS responsively)
    preview.classList.add('show');
  }
  function hidePreview(){
    if(!preview) return;
    preview.classList.remove('show');
  }

  document.querySelectorAll('.ornament').forEach(el=>{
    el.addEventListener('mouseenter', ()=>{
      const photo = el.dataset.photo;
      const caption = el.dataset.caption;
      showPreview(photo, caption);
    });
    el.addEventListener('mouseleave', hidePreview);
    // support focus for keyboard users
    el.addEventListener('focus', ()=>{
      showPreview(el.dataset.photo, el.dataset.caption);
    });
    el.addEventListener('blur', hidePreview);
    // small click/tap toggle for touch devices
    el.addEventListener('click', e=>{
      e.preventDefault();
      if(preview.classList.contains('show')) hidePreview();
      else showPreview(el.dataset.photo, el.dataset.caption);
    });
  });

})();

// Gift box greetings
(function(){
  const gift = document.getElementById('giftBox');
  const modal = document.getElementById('giftModal');
  const msg = document.getElementById('giftMessage');
  const closeBtn = modal ? modal.querySelector('.modal-close') : null;
  const nextBtn = document.getElementById('giftNext');

  if(!gift || !modal || !msg) return;

  // greetings array — will attempt to load overrides from `assets/greetings.txt`.
  let greetings = [
    '聖誕快樂！願你擁有溫暖時光。',
    '節日快樂！新的一年幸福平安。',
    '祝你笑口常開，事事順心。',
    '願這個季節帶給你溫馨與驚喜。',
    '祝你與家人共享美好時刻。',
    '願你的每一天都充滿光與愛。',
    '新年將至，願你實現心中願望。',
    '感謝有你，祝福滿滿！'
  ];

  // Try to load external greetings file (one greeting per line)
  (function loadExternalGreetings(){
    fetch('assets/greetings.txt').then(r=>{
      if(!r.ok) throw new Error('no greetings file');
      return r.text();
    }).then(text=>{
      const lines = text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
      if(lines.length) greetings = lines;
    }).catch(()=>{/* ignore, use defaults */});
  })();

  let lastIndex = -1;

  function randGreeting(){
    if(greetings.length === 0) return '';
    let i = Math.floor(Math.random()*greetings.length);
    if(greetings.length > 1){
      while(i === lastIndex){
        i = Math.floor(Math.random()*greetings.length);
      }
    }
    lastIndex = i;
    return greetings[i];
  }

  function openModal(){
    msg.textContent = randGreeting();
    // Launch ribbons/confetti from gift
    launchRibbons(12);
    modal.classList.add('show');
    modal.setAttribute('aria-hidden','false');
    // focus next button for accessibility
    if(nextBtn) nextBtn.focus();
  }
  function closeModal(){
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden','true');
    gift.focus();
  }

  gift.addEventListener('click', openModal);
  if(closeBtn) closeBtn.addEventListener('click', closeModal);
  if(nextBtn) nextBtn.addEventListener('click', ()=>{ msg.textContent = randGreeting(); });

  // close when clicking outside modal-inner
  modal.addEventListener('click', e=>{ if(e.target === modal) closeModal(); });
  document.addEventListener('keydown', e=>{ if(e.key === 'Escape' && modal.classList.contains('show')) closeModal(); });

})();

// Ribbon particle emitter
function launchRibbons(count){
  const gift = document.getElementById('giftBox');
  if(!gift) return;
  const rect = gift.getBoundingClientRect();
  for(let i=0;i<count;i++){
    const el = document.createElement('div');
    el.className = 'ribbon-piece color-' + (1 + Math.floor(Math.random()*4));
    // start near gift center with slight random offset
    const startX = rect.left + rect.width/2 + (Math.random()*40 - 20);
    const startY = rect.top + rect.height/2 + (Math.random()*20 - 10);
    el.style.left = startX + 'px';
    el.style.top = startY + 'px';
    el.style.opacity = '1';
    // random rotation
    el.style.transform = 'rotate(' + (Math.random()*40-20) + 'deg)';
    document.body.appendChild(el);
    // trigger animation
    const dx = (Math.random()*160 - 80);
    const duration = 800 + Math.random()*800;
    el.style.transition = 'transform ' + (duration/1000) + 's cubic-bezier(.2,.8,.2,1), opacity ' + (duration/1000) + 's linear';
    // use requestAnimationFrame to ensure style applied
    requestAnimationFrame(()=>{
      el.style.transform = 'translate(' + dx + 'px, -220px) rotate(' + (Math.random()*360-180) + 'deg)';
      el.style.opacity = '0';
    });
    // cleanup
    setTimeout(()=>{ if(el && el.parentNode) el.parentNode.removeChild(el); }, duration + 80);
  }
}

// Allow adding greetings at runtime (non-persistent)
window.addGreeting = function(text){ if(typeof text === 'string' && text.trim()){ greetings.push(text.trim()); return true } return false };

// Constellation hover/click labels
(function(){
  // Constellation labels disabled per user preference — no names or descriptions will be shown.
  const label = document.getElementById('constellationLabel');
  if(label){
    // hide if present
    label.style.display = 'none';
    label.setAttribute('aria-hidden','true');
  }
  // No event handlers attached for constellation hover/click to keep UI clean.
})();
