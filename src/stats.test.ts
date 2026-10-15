import { test } from "node:test";
import assert from "node:assert/strict";
import { characteristics, empiricalCdf, frequencyTable } from "./stats.ts";

const close = (actual: number, expected: number) => assert.ok(Math.abs(actual - expected) < 1e-12, `${actual} ≠ ${expected}`);

test("frequency table accumulates frequencies up to n and 1", () => {
  const table = frequencyTable([3, 1, 2, 2, 3, 3]);
  assert.deepEqual(table.map((r) => [r.value, r.frequency, r.cumulative]), [[1, 1, 1], [2, 2, 3], [3, 3, 6]]);
  close(table.at(-1)!.cumulativeRelative, 1);
});

test("empirical CDF counts strictly smaller values", () => {
  const table = frequencyTable([1, 2, 2, 3]);
  assert.equal(empiricalCdf(table, 1), 0);
  assert.equal(empiricalCdf(table, 2), 0.25);
  assert.equal(empiricalCdf(table, 2.5), 0.75);
  assert.equal(empiricalCdf(table, 3.1), 1);
});

test("characteristics of a symmetric sample worked out by hand", () => {
  // x̄ = 2, d = 0.5, S² = 0.5, μ3 = 0, μ4 = 0.5 → Ek = 0.5 / 0.25 − 3 = −1
  const c = characteristics([1, 2, 2, 3]);
  close(c.mean, 2);
  assert.deepEqual(c.modes, [2]);
  close(c.median, 2);
  close(c.meanLinearDeviation, 0.5);
  close(c.variance, 0.5);
  close(c.skewness, 0);
  close(c.kurtosis, -1);
});

test("variance matches the shortcut form (1/n) Σ v² f − x̄²", () => {
  const values = [0, 1, 1, 4, 7, 7, 7, 10];
  const c = characteristics(values);
  const meanOfSquares = values.reduce((s, v) => s + v * v, 0) / values.length;
  close(c.variance, meanOfSquares - c.mean ** 2);
});

test("median of an odd-sized sample and multiple modes", () => {
  const c = characteristics([5, 1, 3, 1, 5]);
  close(c.median, 3);
  assert.deepEqual(c.modes, [1, 5]);
});
