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
  await p.goto("http://localhost:3100/", { waitUntil: "domcontentloaded", timeout: 90000 });

  // wait for preloader to fully unmount
  for (let i = 0; i < 60; i++) {
    const gone = await p.evaluate(() => !document.body.textContent.includes("/ 100"));
    if (gone) break;
    await new Promise((r) => setTimeout(r, 1000));
  }
  await new Promise((r) => setTimeout(r, 2500));

  async function goTo(label, file) {
    for (let step = 0; step < 90; step++) {
      const cur = await p.evaluate(() => {
        const els = [...document.querySelectorAll(".text-cobalt")];
        const hud = els.find((e) => e.parentElement?.textContent?.includes("/ 08"));
        return hud?.textContent?.trim() ?? "";
      });
      if (cur === label) break;
      await p.mouse.wheel({ deltaY: 440 });
      await new Promise((r) => setTimeout(r, 180));
    }
    await new Promise((r) => setTimeout(r, 3200));
    await p.screenshot({ path: file });
    console.log("captured", label);
  }

  await goTo("About", "/tmp/s2-about.png");
  await goTo("ScopeX", "/tmp/s2-flagship.png");
  await goTo("Contact", "/tmp/s2-contact.png");
  console.log("done");
} finally {
  await b.close();
}
