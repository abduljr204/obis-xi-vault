export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function parseSizes(json: string): string[] {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

export function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

/** ["CA","US"] → "Canada and the United States" */
export function countryList(codes: string[]) {
  const names = codes.map((c) => {
    const name = new Intl.DisplayNames(["en"], { type: "region" }).of(c) ?? c;
    return /^(United|Netherlands|Philippines|Bahamas|Gambia)/.test(name) ? `the ${name}` : name;
  });
  if (names.length <= 1) return names[0] ?? "";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}
