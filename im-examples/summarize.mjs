import { readFile } from 'node:fs/promises';
const m = JSON.parse(await readFile('./manifest.json', 'utf8'));

console.log('=== Real-content samples (slide 2 of each section) ===\n');
for (const ex of m.examples) {
  const s = ex.slides[1] || ex.slides[0];
  console.log(`[${ex.section}] slide ${s.index} (guess: ${s.candidate_layout})`);
  console.log('  title :', JSON.stringify(s.title.slice(0, 120)));
  const preview = s.text.replace(/\s+/g, ' ').slice(0, 280);
  console.log('  text  :', JSON.stringify(preview));
  console.log(`  meta  : shapes=${s.shape_count} images=${s.image_count} table=${s.has_table} chars=${s.text.length}`);
  console.log();
}
