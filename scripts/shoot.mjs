import puppeteer from "puppeteer-core";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const URL = process.env.URL || "http://localhost:3000/";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: [
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--hide-scrollbars",
    "--window-size=1440,900",
  ],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(URL, { waitUntil: "networkidle2", timeout: 60000 });

// Wait for preloader to finish (body overflow restored) + settle.
await new Promise((r) => setTimeout(r, 3500));

const sections = ["hero", "about", "skills", "experience", "projects", "achievements", "contact"];
for (const id of sections) {
  await page.evaluate((sid) => {
    const el = sid === "hero" ? document.body : document.getElementById(sid);
    el?.scrollIntoView({ behavior: "instant", block: "start" });
    if (sid === "hero") window.scrollTo(0, 0);
  }, id);
  await new Promise((r) => setTimeout(r, 1600));
  await page.screenshot({ path: `/tmp/shot-${id}.png` });
  console.log("shot", id);
}

// console errors
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
await new Promise((r) => setTimeout(r, 300));
console.log("ERRORS:", errors.length ? errors.join(" | ") : "none");

await browser.close();
