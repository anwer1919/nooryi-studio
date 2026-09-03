import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const BUNDLE_URL = "https://threeui.com/source-code/kage-landing-page.json";
const HOSTED_BASE = "https://threeui.com/landing-pages";

const EXPECTED = {
  "src/shaders/landing-pages/pageTypography.ts": "809cc65797d531cd3b3ca5a56815d55d24b3ee8d293e4e4bad6fdfe6c83244cc",
  "src/shaders/landing-pages/pageRecipes.ts": "c9d9849cc255bac2d1d938d088c50917f84916f1c516d2bbb27fcfd803523233",
  "src/shaders/landing-pages/LandingPageFrame.tsx": "61de2cc50888aac4ac5557420b07fa47ed3543bb57c1e0055fafdefa53dbaa78",
  "src/shaders/threeui.css": "efe4447139f1358dd8e9be68edf6fa46cbefbd1de423a4d6c439ca61d2c8eccf",
  "public/landing-pages/kage.html": "c8e06b90397ac246baf0ab6f32f5f6b570acc6fe03c7009f711b579fb72d9f49",
};

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

const bundle = await (await fetch(BUNDLE_URL)).json();

// 1) كتابة المصادر النصية المسجلة byte-exact من الحزمة
for (const file of bundle.files) {
  if (!EXPECTED[file.path] || typeof file.code !== "string") continue;
  mkdirSync(dirname(file.path), { recursive: true });
  writeFileSync(file.path, file.code);
  const hash = sha256(Buffer.from(file.code, "utf8"));
  console.log(`${hash === EXPECTED[file.path] ? "OK  " : "FAIL"} ${file.path}`);
}

// 2) تحميل الملفات الرسمية المستضافة
const hosted = [
  [`${HOSTED_BASE}/kage.html`, "public/landing-pages/kage.html"],
  [`${HOSTED_BASE}/secret-pathways-assets/fonts.css`, "public/landing-pages/secret-pathways-assets/fonts.css"],
  [`${HOSTED_BASE}/secret-pathways-assets/three.min.js`, "public/landing-pages/secret-pathways-assets/three.min.js"],
];

for (const [url, out] of hosted) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed ${url} -> ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, buf);
  const hash = sha256(buf);
  const expect = EXPECTED[out];
  console.log(`${expect ? (hash === expect ? "OK  " : "FAIL") : "DL  "} ${out}`);
}

console.log("✅ Done. Now copy the music images (next step).");