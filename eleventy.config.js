import { EleventyI18nPlugin } from "@11ty/eleventy";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import * as dateFns from "date-fns";

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight, {
    // Added in 5.0.0, throw errors on invalid language names
    errorOnInvalidLanguage: false,
  });
  eleventyConfig.addPlugin(EleventyI18nPlugin, {
    defaultLanguage: "en",
    // Rename the default universal filter names
    filters: {
      // transform a URL with the current page’s locale code
      url: "locale_url",

      // find the other localized content for a specific input file
      links: "locale_links",
    },
    // When to throw errors for missing localized content files
    errorMode: "strict", // throw an error if content is missing at /en/slug
    // errorMode: "allow-fallback", // only throw an error when the content is missing at both /en/slug and /slug
    // errorMode: "never", // don’t throw errors for missing content
  });
  eleventyConfig.addPassthroughCopy("bundle.css");
  eleventyConfig.addPassthroughCopy("images/");
  eleventyConfig.addFilter("datei18n", (input, ...args) => {
    const params = Object.fromEntries(args);
    const { locales, ...options } = params;
    // return JSON.stringify({input, ...params});
    const d = input === "now" ? new Date() : Date.parse(input);
    return new Intl.DateTimeFormat(locales, options).format(d);
  });
}
