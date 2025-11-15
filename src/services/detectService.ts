export const detectLanguage = (text: string): string => {
  const pattern = /[^\x00-\x7F]+/;
  return pattern.test(text) ? "hi" : "en";
};

export const mapToNLLB = (iso: string): string => {
  const map: Record<string, string> = {
    en: "eng_Latn",
    hi: "hin_Deva",
    fr: "fra_Latn",
    es: "spa_Latn",
  };
  return map[iso] || "eng_Latn";
};
