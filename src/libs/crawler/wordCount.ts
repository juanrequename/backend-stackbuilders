export const countTitleWords = (title: string): number => {
  if (!title) {
    return 0;
  }

  return title
    .trim()
    .split(/\s+/)
    .filter(token => /[A-Za-z0-9]/.test(token)).length;
};
