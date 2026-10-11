/* =========================================================
   GIRLS' DAY SURPRISE — script.js

   1. Your settings (names + messages)  <-- edit this part
   2. Small helpers
   3. Page elements
   4. Background effects (stars, hearts, flowers)
   5. Confetti
   6. Title and message steps
   7. Music (made in the browser, no audio file needed)
   8. Opening the gift
   9. Start
   ========================================================= */

"use strict";


/* ---------- 1. YOUR SETTINGS ---------- */

// Optional names. You can also put them in the link, so you never touch the code:
//   https://your-site.com/?to=Sara&from=Ali
const SETTINGS = {
  recipientName: "", // example: "Sara"  -> shows "For Sara" above the title
  senderName: ""     // example: "Ali"   -> adds "With love, Ali" at the end
};

// The messages shown one by one. Change the words to make them yours.
const MESSAGES = [
  "Today is for you: for the girl who makes every room softer, brighter, and more beautiful just by being in it. 🌷",
  "Your beauty is more than how you look. It lives in your kindness, and in the quiet way you care for people without ever asking for thanks. 💗",
  "You are stronger than you realize. You have carried hard days with grace, and you still keep going. That is a strength the world needs. ✨",
  "Your dreams matter, every one of them. Keep chasing them, even when the road is slow. You were made to bloom in your own time. 🌸",
  "There is no one else like you: your laugh, your heart, the way you see the world. You are completely, wonderfully unique. 🦋"
];

const FINAL_MESSAGE =
  "Thank you for being exactly who you are. You are loved, you are appreciated, and you are so very special. Happy Girls’ Day. 💖";

const TITLE_TEXT = "Happy Girls’ Day! 🌸💖";


/* ---------- 2. SMALL HELPERS ---------- */
const $ = (id) => document.getElementById(id);
const rand = (min, max) => Math.random() * (max - min) + min;
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// If the device asks for less motion, we skip hearts and confetti.
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Read names from the link (?to=...&from=...), fall back to SETTINGS.
const params = new URLSearchParams(window.location.search);
const recipient = (params.get("to") || SETTINGS.recipientName).trim().slice(0, 40);
const sender = (params.get("from") || SETTINGS.senderName).trim().slice(0, 40);


/* ---------- 3. PAGE ELEMENTS ---------- */
const welcome = $("welcome");
const celebration = $("celebration");
const revealBg = $("revealBg");
const gift = $("gift");
const giftStage = $("giftStage");
const openBtn = $("openBtn");
const nextBtn = $("nextBtn");
const againBtn = $("againBtn");
const musicBtn = $("musicBtn");
const starsLayer = $("stars");
const heartsLayer = $("hearts");
const garden = $("garden");
const mainTitle = $("mainTitle");
const forLine = $("forLine");
const messageStage = $("messageStage");
const messageEl = $("message");
const dotsEl = $("dots");


/* ---------- 4. BACKGROUND EFFECTS ---------- */

// Twinkling stars
function buildStars() {
  for (let i = 0; i < 48; i++) {
    const star = document.createElement("span");
    const size = rand(6, 16);
    star.className = "star";
    star.style.cssText =
      `left:${rand(0, 100)}%; top:${rand(0, 100)}%; width:${size}px; height:${size}px;` +
      `--d:${rand(2.2, 5)}s; animation-delay:-${rand(0, 5)}s;`;
    starsLayer.appendChild(star);
  }
}

// Floating hearts (and a few tiny flowers)
const HEART_COLORS_SOFT = ["#ff6fa5", "#ff9ac4", "#e0307f", "#b565d9", "#c9a2ff"];
const HEART_COLORS_BRIGHT = ["#ffffff", "#ffd1e6", "#f1e3ff", "#ff9ac4", "#ffe8a3"];
let heartTimer = null;

function spawnHeart() {
  if (reduceMotion || document.hidden) return;

  const celebrating = document.body.classList.contains("celebrating");
  const heart = document.createElement("span");
  heart.className = "heart";
  heart.textContent = Math.random() < 0.8 ? "♥" : "✿";
  heart.style.left = rand(0, 100) + "%";
  heart.style.fontSize = rand(14, 36) + "px";
  heart.style.color = pick(celebrating ? HEART_COLORS_BRIGHT : HEART_COLORS_SOFT);
  heart.style.setProperty("--dur", rand(7, 13) + "s");
  heart.style.setProperty("--drift", rand(-60, 60) + "px");
  heart.style.setProperty("--o", rand(0.35, 0.8));
  heart.addEventListener("animationend", () => heart.remove());
  heartsLayer.appendChild(heart);
}

function startHearts() {
  clearInterval(heartTimer);
  const celebrating = document.body.classList.contains("celebrating");
  heartTimer = setInterval(spawnHeart, celebrating ? 300 : 850);
}

// Flowers that grow along the bottom of the celebration screen
const FLOWER_COLORS = [
  ["#ffffff", "#ffe3f1"],
  ["#ffd1e6", "#ff9ac4"],
  ["#f1e3ff", "#c9a2ff"],
  ["#ffffff", "#e6d2ff"]
];
const FLOWER_HEIGHTS = [120, 170, 140, 190, 130, 160, 110, 180, 125];

function buildGarden() {
  const count = FLOWER_HEIGHTS.length;

  FLOWER_HEIGHTS.forEach((height, i) => {
    const [c1, c2] = FLOWER_COLORS[i % FLOWER_COLORS.length];
    const flower = document.createElement("div");
    flower.className = "flower";
    flower.style.setProperty("--x", 6 + (i * 88) / (count - 1) + rand(-2, 2) + "%");
    flower.style.setProperty("--h", height + "px");
    flower.style.setProperty("--delay", i * 0.18 + "s");
    flower.style.setProperty("--sw", rand(3.5, 6) + "s");

    let petals = "";
    for (let p = 0; p < 8; p++) {
      petals += `<span class="petal" style="--r:${p * 45}deg; --c1:${c1}; --c2:${c2};"></span>`;
    }
    flower.innerHTML = `<div class="stem"></div><div class="bloom">${petals}<span class="core"></span></div>`;
    garden.appendChild(flower);
  });
}


/* ---------- 5. CONFETTI (hearts, flowers and sparkles on a canvas) ---------- */
const canvas = $("confetti");
const pen = canvas.getContext("2d");
const SHAPES = ["♥", "♥", "✿", "✦", "●"];
const CONFETTI_COLORS = ["#ff6fa5", "#ff9ac4", "#e0307f", "#b565d9", "#8f43d6", "#ffd86b", "#ffffff"];
let pieces = [];
let confettiRunning = false;
let pixelRatio = 1;

function resizeCanvas() {
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(window.innerWidth * pixelRatio);
  canvas.height = Math.round(window.innerHeight * pixelRatio);
}

function addPiece(x, y, vx, vy) {
  pieces.push({
    x, y, vx, vy,
    size: rand(12, 28),
    char: pick(SHAPES),
    color: pick(CONFETTI_COLORS),
    rotation: rand(0, Math.PI * 2),
    spin: rand(-0.15, 0.15),
    age: 0,
    life: rand(110, 190)
  });
}

// An explosion from one point
function confettiBurst(x, y, count) {
  if (reduceMotion) return;
  for (let i = 0; i < count; i++) {
    const angle = rand(0, Math.PI * 2);
    const speed = rand(3, 13);
    addPiece(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed - 4);
  }
  startConfetti();
}

// A shower from the top of the screen
function confettiRain(count) {
  if (reduceMotion) return;
  for (let i = 0; i < count; i++) {
    addPiece(rand(0, window.innerWidth), rand(-window.innerHeight * 0.5, -20), rand(-1, 1), rand(2, 5));
  }
  startConfetti();
}

function startConfetti() {
  if (confettiRunning) return;
  confettiRunning = true;
  requestAnimationFrame(drawConfetti);
}

function drawConfetti() {
  pen.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  pen.clearRect(0, 0, window.innerWidth, window.innerHeight);

  pieces = pieces.filter((p) => p.age < p.life && p.y < window.innerHeight + 40);

  for (const p of pieces) {
    p.vy += 0.16;      // gravity
    p.vx *= 0.992;     // air drag
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.spin;
    p.age++;

    pen.save();
    pen.translate(p.x, p.y);
    pen.rotate(p.rotation);
    pen.globalAlpha = Math.max(0, Math.min(1, (p.life - p.age) / 40));
    pen.fillStyle = p.color;
    pen.font = `${p.size}px serif`;
    pen.textAlign = "center";
    pen.textBaseline = "middle";
    pen.fillText(p.char, 0, 0);
    pen.restore();
  }

  if (pieces.length > 0) {
    requestAnimationFrame(drawConfetti);
  } else {
    confettiRunning = false;
    pen.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
}


/* ---------- 6. TITLE AND MESSAGE STEPS ---------- */

// Split the title into words and letters so each letter can pop in
function buildTitle() {
  let index = 0;
  TITLE_TEXT.split(" ").forEach((word) => {
    const wordEl = document.createElement("span");
    wordEl.className = "word";
    wordEl.setAttribute("aria-hidden", "true");
    Array.from(word).forEach((char) => {
      const letter = document.createElement("span");
      letter.className = "letter";
      letter.style.setProperty("--i", index++);
      letter.textContent = char;
      wordEl.appendChild(letter);
    });
    mainTitle.appendChild(wordEl);
  });
  mainTitle.setAttribute("aria-label", TITLE_TEXT);
}

// All the steps: the 5 messages, then the final one
const STEPS = [...MESSAGES, FINAL_MESSAGE];
let currentStep = 0;

function buildDots() {
  STEPS.forEach(() => {
    const dot = document.createElement("span");
    dot.className = "dot";
    dotsEl.appendChild(dot);
  });
}

function updateDots() {
  Array.from(dotsEl.children).forEach((dot, i) => {
    dot.classList.toggle("active", i === currentStep);
  });
}

// Put the words of a message on screen, one after another
function renderMessage(text, isFinal) {
  messageEl.innerHTML = "";
  const words = text.split(" ");

  words.forEach((word, i) => {
    const span = document.createElement("span");
    span.className = "w";
    span.style.setProperty("--i", i);
    span.textContent = word;
    messageEl.appendChild(span);
    messageEl.appendChild(document.createTextNode(" "));
  });

  if (isFinal && sender) {
    const sign = document.createElement("span");
    sign.className = "signoff";
    sign.style.setProperty("--i", words.length);
    sign.textContent = `With love, ${sender} 💗`;
    messageEl.appendChild(sign);
  }

  return words.length;
}

function showButton(button) {
  nextBtn.hidden = true;
  againBtn.hidden = true;
  nextBtn.classList.remove("visible");
  againBtn.classList.remove("visible");

  button.hidden = false;
  setTimeout(() => button.classList.add("visible"), 30);
}

async function showStep(step) {
  currentStep = step;
  const isFinal = step === STEPS.length - 1;

  // Hide the buttons right away (so a double tap cannot skip a message)
  nextBtn.hidden = true;
  againBtn.hidden = true;
  nextBtn.classList.remove("visible");
  againBtn.classList.remove("visible");
  messageStage.classList.remove("show");
  await wait(step === 0 ? 50 : 500);

  // Show the new message
  messageStage.classList.toggle("final", isFinal);
  const wordCount = renderMessage(STEPS[step], isFinal);
  updateDots();
  messageStage.classList.add("show");

  // A second burst of joy on the last message
  if (isFinal) {
    confettiRain(90);
    confettiBurst(window.innerWidth / 2, window.innerHeight * 0.75, 70);
  }

  // Wait until the last word has appeared, then show the right button
  await wait(wordCount * 70 + 900);

  if (isFinal) {
    showButton(againBtn);
  } else {
    nextBtn.textContent = step === STEPS.length - 2 ? "One last thing 💝" : "Keep going 💌";
    showButton(nextBtn);
  }
}


/* ---------- 7. MUSIC ---------- */
// A soft music-box melody, created with the Web Audio API.
// No audio file, no copyright, no download.
const Music = (() => {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const CHORDS = [
    { bass: 130.81, notes: [261.63, 329.63, 392.0, 523.25], melody: [659.25, 783.99] },  // C
    { bass: 110.0,  notes: [220.0, 261.63, 329.63, 440.0],  melody: [659.25, 523.25] },  // Am
    { bass: 87.31,  notes: [220.0, 261.63, 349.23, 440.0],  melody: [523.25, 440.0] },   // F
    { bass: 98.0,   notes: [246.94, 293.66, 392.0, 493.88], melody: [493.88, 587.33] }   // G
  ];
  const PATTERN = [0, 1, 2, 3, 2, 1, 2, 3];

  let audio = null;
  let master = null;
  let timer = null;
  let tick = 0;
  let playing = false;

  // One soft bell-like note
  function note(freq, when, duration, volume) {
    const envelope = audio.createGain();
    envelope.gain.setValueAtTime(0.0001, when);
    envelope.gain.exponentialRampToValueAtTime(volume, when + 0.015);
    envelope.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    envelope.connect(master);

    [[1, 1], [2, 0.25]].forEach(([multiplier, level]) => {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = "sine";
      osc.frequency.value = freq * multiplier;
      gain.gain.value = level;
      osc.connect(gain);
      gain.connect(envelope);
      osc.start(when);
      osc.stop(when + duration + 0.1);
    });
  }

  function step() {
    const when = audio.currentTime + 0.05;
    const chord = CHORDS[Math.floor(tick / 8) % CHORDS.length];
    const position = tick % 8;

    note(chord.notes[PATTERN[position]], when, 1.8, 0.1);
    if (position === 0) note(chord.bass, when, 3.2, 0.14);
    if (position === 0 || position === 4) note(chord.melody[position / 4], when, 2.4, 0.07);
    tick++;
  }

  function start() {
    if (!audio) {
      audio = new AudioCtx();
      master = audio.createGain();
      master.gain.value = 0;
      master.connect(audio.destination);
    }
    audio.resume();
    master.gain.cancelScheduledValues(audio.currentTime);
    master.gain.setTargetAtTime(0.9, audio.currentTime, 0.4); // gentle fade in
    if (!timer) {
      step();
      timer = setInterval(step, 420);
    }
    playing = true;
  }

  function stop() {
    if (!audio) return;
    master.gain.cancelScheduledValues(audio.currentTime);
    master.gain.setTargetAtTime(0, audio.currentTime, 0.25); // gentle fade out
    clearInterval(timer);
    timer = null;
    playing = false;
  }

  return {
    supported: Boolean(AudioCtx),
    toggle() {
      if (playing) stop(); else start();
      return playing;
    }
  };
})();

function toggleMusic() {
  const isPlaying = Music.toggle();
  musicBtn.textContent = isPlaying ? "⏸ Pause music" : "🎵 Play music";
  musicBtn.setAttribute("aria-pressed", String(isPlaying));
  musicBtn.classList.remove("invite");
}


/* ---------- 8. OPENING THE GIFT ---------- */
let opened = false;

async function openGift() {
  if (opened) return;
  opened = true;
  openBtn.disabled = true;

  // Step 1: the gift shakes, the lid pops off, light bursts out
  welcome.classList.add("opening");
  await wait(750);

  // Step 2: confetti explodes from the box
  const box = gift.getBoundingClientRect();
  const x = box.left + box.width / 2;
  const y = box.top + box.height * 0.4;
  confettiBurst(x, y, 120);
  await wait(700);

  // Step 3: the pink-purple celebration grows out of the gift
  revealBg.style.setProperty("--cx", x + "px");
  revealBg.style.setProperty("--cy", y + "px");
  revealBg.classList.add("open");
  celebration.classList.remove("hidden");
  welcome.classList.add("leaving");
  document.body.classList.add("celebrating");
  startHearts(); // more hearts now
  await wait(1200);

  // Step 4: the title appears, flowers bloom, music button shows up
  welcome.classList.add("hidden");
  celebration.classList.add("play");
  if (Music.supported) {
    musicBtn.hidden = false;
    musicBtn.classList.add("invite");
  }
  confettiRain(40);
  await wait(3000);

  // Step 5: the first message
  showStep(0);
}


/* ---------- 9. START ---------- */
function init() {
  if (recipient) forLine.textContent = `For ${recipient}`;

  buildStars();
  buildGarden();
  buildTitle();
  buildDots();
  resizeCanvas();
  startHearts();

  window.addEventListener("resize", resizeCanvas);
  openBtn.addEventListener("click", openGift);
  giftStage.addEventListener("click", openGift);
  nextBtn.addEventListener("click", () => showStep(currentStep + 1));
  againBtn.addEventListener("click", () => showStep(0));
  musicBtn.addEventListener("click", toggleMusic);
}

init();
