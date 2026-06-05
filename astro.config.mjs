// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// GitHub Pages (project site) until the custom domain is live. To switch to
// universalmemoryprotocol.io: set site to it, set base to "/", add public/CNAME.
const site = "https://edihasaj.github.io";
const base = "/universal-memory-protocol-docs";
const ogImage = `${site}${base}/og.png`;

export default defineConfig({
  site,
  base,
  integrations: [
    starlight({
      title: "Universal Memory Protocol",
      description:
        "An open standard for agent memory. What MCP did for tools, UMP does for memory.",
      logo: { src: "./src/assets/ump-mark.svg", replacesTitle: false },
      favicon: "/favicon.svg",
      customCss: ["./src/styles/theme.css"],
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/edihasaj/universal-memory-protocol",
        },
      ],
      head: [
        { tag: "meta", attrs: { property: "og:image", content: ogImage } },
        { tag: "meta", attrs: { property: "og:image:width", content: "1200" } },
        { tag: "meta", attrs: { property: "og:image:height", content: "630" } },
        { tag: "meta", attrs: { name: "twitter:card", content: "summary_large_image" } },
        { tag: "meta", attrs: { name: "twitter:image", content: ogImage } },
        {
          tag: "link",
          attrs: { rel: "preconnect", href: "https://fonts.googleapis.com" },
        },
        {
          tag: "link",
          attrs: {
            rel: "preconnect",
            href: "https://fonts.gstatic.com",
            crossorigin: true,
          },
        },
        {
          tag: "link",
          attrs: {
            rel: "stylesheet",
            href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Hanken+Grotesk:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap",
          },
        },
      ],
      sidebar: [
        {
          label: "Start here",
          items: [
            { label: "Introduction", link: "/introduction/" },
            { label: "Quickstart", link: "/quickstart/" },
          ],
        },
        {
          label: "The standard",
          items: [
            { label: "Specification", link: "/specification/" },
            { label: "Conformance", link: "/conformance/" },
            { label: "Ecosystem & positioning", link: "/ecosystem/" },
          ],
        },
        {
          label: "Background",
          items: [
            { label: "Rationale & landscape", link: "/rationale/" },
            { label: "Adoption & roadmap", link: "/adoption/" },
          ],
        },
      ],
    }),
  ],
});
