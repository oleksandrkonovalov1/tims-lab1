// Entry point: builds the variation series for each assigned dataset, prints the
// frequency tables and characteristics, and saves charts for the report.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ecdfSvg, polygonSvg, svgToPng } from "./charts.ts";
import { datasets } from "./data.ts";
import { analyze } from "./stats.ts";

const figuresDir = join(dirname(fileURLToPath(import.meta.url)), "..", "reports", "lr1", "figures");
mkdirSync(figuresDir, { recursive: true });

const r4 = (v: number) => v.toFixed(4);

for (const dataset of datasets) {
  const { ranked, table, characteristics: c } = analyze(dataset.values);

  console.log(`\n=== ${dataset.title} ===`);
  console.log("Варіаційний ряд:", ranked.join(", "));
  console.table(table.map((r, i) => ({
    "№": i + 1,
    "vᵢ": r.value,
    "fᵢ": r.frequency,
    "wᵢ": r4(r.relative),
    "fᵢᶜ": r.cumulative,
    "wᵢᶜ": r4(r.cumulativeRelative),
  })));
  console.log(`Середнє арифметичне x̄    = ${r4(c.mean)}`);
  console.log(`Мода Mo                   = ${c.modes.join(", ")}`);
  console.log(`Медіана Me                = ${c.median}`);
  console.log(`Середнє лінійне відх. d   = ${r4(c.meanLinearDeviation)}`);
  console.log(`Дисперсія S̄²             = ${r4(c.variance)}`);
  console.log(`Сер. квадр. відхилення S̄ = ${r4(c.standardDeviation)}`);
  console.log(`Коефіцієнт асиметрії As   = ${r4(c.skewness)}`);
  console.log(`Ексцес Ek                 = ${r4(c.kurtosis)}`);

  for (const [kind, svg] of [["polygon", polygonSvg(table)], ["ecdf", ecdfSvg(table)]] as const) {
    const file = join(figuresDir, `${kind}-${dataset.id}.png`);
    writeFileSync(file, svgToPng(svg));
    console.log(`Збережено: ${file}`);
  }
}
