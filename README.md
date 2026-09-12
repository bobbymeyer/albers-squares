# Albers' Squares

A [p5.js](https://p5js.org) sketch that generates designs in the style of
[Josef Albers'](https://en.wikipedia.org/wiki/Josef_Albers) *Homage to the
Square*: nested, offset squares filled with a random gradient, a new
composition every few seconds, finished with a soft grain.

From a 2021 experiment, rebuilt as a self-contained static page.

## Run it

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server
```

p5 loads from a CDN; everything else is in `sketch.js`.

## What's here

- `index.html` — the page: loads p5 and the sketch.
- `sketch.js` — the sketch. `setColors` builds the palette, `createSquares`
  stacks the nested squares, and a generated grain is soft-light blended on top.
  The original overlaid a `canvas.jpg` texture that was lost; the grain stands
  in for it.

## About the palette

The first version lerped between two independently random RGB colours, which
regularly landed two touching squares close enough to merge — a four-square
composition would read as two or three. The palette is now built in
[OKLab](https://bottosson.github.io/posts/oklab/), where a step in lightness is
roughly a step in what the eye sees, so neighbouring squares can be held at
least `MIN_STEP` apart in lightness. `L_FLOOR` and `L_CEIL` keep the ramp off
the ends where a screen crushes everything to black or white, and only chroma
is ever trimmed to fit sRGB — which leaves those lightness gaps intact on the
canvas. A composition can still come out dark, pale or near-grey; it just
cannot come out with fewer squares than it has.

`MIN_SQUARES` and `MAX_SQUARES` set how many squares a composition stacks —
2 to 5, picked evenly, so a two-square composition is by design, not a
collapsed four.
