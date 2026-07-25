import puppeteer from "puppeteer-core";

const b = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
  protocolTimeout: 180000,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--hide-scrollbars", "--window-size=1440,900", "--no-sandbox"],
});
try {
  const p = await b.newPage();
  await p.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await p.goto("http://localhost:3100/", { waitUntil: "domcontentloaded", timeout: 90000 });
  for (let i = 0; i < 60; i++) {
    const gone = await p.evaluate(() => !document.body.textContent.includes("/ 100"));
    if (gone) break;
    await new Promise((r) => setTimeout(r, 1000));
  }
  await new Promise((r) => setTimeout(r, 2000));

  async function hud() {
    return p.evaluate(() => {
      const els = [...document.querySelectorAll(".text-cobalt")];
      const h = els.find((e) => e.parentElement?.textContent?.includes("/ 08"));
      return h?.textContent?.trim() ?? "";
    });
  }

  // flagship: scroll until the AI agent row (2nd) is in view
  for (let step = 0; step < 90; step++) {
    if ((await hud()) === "ScopeX") break;
    await p.mouse.wheel({ deltaY: 440 });
    await new Promise((r) => setTimeout(r, 160));
  }
  for (let i = 0; i < 6; i++) {
    await p.mouse.wheel({ deltaY: 400 });
    await new Promise((r) => setTimeout(r, 220));
  }
  await new Promise((r) => setTimeout(r, 2200));
  await p.screenshot({ path: "/tmp/img-agent.png" });
  console.log("shot agent row");

  // projects gallery: scrub through panels
  for (let step = 0; step < 40; step++) {
    if ((await hud()) === "Projects") break;
    await p.mouse.wheel({ deltaY: 440 });
    await new Promise((r) => setTimeout(r, 160));
  }
  for (let i = 0; i < 8; i++) {
    await p.mouse.wheel({ deltaY: 420 });
    await new Promise((r) => setTimeout(r, 220));
  }
  await new Promise((r) => setTimeout(r, 2500));
  await p.screenshot({ path: "/tmp/img-gallery.png" });
  console.log("shot gallery");
} finally {
  await b.close();
}
