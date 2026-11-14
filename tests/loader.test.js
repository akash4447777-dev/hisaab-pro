/* index.html loader — jsdom tests */
const fs = require("fs");
const path = require("path");
const { JSDOM, VirtualConsole } = require("jsdom");

const FILE = path.join(__dirname, "..", "index.html");
const html = fs.readFileSync(FILE, "utf8");

let fails = 0;
function ok(c, l, e) {
  if (c) console.log("  \u2705 " + l);
  else { fails++; console.log("  \u274C " + l + (e !== undefined ? " \u2192 " + JSON.stringify(e) : "")); }
}

function makeDom({ files, apiStatus = 200, url = "https://akash4447777-dev.github.io/hisaab-pro/" }) {
  const vc = new VirtualConsole();
  const calls = [];
  let redirected = null;
  const dom = new JSDOM(html, {
    runScripts: "dangerously", pretendToBeVisual: true, url, virtualConsole: vc,
    beforeParse(w) {
      w.fetch = (u, opts) => {
        calls.push(String(u) + " " + ((opts && opts.method) || "GET"));
        if (String(u).indexOf("api.github.com") === 0) {
          if (apiStatus !== 200) return Promise.resolve({ ok: false, status: apiStatus, json: () => Promise.resolve({}) });
          return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(files) });
        }
        // HEAD probe of a panel file
        const name = decodeURIComponent(String(u).split("/").pop());
        const hit = (files || []).some((f) => f.name === name);
        return Promise.resolve({ ok: hit, status: hit ? 200 : 404 });
      };
      w.__getRedirect = () => redirected;
      w.__calls = calls;
      w.__setRedirect = (u) => { redirected = u; };
    }
  });
  /* boot() ka navigation async hai — constructor ke turant baad nav stub karo */
  dom.window.__loader._nav = (u) => { redirected = u; };
  return dom;
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async function () {
  console.log("\n\u25b8 version picking logic");
  {
    /* ek valid file do taaki boot redirect kar de, probe chain na chale */
    const dom = makeDom({ files: [{ name: "Hisaab-Pro-v3.1.html", type: "file", size: 1 }] });
    const L = dom.window.__loader;
    ok(L.verOf("Hisaab-Pro-v3.1.html").major === 3 && L.verOf("Hisaab-Pro-v3.1.html").minor === 1, "verOf v3.1");
    ok(L.verOf("Hisaab-Pro-v2.0.html").major === 2, "verOf v2.0");
    ok(L.verOf("Hisaab-Pro-v3.1 (1).html").copy === 1, "verOf '(1)' suffix");
    ok(L.verOf("hisaab_v3.html") === null, "verOf rejects unversioned");
    ok(L.verOf("index.html") === null, "verOf rejects index");
    ok(L.pickFromList([
      { name: "Hisaab-Pro-v2.0.html", size: 1 },
      { name: "Hisaab-Pro-v3.1.html", size: 2 },
      { name: "Hisaab-Pro-v2.9.html", size: 9 },
      { name: "index.html", size: 99 },
      { name: "README.md", size: 5 }
    ]) === "Hisaab-Pro-v3.1.html", "sabse naya version chuna (v3.1, size ignore)");
    ok(L.pickFromList([
      { name: "Hisaab-Pro-v3.1.html", size: 1 },
      { name: "Hisaab-Pro-v3.1 (2).html", size: 1 }
    ]) === "Hisaab-Pro-v3.1 (2).html", "copy-number (2) > plain");
    ok(L.pickFromList([
      { name: "index.html", size: 9 },
      { name: "index (2).html", size: 139020 },
      { name: "hisaab_v3.html", size: 319379 },
      { name: "hisaab_v2.html", size: 142403 }
    ]) === "hisaab_v3.html", "version-naam na mile to sabse badi HTML (index exclude)");
    ok(L.pickFromList([{ name: "README.md" }]) === null, "kuch na mile to null");
    ok(L.base() === "/hisaab-pro/", "base path", L.base());
    ok(L.ownerRepo()[0] === "akash4447777-dev" && L.ownerRepo()[1] === "hisaab-pro", "owner/repo parse", L.ownerRepo());
    ok(L.urlFor("Hisaab-Pro-v3.1 (1).html") === "/hisaab-pro/Hisaab-Pro-v3.1%20(1).html", "space encode", L.urlFor("Hisaab-Pro-v3.1 (1).html"));
    await wait(150);
    dom.window.close();
  }

  console.log("\n\u25b8 boot: API se list \u2192 redirect");
  {
    const files = [
      { name: "index.html", type: "file", size: 9000 },
      { name: "Hisaab-Pro-v2.0.html", type: "file", size: 143224 },
      { name: "Hisaab-Pro-v3.1.html", type: "file", size: 319379 },
      { name: "hisaab_v3.html", type: "file", size: 319379 },
      { name: "VERSIONS.md", type: "file", size: 2000 }
    ];
    const dom = makeDom({ files });
    await wait(120);
    ok(dom.window.__getRedirect() === "/hisaab-pro/Hisaab-Pro-v3.1.html",
       "Hisaab-Pro-v3.1.html par redirect", dom.window.__getRedirect());
    ok(dom.window.__calls.some((c) => c.indexOf("https://api.github.com/repos/akash4447777-dev/hisaab-pro/contents/") === 0),
       "GitHub contents API use hui", dom.window.__calls);
    ok(dom.window.localStorage.getItem("hisaabPro.loader.v1") === "Hisaab-Pro-v3.1.html", "choice cache hua");
    await wait(80);
    dom.window.close();
  }

  console.log("\n\u25b8 boot: API fail \u2192 HEAD probe fallback");
  {
    const files = [
      { name: "Hisaab-Pro-v3.1.html", type: "file", size: 319379 },
      { name: "Hisaab-Pro-v2.0.html", type: "file", size: 143224 }
    ];
    const dom = makeDom({ files, apiStatus: 403 });
    await wait(300);
    ok(dom.window.__getRedirect() === "/hisaab-pro/Hisaab-Pro-v3.1.html",
       "API band ho to probe se v3.1 mila", dom.window.__getRedirect());
    await wait(80);
    dom.window.close();
  }

  console.log("\n\u25b8 boot: API fail + sirf purana version maujood");
  {
    const files = [{ name: "Hisaab-Pro-v2.0.html", type: "file", size: 143224 }];
    const dom = makeDom({ files, apiStatus: 500 });
    await wait(400);
    ok(dom.window.__getRedirect() === "/hisaab-pro/Hisaab-Pro-v2.0.html",
       "candidate list me se jo mila wahi khula", dom.window.__getRedirect());
    await wait(80);
    dom.window.close();
  }

  console.log("\n\u25b8 boot: kuch nahi mila \u2192 error card");
  {
    const dom = makeDom({ files: [], apiStatus: 500 });
    await wait(500);
    ok(dom.window.__getRedirect() === null, "koi redirect nahi");
    ok(dom.window.document.getElementById("err").hidden === false, "error card dikha");
    ok(dom.window.document.getElementById("errBtns").children.length >= 6, "direct links + retry mile");
    await wait(80);
    dom.window.close();
  }

  console.log("\n\u25b8 file:// mode");
  {
    const dom = makeDom({ files: [], url: "file:///sdcard/Download/index.html" });
    await wait(100);
    ok(dom.window.document.getElementById("err").hidden === false, "file mode me chooser dikha");
    ok(dom.window.document.getElementById("errBtns").textContent.indexOf("Hisaab-Pro-v3.1.html") >= 0, "v3.1 link pehla");
    await wait(80);
    dom.window.close();
  }

  console.log("\n" + (fails ? "\u274C " + fails + " FAIL" : "\u2705 LOADER SAB TESTS PASS"));
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error("HARNESS ERROR", e); process.exit(2); });
