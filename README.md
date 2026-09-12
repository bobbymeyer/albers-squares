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
- `sketch.js` — the sketch. `setColors` builds the gradient, `createSquares`
  stacks the nested squares, and a generated grain is soft-light blended on top.
  The original overlaid a `canvas.jpg` texture that was lost; the grain stands
  in for it.
