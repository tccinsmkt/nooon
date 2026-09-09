// ────────────────────────────────────────────────────────────────
//  NOOON 랜딩 빌드 스크립트
//
//  src/index.html 안의  <!-- include: partials/xxx.html -->  자리에
//  해당 조각 파일을 끼워 넣어 루트의 index.html 을 만든다.
//
//  실행:  npm run build
//
//  ⚠️ 루트의 index.html 은 생성물이다. 직접 고치면 다음 빌드 때 사라진다.
//     수정은 src/index.html 또는 src/partials/ 안에서 한다.
// ────────────────────────────────────────────────────────────────

const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const SRC = path.join(root, 'src', 'index.html');
const OUT = path.join(root, 'index.html');

const BANNER = `<!--
  ⚠️  이 파일은 자동 생성됩니다. 직접 수정하지 마십시오.

      수정할 곳
        · 본문           → src/index.html
        · 상단 헤더      → src/partials/header.html
        · 자주 묻는 질문 → src/partials/faq.html
        · 하단 푸터      → src/partials/footer.html

      수정 후  npm run build  를 실행하면 이 파일이 다시 만들어집니다.
-->
`;

if (!fs.existsSync(SRC)) {
  console.error(`✗ 원본을 찾을 수 없습니다: ${SRC}`);
  process.exit(1);
}

let html = fs.readFileSync(SRC, 'utf-8');
const used = [];
let missing = 0;

html = html.replace(/^[ \t]*<!--\s*include:\s*(.+?)\s*-->[ \t]*$/gm, (_m, rel) => {
  const file = path.join(root, 'src', rel);
  if (!fs.existsSync(file)) {
    console.error(`✗ 조각 파일이 없습니다: src/${rel}`);
    missing += 1;
    return `<!-- MISSING: ${rel} -->`;
  }
  used.push(rel);
  return fs.readFileSync(file, 'utf-8').replace(/\n+$/, '');
});

if (missing) {
  console.error(`\n✗ 빌드 중단 — 조각 파일 ${missing}개를 찾지 못했습니다.`);
  process.exit(1);
}

if (!used.length) {
  console.warn('⚠ include 지시자를 하나도 찾지 못했습니다. src/index.html 을 확인하십시오.');
}

fs.writeFileSync(OUT, BANNER + html, 'utf-8');

console.log('✓ index.html 생성 완료');
used.forEach((f) => console.log(`    ← src/${f}`));
console.log(`    ${(BANNER + html).length.toLocaleString()} bytes`);
