# Albers' squares

a homage to Homage to the Square

Recovered from a 2021 experiment, rebuilt as a self-contained static page.

## quickstart

Static. Open `index.html`, or serve the folder:

```sh
python3 -m http.server
```

p5 loads from a CDN. Everything else is in `sketch.js`.

## embedding it

`sketch.js` does not start itself. It puts an instance-mode factory on
`window.albersSketch`, so the page that loads it decides when to run it and
keeps the handle to stop it:

```js
const instance = new p5(window.albersSketch, document.getElementById('albers-container'));
instance.remove();   // on teardown
```

`index.html` does this, and so does the Albers post on bobbymeyer.com, which
loads this same file from this deploy rather than keeping a copy. Renaming the
global, starting the sketch from this file, or requiring a p5 the post does not
load will break that post.

## what it generates

| | |
| --- | --- |
| Canvas | 600 × 600 |
| Squares per composition | 3–5, picked evenly |
| New composition | every ~3s (`frameRate(0.3)`); the first appears at once |
| Nesting | each square `1.5×` smaller, offset right by `size/4` and down by `size/2.35` |
| Paint order | largest first, so the ramp runs outward from the small square on top |
| Finish | generated monochrome grain, soft-light blended, rotated 90° each frame |

## palette

Built in [OKLab](https://bottosson.github.io/posts/oklab/), so a step in
lightness is roughly a step in what the eye sees.

| Constant | Value | Is |
| --- | --- | --- |
| `MIN_STEP` | `0.11` | Smallest lightness gap allowed between touching squares |
| `L_FLOOR` | `0.32` | Bottom of the ramp |
| `L_CEIL` | `0.94` | Top of the ramp |

One colour per square, innermost first, along a monotonic lightness ramp that
starts somewhere random and runs in a random direction. Leftover room is
scattered across the gaps, so the ramp is never mechanically even. Hue drifts
across the whole ramp rather than jumping per step, and chroma is set as a
fraction of what sRGB holds at that lightness and hue.

Only chroma is ever trimmed to fit sRGB, which moves a colour toward grey but
never lighter or darker — so the lightness gaps survive to the canvas. A
composition can come out dark, pale or near-grey; it cannot come out reading as
fewer squares than it has.

## files

| File | Holds |
| --- | --- |
| `index.html` | The page: loads p5 and the sketch, and starts one instance |
| `sketch.js` | The OKLab conversion, the palette, the squares, the grain |

## tech

p5.js from a CDN. No build, no dependencies, no package manager.
