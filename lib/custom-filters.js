/**
 * Liquid filter to format a date with Intl.DateTimeFormat
 * @example {{ page.date | datei18n: locales: page.lang, dateStyle: "long", timeStyle: "short", timeZone:"UTC" }}
 * @param {string} input
 * @param  {...any} args
 * @returns
 */
export function datei18n(input, ...args) {
  const params = Object.fromEntries(args);
  const { locales, ...options } = params;
  const d =
    input === "now" || input === "today" ? new Date() : Date.parse(input);
  return new Intl.DateTimeFormat(locales, options).format(d);
}

export function language_name(input) {
  return new Intl.DisplayNames([input], { type: "language" }).of(input);
}
