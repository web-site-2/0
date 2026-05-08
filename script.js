/* ============================================
   ROMANTIC ARABIC SPA — script.js
   Password · Countdown · Messages · Gallery
   Music · Confetti · Hearts · Typing
   ============================================ */

'use strict';

/* ── CONFIG — Customize these ── */
const CONFIG = {
  password:       'حبيبي',           // ← كلمة السر
  relationStart:  new Date('2023-02-14T00:00:00'), // ← تاريخ بداية العلاقة

  messages: [
    { icon: '💌', text: 'لو عمري كان كتاب، كل صفحة فيه كانت بتبدأ بسمك...' },
    { icon: '🌹', text: 'ما عرفت معنى الطمأنينة إلا لما كنت جنبك، وما عرفت معنى الغياب إلا لما بعدت عني.' },
    { icon: '🌙', text: 'كل نجمة في السما تحكي جزء من قصتنا، والقصة لسه في أجمل فصولها.' },
    { icon: '💫', text: 'أنتِ مش بس حبيبتي، أنتِ البيت اللي حلمت بيه ولقيته أجمل مما تخيلت.' },
    { icon: '❤️', text: 'آسف على كل لحظة وجعتك فيها. وعدي إنك دايماً تلاقي قلبي طريق للبيت.' },
    { icon: '✨', text: 'بحبك مش بس الأيام الحلوة.. بحبك في كل يوم، في كل تفصيلة، في كل نظرة.' },
  ],

  finalTitle:  'أنتِ الأجمل في حياتي',
  finalMsg:    'كل كلمة قلتها جاية من أعمق مكان في قلبي.\nأنتِ نعمة ما أستحقها، وحلم صحيت منه وهو حقيقي.\nبحبك دايماً... أكثر مما تتخيلي. ❤️',
};

/* ══════════════════════════════════════════════
   ❤️  FALLING HEARTS (Canvas)
   ══════════════════════════════════════════════ */
(function initHearts() {
  const canvas = document.getElementById('heartsCanvas');
  const ctx    = canvas.getContext('2d');
  let   hearts = [];
  let   W, H;

  const HEART_CHARS = ['❤', '🤍', '♡', '❣'];
  const MAX_HEARTS  = window.innerWidth < 480 ? 14 : 22;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function randomHeart() {
    return {
      x:       Math.random() * W,
      y:       -30,
      size:    10 + Math.random() * 18,
      speed:   0.6 + Math.random() * 1.2,
      opacity: 0.15 + Math.random() * 0.45,
      sway:    (Math.random() - 0.5) * 0.8,
      angle:   Math.random() * Math.PI * 2,
      char:    HEART_CHARS[Math.floor(Math.random() * HEART_CHARS.length)],
      drift:   0,
    };
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);

    // Spawn
    if (hearts.length < MAX_HEARTS && Math.random() < 0.06) {
      hearts.push(randomHeart());
    }

    hearts = hearts.filter(h => {
      h.y     += h.speed;
      h.drift += h.sway * 0.015;
      h.x     += Math.sin(h.drift) * 0.7;
      h.angle += 0.01;

      ctx.save();
      ctx.globalAlpha = h.opacity;
      ctx.font        = `${h.size}px serif`;
      ctx.textAlign   = 'center';
      ctx.translate(h.x, h.y);
      ctx.rotate(Math.sin(h.angle) * 0.15);
      ctx.fillText(h.char, 0, 0);
      ctx.restore();

      return h.y < H + 40;
    });

    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', resize);
  resize();
  tick();
})();


/* ══════════════════════════════════════════════
   🔊  CLICK SOUND (AudioContext beep)
   ══════════════════════════════════════════════ */
function playClick() {
  try {
    const ac  = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ac.createOscillator();
    const gain= ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ac.currentTime + 0.12);
    gain.gain.setValueAtTime(0.08, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.18);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + 0.2);
  } catch(e) { /* Silently fail on restricted contexts */ }
}


/* ══════════════════════════════════════════════
   🎬  SCREEN TRANSITIONS
   ══════════════════════════════════════════════ */
let currentScreen = null;

function showScreen(id, onShown) {
  const next = document.getElementById(id);
  if (!next) return;

  if (currentScreen && currentScreen !== next) {
    currentScreen.classList.add('exit');
    setTimeout(() => {
      currentScreen.classList.remove('active', 'exit');
      currentScreen = null;
    }, 650);
  }

  setTimeout(() => {
    next.classList.add('active');
    currentScreen = next;
    if (onShown) onShown();
  }, currentScreen ? 350 : 0);
}


/* ══════════════════════════════════════════════
   🔐  PASSWORD SCREEN
   ══════════════════════════════════════════════ */
(function initPassword() {
  const input  = document.getElementById('passwordInput');
  const btn    = document.getElementById('unlockBtn');
  const errMsg = document.getElementById('errorMsg');

  function tryUnlock() {
    const val = input.value.trim();
    if (val === CONFIG.password) {
      playClick();
      input.blur();
      errMsg.classList.remove('show');
      showScreen('screen-countdown', initCountdown);
    } else {
      errMsg.classList.add('show');
      input.style.borderColor = '#e63946';
      input.style.animation = 'none';
      requestAnimationFrame(() => {
        input.style.animation = 'shake 0.4s ease';
      });
      setTimeout(() => {
        input.style.borderColor = '';
        errMsg.classList.remove('show');
      }, 2400);
    }
  }

  btn.addEventListener('click', tryUnlock);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') tryUnlock(); });

  // Shake keyframe (injected once)
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%,100%{transform:translateX(0)}
      20%    {transform:translateX(-8px)}
      40%    {transform:translateX(8px)}
      60%    {transform:translateX(-5px)}
      80%    {transform:translateX(5px)}
    }`;
  document.head.appendChild(style);
})();


/* ══════════════════════════════════════════════
   ⏳  COUNTDOWN SCREEN
   ══════════════════════════════════════════════ */
function initCountdown() {
  const cards   = document.querySelectorAll('.count-card');
  const els = {
    years:   document.getElementById('years'),
    months:  document.getElementById('months'),
    days:    document.getElementById('days'),
    hours:   document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
  };

  // Staggered reveal of cards
  cards.forEach((card, i) => {
    setTimeout(() => card.classList.add('revealed'), 300 + i * 140);
  });

  let lastSec = -1;

  function updateCountdown() {
    const now   = new Date();
    let   diff  = Math.floor((now - CONFIG.relationStart) / 1000);
    if (diff < 0) diff = 0;

    const s = diff % 60;          diff = Math.floor(diff / 60);
    const m = diff % 60;          diff = Math.floor(diff / 60);
    const h = diff % 24;          diff = Math.floor(diff / 24);
    const totalDays = diff;
    const y = Math.floor(totalDays / 365);
    const mo= Math.floor((totalDays % 365) / 30);
    const d = totalDays % 30;

    function set(el, val) {
      const str = String(val).padStart(2, '0');
      if (el.textContent !== str) {
        el.textContent = str;
        el.classList.remove('bump');
        requestAnimationFrame(() => el.classList.add('bump'));
        setTimeout(() => el.classList.remove('bump'), 300);
      }
    }

    set(els.years, y);
    set(els.months, mo);
    set(els.days, d);
    set(els.hours, h);
    set(els.minutes, m);

    if (s !== lastSec) {
      set(els.seconds, s);
      lastSec = s;
    }
  }

  updateCountdown();
  const timer = setInterval(updateCountdown, 1000);

  // Store interval so we can clear on restart
  window.__countdownTimer = timer;

  document.getElementById('countdownNext').addEventListener('click', () => {
    playClick();
    showScreen('screen-messages', initMessages);
  }, { once: true });
}


/* ══════════════════════════════════════════════
   💌  MESSAGES SCREEN
   ══════════════════════════════════════════════ */
function initMessages() {
  const msgs   = CONFIG.messages;
  const msgIcon= document.getElementById('msgIcon');
  const msgText= document.getElementById('msgText');
  const dotsEl = document.getElementById('progressDots');
  const nextBtn= document.getElementById('msgNext');

  let current = 0;

  // Build dots
  dotsEl.innerHTML = '';
  msgs.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    dotsEl.appendChild(d);
  });

  function typeText(el, text, speed = 38) {
    el.textContent = '';
    el.classList.add('typing-cursor');
    let i = 0;
    const iv = setInterval(() => {
      el.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(iv);
        el.classList.remove('typing-cursor');
      }
    }, speed);
  }

  function showMsg(idx) {
    const msg = msgs[idx];

    // Animate card out briefly then in
    const card = document.querySelector('.message-card');
    card.style.opacity = '0';
    card.style.transform = 'translateY(14px) scale(0.97)';

    setTimeout(() => {
      msgIcon.textContent = msg.icon;
      typeText(msgText, msg.text, 35);

      card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      card.style.opacity = '1';
      card.style.transform = '';

      // Update dots
      document.querySelectorAll('.dot').forEach((d, i) => {
        d.classList.toggle('active', i === idx);
      });

      // Last message
      nextBtn.textContent = idx === msgs.length - 1 ? 'إلى الصور 📸' : 'التالي 💫';
    }, 220);
  }

  showMsg(0);

  nextBtn.addEventListener('click', () => {
    playClick();
    current++;
    if (current < msgs.length) {
      showMsg(current);
    } else {
      showScreen('screen-gallery', initGallery);
    }
  });
}


/* ══════════════════════════════════════════════
   🖼️  GALLERY SCREEN
   ══════════════════════════════════════════════ */
function initGallery() {
  const items = document.querySelectorAll('.gallery-item');
  items.forEach((item, i) => {
    setTimeout(() => item.classList.add('revealed'), 200 + i * 120);
  });

  document.getElementById('galleryNext').addEventListener('click', () => {
    playClick();
    showScreen('screen-music', initMusic);
  }, { once: true });
}


/* ══════════════════════════════════════════════
   🎶  MUSIC SCREEN
   ══════════════════════════════════════════════ */
function initMusic() {
  const audio  = document.getElementById('bgMusic');
  const playBtn= document.getElementById('playBtn');
  const playIco= document.getElementById('playIcon');
  const playLbl= document.getElementById('playLabel');
  const vinyl  = document.getElementById('vinyl');
  const waves  = document.getElementById('musicWaves');
  let   playing= false;

  function togglePlay() {
    if (!playing) {
      audio.play().catch(() => {});
      playIco.textContent = '⏸';
      playLbl.textContent = 'إيقاف';
      vinyl.classList.add('spinning');
      waves.classList.add('active');
      playing = true;
    } else {
      audio.pause();
      playIco.textContent = '▶';
      playLbl.textContent = 'تشغيل';
      vinyl.classList.remove('spinning');
      waves.classList.remove('active');
      playing = false;
    }
  }

  playBtn.addEventListener('click', () => { playClick(); togglePlay(); });

  document.getElementById('musicNext').addEventListener('click', () => {
    playClick();
    showScreen('screen-final', initFinal);
  }, { once: true });
}


/* ══════════════════════════════════════════════
   🎉  FINAL SCENE (Confetti + Typing)
   ══════════════════════════════════════════════ */
function initFinal() {
  startConfetti();

  const titleEl = document.getElementById('finalTitle');
  const msgEl   = document.getElementById('finalMsg');

  // Type title then message
  typeElement(titleEl, CONFIG.finalTitle, 65, () => {
    titleEl.classList.add('glow-text');
    setTimeout(() => typeElement(msgEl, CONFIG.finalMsg, 28), 400);
  });

  document.getElementById('restartBtn').addEventListener('click', () => {
    playClick();
    stopConfetti();
    // Reset everything
    clearInterval(window.__countdownTimer);
    document.getElementById('passwordInput').value = '';
    document.getElementById('errorMsg').classList.remove('show');
    document.querySelectorAll('.count-card').forEach(c => c.classList.remove('revealed'));
    document.querySelectorAll('.gallery-item').forEach(g => g.classList.remove('revealed'));
    document.getElementById('vinyl').classList.remove('spinning');
    document.getElementById('musicWaves').classList.remove('active');
    document.getElementById('bgMusic').pause();
    document.getElementById('bgMusic').currentTime = 0;
    document.getElementById('finalTitle').textContent = '';
    document.getElementById('finalMsg').textContent = '';
    showScreen('screen-password');
  }, { once: true });
}

function typeElement(el, text, speed, onDone) {
  el.textContent = '';
  el.classList.add('typing-cursor');
  const lines = text.split('\n');
  let   lineIdx = 0, charIdx = 0;

  const iv = setInterval(() => {
    if (lineIdx >= lines.length) {
      clearInterval(iv);
      el.classList.remove('typing-cursor');
      if (onDone) onDone();
      return;
    }
    const line = lines[lineIdx];
    if (charIdx < line.length) {
      el.textContent += line[charIdx];
      charIdx++;
    } else {
      if (lineIdx < lines.length - 1) el.textContent += '\n';
      lineIdx++;
      charIdx = 0;
    }
  }, speed);
}


/* ══════════════════════════════════════════════
   🎊  CONFETTI
   ══════════════════════════════════════════════ */
let confettiAF = null;

function startConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  const ctx    = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height= window.innerHeight;

  const COLORS = ['#ff6b9d','#e63946','#ffb3cb','#fff0f5','#c0392b','#f7c59f','#ff8fab'];
  const SHAPES = ['❤', '✦', '✿'];
  const pieces = Array.from({ length: 80 }, () => ({
    x:     Math.random() * canvas.width,
    y:     -20 - Math.random() * canvas.height,
    r:     5 + Math.random() * 10,
    speed: 1.5 + Math.random() * 3,
    sway:  (Math.random() - 0.5) * 1.5,
    rot:   Math.random() * 360,
    rotV:  (Math.random() - 0.5) * 4,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    drift: 0,
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.y    += p.speed;
      p.drift+= 0.02;
      p.x    += Math.sin(p.drift) * p.sway;
      p.rot  += p.rotV;
      if (p.y > canvas.height + 30) { p.y = -20; p.x = Math.random() * canvas.width; }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.globalAlpha = 0.85;

      if (p.shape === '❤') {
        ctx.font      = `${p.r * 2}px serif`;
        ctx.fillStyle = p.color;
        ctx.fillText('❤', -p.r, p.r);
      } else if (p.shape === '✦') {
        ctx.font      = `${p.r * 1.8}px serif`;
        ctx.fillStyle = p.color;
        ctx.fillText('✦', -p.r, p.r);
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r);
      }
      ctx.restore();
    });
    confettiAF = requestAnimationFrame(draw);
  }
  draw();
}

function stopConfetti() {
  if (confettiAF) cancelAnimationFrame(confettiAF);
  const canvas = document.getElementById('confettiCanvas');
  const ctx    = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}


/* ══════════════════════════════════════════════
   🚀  INIT
   ══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  currentScreen = document.getElementById('screen-password');
});
