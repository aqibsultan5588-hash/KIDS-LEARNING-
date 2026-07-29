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
  ready: false,

  init() {
    const saved = this.loadSettings();
    this.musicEnabled = saved.music;
    this.sfxEnabled = saved.sfx;
  },

  ensureCtx() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      return this.ctx;
    }
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.08;
      this.musicGain.connect(this.ctx.destination);
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    } catch { return null; }
    return this.ctx;
  },

  loadSettings() {
    try {
      const d = JSON.parse(localStorage.getItem('klg_settings'));
      return d ? { music: d.music !== false, sfx: d.sfx !== false } : { music: true, sfx: true };
    } catch { return { music: true, sfx: true }; }
  },

  playTone(freq, dur, type, vol) {
    if (!this.sfxEnabled) return;
    const ctx = this.ensureCtx();
    if (!ctx) return;
    try {
      if (ctx.state === 'suspended') ctx.resume();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type || 'sine';
      o.frequency.value = freq;
      g.gain.value = vol || 0.15;
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + dur);
    } catch {}
  },

  click() {
    this.playTone(880, 0.06, 'sine', 0.04);
  },
  correct() {
    this.playTone(523, 0.1, 'sine', 0.06);
    setTimeout(() => this.playTone(659, 0.1, 'sine', 0.06), 80);
    setTimeout(() => this.playTone(784, 0.12, 'sine', 0.06), 160);
  },
  wrong() {
    this.playTone(200, 0.25, 'sawtooth', 0.05);
    setTimeout(() => this.playTone(180, 0.25, 'sawtooth', 0.05), 120);
  },
  celebration() {
    const notes = [523, 587, 659, 698, 784, 880, 988, 1047];
    notes.forEach((f, i) => setTimeout(() => this.playTone(f, 0.12, 'sine', 0.06), i * 80));
  },
  pop() {
    this.playTone(1200, 0.06, 'sine', 0.08);
  },

  startMusic() {
    if (!this.musicEnabled || this.musicPlaying) return;
    this.musicPlaying = true;
    this.ensureCtx();
    this.playMelody();
  },

  playMelody() {
    if (!this.musicPlaying || !this.musicEnabled) return;
    const notes = [262, 294, 330, 349, 392, 349, 330, 294, 262, 330, 392, 440, 392, 349, 330, 294];
    const dur = 0.25;
    notes.forEach((f, i) => {
      setTimeout(() => {
        if (!this.musicPlaying || !this.musicEnabled) return;
        this.playTone(f, dur * 0.9, 'sine', 0.04);
      }, i * dur * 1000);
    });
    setTimeout(() => this.playMelody(), notes.length * dur * 1000);
  },

  stopMusic() {
    this.musicPlaying = false;
  },

  playAnimal(name) {
    if (!this.sfxEnabled) return;
    this.ensureCtx();
    try {
      const audio = new Audio('assets/sounds/' + name + '.wav');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch {}
  },

  speak(text) {
    if (!window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = this.ttsLang || 'en-US';
      u.rate = 0.85;
      u.pitch = 1.2;
      u.volume = 1;
      window.speechSynthesis.speak(u);
    } catch {}
  }
};

// ============================================================
// DATA
// ============================================================
const DATA = {
  alphabet: [
    { letter: 'A', lower: 'a', word: 'Apple', urWord: 'سیب', emoji: '\uD83C\uDF4E' },
    { letter: 'B', lower: 'b', word: 'Ball', urWord: 'گیند', emoji: '\u26BD' },
    { letter: 'C', lower: 'c', word: 'Cat', urWord: 'بلی', emoji: '\uD83D\uDC31' },
    { letter: 'D', lower: 'd', word: 'Dog', urWord: 'کتا', emoji: '\uD83D\uDC36' },
    { letter: 'E', lower: 'e', word: 'Elephant', urWord: 'ہاتھی', emoji: '\uD83D\uDC18' },
    { letter: 'F', lower: 'f', word: 'Fish', urWord: 'مچھلی', emoji: '\uD83D\uDC1F' },
    { letter: 'G', lower: 'g', word: 'Grapes', urWord: 'انگور', emoji: '\uD83C\uDF47' },
    { letter: 'H', lower: 'h', word: 'Hat', urWord: 'ٹوپی', emoji: '\uD83C\uDFA9' },
    { letter: 'I', lower: 'i', word: 'Ice cream', urWord: 'آئس کریم', emoji: '\uD83C\uDF66' },
    { letter: 'J', lower: 'j', word: 'Juice', urWord: 'جوس', emoji: '\uD83E\uDD63' },
    { letter: 'K', lower: 'k', word: 'Kite', urWord: 'پتنگ', emoji: '\uD83E\uDE81' },
    { letter: 'L', lower: 'l', word: 'Lion', urWord: 'شیر', emoji: '\uD83E\uDD81' },
    { letter: 'M', lower: 'm', word: 'Monkey', urWord: 'بندر', emoji: '\uD83D\uDC35' },
    { letter: 'N', lower: 'n', word: 'Nest', urWord: 'گھونسلا', emoji: '\uD83E\uDEA6' },
    { letter: 'O', lower: 'o', word: 'Orange', urWord: 'سنترا', emoji: '\uD83C\uDF4A' },
    { letter: 'P', lower: 'p', word: 'Penguin', urWord: 'پینگوئن', emoji: '\uD83D\uDC27' },
    { letter: 'Q', lower: 'q', word: 'Queen', urWord: 'ملکہ', emoji: '\uD83D\uDC51' },
    { letter: 'R', lower: 'r', word: 'Rabbit', urWord: 'خرگوش', emoji: '\uD83D\uDC30' },
    { letter: 'S', lower: 's', word: 'Sun', urWord: 'سورج', emoji: '\u2600\uFE0F' },
    { letter: 'T', lower: 't', word: 'Tiger', urWord: 'چیتا', emoji: '\uD83D\uDC2F' },
    { letter: 'U', lower: 'u', word: 'Umbrella', urWord: 'چھتری', emoji: '\u2602\uFE0F' },
    { letter: 'V', lower: 'v', word: 'Violin', urWord: 'وائلن', emoji: '\uD83C\uDFBB' },
    { letter: 'W', lower: 'w', word: 'Watermelon', urWord: 'تربوز', emoji: '\uD83C\uDF49' },
    { letter: 'X', lower: 'x', word: 'Xylophone', urWord: 'زیلیفون', emoji: '\uD83C\uDFB9' },
    { letter: 'Y', lower: 'y', word: 'Yoyo', urWord: 'یویو', emoji: '\uD83E\uDE80' },
    { letter: 'Z', lower: 'z', word: 'Zebra', urWord: 'زیبرا', emoji: '\uD83E\uDD93' }
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
    ][i],
    urWord: ['ایک','دو','تین','چار','پانچ','چھ','سات','آٹھ','نو','دس',
      'گیارہ','بارہ','تیرہ','چودہ','پندرہ','سولہ','سترہ','اٹھارہ','انیس','بیس',
      'اکیس','بائیس','تئیس','چوبیس','پچیس','چھبیس','ستائیس','اٹھائیس','انتیس','تیس',
      'اکتیس','بتیس','تینتیس','چونتیس','پینتیس','چھتیس','سینتیس','اڑتیس','انتالیس','چالیس',
      'اکتالیس','بیالیس','تینتالیس','چوالیس','پینتالیس','چھیالیس','سینتالیس','اڑتالیس','انچاس','پچاس',
      'اکیاون','باون','ترپن','چوون','پچپن','چھپن','ستاون','اٹھاون','انسٹھ','ساٹھ',
      'اکسٹھ','باسٹھ','تریسٹھ','چوسٹھ','پینسٹھ','چھیاسٹھ','سڑسٹھ','اڑسٹھ','انہتر','ستر',
      'اکہتر','بہتر','تہتر','چوہتر','پچہتر','چھہتر','ستتر','اٹھتر','اناسی','اسی',
      'اکیاسی','بیاسی','تراسی','چوراسی','پچاسی','چھیاسی','ستاسی','اٹھاسی','نواسی','نوے',
      'اکیانوے','بیانوے','ترانوے','چورانوے','پچانوے','چھیانوے','ستانوے','اٹھانوے','نینیانوے','سو'
    ][i]
  })),

  colors: [
    { name: 'Red', urName: 'لال', hex: '#e74c3c', emoji: '\uD83C\uDF4E' },
    { name: 'Blue', urName: 'نیلا', hex: '#3498db', emoji: '\uD83C\uDF0A' },
    { name: 'Green', urName: 'سبز', hex: '#2ecc71', emoji: '\uD83C\uDF3F' },
    { name: 'Yellow', urName: 'پیلا', hex: '#f1c40f', emoji: '\u2600\uFE0F' },
    { name: 'Orange', urName: 'نارنجی', hex: '#e67e22', emoji: '\uD83C\uDF4A' },
    { name: 'Purple', urName: 'جامنی', hex: '#9b59b6', emoji: '\uD83C\uDF3C' },
    { name: 'Pink', urName: 'گلابی', hex: '#fd79a8', emoji: '\uD83C\uDF38' },
    { name: 'Brown', urName: 'بھورا', hex: '#8B4513', emoji: '\uD83C\uDF6A' },
    { name: 'Black', urName: 'کالا', hex: '#2d3436', emoji: '\uD83C\uDF11' },
    { name: 'White', urName: 'سفید', hex: '#ecf0f1', emoji: '\u2601\uFE0F' },
    { name: 'Gray', urName: 'سرمئی', hex: '#95a5a6', emoji: '\uD83E\uDEA8' },
    { name: 'Cyan', urName: 'نیلا سبز', hex: '#00cec9', emoji: '\uD83D\uDCA7' }
  ],

  shapes: [
    { name: 'Circle', urName: 'دائرہ', svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="#6c5ce7" stroke="#4834d4" stroke-width="3"/></svg>' },
    { name: 'Square', urName: 'مربع', svg: '<svg viewBox="0 0 100 100"><rect x="5" y="5" width="90" height="90" fill="#00b894" stroke="#00a381" stroke-width="3" rx="4"/></svg>' },
    { name: 'Triangle', urName: 'مثلث', svg: '<svg viewBox="0 0 100 100"><polygon points="50,5 95,90 5,90" fill="#e17055" stroke="#d63031" stroke-width="3"/></svg>' },
    { name: 'Rectangle', urName: 'مستطیل', svg: '<svg viewBox="0 0 100 100"><rect x="5" y="20" width="90" height="60" fill="#0984e3" stroke="#074b83" stroke-width="3" rx="4"/></svg>' },
    { name: 'Star', urName: 'ستارہ', svg: '<svg viewBox="0 0 100 100"><polygon points="50,5 61,38 97,38 68,60 79,95 50,73 21,95 32,60 3,38 39,38" fill="#fdcb6e" stroke="#f39c12" stroke-width="2"/></svg>' },
    { name: 'Heart', urName: 'دل', svg: '<svg viewBox="0 0 100 100"><path d="M50,85 C25,65 5,45 5,25 C5,10 20,5 30,15 L50,35 L70,15 C80,5 95,10 95,25 C95,45 75,65 50,85Z" fill="#fd79a8" stroke="#e84393" stroke-width="2"/></svg>' },
    { name: 'Oval', urName: 'بیضوی', svg: '<svg viewBox="0 0 100 100"><ellipse cx="50" cy="50" rx="40" ry="25" fill="#a29bfe" stroke="#6c5ce7" stroke-width="3"/></svg>' },
    { name: 'Pentagon', urName: 'پینٹاگون', svg: '<svg viewBox="0 0 100 100"><polygon points="50,5 95,38 79,90 21,90 5,38" fill="#00cec9" stroke="#00b894" stroke-width="3"/></svg>' },
    { name: 'Hexagon', urName: 'ہیکساگون', svg: '<svg viewBox="0 0 100 100"><polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="#e84393" stroke="#d63384" stroke-width="3"/></svg>' }
  ],

  animals: [
    { name: 'Dog', urName: 'کتا', emoji: '\uD83D\uDC36', fact: 'Dogs are loyal pets. They can learn many tricks!', urFact: 'کتے وفادار پالتو جانور ہیں۔ یہ بہت سے حربے سیکھ سکتے ہیں!' },
    { name: 'Cat', urName: 'بلی', emoji: '\uD83D\uDC31', fact: 'Cats purr when they are happy. They love to nap!', urFact: 'بلیاں خوش ہوتی ہیں تو گڑگڑاتی ہیں۔ انہیں جھپکی لینا پسند ہے!' },
    { name: 'Lion', urName: 'شیر', emoji: '\uD83E\uDD81', fact: 'Lions are called the king of the jungle!', urFact: 'شیر کو جنگل کا بادشاہ کہا جاتا ہے!' },
    { name: 'Elephant', urName: 'ہاتھی', emoji: '\uD83D\uDC18', fact: 'Elephants are the largest land animals!', urFact: 'ہاتھی سب سے بڑے زمینی جانور ہیں!' },
    { name: 'Monkey', urName: 'بندر', emoji: '\uD83D\uDC35', fact: 'Monkeys love bananas and are great climbers!', urFact: 'بندروں کو کیلا پسند ہے اور یہ بہت اچھے درخت پر چڑھنے والے ہیں!' },
    { name: 'Tiger', urName: 'چیتا', emoji: '\uD83D\uDC2F', fact: 'Tigers have stripes and are great swimmers!', urFact: 'چیتوں کی دھاریاں ہوتی ہیں اور یہ بہت اچھے تیراک ہیں!' },
    { name: 'Bear', urName: 'ریچھ', emoji: '\uD83D\uDC3B', fact: 'Bears love honey and sleep all winter!', urFact: 'ریچھوں کو شہد پسند ہے اور یہ ساری سردی سوتے ہیں!' },
    { name: 'Penguin', urName: 'پینگوئن', emoji: '\uD83D\uDC27', fact: 'Penguins are birds that cannot fly but swim!', urFact: 'پینگوئن پرندے ہیں جو اڑ نہیں سکتے لیکن تیر سکتے ہیں!' },
    { name: 'Rabbit', urName: 'خرگوش', emoji: '\uD83D\uDC30', fact: 'Rabbits hop and love to eat carrots!', urFact: 'خرگوش اچھلتے ہیں اور گاجر کھانا پسند کرتے ہیں!' },
    { name: 'Cow', urName: 'گائے', emoji: '\uD83D\uDC04', fact: 'Cows give us milk. They say moo!', urFact: 'گائیں ہمیں دودھ دیتی ہیں۔ یہ موں موں کرتی ہیں!' },
    { name: 'Pig', urName: 'سور', emoji: '\uD83D\uDC37', fact: 'Pigs are very smart and clean animals!', urFact: 'سور بہت ذہین اور صاف جانور ہیں!' },
    { name: 'Sheep', urName: 'بھیڑ', emoji: '\uD83D\uDC11', fact: 'Sheep have fluffy wool coats. Baa!', urFact: 'بھیڑوں کی اونی کوٹ ہوتی ہے۔ بھے بھے!' },
    { name: 'Duck', urName: 'بطخ', emoji: '\uD83E\uDD86', fact: 'Ducks love water and go quack quack!', urFact: 'بطخوں کو پانی پسند ہے اور یہ کواک کواک کرتی ہیں!' },
    { name: 'Frog', urName: 'مینڈک', emoji: '\uD83D\uDC38', fact: 'Frogs can jump very high and catch flies!', urFact: 'مینڈک بہت اونچا چھلانگ لگا سکتے ہیں اور مکھیاں پکڑ سکتے ہیں!' },
    { name: 'Owl', urName: 'الو', emoji: '\uD83E\uDD89', fact: 'Owls sleep during day and hunt at night!', urFact: 'الو دن میں سوتے ہیں اور رات کو شکار کرتے ہیں!' },
    { name: 'Fox', urName: 'لومڑی', emoji: '\uD83E\uDD8A', fact: 'Foxes are clever and have bushy tails!', urFact: 'لومڑیاں چالاک ہوتی ہیں اور ان کی جھاڑی دار دم ہوتی ہے!' },
    { name: 'Giraffe', urName: 'زرافہ', emoji: '\uD83E\uDD92', fact: 'Giraffes are very tall with long necks!', urFact: 'زرافے لمبی گردن کے ساتھ بہت لمبے ہوتے ہیں!' },
    { name: 'Zebra', urName: 'زیبرا', emoji: '\uD83E\uDD93', fact: 'Zebras have black and white stripes!', urFact: 'زیبروں کی کالی اور سفید دھاریاں ہوتی ہیں!' },
    { name: 'Horse', urName: 'گھوڑا', emoji: '\uD83D\uDC34', fact: 'Horses run fast and love to gallop!', urFact: 'گھوڑے تیز دوڑتے ہیں اور سرپٹ دوڑنا پسند کرتے ہیں!' },
    { name: 'Chicken', urName: 'مرغی', emoji: '\uD83D\uDC14', fact: 'Chickens lay eggs and go cluck cluck!', urFact: 'مرغیاں انڈے دیتی ہیں اور ککڑکواں کرتی ہیں!' }
  ],

  fruits: [
    { name: 'Apple', urName: 'سیب', emoji: '\uD83C\uDF4E', color: '#e74c3c', fact: 'Apple is red and very healthy!', urFact: 'سیب سرخ اور بہت صحت مند ہے!' },
    { name: 'Banana', urName: 'کیلا', emoji: '\uD83C\uDF4C', color: '#f1c40f', fact: 'Banana is yellow and gives energy!', urFact: 'کیلا پیلا ہوتا ہے اور توانائی دیتا ہے!' },
    { name: 'Orange', urName: 'سنترا', emoji: '\uD83C\uDF4A', color: '#e67e22', fact: 'Orange is full of Vitamin C!', urFact: 'سنترا وٹامن سی سے بھرپور ہوتا ہے!' },
    { name: 'Grapes', urName: 'انگور', emoji: '\uD83C\uDF47', color: '#9b59b6', fact: 'Grapes can be green or purple!', urFact: 'انگور سبز یا جامنی ہو سکتے ہیں!' },
    { name: 'Watermelon', urName: 'تربوز', emoji: '\uD83C\uDF49', color: '#2ecc71', fact: 'Watermelon is big and juicy!', urFact: 'تربوز بڑا اور رس دار ہوتا ہے!' },
    { name: 'Strawberry', urName: 'اسٹرابیری', emoji: '\uD83C\uDF53', color: '#e74c3c', fact: 'Strawberry is small and sweet!', urFact: 'اسٹرابیری چھوٹی اور میٹھی ہوتی ہے!' },
    { name: 'Mango', urName: 'آم', emoji: '\uD83E\uDD6D', color: '#f39c12', fact: 'Mango is the king of fruits!', urFact: 'آم پھلوں کا بادشاہ ہے!' },
    { name: 'Pineapple', urName: 'انناس', emoji: '\uD83C\uDF4D', color: '#f1c40f', fact: 'Pineapple has a spiky crown!', urFact: 'انناس کا تاج دار ہوتا ہے!' },
    { name: 'Cherry', urName: 'چیری', emoji: '\uD83C\uDF52', color: '#c0392b', fact: 'Cherries grow in pairs!', urFact: 'چیریاں جوڑوں میں اگتی ہیں!' },
    { name: 'Peach', urName: 'آڑو', emoji: '\uD83C\uDF51', color: '#fd79a8', fact: 'Peach is fuzzy and sweet!', urFact: 'آڑو ملائم اور میٹھا ہوتا ہے!' },
    { name: 'Carrot', urName: 'گاجر', emoji: '\uD83E\uDD55', color: '#e67e22', fact: 'Carrot is good for your eyes!', urFact: 'گاجر آنکھوں کے لیے اچھی ہوتی ہے!' },
    { name: 'Broccoli', urName: 'بروکلی', emoji: '\uD83E\uDD66', color: '#27ae60', fact: 'Broccoli looks like tiny trees!', urFact: 'بروکلی چھوٹے درختوں کی طرح لگتی ہے!' },
    { name: 'Corn', urName: 'مکئی', emoji: '\uD83C\uDF3D', color: '#f1c40f', fact: 'Corn has many yellow kernels!', urFact: 'مکئی میں پیلے دانے ہوتے ہیں!' },
    { name: 'Tomato', urName: 'ٹماٹر', emoji: '\uD83C\uDF45', color: '#e74c3c', fact: 'Tomato is actually a fruit!', urFact: 'ٹماٹر دراصل ایک پھل ہے!' },
    { name: 'Potato', urName: 'آلو', emoji: '\uD83E\uDD54', color: '#8B4513', fact: 'Potato grows underground!', urFact: 'آلو زمین کے نیچے اگتا ہے!' }
  ],

  bodyParts: [
    { name: 'Eyes', urName: 'آنکھیں', emoji: '\uD83D\uDC40', fact: 'Eyes help you see the world!', urFact: 'آنکھیں آپ کو دنیا دیکھنے میں مدد دیتی ہیں!' },
    { name: 'Ears', urName: 'کان', emoji: '\uD83D\uDC42', fact: 'Ears help you hear sounds!', urFact: 'کان آپ کو آوازیں سننے میں مدد دیتے ہیں!' },
    { name: 'Nose', urName: 'ناک', emoji: '\uD83D\uDC43', fact: 'Nose helps you smell flowers!', urFact: 'ناک آپ کو پھولوں کی خوشبو سونگھنے میں مدد دیتی ہے!' },
    { name: 'Mouth', urName: 'منہ', emoji: '\uD83D\uDC44', fact: 'Mouth helps you eat and speak!', urFact: 'منہ آپ کو کھانے اور بولنے میں مدد دیتا ہے!' },
    { name: 'Hands', urName: 'ہاتھ', emoji: '\uD83E\uDD1A', fact: 'Hands help you wave and grab!', urFact: 'ہاتھ آپ کو ہلانے اور پکڑنے میں مدد دیتے ہیں!' },
    { name: 'Legs', urName: 'ٹانگیں', emoji: '\uD83E\uDDB5', fact: 'Legs help you walk and run!', urFact: 'ٹانگیں آپ کو چلنے اور دوڑنے میں مدد دیتی ہیں!' },
    { name: 'Feet', urName: 'پاؤں', emoji: '\uD83E\uDDB6', fact: 'Feet help you stand and jump!', urFact: 'پاؤں آپ کو کھڑے ہونے اور چھلانگ لگانے میں مدد دیتے ہیں!' },
    { name: 'Arms', urName: 'بازو', emoji: '\uD83D\uDCAA', fact: 'Arms help you reach and lift!', urFact: 'بازو آپ کو پہنچنے اور اٹھانے میں مدد دیتے ہیں!' },
    { name: 'Fingers', urName: 'انگلیاں', emoji: '\uD83D\uDD90\uFE0F', fact: 'Fingers help you hold things!', urFact: 'انگلیاں آپ کو چیزیں پکڑنے میں مدد دیتی ہیں!' },
    { name: 'Teeth', urName: 'دانتوں', emoji: '\uD83E\uDDB7', fact: 'Teeth help you chew food!', urFact: 'دانتوں آپ کو کھانا چبانے میں مدد دیتے ہیں!' },
    { name: 'Tongue', urName: 'زبان', emoji: '\uD83D\uDC45', fact: 'Tongue helps you taste food!', urFact: 'زبان آپ کو کھانے کا ذائقہ چکھنے میں مدد دیتی ہے!' },
    { name: 'Hair', urName: 'بال', emoji: '\uD83E\uDDB0', fact: 'Hair keeps your head warm!', urFact: 'بال آپ کے سر کو گرم رکھتے ہیں!' }
  ],

  transport: [
    { name: 'Car', urName: 'گاڑی', emoji: '\uD83D\uDE97', fact: 'Cars have four wheels and a steering wheel!', urFact: 'گاڑی میں چار پہیے اور اسٹیئرنگ وہیل ہوتا ہے!' },
    { name: 'Bus', urName: 'بس', emoji: '\uD83D\uDE8C', fact: 'Bus carries many people at once!', urFact: 'بس ایک بار میں بہت سے لوگوں کو لے جاتی ہے!' },
    { name: 'Train', urName: 'ٹرین', emoji: '\uD83D\uDE86', fact: 'Train runs on tracks and goes choo-choo!', urFact: 'ٹرین پٹری پر چلتی ہے اور چھک چھک کرتی ہے!' },
    { name: 'Airplane', urName: 'ہوائی جہاز', emoji: '\u2708\uFE0F', fact: 'Airplane flies high in the sky!', urFact: 'ہوائی جہاز آسمان میں اونچا اڑتا ہے!' },
    { name: 'Bicycle', urName: 'سائیکل', emoji: '\uD83D\uDEB2', fact: 'Bicycle has two wheels and pedals!', urFact: 'سائیکل میں دو پہیے اور پیڈل ہوتے ہیں!' },
    { name: 'Boat', urName: 'کشتی', emoji: '\u26F5', fact: 'Boat floats on water!', urFact: 'کشتی پانی پر تیرتی ہے!' },
    { name: 'Helicopter', urName: 'ہیلی کاپٹر', emoji: '\uD83D\uDE81', fact: 'Helicopter has spinning blades on top!', urFact: 'ہیلی کاپٹر کے اوپر گھومنے والے پنکھے ہوتے ہیں!' },
    { name: 'Truck', urName: 'ٹرک', emoji: '\uD83D\uDE9A', fact: 'Truck carries heavy loads!', urFact: 'ٹرک بھاری سامان لے جاتا ہے!' },
    { name: 'Motorcycle', urName: 'موٹر سائیکل', emoji: '\uD83C\uDFCD\uFE0F', fact: 'Motorcycle is fast and has two wheels!', urFact: 'موٹر سائیکل تیز ہوتی ہے اور اس کے دو پہیے ہوتے ہیں!' },
    { name: 'Scooter', urName: 'سکوٹر', emoji: '\uD83D\uDEF4', fact: 'Scooter is easy to ride!', urFact: 'سکوٹر چلانا آسان ہوتا ہے!' }
  ],

  daysMonths: [
    { name: 'Sunday', urName: 'اتوار', short: 'Sun', type: 'day', emoji: '\u2600\uFE0F', fact: 'Sunday is the first day of the week!', urFact: 'اتوار ہفتے کا پہلا دن ہے!' },
    { name: 'Monday', urName: 'پیر', short: 'Mon', type: 'day', emoji: '\uD83C\uDF19', fact: 'Monday is the second day!', urFact: 'پیر ہفتے کا دوسرا دن ہے!' },
    { name: 'Tuesday', urName: 'منگل', short: 'Tue', type: 'day', emoji: '\uD83D\uDD25', fact: 'Tuesday is the third day!', urFact: 'منگل ہفتے کا تیسرا دن ہے!' },
    { name: 'Wednesday', urName: 'بدھ', short: 'Wed', type: 'day', emoji: '\uD83D\uDCA7', fact: 'Wednesday is the middle of the week!', urFact: 'بدھ ہفتے کا درمیانی دن ہے!' },
    { name: 'Thursday', urName: 'جمعرات', short: 'Thu', type: 'day', emoji: '\uD83C\uDF43', fact: 'Thursday is the fifth day!', urFact: 'جمعرات ہفتے کا پانچواں دن ہے!' },
    { name: 'Friday', urName: 'جمعہ', short: 'Fri', type: 'day', emoji: '\uD83D\uDC9C', fact: 'Friday is a fun day!', urFact: 'جمعہ مزے کا دن ہے!' },
    { name: 'Saturday', urName: 'ہفتہ', short: 'Sat', type: 'day', emoji: '\uD83C\uDF89', fact: 'Saturday is the last day of the week!', urFact: 'ہفتہ ہفتے کا آخری دن ہے!' },
    { name: 'January', urName: 'جنوری', short: 'Jan', type: 'month', emoji: '\u2744\uFE0F', fact: 'January is the first month, it is cold!', urFact: 'جنوری پہلا مہینہ ہے، یہ سرد ہوتا ہے!' },
    { name: 'February', urName: 'فروری', short: 'Feb', type: 'month', emoji: '\uD83D\uDC91', fact: 'February has 28 or 29 days!', urFact: 'فروری میں 28 یا 29 دن ہوتے ہیں!' },
    { name: 'March', urName: 'مارچ', short: 'Mar', type: 'month', emoji: '\uD83C\uDF3C', fact: 'March is when spring begins!', urFact: 'مارچ میں بہار شروع ہوتی ہے!' },
    { name: 'April', urName: 'اپریل', short: 'Apr', type: 'month', emoji: '\u2614', fact: 'April brings rain showers!', urFact: 'اپریل بارش لاتا ہے!' },
    { name: 'May', urName: 'مئی', short: 'May', type: 'month', emoji: '\uD83C\uDF3F', fact: 'May is warm and flowers bloom!', urFact: 'مئی گرم ہوتا ہے اور پھول کھلتے ہیں!' },
    { name: 'June', urName: 'جون', short: 'Jun', type: 'month', emoji: '\uD83C\uDF1E', fact: 'June is the start of summer!', urFact: 'جون گرمیوں کا آغاز ہے!' },
    { name: 'July', urName: 'جولائی', short: 'Jul', type: 'month', emoji: '\uD83C\uDF89', fact: 'July is a holiday month!', urFact: 'جولائی چھٹیوں کا مہینہ ہے!' },
    { name: 'August', urName: 'اگست', short: 'Aug', type: 'month', emoji: '\uD83C\uDF4E', fact: 'August is hot and sunny!', urFact: 'اگست گرم اور دھوپ والا ہوتا ہے!' },
    { name: 'September', urName: 'ستمبر', short: 'Sep', type: 'month', emoji: '\uD83C\uDF42', fact: 'September starts the fall season!', urFact: 'ستمبر میں خزاں کا موسم شروع ہوتا ہے!' },
    { name: 'October', urName: 'اکتوبر', short: 'Oct', type: 'month', emoji: '\uD83C\uDF83', fact: 'October has Halloween fun!', urFact: 'اکتوبر میں ہالووین کا مزہ ہے!' },
    { name: 'November', urName: 'نومبر', short: 'Nov', type: 'month', emoji: '\uD83C\uDF41', fact: 'November leaves fall from trees!', urFact: 'نومبر میں درختوں سے پتے گرتے ہیں!' },
    { name: 'December', urName: 'دسمبر', short: 'Dec', type: 'month', emoji: '\uD83C\uDF84', fact: 'December is the last month, happy holidays!', urFact: 'دسمبر آخری مہینہ ہے، خوشیوں کی چھٹیاں!' }
  ],

  seasons: [
    { name: 'Spring', urName: 'بہار', emoji: '\uD83C\uDF3C', fact: 'Spring has flowers and baby animals!', urFact: 'بہار میں پھول اور چھوٹے جانور ہوتے ہیں!' },
    { name: 'Summer', urName: 'گرمی', emoji: '\u2600\uFE0F', fact: 'Summer is hot! Time for ice cream!', urFact: 'گرمی گرم ہے! آئس کریم کا وقت!' },
    { name: 'Autumn', urName: 'خزاں', emoji: '\uD83C\uDF42', fact: 'Autumn leaves turn orange and fall!', urFact: 'خزاں میں پتے نارنجی ہو کر گرتے ہیں!' },
    { name: 'Winter', urName: 'سردی', emoji: '\u2744\uFE0F', fact: 'Winter is cold! Time for snowmen!', urFact: 'سردی سرد ہے! سنو مین بنانے کا وقت!' },
    { name: 'Rainy', urName: 'بارش', emoji: '\uD83C\uDF27\uFE0F', fact: 'Rainy days help plants grow!', urFact: 'بارش کے دن پودوں کو بڑھنے میں مدد دیتے ہیں!' },
    { name: 'Sunny', urName: 'دھوپ', emoji: '\u2600\uFE0F', fact: 'Sunny days are bright and warm!', urFact: 'دھوپ کے دن روشن اور گرم ہوتے ہیں!' },
    { name: 'Cloudy', urName: 'ابر آلود', emoji: '\u2601\uFE0F', fact: 'Cloudy days have no sun!', urFact: 'ابر آلود دنوں میں سورج نہیں ہوتا!' },
    { name: 'Windy', urName: 'ہوا دار', emoji: '\uD83C\uDF2C\uFE0F', fact: 'Windy days are good for flying kites!', urFact: 'ہوا دار دن پتنگ اڑانے کے لیے اچھے ہوتے ہیں!' },
    { name: 'Snowy', urName: 'برفانی', emoji: '\uD83C\uDF28\uFE0F', fact: 'Snowy days are great for snowballs!', urFact: 'برفانی دن سنو بال کے لیے بہترین ہوتے ہیں!' },
    { name: 'Stormy', urName: 'طوفانی', emoji: '\u26C8\uFE0F', fact: 'Stormy days have thunder and lightning!', urFact: 'طوفانی دنوں میں گرج اور بجلی ہوتی ہے!' }
  ],



  quizQuestions: [
    { q: 'What color is the sky?', urQ: 'آسمان کا رنگ کیا ہے؟', options: ['Blue', 'Red', 'Green', 'Yellow'], urOptions: ['نیلا', 'لال', 'سبز', 'پیلا'], answer: 0 },
    { q: 'Which animal says "Moo"?', urQ: 'کس جانور کی آواز "مُوں" ہے؟', options: ['Dog', 'Cow', 'Cat', 'Bird'], urOptions: ['کتا', 'گائے', 'بلی', 'پرندہ'], answer: 1 },
    { q: 'How many legs does a dog have?', urQ: 'کتے کی کتنی ٹانگیں ہوتی ہیں؟', options: ['2', '3', '4', '5'], urOptions: ['2', '3', '4', '5'], answer: 2 },
    { q: 'What shape is a ball?', urQ: 'گیند کس شکل کی ہوتی ہے؟', options: ['Square', 'Triangle', 'Circle', 'Star'], urOptions: ['مربع', 'مثلث', 'دائرہ', 'ستارہ'], answer: 2 },
    { q: 'Which letter comes after A?', urQ: 'A کے بعد کون سا حرف آتا ہے؟', options: ['C', 'B', 'D', 'E'], urOptions: ['C', 'B', 'D', 'E'], answer: 1 },
    { q: 'What is 2 + 2?', urQ: '2 + 2 کیا ہے؟', options: ['3', '4', '5', '6'], urOptions: ['3', '4', '5', '6'], answer: 1 },
    { q: 'Which animal can fly?', urQ: 'کون سا جانور اڑ سکتا ہے؟', options: ['Fish', 'Dog', 'Bird', 'Cat'], urOptions: ['مچھلی', 'کتا', 'پرندہ', 'بلی'], answer: 2 },
    { q: 'What color is grass?', urQ: 'گھاس کا رنگ کیا ہے؟', options: ['Blue', 'Red', 'Green', 'Yellow'], urOptions: ['نیلا', 'لال', 'سبز', 'پیلا'], answer: 2 },
    { q: 'How many fingers on one hand?', urQ: 'ایک ہاتھ میں کتنی انگلیاں ہوتی ہیں؟', options: ['3', '4', '5', '6'], urOptions: ['3', '4', '5', '6'], answer: 2 },
    { q: 'Which shape has 3 sides?', urQ: 'کس شکل کے 3 کنارے ہوتے ہیں؟', options: ['Circle', 'Square', 'Triangle', 'Star'], urOptions: ['دائرہ', 'مربع', 'مثلث', 'ستارہ'], answer: 2 },
    { q: 'What is 5 - 2?', urQ: '5 - 2 کیا ہے؟', options: ['2', '3', '4', '5'], urOptions: ['2', '3', '4', '5'], answer: 1 },
    { q: 'Which animal is pink?', urQ: 'کون سا جانور گلابی ہوتا ہے؟', options: ['Pig', 'Cow', 'Horse', 'Sheep'], urOptions: ['سور', 'گائے', 'گھوڑا', 'بھیڑ'], answer: 0 }
  ]
};

// ============================================================
// LANGUAGE SYSTEM
// ============================================================
let currentLang = 'en';

const LANG = {
  en: {
    appTitle: 'Kids Learning',
    appSubtitle: 'Play & Learn Together!',
    startLearning: 'Start Learning',
    miniGames: 'Mini Games',
    progress: 'Progress',
    settings: 'Settings',
    about: 'About',
    chooseWhatToLearn: 'Choose What to Learn',
    alphabet: 'Alphabet',
    numbers: 'Numbers',
    colors: 'Colors',
    shapes: 'Shapes',
    animals: 'Animals',
    fruitsAndVeg: 'Fruits & Veg',
    fruitsAndVegetables: 'Fruits & Vegetables',
    bodyParts: 'Body Parts',
    transport: 'Transport',
    daysAndMonths: 'Days & Months',
    seasons: 'Seasons',
    seasonsAndWeather: 'Seasons & Weather',

    wordLabel: 'Word:',
    meaningLabel: 'Meaning:',
    listen: 'Listen',
    previous: 'Previous',
    next: 'Next',
    score: 'Score',
    matches: 'Matches',
    moves: 'Moves',
    popped: 'Popped',
    wins: 'Wins',
    losses: 'Losses',
    connected: 'Connected',
    restart: 'Restart',
    clear: 'Clear',
    save: 'Save',
    days: 'Days',
    months: 'Months',
    letterMatching: 'Letter Matching',
    letterMatchInstr: 'Match the uppercase letter to its lowercase pair!',
    numberMatching: 'Number Matching',
    numberMatchInstr: 'Count the objects and pick the right number!',
    colorMatching: 'Color Matching',
    colorMatchInstr: 'Tap the color that matches the name!',
    shapeMatching: 'Shape Matching',
    shapeMatchInstr: 'Find the shape that matches the name!',
    animalMatching: 'Animal Matching',
    animalMatchInstr: 'Find the animal that matches the name!',
    balloonPop: 'Balloon Pop',
    balloonPopInstr: 'Pop the balloons! Count how many you pop!',
    memoryCards: 'Memory Cards',
    memoryInstr: 'Find matching pairs!',
    findPicture: 'Find the Correct Picture',
    whichOneIs: 'Which one is',
    dragDropPuzzle: 'Drag & Drop Puzzle',
    puzzleInstr: 'Drag the pieces to complete the picture!',
    simpleQuiz: 'Simple Quiz',
    mathOperations: 'Math Operations',
    wordSpelling: 'Word Spelling',
    ticTacToe: 'Tic Tac Toe',
    ticTacToeInstr: 'You are X, Computer is O!',
    yourTurn: 'Your turn!',
    computerThinking: 'Computer thinking...',
    youWin: 'You win!',
    computerWins: 'Computer wins!',
    itsADraw: "It's a draw!",
    connectDots: 'Connect the Dots',
    connectDotsInstr: 'Tap the numbers in order!',
    coloringBook: 'Coloring Book',
    coloringInstr: 'Pick a color and paint!',
    clockReading: 'Clock Reading',
    clockInstr: 'What time is it?',
    myProgress: 'My Progress',
    learning: 'Learning',
    gamesDone: 'Games Done',
    stars: 'Stars',
    coins: 'Coins',
    achievements: 'Achievements',
    music: 'Music',
    soundEffects: 'Sound Effects',
    difficulty: 'Difficulty',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    language: 'Language',
    english: 'English',
    urdu: 'اردو',
    darkMode: 'Dark Mode',
    resetProgress: 'Reset Progress',
    resetConfirm: 'Reset all progress? This cannot be undone!',
    aboutTitle: 'Kids Learning Game',
    version: 'Version',
    aboutDesc: 'A fun educational game for kids to learn alphabets, numbers, colors, shapes, and animals through interactive lessons and mini games.',
    features: 'Features:',
    featAlphabet: 'Alphabet Learning A-Z',
    featUrdu: 'Urdu Learning (اردو)',
    featNumbers: 'Numbers 1-100',
    featColorsShapes: 'Colors & Shapes',
    featAnimalsFruits: 'Animals, Fruits & Vegetables',
    featBodyTransport: 'Body Parts & Transport',
    featDaysSeasons: 'Days, Months & Seasons',
    featGames: '16 Mini Games',
    featMathSpelling: 'Math Operations & Spelling',
    featTTTConnect: 'Tic Tac Toe & Connect Dots',
    featColoringClock: 'Coloring Book & Clock Reading',
    featDarkMode: 'Dark Mode & Rewards',
    madeWithLove: 'Made with',
    forKids: 'for kids everywhere!',
    greatJob: 'Great Job!',
    youEarnedStar: 'You earned a star!',
    continue: 'Continue',
    spellTarget: 'Spell the word!',
    spellTheWord: 'Spell:',
    scoreLabel: 'Score:',
    rewardLetterChamp: 'Letter Champion!',
    rewardLetterMsg: 'You matched 10 letters!',
    rewardNumberStar: 'Number Star!',
    rewardNumberMsg: 'You counted 10 rounds!',
    rewardAnimalExpert: 'Animal Expert!',
    rewardAnimalMsg: 'You know all animals!',
    rewardBalloonPopper: 'Balloon Popper!',
    rewardBalloonMsg: 'You popped 20 balloons!',
    rewardMemoryMaster: 'Memory Master!',
    rewardMemoryMsg: 'You found all pairs!',
    rewardPicturePro: 'Picture Pro!',
    rewardPictureMsg: 'You found 10 pictures!',
    rewardPuzzleMaster: 'Puzzle Master!',
    rewardPuzzleMsg: 'You completed the puzzle!',
    rewardQuizChamp: 'Quiz Champion!',
    rewardQuizMsg: 'You got {0} out of {1} correct!',
    rewardMathGenius: 'Math Genius!',
    rewardMathMsg: 'You solved 10 problems!',
    rewardSpellingStar: 'Spelling Star!',
    rewardSpellingMsg: 'You spelled all words!',
    rewardTTTChamp: 'Tic Tac Toe Champ!',
    rewardTTTMsg: 'You beat the computer!',
    rewardDotConnector: 'Dot Connector!',
    rewardDotMsg: 'You connected all dots!',
    rewardTimeKeeper: 'Time Keeper!',
    rewardTimeMsg: 'You read 10 clocks!',
    achFirstLesson: 'First Lesson',
    achAlphabetStar: 'Alphabet Star',
    achNumberNinja: 'Number Ninja',
    achColorArtist: 'Color Artist',
    achShapeMaster: 'Shape Master',
    achAnimalFriend: 'Animal Friend',
    achGameBeginner: 'Game Beginner',
    achGamePlayer: 'Game Player',
    achGameChamp: 'Game Champion',
    achStarCollector: 'Star Collector',
    achStarMaster: 'Star Master',
    achCoinCollector: 'Coin Collector',
    achAllLearner: 'All Subjects',
    achBadgeCollector: 'Badge Collector',
    tttYourTurn: 'Your turn (X)!',
    tttComputerTurn: 'Your turn (X)!'
  },

  ur: {
    appTitle: 'بچوں کی سیکھائی',
    appSubtitle: 'کھیلیں اور سیکھیں ایک ساتھ!',
    startLearning: 'سیکھنا شروع کریں',
    miniGames: 'چھوٹے کھیل',
    progress: 'ترقی',
    settings: 'سیٹنگز',
    about: 'ہمارے بارے میں',
    chooseWhatToLearn: 'سیکھنے کے لیے منتخب کریں',
    alphabet: 'حروف تہجی',
    numbers: 'نمبر',
    colors: 'رنگ',
    shapes: 'شکلیں',
    animals: 'جانور',
    fruitsAndVeg: 'پھل اور سبزیاں',
    fruitsAndVegetables: 'پھل اور سبزیاں',
    bodyParts: 'جسم کے اعضاء',
    transport: 'نقل و حمل',
    daysAndMonths: 'دن اور مہینے',
    seasons: 'موسم',
    seasonsAndWeather: 'موسم اور موسم',

    wordLabel: 'لفظ:',
    meaningLabel: 'معنی:',
    listen: 'سنیں',
    previous: 'پچھلا',
    next: 'اگلا',
    score: 'اسکور',
    matches: 'مطابقت',
    moves: 'چالیں',
    popped: 'پھٹے',
    wins: 'جیت',
    losses: 'ہار',
    connected: 'منسلک',
    restart: 'دوبارہ شروع',
    clear: 'صاف کریں',
    save: 'محفوظ کریں',
    days: 'دن',
    months: 'مہینے',
    letterMatching: 'حرف کی مطابقت',
    letterMatchInstr: 'بڑے حرف کو چھوٹے حرف سے ملائیں!',
    numberMatching: 'نمبر کی مطابقت',
    numberMatchInstr: 'چیزیں گنیں اور صحیح نمبر چنیں!',
    colorMatching: 'رنگ کی مطابقت',
    colorMatchInstr: 'نام سے ملنے والا رنگ دبائیں!',
    shapeMatching: 'شکل کی مطابقت',
    shapeMatchInstr: 'نام سے ملنے والی شکل تلاش کریں!',
    animalMatching: 'جانور کی مطابقت',
    animalMatchInstr: 'نام سے ملنے والا جانور تلاش کریں!',
    balloonPop: 'غبارہ پھاڑنا',
    balloonPopInstr: 'غبارے پھاڑیں! گنیں کتنے پھاڑے!',
    memoryCards: 'میموری کارڈز',
    memoryInstr: 'جوڑے تلاش کریں!',
    findPicture: 'صحیح تصویر تلاش کریں',
    whichOneIs: 'کون سا ہے',
    dragDropPuzzle: 'گھسیٹیں اور چھوڑیں پہیلی',
    puzzleInstr: 'ٹکڑوں کو گھسیٹ کر تصویر مکمل کریں!',
    simpleQuiz: 'سادہ کوئز',
    mathOperations: 'ریاضی کے عمل',
    wordSpelling: 'لفظ کی ہجے',
    ticTacToe: 'ٹک ٹیک ٹو',
    ticTacToeInstr: 'آپ X ہیں، کمپیوٹر O ہے!',
    yourTurn: 'آپ کی باری!',
    computerThinking: 'کمپیوٹر سوچ رہا...',
    youWin: 'آپ جیت گئے!',
    computerWins: 'کمپیوٹر جیت گیا!',
    itsADraw: 'مقابلہ برابر!',
    connectDots: 'نقطے جوڑیں',
    connectDotsInstr: 'ترتیب سے نمبروں پر ٹیپ کریں!',
    coloringBook: 'رنگ بھرنے کی کتاب',
    coloringInstr: 'رنگ چنیں اور پینٹ کریں!',
    clockReading: 'گھڑی پڑھنا',
    clockInstr: 'کیا وقت ہوا ہے؟',
    myProgress: 'میری ترقی',
    learning: 'سیکھنا',
    gamesDone: 'کھیل مکمل',
    stars: 'ستارے',
    coins: 'سکے',
    achievements: 'کامیابیاں',
    music: 'موسیقی',
    soundEffects: 'صوتی اثرات',
    difficulty: 'مشکل',
    easy: 'آسان',
    medium: 'درمیانہ',
    hard: 'مشکل',
    language: 'زبان',
    english: 'انگریزی',
    urdu: 'اردو',
    darkMode: 'ڈارک موڈ',
    resetProgress: 'ترقی دوبارہ سیٹ کریں',
    resetConfirm: 'ساری ترقی دوبارہ سیٹ کریں؟ یہ واپس نہیں ہو سکتی!',
    aboutTitle: 'بچوں کی سیکھائی کا کھیل',
    version: 'ورژن',
    aboutDesc: 'بچوں کے لیے ایک تفریحی تعلیمی کھیل جو انٹرایکٹو اسباق اور منی گیمز کے ذریعے حروف تہجی، نمبر، رنگ، شکلیں اور جانور سکھاتا ہے۔',
    features: 'خصوصیات:',
    featAlphabet: 'حروف تہجی سیکھنا A-Z',
    featUrdu: 'اردو سیکھنا (اردو)',
    featNumbers: 'نمبر 1-100',
    featColorsShapes: 'رنگ اور شکلیں',
    featAnimalsFruits: 'جانور، پھل اور سبزیاں',
    featBodyTransport: 'جسم کے اعضاء اور نقل و حمل',
    featDaysSeasons: 'دن، مہینے اور موسم',
    featGames: '16 منی گیمز',
    featMathSpelling: 'ریاضی کے عمل اور ہجے',
    featTTTConnect: 'ٹک ٹیک ٹو اور نقطے جوڑیں',
    featColoringClock: 'رنگ بھرنے کی کتاب اور گھڑی پڑھنا',
    featDarkMode: 'ڈارک موڈ اور انعامات',
    madeWithLove: 'سے بنایا گیا',
    forKids: 'دنیا بھر کے بچوں کے لیے!',
    greatJob: 'بہت اچھے!',
    youEarnedStar: 'آپ نے ایک ستارہ جیتا!',
    continue: 'جاری رکھیں',
    spellTarget: 'لفظ لکھیں!',
    spellTheWord: 'لکھیں:',
    scoreLabel: 'اسکور:',
    rewardLetterChamp: 'حرف چیمپئن!',
    rewardLetterMsg: 'آپ نے 10 حرف ملائے!',
    rewardNumberStar: 'نمبر اسٹار!',
    rewardNumberMsg: 'آپ نے 10 راؤنڈ گنے!',
    rewardAnimalExpert: 'جانور ماہر!',
    rewardAnimalMsg: 'آپ سب جانوروں کو جانتے ہیں!',
    rewardBalloonPopper: 'غبارہ پھاڑنے والا!',
    rewardBalloonMsg: 'آپ نے 20 غبارے پھاڑے!',
    rewardMemoryMaster: 'میموری ماسٹر!',
    rewardMemoryMsg: 'آپ نے تمام جوڑے تلاش کر لیے!',
    rewardPicturePro: 'تصویر پرو!',
    rewardPictureMsg: 'آپ نے 10 تصویریں تلاش کیں!',
    rewardPuzzleMaster: 'پہیلی ماسٹر!',
    rewardPuzzleMsg: 'آپ نے پہیلی مکمل کی!',
    rewardQuizChamp: 'کوئز چیمپئن!',
    rewardQuizMsg: 'آپ نے {0} میں سے {1} صحیح کیے!',
    rewardMathGenius: 'ریاضی کا جینیئس!',
    rewardMathMsg: 'آپ نے 10 مسائل حل کیے!',
    rewardSpellingStar: 'ہجے کا اسٹار!',
    rewardSpellingMsg: 'آپ نے تمام الفاظ لکھے!',
    rewardTTTChamp: 'ٹک ٹیک ٹو چیمپئن!',
    rewardTTTMsg: 'آپ نے کمپیوٹر کو ہرایا!',
    rewardDotConnector: 'نقطہ جوڑنے والا!',
    rewardDotMsg: 'آپ نے تمام نقطے جوڑ دیے!',
    rewardTimeKeeper: 'وقت کا محافظ!',
    rewardTimeMsg: 'آپ نے 10 گھڑیاں پڑھیں!',
    achFirstLesson: 'پہلا سبق',
    achAlphabetStar: 'حروف تہجی کا ستارہ',
    achNumberNinja: 'نمبر ننجا',
    achColorArtist: 'رنگ کا فنکار',
    achShapeMaster: 'شکل کا ماسٹر',
    achAnimalFriend: 'جانوروں کا دوست',
    achGameBeginner: 'کھیل کا beginner',
    achGamePlayer: 'کھیل کا کھلاڑی',
    achGameChamp: 'کھیل کا چیمپئن',
    achStarCollector: 'ستارہ جمع کرنے والا',
    achStarMaster: 'ستارہ ماسٹر',
    achCoinCollector: 'سکہ جمع کرنے والا',
    achAllLearner: 'تمام مضامین',
    achBadgeCollector: 'بیج جمع کرنے والا',
    tttYourTurn: 'آپ کی باری (X)!',
    tttComputerTurn: 'آپ کی باری (X)!'
  }
};

function t(key) {
  return (LANG[currentLang] && LANG[currentLang][key]) || (LANG.en && LANG.en[key]) || key;
}

function td(item, field) {
  if (!item) return '';
  if (currentLang === 'ur') {
    const urField = 'ur' + field.charAt(0).toUpperCase() + field.slice(1);
    return item[urField] || item[field];
  }
  return item[field];
}

function applyLanguage() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = t(key);
  });
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === 'ur' ? 'rtl' : 'ltr';
}

function changeLanguage() {
  const sel = document.getElementById('languageSelect');
  currentLang = sel.value;
  applyLanguage();
  document.getElementById('gamesGrid').innerHTML = '';
  AudioSystem.click();
  AudioSystem.ttsLang = currentLang === 'ur' ? 'ur-PK' : 'en-US';
  saveSettings();
}

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
      { id: 'first_learn', name: t('achFirstLesson'), icon: 'learning', check: () => Object.keys(p.visited).length >= 1 },
      { id: 'alphabet_star', name: t('achAlphabetStar'), icon: 'alphabet', check: () => p.visited.alphabet },
      { id: 'number_ninja', name: t('achNumberNinja'), icon: 'numbers', check: () => p.visited.numbers },
      { id: 'color_artist', name: t('achColorArtist'), icon: 'colors', check: () => p.visited.colors },
      { id: 'shape_master', name: t('achShapeMaster'), icon: 'shapes', check: () => p.visited.shapes },
      { id: 'animal_friend', name: t('achAnimalFriend'), icon: 'animals', check: () => p.visited.animals },
      { id: 'game_beginner', name: t('achGameBeginner'), icon: 'games', check: () => p.gamesDone >= 1 },
      { id: 'game_player', name: t('achGamePlayer'), icon: 'games', check: () => p.gamesDone >= 5 },
      { id: 'game_champ', name: t('achGameChamp'), icon: 'trophy', check: () => p.gamesDone >= 10 },
      { id: 'star_collector', name: t('achStarCollector'), icon: 'star', check: () => p.stars >= 10 },
      { id: 'star_master', name: t('achStarMaster'), icon: 'star', check: () => p.stars >= 50 },
      { id: 'coin_collector', name: t('achCoinCollector'), icon: 'coin', check: () => p.coins >= 20 },
      { id: 'all_learner', name: t('achAllLearner'), icon: 'learning', check: () => Object.keys(p.visited).length >= 5 },
      { id: 'badge_badge', name: t('achBadgeCollector'), icon: 'badge', check: () => p.badgeIds.length >= 5 }
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
  const vt = document.querySelector(`#${id} .view-title`);
  if (id === 'viewHome') title.textContent = t('appTitle');
  else if (vt) title.textContent = vt.textContent;
  else title.textContent = t('appTitle');
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
  else if (mod === 'fruits') renderFruits();
  else if (mod === 'bodyparts') renderBodyParts();
  else if (mod === 'transport') renderTransport();
  else if (mod === 'daysmonths') renderDaysMonths();
  else if (mod === 'seasons') renderSeasons();
}

// ============================================================
// ALPHABET MODULE
// ============================================================
function renderAlphabet() {
  const d = DATA.alphabet[STORE.alphabetIdx];
  document.getElementById('alphabetLetter').textContent = d.letter;
  document.getElementById('alphabetCase').textContent = d.lower;
  document.getElementById('alphabetWord').textContent = d.urWord || d.word;
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
  const txt = d.letter + ' ' + (d.urWord || d.word);
  AudioSystem.speak(txt);
}

// ============================================================
// NUMBERS MODULE
// ============================================================
function renderNumber() {
  const d = DATA.numbers[STORE.numberIdx];
  document.getElementById('numberDisplay').textContent = d.num;
  document.getElementById('numberWord').textContent = d.urWord || d.word;
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
  const txt = d.urWord || d.word;
  AudioSystem.speak(txt);
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
    const cname = c.urName || c.name;
    card.innerHTML = `<div class="color-swatch" style="background:${c.hex}"></div><div class="color-name">${cname}</div>`;
    card.addEventListener('click', () => { AudioSystem.click(); AudioSystem.speak(cname); });
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
    const sname = s.urName || s.name;
    card.innerHTML = `<div class="shape-svg">${s.svg}</div><div class="shape-name">${sname}</div>`;
    card.addEventListener('click', () => { AudioSystem.click(); AudioSystem.speak(sname); });
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
    const aname = a.urName || a.name;
    const afact = a.urFact || a.fact;
    card.innerHTML = `<img src="assets/images/${imgName}.png" alt="${a.name}" class="animal-img" onerror="this.style.display='none';this.nextElementSibling.style.display='block'" loading="lazy"><div class="animal-emoji" style="display:none">${a.emoji}</div><div class="animal-name">${aname}</div><div class="animal-fact">${afact}</div>`;
    card.addEventListener('click', () => {
      AudioSystem.click();
      AudioSystem.speak(aname + '. ' + afact);
      AudioSystem.playAnimal(imgName);
    });
    grid.appendChild(card);
  });
}

// ============================================================
// FRUITS & VEGETABLES MODULE
// ============================================================
function renderFruits() {
  const grid = document.getElementById('fruitsGrid');
  grid.innerHTML = '';
  DATA.fruits.forEach(f => {
    const card = document.createElement('div');
    card.className = 'fruit-card';
    const fname = f.urName || f.name;
    const ffact = f.urFact || f.fact;
    card.innerHTML = `<div class="fruit-emoji">${f.emoji}</div><div class="fruit-name">${fname}</div><div class="fruit-fact">${ffact}</div>`;
    card.addEventListener('click', () => { AudioSystem.click(); AudioSystem.speak(fname + '. ' + ffact); });
    grid.appendChild(card);
  });
}

// ============================================================
// BODY PARTS MODULE
// ============================================================
function renderBodyParts() {
  const grid = document.getElementById('bodypartsGrid');
  grid.innerHTML = '';
  DATA.bodyParts.forEach(b => {
    const card = document.createElement('div');
    card.className = 'bodypart-card';
    const bname = b.urName || b.name;
    const bfact = b.urFact || b.fact;
    card.innerHTML = `<div class="bodypart-emoji">${b.emoji}</div><div class="bodypart-name">${bname}</div><div class="bodypart-fact">${bfact}</div>`;
    card.addEventListener('click', () => { AudioSystem.click(); AudioSystem.speak(bname + '. ' + bfact); });
    grid.appendChild(card);
  });
}

// ============================================================
// TRANSPORT MODULE
// ============================================================
function renderTransport() {
  const grid = document.getElementById('transportGrid');
  grid.innerHTML = '';
  DATA.transport.forEach(t => {
    const card = document.createElement('div');
    card.className = 'transport-card';
    const tname = t.urName || t.name;
    const tfact = t.urFact || t.fact;
    card.innerHTML = `<div class="transport-emoji">${t.emoji}</div><div class="transport-name">${tname}</div><div class="transport-fact">${tfact}</div>`;
    card.addEventListener('click', () => { AudioSystem.click(); AudioSystem.speak(tname + '. ' + tfact); });
    grid.appendChild(card);
  });
}

// ============================================================
// DAYS & MONTHS MODULE
// ============================================================
let dmTab = 'day';

function showDMTab(type) {
  dmTab = type;
  document.querySelectorAll('.dm-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.dm-tab').forEach(t => {
    if ((type === 'day' && t.getAttribute('data-i18n') === 'days') || (type === 'month' && t.getAttribute('data-i18n') === 'months')) t.classList.add('active');
  });
  renderDaysMonths();
}

function renderDaysMonths() {
  const grid = document.getElementById('daysmonthsGrid');
  grid.innerHTML = '';
  const items = DATA.daysMonths.filter(d => d.type === dmTab);
  items.forEach(d => {
    const card = document.createElement('div');
    card.className = 'daymonth-card';
    const dname = d.urName || d.name;
    const dfact = d.urFact || d.fact;
    card.innerHTML = `<div class="dm-emoji">${d.emoji}</div><div class="dm-name">${dname}</div><div class="dm-short">${d.short}</div><div class="dm-fact">${dfact}</div>`;
    card.addEventListener('click', () => { AudioSystem.click(); AudioSystem.speak(dname + '. ' + dfact); });
    grid.appendChild(card);
  });
}

// ============================================================
// SEASONS & WEATHER MODULE
// ============================================================
function renderSeasons() {
  const grid = document.getElementById('seasonsGrid');
  grid.innerHTML = '';
  DATA.seasons.forEach(s => {
    const card = document.createElement('div');
    card.className = 'season-card';
    const sname = s.urName || s.name;
    const sfact = s.urFact || s.fact;
    card.innerHTML = `<div class="season-emoji">${s.emoji}</div><div class="season-name">${sname}</div><div class="season-fact">${sfact}</div>`;
    card.addEventListener('click', () => { AudioSystem.click(); AudioSystem.speak(sname + '. ' + sfact); });
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
    { id: 'gameLetterMatch', name: t('letterMatching'), image: 'letter-matching', emoji: '\uD83D\uDD20' },
    { id: 'gameNumberMatch', name: t('numberMatching'), image: 'number-matching', emoji: '\uD83D\uDD22' },
    { id: 'gameColorMatch', name: t('colorMatching'), image: 'color-matching', emoji: '\uD83C\uDFA8' },
    { id: 'gameShapeMatch', name: t('shapeMatching'), image: 'shape-matching', emoji: '\u2B1C' },
    { id: 'gameAnimalMatch', name: t('animalMatching'), image: 'animal-matching', emoji: '\uD83D\uDC3E' },
    { id: 'gameBalloonPop', name: t('balloonPop'), image: 'balloon-pop', emoji: '\uD83C\uDF88' },
    { id: 'gameMemory', name: t('memoryCards'), image: 'memory-cards', emoji: '\uD83C\uDFB2' },
    { id: 'gameFindPicture', name: t('findPicture'), image: 'find-picture', emoji: '\uD83D\uDD0D' },
    { id: 'gamePuzzle', name: t('dragDropPuzzle'), image: 'drag-drop', emoji: '\uD83E\uDDE9' },
    { id: 'gameQuiz', name: t('simpleQuiz'), image: 'simple-quiz', emoji: '\u2753' },
    { id: 'gameMathOps', name: t('mathOperations'), image: 'math-ops', emoji: '\u2795' },
    { id: 'gameSpelling', name: t('wordSpelling'), image: 'spelling', emoji: '\uD83D\uDCDD' },
    { id: 'gameTicTacToe', name: t('ticTacToe'), image: 'tictactoe', emoji: '\u274C' },
    { id: 'gameConnectDots', name: t('connectDots'), image: 'connect-dots', emoji: '\uD83D\uDD35' },
    { id: 'gameColoring', name: t('coloringBook'), image: 'coloring', emoji: '\uD83C\uDFA8' },
    { id: 'gameClock', name: t('clockReading'), image: 'clock', emoji: '\u23F0' }
  ];
  games.forEach(g => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `<img src="assets/images/${g.image}.png" alt="" class="game-card-icon-img" onerror="this.outerHTML='<span style=\'font-size:2.5rem\'>${g.emoji}</span>'"><div class="game-card-name">${g.name}</div>`;
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
    gameQuiz: initQuiz,
    gameMathOps: initMathOps,
    gameSpelling: initSpelling,
    gameTicTacToe: initTicTacToe,
    gameConnectDots: initConnectDots,
    gameColoring: initColoring,
    gameClock: initClock
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
        showReward(t('rewardLetterChamp'), t('rewardLetterMsg'), '\uD83D\uDD20', 5);
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
      showReward(t('rewardNumberStar'), t('rewardNumberMsg'), '\uD83D\uDD22', 5);
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
  document.getElementById('cmQuestion').textContent = q.urName || q.name;
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
    const sname = a.urName || a.name;
    btn.innerHTML = `<div style="width:50px;height:50px">${a.svg}</div><div style="font-size:.8rem;margin-top:4px">${sname}</div>`;
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
    btn.textContent = a.urName || a.name;
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
      showReward(t('rewardAnimalExpert'), t('rewardAnimalMsg'), '\uD83D\uDC3E', 5);
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
    showReward(t('rewardBalloonPopper'), t('rewardBalloonMsg'), '\uD83C\uDF88', 5);
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
        showReward(t('rewardMemoryMaster'), t('rewardMemoryMsg'), '\uD83C\uDFB2', 10);
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
  document.getElementById('fpTarget').textContent = q.urName || q.name;
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
      showReward(t('rewardPicturePro'), t('rewardPictureMsg'), '\uD83D\uDC3E', 5);
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
          showReward(t('rewardPuzzleMaster'), t('rewardPuzzleMsg'), '\uD83E\uDDE9', 10);
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
    showReward(t('rewardQuizChamp'), t('rewardQuizMsg').replace('{0}', quizState.score).replace('{1}', quizState.total), '\uD83C\uDF1F', 10);
    quizState.score = 0;
    quizState.total = 0;
    quizState.current = 0;
    document.getElementById('quizScore').textContent = '0';
    document.getElementById('quizTotal').textContent = '0';
    return;
  }
  const q = quizState.questions[quizState.current];
  document.getElementById('quizQuestion').textContent = currentLang === 'ur' && q.urQ ? q.urQ : q.q;
  const options = document.getElementById('quizOptions');
  options.innerHTML = '';
  const opts = currentLang === 'ur' && q.urOptions ? q.urOptions : q.options;
  opts.forEach((opt, i) => {
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

// === MATH OPERATIONS GAME ===
let mathState = { score: 0 };

function initMathOps() {
  mathState.score = 0;
  document.getElementById('mathScore').textContent = '0';
  nextMathRound();
}

function nextMathRound() {
  const ops = ['+', '-'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a = Math.floor(Math.random() * 20) + 1;
  let b = Math.floor(Math.random() * 20) + 1;
  let answer;
  if (op === '+') { answer = a + b; }
  else { if (a < b) [a, b] = [b, a]; answer = a - b; }
  document.getElementById('mathQuestion').textContent = `What is ${a} ${op} ${b}?`;
  const options = document.getElementById('mathOptions');
  options.innerHTML = '';
  let answers = [answer];
  while (answers.length < 4) {
    const r = answer + Math.floor(Math.random() * 10) - 5;
    if (!answers.includes(r) && r >= 0) answers.push(r);
  }
  answers = answers.sort(() => Math.random() - 0.5);
  answers.forEach(a2 => {
    const btn = document.createElement('div');
    btn.className = 'game-option';
    btn.textContent = a2;
    btn.dataset.correct = (a2 === answer) ? 'true' : 'false';
    btn.addEventListener('click', () => handleMathChoice(btn));
    options.appendChild(btn);
  });
}

function handleMathChoice(el) {
  if (el.classList.contains('correct') || el.classList.contains('wrong')) return;
  if (el.dataset.correct === 'true') {
    el.classList.add('correct');
    AudioSystem.correct();
    mathState.score++;
    document.getElementById('mathScore').textContent = mathState.score;
    STORE.addStars(1);
    STORE.addCoins(1);
    STORE.markGameDone();
    STORE.checkAchievements();
    if (mathState.score >= 10) {
      showReward(t('rewardMathGenius'), t('rewardMathMsg'), '\uD83E\uDDEE', 5);
      mathState.score = 0;
      document.getElementById('mathScore').textContent = '0';
    }
    setTimeout(nextMathRound, 600);
  } else {
    el.classList.add('wrong');
    AudioSystem.wrong();
    setTimeout(() => el.classList.remove('wrong'), 400);
  }
}

// === WORD SPELLING GAME ===
let spellState = { score: 0, current: 0, questions: [] };

function initSpelling() {
  spellState = { score: 0, current: 0, questions: [] };
  document.getElementById('spellingScore').textContent = '0';
  spellState.questions = [...DATA.fruits, ...DATA.animals].sort(() => Math.random() - 0.5).slice(0, 10);
  nextSpellRound();
}

function nextSpellRound() {
  if (spellState.current >= spellState.questions.length) {
    showReward(t('rewardSpellingStar'), t('rewardSpellingMsg'), '\uD83D\uDCDD', 5);
    spellState.current = 0;
    document.getElementById('spellingScore').textContent = '0';
    return;
  }
  const q = spellState.questions[spellState.current];
  document.getElementById('spellingTarget').textContent = t('spellTheWord') + ' ' + q.name;
  document.getElementById('spellingEmoji').textContent = q.emoji;
  const slots = document.getElementById('spellingSlots');
  slots.innerHTML = '';
  const word = q.name.toUpperCase();
  for (let i = 0; i < word.length; i++) {
    const slot = document.createElement('div');
    slot.className = 'spell-slot';
    slot.dataset.idx = i;
    slot.dataset.filled = 'false';
    slots.appendChild(slot);
  }
  const buttons = document.getElementById('spellingButtons');
  buttons.innerHTML = '';
  const letters = word.split('').sort(() => Math.random() - 0.5);
  letters.forEach(l => {
    const btn = document.createElement('div');
    btn.className = 'spell-btn';
    btn.textContent = l;
    btn.addEventListener('click', () => handleSpellClick(btn, word));
    buttons.appendChild(btn);
  });
  slots.dataset.word = word;
  slots.dataset.pos = '0';
}

function handleSpellClick(el, word) {
  if (el.classList.contains('used')) return;
  const slots = document.getElementById('spellingSlots');
  const pos = parseInt(slots.dataset.pos);
  if (pos >= word.length) return;
  el.classList.add('used');
  const slot = slots.children[pos];
  slot.textContent = el.textContent;
  slot.dataset.filled = 'true';
  slots.dataset.pos = (pos + 1).toString();
  AudioSystem.click();
  if (pos + 1 === word.length) {
    setTimeout(() => {
      AudioSystem.correct();
      spellState.score++;
      document.getElementById('spellingScore').textContent = spellState.score;
      spellState.current++;
      STORE.addStars(1);
      STORE.addCoins(1);
      STORE.markGameDone();
      STORE.checkAchievements();
      setTimeout(nextSpellRound, 600);
    }, 300);
  }
}

// === TIC TAC TOE GAME ===
let tttState = { board: [], turn: 'X', wins: 0, losses: 0, gameOver: false };

function initTicTacToe() {
  tttState.board = Array(9).fill('');
  tttState.turn = 'X';
  tttState.gameOver = false;
  document.getElementById('tttStatus').textContent = t('tttYourTurn');
  const saved = JSON.parse(localStorage.getItem('klg_ttt')) || { wins: 0, losses: 0 };
  tttState.wins = saved.wins;
  tttState.losses = saved.losses;
  document.getElementById('tttWins').textContent = tttState.wins;
  document.getElementById('tttLosses').textContent = tttState.losses;
  const board = document.getElementById('tttBoard');
  board.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'ttt-cell';
    cell.dataset.idx = i;
    cell.addEventListener('click', () => handleTttMove(i));
    board.appendChild(cell);
  }
}

function handleTttMove(idx) {
  if (tttState.gameOver || tttState.turn !== 'X' || tttState.board[idx]) return;
  tttState.board[idx] = 'X';
  document.querySelectorAll('.ttt-cell')[idx].textContent = 'X';
  AudioSystem.click();
  if (checkTttWin('X')) {
    tttState.wins++;
    document.getElementById('tttWins').textContent = tttState.wins;
    localStorage.setItem('klg_ttt', JSON.stringify({ wins: tttState.wins, losses: tttState.losses }));
    document.getElementById('tttStatus').textContent = t('youWin');
    tttState.gameOver = true;
    showReward(t('rewardTTTChamp'), t('rewardTTTMsg'), '\uD83C\uDFC6', 3);
    STORE.addStars(3);
    STORE.addCoins(3);
    STORE.markGameDone();
    STORE.checkAchievements();
    return;
  }
  if (tttState.board.every(c => c)) {
    document.getElementById('tttStatus').textContent = t('itsADraw');
    tttState.gameOver = true;
    return;
  }
  tttState.turn = 'O';
  document.getElementById('tttStatus').textContent = t('computerThinking');
  setTimeout(computerMove, 500);
}

function computerMove() {
  if (tttState.gameOver) return;
  let empty = tttState.board.map((v, i) => v ? -1 : i).filter(v => v >= 0);
  if (empty.length === 0) return;
  const idx = empty[Math.floor(Math.random() * empty.length)];
  tttState.board[idx] = 'O';
  document.querySelectorAll('.ttt-cell')[idx].textContent = 'O';
  AudioSystem.click();
  if (checkTttWin('O')) {
    tttState.losses++;
    document.getElementById('tttLosses').textContent = tttState.losses;
    localStorage.setItem('klg_ttt', JSON.stringify({ wins: tttState.wins, losses: tttState.losses }));
    document.getElementById('tttStatus').textContent = t('computerWins');
    tttState.gameOver = true;
    return;
  }
  if (tttState.board.every(c => c)) {
    document.getElementById('tttStatus').textContent = t('itsADraw');
    tttState.gameOver = true;
    return;
  }
  tttState.turn = 'X';
  document.getElementById('tttStatus').textContent = t('tttYourTurn');
}

function checkTttWin(player) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return wins.some(w => w.every(i => tttState.board[i] === player));
}

// === CONNECT THE DOTS GAME ===
let cdState = { points: [], current: 0, score: 0 };

function initConnectDots() {
  cdState = { points: [], current: 0, score: 0 };
  document.getElementById('cdScore').textContent = '0';
  const canvas = document.getElementById('connectCanvas');
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const numPoints = 8;
  cdState.points = [];
  for (let i = 0; i < numPoints; i++) {
    cdState.points.push({
      x: 30 + Math.random() * (w - 60),
      y: 30 + Math.random() * (h - 60),
      num: i + 1,
      connected: false
    });
  }
  cdState.points.sort((a, b) => a.num - b.num);
  drawConnectDots(ctx, w, h);
  canvas.onclick = (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = w / rect.width;
    const scaleY = h / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    const p = cdState.points[cdState.current];
    const dist = Math.sqrt((mx - p.x) ** 2 + (my - p.y) ** 2);
    if (dist < 25) {
      p.connected = true;
      cdState.current++;
      cdState.score++;
      document.getElementById('cdScore').textContent = cdState.score;
      AudioSystem.click();
      drawConnectDots(ctx, w, h);
      if (cdState.current >= cdState.points.length) {
        showReward(t('rewardDotConnector'), t('rewardDotMsg'), '\uD83D\uDD35', 5);
        STORE.addStars(3);
        STORE.addCoins(3);
        STORE.markGameDone();
        STORE.checkAchievements();
      }
    } else {
      AudioSystem.wrong();
    }
  };
}

function drawConnectDots(ctx, w, h) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#f0f4ff';
  ctx.fillRect(0, 0, w, h);
  let last = null;
  cdState.points.forEach((p, i) => {
    if (p.connected) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#00b894';
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.num, p.x, p.y);
      if (last) {
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = '#00b894';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      last = p;
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = i === cdState.current ? '#6c5ce7' : '#dfe6e9';
      ctx.fill();
      ctx.strokeStyle = '#6c5ce7';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = i === cdState.current ? '#fff' : '#888';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.num, p.x, p.y);
    }
  });
}

// === COLORING BOOK GAME ===
let coloringState = { color: '#e74c3c', drawing: false, ctx: null };

function initColoring() {
  const canvas = document.getElementById('coloringCanvas');
  coloringState.ctx = canvas.getContext('2d');
  const ctx = coloringState.ctx;
  const w = canvas.width, h = canvas.height;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#dfe6e9';
  ctx.lineWidth = 1;
  for (let x = 0; x <= w; x += 20) {
    ctx.beginPath();
    ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y <= h; y += 20) {
    ctx.beginPath();
    ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
  const picker = document.getElementById('colorPicker');
  picker.innerHTML = '';
  const colors = ['#e74c3c','#3498db','#2ecc71','#f1c40f','#e67e22','#9b59b6','#1abc9c','#e84393','#2d3436','#fd79a8','#00cec9','#fdcb6e'];
  colors.forEach(c => {
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch-btn';
    swatch.style.background = c;
    swatch.addEventListener('click', () => { coloringState.color = c; AudioSystem.click(); });
    picker.appendChild(swatch);
  });
  canvas.onmousedown = () => { coloringState.drawing = true; };
  canvas.onmouseup = () => { coloringState.drawing = false; };
  canvas.onmouseout = () => { coloringState.drawing = false; };
  canvas.onmousemove = (e) => {
    if (!coloringState.drawing) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = w / rect.width;
    const scaleY = h / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX / 20) * 20;
    const y = Math.floor((e.clientY - rect.top) * scaleY / 20) * 20;
    ctx.fillStyle = coloringState.color;
    ctx.fillRect(x, y, 20, 20);
  };
  canvas.ontouchstart = (e) => { e.preventDefault(); coloringState.drawing = true; };
  canvas.ontouchend = () => { coloringState.drawing = false; };
  canvas.ontouchmove = (e) => {
    e.preventDefault();
    if (!coloringState.drawing) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = w / rect.width;
    const scaleY = h / rect.height;
    const touch = e.touches[0];
    const x = Math.floor((touch.clientX - rect.left) * scaleX / 20) * 20;
    const y = Math.floor((touch.clientY - rect.top) * scaleY / 20) * 20;
    ctx.fillStyle = coloringState.color;
    ctx.fillRect(x, y, 20, 20);
  };
}

function clearColoring() {
  const canvas = document.getElementById('coloringCanvas');
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  AudioSystem.click();
}

function saveColoring() {
  const canvas = document.getElementById('coloringCanvas');
  const link = document.createElement('a');
  link.download = 'my-artwork.png';
  link.href = canvas.toDataURL();
  link.click();
  AudioSystem.correct();
  STORE.addStars(1);
  STORE.addCoins(1);
  STORE.markGameDone();
  STORE.checkAchievements();
}

// === CLOCK READING GAME ===
let clockState = { score: 0, currentHour: 0, currentMin: 0 };

function initClock() {
  clockState.score = 0;
  document.getElementById('clockScore').textContent = '0';
  nextClockRound();
}

function nextClockRound() {
  const h = Math.floor(Math.random() * 12) + 1;
  const m = Math.floor(Math.random() * 4) * 15;
  clockState.currentHour = h;
  clockState.currentMin = m;
  drawClock(h, m);
  const options = document.getElementById('clockOptions');
  options.innerHTML = '';
  const times = [];
  const correct = `${h}:${m === 0 ? '00' : m}`;
  times.push(correct);
  const pool = [];
  for (let i = 1; i <= 12; i++) {
    for (let j = 0; j < 60; j += 15) {
      const t = `${i}:${j === 0 ? '00' : j}`;
      if (t !== correct) pool.push(t);
    }
  }
  while (times.length < 4) {
    const r = pool[Math.floor(Math.random() * pool.length)];
    if (!times.includes(r)) times.push(r);
  }
  times.sort(() => Math.random() - 0.5);
  times.forEach(t => {
    const btn = document.createElement('div');
    btn.className = 'game-option';
    btn.textContent = t;
    btn.dataset.correct = (t === correct) ? 'true' : 'false';
    btn.addEventListener('click', () => handleClockChoice(btn));
    options.appendChild(btn);
  });
}

function drawClock(h, m) {
  const canvas = document.getElementById('clockCanvas');
  const ctx = canvas.getContext('2d');
  const cx = 125, cy = 125, r = 110;
  ctx.clearRect(0, 0, 250, 250);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.strokeStyle = '#6c5ce7';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = '#333';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 1; i <= 12; i++) {
    const angle = (i * 30 - 90) * Math.PI / 180;
    const x = cx + (r - 20) * Math.cos(angle);
    const y = cy + (r - 20) * Math.sin(angle);
    ctx.fillText(i, x, y);
  }
  const hAngle = ((h % 12) * 30 + m * 0.5 - 90) * Math.PI / 180;
  const mAngle = (m * 6 - 90) * Math.PI / 180;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + 50 * Math.cos(hAngle), cy + 50 * Math.sin(hAngle));
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + 70 * Math.cos(mAngle), cy + 70 * Math.sin(mAngle));
  ctx.strokeStyle = '#e74c3c';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, 5, 0, Math.PI * 2);
  ctx.fillStyle = '#6c5ce7';
  ctx.fill();
}

function handleClockChoice(el) {
  if (el.classList.contains('correct') || el.classList.contains('wrong')) return;
  if (el.dataset.correct === 'true') {
    el.classList.add('correct');
    AudioSystem.correct();
    clockState.score++;
    document.getElementById('clockScore').textContent = clockState.score;
    STORE.addStars(1);
    STORE.addCoins(1);
    STORE.markGameDone();
    STORE.checkAchievements();
    if (clockState.score >= 10) {
      showReward(t('rewardTimeKeeper'), t('rewardTimeMsg'), '\u23F0', 5);
      clockState.score = 0;
      document.getElementById('clockScore').textContent = '0';
    }
    setTimeout(nextClockRound, 600);
  } else {
    el.classList.add('wrong');
    AudioSystem.wrong();
    setTimeout(() => el.classList.remove('wrong'), 400);
  }
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
    document.getElementById('darkModeToggle').checked = d.darkMode === true;
    if (d.darkMode) document.body.classList.add('dark-mode');
    if (d.language) {
      currentLang = d.language;
      document.getElementById('languageSelect').value = d.language;
      AudioSystem.ttsLang = d.language === 'ur' ? 'ur-PK' : 'en-US';
      applyLanguage();
    }
  } catch {}
}

function saveSettings() {
  const settings = {
    music: document.getElementById('musicToggle').checked,
    sfx: document.getElementById('sfxToggle').checked,
    difficulty: document.getElementById('difficultySelect').value,
    darkMode: document.getElementById('darkModeToggle').checked,
    language: currentLang
  };
  try { localStorage.setItem('klg_settings', JSON.stringify(settings)); } catch {}
  AudioSystem.musicEnabled = settings.music;
  AudioSystem.sfxEnabled = settings.sfx;
  if (settings.music) AudioSystem.startMusic();
  else AudioSystem.stopMusic();
  AudioSystem.click();
}

function toggleDarkMode() {
  const enabled = document.getElementById('darkModeToggle').checked;
  document.body.classList.toggle('dark-mode', enabled);
  saveSettings();
  AudioSystem.click();
}

function toggleMute() {
  const icon = document.getElementById('muteIcon');
  if (AudioSystem.sfxEnabled) {
    AudioSystem.sfxEnabled = false;
    AudioSystem.musicEnabled = false;
    AudioSystem.stopMusic();
    icon.src = 'assets/icons/mute.svg';
  } else {
    AudioSystem.sfxEnabled = true;
    AudioSystem.musicEnabled = true;
    icon.src = 'assets/icons/sound-on.svg';
    AudioSystem.click();
    AudioSystem.startMusic();
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
  if (confirm(t('resetConfirm'))) {
    try { localStorage.removeItem('klg_progress'); } catch {}
    STORE.init();
    renderProgress();
    AudioSystem.click();
  }
}

// ============================================================
// FIRST INTERACTION - wake up AudioContext
// ============================================================
function onFirstInteraction() {
  AudioSystem.ensureCtx();
  AudioSystem.startMusic();
  try {
    AudioSystem.playTone(440, 0.05, 'sine', 0.01);
  } catch {}
  document.removeEventListener('click', onFirstInteraction);
  document.removeEventListener('touchstart', onFirstInteraction);
  document.removeEventListener('keydown', onFirstInteraction);
}
document.addEventListener('click', onFirstInteraction);
document.addEventListener('touchstart', onFirstInteraction);
document.addEventListener('keydown', onFirstInteraction);

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
      if (d.darkMode) document.body.classList.add('dark-mode');
      if (d.language) {
        currentLang = d.language;
        AudioSystem.ttsLang = d.language === 'ur' ? 'ur-PK' : 'en-US';
      }
    }
  } catch {}

  applyLanguage();
  renderModules();
}

document.addEventListener('DOMContentLoaded', initApp);
