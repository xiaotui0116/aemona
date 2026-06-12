const BASE_W = 768;
const BASE_H = 1098;
const COLS0 = 8;
const ROWS0 = 9;
const DIAM0 = 50;
const GAP0 = 20;

const BG_CENTER = '#ffffff';
const BG_EDGE = '#F9F7F3';
const PRESSURE_RATE = 0.9;
const POP_THRESHOLD = 1.0;
const HOVER_DENT = 0.08;

const INFLATED = 0;
const POPPED = 2;

let COLS, ROWS;
let DIAM, GAP, STROKE_W, SCALE;
let step, blockW, blockH, ox, oy;
let bubbles = [];
let lastTime = 0;
let popSounds = [];
let soundIndex = 0;

function playPopSound() {
  if (popSounds.length === 0) return;
  const sound = popSounds[soundIndex];
  sound.currentTime = 0;
  sound.play().catch(() => {});
  soundIndex++;
  if (soundIndex >= popSounds.length) {
    soundIndex = 0;
  }
}

function setup() {

  popSounds = [
    new Audio('assets/audio1.mp3'),
    new Audio('assets/audio2.mp3'),
    new Audio('assets/audio3.mp3'),
    new Audio('assets/audio4.mp3'),
    new Audio('assets/audio5.mp3')
  ];
  popSounds.forEach(sound => {
    sound.preload = 'auto';
    sound.volume = 0.55;
  });

  createCanvas(430, 700).parent('canvas-wrapper');

  COLS = COLS0;
  ROWS = ROWS0;

  initGrid();

  lastTime = millis() / 1000;
}

function windowResized() {

  resizeCanvas(430, 700);

  updateLayoutParams();

}

function initGrid() {
  bubbles = [];
  updateLayoutParams();
  for (let j = 0; j < ROWS; j++) {
    for (let i = 0; i < COLS; i++) {
      let x = ox + i * step + DIAM * 0.5;
      let y = oy + j * step + DIAM * 0.5;
      bubbles.push(new Bubble(x, y, DIAM * 0.5));
    }
  }
}

function updateLayoutParams() {

  SCALE = min(width / BASE_W, height / BASE_H);

  DIAM = DIAM0 * SCALE;
  GAP = GAP0 * SCALE;
  STROKE_W = 3 * SCALE;

  step = DIAM + GAP;

  blockW = (COLS - 1) * step + DIAM;
  blockH = (ROWS - 1) * step + DIAM;

  ox = (width - blockW) * 0.5;

  oy = 240;

}
function draw() {
  const now = millis() / 1000;
  const dt = constrain(now - lastTime, 0, 0.05);
  lastTime = now;

  updateLayoutParams();
  let idx = 0;
  for (let j = 0; j < ROWS; j++) {
    for (let i = 0; i < COLS; i++) {
      const b = bubbles[idx++];
      b.x = ox + i * step + DIAM * 0.5;
      b.y = oy + j * step + DIAM * 0.5;
      b.r0 = DIAM * 0.5;
    }
  }

  background(BG_EDGE);
  drawRadialGradient(width * 0.5, height * 0.48, max(width, height) * 0.65, color(BG_CENTER), color(BG_EDGE));

  let hovered = null;
  for (const b of bubbles) {
    if (b.hit(mouseX, mouseY)) {
      hovered = b;
      break;
    }
  }
  const pressing = mouseIsPressed && mouseButton === LEFT;

  for (const b of bubbles) {
    b.update(dt, b === hovered, pressing && b === hovered);
  }
  for (const b of bubbles) {
    b.render();
  }
}

class Bubble {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r0 = r;
    this.r = r;
    this.dent = 0;
    this.dentV = 0;
    this.state = INFLATED;
    this.pressure = 0;
    this.popAnim = 0;
    this.ringT = 0;
    this.ringA = 0;
    this.prePopSoundPlayed = false;
  }

  hit(mx, my) {
    return dist(mx, my, this.x, this.y) <= this.r0 + GAP * 0.5;
  }

  update(dt, hovered, pressing) {
    let targetDent = 0;
    if (hovered && this.state !== POPPED) targetDent += HOVER_DENT;

    if (pressing && this.state !== POPPED) {
      this.pressure += PRESSURE_RATE * dt;
      targetDent += min(0.6, this.pressure * 0.7);

      const preSoundThreshold = POP_THRESHOLD - 0.3 * PRESSURE_RATE;
      if (!this.prePopSoundPlayed && this.pressure >= preSoundThreshold) {
        playPopSound();
        this.prePopSoundPlayed = true;
      }

      if (this.pressure >= POP_THRESHOLD) this.pop();
    } else {
      this.pressure = max(0, this.pressure - 0.6 * dt);
      this.prePopSoundPlayed = false;
    }

    const k = 18;
    const c = 5;
    const a = k * (targetDent - this.dent) - c * this.dentV;
    this.dentV += a * dt;
    this.dent += this.dentV * dt;
    this.dent = constrain(this.dent, 0, 0.75);

    this.r = max(2, this.r0 - this.dent * this.r0 * 0.45);

    if (this.state === POPPED) {
      this.popAnim = min(1, this.popAnim + dt * 2.0);
      if (this.ringA > 0) {
        this.ringT = min(1, this.ringT + dt * 1.6);
        this.ringA = max(0, 1.0 - this.ringT);
      }
    } else {
      this.popAnim = max(0, this.popAnim - dt * 1.2);
      this.ringT = 0;
      this.ringA = 0;
    }
  }

  pop() {
    if (this.state === POPPED) return;
    this.state = POPPED;
    this.pressure = 0;
    this.dentV = 0;
    this.ringT = 0;
    this.ringA = 1;
    if (!this.prePopSoundPlayed) {
      playPopSound();
      this.prePopSoundPlayed = true;
    }
  }

  repair() {
    if (this.state !== POPPED) return;
    this.state = INFLATED;
    this.popAnim = 0;
    this.dent = 0;
    this.dentV = 0;
    this.ringT = 0;
    this.ringA = 0;
    this.prePopSoundPlayed = false;
  }

  render() {
    push();
    translate(this.x, this.y);

    if (this.state !== POPPED || this.popAnim < 0.85) {
      fill(255,248,242,120);
        stroke(245,212,180,220);
      strokeWeight(STROKE_W);
      ellipse(0, 0, this.r * 2, this.r * 2);

      push();
      rotate(radians(-18));
      noStroke();
      fill(255,242,225,180);
      ellipse(-this.r * 0.26, -this.r * 0.28, this.r * 0.46, this.r * 0.22);
      fill(255,248,240,140);
      ellipse(-this.r * 0.08, -this.r * 0.40, this.r * 0.20, this.r * 0.10);
      pop();
    }

    if (this.state === POPPED) {
      const base = this.r0 * (1.0 - 0.65 * this.popAnim);
      const rim = base * 1.06;
      noStroke();
      fill(255, 70);
      ellipse(0, 0, rim * 2.0, rim * 2.0 * 0.96);
      fill(0, 30);
      ellipse(0, base * 0.10, base * 1.25, base * 0.55);

      if (this.ringA > 0) {
        const rr = lerp(this.r0 * 0.9, this.r0 * 2.2, easeOutQuad(this.ringT));
        noFill();
        stroke(255, 160 * this.ringA);
        strokeWeight(1.5 * SCALE);
        ellipse(0, 0, rr * 2, rr * 2);
        stroke(255, 90 * this.ringA);
        strokeWeight(1 * SCALE);
        ellipse(0, 0, rr * 2.6, rr * 2.6);
      }
    }

    pop();
  }
}

function mousePressed() {
  userStartAudio();

  if (mouseButton === LEFT) {
    for (const b of bubbles) {
      if (b.hit(mouseX, mouseY)) {
        if (keyIsDown(SHIFT)) b.repair();
        break;
      }
    }
  }
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    initGrid();
  }
}

function drawRadialGradient(cx, cy, radius, cInner, cOuter) {
  noStroke();
  const steps = 180;
  for (let i = steps; i >= 0; i--) {
    const t = i / steps;
    const rr = lerp(0, radius, t);
    fill(lerpColor(cOuter, cInner, pow(1.0 - t, 1.4)));
    ellipse(cx, cy, rr * 2, rr * 2);
  }
}

function easeOutQuad(t) {
  return 1 - (1 - t) * (1 - t);
}
