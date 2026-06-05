// Render Abdulrahman's engineer portfolio (main + project pages) and his CV PDF
// HTML (with QR → live page). Writes:
//   /tmp/abd-publish.json  { generatedHtml, generatedProjectPages }
//   /tmp/abd-cv.html       printable CV HTML
//
// Run: npx tsx scripts/render-abdulrahman.mts

import { writeFileSync } from "node:fs";
import QRCode from "qrcode";
import {
  renderEngineerTemplate,
  renderAllProjectDetailPages,
  renderCvPdf,
} from "../src/lib/template-engine";
import { toPortfolioData } from "../src/lib/portfolio-data";
import { ABDULRAHMAN_PORTFOLIO, ABDULRAHMAN_SLUG } from "../convex/seedData/abdulrahman";

const liveUrl = `https://portfolio-trimind.com/p/${ABDULRAHMAN_SLUG}`;

// Shape a portfolio "doc" the way Convex would store it, then map to render data.
const portfolioDoc: any = {
  ...ABDULRAHMAN_PORTFOLIO,
  status: "published",
  slug: ABDULRAHMAN_SLUG,
};

const data: any = toPortfolioData(portfolioDoc, "en");
// toPortfolioData omits slug (it only emits portfolioUrl); detail renderer needs it.
data.slug = ABDULRAHMAN_SLUG;

const generatedHtml = renderEngineerTemplate(data);
const generatedProjectPages = renderAllProjectDetailPages(data);

writeFileSync(
  "/tmp/abd-publish.json",
  JSON.stringify({ generatedHtml, generatedProjectPages })
);

const qrDataUrl = await QRCode.toDataURL(liveUrl, {
  errorCorrectionLevel: "H",
  margin: 1,
  width: 320,
  color: { dark: "#0f172a", light: "#ffffff" },
});

const cvHtml = renderCvPdf({ ...data, slug: ABDULRAHMAN_SLUG, portfolioUrl: liveUrl }, {
  qrDataUrl,
  liveUrl,
});
writeFileSync("/tmp/abd-cv.html", cvHtml);

console.log(
  `rendered: portfolio ${generatedHtml.length}b, ${generatedProjectPages.length} project page(s), cv ${cvHtml.length}b`
);
