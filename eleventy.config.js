import {
  EleventyHtmlBasePlugin,
  EleventyI18nPlugin,
  EleventyRenderPlugin,
  IdAttributePlugin
} from "@11ty/eleventy";
import { eleventyImageTransformPlugin } from "@11ty/eleventy-img";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import i18n from "eleventy-plugin-i18n";
import pluginIcons from "eleventy-plugin-icons";
import htmlmin from "html-minifier-terser";
import markdownItFootnote from "markdown-it-footnote";
import markdownItMark from "markdown-it-mark";
import markdownItAnchor from "markdown-it-anchor";
import markdownItTocDoneRight from "markdown-it-toc-done-right";
import * as sass from "sass";
import translations from "./_data/translations.js";
import * as customFilters from "./lib/custom-filters.js";
import { ht } from "date-fns/locale";

const publicBaseUrl = "https://penguinofthunder.github.io/";

export default function (eleventyConfig) {
  eleventyConfig.setDataFileSuffixes([".11tydata", ""]);
  eleventyConfig.setFrontMatterParsingOptions({
    excerpt: true,
    excerpt_separator: "<!-- excerpt -->"
  });
  eleventyConfig.addGlobalData("languages", ["en", "nb"]);
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    // output image formats
    formats: ["avif", "webp", "jpeg", "auto"],
    // output image widths
    widths: ["auto"],
    svgShortCircuit: "size",
    // optional, attributes assigned on <img> nodes override these values
    htmlOptions: {
      imgAttributes: {
        loading: "lazy",
        decoding: "async"
      },
      pictureAttributes: {}
    }
  });
  eleventyConfig.addPlugin(EleventyRenderPlugin);
  eleventyConfig.addPlugin(syntaxHighlight, {
    // Added in 5.0.0, throw errors on invalid language names
    errorOnInvalidLanguage: false
  });

  eleventyConfig.addPlugin(IdAttributePlugin, {
    selector: "h1,h2,h3,h4,h5,h6", // default

    // swaps html entities (like &amp;) to their counterparts before slugify-ing
    decodeEntities: true,

    // check for duplicate `id` attributes in application code?
    checkDuplicates: "error", // `false` to disable

    // by default we use Eleventy’s built-in `slugify` filter:
    slugify: eleventyConfig.getFilter("slugify")

    // filter: ({ page }) => true;
  });
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin, {
    baseHref: process.env.NODE_ENV === "production" ? publicBaseUrl : "/",
    extensions: "html"
  });
  eleventyConfig.addPlugin(i18n, {
    locales: ["en", "nb"],
    translations,
    fallbackLocales: {
      no: "nb",
      nn: "nb",
      "*": "en"
    }
  });
  eleventyConfig.addPlugin(EleventyI18nPlugin, {
    defaultLanguage: "en",
    // Rename the default universal filter names
    filters: {
      // transform a URL with the current page’s locale code
      url: "locale_url",

      // find the other localized content for a specific input file
      links: "locale_links"
    },
    // When to throw errors for missing localized content files
    // errorMode: "strict" // throw an error if content is missing at /en/slug
    errorMode: "allow-fallback" // only throw an error when the content is missing at both /en/slug and /slug
    // errorMode: "never", // don’t throw errors for missing content
  });
  eleventyConfig.addPlugin(pluginIcons, {
    mode: "inline",
    sources: [
      {
        name: "lucide",
        path: "node_modules/lucide-static/icons",
        default: true
      }
    ]
  });
  // custom collections
  eleventyConfig.addCollection("published_posts", (collection) => {
    return collection
      .getFilteredByTag("post")
      .filter((post) => Boolean(post.data.published))
      .sort((a, b) => b.date - a.date);
  });

  eleventyConfig.addPassthroughCopy("assets/");
  eleventyConfig.addBundle("script", {
    outputFileExtension: "js",
    shortcodeName: "script",
    bundleExportKey: "bundle",
    toFileDirectory: "./assets/"
  });
  eleventyConfig.addBundle("css", {
    outputFileExtension: "css",
    shortcodeName: "css",
    bundleExportKey: "bundle",
    toFileDirectory: "./assets/"
  });
  eleventyConfig.addFilter("datei18n", customFilters.datetime_format);
  eleventyConfig.addFilter("display_name", customFilters.display_name);
  eleventyConfig.addFilter("language_name", customFilters.language_name);
  eleventyConfig.addFilter("region_name", customFilters.region_name);
  eleventyConfig.addFilter("script_name", customFilters.script_name);
  eleventyConfig.addFilter("currency_name", customFilters.currency_name);
  eleventyConfig.addFilter("calendar_name", customFilters.calendar_name);
  eleventyConfig.addFilter(
    "dateTimeField_name",
    customFilters.dateTimeField_name
  );
  eleventyConfig.addFilter("filter_array", customFilters.filter_array);

  // amend markdown features
  eleventyConfig.amendLibrary("md", (mdLib) => {
    mdLib.set({ html: true, breaks: true, typographer: true, linkify: false });
    mdLib.use(markdownItMark);
    mdLib.use(markdownItFootnote);
    mdLib.use(markdownItAnchor, {
      html: false,
      typographer: true,
      xhtmlOut: true,
      permalink: true,
      permalinkClass: "anchor",
      permalinkBefore: false
    });
    // https://github.com/nagaozen/markdown-it-toc-done-right
    mdLib.use(markdownItTocDoneRight, {
      listType: "ol",
      containerClass: "table-of-contents",
      containerId: "toc"
    });
  });

  // Add SCSS support
  eleventyConfig.addTemplateFormats("scss");
  eleventyConfig.addExtension("scss", {
    outputFileExtension: "css", // optional, default: "html"
    // `compile` is called once per .scss file in the input directory
    compile: async function (inputContent) {
      let result = sass.compileString(inputContent, {
        loadPaths: ["."],
        minify: true,
        style: "compressed"
      });

      // This is the render function, `data` is the full data cascade
      return async (data) => {
        return result.css;
      };
    }
  });

  eleventyConfig.addTransform("htmlmin", function (content) {
    if ((this.page.outputPath || "").endsWith(".html")) {
      let minified = htmlmin.minify(content, {
        html5: true,
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
        conservativeCollapse: false,
        minifyJS: true,
        minifyCSS: true
      });

      return minified;
    }

    // If not an HTML output, return content as-is
    return content;
  });
}
