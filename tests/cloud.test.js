/* v3.17: two independent browsers against a Supabase-compatible, RLS-scoped
   in-memory server. No live project, network, password or real user data used. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM, VirtualConsole } = require("jsdom");
const FILE = process.env.HISAAB_HTML || path.join(__dirname, "..", "hisaab_v3.html");
const html = fs.readFileSync(FILE, "utf8");
const KEY = "hisaabPro.v1", CFG = "hisaabPro.cloud.v1", OWNER = "hisaabPro.owner.v1";
const A = { id: "account-a", email: "a@example.test" }, B = { id: "account-b", email: "b@example.test" };
const URL = "https://test-project.supabase.co";
const copy = (x) => x === undefined ? undefined : JSON.parse(JSON.stringify(x));
const sleep = (ms = 0) => new Promise((r) => setTimeout(r, ms));
function deferred() { let resolve; const promise = new Promise((r) => { resolve = r; }); return { promise, resolve }; }
function ctEntry(id, amount = 2800) {
  return { id, date: "2026-11-14", kind: "purchase", mode: "total", amount, paid: 0, items: [],
    party: "Supplier " + id, billNo: "", note: "", payMode: "cash", createdAt: 1, updatedAt: 1, photo: "" };
}
function data(entries = [], workers = []) {
  return { settings: { shopName: "Real Shop" }, workers, records: [],
    canteen: { entries: entries.map((x) => typeof x === "string" ? ctEntry(x) : x), rates: [], log: [], demo: false } };
}
function worker(id = "worker-a") { return { id, name: "Worker " + id, type: "monthly", rate: 18000, active: true, role: "", phone: "", note: "" }; }
function record(id = "record-a") { return { id, workerId: "worker-a", year: 2026, month: 10, presentDays: 24, absentDays: 2, totalHours: 0,
  includeSundays: false, bonus: 0, advances: [], deductions: [], note: "", status: "pending", paidOn: "", updatedAt: 1 }; }

class Server {
  constructor(payload, user = A) {
    this.rows = new Map(); this.reads = 0; this.writes = []; this.attempts = []; this.upserts = 0;
    this.failRead = null; this.failWrite = null; this.onRead = null; this.onWrite = null;
    if (payload) this.set(user, payload);
  }
  set(user, payload, stamp = "2026-11-14T10:00:00.000Z") { this.rows.set(user.id, { user_id: user.id, payload: copy(payload), updated_at: stamp }); }
  get(user = A) { return copy(this.rows.get(user.id)); }
  client(sessionUser = null) {
    const db = this; let session = sessionUser;
    return {
      auth: {
        getSession: async () => ({ data: { session: session ? { user: session } : null }, error: null }),
        signInWithPassword: async ({ email }) => { session = email === B.email ? B : A; return { data: { user: session, session: { user: session } }, error: null }; },
        signUp: async ({ email }) => { session = email === B.email ? B : A; return { data: { user: session, session: { user: session } }, error: null }; },
        signOut: async () => { session = null; return { error: null }; }
      },
      from(table) {
        assert.equal(table, "hisaab_data");
        const query = {
          mode: "read", filters: [], value: null,
          select() { return this; }, eq(k, v) { this.filters.push([k, v]); return this; },
          is(k, v) { return this.eq(k, v); },
          update(v) { this.mode = "update"; this.value = copy(v); return this; },
          insert(v) { this.mode = "insert"; this.value = copy(v); return this; },
          async upsert(v) { db.upserts++; db.rows.set(v.user_id, copy(v)); return { data: copy(v), error: null }; },
          async maybeSingle() {
            const userId = this.value && this.value.user_id || (this.filters.find(([k]) => k === "user_id") || [])[1];
            if (!session || session.id !== userId) return { data: null, error: { code: "42501", message: "RLS test denied" } };
            if (this.mode === "read") {
              db.reads++;
              if (db.onRead) await db.onRead({ query: this, userId });
              if (db.failRead) return { data: null, error: db.failRead };
              const r = db.rows.get(userId);
              return { data: r ? { payload: copy(r.payload), updated_at: r.updated_at } : null, error: null };
            }
            db.attempts.push({ mode: this.mode, filters: copy(this.filters), userId, value: copy(this.value) });
            if (db.onWrite) await db.onWrite({ query: this, userId });
            if (db.failWrite) return { data: null, error: db.failWrite };
            const existing = db.rows.get(userId);
            if (this.mode === "insert" && existing) return { data: null, error: { code: "23505", message: "duplicate user_id" } };
            if (this.mode === "update" && (!existing || this.filters.some(([k, v]) => existing[k] !== v))) return { data: null, error: null };
            const next = { user_id: userId, ...copy(this.value) };
            db.rows.set(userId, next); db.writes.push(copy(next));
            return { data: { payload: copy(next.payload), updated_at: next.updated_at }, error: null };
          }
        };
        return query;
      }
    };
  }
}
const devices = [], runtimeErrors = [];
async function device(db, options = {}) {
  const errors = [], vc = new VirtualConsole();
  vc.on("jsdomError", (e) => { if (!/Not implemented: navigation/.test(e.message)) { errors.push(e.message); runtimeErrors.push(e.message); } });
  const client = db.client(options.session || null);
  if (options.client) options.client(client);
  const dom = new JSDOM(html, {
    runScripts: "dangerously", pretendToBeVisual: true, url: "https://example.test/hisaab/", virtualConsole: vc,
    beforeParse(w) {
      w.scrollTo = () => {}; w.print = () => {};
      w.URL.createObjectURL = () => "blob:test"; w.URL.revokeObjectURL = () => {};
      w.localStorage.setItem(CFG, JSON.stringify({ url: options.project || URL, key: "test-only-public-anon-key-not-a-real-secret" }));
      if (options.storage) Object.entries(options.storage).forEach(([k, v]) => w.localStorage.setItem(k, v));
      if (options.payload) w.localStorage.setItem(KEY, JSON.stringify(options.payload));
      if (options.raw) w.localStorage.setItem(KEY, options.raw);
      w.supabase = { createClient: () => client };
    }
  });
  const H = dom.window.Hisaab;
  assert.ok(H, "app must boot");
  const d = { dom, w: dom.window, H, C: H.Cloud, S: H.Store, client, errors,
    dump() { return Object.fromEntries(Object.keys(this.w.localStorage).map((k) => [k, this.w.localStorage.getItem(k)])); },
    ids() { return Array.from(this.S.data.canteen.entries, (e) => e.id).sort(); },
    async login(user = A) { return this.C.signIn(user.email, "test-only-password"); },
    edit(id, amount) { const e = this.S.data.canteen.entries.find((x) => x.id === id); assert.ok(e); e.amount = amount; e.updatedAt++; assert.equal(this.S.save(true), true); },
    add(id) { this.S.data.canteen.entries.push(ctEntry(id)); assert.equal(this.S.save(true), true); },
    click(sel) { const el = this.w.document.querySelector(sel); assert.ok(el, sel); el.click(); },
    close() { clearTimeout(this.C.pushTimer); this.C.resetSession(); this.dom.window.close(); }
  };
  devices.push(d);
  if (!options.delayedBoot) await sleep(1);
  if (options.session && !options.delayedBoot) { if (d.C.task) await d.C.task; await sleep(1); }
  return d;
}
let passed = 0, failed = 0;
async function test(name, run) {
  const start = devices.length;
  try { await run(); passed++; console.log("  ✅ " + name); }
  catch (e) { failed++; console.error("  ❌ " + name + "\n     " + (e.stack || e.message)); }
  finally { devices.splice(start).forEach((d) => d.close()); }
}
function rowIds(db, user = A) { return db.get(user).payload.canteen.entries.map((e) => e.id).sort(); }
function noOverwrite(db) { assert.equal(db.upserts, 0, "unsafe upsert must NEVER be used"); }
function closedDialog(d) { d.w.document.getElementById("modalRoot").innerHTML = ""; }

(async () => {
  console.log("\n▸ v3.17 — login, canteen-only and read-before-write regressions");
  await test("fresh second device downloads canteen-only cloud (zero workers) without a write", async () => {
    const db = new Server(data(["real-bill"])), d = await device(db);
    assert.equal(await d.login(), true); assert.deepEqual(d.ids(), ["real-bill"]);
    assert.equal(d.S.data.workers.length, 0); assert.equal(db.writes.length, 0); assert.equal(d.C.dirty, false); noOverwrite(db);
  });
  await test("automatic saved-session boot uses the SAME handshake as explicit login", async () => {
    const db = new Server(data(["real-bill"])), d = await device(db, { session: A });
    assert.deepEqual(d.ids(), ["real-bill"]); assert.equal(db.writes.length, 0); assert.equal(d.C.status, "synced");
  });
  for (const section of ["records", "rates", "log", "settings"]) await test(section + "-only account is not mistaken for an empty account", async () => {
    const payload = data();
    if (section === "records") payload.records.push(record());
    if (section === "rates") payload.canteen.rates.push({ id: "rate1", name: "Milk", unit: "ltr", rate: 58 });
    if (section === "log") payload.canteen.log.push({ id: "log1", ts: 1, action: "delete", text: "old bill", snapshot: ctEntry("deleted") });
    if (section === "settings") payload.settings.shopName = "My custom shop";
    const db = new Server(payload), d = await device(db); await d.login();
    assert.equal(db.writes.length, 0); assert.equal(d.S.data.settings.shopName, payload.settings.shopName);
    assert.equal(d.H.sync.counts(d.S.data)[section === "settings" ? "workers" : section], section === "settings" ? 0 : 1);
  });
  await test("brand-new account does NOT upload the automatically generated demo", async () => {
    const db = new Server(), d = await device(db); await d.login();
    assert.equal(db.writes.length, 0); assert.equal(db.get(), undefined); assert.equal(d.S.data.workers.length, 0);
    d.add("first-real-bill"); await d.C.pushNow(); assert.deepEqual(rowIds(db), ["first-real-bill"]); noOverwrite(db);
  });
  await test("unmodified legacy sample also never uploads", async () => {
    const db = new Server(), first = await device(db), legacy = copy(first.S.data);
    const d = await device(db, { payload: legacy }); await d.login();
    assert.equal(db.writes.length, 0); assert.equal(d.S.data.workers.length, 0);
  });
  await test("real canteen edits survive an old stale settings.demo=true flag", async () => {
    const local = data(["local-real"]); local.settings.demo = true; local.canteen.demo = false;
    const db = new Server(data(["remote-real"])), d = await device(db, { payload: local });
    await d.login(); assert.deepEqual(rowIds(db), ["local-real", "remote-real"]); assert.deepEqual(d.ids(), rowIds(db));
  });
  await test("salary edits to a demo make it user data (not thrown away at login)", async () => {
    const db = new Server(), d = await device(db); const id = d.S.data.workers[0].id;
    d.S.data.workers[0].rate = 43210; assert.equal(d.S.save(true), true); await d.login();
    assert.equal(db.get().payload.workers.find((w) => w.id === id).rate, 43210);
  });
  await test("cloud pull/adoption is local-only: no dirty flag, echo push or ping-pong", async () => {
    const db = new Server(data(["one"])), a = await device(db), b = await device(db);
    await a.login(); await b.login(); await a.C.maybePull(true); await b.C.maybePull(true);
    assert.equal(a.C.dirty, false); assert.equal(b.C.dirty, false); assert.equal(db.writes.length, 0);
  });
  await test("boot/local migration never sends demo before the first cloud read", async () => {
    const gate = deferred(), db = new Server(data(["real"])); db.onRead = () => gate.promise;
    const d = await device(db), auth = d.login(); await sleep();
    d.S.data.settings.theme = "dark"; d.S.save(true); assert.equal(db.attempts.length, 0);
    gate.resolve(); await auth; assert.deepEqual(d.ids(), ["real"]); assert.equal(db.writes.length, 0);
  });

  console.log("\n▸ concurrent devices, known baselines and compare-and-set");
  await test("offline additions on A and B are merged; neither device replaces the other", async () => {
    const db = new Server(data(["base"])), a = await device(db), b = await device(db);
    await a.login(); await b.login(); a.add("A"); b.add("B");
    await a.C.pushNow(); await b.C.pushNow(); await a.C.maybePull();
    assert.deepEqual(rowIds(db), ["A", "B", "base"]); assert.deepEqual(a.ids(), b.ids()); noOverwrite(db);
  });
  await test("simultaneous writes use expected updated_at; loser re-fetches and merges", async () => {
    const db = new Server(data(["base"])), a = await device(db), b = await device(db);
    await a.login(); await b.login(); a.add("A"); b.add("B");
    const gate = deferred(); let arrived = 0;
    db.onWrite = async () => { if (++arrived === 2) gate.resolve(); if (arrived <= 2) await gate.promise; };
    assert.deepEqual(await Promise.all([a.C.pushNow(), b.C.pushNow()]), [true, true]);
    assert.deepEqual(rowIds(db), ["A", "B", "base"]); assert.ok(db.attempts.length >= 3);
    db.attempts.filter((x) => x.mode === "update").forEach((x) => assert.ok(x.filters.some(([k]) => k === "updated_at"))); noOverwrite(db);
  });
  await test("simultaneous FIRST insert cannot upsert over a row created by another device", async () => {
    const db = new Server(), a = await device(db), b = await device(db); await a.login(); await b.login();
    a.add("A"); b.add("B"); const gate = deferred(); let arrived = 0;
    db.onWrite = async () => { if (++arrived === 2) gate.resolve(); if (arrived <= 2) await gate.promise; };
    await Promise.all([a.C.pushNow(), b.C.pushNow()]);
    assert.deepEqual(rowIds(db), ["A", "B"]); noOverwrite(db);
  });
  await test("saving during a request remains dirty and is sent by a second request", async () => {
    const db = new Server(data(["base"])), d = await device(db); await d.login(); d.add("first");
    const entered = deferred(), release = deferred(); let once = true;
    db.onWrite = async () => { if (once) { once = false; entered.resolve(); await release.promise; } };
    const push = d.C.pushNow(); await entered.promise; d.add("during-flight"); assert.equal(d.C.dirty, true);
    release.resolve(); await push;
    assert.deepEqual(rowIds(db), ["base", "during-flight", "first"]); assert.equal(d.C.dirty, false); assert.equal(db.writes.length, 2);
  });
  await test("opposite clock skew does not hide remote changes or overwrite them", async () => {
    const db = new Server(data(["base"])), a = await device(db), b = await device(db); await a.login(); await b.login();
    db.set(A, data(["base", "future-clock"]), "2090-01-01T00:00:00.000Z");
    a.add("A"); await a.C.pushNow(); await b.C.maybePull(true);
    assert.deepEqual(b.ids(), ["A", "base", "future-clock"]); assert.ok(db.get().updated_at > "2090-01-01T00:00:00.000Z");
  });
  await test("disjoint changes within an existing bill merge at field level", async () => {
    const db = new Server(data(["bill"])), a = await device(db), b = await device(db); await a.login(); await b.login();
    a.edit("bill", 3100); b.S.data.canteen.entries[0].note = "New note"; b.S.save(true);
    await a.C.pushNow(); await b.C.pushNow(); const bill = db.get().payload.canteen.entries[0];
    assert.equal(bill.amount, 3100); assert.equal(bill.note, "New note");
  });
  await test("different financial edits pause; closing the dialog never resumes overwrite", async () => {
    const db = new Server(data(["bill"])), a = await device(db), b = await device(db); await a.login(); await b.login();
    a.edit("bill", 3000); b.edit("bill", 4000); await a.C.pushNow(); assert.equal(await b.C.pushNow(), false);
    assert.equal(b.C.status, "conflict"); assert.equal(db.get().payload.canteen.entries[0].amount, 3000);
    const writes = db.writes.length; closedDialog(b); b.add("pending-b"); await b.C.pushNow(); await b.C.maybePull(true);
    assert.equal(db.writes.length, writes); assert.equal(b.S.data.canteen.entries.find((e) => e.id === "bill").amount, 4000);
    await b.C.resolve("local"); assert.equal(db.get().payload.canteen.entries.find((e) => e.id === "bill").amount, 4000);
    assert.ok(rowIds(db).includes("pending-b")); assert.ok(b.H.Recovery.list().length > 0);
  });
  await test("choose cloud values means conflicting FIELDS, not discard all local rows", async () => {
    const db = new Server(data(["bill"])), a = await device(db), b = await device(db); await a.login(); await b.login();
    a.edit("bill", 3000); a.add("only-a"); b.edit("bill", 4000); b.add("only-b");
    await a.C.pushNow(); await b.C.pushNow(); await b.C.resolve("remote");
    assert.deepEqual(rowIds(db), ["bill", "only-a", "only-b"]);
    assert.equal(db.get().payload.canteen.entries.find((e) => e.id === "bill").amount, 3000);
  });
  await test("conflict choice re-fetches: a newly added remote entry is never erased", async () => {
    const db = new Server(data(["bill"])), a = await device(db), b = await device(db); await a.login(); await b.login();
    a.edit("bill", 3000); b.edit("bill", 4000); await a.C.pushNow(); await b.C.pushNow();
    a.add("added-after-dialog"); await a.C.pushNow(); await b.C.resolve("local");
    assert.ok(rowIds(db).includes("added-after-dialog"));
  });
  await test("known intentional deletes propagate without resurrecting stale rows", async () => {
    const db = new Server(data(["remove", "keep"])), a = await device(db), b = await device(db); await a.login(); await b.login();
    a.S.data.canteen.entries = a.S.data.canteen.entries.filter((e) => e.id !== "remove"); a.S.save(true); await a.C.pushNow();
    b.add("new-b"); await b.C.pushNow(); assert.deepEqual(rowIds(db), ["keep", "new-b"]);
  });
  await test("edit-versus-delete is a conflict; it is not guessed from timestamps", async () => {
    const db = new Server(data(["remove", "keep"])), a = await device(db), b = await device(db); await a.login(); await b.login();
    a.S.data.canteen.entries = a.S.data.canteen.entries.filter((e) => e.id !== "remove"); a.S.save(true); b.edit("remove", 9999);
    await a.C.pushNow(); assert.equal(await b.C.pushNow(), false); assert.equal(b.C.status, "conflict");
  });
  await test("legacy accidental empty cloud never clears a populated device", async () => {
    const db = new Server(data(["keep"])), d = await device(db); await d.login();
    db.set(A, { settings: {}, workers: [], records: [], canteen: { entries: [], rates: [], log: [] } }, "2026-11-14T11:00:00.000Z");
    assert.equal(await d.C.maybePull(true), false); assert.deepEqual(d.ids(), ["keep"]); assert.equal(d.C._pending.kind, "empty");
    assert.equal(db.writes.length, 0); await d.C.resolve("local"); assert.deepEqual(rowIds(db), ["keep"]);
  });
  await test("deleted server row is protected and can be restored from the surviving device", async () => {
    const db = new Server(data(["keep"])), d = await device(db); await d.login(); db.rows.delete(A.id);
    await d.C.maybePull(true); assert.deepEqual(d.ids(), ["keep"]); assert.equal(d.C.status, "conflict");
    await d.C.resolve("local"); assert.deepEqual(rowIds(db), ["keep"]);
  });
  await test("an explicit local clear sends an intent marker, unlike an empty login", async () => {
    const db = new Server(data(["remove"])), a = await device(db), b = await device(db); await a.login(); await b.login();
    a.S.data.canteen.entries = []; a.S.save(true); assert.equal(await a.C.pushNow(), true);
    assert.equal(db.get().payload._sync.cleared, true); await b.C.maybePull(); assert.deepEqual(b.ids(), []);
    assert.ok(a.H.Recovery.list().some((x) => x.payload.canteen.entries.length));
  });
  await test("pre-canteen remote snapshots cannot silently drop the local canteen collection", async () => {
    const db = new Server(data(["keep"])), d = await device(db); await d.login();
    const legacy = db.get().payload; delete legacy.canteen; legacy.settings.phone = "changed-on-old-app";
    db.set(A, legacy, "2026-11-14T11:00:00.000Z"); await d.C.maybePull(true);
    assert.deepEqual(d.ids(), ["keep"]); assert.deepEqual(rowIds(db), ["keep"]);
  });
  await test("salary records use worker/month identity, preserving concurrent advances once", async () => {
    const payload = data([], [worker()]); payload.records = [record()];
    const db = new Server(payload), a = await device(db), b = await device(db); await a.login(); await b.login();
    a.S.data.records[0].advances.push({ id: "adv-a", amount: 100, date: "2026-11-14", note: "A" }); a.S.save(true);
    b.S.data.records[0].advances.push({ id: "adv-b", amount: 200, date: "2026-11-14", note: "B" }); b.S.save(true);
    await a.C.pushNow(); await b.C.pushNow(); const rs = db.get().payload.records;
    assert.equal(rs.length, 1); assert.equal(rs[0].advances.length, 2); assert.equal(rs[0].advances.reduce((t, v) => t + v.amount, 0), 300);
  });

  console.log("\n▸ offline/reload, auth/account boundaries, failure reporting and recovery");
  await test("failed read NEVER falls through to a cloud write", async () => {
    const db = new Server(data(["remote"])), d = await device(db, { payload: data(["local"]) });
    db.failRead = { message: "network offline" }; assert.equal(await d.login(), false);
    assert.deepEqual(d.ids(), ["local"]); assert.deepEqual(rowIds(db), ["remote"]); assert.equal(db.attempts.length, 0);
    assert.equal(d.C.status, "offline");
  });
  await test("failed/RLS-denied write is pending, never 'Cloud synced'", async () => {
    const db = new Server(data(["base"])), d = await device(db); await d.login(); d.add("pending");
    db.failWrite = { code: "42501", message: "RLS denied" }; assert.equal(await d.C.pushNow(), false);
    assert.equal(d.C.dirty, true); assert.equal(d.C.status, "offline"); assert.deepEqual(rowIds(db), ["base"]);
    assert.ok(d.C.lastError.includes("RLS"));
  });
  await test("Sync now UI does NOT toast success when cloud save failed", async () => {
    const db = new Server(data(["base"])), d = await device(db); await d.login(); d.add("pending");
    db.failWrite = { message: "network offline" }; d.H.go("settings"); d.click('[data-act="cloudSyncNow"]');
    await sleep(10); assert.ok(d.w.document.getElementById("toast").textContent.includes("Sync confirm nahi hua"));
  });
  await test("pending local changes and merge baseline survive a full browser reload", async () => {
    const db = new Server(data(["base"])), a = await device(db); await a.login(); a.add("offline-a");
    db.failWrite = { message: "network offline" }; await a.C.pushNow(); const disk = a.dump(); a.close();
    db.failWrite = null; const b = await device(db); await b.login(); b.add("online-b"); await b.C.pushNow();
    const reload = await device(db, { storage: disk, session: A });
    assert.deepEqual(reload.ids(), ["base", "offline-a", "online-b"]); assert.deepEqual(rowIds(db), reload.ids());
  });
  await test("online event retries dirty data, not only clean pulls", async () => {
    const db = new Server(data(["base"])), d = await device(db); await d.login(); d.add("offline");
    db.failWrite = { message: "network offline" }; await d.C.pushNow(); db.failWrite = null;
    d.w.dispatchEvent(new d.w.Event("online")); await sleep(10); if (d.C.task) await d.C.task;
    assert.deepEqual(rowIds(db), ["base", "offline"]); assert.equal(d.C.dirty, false);
  });
  await test("account B does not inherit/upload A data; A pending cache is retained", async () => {
    const db = new Server(data(["a"])), d = await device(db); await d.login(); d.add("a-offline"); await d.C.signOut();
    await d.login(B); assert.equal(db.get(B), undefined); assert.deepEqual(d.ids(), []); d.add("b"); await d.C.pushNow();
    assert.deepEqual(rowIds(db, B), ["b"]); await d.C.signOut(); await d.login(A);
    assert.deepEqual(d.ids(), ["a", "a-offline"]); assert.deepEqual(rowIds(db), ["a", "a-offline"]);
  });
  await test("same user ID on a different PROJECT does not upload the old project's data", async () => {
    const db = new Server(data(["project-a"])), d = await device(db); await d.login(); await d.C.signOut();
    const other = new Server(data(["project-b"])); d.C.cfg = { url: "https://other.supabase.co", key: "test-key" }; d.C.client = other.client();
    await d.login(); assert.deepEqual(d.ids(), ["project-b"]); assert.deepEqual(rowIds(other), ["project-b"]); assert.equal(other.writes.length, 0);
  });
  await test("sign-out cancels queued writes and late pull cannot replace visible data", async () => {
    const db = new Server(data(["base"])), d = await device(db); await d.login(); d.add("local");
    const entered = deferred(), release = deferred(); db.onRead = async () => { entered.resolve(); await release.promise; };
    const pull = d.C.pushNow(); await entered.promise; await d.C.signOut();
    assert.equal(d.C.pushTimer, null); db.set(A, data(["different"])); release.resolve(); await pull;
    assert.deepEqual(d.ids(), ["base", "local"]); assert.equal(db.writes.length, 0); assert.equal(d.C.user, null);
  });
  await test("late account-A write result does not overwrite the newly signed-in B UI/cache", async () => {
    const db = new Server(data(["a"])); db.set(B, data(["b"])); const d = await device(db); await d.login(); d.add("a-edit");
    const entered = deferred(), release = deferred(); let once = true;
    db.onWrite = async () => { if (once) { once = false; entered.resolve(); await release.promise; } };
    const push = d.C.pushNow(); await entered.promise; await d.C.signOut(); await d.login(B); release.resolve(); await push;
    assert.deepEqual(d.ids(), ["b"]); assert.deepEqual(rowIds(db, B), ["b"]); assert.equal(d.C.user.id, B.id);
  });
  await test("late getSession boot response cannot undo an explicit sign-out", async () => {
    const release = deferred(); const db = new Server(data(["server"]));
    const d = await device(db, { delayedBoot: true, client(c) { c.auth.getSession = async () => { await release.promise; return { data: { session: { user: A } }, error: null }; }; } });
    await sleep(); await d.C.signOut(); release.resolve(); await sleep(5);
    assert.equal(d.C.user, null); assert.equal(db.reads, 0);
  });
  await test("storage quota failure is reported; old local data stays and no push is scheduled", async () => {
    const db = new Server(data(["base"])), d = await device(db); await d.login();
    const old = d.w.localStorage.getItem(KEY), set = d.w.Storage.prototype.setItem;
    d.w.Storage.prototype.setItem = function () { throw new d.w.DOMException("quota", "QuotaExceededError"); };
    d.S.data.canteen.entries.push(ctEntry("not-saved")); assert.equal(d.S.save(), false);
    assert.equal(d.w.localStorage.getItem(KEY), old); assert.equal(d.C.status, "storage"); assert.equal(d.C.dirty, false);
    assert.equal(db.writes.length, 0); d.w.Storage.prototype.setItem = set;
  });
  await test("invalid/partial cloud payload is not normalized into an empty overwrite", async () => {
    const db = new Server(data(["base"])), d = await device(db); await d.login();
    db.rows.get(A.id).payload = { workers: [], records: "broken" }; assert.equal(await d.C.maybePull(), false);
    assert.deepEqual(d.ids(), ["base"]); assert.equal(db.writes.length, 0); assert.equal(d.C.status, "offline");
  });
  await test("missing SELECT permission cannot become an unconditional upsert", async () => {
    const db = new Server(data(["protected"])), d = await device(db, { payload: data(["local"]) });
    db.onRead = () => {}; const from = d.client.from;
    d.client.from = (...args) => { const q = from(...args), get = q.maybeSingle; q.maybeSingle = function () { return this.mode === "read" ? Promise.resolve({ data: null, error: null }) : get.call(this); }; return q; };
    await d.login(); assert.deepEqual(rowIds(db), ["protected"]); assert.ok(d.C.dirty); noOverwrite(db);
  });
  await test("safety copies contain the pre-delete data and can add back missing entries", async () => {
    const db = new Server(data(["deleted", "keep"])), d = await device(db); await d.login();
    d.S.data.canteen.entries = d.S.data.canteen.entries.filter((e) => e.id !== "deleted"); d.S.save(true); await d.C.pushNow();
    const snapshot = d.H.Recovery.list().find((x) => x.payload.canteen.entries.some((e) => e.id === "deleted"));
    assert.ok(snapshot); d.add("newer"); d.H.Recovery.merge(snapshot.id); d.click("#cfmOk"); await d.C.pushNow();
    assert.deepEqual(rowIds(db), ["deleted", "keep", "newer"]);
    assert.ok(!JSON.stringify(snapshot).includes("test-only-password"));
  });
  await test("safety copies are account-scoped, not shown to another account", async () => {
    const db = new Server(data(["a"])), d = await device(db); await d.login(); d.add("a2"); await d.C.pushNow();
    assert.ok(d.H.Recovery.list().length); await d.C.signOut(); await d.login(B); assert.equal(d.H.Recovery.list().length, 0);
  });
  await test("theme/render-only changes do not create uploads", async () => {
    const db = new Server(data(["a"])), d = await device(db); await d.login();
    d.S.data.settings.theme = "dark"; d.S.save(true); d.H.render(); await d.C.pushNow();
    assert.equal(db.writes.length, 0); assert.equal(d.C.dirty, false);
  });
  await test("a legacy client dropping only SOME bills is paused instead of deleting them", async () => {
    const db = new Server(data(["one", "two"])), d = await device(db); await d.login();
    const partial = data(["two", "new-remote"]); db.set(A, partial);
    assert.equal(await d.C.maybePull(), false); assert.deepEqual(d.ids(), ["one", "two"]);
    await d.C.resolve("local"); assert.deepEqual(rowIds(db), ["new-remote", "one", "two"]);
  });
  await test("missing collection recovery ALSO preserves newly added remote workers", async () => {
    const payload = data(["keep-bill"], [worker()]); const db = new Server(payload), d = await device(db); await d.login();
    const damaged = copy(payload); damaged.canteen.entries = []; damaged.workers.push(worker("new-remote-worker")); db.set(A, damaged);
    await d.C.maybePull(); assert.equal(d.C.status, "conflict"); await d.C.resolve("local");
    assert.deepEqual(rowIds(db), ["keep-bill"]); assert.equal(db.get().payload.workers.length, 2);
  });
  await test("intentional canteen-only wipe has deletion proof and keeps salary data", async () => {
    const db = new Server(data(["bill"], [worker()])), a = await device(db), b = await device(db); await a.login(); await b.login();
    a.S.data.canteen.entries = []; a.S.save(true); await a.C.pushNow();
    assert.ok(db.get().payload._sync.deletedCollections.includes("entries"));
    await b.C.maybePull(); assert.deepEqual(b.ids(), []); assert.equal(b.S.data.workers.length, 1);
  });
  await test("old bug's uploaded sample (demo flag removed) is detected and cannot replace real work", async () => {
    const db = new Server(data(["keep-real"])), d = await device(db), sampleDevice = await device(new Server());
    await d.login(); const bad = copy(sampleDevice.S.data); delete bad.settings.demo; db.set(A, bad);
    assert.equal(await d.C.maybePull(), false); assert.deepEqual(d.ids(), ["keep-real"]);
    await d.C.resolve("local"); assert.deepEqual(rowIds(db), ["keep-real"]); assert.equal(db.get().payload.workers.length, 0);
  });
  await test("a changed financial conflict AFTER the dialog requires a fresh choice", async () => {
    const db = new Server(data(["bill"])), a = await device(db), b = await device(db); await a.login(); await b.login();
    a.edit("bill", 3000); b.edit("bill", 4000); await a.C.pushNow(); await b.C.pushNow();
    a.edit("bill", 3500); await a.C.pushNow(); assert.equal(await b.C.resolve("local"), false);
    assert.equal(db.get().payload.canteen.entries[0].amount, 3500); assert.ok(b.C._pending);
    await b.C.resolve("local"); assert.equal(db.get().payload.canteen.entries[0].amount, 4000);
  });
  await test("known account cannot load a demo snapshot over the cloud data", async () => {
    const db = new Server(data(["real"])), d = await device(db); await d.login(); d.H.go("settings");
    d.click('[data-act="loadSample"]'); assert.ok(!d.w.document.getElementById("cfmOk"));
    assert.deepEqual(d.ids(), ["real"]); assert.equal(db.writes.length, 0);
  });
  await test("damaged local JSON is retained byte-for-byte, not uploaded as blank/demo", async () => {
    const db = new Server(data(["real"])), raw = '{"workers":[broken-but-must-preserve', d = await device(db, { raw });
    assert.equal(d.w.localStorage.getItem(KEY), raw); assert.equal(db.reads, 0);
    await assert.rejects(() => d.login(), /save\/backup|blocked/);
    assert.equal(d.w.localStorage.getItem(KEY), raw); assert.equal(db.writes.length, 0);
  });
  await test("a local failed save cannot later leak into a background/manual upload", async () => {
    const db = new Server(data(["base"])), d = await device(db); await d.login();
    const set = d.w.Storage.prototype.setItem;
    d.w.Storage.prototype.setItem = function () { throw new Error("quota"); };
    d.S.data.canteen.entries.push(ctEntry("failed")); assert.equal(d.S.save(true), false);
    d.w.Storage.prototype.setItem = set; assert.equal(await d.C.pushNow(), false); assert.deepEqual(rowIds(db), ["base"]);
    assert.equal(d.S.save(true), true); await d.C.pushNow(); assert.deepEqual(rowIds(db), ["base", "failed"]);
  });
  await test("null legacy updated_at is guarded by IS NULL, not an unconditional update", async () => {
    const db = new Server(data(["base"])); db.rows.get(A.id).updated_at = null;
    const d = await device(db); await d.login(); d.add("new"); await d.C.pushNow();
    assert.ok(db.attempts[0].filters.some(([k, v]) => k === "updated_at" && v === null));
    assert.deepEqual(rowIds(db), ["base", "new"]);
  });
  await test("cache transaction failure rolls back canonical JSON and dirty state", async () => {
    const db = new Server(data(["base"])), d = await device(db); await d.login(); const before = d.dump();
    const set = d.w.Storage.prototype.setItem; let fail = true;
    d.w.Storage.prototype.setItem = function (key, value) { if (fail && key.startsWith("hisaabPro.sync.v2.")) { fail = false; throw Error("quota"); } return set.call(this, key, value); };
    d.S.data.canteen.entries.push(ctEntry("not-persisted")); assert.equal(d.S.save(true), false);
    assert.equal(d.w.localStorage.getItem(KEY), before[KEY]); assert.equal(d.C.dirty, false);
    d.w.Storage.prototype.setItem = set;
  });
  await test("photos round-trip through pending caches without duplicating large strings", async () => {
    const photo = "data:image/jpeg;base64," + "ABCD".repeat(15000), payload = data([ctEntry("photo")]); payload.canteen.entries[0].photo = photo;
    const db = new Server(payload), d = await device(db); await d.login();
    const cache = Object.keys(d.w.localStorage).find((k) => k.startsWith("hisaabPro.sync.v2."));
    const raw = d.w.localStorage.getItem(cache); assert.equal(raw.split(photo).length - 1, 1);
    d.add("offline"); const snapshot = d.dump(); const reload = await device(db, { storage: snapshot, session: A });
    assert.equal(reload.S.data.canteen.entries.find((e) => e.id === "photo").photo, photo);
    assert.deepEqual(rowIds(db), ["offline", "photo"]);
  });
  await test("other-tab account switch freezes old tab writes instead of crossing accounts", async () => {
    const db = new Server(data(["a"])), d = await device(db); await d.login();
    d.w.localStorage.setItem(OWNER, "other-account");
    d.w.dispatchEvent(new d.w.StorageEvent("storage", { key: OWNER, newValue: "other-account" }));
    d.S.data.canteen.entries.push(ctEntry("old-tab")); assert.equal(d.S.save(true), false);
    assert.equal(await d.C.pushNow(), false); assert.equal(db.writes.length, 0); assert.deepEqual(rowIds(db), ["a"]);
  });
  await test("duplicate IDs / worker-month rows / invalid financial values block cloud adoption", async () => {
    for (const bad of [data([ctEntry("duplicate"), ctEntry("duplicate")]),
      { ...data(), records: [record("one"), record("two")] }, data([{ ...ctEntry("bad"), amount: "not-money" }])]) {
      const db = new Server(bad), d = await device(db, { payload: data(["safe-local"]) });
      assert.equal(await d.login(), false); assert.deepEqual(d.ids(), ["safe-local"]); assert.equal(db.writes.length, 0);
    }
  });
  await test("legacy missing timestamps are not invented as perpetual financial changes", async () => {
    const payload = data(["legacy"]); delete payload.canteen.entries[0].updatedAt; delete payload.canteen.entries[0].createdAt;
    const db = new Server(payload), d = await device(db); await d.login(); await d.C.maybePull();
    assert.equal(db.writes.length, 0); assert.equal(d.C.dirty, false);
  });
  await test("signup also does not seed a new account with demo workers or canteen entries", async () => {
    const db = new Server(), d = await device(db); const result = await d.C.signUp(A.email, "test-only-password");
    assert.equal(result.needsConfirm, false); assert.equal(db.writes.length, 0); assert.equal(d.S.data.workers.length, 0);
  });
  await test("settings badge and safety-copy controls remain visible after render", async () => {
    const db = new Server(data(["a"])), d = await device(db); await d.login(); d.H.go("settings");
    assert.ok(d.w.document.querySelector('[data-act="recoveryOpen"]'));
    assert.ok(Array.from(d.w.document.querySelectorAll('[data-cloud-badge]')).every((el) => el.textContent.includes("Cloud synced")));
  });
  await test("a failed edit while a READ is in flight stays a draft, never uploaded/acknowledged", async () => {
    const db = new Server(data(["base"])), d = await device(db); await d.login();
    const entered = deferred(), release = deferred(); db.onRead = async () => { entered.resolve(); await release.promise; };
    const sync = d.C.maybePull(); await entered.promise;
    const set = d.w.Storage.prototype.setItem; d.w.Storage.prototype.setItem = () => { throw Error("quota"); };
    d.S.data.canteen.entries.push(ctEntry("unsaved-draft")); assert.equal(d.S.save(true), false);
    d.w.Storage.prototype.setItem = set; release.resolve(); assert.equal(await sync, false);
    assert.deepEqual(rowIds(db), ["base"]); assert.deepEqual(d.ids(), ["base", "unsaved-draft"]); assert.equal(d.C.status, "storage");
  });
  await test("an ACK cannot erase/acknowledge a different edit that failed DURING the WRITE", async () => {
    const db = new Server(data(["base"])), d = await device(db); await d.login(); d.add("sent");
    const entered = deferred(), release = deferred(); db.onWrite = async () => { entered.resolve(); await release.promise; };
    const sync = d.C.pushNow(); await entered.promise;
    const set = d.w.Storage.prototype.setItem; d.w.Storage.prototype.setItem = () => { throw Error("quota"); };
    d.S.data.canteen.entries.push(ctEntry("unsaved-later")); assert.equal(d.S.save(true), false);
    d.w.Storage.prototype.setItem = set; release.resolve(); assert.equal(await sync, false);
    assert.deepEqual(rowIds(db), ["base", "sent"]); assert.ok(d.ids().includes("unsaved-later")); assert.equal(d.S.unsaved, true);
    assert.equal(d.C.status, "storage"); assert.ok(!JSON.parse(d.w.localStorage.getItem(KEY)).canteen.entries.some((e) => e.id === "unsaved-later"));
    d.S.save(true); await d.C.pushNow(); assert.deepEqual(rowIds(db), ["base", "sent", "unsaved-later"]);
  });
  await test("a SAME-account stale tab cannot overwrite another tab's persisted changes", async () => {
    const db = new Server(data(["base"])), d = await device(db); await d.login();
    const other = copy(d.S.data); other.canteen.entries.push(ctEntry("other-tab-unsynced")); const raw = JSON.stringify(other);
    d.w.localStorage.setItem(KEY, raw); // before the queued storage event is delivered
    assert.equal(await d.C.maybePull(), false); assert.equal(db.writes.length, 0);
    d.S.data.canteen.entries.push(ctEntry("this-stale-tab")); assert.equal(d.S.save(), false);
    assert.equal(d.w.localStorage.getItem(KEY), raw); assert.equal(d.C.status, "storage");
  });
  await test("valid JSON with a missing core collection is blocked, not silently reset", async () => {
    const raw = '{"settings":{"shopName":"Keep raw"},"workers":[]}', db = new Server(data(["remote"])), d = await device(db, { raw });
    assert.equal(d.S.storageProblem, true); assert.equal(d.w.localStorage.getItem(KEY), raw); assert.equal(db.reads, 0);
  });
  await test("corrupt pending cache leaves BOTH raw cache and canonical backup untouched", async () => {
    const scope = URL + "|" + A.id, cacheKey = "hisaabPro.sync.v2." + encodeURIComponent(scope), rawCache = '{"broken":';
    const payload = data(["canonical-survivor"]), raw = JSON.stringify(payload), db = new Server(data(["remote"]));
    const d = await device(db, { storage: { [KEY]: raw, [OWNER]: scope, [cacheKey]: rawCache } });
    assert.equal(d.S.storageProblem, true); assert.deepEqual(d.ids(), ["canonical-survivor"]);
    assert.equal(d.w.localStorage.getItem(cacheKey), rawCache); assert.equal(d.w.localStorage.getItem(KEY), raw); assert.equal(db.reads, 0);
  });
  await test("canteen wipe rolls back if the safety copy/storage cannot be saved", async () => {
    const db = new Server(data(["keep"], [worker()])), d = await device(db); await d.login(); d.H.go("settings");
    const set = d.w.Storage.prototype.setItem; d.w.Storage.prototype.setItem = () => { throw Error("quota"); };
    d.click('[data-act="ctWipe"]'); d.click('#cfmOk');
    assert.deepEqual(d.ids(), ["keep"]); assert.equal(d.S.data.workers.length, 1); assert.equal(db.writes.length, 0);
    assert.ok(!d.w.document.getElementById("toast").textContent.includes("erase ho gaya"));
    assert.equal(d.w.document.getElementById("syncAlert").hidden, false); d.w.Storage.prototype.setItem = set;
  });
  await test("worker delete also rolls back after a failed save, without a fake success toast", async () => {
    const payload = data(["keep"], [worker()]); payload.records.push(record()); const db = new Server(payload), d = await device(db); await d.login(); d.H.go("workers");
    const set = d.w.Storage.prototype.setItem; d.w.Storage.prototype.setItem = () => { throw Error("quota"); };
    d.click('[data-act="delWorker"]'); d.click('#cfmOk');
    assert.equal(d.S.data.workers.length, 1); assert.equal(d.S.data.records.length, 1);
    assert.ok(!d.w.document.getElementById("toast").textContent.includes("Worker deleted")); d.w.Storage.prototype.setItem = set;
  });
  await test("concurrent worker deletion vs salary edit pauses; keeping salary retains its worker", async () => {
    const payload = data(["bill"], [worker()]); payload.records.push(record()); const db = new Server(payload), a = await device(db), b = await device(db); await a.login(); await b.login();
    a.S.data.workers = []; a.S.data.records = []; a.S.save(true); await a.C.pushNow();
    b.S.data.records[0].bonus = 400; b.S.save(true); assert.equal(await b.C.pushNow(), false); assert.equal(b.C.status, "conflict");
    await b.C.resolve("local"); assert.equal(db.get().payload.workers.length, 1); assert.equal(db.get().payload.records[0].bonus, 400);
  });
  await test("worker-delete vs NEW salary month is explicit too; choosing deletion removes dependencies", async () => {
    const payload = data(["bill"], [worker()]); const db = new Server(payload), a = await device(db), b = await device(db); await a.login(); await b.login();
    a.S.data.workers = []; a.S.save(true); await a.C.pushNow();
    b.S.data.records.push(record()); b.S.save(true); assert.equal(await b.C.pushNow(), false);
    assert.ok(b.C._pending.conflicts.some((p) => p.includes("withSalary")));
    await b.C.resolve("remote"); assert.equal(db.get().payload.workers.length, 0); assert.equal(db.get().payload.records.length, 0);
  });
  await test("amount reduction vs concurrent payment cannot silently clamp the financial value", async () => {
    const db = new Server(data(["bill"])), a = await device(db), b = await device(db); await a.login(); await b.login();
    a.edit("bill", 100); b.S.data.canteen.entries[0].paid = 2000; b.S.save(true); b.add("independent"); await a.C.pushNow();
    assert.equal(await b.C.pushNow(), false); assert.equal(db.get().payload.canteen.entries[0].paid, 0);
    assert.ok(b.C._pending.conflicts.some((p) => p.endsWith("financialValues")));
    assert.ok(b.w.document.querySelector("#overlay table").textContent.includes("2,000"));
    await b.C.resolve("local"); const bill = db.get().payload.canteen.entries.find((e) => e.id === "bill");
    assert.equal(bill.amount, 2800); assert.equal(bill.paid, 2000); assert.ok(rowIds(db).includes("independent"));
  });
  await test("malformed nested salary advances / canteen item prices cannot become zeros", async () => {
    const badSalary = data([], [worker()]); badSalary.records.push({ ...record(), advances: [{ id: "adv", amount: "bad-number" }] });
    const badItem = data([{ ...ctEntry("item"), items: [{ name: "Tea", qty: "bad-number", rate: 25 }] }]);
    for (const payload of [badSalary, badItem]) {
      const db = new Server(payload), d = await device(db, { payload: data(["safe"]) });
      assert.equal(await d.login(), false); assert.deepEqual(d.ids(), ["safe"]); assert.equal(db.writes.length, 0);
    }
  });
  await test("failed bill save rolls back derived rates/log too; draft can be saved again", async () => {
    const db = new Server(data(["base"])), d = await device(db); await d.login(); d.H.go("canteen");
    d.H.canteen.openModal(); d.H.UI.ct.edit.items = [{ name: "Maggi", qty: 4, unit: "kg", priceMode: "line", lineTotal: 360, rate: 90 }]; d.H.canteen.renderModal(false);
    const set = d.w.Storage.prototype.setItem; d.w.Storage.prototype.setItem = () => { throw Error("quota"); };
    d.click('[data-act="ctSave"]'); assert.deepEqual(d.ids(), ["base"]); assert.equal(d.S.data.canteen.rates.length, 0); assert.equal(d.S.data.canteen.log.length, 0);
    assert.ok(d.H.UI.ct.edit); assert.ok(d.w.document.getElementById("toast").textContent.includes("Save NAHIN hua"));
    d.w.Storage.prototype.setItem = set; d.click('[data-act="ctSave"]'); await d.C.pushNow();
    assert.equal(db.get().payload.canteen.entries.length, 2); assert.equal(db.get().payload.canteen.rates[0].rate, 90);
  });
  await test("storage READ failure also gets Save failed warning, not the previous synced badge", async () => {
    const db = new Server(data(["base"])), d = await device(db); await d.login();
    const get = d.w.Storage.prototype.getItem;
    d.w.Storage.prototype.getItem = function (key) { if (key === OWNER) throw Error("read denied"); return get.call(this, key); };
    d.S.data.canteen.entries.push(ctEntry("draft")); assert.equal(d.S.save(), false); assert.equal(d.C.status, "storage");
    assert.equal(d.w.document.getElementById("syncAlert").hidden, false); d.w.Storage.prototype.getItem = get;
    assert.deepEqual(rowIds(db), ["base"]);
  });
  await test("late pull cannot advance the baseline underneath an already opened bill draft", async () => {
    const db = new Server(data(["bill"])), d = await device(db); await d.login();
    const entered = deferred(), release = deferred(); db.onRead = async () => { entered.resolve(); await release.promise; };
    const pull = d.C.maybePull(); await entered.promise; d.H.canteen.openModal("bill");
    const changed = db.get().payload; changed.canteen.entries[0].amount = 6000; db.set(A, changed, "2026-11-14T11:00:00Z");
    release.resolve(); assert.equal(await pull, false); assert.equal(d.S.data.canteen.entries[0].amount, 2800);
    assert.equal(d.H.UI.ct.edit.amount, 2800); assert.equal(d.C.base.canteen.entries[0].amount, 2800);
    d.click('[data-act="closeModal"]'); await d.C.maybePull(); assert.equal(d.S.data.canteen.entries[0].amount, 6000);
  });
  await test("a settings-only surviving account is protected when its server row disappears", async () => {
    const payload = data(); payload.settings.shopName = "Keep My Shop"; const db = new Server(payload), d = await device(db); await d.login();
    db.rows.delete(A.id); assert.equal(await d.C.maybePull(), false); assert.equal(d.C.status, "conflict");
    assert.equal(d.S.data.settings.shopName, "Keep My Shop"); await d.C.resolve("local"); assert.equal(db.get().payload.settings.shopName, "Keep My Shop");
  });
  console.log("\n▸ v3.19 — attendance on two independent devices, accounts and old clients");
  const attRules = () => ({ dayStart: "09:00", dayEnd: "18:00", nightStart: "21:00", nightEnd: "06:00", standardMinutes: 480, halfDayMinutes: 240, breakMinutes: 60, lateGraceMinutes: 10, earlyGraceMinutes: 0, paidLeave: true, paidHoliday: true, paidWeekOff: false });
  const am = (id = "manager-a", code = "M-001") => ({ id, code, name: "Manager " + id, defaultShift: "day", active: true, joinedOn: "", endedOn: "", department: "Operations", phone: "", note: "", createdAt: 1, updatedAt: 1 });
  const ar = (extra = {}) => ({ id: "attendance-a", managerId: "manager-a", date: "2026-11-14", shift: "day", mode: "tap", status: "present", checkIn: "", checkOut: "", inNextDay: false, outNextDay: false, breakMinutes: 0, policy: attRules(), note: "", createdAt: 1, updatedAt: 1, ...extra });
  const ap = (records = [], managers = [am()]) => ({ ...data(), attendance: { managers, records, history: [], settings: attRules() } });
  const api = (d) => d.H.attendance;
  const attendanceIds = (db) => db.get().payload.attendance.records.map((r) => r.id).sort();
  await test("fresh second device adopts attendance-only cloud without seeding demo or writing", async () => {
    const db = new Server(ap([ar()])), d = await device(db); assert.equal(await d.login(), true);
    assert.equal(d.S.data.workers.length, 0); assert.equal(d.S.data.canteen.entries.length, 0); assert.equal(api(d).data().managers.length, 1); assert.equal(api(d).data().records.length, 1); assert.equal(db.writes.length, 0); noOverwrite(db);
  });
  await test("attendance rules-only account is real data even without managers or rows", async () => {
    const payload = ap([], []); payload.attendance.settings.lateGraceMinutes = 17;
    const db = new Server(payload), d = await device(db); await d.login(); assert.equal(api(d).data().settings.lateGraceMinutes, 17); assert.equal(db.writes.length, 0);
  });
  await test("independent attendance records from two devices merge with salary/canteen intact", async () => {
    const payload = ap([], [am(), am("manager-b", "M-002")]); payload.canteen.entries.push(ctEntry("real-bill")); payload.workers.push(worker()); payload.records.push(record());
    const db = new Server(payload), a = await device(db), b = await device(db); await a.login(); await b.login();
    api(a).saveRecord(ar({ id: undefined })); api(b).saveRecord(ar({ id: undefined, managerId: "manager-b", status: "half" })); await a.C.pushNow(); assert.equal(await b.C.pushNow(), true);
    assert.equal(db.get().payload.attendance.records.length, 2); assert.deepEqual(rowIds(db), ["real-bill"]); assert.equal(db.get().payload.records[0].presentDays, 24); assert.equal(db.get().payload.workers.length, 1); noOverwrite(db);
  });
  await test("same manager/date/shift marked identically on both devices produces one record", async () => {
    const db = new Server(ap()), a = await device(db), b = await device(db); await a.login(); await b.login();
    const ra = api(a).saveRecord(ar({ id: undefined })), rb = api(b).saveRecord(ar({ id: undefined })); assert.notEqual(ra.id, rb.id); await a.C.pushNow(); assert.equal(await b.C.pushNow(), true);
    assert.equal(db.get().payload.attendance.records.length, 1); assert.equal(db.get().payload.attendance.records[0].status, "present");
  });
  await test("different simultaneous tap marks require an explicit value choice, never duplicates", async () => {
    const db = new Server(ap()), a = await device(db), b = await device(db); await a.login(); await b.login();
    api(a).saveRecord(ar({ id: undefined })); api(b).saveRecord(ar({ id: undefined, status: "absent" })); await a.C.pushNow(); assert.equal(await b.C.pushNow(), false); assert.equal(b.C.status, "conflict");
    assert.equal(await b.C.resolve("local"), true); assert.equal(db.get().payload.attendance.records.length, 1); assert.equal(db.get().payload.attendance.records[0].status, "absent");
  });
  await test("note edit and a separate clock edit merge without recomputing salary", async () => {
    const payload = ap([ar({ mode: "time", status: "auto", checkIn: "09:00", checkOut: "18:00", breakMinutes: 60 })]);
    const db = new Server(payload), a = await device(db), b = await device(db); await a.login(); await b.login();
    api(a).saveRecord({ ...api(a).data().records[0], checkIn: "09:10" }); api(b).saveRecord({ ...api(b).data().records[0], note: "Manager verified" }); await a.C.pushNow(); assert.equal(await b.C.pushNow(), true);
    const result = db.get().payload.attendance.records[0]; assert.equal(result.checkIn, "09:10"); assert.equal(result.note, "Manager verified");
  });
  await test("two independently edited clock spans are not synthesized into a third duration", async () => {
    const payload = ap([ar({ mode: "time", status: "auto", checkIn: "09:00", checkOut: "18:00", breakMinutes: 60 })]);
    const db = new Server(payload), a = await device(db), b = await device(db); await a.login(); await b.login();
    api(a).saveRecord({ ...api(a).data().records[0], checkIn: "10:00" }); api(b).saveRecord({ ...api(b).data().records[0], checkOut: "20:00" }); await a.C.pushNow(); assert.equal(await b.C.pushNow(), false);
    assert.ok(b.C._pending.conflicts.some((x) => x.endsWith("calculationInputs"))); assert.equal(await b.C.resolve("local"), true);
    const result = db.get().payload.attendance.records[0]; assert.equal(result.checkIn, "09:00"); assert.equal(result.checkOut, "20:00"); assert.equal(api(b).calculate(result).workedMinutes, 600);
  });
  await test("attendance edit versus deletion asks and can retain the exact edited row", async () => {
    const db = new Server(ap([ar()])), a = await device(db), b = await device(db); await a.login(); await b.login();
    api(a).deleteRecord("attendance-a"); api(b).saveRecord({ ...api(b).data().records[0], status: "half" }); await a.C.pushNow(); assert.equal(await b.C.pushNow(), false); await b.C.resolve("local"); assert.deepEqual(attendanceIds(db), ["attendance-a"]); assert.equal(db.get().payload.attendance.records[0].status, "half");
  });
  await test("intentional profile deletion propagates with attendance collection deletion proof", async () => {
    const db = new Server(ap([ar()])), a = await device(db), b = await device(db); await a.login(); await b.login();
    api(a).deleteManager("manager-a"); assert.equal(await a.C.pushNow(), true); assert.ok(db.get().payload._sync.deletedCollections.includes("managers")); assert.ok(db.get().payload._sync.deletedCollections.includes("attendance"));
    assert.equal(await b.C.maybePull(), true); assert.equal(api(b).data().managers.length, 0); assert.equal(api(b).data().records.length, 0);
  });
  for (const preference of ["local", "remote"]) await test("manager delete vs newly added attendance is an explicit dependent choice: " + preference, async () => {
    const db = new Server(ap()), a = await device(db), b = await device(db); await a.login(); await b.login();
    api(a).deleteManager("manager-a"); api(b).saveRecord(ar({ id: undefined })); await a.C.pushNow(); assert.equal(await b.C.pushNow(), false); assert.ok(b.C._pending.conflicts.some((x) => x.endsWith("withAttendance")));
    assert.equal(await b.C.resolve(preference), true); assert.equal(db.get().payload.attendance.managers.length, preference === "local" ? 1 : 0); assert.equal(db.get().payload.attendance.records.length, preference === "local" ? 1 : 0);
  });
  await test("concurrent duplicate unique manager codes ask about profiles and dependent attendance", async () => {
    const db = new Server(ap()), a = await device(db), b = await device(db); await a.login(); await b.login();
    const ma = api(a).saveManager({ name: "First person", code: "SAME", defaultShift: "day" }), mb = api(b).saveManager({ name: "Second person", code: "SAME", defaultShift: "night" });
    api(a).saveRecord(ar({ id: undefined, managerId: ma.id })); api(b).saveRecord(ar({ id: undefined, managerId: mb.id, shift: "night" })); await a.C.pushNow(); assert.equal(await b.C.pushNow(), false); assert.ok(b.C._pending.conflicts.includes("attendance.managers.uniqueCodes"));
    assert.equal(await b.C.resolve("local"), true); assert.equal(db.get().payload.attendance.managers.filter((m) => m.code === "SAME").length, 1); assert.equal(db.get().payload.attendance.managers.find((m) => m.code === "SAME").name, "Second person"); assert.ok(db.get().payload.attendance.records.every((r) => r.managerId !== ma.id));
  });
  await test("v3.18 client omitting Attendance cannot erase it while updating a bill", async () => {
    const payload = ap([ar()]); payload.canteen.entries.push(ctEntry("bill")); const db = new Server(payload), d = await device(db); await d.login();
    const legacy = copy(db.get().payload); delete legacy.attendance; legacy.canteen.entries[0].amount = 6000; legacy._sync = { v: 2, app: "3.18", deletedCollections: [] }; db.set(A, legacy, "2026-11-14T12:00:00Z");
    assert.equal(await d.C.maybePull(), true); assert.equal(api(d).data().records.length, 1); assert.equal(db.get().payload.attendance.managers.length, 1); assert.equal(db.get().payload.canteen.entries[0].amount, 6000);
  });
  await test("partial Attendance payload preserves omitted managers/rules/history from known baseline", async () => {
    const payload = ap([ar()]), db = new Server(payload), d = await device(db); await d.login();
    const remote = copy(db.get().payload); remote.attendance = { records: [{ ...ar(), note: "Partial client correction" }] }; db.set(A, remote, "2026-11-14T12:00:00Z");
    assert.equal(await d.C.maybePull(), true); assert.equal(api(d).data().managers.length, 1); assert.equal(api(d).data().records[0].note, "Partial client correction"); assert.equal(db.get().payload.attendance.settings.standardMinutes, 480);
  });
  await test("unproven empty attendance collections pause instead of erasing a populated device", async () => {
    const db = new Server(ap([ar()])), d = await device(db); await d.login(); const remote = copy(db.get().payload); remote.attendance.managers = []; remote.attendance.records = []; remote._sync = { v: 2, app: "3.18", deletedCollections: [] }; db.set(A, remote, "2026-11-14T12:00:00Z");
    assert.equal(await d.C.maybePull(), false); assert.equal(d.C.status, "conflict"); assert.equal(api(d).data().records.length, 1); await d.C.resolve("local"); assert.equal(db.get().payload.attendance.records.length, 1);
  });
  await test("offline attendance survives reload and merges independent new remote records", async () => {
    const db = new Server(ap([], [am(), am("manager-b", "M-002")])), a = await device(db), b = await device(db); await a.login(); await b.login();
    api(a).saveRecord(ar({ id: undefined })); const saved = a.dump(); a.close();
    api(b).saveRecord(ar({ id: undefined, managerId: "manager-b" })); await b.C.pushNow();
    const reopened = await device(db, { storage: saved }); assert.equal(api(reopened).data().records.length, 1); assert.equal(reopened.C.dirty, true); assert.equal(await reopened.login(), true); assert.equal(db.get().payload.attendance.records.length, 2);
  });
  await test("open attendance editor blocks remote adoption and baseline advance until closed", async () => {
    const db = new Server(ap([ar()])), d = await device(db); await d.login(); api(d).openRecord("attendance-a");
    const remote = copy(db.get().payload); remote.attendance.records[0].status = "half"; db.set(A, remote, "2026-11-14T12:00:00Z");
    assert.equal(await d.C.pushNow(), false); assert.equal(d.C.base.attendance.records[0].status, "present"); assert.equal(api(d).data().records[0].status, "present"); closedDialog(d); assert.equal(await d.C.pushNow(), true); assert.equal(api(d).data().records[0].status, "half");
  });
  await test("account switch resets Attendance selectors/drafts and never inherits another account's managers", async () => {
    const db = new Server(ap([ar()])); db.set(B, data()); const d = await device(db); await d.login(); api(d).ui().manager = "manager-a"; api(d).ui().q = "private"; api(d).openManager("manager-a");
    assert.equal(await d.login(B), true); assert.equal(api(d).data().managers.length, 0); assert.equal(api(d).ui().manager, "all"); assert.equal(api(d).ui().q, ""); assert.equal(d.w.document.querySelector("#overlay"), null); assert.equal(db.get(B).payload.attendance, undefined);
  });
  await test("duplicate/invalid Attendance on cloud is rejected without dropping surviving local data", async () => {
    const payload = ap([ar(), ar({ id: "duplicate" })]), db = new Server(payload), d = await device(db, { payload: ap([ar({ status: "half" })]) });
    assert.equal(await d.login(), false); assert.equal(db.writes.length, 0); assert.equal(api(d).data().records[0].status, "half");
  });
  await test("attendance local quota failure cannot become a later cloud upload", async () => {
    const db = new Server(ap()), d = await device(db); await d.login(); const original = d.w.Storage.prototype.setItem;
    d.w.Storage.prototype.setItem = () => { throw new Error("quota"); }; assert.throws(() => api(d).saveRecord(ar({ id: undefined }))); assert.equal(api(d).data().records.length, 0); d.w.Storage.prototype.setItem = original;
    await d.C.pushNow(); assert.equal(db.get().payload.attendance.records.length, 0); assert.equal(db.writes.length, 0);
  });
  await test("incompatible concurrent target edits require choosing one valid rule set", async () => {
    const db = new Server(ap()), a = await device(db), b = await device(db); await a.login(); await b.login();
    api(a).data().settings.standardMinutes = 240; a.S.save(true); api(b).data().settings.halfDayMinutes = 360; b.S.save(true); await a.C.pushNow(); assert.equal(await b.C.pushNow(), false); assert.ok(b.C._pending.conflicts.includes("attendance.settings.calculationRules"));
    assert.equal(await b.C.resolve("local"), true); assert.equal(db.get().payload.attendance.settings.standardMinutes, 480); assert.equal(db.get().payload.attendance.settings.halfDayMinutes, 360);
  });
  await test("moved date versus edited attendance does not create duplicate persistent IDs", async () => {
    const db = new Server(ap([ar()])), a = await device(db), b = await device(db); await a.login(); await b.login();
    api(a).saveRecord({ ...api(a).data().records[0], date: "2026-11-15" }); api(b).saveRecord({ ...api(b).data().records[0], note: "Verified original date" }); await a.C.pushNow(); assert.equal(await b.C.pushNow(), false);
    if (!await b.C.resolve("remote")) await b.C.resolve("remote"); assert.equal(db.get().payload.attendance.records.length, 1); assert.equal(db.get().payload.attendance.records[0].date, "2026-11-15");
  });
  await test("attendance recovery adds missing records without duplicating a date/shift", async () => {
    const db = new Server(ap([ar()])), d = await device(db); await d.login(); api(d).deleteRecord("attendance-a"); await d.C.pushNow();
    const saved = d.H.Recovery.list().find((c) => c.payload.attendance?.records.length); assert.ok(saved); d.H.Recovery.merge(saved.id); d.click("#cfmOk"); assert.equal(api(d).data().records.length, 1); assert.equal(await d.C.pushNow(), true); assert.equal(db.get().payload.attendance.records.length, 1);
  });

  await test("all test browsers run without uncaught JavaScript errors", async () => {
    const db = new Server(data(["a"])), d = await device(db); await d.login(); d.H.go("settings");
    d.H.Recovery.open(); assert.deepEqual(d.errors, []); assert.deepEqual(runtimeErrors, []);
  });
  console.log(`\n${failed ? "❌" : "✅"} CLOUD: ${passed} checks pass${failed ? `, ${failed} FAIL` : ""}`);
  process.exitCode = failed ? 1 : 0;
})().catch((e) => { console.error(e); devices.forEach((d) => d.close()); process.exitCode = 2; });
