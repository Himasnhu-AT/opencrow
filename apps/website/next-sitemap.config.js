/** @type {import('next-sitemap').IConfig} */

const baseURL = "https://opencrow.himanshuat.com";

module.exports = {
    siteUrl: baseURL,
    generateRobotsTxt: true,
    outDir: "./public",
    generateIndexSitemap: false,
};