// Research tree inspired by Amazingren/amazingren.github.io's research.html.
// Keep the HTML list as a fallback; enhance it with an accessible SVG tree.
(() => {
  const section = document.querySelector('.research-overview');
  if (!section) return;
  const map = section.querySelector('.research-map');
  const areas = [...map.querySelectorAll('.research-branch')].map(branch => ({
    name: branch.querySelector('h4').textContent,
    papers: [...branch.querySelectorAll('a')].map(link => ({
      name: link.textContent,
      url: link.getAttribute('href')
    }))
  }));
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  const make = (tag, attrs, parent = svg, text) => {
    const el = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    if (text !== undefined) el.textContent = text;
    parent.appendChild(el);
    return el;
  };
  let y = 28;
  areas.forEach(area => {
    area.papers.forEach(paper => { paper.y = y; y += 34; });
    area.y = (area.papers[0].y + area.papers[area.papers.length - 1].y) / 2;
    y += 18;
  });
  const height = y - 18;
  const rootY = (areas[0].y + areas[areas.length - 1].y) / 2;
  svg.setAttribute('viewBox', `0 0 820 ${height}`);
  svg.setAttribute('role', 'group');
  svg.setAttribute('aria-labelledby', 'research-tree-title');
  svg.classList.add('research-tree');
  make('title', {id: 'research-tree-title'}, svg, 'Physical & Spatial AI: research areas and linked papers');
  const lines = make('g', {'aria-hidden': 'true', class: 'research-tree-lines'});
  const nodes = make('g', {});
  const curve = (x1, y1, x2, y2) => {
    const mid = (x1 + x2) / 2;
    return make('path', {d: `M${x1},${y1} C${mid},${y1} ${mid},${y2} ${x2},${y2}`}, lines);
  };
  const highlight = (element, paths) => {
    const set = active => paths.forEach(path => path.classList.toggle('active', active));
    element.addEventListener('pointerenter', () => set(true));
    element.addEventListener('pointerleave', () => set(false));
    element.addEventListener('focusin', () => set(true));
    element.addEventListener('focusout', () => set(false));
  };
  make('circle', {cx: 175, cy: rootY, r: 3.5}, nodes);
  const root = make('text', {x: 0, y: rootY - 7, class: 'research-tree-root'}, nodes);
  make('tspan', {x: 0}, root, 'Physical & Spatial AI');
  areas.forEach(area => {
    const trunk = curve(175, rootY, 215, area.y);
    const group = make('g', {}, nodes);
    make('circle', {cx: 215, cy: area.y, r: 3.5}, group);
    make('text', {x: 225, y: area.y, 'dominant-baseline': 'middle'}, group, area.name);
    highlight(group, [trunk]);
    area.papers.forEach(paper => {
      const branch = curve(415, area.y, 495, paper.y);
      make('circle', {cx: 495, cy: paper.y, r: 3.5}, nodes);
      const link = make('a', {href: paper.url, class: 'research-tree-paper', 'aria-label': `${paper.name} — ${area.name}`}, nodes);
      make('rect', {x: 505, y: paper.y - 14, width: paper.name.length * 8 + 20, height: 28, rx: 8}, link);
      make('text', {x: 515, y: paper.y, 'dominant-baseline': 'middle'}, link, paper.name);
      highlight(link, [trunk, branch]);
    });
  });
  const viewport = document.createElement('div');
  viewport.className = 'research-tree-viewport';
  viewport.appendChild(svg);
  section.appendChild(viewport);
  // Size each chip from its rendered label, including after web fonts load.
  const sizeChips = () => svg.querySelectorAll('a').forEach(link => {
    link.querySelector('rect').setAttribute('width', link.querySelector('text').getBBox().width + 20);
  });
  sizeChips();
  if (document.fonts) document.fonts.ready.then(sizeChips);
  map.hidden = true;
})();
