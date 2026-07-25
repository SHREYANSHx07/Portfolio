import puppeteer from "puppeteer-core";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const b = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  protocolTimeout: 180000,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--hide-scrollbars", "--window-size=1440,900", "--no-sandbox"],
});
try {
  const p = await b.newPage();
  await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e).slice(0, 140)));
  await p.goto("http://localhost:3100/", { waitUntil: "domcontentloaded", timeout: 90000 });
  await new Promise((r) => setTimeout(r, 5000));

  // wheel until HUD label says ScopeX
  for (let step = 0; step < 80; step++) {
    const current = await p.evaluate(() => {
      const els = [...document.querySelectorAll(".text-cobalt")];
      const hud = els.find((e) => e.parentElement?.textContent?.includes("/ 08"));
      return hud?.textContent?.trim() ?? "";
    });
    if (current === "ScopeX") break;
    await p.mouse.wheel({ deltaY: 420 });
    await new Promise((r) => setTimeout(r, 200));
  }
  await new Promise((r) => setTimeout(r, 3200));
  await p.screenshot({ path: "/tmp/z-flagship-1.png" });
  console.log("shot flagship row 1");

  // scroll a bit further for the second product row
  for (let i = 0; i < 4; i++) {
    await p.mouse.wheel({ deltaY: 500 });
    await new Promise((r) => setTimeout(r, 250));
  }
  await new Promise((r) => setTimeout(r, 2200));
  await p.screenshot({ path: "/tmp/z-flagship-2.png" });
  console.log("shot flagship row 2");

  // open the nearest case study modal
  const btns = await p.$$("#flagship button");
  let clicked = false;
  for (const btn of btns) {
    const label = await btn.evaluate((el) => el.textContent || "");
    if (label.includes("Open case study")) {
      const box = await btn.boundingBox();
      if (box && box.y > 0 && box.y < 860) {
        await btn.click();
        clicked = true;
        break;
      }
    }
  }
  if (!clicked && btns.length) await btns[btns.length - 1].click();
  await new Promise((r) => setTimeout(r, 1800));
  await p.screenshot({ path: "/tmp/z-modal.png" });
  console.log("shot case-study modal");

  console.log("ERRORS:", errs.length ? errs.join(" | ") : "none");
} finally {
  await b.close();
}
