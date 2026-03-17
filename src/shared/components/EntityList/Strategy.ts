export type SearchStrategy<TOptions = unknown> = {
  name: string;
  match: (text: string, query: string, options: TOptions) => boolean;
};

const normalize = (value: string): string =>
  value.toLowerCase().trim().replace(/ё/g, "е");

/* ---------- layout switch ---------- */

const en = "qwertyuiop[]asdfghjkl;'zxcvbnm,.";
const ru = "йцукенгшщзхъфывапролджэячсмитьбю";

const switchLayout = (input: string): string =>
  input
    .replaceAll(" ", "")
    .split("")
    .map((char) => {
      const enIndex = en.indexOf(char.toLowerCase());
      if (enIndex !== -1) return ru[enIndex];

      const ruIndex = ru.indexOf(char.toLowerCase());
      if (ruIndex !== -1) return en[ruIndex];

      return char.toLowerCase();
    })
    .join("");

/* ---------- Damerau–Levenshtein ---------- */

const damerauLevenshtein = (a: string, b: string): number => {
  const matrix: number[][] = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;

      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );

      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + cost);
      }
    }
  }

  return matrix[a.length][b.length];
};

/* ---------- strategies ---------- */

export const includesStrategy: SearchStrategy<unknown> = {
  name: "includes",
  match: (text, query) => {
    // Если ввели число, то четкий поиск
    if (!isNaN(Number(query))) {
      return normalize(text) === normalize(query);
    }

    // Если ввели строку формата (regexp): /.*-.*/ui
    if (/.*-.*/iu.test(query)) {
      return normalize(text).includes(normalize(query.replaceAll(" ", "")));
    }

    return normalize(text).includes(normalize(query.replaceAll(" ", "")));
  }
};

export const layoutStrategy: SearchStrategy<unknown> = {
  name: "layout",
  match: (text, query) => {
    if (!isNaN(Number(query))) {
      return normalize(text) === normalize(query);
    }
    // Если ввели строку формата (regexp): /.*-.*/ui
    if (/.*-.*/iu.test(query)) {
      return normalize(text).includes(normalize(query.replaceAll(" ", "")));
    }
    const res = normalize(text).includes(normalize(switchLayout(query)));
    return res;
  },
};

export type LevenshteinOptions = {
  threshold: number;
};

export const levenshteinStrategy: SearchStrategy<LevenshteinOptions> = {
  name: "levenshtein",
  match: (text, query, { threshold }) => {
    // Если ввели число, то четкий поиск
    if (!isNaN(Number(query))) {
      return normalize(text) === normalize(query);
    }

    // Если ввели строку формата (regexp): /.*-.*/ui
    if (/.*-.*/iu.test(query)) {
      return normalize(text).includes(normalize(query.replaceAll(" ", "")));
    }

    const words = query.split(" ");
    const res = words.some((word) => {
      const wordsText = text.split(" ");
      const switchedWords = wordsText.map((text) => switchLayout(text));
      return (
        wordsText.some(
          (text) =>
            damerauLevenshtein(normalize(text), normalize(word)) <= threshold
        ) ||
        switchedWords.some(
          (text) =>
            damerauLevenshtein(normalize(text), normalize(word)) <= threshold
        )
      );
    });
    return res;
  },
};

