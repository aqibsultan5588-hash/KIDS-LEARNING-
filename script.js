/**
 * Kids Learning Game - Full Application
 * Audio via Web Audio API + WAV files | Images via PNG/SVG/emoji
 * Fully offline-capable | No external dependencies
 */

// ============================================================
// AUDIO SYSTEM
// ============================================================
const AudioSystem = {
  ctx: null,
  musicEnabled: true,
  sfxEnabled: true,
  musicGain: null,
  musicPlaying: false,
  audioCache: {},

  init() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.08;
    this.musicGain.connect(this.ctx.destination);
    const saved = this.loadSettings();
    this.musicEnabled = saved.music;
    this.sfxEnabled = saved.sfx;
    this.preloadAudio();
  },

  preloadAudio() {
    const sounds = ['click','success','wrong','clap','celebration','background'];
    sounds.forEach(name => {
      const audio = new Audio('assets/sounds/' + name + '.wav');
      audio.preload = 'auto';
      this.audioCache[name] = audio;
    });
  },

  loadSettings() {
    try {
      const d = JSON.parse(localStorage.getItem('klg_settings'));
      return d ? { music: d.music !== false, sfx: d.sfx !== false } : { music: true, sfx: true };
    } catch { return { music: true, sfx: true }; }
  },

  playFile(name, vol) {
    if (!this.sfxEnabled) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const audio = this.audioCache[name];
    if (audio) {
      audio.volume = vol || 0.5;
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  },

  playTone(freq, dur, type, vol) {
    if (!this.sfxEnabled) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type || 'sine';
    o.frequency.value = freq;
    g.gain.value = vol || 0.15;
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
    o.connect(g);
    g.connect(this.ctx.destination);
    o.start();
    o.stop(this.ctx.currentTime + dur);
  },

  click() { this.playFile('click'); this.playTone(800, 0.08, 'sine', 0.05); },
  correct() { this.playFile('success'); },
  wrong() { this.playFile('wrong'); this.playTone(200, 0.3, 'sawtooth', 0.05); },
  celebration() { this.playFile('celebration'); },
  pop() { this.playFile('click'); this.playTone(1200, 0.06, 'sine', 0.08); },

  startMusic() {
    if (!this.musicEnabled || this.musicPlaying) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.musicPlaying = true;
    if (this.audioCache.background) {
      const bg = this.audioCache.background;
      bg.loop = true;
      bg.volume = 0.15;
      bg.play().catch(() => this.playMelody());
    } else {
      this.playMelody();
    }
  },

  playMelody() {
    if (!this.musicPlaying || !this.musicEnabled) return;
    const notes = [262, 294, 330, 349, 392, 349, 330, 294, 262, 330, 392, 440, 392, 349, 330, 294];
    const dur = 0.25;
    notes.forEach((f, i) => {
      setTimeout(() => {
        if (!this.musicPlaying || !this.musicEnabled) return;
        this.playTone(f, dur * 0.9, 'sine', 0.06);
      }, i * dur * 1000);
    });
    setTimeout(() => this.playMelody(), notes.length * dur * 1000);
  },

  stopMusic() {
    this.musicPlaying = false;
    if (this.audioCache.background) {
      this.audioCache.background.pause();
      this.audioCache.background.currentTime = 0;
    }
  },

  playAnimal(name) {
    if (!this.sfxEnabled) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const audio = new Audio('assets/sounds/' + name + '.wav');
    audio.volume = 0.5;
    audio.play().catch(() => {});
  },

  speak(text) {
    if (!this.sfxEnabled) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.85;
    u.pitch = 1.2;
    u.volume = 1;
    window.speechSynthesis.speak(u);
  }
};

// ============================================================
// DATA
// ============================================================
const DATA = {
  alphabet: [
    { letter: 'A', lower: 'a', word: 'Apple', emoji: '\uD83C\uDF4E' },
    { letter: 'B', lower: 'b', word: 'Ball', emoji: '\u26BD' },
    { letter: 'C', lower: 'c', word: 'Cat', emoji: '\uD83D\uDC31' },
    { letter: 'D', lower: 'd', word: 'Dog', emoji: '\uD83D\uDC36' },
    { letter: 'E', lower: 'e', word: 'Elephant', emoji: '\uD83D\uDC18' },
    { letter: 'F', lower: 'f', word: 'Fish', emoji: '\uD83D\uDC1F' },
    { letter: 'G', lower: 'g', word: 'Grapes', emoji: '\uD83C\uDF47' },
    { letter: 'H', lower: 'h', word: 'Hat', emoji: '\uD83C\uDFA9' },
    { letter: 'I', lower: 'i', word: 'Ice cream', emoji: '\uD83C\uDF66' },
    { letter: 'J', lower: 'j', word: 'Juice', emoji: '\uD83E\uDD63' },
    { letter: 'K', lower: 'k', word: 'Kite', emoji: '\uD83E\uDE81' },
    { letter: 'L', lower: 'l', word: 'Lion', emoji: '\uD83E\uDD81' },
    { letter: 'M', lower: 'm', word: 'Monkey', emoji: '\uD83D\uDC35' },
    { letter: 'N', lower: 'n', word: 'Nest', emoji: '\uD83E\uDEA6' },
    { letter: 'O', lower: 'o', word: 'Orange', emoji: '\uD83C\uDF4A' },
    { letter: 'P', lower: 'p', word: 'Penguin', emoji: '\uD83D\uDC27' },
    { letter: 'Q', lower: 'q', word: 'Queen', emoji: '\uD83D\uDC51' },
    { letter: 'R', lower: 'r', word: 'Rabbit', emoji: '\uD83D\uDC30' },
    { letter: 'S', lower: 's', word: 'Sun', emoji: '\u2600\uFE0F' },
    { letter: 'T', lower: 't', word: 'Tiger', emoji: '\uD83D\uDC2F' },
    { letter: 'U', lower: 'u', word: 'Umbrella', emoji: '\u2602\uFE0F' },
    { letter: 'V', lower: 'v', word: 'Violin', emoji: '\uD83C\uDFBB' },
    { letter: 'W', lower: 'w', word: 'Watermelon', emoji: '\uD83C\uDF49' },
    { letter: 'X', lower: 'x', word: 'Xylophone', emoji: '\uD83C\uDFB9' },
    { letter: 'Y', lower: 'y', word: 'Yoyo', emoji: '\uD83E\uDE80' },
    { letter: 'Z', lower: 'z', word: 'Zebra', emoji: '\uD83E\uDD93' }
  ],

  numbers: Array.from({ length: 100 }, (_, i) => ({
    num: i + 1,
    word: ['One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
      'Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen','Twenty',
      'Twenty One','Twenty Two','Twenty Three','Twenty Four','Twenty Five','Twenty Six','Twenty Seven','Twenty Eight','Twenty Nine','Thirty',
      'Thirty One','Thirty Two','Thirty Three','Thirty Four','Thirty Five','Thirty Six','Thirty Seven','Thirty Eight','Thirty Nine','Forty',
      'Forty One','Forty Two','Forty Three','Forty Four','Forty Five','Forty Six','Forty Seven','Forty Eight','Forty Nine','Fifty',
      'Fifty One','Fifty Two','Fifty Three','Fifty Four','Fifty Five','Fifty Six','Fifty Seven','Fifty Eight','Fifty Nine','Sixty',
      'Sixty One','Sixty Two','Sixty Three','Sixty Four','Sixty Five','Sixty Six','Sixty Seven','Sixty Eight','Sixty Nine','Seventy',
      'Seventy One','Seventy Two','Seventy Three','Seventy Four','Seventy Five','Seventy Six','Seventy Seven','Seventy Eight','Seventy Nine','Eighty',
      'Eighty One','Eighty Two','Eighty Three','Eighty Four','Eighty Five','Eighty Six','Eighty Seven','Eighty Eight','Eighty Nine','Ninety',
      'Ninety One','Ninety Two','Ninety Three','Ninety Four','Ninety Five','Ninety Six','Ninety Seven','Ninety Eight','Ninety Nine','One Hundred'
    ][i]
  })),

  colors: [
    { name: 'Red', hex: '#e74c3c', emoji: '\uD83C\uDF4E' },
    { name: 'Blue', hex: '#3498db', emoji: '\uD83C\uDF0A' },
    { name: 'Green', hex: '#2ecc71', emoji: '\uD83C\uDF3F' },
    { name: 'Yellow', hex: '#f1c40f', emoji: '\u2600\uFE0F' },
    { name: 'Orange', hex: '#e67e22', emoji: '\uD83C\uDF4A' },
    { name: 'Purple', hex: '#9b59b6', emoji: '\uD83C\uDF3C' },
    { name: 'Pink', hex: '#fd79a8', emoji: '\uD83C\uDF38' },
    { name: 'Brown', hex: '#8B4513', emoji: '\uD83C\uDF6A' },
    { name: 'Black', hex: '#2d3436', emoji: '\uD83C\uDF11' },
    { name: 'White', hex: '#ecf0f1', emoji: '\u2601\uFE0F' },
    { name: 'Gray', hex: '#95a5a6', emoji: '\uD83E\uDEA8' },
    { name: 'Cyan', hex: '#00cec9', emoji: '\uD83D\uDCA7' }
  ],

  shapes: [
    { name: 'Circle', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#6c5ce7" stroke="#4834d4" stroke-width="3"/></svg>' },
    { name: 'Square', svg: '<svg viewBox="0 0 100 100"><rect x="5" y="5" width="90" height="90" fill="#00b894" stroke="#00a381" stroke-width="3" rx="4"/></svg>' },
    { name: 'Triangle', svg: '<svg viewBox="0 0 100 100"><polygon points="50,5 95,90 5,90" fill="#e17055" stroke="#d63031" stroke-width="3"/></svg>' },
    { name: 'Rectangle', svg: '<svg viewBox="0 0 100 100"><rect x="5" y="20" width="90" height="60" fill="#0984e3" stroke="#074b83" stroke-width="3" rx="4"/></svg>' },
    { name: 'Star', svg: '<svg viewBox="0 0 100 100"><polygon points="50,5 61,38 97,38 68,60 79,95 50,73 21,95 32,60 3,38 39,38" fill="#fdcb6e" stroke="#f39c12" stroke-width="2"/></svg>' },
    { name: 'Heart', svg: '<svg viewBox="0 0 100 100"><path d="M50,85 C25,65 5,45 5,25 C5,10 20,5 30,15 L50,35 L70,15 C80,5 95,10 95,25 C95,45 75,65 50,85Z" fill="#fd79a8" stroke="#e84393" stroke-width="2"/></svg>' },
    { name: 'Oval', svg: '<svg viewBox="0 0 100 100"><ellipse cx="50" cy="50" rx="40" ry="25" fill="#a29bfe" stroke="#6c5ce7" stroke-width="3"/></svg>' },
    { name: 'Pentagon', svg: '<svg viewBox="0 0 100 100"><polygon points="50,5 95,38 79,90 21,90 5,38" fill="#00cec9" stroke="#00b894" stroke-width="3"/></svg>' },
    { name: 'Hexagon', svg: '<svg viewBox="0 0 100 100"><polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="#e84393" stroke="#d63384" stroke-width="3"/></svg>' }
  ],

  animals: [
    { name: 'Dog', emoji: '\uD83D\uDC36', fact: 'Dogs are loyal pets. They can learn many tricks!' },
    { name: 'Cat', emoji: '\uD83D\uDC31', fact: 'Cats purr when they are happy. They love to nap!' },
    { name: 'Lion', emoji: '\uD83E\uDD81', fact: 'Lions are called the king of the jungle!' },
    { name: 'Elephant', emoji: '\uD83D\uDC18', fact: 'Elephants are the largest land animals!' },
    { name: 'Monkey', emoji: '\uD83D\uDC35', fact: 'Monkeys love bananas and are great climbers!' },
    { name: 'Tiger', emoji: '\uD83D\uDC2F', fact: 'Tigers have stripes and are great swimmers!' },
    { name: 'Bear', emoji: '\uD83D\uDC3B', fact: 'Bears love honey and sleep all winter!' },
    { name: 'Penguin', emoji: '\uD83D\uDC27', fact: 'Penguins are birds that cannot fly but swim!' },
    { name: 'Rabbit', emoji: '\uD83D\uDC30', fact: 'Rabbits hop and love to eat carrots!' },
    { name: 'Cow', emoji: '\uD83D\uDC04', fact: 'Cows give us milk. They say moo!' },
    { name: 'Pig', emoji: '\uD83D\uDC37', fact: 'Pigs are very smart and clean animals!' },
    { name: 'Sheep', emoji: '\uD83D\uDC11', fact: 'Sheep have fluffy wool coats. Baa!' },
    { name: 'Duck', emoji: '\uD83E\uDD86', fact: 'Ducks love water and go quack quack!' },
    { name: 'Frog', emoji: '\uD83D\uDC38', fact: 'Frogs can jump very high and catch flies!' },
    { name: 'Owl', emoji: '\uD83E\uDD89', fact: 'Owls sleep during day and hunt at night!' },
    { name: 'Fox', emoji: '\uD83E\uDD8A', fact: 'Foxes are clever and have bushy tails!' },
    { name: 'Giraffe', emoji: '\uD83E\uDD92', fact: 'Giraffes are very tall with long necks!' },
    { name: 'Zebra', emoji: '\uD83E\uDD93', fact: 'Zebras have black and white stripes!' },
    { name: 'Horse', emoji: '\uD83D\uDC34', fact: 'Horses run fast and love to gallop!' },
    { name: 'Chicken', emoji: '\uD83D\uDC14', fact: 'Chickens lay eggs and go cluck cluck!' }
  ],

  quizQuestions: [
    { q: 'What color is the sky?', options: ['Blue', 'Red', 'Green', 'Yellow'], answer: 0 },
    { q: 'Which animal says "Moo"?', options: ['Dog', 'Cow', 'Cat', 'Bird'], answer: 1 },
    { q: 'How many legs does a dog have?', options: ['2', '3', '4', '5'], answer: 2 },
    { q: 'What shape is a ball?', options: ['Square', 'Triangle', 'Circle', 'Star'], answer: 2 },
    { q: 'Which letter comes after A?', options: ['C', 'B', 'D', 'E'], answer: 1 },
    { q: 'What is 2 + 2?', options: ['3', '4', '5', '6'], answer: 1 },
    { q: 'Which animal can fly?', options: ['Fish', 'Dog', 'Bird', 'Cat'], answer: 2 },
    { q: 'What color is grass?', options: ['Blue', 'Red', 'Green', 'Yellow'], answer: 2 },
    { q: 'How many fingers on one hand?', options: ['3', '4', '5', '6'], answer: 2 },
    { q: 'Which shape has 3 sides?', options: ['Circle', 'Square', 'Triangle', 'Star'], answer: 2 },
    { q: 'What is 5 - 2?', options: ['2', '3', '4', '5'], answer: 1 },
    { q: 'Which animal is pink?', options: ['Pig', 'Cow', 'Horse', 'Sheep'], answer: 0 }
  ]
};

// ============================================================
// APP STATE
// ============================================================
const STORE = {
  alphabetIdx: 0,
  numberIdx: 0,
  currentView: 'home',
  progress: null,
  gameScores: {},

  init() {
    this.loadProgress();
  },

  loadProgress() {
    try {
      const p = JSON.parse(localStorage.getItem('klg_progress'));
      this.progress = p || this.defaultProgress();
    } catch { this.progress = this.defaultProgress(); }
  },

  defaultProgress() {
    return { stars: 0, coins: 0, badgeIds: [], gamesDone: 0, learningPct: 0, visited: {}, achievements: {} };
  },

  saveProgress() {
    try { localStorage.setItem('klg_progress', JSON.stringify(this.progress)); } catch {}
  },

  addStars(n) {
    this.progress.stars += n;
    this.saveProgress();
  },

  addCoins(n) {
    this.progress.coins += n;
    this.saveProgress();
  },

  addBadge(id) {
    if (!this.progress.badgeIds.includes(id)) {
      this.progress.badgeIds.push(id);
      this.saveProgress();
    }
  },

  markGameDone() {
    this.progress.gamesDone++;
    this.saveProgress();
  },

  updateLearningPct() {
    const visited = Object.keys(this.progress.visited).length;
    const total = 5;
    this.progress.learningPct = Math.min(100, Math.round((visited / total) * 100));
    this.saveProgress();
  },

  checkAchievements() {
    const p = this.progress;
    const ach = [
      { id: 'first_learn', name: 'First Lesson', icon: 'learning', check: () => Object.keys(p.visited).length >= 1 },
      { id: 'alphabet_star', name: 'Alphabet Star', icon: 'alphabet', check: () => p.visited.alphabet },
      { id: 'number_ninja', name: 'Number Ninja', icon: 'numbers', check: () => p.visited.numbers },
      { id: 'color_artist', name: 'Color Artist', icon: 'colors', check: () => p.visited.colors },
      { id: 'shape_master', name: 'Shape Master', icon: 'shapes', check: () => p.visited.shapes },
      { id: 'animal_friend', name: 'Animal Friend', icon: 'animals', check: () => p.visited.animals },
      { id: 'game_beginner', name: 'Game Beginner', icon: 'games', check: () => p.gamesDone >= 1 },
      { id: 'game_player', name: 'Game Player', icon: 'games', check: () => p.gamesDone >= 5 },
      { id: 'game_champ', name: 'Game Champion', icon: 'trophy', check: () => p.gamesDone >= 10 },
      { id: 'star_collector', name: 'Star Collector', icon: 'star', check: () => p.stars >= 10 },
      { id: 'star_master', name: 'Star Master', icon: 'star', check: () => p.stars >= 50 },
      { id: 'coin_collector', name: 'Coin Collector', icon: 'coin', check: () => p.coins >= 20 },
      { id: 'all_learner', name: 'All Subjects', icon: 'learning', check: () => Object.keys(p.visited).length >= 5 },
      { id: 'badge_badge', name: 'Badge Collector', icon: 'badge', check: () => p.badgeIds.length >= 5 }
    ];
    ach.forEach(a => {
      if (!p.achievements[a.id] && a.check()) {
        p.achievements[a.id] = true;
        this.saveProgress();
        this.addBadge(a.id);
      }
    });
    return ach;
  }
};

// ============================================================
// NAVIGATION
// ============================================================
let viewStack = [];

function showView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) {
    el.classList.add('active');
    STORE.currentView = id;
  }
  const backBtn = document.getElementById('backBtn');
  const title = document.getElementById('topTitle');
  backBtn.style.display = (id === 'viewHome') ? 'none' : 'grid';
  if (id === 'viewHome') title.textContent = 'Kids Learning';
  else if (id.startsWith('module')) title.textContent = document.querySelector(`#${id} .view-title`)?.textContent || 'Learning';
  else if (id.startsWith('game')) title.textContent = document.querySelector(`#${id} .view-title`)?.textContent || 'Game';
  else title.textContent = document.querySelector(`#${id} .view-title`)?.textContent || 'Kids Learning';
  document.documentElement.scrollTop = 0;
}

function navigateTo(section) {
  AudioSystem.click();
  const map = {
    home: 'viewHome',
    learning: 'viewLearning',
    minigames: 'viewMinigames',
    progress: 'viewProgress',
    settings: 'viewSettings',
    about: 'viewAbout'
  };
  const id = map[section] || 'viewHome';
  viewStack.push(STORE.currentView);
  showView(id);
  if (section === 'progress') renderProgress();
  if (section === 'settings') loadSettingsUI();
  if (section === 'minigames') renderGames();
  if (section === 'learning') renderModules();
}

function goBack() {
  AudioSystem.click();
  if (viewStack.length > 0) {
    const prev = viewStack.pop();
    showView(prev);
    if (prev === 'viewProgress') renderProgress();
  } else {
    showView('viewHome');
  }
}

// ============================================================
// RENDER: HOME
// ============================================================
function renderModules() {
  const grid = document.querySelector('.module-grid');
  if (!grid) return;
}

function openModule(mod) {
  AudioSystem.click();
  const id = 'module' + mod.charAt(0).toUpperCase() + mod.slice(1);
  viewStack.push(STORE.currentView);
  STORE.progress.visited[mod] = true;
  STORE.updateLearningPct();
  STORE.checkAchievements();
  showView(id);
  if (mod === 'alphabet') renderAlphabet();
  else if (mod === 'numbers') renderNumber();
  else if (mod === 'colors') renderColors();
  else if (mod === 'shapes') renderShapes();
  else if (mod === 'animals') renderAnimals();
}

// ============================================================
// ALPHABET MODULE
// ============================================================
function renderAlphabet() {
  const d = DATA.alphabet[STORE.alphabetIdx];
  document.getElementById('alphabetLetter').textContent = d.letter;
  document.getElementById('alphabetCase').textContent = d.lower;
  document.getElementById('alphabetWord').textContent = d.word;
  const imgName = d.word.toLowerCase();
  const img = '<img src="assets/images/' + imgName + '.png" alt="' + d.word + '" class="picture-img" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'" loading="lazy"><span class="picture-emoji" style="display:none">' + d.emoji + '</span>';
  document.getElementById('alphabetPicture').innerHTML = img;
}

function nextLetter() {
  AudioSystem.click();
  STORE.alphabetIdx = (STORE.alphabetIdx + 1) % DATA.alphabet.length;
  renderAlphabet();
}

function prevLetter() {
  AudioSystem.click();
  STORE.alphabetIdx = (STORE.alphabetIdx - 1 + DATA.alphabet.length) % DATA.alphabet.length;
  renderAlphabet();
}

function speakLetter() {
  AudioSystem.click();
  const d = DATA.alphabet[STORE.alphabetIdx];
  AudioSystem.speak(`${d.letter} for ${d.word}`);
}

// ============================================================
// NUMBERS MODULE
// ============================================================
function renderNumber() {
  const d = DATA.numbers[STORE.numberIdx];
  document.getElementById('numberDisplay').textContent = d.num;
  document.getElementById('numberWord').textContent = d.word;
  const area = document.getElementById('numberCountArea');
  area.innerHTML = '';
  const count = Math.min(d.num, 30);
  for (let i = 0; i < count; i++) {
    const span = document.createElement('span');
    span.className = 'count-item';
    span.textContent = '\uD83D\uDFE8';
    span.style.animationDelay = (i * 0.1) + 's';
    area.appendChild(span);
  }
}

function nextNumber() {
  AudioSystem.click();
  if (STORE.numberIdx < DATA.numbers.length - 1) {
    STORE.numberIdx++;
    renderNumber();
  }
}

function prevNumber() {
  AudioSystem.click();
  if (STORE.numberIdx > 0) {
    STORE.numberIdx--;
    renderNumber();
  }
}

function speakNumber() {
  AudioSystem.click();
  const d = DATA.numbers[STORE.numberIdx];
  AudioSystem.speak(d.word);
}

// ============================================================
// COLORS MODULE
// ============================================================
function renderColors() {
  const grid = document.getElementById('colorsGrid');
  grid.innerHTML = '';
  DATA.colors.forEach(c => {
    const card = document.createElement('div');
    card.className = 'color-card';
    card.style.background = c.hex;
    card.innerHTML = `<div class="color-swatch" style="background:${c.hex}"></div><div class="color-name">${c.name}</div>`;
    card.addEventListener('click', () => { AudioSystem.click(); AudioSystem.speak(c.name); });
    grid.appendChild(card);
  });
}

// ============================================================
// SHAPES MODULE
// ============================================================
function renderShapes() {
  const grid = document.getElementById('shapesGrid');
  grid.innerHTML = '';
  DATA.shapes.forEach(s => {
    const card = document.createElement('div');
    card.className = 'shape-card';
    card.innerHTML = `<div class="shape-svg">${s.svg}</div><div class="shape-name">${s.name}</div>`;
    card.addEventListener('click', () => { AudioSystem.click(); AudioSystem.speak(s.name); });
    grid.appendChild(card);
  });
}

// ============================================================
// ANIMALS MODULE
// ============================================================
function renderAnimals() {
  const grid = document.getElementById('animalsGrid');
  grid.innerHTML = '';
  DATA.animals.forEach(a => {
    const card = document.createElement('div');
    card.className = 'animal-card';
    const imgName = a.name.toLowerCase();
    card.innerHTML = `<img src="assets/images/${imgName}.png" alt="${a.name}" class="animal-img" onerror="this.style.display='none';this.nextElementSibling.style.display='block'" loading="lazy"><div class="animal-emoji" style="display:none">${a.emoji}</div><div class="animal-name">${a.name}</div><div class="animal-fact">${a.fact}</div>`;
    card.addEventListener('click', () => {
      AudioSystem.click();
      AudioSystem.speak(a.name + '. ' + a.fact);
      AudioSystem.playAnimal(imgName);
    });
    grid.appendChild(card);
  });
}

// ============================================================
// MINI GAMES
// ============================================================
function renderGames() {
  const grid = document.getElementById('gamesGrid');
  if (grid.children.length > 0) return;
  const games = [
    { id: 'gameLetterMatch', name: 'Letter Matching', image: 'letter-matching' },
    { id: 'gameNumberMatch', name: 'Number Matching', image: 'number-matching' },
    { id: 'gameColorMatch', name: 'Color Matching', image: 'color-matching' },
    { id: 'gameShapeMatch', name: 'Shape Matching', image: 'shape-matching' },
    { id: 'gameAnimalMatch', name: 'Animal Matching', image: 'animal-matching' },
    { id: 'gameBalloonPop', name: 'Balloon Pop', image: 'balloon-pop' },
    { id: 'gameMemory', name: 'Memory Cards', image: 'memory-cards' },
    { id: 'gameFindPicture', name: 'Find Picture', image: 'find-picture' },
    { id: 'gamePuzzle', name: 'Drag & Drop', image: 'drag-drop' },
    { id: 'gameQuiz', name: 'Simple Quiz', image: 'simple-quiz' }
  ];
  games.forEach(g => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `<img src="assets/images/${g.image}.png" alt="" class="game-card-icon-img"><div class="game-card-name">${g.name}</div>`;
    card.addEventListener('click', () => openGame(g.id));
    grid.appendChild(card);
  });
}

function openGame(id) {
  AudioSystem.click();
  viewStack.push(STORE.currentView);
  showView(id);
  const initMap = {
    gameLetterMatch: initLetterMatch,
    gameNumberMatch: initNumberMatch,
    gameColorMatch: initColorMatch,
    gameShapeMatch: initShapeMatch,
    gameAnimalMatch: initAnimalMatch,
    gameBalloonPop: initBalloonPop,
    gameMemory: initMemoryGame,
    gameFindPicture: initFindPicture,
    gamePuzzle: initPuzzle,
    gameQuiz: initQuiz
  };
  if (initMap[id]) initMap[id]();
}

// === LETTER MATCHING GAME ===
let lmState = { score: 0, current: 0, total: 0 };

function initLetterMatch() {
  lmState = { score: 0, current: 0, total: 0 };
  document.getElementById('lmScore').textContent = '0';
  nextLmRound();
}

function nextLmRound() {
  const q = DATA.alphabet[Math.floor(Math.random() * DATA.alphabet.length)];
  document.getElementById('lmQuestion').textContent = q.letter;
  const options = document.getElementById('lmOptions');
  options.innerHTML = '';
  let answers = [q.lower];
  const pool = DATA.alphabet.filter(a => a.lower !== q.lower);
  while (answers.length < 4) {
    const r = pool[Math.floor(Math.random() * pool.length)];
    if (!answers.includes(r.lower)) answers.push(r.lower);
  }
  answers = answers.sort(() => Math.random() - 0.5);
  answers.forEach(a => {
    const btn = document.createElement('div');
    btn.className = 'game-option';
    btn.textContent = a;
    btn.dataset.correct = (a === q.lower) ? 'true' : 'false';
    btn.addEventListener('click', () => handleLmChoice(btn, q.letter));
    options.appendChild(btn);
  });
}

function handleLmChoice(el, letter) {
  if (el.classList.contains('correct') || el.classList.contains('wrong')) return;
  const correct = el.dataset.correct === 'true';
  if (correct) {
    el.classList.add('correct');
    AudioSystem.correct();
    lmState.score++;
    document.getElementById('lmScore').textContent = lmState.score;
    lmState.total++;
    setTimeout(() => {
      STORE.addStars(1);
      STORE.addCoins(1);
      STORE.markGameDone();
      STORE.checkAchievements();
      if (lmState.score >= 10) {
        showReward('Letter Champion!', 'You matched 10 letters!', '\uD83D\uDD20', 5);
        lmState.score = 0;
        document.getElementById('lmScore').textContent = '0';
      }
      nextLmRound();
    }, 600);
  } else {
    el.classList.add('wrong');
    AudioSystem.wrong();
    setTimeout(() => {
      el.classList.remove('wrong');
    }, 400);
  }
}

// === NUMBER MATCHING GAME ===
let nmState = { score: 0 };

function initNumberMatch() {
  nmState.score = 0;
  document.getElementById('nmScore').textContent = '0';
  nextNmRound();
}

function nextNmRound() {
  const q = DATA.numbers[Math.floor(Math.random() * 10)];
  const count = document.getElementById('nmCount');
  count.innerHTML = '';
  for (let i = 0; i < q.num; i++) {
    const span = document.createElement('span');
    span.textContent = '\uD83D\uDFE8';
    span.style.fontSize = '1.5rem';
    count.appendChild(span);
  }
  const options = document.getElementById('nmOptions');
  options.innerHTML = '';
  let answers = [q.num];
  while (answers.length < 4) {
    const r = Math.floor(Math.random() * 10) + 1;
    if (!answers.includes(r)) answers.push(r);
  }
  answers = answers.sort(() => Math.random() - 0.5);
  answers.forEach(a => {
    const btn = document.createElement('div');
    btn.className = 'game-option';
    btn.textContent = a;
    btn.dataset.correct = (a === q.num) ? 'true' : 'false';
    btn.addEventListener('click', () => handleNmChoice(btn));
    options.appendChild(btn);
  });
}

function handleNmChoice(el) {
  if (el.classList.contains('correct') || el.classList.contains('wrong')) return;
  if (el.dataset.correct === 'true') {
    el.classList.add('correct');
    AudioSystem.correct();
    nmState.score++;
    document.getElementById('nmScore').textContent = nmState.score;
    STORE.addStars(1);
    STORE.addCoins(1);
    STORE.markGameDone();
    STORE.checkAchievements();
    if (nmState.score >= 10) {
      showReward('Number Star!', 'You counted 10 rounds!', '\uD83D\uDD22', 5);
      nmState.score = 0;
      document.getElementById('nmScore').textContent = '0';
    }
    setTimeout(nextNmRound, 600);
  } else {
    el.classList.add('wrong');
    AudioSystem.wrong();
    setTimeout(() => el.classList.remove('wrong'), 400);
  }
}

// === COLOR MATCHING GAME ===
let cmState = { score: 0 };

function initColorMatch() {
  cmState.score = 0;
  document.getElementById('cmScore').textContent = '0';
  nextCmRound();
}

function nextCmRound() {
  const q = DATA.colors[Math.floor(Math.random() * DATA.colors.length)];
  document.getElementById('cmQuestion').textContent = q.name;
  document.getElementById('cmQuestion').style.color = q.hex;
  const options = document.getElementById('cmOptions');
  options.innerHTML = '';
  let answers = [q];
  const pool = DATA.colors.filter(c => c.name !== q.name);
  while (answers.length < 4) {
    const r = pool[Math.floor(Math.random() * pool.length)];
    if (!answers.find(a => a.name === r.name)) answers.push(r);
  }
  answers = answers.sort(() => Math.random() - 0.5);
  answers.forEach(a => {
    const btn = document.createElement('div');
    btn.className = 'game-option';
    btn.style.background = a.hex;
    btn.textContent = '';
    btn.style.height = '70px';
    btn.dataset.correct = (a.name === q.name) ? 'true' : 'false';
    btn.addEventListener('click', () => handleCmChoice(btn));
    options.appendChild(btn);
  });
}

function handleCmChoice(el) {
  if (el.classList.contains('correct') || el.classList.contains('wrong')) return;
  if (el.dataset.correct === 'true') {
    el.classList.add('correct');
    AudioSystem.correct();
    cmState.score++;
    document.getElementById('cmScore').textContent = cmState.score;
    STORE.addStars(1);
    STORE.addCoins(1);
    STORE.markGameDone();
    STORE.checkAchievements();
    setTimeout(nextCmRound, 600);
  } else {
    el.classList.add('wrong');
    AudioSystem.wrong();
    setTimeout(() => el.classList.remove('wrong'), 400);
  }
}

// === SHAPE MATCHING GAME ===
let smState = { score: 0 };

function initShapeMatch() {
  smState.score = 0;
  document.getElementById('smScore').textContent = '0';
  nextSmRound();
}

function nextSmRound() {
  const q = DATA.shapes[Math.floor(Math.random() * DATA.shapes.length)];
  document.getElementById('smQuestion').innerHTML = q.svg;
  document.getElementById('smQuestion').style.width = '80px';
  document.getElementById('smQuestion').style.margin = '0 auto';
  const options = document.getElementById('smOptions');
  options.innerHTML = '';
  let answers = [q];
  const pool = DATA.shapes.filter(s => s.name !== q.name);
  while (answers.length < 4) {
    const r = pool[Math.floor(Math.random() * pool.length)];
    if (!answers.find(a => a.name === r.name)) answers.push(r);
  }
  answers = answers.sort(() => Math.random() - 0.5);
  answers.forEach(a => {
    const btn = document.createElement('div');
    btn.className = 'game-option';
    btn.innerHTML = `<div style="width:50px;height:50px">${a.svg}</div><div style="font-size:.8rem;margin-top:4px">${a.name}</div>`;
    btn.style.flexDirection = 'column';
    btn.dataset.correct = (a.name === q.name) ? 'true' : 'false';
    btn.addEventListener('click', () => handleSmChoice(btn));
    options.appendChild(btn);
  });
}

function handleSmChoice(el) {
  if (el.classList.contains('correct') || el.classList.contains('wrong')) return;
  if (el.dataset.correct === 'true') {
    el.classList.add('correct');
    AudioSystem.correct();
    smState.score++;
    document.getElementById('smScore').textContent = smState.score;
    STORE.addStars(1);
    STORE.addCoins(1);
    STORE.markGameDone();
    STORE.checkAchievements();
    setTimeout(nextSmRound, 600);
  } else {
    el.classList.add('wrong');
    AudioSystem.wrong();
    setTimeout(() => el.classList.remove('wrong'), 400);
  }
}

// === ANIMAL MATCHING GAME ===
let amState = { score: 0 };

function initAnimalMatch() {
  amState.score = 0;
  document.getElementById('amScore').textContent = '0';
  nextAmRound();
}

function nextAmRound() {
  const q = DATA.animals[Math.floor(Math.random() * DATA.animals.length)];
  document.getElementById('amQuestion').textContent = q.emoji;
  document.getElementById('amQuestion').style.fontSize = '4rem';
  const options = document.getElementById('amOptions');
  options.innerHTML = '';
  let answers = [q];
  const pool = DATA.animals.filter(a => a.name !== q.name);
  while (answers.length < 4) {
    const r = pool[Math.floor(Math.random() * pool.length)];
    if (!answers.find(a => a.name === r.name)) answers.push(r);
  }
  answers = answers.sort(() => Math.random() - 0.5);
  answers.forEach(a => {
    const btn = document.createElement('div');
    btn.className = 'game-option';
    btn.textContent = a.name;
    btn.dataset.correct = (a.name === q.name) ? 'true' : 'false';
    btn.addEventListener('click', () => handleAmChoice(btn));
    options.appendChild(btn);
  });
}

function handleAmChoice(el) {
  if (el.classList.contains('correct') || el.classList.contains('wrong')) return;
  if (el.dataset.correct === 'true') {
    el.classList.add('correct');
    AudioSystem.correct();
    amState.score++;
    document.getElementById('amScore').textContent = amState.score;
    STORE.addStars(1);
    STORE.addCoins(1);
    STORE.markGameDone();
    STORE.checkAchievements();
    if (amState.score >= 10) {
      showReward('Animal Expert!', 'You know all animals!', '\uD83D\uDC3E', 5);
      amState.score = 0;
      document.getElementById('amScore').textContent = '0';
    }
    setTimeout(nextAmRound, 600);
  } else {
    el.classList.add('wrong');
    AudioSystem.wrong();
    setTimeout(() => el.classList.remove('wrong'), 400);
  }
}

// === BALLOON POP GAME ===
let bpState = { score: 0, balloons: [] };

function initBalloonPop() {
  bpState.score = 0;
  bpState.balloons = [];
  document.getElementById('bpScore').textContent = '0';
  const area = document.getElementById('balloonArea');
  area.innerHTML = '';
  const emojis = ['\uD83C\uDF88', '\uD83D\uDD35', '\uD83D\uDFE1', '\uD83D\uDFE2', '\uD83D\uDFE3', '\uD83E\uDD7A', '\uD83D\uDC9C', '\uD83D\uDC99'];
  for (let i = 0; i < 12; i++) {
    const b = document.createElement('div');
    b.className = 'balloon';
    b.textContent = emojis[i % emojis.length];
    b.style.left = (5 + Math.random() * 75) + '%';
    b.style.top = (10 + Math.random() * 60) + '%';
    b.style.animationDuration = (3 + Math.random() * 3) + 's';
    b.style.animationDelay = (Math.random() * 2) + 's';
    b.dataset.popped = 'false';
    b.addEventListener('click', () => popBalloon(b));
    area.appendChild(b);
    bpState.balloons.push(b);
  }
}

function popBalloon(el) {
  if (el.dataset.popped === 'true') return;
  el.dataset.popped = 'true';
  el.classList.add('popped');
  AudioSystem.pop();
  bpState.score++;
  document.getElementById('bpScore').textContent = bpState.score;
  STORE.addStars(1);
  STORE.addCoins(1);
  STORE.markGameDone();
  STORE.checkAchievements();
  if (bpState.score >= 20) {
    showReward('Balloon Popper!', 'You popped 20 balloons!', '\uD83C\uDF88', 5);
    bpState.score = 0;
    document.getElementById('bpScore').textContent = '0';
  }
  setTimeout(() => {
    el.style.left = (5 + Math.random() * 75) + '%';
    el.style.top = (10 + Math.random() * 60) + '%';
    el.classList.remove('popped');
    el.dataset.popped = 'false';
  }, 1500);
}

// === MEMORY CARD GAME ===
let memState = { cards: [], flipped: [], matched: 0, moves: 0, locked: false };

function initMemoryGame() {
  memState = { cards: [], flipped: [], matched: 0, moves: 0, locked: false };
  document.getElementById('memScore').textContent = '0';
  document.getElementById('memMoves').textContent = '0';
  const grid = document.getElementById('memoryGrid');
  grid.innerHTML = '';
  const items = ['\uD83D\uDC36', '\uD83D\uDC31', '\uD83E\uDD81', '\uD83D\uDC18', '\uD83D\uDC35', '\uD83D\uDC2F', '\uD83D\uDC30', '\uD83D\uDC27'];
  const cards = [...items, ...items].sort(() => Math.random() - 0.5);
  cards.forEach((val, i) => {
    const card = document.createElement('div');
    card.className = 'memory-card';
    card.dataset.val = val;
    card.dataset.idx = i;
    card.textContent = '\u2753';
    card.addEventListener('click', () => flipCard(card, i));
    grid.appendChild(card);
    memState.cards.push(card);
  });
}

function flipCard(el, idx) {
  if (memState.locked) return;
  if (el.classList.contains('flipped') || el.classList.contains('matched')) return;
  el.classList.add('flipped');
  el.textContent = el.dataset.val;
  AudioSystem.click();
  memState.flipped.push(idx);
  if (memState.flipped.length === 2) {
    memState.locked = true;
    memState.moves++;
    document.getElementById('memMoves').textContent = memState.moves;
    const [i1, i2] = memState.flipped;
    const c1 = memState.cards[i1];
    const c2 = memState.cards[i2];
    if (c1.dataset.val === c2.dataset.val) {
      c1.classList.add('matched');
      c2.classList.add('matched');
      memState.matched++;
      document.getElementById('memScore').textContent = memState.matched;
      AudioSystem.correct();
      memState.flipped = [];
      memState.locked = false;
      STORE.addStars(2);
      STORE.addCoins(1);
      STORE.markGameDone();
      STORE.checkAchievements();
      if (memState.matched === 8) {
        showReward('Memory Master!', 'You found all pairs!', '\uD83C\uDFB2', 10);
        setTimeout(initMemoryGame, 1500);
      }
    } else {
      AudioSystem.wrong();
      setTimeout(() => {
        c1.classList.remove('flipped');
        c1.textContent = '\u2753';
        c2.classList.remove('flipped');
        c2.textContent = '\u2753';
        memState.flipped = [];
        memState.locked = false;
      }, 800);
    }
  }
}

// === FIND PICTURE GAME ===
let fpState = { score: 0 };

function initFindPicture() {
  fpState.score = 0;
  document.getElementById('fpScore').textContent = '0';
  nextFpRound();
}

function nextFpRound() {
  const q = DATA.animals[Math.floor(Math.random() * DATA.animals.length)];
  document.getElementById('fpTarget').textContent = q.name;
  const options = document.getElementById('fpOptions');
  options.innerHTML = '';
  let answers = [q];
  const pool = DATA.animals.filter(a => a.name !== q.name);
  while (answers.length < 4) {
    const r = pool[Math.floor(Math.random() * pool.length)];
    if (!answers.find(a => a.name === r.name)) answers.push(r);
  }
  answers = answers.sort(() => Math.random() - 0.5);
  answers.forEach(a => {
    const btn = document.createElement('div');
    btn.className = 'game-option';
    btn.style.fontSize = '3rem';
    btn.textContent = a.emoji;
    btn.dataset.correct = (a.name === q.name) ? 'true' : 'false';
    btn.addEventListener('click', () => handleFpChoice(btn));
    options.appendChild(btn);
  });
}

function handleFpChoice(el) {
  if (el.classList.contains('correct') || el.classList.contains('wrong')) return;
  if (el.dataset.correct === 'true') {
    el.classList.add('correct');
    AudioSystem.correct();
    fpState.score++;
    document.getElementById('fpScore').textContent = fpState.score;
    STORE.addStars(1);
    STORE.addCoins(1);
    STORE.markGameDone();
    STORE.checkAchievements();
    if (fpState.score >= 10) {
      showReward('Picture Pro!', 'You found 10 pictures!', '\uD83D\uDC3E', 5);
      fpState.score = 0;
      document.getElementById('fpScore').textContent = '0';
    }
    setTimeout(nextFpRound, 600);
  } else {
    el.classList.add('wrong');
    AudioSystem.wrong();
    setTimeout(() => el.classList.remove('wrong'), 400);
  }
}

// === DRAG & DROP PUZZLE ===
let pzState = { score: 0, pieces: [], board: [] };

function initPuzzle() {
  pzState.score = 0;
  pzState.pieces = [];
  pzState.board = [];
  document.getElementById('pzScore').textContent = '0';
  const animals = ['\uD83D\uDC36', '\uD83D\uDC31', '\uD83E\uDD81', '\uD83D\uDC18', '\uD83D\uDC35', '\uD83D\uDC2F', '\uD83D\uDC30', '\uD83D\uDC27', '\uD83D\uDC3B'];
  const shuffled = [...animals].sort(() => Math.random() - 0.5);
  const board = document.getElementById('puzzleBoard');
  board.innerHTML = '';
  const piecesEl = document.getElementById('puzzlePieces');
  piecesEl.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'puzzle-cell';
    cell.dataset.idx = i;
    cell.dataset.val = '';
    board.appendChild(cell);
    pzState.board.push(cell);
  }
  shuffled.forEach((val, i) => {
    const piece = document.createElement('div');
    piece.className = 'puzzle-piece';
    piece.textContent = val;
    piece.draggable = true;
    piece.dataset.val = val;
    piece.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text', val); });
    piece.addEventListener('touchstart', (e) => {
      e.preventDefault();
      pzState.dragVal = val;
      piece.style.opacity = '0.5';
    });
    piece.addEventListener('touchend', (e) => {
      e.preventDefault();
      piece.style.opacity = '1';
      const touch = e.changedTouches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY);
      if (target && target.classList.contains('puzzle-cell') && !target.dataset.val) {
        target.textContent = pzState.dragVal;
        target.dataset.val = pzState.dragVal;
        target.classList.add('filled');
        piece.classList.add('placed');
        AudioSystem.click();
        pzState.score++;
        document.getElementById('pzScore').textContent = pzState.score;
        STORE.addStars(1);
        STORE.addCoins(1);
        STORE.markGameDone();
        STORE.checkAchievements();
        if (pzState.score >= 9) {
          showReward('Puzzle Master!', 'You completed the puzzle!', '\uD83E\uDDE9', 10);
          setTimeout(initPuzzle, 1500);
        }
      }
      pzState.dragVal = null;
    });
    piecesEl.appendChild(piece);
    pzState.pieces.push(piece);
  });
  board.addEventListener('dragover', (e) => e.preventDefault());
  board.addEventListener('drop', (e) => {
    e.preventDefault();
    const val = e.dataTransfer.getData('text');
    const cell = e.target.closest('.puzzle-cell');
    if (cell && !cell.dataset.val) {
      cell.textContent = val;
      cell.dataset.val = val;
      cell.classList.add('filled');
      const piece = [...pzState.pieces].find(p => p.textContent === val && !p.classList.contains('placed'));
      if (piece) piece.classList.add('placed');
      AudioSystem.click();
      pzState.score++;
      document.getElementById('pzScore').textContent = pzState.score;
      STORE.addStars(1);
      STORE.addCoins(1);
      STORE.markGameDone();
      STORE.checkAchievements();
      if (pzState.score >= 9) {
        showReward('Puzzle Master!', 'You completed the puzzle!', '\uD83E\uDDE9', 10);
        setTimeout(initPuzzle, 1500);
      }
    }
  });
}

// === QUIZ GAME ===
let quizState = { score: 0, total: 0, current: 0, questions: [] };

function initQuiz() {
  quizState = { score: 0, total: 0, current: 0, questions: [] };
  document.getElementById('quizScore').textContent = '0';
  document.getElementById('quizTotal').textContent = '0';
  quizState.questions = [...DATA.quizQuestions].sort(() => Math.random() - 0.5).slice(0, 10);
  nextQuizRound();
}

function nextQuizRound() {
  if (quizState.current >= quizState.questions.length) {
    showReward('Quiz Champion!', `You got ${quizState.score} out of ${quizState.total} correct!`, '\uD83C\uDF1F', 10);
    quizState.score = 0;
    quizState.total = 0;
    quizState.current = 0;
    document.getElementById('quizScore').textContent = '0';
    document.getElementById('quizTotal').textContent = '0';
    return;
  }
  const q = quizState.questions[quizState.current];
  document.getElementById('quizQuestion').textContent = q.q;
  const options = document.getElementById('quizOptions');
  options.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('div');
    btn.className = 'game-option';
    btn.textContent = opt;
    btn.dataset.correct = (i === q.answer) ? 'true' : 'false';
    btn.addEventListener('click', () => handleQuizChoice(btn));
    options.appendChild(btn);
  });
}

function handleQuizChoice(el) {
  if (el.classList.contains('correct') || el.classList.contains('wrong')) return;
  quizState.total++;
  document.getElementById('quizTotal').textContent = quizState.total;
  if (el.dataset.correct === 'true') {
    el.classList.add('correct');
    AudioSystem.correct();
    quizState.score++;
    document.getElementById('quizScore').textContent = quizState.score;
    STORE.addStars(2);
    STORE.addCoins(2);
    STORE.markGameDone();
    STORE.checkAchievements();
  } else {
    el.classList.add('wrong');
    AudioSystem.wrong();
    const correctEl = [...document.querySelectorAll('#quizOptions .game-option')].find(b => b.dataset.correct === 'true');
    if (correctEl) correctEl.classList.add('correct');
  }
  quizState.current++;
  setTimeout(nextQuizRound, 1000);
}

// ============================================================
// REWARD SYSTEM
// ============================================================
function showReward(title, msg, icon, stars) {
  AudioSystem.celebration();
  document.getElementById('overlayTitle').textContent = title;
  document.getElementById('overlayMsg').textContent = msg;
  const rr = document.getElementById('overlayRewards');
  rr.innerHTML = '';
  for (let i = 0; i < stars; i++) {
    const s = document.createElement('img');
    s.src = 'assets/icons/star.svg';
    s.alt = '';
    s.className = 'reward-icon';
    s.style.animation = `popIn .3s ease ${i * 0.1}s both`;
    rr.appendChild(s);
  }
  document.getElementById('successOverlay').classList.add('show');
  launchConfetti();
  STORE.addStars(stars);
  STORE.addCoins(stars);
  STORE.checkAchievements();
}

function closeOverlay() {
  document.getElementById('successOverlay').classList.remove('show');
  AudioSystem.click();
}

function launchConfetti() {
  const container = document.getElementById('confettiContainer');
  container.innerHTML = '';
  const colors = ['#e74c3c','#3498db','#2ecc71','#f1c40f','#e67e22','#9b59b6','#1abc9c','#e84393'];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.width = (5 + Math.random() * 10) + 'px';
    piece.style.height = (5 + Math.random() * 10) + 'px';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    piece.style.animationDuration = (2 + Math.random() * 3) + 's';
    piece.style.animationDelay = Math.random() * 2 + 's';
    container.appendChild(piece);
  }
  setTimeout(() => container.innerHTML = '', 5000);
}

// ============================================================
// PROGRESS
// ============================================================
function renderProgress() {
  const p = STORE.progress;
  document.getElementById('pctLearning').textContent = p.learningPct + '%';
  document.getElementById('pctGames').textContent = p.gamesDone;
  document.getElementById('pctStars').textContent = p.stars;
  document.getElementById('pctCoins').textContent = p.coins;
  const achContainer = document.getElementById('achievementList');
  achContainer.innerHTML = '';
  const achievements = STORE.checkAchievements();
  achievements.forEach(a => {
    const el = document.createElement('div');
    const unlocked = p.achievements[a.id];
    el.className = 'achievement-item' + (unlocked ? '' : ' locked');
    el.innerHTML = `<img src="assets/icons/achievement.svg" alt="" class="ach-icon-img"><span class="ach-name">${a.name}</span><img src="assets/icons/${unlocked ? 'check' : 'lock'}.svg" alt="" class="ach-status-img">`;
    achContainer.appendChild(el);
  });
}

// ============================================================
// SETTINGS
// ============================================================
function loadSettingsUI() {
  try {
    const d = JSON.parse(localStorage.getItem('klg_settings')) || {};
    document.getElementById('musicToggle').checked = d.music !== false;
    document.getElementById('sfxToggle').checked = d.sfx !== false;
    document.getElementById('difficultySelect').value = d.difficulty || 'easy';
  } catch {}
}

function saveSettings() {
  const settings = {
    music: document.getElementById('musicToggle').checked,
    sfx: document.getElementById('sfxToggle').checked,
    difficulty: document.getElementById('difficultySelect').value
  };
  try { localStorage.setItem('klg_settings', JSON.stringify(settings)); } catch {}
  AudioSystem.musicEnabled = settings.music;
  AudioSystem.sfxEnabled = settings.sfx;
  if (settings.music) AudioSystem.startMusic();
  else AudioSystem.stopMusic();
  AudioSystem.click();
}

function toggleMute() {
  AudioSystem.click();
  const icon = document.getElementById('muteIcon');
  if (AudioSystem.sfxEnabled) {
    AudioSystem.sfxEnabled = false;
    AudioSystem.musicEnabled = false;
    AudioSystem.stopMusic();
    icon.src = 'assets/icons/mute.svg';
  } else {
    AudioSystem.sfxEnabled = true;
    AudioSystem.musicEnabled = true;
    AudioSystem.startMusic();
    icon.src = 'assets/icons/sound-on.svg';
  }
  saveToggleState();
}

function saveToggleState() {
  try {
    const d = JSON.parse(localStorage.getItem('klg_settings')) || {};
    d.music = AudioSystem.musicEnabled;
    d.sfx = AudioSystem.sfxEnabled;
    localStorage.setItem('klg_settings', JSON.stringify(d));
  } catch {}
}

function resetProgress() {
  if (confirm('Reset all progress? This cannot be undone!')) {
    try { localStorage.removeItem('klg_progress'); } catch {}
    STORE.init();
    renderProgress();
    AudioSystem.click();
  }
}

// ============================================================
// INITIALIZATION
// ============================================================
function initApp() {
  AudioSystem.init();
  STORE.init();

  document.getElementById('viewHome').classList.add('active');
  document.getElementById('backBtn').style.display = 'none';

  try {
    const d = JSON.parse(localStorage.getItem('klg_settings'));
    if (d) {
      if (d.music === false) { AudioSystem.musicEnabled = false; document.getElementById('muteIcon').src = 'assets/icons/mute.svg'; }
      if (d.sfx === false) AudioSystem.sfxEnabled = false;
    }
  } catch {}

  setTimeout(() => AudioSystem.startMusic(), 1000);
  renderModules();
}

document.addEventListener('DOMContentLoaded', initApp);
