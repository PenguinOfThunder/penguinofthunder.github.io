/**
 * Liquid filter to format a date with Intl.DateTimeFormat
 * @example {{ page.date | datei18n: locales: page.lang, dateStyle: "long", timeStyle: "short", timeZone:"UTC" }}
 * @param {string} input
 * @param  {...any} args
 * @returns
 */
export function datetime_format(input, ...args) {
  const params = Object.fromEntries(args || []);
  const { locales, ...options } = params;
  const d =
    input === "now" || input === "today" ? new Date() : Date.parse(input);
  return new Intl.DateTimeFormat(locales, options).format(d);
}

export function display_name(type, input, args) {
  const params = Object.fromEntries(args || []);
  if (!params.lang) {
    params.lang = this.page.lang;
  }
  // console.log(this.page);
  return new Intl.DisplayNames([params.lang], { type, ...params }).of(input);
}

export function language_name(input, ...args) {
  return display_name.call(this, "language", input, args);
}

export function region_name(input, ...args) {
  return display_name.call(this, "region", input, ...args);
}

export function script_name(input, ...args) {
  return display_name.call(this, "script", input, ...args);
}

export function currency_name(input, ...args) {
  return display_name.call(this, "currency", input, ...args);
}

export function calendar_name(input, ...args) {
  return display_name.call(this, "calendar", input, ...args);
}

export function dateTimeField_name(input, ...args) {
  return display_name.call(this, "dateTimeField", input);
}
