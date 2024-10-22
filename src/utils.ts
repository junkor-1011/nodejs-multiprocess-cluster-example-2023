export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const range = (n: number): readonly number[] =>
  [...Array(n).keys()] as const;
