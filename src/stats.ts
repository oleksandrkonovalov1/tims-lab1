// Discrete variation series and its numerical characteristics.
// Formulas follow the lab handout: (1.1)–(1.6).

export interface FrequencyRow {
  /** Variant v_i. */
  value: number;
  /** Frequency f_i. */
  frequency: number;
  /** Relative frequency w_i = f_i / n. */
  relative: number;
  /** Cumulative frequency f_1 + ... + f_i. */
  cumulative: number;
  /** Cumulative relative frequency w_1 + ... + w_i. */
  cumulativeRelative: number;
}

export interface Characteristics {
  n: number;
  /** Arithmetic mean x̄ = (1/n) Σ v_j f_j. */
  mean: number;
  /** All variants with the highest frequency. */
  modes: number[];
  /** Middle of the ranked series. */
  median: number;
  /** Mean linear deviation d = (1/n) Σ |v_j − x̄| f_j, formula (1.3). */
  meanLinearDeviation: number;
  /** Variance S̄² = (1/n) Σ (v_j − x̄)² f_j, formula (1.4). */
  variance: number;
  /** Standard deviation S̄ = √S̄². */
  standardDeviation: number;
  /** Central moments μ̃3 and μ̃4. */
  moment3: number;
  moment4: number;
  /** Skewness As = μ̃3 / S̄³, formula (1.5). */
  skewness: number;
  /** Excess kurtosis Ek = μ̃4 / S̄⁴ − 3, formula (1.6). */
  kurtosis: number;
}

export interface Analysis {
  /** Ranked series x_(1) ≤ ... ≤ x_(n). */
  ranked: number[];
  table: FrequencyRow[];
  characteristics: Characteristics;
}

export function rankedSeries(values: readonly number[]): number[] {
  return [...values].sort((a, b) => a - b);
}

export function frequencyTable(values: readonly number[]): FrequencyRow[] {
  const n = values.length;
  const counts = new Map<number, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);

  let cumulative = 0;
  return [...counts.keys()]
    .sort((a, b) => a - b)
    .map((value) => {
      const frequency = counts.get(value)!;
      cumulative += frequency;
      return {
        value,
        frequency,
        relative: frequency / n,
        cumulative,
        cumulativeRelative: cumulative / n,
      };
    });
}

/** Empirical distribution function F*(x) = f(x) / n, where f(x) counts x_k < x (formula 1.1). */
export function empiricalCdf(table: readonly FrequencyRow[], x: number): number {
  let result = 0;
  for (const row of table) {
    if (row.value < x) result = row.cumulativeRelative;
    else break;
  }
  return result;
}

/** Central moment of order k computed over the frequency table. */
function centralMoment(table: readonly FrequencyRow[], n: number, mean: number, k: number): number {
  return table.reduce((sum, r) => sum + (r.value - mean) ** k * r.frequency, 0) / n;
}

export function characteristics(values: readonly number[]): Characteristics {
  const n = values.length;
  const table = frequencyTable(values);
  const ranked = rankedSeries(values);

  const mean = table.reduce((sum, r) => sum + r.value * r.frequency, 0) / n;

  const maxFrequency = Math.max(...table.map((r) => r.frequency));
  const modes = table.filter((r) => r.frequency === maxFrequency).map((r) => r.value);

  const median = n % 2 === 1
    ? ranked[(n - 1) / 2]
    : (ranked[n / 2 - 1] + ranked[n / 2]) / 2;

  const meanLinearDeviation = table.reduce((sum, r) => sum + Math.abs(r.value - mean) * r.frequency, 0) / n;
  const variance = centralMoment(table, n, mean, 2);
  const standardDeviation = Math.sqrt(variance);
  const moment3 = centralMoment(table, n, mean, 3);
  const moment4 = centralMoment(table, n, mean, 4);

  return {
    n,
    mean,
    modes,
    median,
    meanLinearDeviation,
    variance,
    standardDeviation,
    moment3,
    moment4,
    skewness: moment3 / standardDeviation ** 3,
    kurtosis: moment4 / variance ** 2 - 3,
  };
}

export function analyze(values: readonly number[]): Analysis {
  return {
    ranked: rankedSeries(values),
    table: frequencyTable(values),
    characteristics: characteristics(values),
  };
}
