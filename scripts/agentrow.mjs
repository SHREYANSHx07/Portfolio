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

  for (let step = 0; step < 140; step++) {
    const top = await p.evaluate(() => {
      const h3s = [...document.querySelectorAll("#flagship h3")];
      const el = h3s.find((e) => (e.textContent || "").includes("AI Customer Support Agent"));
      return el ? el.getBoundingClientRect().top : 9999;
    });
    if (top > 120 && top < 520) break;
    const delta = top > 520 || top === 9999 ? 400 : -180;
    await p.mouse.wheel({ deltaY: delta });
    await new Promise((r) => setTimeout(r, 170));
  }
  await new Promise((r) => setTimeout(r, 2600));
  await p.screenshot({ path: "/tmp/img-agent2.png" });
  console.log("done");
} finally {
  await b.close();
}
