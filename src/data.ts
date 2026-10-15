// Input samples from the lab handout (ТЙМС_Лаб1н), assigned sets B16 and 17.

export interface Dataset {
  /** Identifier as printed in the handout table. */
  id: string;
  /** Short human-readable label used in output and the report. */
  title: string;
  values: readonly number[];
}

/** Table "n = 20", row B16. */
export const setB16: Dataset = {
  id: "B16",
  title: "Набір В16 (n = 20)",
  values: [4, 8, 13, 10, 4, 13, 17, 10, 17, 13, 10, 23, 13, 23, 29, 13, 29, 23, 13, 33],
};

/** Table "n = 100", row 17. */
export const set17: Dataset = {
  id: "17",
  title: "Набір №17 (n = 100)",
  values: [
    4, 4, 7, 3, 1, 2, 3, 1, 4, 6, 2, 4, 4, 3, 5, 2, 5, 4, 2, 5, 1, 7, 7, 9, 4, 3, 0, 4, 4, 2, 4, 3, 11, 3,
    3, 5, 3, 7, 5, 4, 4, 3, 4, 5, 4, 4, 5, 5, 7, 1, 4, 2, 3, 7, 1, 5, 3, 4, 4, 8, 1, 5, 5, 3, 3, 2, 2, 5,
    7, 5, 4, 6, 10, 4, 6, 5, 4, 5, 5, 7, 2, 1, 2, 7, 1, 3, 3, 4, 4, 2, 2, 6, 5, 3, 5, 7, 5, 6, 6, 3,
  ],
};

export const datasets: readonly Dataset[] = [setB16, set17];
