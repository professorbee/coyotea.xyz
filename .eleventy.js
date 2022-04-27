const htmlmin = require("html-minifier");
const CleanCSS = require("clean-css");
const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.notionAuth });

const blockId = process.env.notionBlock;

var mainDescFunction = 

module.exports = function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy({
        "src/_includes/global.css": "./index.css"
    });

    eleventyConfig.addPassthroughCopy("src/*.webp")

    eleventyConfig.addGlobalData("mainDesc", async () => {
        const response = await notion.blocks.children.list({
          block_id: blockId,
          page_size: 50,
        });
        return response.results[0].paragraph.rich_text[0].plain_text;
      })

    eleventyConfig.addGlobalData("linkList", async () => {
        var response = await notion.blocks.children.list({
          block_id: blockId,
          page_size: 50,
        });
        var linkBlock = response.results[1].id
        response = await notion.databases.query({
            database_id: linkBlock,
            page_size: 50,
            sorts: [
                {timestamp: "created_time", direction: "ascending"}
            ]
        })
        var finalResult = []
        for (var i = 0; i < response.results.length; i++) {
            var currentProp = response.results[i].properties
            finalResult[i] = {"title": currentProp.Name.title[0].plain_text, "url": currentProp.Link.url}
        }
        return finalResult;
      })

    eleventyConfig.addTransform("htmlmin", function (content, outputPath) {
        // Eleventy 1.0+: use this.inputPath and this.outputPath instead
        if (outputPath && outputPath.endsWith(".html")) {
            let minified = htmlmin.minify(content, {
                useShortDoctype: true,
                removeComments: true,
                collapseWhitespace: true
            });
            return minified;
        }

        return content;
    });

    return {
        dir: {
            input: "src",
            output: "dist",
            data: "_data",
        },
        passthroughFileCopy: true,
    };
};