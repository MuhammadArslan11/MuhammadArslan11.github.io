/* Framework-independent workspace rules. All positions refer to the final order. */
((root) => {
  'use strict';
  let next = 0;
  const uid = () => `page-${++next}`;
  const clone = value => JSON.parse(JSON.stringify(value));
  const pagesOf = panes => panes.flatMap(pane => pane.pages);

  function transfer(panes, ids, targetId, beforeId = null, copy = false) {
    const target = panes.find(pane => pane.id === targetId);
    if (!target) throw new Error('Choose a destination document.');
    const selected = new Set(ids);
    const moving = pagesOf(panes).filter(page => selected.has(page.id));
    if (!moving.length || (!copy && selected.has(beforeId))) return false;
    if (beforeId && !target.pages.some(page => page.id === beforeId)) throw new Error('The destination page is no longer available.');
    if (copy && pagesOf(panes).length + moving.length > 500) throw new Error('The workspace supports up to 500 pages.');
    const inserted = moving.map(page => copy ? {...page, id: uid()} : page);
    if (!copy) panes.forEach(pane => {pane.pages = pane.pages.filter(page => !selected.has(page.id));});
    const at = beforeId ? target.pages.findIndex(page => page.id === beforeId) : target.pages.length;
    target.pages.splice(at, 0, ...inserted);
    return inserted.map(page => page.id);
  }

  function select(panes, previous, anchor, id, {range = false, toggle = false} = {}) {
    const pane = panes.find(pane => pane.pages.some(page => page.id === id));
    if (!pane) throw new Error('The selected page is no longer available.');
    const allowed = new Set(pane.pages.map(page => page.id));
    const selected = new Set([...previous].filter(id => allowed.has(id)));
    if (range && allowed.has(anchor)) {
      if (!toggle) selected.clear();
      const a = pane.pages.findIndex(p => p.id === anchor), b = pane.pages.findIndex(p => p.id === id);
      pane.pages.slice(Math.min(a, b), Math.max(a, b) + 1).forEach(page => selected.add(page.id));
    } else {
      if (!toggle) selected.clear();
      if (toggle && selected.has(id)) selected.delete(id); else selected.add(id);
      anchor = id;
    }
    return {active: pane.id, selected, anchor};
  }

  function moveToPosition(panes, ids, targetId, position) {
    const pane = panes.find(pane => pane.id === targetId);
    if (!pane) throw new Error('Choose a document.');
    const remaining = pane.pages.filter(page => !ids.includes(page.id));
    if (!Number.isInteger(position) || position < 1 || position > remaining.length + 1) {
      throw new Error(`Enter a final position from 1 to ${remaining.length + 1}.`);
    }
    return transfer(panes, ids, targetId, remaining[position - 1]?.id || null);
  }

  function nudge(pages, ids, direction) {
    const selected = new Set(ids);
    if (direction === 'up') {
      for (let i = 1; i < pages.length; i++) if (selected.has(pages[i].id) && !selected.has(pages[i - 1].id)) {
        [pages[i - 1], pages[i]] = [pages[i], pages[i - 1]];
      }
    } else if (direction === 'down') {
      for (let i = pages.length - 2; i >= 0; i--) if (selected.has(pages[i].id) && !selected.has(pages[i + 1].id)) {
        [pages[i + 1], pages[i]] = [pages[i], pages[i + 1]];
      }
    }
  }

  function exportPlan(panes, active, from, scope, selected) {
    const pages = from === 'combined' ? pagesOf(panes) : (panes.find(p => p.id === (from === 'active' ? active : from))?.pages || []);
    return (scope === 'selected' ? pages.filter(page => selected.has(page.id)) : pages).map(page => ({...page}));
  }

  function packSources(sources, pages) {
    const used = [...new Set(pages.map(page => page.source))];
    if (used.some(index => !sources[index]?.file)) throw new Error('A source file is unavailable. Reopen that file.');
    return {files: used.map(index => sources[index].file), pages: pages.map(page => ({...page, source: used.indexOf(page.source)}))};
  }

  class History {
    constructor(limit = 40) {this.limit = limit; this.past = []; this.future = [];}
    record(before, after) {
      if (JSON.stringify(before) === JSON.stringify(after)) return false;
      this.past.push(clone(before));
      if (this.past.length > this.limit) this.past.shift();
      this.future = [];
      return true;
    }
    undo(current) {if (!this.past.length) return null; this.future.push(clone(current)); return this.past.pop();}
    redo(current) {if (!this.future.length) return null; this.past.push(clone(current)); return this.future.pop();}
    clear() {this.past = []; this.future = [];}
  }
  const api = {uid, clone, transfer, select, moveToPosition, nudge, exportPlan, packSources, History};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PDFWorkspaceModel = api;
})(globalThis);
