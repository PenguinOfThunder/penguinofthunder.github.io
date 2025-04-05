import { EleventyI18nPlugin } from "@11ty/eleventy";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import pluginIcons from "eleventy-plugin-icons";
import htmlmin from "html-minifier-terser";
import { datei18n, language_name } from "./lib/custom-filters.js";

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
  eleventyConfig.addFilter("datei18n", datei18n);
  eleventyConfig.addFilter("language_name", language_name);

  eleventyConfig.addTransform("htmlmin", function (content) {
		if ((this.page.outputPath || "").endsWith(".html")) {
			let minified = htmlmin.minify(content, {
				useShortDoctype: true,
				removeComments: true,
				collapseWhitespace: true,
        minifyJS: true,
        minifyCSS: true
			});

			return minified;
		}

		// If not an HTML output, return content as-is
		return content;
	});
}
