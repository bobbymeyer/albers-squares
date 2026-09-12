// Generating Albers' Squares in p5.js — nested, offset squares in a random
// gradient, in the spirit of Josef Albers' Homage to the Square. A new
// composition every few seconds, finished with a soft grain so the flat fills
// read as painted rather than printed.
//
// Recovered from a 2021 post; the original overlaid a canvas.jpg that was lost,
// so the grain is generated here instead.

const SIZE = 600;

// How many squares a composition stacks, inclusive.
const MIN_SQUARES = 2;
const MAX_SQUARES = 5;

// The palette is built in OKLab, where a step in lightness is roughly a step in
// what the eye sees, so we can promise every touching pair of squares a visible
// edge. MIN_STEP is that promise: the smallest OKLab lightness gap allowed
// between neighbours. The floor and ceiling keep the ramp off the two ends
// where a screen crushes everything into black or white.
const MIN_STEP = 0.11;
const L_FLOOR = 0.32;
const L_CEIL = 0.94;

let rotation = 0;
let squares;
let colors = [];
let grain;

function setup() {
  const cnv = createCanvas(SIZE, SIZE);
  cnv.parent('albers-container');
  colorMode(RGB);
  noStroke();
  grain = makeGrain();
}

// A soft monochrome grain, soft-light blended over each composition. Mid-grey
// leaves the colours be; the scatter around it is the texture.
function makeGrain() {
  const g = createGraphics(SIZE, SIZE);
  g.loadPixels();
  for (let i = 0; i < g.pixels.length; i += 4) {
    const v = 128 + random(-18, 18);
    g.pixels[i] = v;
    g.pixels[i + 1] = v;
    g.pixels[i + 2] = v;
    g.pixels[i + 3] = 255;
  }
  g.updatePixels();
  return g;
}

function draw() {
  // Set the rate inside draw, not setup, so the first composition appears at
  // once and only the cadence after it is slow — a new one every ~3s.
  frameRate(0.3);
  clear();
  blendMode(BLEND);
  squares = floor(random(MIN_SQUARES, MAX_SQUARES + 1));
  setColors();
  createSquares();

  translate(width / 2, height / 2);
  rotation += 90;
  rotate(radians(rotation));
  imageMode(CENTER);
  blendMode(SOFT_LIGHT);
  image(grain, 0, 0);
}

// One colour per square, innermost first, walking a ramp of rising or falling
// lightness with a slow drift of hue and chroma along it. Because the ramp is
// laid out in OKLab and only its chroma is ever trimmed to fit sRGB, the
// lightness gaps survive to the canvas intact — so a composition can come out
// dark or pale or muted, but never as fewer squares than it has.
function setColors() {
  const lightness = lightnessRamp(squares);
  const hue = random(360);
  // A whole-ramp drift, not a per-step jump: the squares stay relatives.
  const drift = random(-40, 40);
  // As a fraction of the chroma sRGB can actually hold at each step, so the
  // ramp runs from near-grey to near-vivid without ever asking for a colour
  // the screen has to clip.
  const chromaFrom = random(0.15, 0.9);
  const chromaTo = constrain(chromaFrom + random(-0.35, 0.35), 0.1, 0.95);

  colors = lightness.map((l, i) => {
    const t = squares > 1 ? i / (squares - 1) : 0;
    const h = hue + drift * t;
    return oklchToRgb(l, maxChroma(l, h) * lerp(chromaFrom, chromaTo, t), h);
  });
}

// Lightness values for a stack of n squares: a monotonic ramp that starts
// somewhere random, runs in a random direction, and keeps at least MIN_STEP
// between neighbours. Whatever room is left over is scattered across the gaps
// so the ramp is never mechanically even.
function lightnessRamp(n) {
  const room = L_CEIL - L_FLOOR;
  if (n < 2) return [random(L_FLOOR, L_CEIL)];

  const step = min(MIN_STEP, room / (n - 1));
  const span = random(step * (n - 1), room);
  const slack = span - step * (n - 1);

  const weights = [];
  let total = 0;
  for (let i = 0; i < n - 1; i += 1) {
    const w = random(1);
    weights.push(w);
    total += w;
  }

  const ramp = [random(L_FLOOR, L_CEIL - span)];
  for (let i = 0; i < n - 1; i += 1) {
    const share = total > 0 ? weights[i] / total : 1 / (n - 1);
    ramp.push(ramp[i] + step + slack * share);
  }
  return random(1) < 0.5 ? ramp : ramp.reverse();
}

// Nested squares, each smaller and offset down and to the right — the weighted
// stack that gives the Homage its floating look. Painted largest first, so the
// ramp runs outward from the small square on top.
function createSquares() {
  let size = SIZE;
  let x = 0;
  let y = 0;
  for (let i = squares - 1; i >= 0; i -= 1) {
    const c = colors[i];
    fill(c[0], c[1], c[2]);
    square(x, y, size);
    size = size / 1.5;
    x += size / 4;
    y += size / 2.35;
  }
}

// --- OKLab ------------------------------------------------------------------
// Björn Ottosson's OKLab, enough of it to turn a lightness/chroma/hue triple
// into something p5 can fill with.

function toLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function toSrgb(c) {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

// OKLCh -> linear sRGB, unclamped: a channel outside 0–1 means the colour asks
// for more chroma than sRGB holds at that lightness and hue.
function oklchToLinearRgb(l, c, h) {
  const rad = radians(h);
  const a = c * Math.cos(rad);
  const b = c * Math.sin(rad);

  const lp = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mp = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const sp = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;

  return [
    4.0767416621 * lp - 3.3077115913 * mp + 0.2309699292 * sp,
    -1.2684380046 * lp + 2.6097574011 * mp - 0.3413193965 * sp,
    -0.0041960863 * lp - 0.7034186147 * mp + 1.707614701 * sp,
  ];
}

// The most chroma sRGB can hold at this lightness and hue. Trimming chroma
// alone is what keeps the ramp's lightness gaps exact: it moves a colour
// towards grey, never lighter or darker.
function maxChroma(l, h) {
  let lo = 0;
  let hi = 0.4;
  for (let i = 0; i < 24; i += 1) {
    const mid = (lo + hi) / 2;
    const rgb = oklchToLinearRgb(l, mid, h);
    const fits = rgb.every((v) => v >= -1e-6 && v <= 1 + 1e-6);
    if (fits) lo = mid;
    else hi = mid;
  }
  return lo;
}

function oklchToRgb(l, c, h) {
  return oklchToLinearRgb(l, c, h).map((v) => constrain(toSrgb(constrain(v, 0, 1)) * 255, 0, 255));
}
