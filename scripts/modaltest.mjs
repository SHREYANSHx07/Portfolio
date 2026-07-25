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

  // navigate to ScopeX flagship section
  for (let step = 0; step < 90; step++) {
    const cur = await p.evaluate(() => {
      const els = [...document.querySelectorAll(".text-cobalt")];
      const hud = els.find((e) => e.parentElement?.textContent?.includes("/ 08"));
      return hud?.textContent?.trim() ?? "";
    });
    if (cur === "ScopeX") break;
    await p.mouse.wheel({ deltaY: 440 });
    await new Promise((r) => setTimeout(r, 160));
  }
  await new Promise((r) => setTimeout(r, 1500));

  // keep nudging until a case-study button is in view, then click it
  let opened = false;
  for (let i = 0; i < 30 && !opened; i++) {
    opened = await p.evaluate(() => {
      const btns = [...document.querySelectorAll("#flagship button")];
      const btn = btns.find((el) => {
        const r = el.getBoundingClientRect();
        return el.textContent?.includes("Open case study") && r.top > 60 && r.top < 800;
      });
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    if (!opened) {
      await p.mouse.wheel({ deltaY: 320 });
      await new Promise((r) => setTimeout(r, 220));
    }
  }
  console.log("modal opened:", opened);
  await new Promise((r) => setTimeout(r, 1500));

  const before = await p.evaluate(() => ({
    pageY: window.scrollY,
    modalTop: document.querySelector("[data-lenis-prevent]")?.scrollTop ?? -1,
  }));

  // wheel over the modal center
  await p.mouse.move(720, 500);
  for (let i = 0; i < 6; i++) {
    await p.mouse.wheel({ deltaY: 300 });
    await new Promise((r) => setTimeout(r, 150));
  }
  await new Promise((r) => setTimeout(r, 800));

  const after = await p.evaluate(() => ({
    pageY: window.scrollY,
    modalTop: document.querySelector("[data-lenis-prevent]")?.scrollTop ?? -1,
  }));

  console.log("before:", JSON.stringify(before));
  console.log("after :", JSON.stringify(after));
  const modalScrolled = after.modalTop > before.modalTop + 50;
  const pageLocked = Math.abs(after.pageY - before.pageY) < 5;
  console.log("MODAL SCROLLED:", modalScrolled, "| PAGE LOCKED:", pageLocked);
  await p.screenshot({ path: "/tmp/modal-scroll.png" });

  // close the modal, confirm page scroll resumes
  await p.keyboard.press("Escape").catch(() => {});
  await p.evaluate(() => {
    const closeBtn = [...document.querySelectorAll("button")].find((b) => b.getAttribute("aria-label") === "Close");
    closeBtn?.click();
  });
  await new Promise((r) => setTimeout(r, 1200));
  const y1 = await p.evaluate(() => window.scrollY);
  await p.mouse.wheel({ deltaY: 600 });
  await new Promise((r) => setTimeout(r, 1200));
  const y2 = await p.evaluate(() => window.scrollY);
  console.log("PAGE RESUMES AFTER CLOSE:", y2 > y1 + 50, `(${y1} -> ${y2})`);
} finally {
  await b.close();
}
