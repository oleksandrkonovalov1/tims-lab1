// SVG charts: frequency polygon and empirical distribution function F*(x).
// Rendered to PNG with resvg so the report can embed them.

import { Resvg } from "@resvg/resvg-js";
import type { FrequencyRow } from "./stats.ts";

const WIDTH = 900;
const HEIGHT = 560;
const PAD = { left: 80, right: 30, top: 30, bottom: 70 };
const PLOT_W = WIDTH - PAD.left - PAD.right;
const PLOT_H = HEIGHT - PAD.top - PAD.bottom;
const FONT = "Times New Roman, serif";
const LINE = "#1f4e9c";

interface Axes {
  xMin: number;
  xMax: number;
  yMax: number;
  xTicks: number[];
  yTicks: number[];
  xLabel: string;
  yLabel: string;
}

const sx = (a: Axes, x: number) => PAD.left + ((x - a.xMin) / (a.xMax - a.xMin)) * PLOT_W;
const sy = (a: Axes, y: number) => PAD.top + PLOT_H - (y / a.yMax) * PLOT_H;
const fmt = (v: number) => String(Number(v.toFixed(2)));

function frame(a: Axes, body: string): string {
  const grid = a.yTicks
    .map((t) => `<line x1="${PAD.left}" x2="${PAD.left + PLOT_W}" y1="${sy(a, t)}" y2="${sy(a, t)}" stroke="#ddd"/>`)
    .join("");
  const xLabels = a.xTicks
    .map((t) => `<line x1="${sx(a, t)}" x2="${sx(a, t)}" y1="${PAD.top + PLOT_H}" y2="${PAD.top + PLOT_H + 6}" stroke="#000"/>`
      + `<text x="${sx(a, t)}" y="${PAD.top + PLOT_H + 26}" text-anchor="middle">${fmt(t)}</text>`)
    .join("");
  const yLabels = a.yTicks
    .map((t) => `<text x="${PAD.left - 10}" y="${sy(a, t) + 6}" text-anchor="end">${fmt(t)}</text>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" font-family="${FONT}" font-size="18">
<rect width="100%" height="100%" fill="#fff"/>
${grid}
<line x1="${PAD.left}" x2="${PAD.left + PLOT_W}" y1="${PAD.top + PLOT_H}" y2="${PAD.top + PLOT_H}" stroke="#000" stroke-width="1.5"/>
<line x1="${PAD.left}" x2="${PAD.left}" y1="${PAD.top}" y2="${PAD.top + PLOT_H}" stroke="#000" stroke-width="1.5"/>
${xLabels}${yLabels}
<text x="${PAD.left + PLOT_W / 2}" y="${HEIGHT - 12}" text-anchor="middle" font-style="italic">${a.xLabel}</text>
<text transform="translate(22 ${PAD.top + PLOT_H / 2}) rotate(-90)" text-anchor="middle" font-style="italic">${a.yLabel}</text>
${body}
</svg>`;
}

function niceStep(max: number, targetTicks: number): number {
  const raw = max / targetTicks;
  const pow = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 5, 10].map((m) => m * pow).find((s) => s >= raw)!;
}

function range(from: number, to: number, step: number): number[] {
  const out: number[] = [];
  for (let v = from; v <= to + 1e-9; v += step) out.push(v);
  return out;
}

/** Polygon of frequencies: points (v_i, f_i) joined by straight segments. */
export function polygonSvg(table: readonly FrequencyRow[]): string {
  const values = table.map((r) => r.value);
  const fMax = Math.max(...table.map((r) => r.frequency));
  const yStep = niceStep(fMax, 6);
  const xStep = niceStep(values.at(-1)! - values[0], 12);
  const axes: Axes = {
    xMin: Math.floor(values[0] / xStep) * xStep - xStep,
    xMax: Math.ceil(values.at(-1)! / xStep) * xStep + xStep,
    yMax: Math.ceil((fMax + 1) / yStep) * yStep,
    xTicks: [],
    yTicks: [],
    xLabel: "x (варіанта vᵢ)",
    yLabel: "fᵢ (частота)",
  };
  axes.xTicks = range(axes.xMin, axes.xMax, xStep);
  axes.yTicks = range(0, axes.yMax, yStep);

  const points = table.map((r) => `${sx(axes, r.value)},${sy(axes, r.frequency)}`).join(" ");
  const markers = table
    .map((r) => `<circle cx="${sx(axes, r.value)}" cy="${sy(axes, r.frequency)}" r="5" fill="${LINE}"/>`
      + `<text x="${sx(axes, r.value)}" y="${sy(axes, r.frequency) - 12}" text-anchor="middle" font-size="16">${r.frequency}</text>`)
    .join("");
  return frame(axes, `<polyline points="${points}" fill="none" stroke="${LINE}" stroke-width="2.5"/>${markers}`);
}

/**
 * Empirical distribution function F*(x), formula (1.2).
 * F* is continuous from the left: each step covers (v_i, v_{i+1}], so the left end
 * is drawn as an open circle and the right end as a filled one.
 */
export function ecdfSvg(table: readonly FrequencyRow[]): string {
  const values = table.map((r) => r.value);
  const span = values.at(-1)! - values[0];
  const xStep = niceStep(span, 12);
  const axes: Axes = {
    xMin: Math.floor(values[0] / xStep) * xStep - xStep,
    xMax: Math.ceil(values.at(-1)! / xStep) * xStep + xStep,
    yMax: 1.05,
    xTicks: [],
    yTicks: range(0, 1, 0.1),
    xLabel: "x",
    yLabel: "F*(x)",
  };
  axes.xTicks = range(axes.xMin, axes.xMax, xStep);

  const steps: string[] = [];
  const segment = (x1: number, x2: number, y: number, openLeft: boolean) => {
    steps.push(`<line x1="${sx(axes, x1)}" x2="${sx(axes, x2)}" y1="${sy(axes, y)}" y2="${sy(axes, y)}" stroke="${LINE}" stroke-width="2.5"/>`);
    if (openLeft) steps.push(`<circle cx="${sx(axes, x1)}" cy="${sy(axes, y)}" r="5" fill="#fff" stroke="${LINE}" stroke-width="2"/>`);
  };

  // F*(x) = 0 for x ≤ v_1; the point v_1 itself belongs to this piece.
  segment(axes.xMin, values[0], 0, false);
  steps.push(`<circle cx="${sx(axes, values[0])}" cy="${sy(axes, 0)}" r="5" fill="${LINE}"/>`);
  table.forEach((row, i) => {
    const next = table[i + 1]?.value ?? axes.xMax;
    segment(row.value, next, row.cumulativeRelative, true);
    if (i + 1 < table.length) {
      steps.push(`<circle cx="${sx(axes, next)}" cy="${sy(axes, row.cumulativeRelative)}" r="5" fill="${LINE}"/>`);
    }
    // Dashed jump guide at v_i.
    const prev = i === 0 ? 0 : table[i - 1].cumulativeRelative;
    steps.push(`<line x1="${sx(axes, row.value)}" x2="${sx(axes, row.value)}" y1="${sy(axes, prev)}" y2="${sy(axes, row.cumulativeRelative)}" stroke="${LINE}" stroke-dasharray="4 4" stroke-opacity="0.6"/>`);
  });
  return frame(axes, steps.join(""));
}

export function svgToPng(svg: string): Buffer {
  return new Resvg(svg, { fitTo: { mode: "width", value: WIDTH * 2 }, font: { loadSystemFonts: true } })
    .render()
    .asPng();
}
