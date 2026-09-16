const {test} = require('node:test');
const assert = require('node:assert/strict');
const lib = require('../vendor/pdf-tools/pdf-lib.min.js');
const core = require('../pdf-tools-core.js');
const file = (name, bytes) => ({name, size: bytes.length, arrayBuffer: async () => Uint8Array.from(bytes).buffer});

async function fixture(widths = [300, 400, 500], form = false) {
  const doc = await lib.PDFDocument.create();
  doc.setTitle('Test source');
  for (const [index, width] of widths.entries()) doc.addPage([width, 600]).drawText(`Page ${index + 1}`, {x: 30, y: 540});
  if (form) {
    const field = doc.getForm().createTextField('name');
    field.setText('Example'); field.addToPage(doc.getPage(0), {x: 30, y: 450, width: 180, height: 25});
  }
  return file('source.pdf', await doc.save({useObjectStreams: false}));
}
async function run(input, options) {
  const result = await core.process(input, options, lib);
  return {result, doc: await lib.PDFDocument.load(result.bytes)};
}

test('page ranges preserve requested order, deduplicate, and reject invalid ranges', () => {
  assert.deepEqual(core.parsePages('3, 1-2, 2', 4), [2, 0, 1]);
  assert.deepEqual(core.parsePages('', 3, true), [0, 1, 2]);
  for (const value of ['', '0', '5', '3-1', '1,,2', '1.5', '1-9999999999', '1;2']) assert.throws(() => core.parsePages(value, 4));
});
test('merging follows file order and keeps page sizes', async () => {
  const {doc} = await run([await fixture([500]), await fixture([300, 400])], {tool: 'merge'});
  assert.deepEqual(doc.getPages().map(page => page.getWidth()), [500, 300, 400]);
});
test('extracting pages honors the selected sequence', async () => {
  const {doc} = await run([await fixture()], {tool: 'extract', pages: '3, 1'});
  assert.deepEqual(doc.getPages().map(page => page.getWidth()), [500, 300]);
});
test('removing pages keeps the correct remaining pages and rejects removing all', async () => {
  const source = await fixture();
  const {doc} = await run([source], {tool: 'remove', pages: '1, 3'});
  assert.deepEqual(doc.getPages().map(page => page.getWidth()), [400]);
  await assert.rejects(run([source], {tool: 'remove', pages: '1-3'}), /Keep at least one/);
});
test('rotation affects only chosen pages and preserves forms and metadata', async () => {
  const {doc} = await run([await fixture([300, 400], true)], {tool: 'rotate', pages: '2', angle: 90});
  assert.deepEqual(doc.getPages().map(page => page.getRotation().angle), [0, 90]);
  assert.equal(doc.getForm().getTextField('name').getText(), 'Example');
  assert.equal(doc.getTitle(), 'Test source');
});
test('optimization never produces a larger file and preserves text drawing', async () => {
  const source = await fixture();
  const {result, doc} = await run([source], {tool: 'optimize'});
  assert.ok(result.bytes.length < source.size);
  assert.equal(doc.getPageCount(), 3);
  assert.equal(doc.getTitle(), 'Test source');
  const second = await run([file('optimized.pdf', result.bytes)], {tool: 'optimize'});
  assert.ok(second.result.bytes.length <= result.bytes.length);
});
test('images create one correctly sized PDF page per image', async () => {
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLttAAAAABJRU5ErkJggg==', 'base64');
  const {doc} = await run([file('one.png', png), file('two.png', png)], {tool: 'images', paper: 'letter'});
  assert.equal(doc.getPageCount(), 2);
  assert.deepEqual(doc.getPage(0).getSize(), {width: 612, height: 792});
});
test('bad files, forms that cannot be copied safely, and incorrect selections report usable errors', async () => {
  await assert.rejects(run([file('bad.pdf', Buffer.from('not a PDF'))], {tool: 'optimize'}), /could not be read/);
  await assert.rejects(run([await fixture([300], true)], {tool: 'extract', pages: '1'}), /interactive form fields/);
  await assert.rejects(run([await fixture()], {tool: 'merge'}), /at least two/);
  assert.throws(() => core.validateFiles([{name: 'too-big.pdf', size: 51 * 1024 * 1024}], 'optimize'), /50 MB/);
  assert.throws(() => core.validateFiles([{name: 'bad.txt', size: 1}], 'optimize'), /PDF files only/);
});
