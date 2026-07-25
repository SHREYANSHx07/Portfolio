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
  p.on("pageerror", (e) => errs.push(String(e).slice(0, 160)));

  await p.goto("http://localhost:3100/", { waitUntil: "domcontentloaded", timeout: 90000 });
  await new Promise((r) => setTimeout(r, 5500)); // preloader + intro fly-in
  await p.screenshot({ path: "/tmp/w-hero.png" });
  console.log("shot hero");

  // wheel down in steps (Lenis-friendly), capturing at section stops
  const stops = [
    { name: "about", wheels: 5 },
    { name: "skills", wheels: 5 },
    { name: "experience", wheels: 7 },
    { name: "projects-1", wheels: 6 },
    { name: "projects-2", wheels: 5 },
    { name: "achievements", wheels: 9 },
    { name: "contact", wheels: 6 },
  ];
  for (const s of stops) {
    for (let i = 0; i < s.wheels; i++) {
      await p.mouse.wheel({ deltaY: 520 });
      await new Promise((r) => setTimeout(r, 260));
    }
    await new Promise((r) => setTimeout(r, 2600));
    await p.screenshot({ path: `/tmp/w-${s.name}.png` });
    console.log("shot", s.name);
  }

  // 404 page
  await p.goto("http://localhost:3100/definitely-missing", { waitUntil: "domcontentloaded" });
  await new Promise((r) => setTimeout(r, 2000));
  await p.screenshot({ path: "/tmp/w-404.png" });
  console.log("shot 404");

  console.log("ERRORS:", errs.length ? errs.join(" | ") : "none");
} finally {
  await b.close();
}
