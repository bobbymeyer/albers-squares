// Generating Albers' Squares in p5.js — nested, offset squares in a random
// gradient, in the spirit of Josef Albers' Homage to the Square. A new
// composition every few seconds, finished with a soft grain so the flat fills
// read as painted rather than printed.
//
// Recovered from a 2021 post; the original overlaid a canvas.jpg that was lost,
// so the grain is generated here instead.

const SIZE = 600;
let rotation = 0;
let squares;
let colors = [];
let grain;

function setup() {
  const cnv = createCanvas(SIZE, SIZE);
  cnv.parent('albers-container');
  colorMode(RGB);
  frameRate(0.3); // a new composition roughly every three seconds
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
  clear();
  blendMode(BLEND);
  squares = random(1, 5);
  setColors();
  createSquares();

  translate(width / 2, height / 2);
  rotation += 90;
  rotate(radians(rotation));
  imageMode(CENTER);
  blendMode(SOFT_LIGHT);
  image(grain, 0, 0);
}

function setColors() {
  const a = color(random(50, 200), random(50, 200), random(50, 200));
  const b = color(random(75, 250), random(75, 250), random(75, 250));
  const steps = 1 / squares;
  const lerps = [];
  for (let n = squares - 2; n > 0; n -= 1) {
    lerps.push(lerpColor(a, b, steps * n));
  }
  colors = lerps.reverse();
  colors.unshift(a);
  colors.push(b);
}

// Nested squares, each smaller and offset down and to the right — the weighted
// stack that gives the Homage its floating look.
function createSquares() {
  let size = SIZE;
  let x = 0;
  let y = 0;
  for (let n = squares; n > 0; n -= 1) {
    fill(colors[Math.floor(n)]);
    square(x, y, size);
    size = size / 1.5;
    x += size / 4;
    y += size / 2.35;
  }
}
