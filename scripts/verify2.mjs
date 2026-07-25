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
  await new Promise((r) => setTimeout(r, 5000));

  // wheel until the store-driven section (read from HUD label) matches
  async function goTo(label, file, extraSettle = 3000) {
    for (let step = 0; step < 80; step++) {
      const current = await p.evaluate(() => {
        const els = [...document.querySelectorAll(".text-cobalt")];
        const hud = els.find((e) => e.parentElement?.textContent?.includes("/ 08"));
        return hud?.textContent?.trim() ?? "";
      });
      if (current.toLowerCase() === label.toLowerCase()) break;
      await p.mouse.wheel({ deltaY: 420 });
      await new Promise((r) => setTimeout(r, 220));
    }
    await new Promise((r) => setTimeout(r, extraSettle));
    await p.screenshot({ path: file });
    console.log("captured", label);
  }

  await goTo("Skills", "/tmp/x-skills.png");
  // hover a chip to test node highlight
  const chip = await p.$("#skills button");
  if (chip) {
    await chip.hover();
    await new Promise((r) => setTimeout(r, 1200));
    await p.screenshot({ path: "/tmp/x-skills-hover.png" });
    console.log("captured skills hover");
  }
  await goTo("Awards", "/tmp/x-awards.png", 3500);
  console.log("done");
} finally {
  await b.close();
}
