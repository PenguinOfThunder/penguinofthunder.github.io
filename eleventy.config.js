import { EleventyHtmlBasePlugin, EleventyI18nPlugin, EleventyRenderPlugin } from "@11ty/eleventy";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import i18n from "eleventy-plugin-i18n";
import pluginIcons from "eleventy-plugin-icons";
import htmlmin from "html-minifier-terser";
import translations from "./_data/translations.js";
import * as customFilters from "./lib/custom-filters.js";

const publicBaseUrl = "https://penguinofthunder.github.io/";

export default function (eleventyConfig) {
  eleventyConfig.setDataFileSuffixes([".11tydata", ""]);
  eleventyConfig.addPassthroughCopy("images/");
  eleventyConfig.addGlobalData("languages", ["en", "nb"]);
  eleventyConfig.addPlugin(EleventyRenderPlugin);
  eleventyConfig.addPlugin(syntaxHighlight, {
    // Added in 5.0.0, throw errors on invalid language names
    errorOnInvalidLanguage: false,
  });
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin, {
    baseHref: process.env.NODE_ENV === "production" ? publicBaseUrl : "/",
    extensions: "html",
  });
  eleventyConfig.addPlugin(i18n, {
    locales: ["en", "nb"],
    translations,
    fallbackLocales: {
      "no": "nb",
      "nn": "nb",
      "*": "en",
    },
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
  eleventyConfig.addPlugin(pluginIcons, {
    mode: "inline",
    sources: [
      {
        name: "lucide",
        path: "node_modules/lucide-static/icons",
        default: true,
      },
    ],
  });
  eleventyConfig.addPassthroughCopy("images/");
  eleventyConfig.addFilter("datei18n", customFilters.datetime_format);
  eleventyConfig.addFilter("display_name", customFilters.display_name);
  eleventyConfig.addFilter("language_name", customFilters.language_name);
  eleventyConfig.addFilter("region_name", customFilters.region_name);
  eleventyConfig.addFilter("script_name", customFilters.script_name);
  eleventyConfig.addFilter("currency_name", customFilters.currency_name);
  eleventyConfig.addFilter("calendar_name", customFilters.calendar_name);
  eleventyConfig.addFilter("dateTimeField_name", customFilters.dateTimeField_name);

  eleventyConfig.addTransform("htmlmin", function (content) {
    if ((this.page.outputPath || "").endsWith(".html")) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
        minifyJS: true,
        minifyCSS: true,
      });

      return minified;
    }

    // If not an HTML output, return content as-is
    return content;
  });
}
