import { CATEGORIES } from './patterns.js';
import { COMMON_PATTERNS } from './regex.js';
import { safeCompile, findMatches, highlightMatches, describePattern } from './regex.js';
import { t, getLang, setLang, TRANSLATIONS } from './i18n.js';

// ─── State ────────────────────────────────────────────────────────────────────
let lang = 'ja';
let theme = 'dark';
let activeCategory = 'all';
let commonTesterPattern = '';
let commonTesterText = '';
let commonTesterFlags = 'g';

// ─── DOM helpers ──────────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const create = (tag, cls) => {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  return el;
};

// ─── Render helpers ───────────────────────────────────────────────────────────

/** Render highlighted matches as HTML string */
function renderHighlighted(text, segments) {
  if (!segments.length) return escHtml(text);
  return segments
    .map(({ text: seg, isMatch, matchIdx }) => {
      const safe = escHtml(seg);
      if (!isMatch) return safe;
      const color = MATCH_COLORS[matchIdx % MATCH_COLORS.length];
      return `<mark class="match-hl" style="--hl:${color}" title="match ${matchIdx + 1}">${safe}</mark>`;
    })
    .join('');
}

const MATCH_COLORS = [
  '#f59e0b', '#10b981', '#3b82f6', '#ec4899',
  '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16',
];

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── Live tester card ─────────────────────────────────────────────────────────

function buildCard(entry, cardId) {
  const card = create('div', 'pattern-card');
  card.dataset.cardId = cardId;

  // Title
  const titleEl = create('div', 'card-title');
  titleEl.textContent = entry.title[lang];
  card.appendChild(titleEl);

  // Description
  if (entry.description) {
    const descEl = create('div', 'card-desc');
    descEl.textContent = entry.description[lang];
    card.appendChild(descEl);
  }

  // Pattern row
  const patternRow = create('div', 'tester-row');
  const patternLabel = create('label', 'tester-label');
  patternLabel.textContent = t('patternLabel');
  const patternWrap = create('div', 'pattern-wrap');
  const slashOpen = create('span', 'regex-slash');
  slashOpen.textContent = '/';
  const patternInput = create('input', 'pattern-input');
  patternInput.type = 'text';
  patternInput.value = entry.pattern;
  patternInput.spellcheck = false;
  patternInput.autocomplete = 'off';
  const slashClose = create('span', 'regex-slash');
  slashClose.textContent = '/';
  const flagsInput = create('input', 'flags-input');
  flagsInput.type = 'text';
  flagsInput.value = entry.flags ?? 'g';
  flagsInput.spellcheck = false;
  flagsInput.maxLength = 6;
  flagsInput.placeholder = 'flags';
  flagsInput.title = t('flagsLabel');
  const copyBtn = create('button', 'copy-btn');
  copyBtn.type = 'button';
  copyBtn.textContent = t('copyPattern');
  copyBtn.title = t('copyPattern');
  patternWrap.appendChild(slashOpen);
  patternWrap.appendChild(patternInput);
  patternWrap.appendChild(slashClose);
  patternWrap.appendChild(flagsInput);
  patternWrap.appendChild(copyBtn);
  patternRow.appendChild(patternLabel);
  patternRow.appendChild(patternWrap);
  card.appendChild(patternRow);

  // Test text row
  const textRow = create('div', 'tester-row');
  const textLabel = create('label', 'tester-label');
  textLabel.textContent = t('testTextLabel');
  const testTextarea = create('textarea', 'test-textarea');
  testTextarea.value = entry.testText ?? '';
  testTextarea.spellcheck = false;
  testTextarea.rows = 2;
  textRow.appendChild(textLabel);
  textRow.appendChild(testTextarea);
  card.appendChild(textRow);

  // Output row
  const outputRow = create('div', 'tester-row output-row');
  const outputLabel = create('div', 'tester-label output-label');
  const outputPre = create('pre', 'match-output');
  outputPre.setAttribute('aria-live', 'polite');
  const matchBadge = create('span', 'match-badge');
  outputLabel.appendChild(matchBadge);
  outputRow.appendChild(outputLabel);
  outputRow.appendChild(outputPre);
  card.appendChild(outputRow);

  // Capture groups
  const groupsRow = create('div', 'groups-row');
  groupsRow.hidden = true;
  card.appendChild(groupsRow);

  // Explain row
  const explainRow = create('div', 'explain-row');
  card.appendChild(explainRow);

  // Wire up live update
  const update = () => updateCard(card, patternInput, flagsInput, testTextarea, outputPre, matchBadge, groupsRow, explainRow);

  patternInput.addEventListener('input', update);
  flagsInput.addEventListener('input', update);
  testTextarea.addEventListener('input', update);

  copyBtn.addEventListener('click', () => {
    const toCopy = `/${patternInput.value}/${flagsInput.value}`;
    navigator.clipboard?.writeText(toCopy).catch(() => {});
    copyBtn.textContent = t('copied');
    setTimeout(() => { copyBtn.textContent = t('copyPattern'); }, 1500);
  });

  // Initial render
  update();

  return card;
}

function updateCard(card, patternInput, flagsInput, testTextarea, outputPre, matchBadge, groupsRow, explainRow) {
  const pattern = patternInput.value;
  const flags = flagsInput.value;
  const text = testTextarea.value;

  // Remove error state
  patternInput.classList.remove('error');

  if (!pattern) {
    outputPre.innerHTML = escHtml(text);
    matchBadge.textContent = '';
    matchBadge.className = 'match-badge';
    groupsRow.hidden = true;
    explainRow.textContent = '';
    return;
  }

  const { regex, error } = safeCompile(pattern, flags);
  if (error) {
    patternInput.classList.add('error');
    outputPre.innerHTML = `<span class="error-msg">${escHtml(error)}</span>`;
    matchBadge.textContent = t('errorLabel');
    matchBadge.className = 'match-badge badge-error';
    groupsRow.hidden = true;
    explainRow.textContent = '';
    return;
  }

  const matches = findMatches(regex, text);
  const segments = highlightMatches(text, matches);
  outputPre.innerHTML = renderHighlighted(text, segments);

  if (matches.length > 0) {
    matchBadge.textContent = t('matchCount', matches.length);
    matchBadge.className = 'match-badge badge-ok';
  } else {
    matchBadge.textContent = t('noMatch');
    matchBadge.className = 'match-badge badge-none';
  }

  // Capture groups
  const hasGroups = matches.some(m => m.captures?.length > 0 || m.groups);
  if (hasGroups) {
    groupsRow.hidden = false;
    groupsRow.innerHTML = '';
    const label = create('div', 'groups-label');
    label.textContent = t('captureGroups');
    groupsRow.appendChild(label);
    matches.slice(0, 5).forEach((m, idx) => {
      if (m.captures?.some(Boolean) || m.groups) {
        const item = create('div', 'groups-item');
        item.textContent = `#${idx + 1}: `;
        const caps = m.captures?.filter(c => c != null) ?? [];
        const named = m.groups ? Object.entries(m.groups) : [];
        const parts = [];
        caps.forEach((c, i) => parts.push(`$${i + 1}="${escHtml(c ?? '')}"`));
        named.forEach(([k, v]) => parts.push(`${k}="${escHtml(v ?? '')}"`));
        item.innerHTML += parts.join(', ');
        groupsRow.appendChild(item);
      }
    });
  } else {
    groupsRow.hidden = true;
  }

  // Explanation
  const desc = describePattern(pattern);
  if (desc) {
    explainRow.textContent = desc;
    explainRow.className = 'explain-row has-content';
  } else {
    explainRow.textContent = '';
    explainRow.className = 'explain-row';
  }
}

// ─── Category nav ─────────────────────────────────────────────────────────────

function buildCategoryNav() {
  const nav = $('category-nav');
  nav.innerHTML = '';

  // All button
  const allBtn = create('button', `cat-btn${activeCategory === 'all' ? ' active' : ''}`);
  allBtn.dataset.cat = 'all';
  allBtn.textContent = t('allCategories');
  allBtn.addEventListener('click', () => selectCategory('all'));
  nav.appendChild(allBtn);

  CATEGORIES.forEach(cat => {
    const btn = create('button', `cat-btn${activeCategory === cat.id ? ' active' : ''}`);
    btn.dataset.cat = cat.id;
    btn.textContent = cat.name[lang];
    btn.addEventListener('click', () => selectCategory(cat.id));
    nav.appendChild(btn);
  });
}

function selectCategory(catId) {
  activeCategory = catId;
  // Update nav buttons
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cat === catId);
  });
  // Show/hide sections
  document.querySelectorAll('.category-section').forEach(sec => {
    if (catId === 'all') {
      sec.hidden = false;
    } else {
      sec.hidden = sec.dataset.catId !== catId;
    }
  });
}

// ─── Reference section ────────────────────────────────────────────────────────

function buildReferenceSection() {
  const container = $('reference-container');
  container.innerHTML = '';

  CATEGORIES.forEach(cat => {
    const section = create('section', 'category-section');
    section.dataset.catId = cat.id;

    const heading = create('h2', 'section-heading');
    heading.textContent = cat.name[lang];
    section.appendChild(heading);

    const grid = create('div', 'cards-grid');
    cat.entries.forEach((entry, idx) => {
      const cardId = `${cat.id}-${idx}`;
      const card = buildCard(entry, cardId);
      grid.appendChild(card);
    });
    section.appendChild(grid);
    container.appendChild(section);
  });

  selectCategory(activeCategory);
}

// ─── Common patterns section ──────────────────────────────────────────────────

function buildCommonPatterns() {
  const container = $('common-patterns-grid');
  container.innerHTML = '';

  COMMON_PATTERNS.forEach(p => {
    const card = create('div', 'common-card');

    const nameEl = create('div', 'common-name');
    nameEl.textContent = p.name;
    card.appendChild(nameEl);

    const descEl = create('div', 'common-desc');
    descEl.textContent = p.description[lang];
    card.appendChild(descEl);

    const exampleEl = create('div', 'common-example');
    exampleEl.textContent = p.example;
    card.appendChild(exampleEl);

    const patternEl = create('code', 'common-pattern');
    patternEl.textContent = `/${p.pattern}/${p.flags}`;
    card.appendChild(patternEl);

    const actions = create('div', 'common-actions');
    const loadBtn = create('button', 'load-btn');
    loadBtn.type = 'button';
    loadBtn.textContent = t('loadPattern');
    loadBtn.addEventListener('click', () => loadCommonPattern(p));
    const copyBtn = create('button', 'copy-btn-sm');
    copyBtn.type = 'button';
    copyBtn.textContent = t('copyPattern');
    copyBtn.addEventListener('click', () => {
      navigator.clipboard?.writeText(`/${p.pattern}/${p.flags}`).catch(() => {});
      copyBtn.textContent = t('copied');
      setTimeout(() => { copyBtn.textContent = t('copyPattern'); }, 1500);
    });
    actions.appendChild(loadBtn);
    actions.appendChild(copyBtn);
    card.appendChild(actions);

    container.appendChild(card);
  });
}

function loadCommonPattern(p) {
  // Scroll to the inline tester
  const tester = $('inline-tester');
  if (tester) {
    $('tester-pattern').value = p.pattern;
    $('tester-flags').value = p.flags;
    $('tester-text').value = p.example;
    tester.scrollIntoView({ behavior: 'smooth', block: 'center' });
    runInlineTester();
  }
}

// ─── Inline tester (common patterns playground) ───────────────────────────────

function buildInlineTester() {
  const patternInput = $('tester-pattern');
  const flagsInput = $('tester-flags');
  const textInput = $('tester-text');
  const output = $('tester-output');
  const badge = $('tester-badge');
  const explainEl = $('tester-explain');
  const groupsEl = $('tester-groups');
  const copyBtn = $('tester-copy');

  const update = () => runInlineTester();
  patternInput.addEventListener('input', update);
  flagsInput.addEventListener('input', update);
  textInput.addEventListener('input', update);

  copyBtn.addEventListener('click', () => {
    const val = `/${patternInput.value}/${flagsInput.value}`;
    navigator.clipboard?.writeText(val).catch(() => {});
    copyBtn.textContent = t('copied');
    setTimeout(() => { copyBtn.textContent = t('copyPattern'); }, 1500);
  });
}

function runInlineTester() {
  const patternInput = $('tester-pattern');
  const flagsInput = $('tester-flags');
  const textInput = $('tester-text');
  const output = $('tester-output');
  const badge = $('tester-badge');
  const explainEl = $('tester-explain');
  const groupsEl = $('tester-groups');

  const pattern = patternInput.value;
  const flags = flagsInput.value;
  const text = textInput.value;

  patternInput.classList.remove('error');

  if (!pattern) {
    output.innerHTML = escHtml(text);
    badge.textContent = '';
    badge.className = 'match-badge';
    explainEl.textContent = '';
    groupsEl.innerHTML = '';
    return;
  }

  const { regex, error } = safeCompile(pattern, flags);
  if (error) {
    patternInput.classList.add('error');
    output.innerHTML = `<span class="error-msg">${escHtml(error)}</span>`;
    badge.textContent = t('errorLabel');
    badge.className = 'match-badge badge-error';
    return;
  }

  const matches = findMatches(regex, text);
  const segments = highlightMatches(text, matches);
  output.innerHTML = renderHighlighted(text, segments);

  if (matches.length > 0) {
    badge.textContent = t('matchCount', matches.length);
    badge.className = 'match-badge badge-ok';
  } else {
    badge.textContent = t('noMatch');
    badge.className = 'match-badge badge-none';
  }

  const desc = describePattern(pattern);
  explainEl.textContent = desc || '';

  // Groups
  groupsEl.innerHTML = '';
  const hasGroups = matches.some(m => m.captures?.some(Boolean) || m.groups);
  if (hasGroups) {
    const label = create('div', 'groups-label');
    label.textContent = t('captureGroups');
    groupsEl.appendChild(label);
    matches.slice(0, 8).forEach((m, idx) => {
      const caps = m.captures?.filter(c => c != null) ?? [];
      const named = m.groups ? Object.entries(m.groups) : [];
      if (!caps.length && !named.length) return;
      const item = create('div', 'groups-item');
      const parts = [];
      caps.forEach((c, i) => parts.push(`$${i + 1}="${c ?? ''}"`));
      named.forEach(([k, v]) => parts.push(`${k}="${v ?? ''}"`));
      item.textContent = `#${idx + 1}: ${parts.join(', ')}`;
      groupsEl.appendChild(item);
    });
  }
}

// ─── Language toggle ─────────────────────────────────────────────────────────

function applyLang(newLang) {
  lang = newLang;
  setLang(newLang);
  document.documentElement.lang = newLang === 'ja' ? 'ja' : 'en';

  $('site-title').textContent = t('siteTitle');
  $('site-subtitle').textContent = t('siteSubtitle');
  $('lang-toggle').textContent = t('langToggle');
  $('common-section-title').textContent = t('commonPatterns');
  $('reference-section-title').textContent = t('reference');
  $('tester-copy').textContent = t('copyPattern');

  buildCategoryNav();
  buildReferenceSection();
  buildCommonPatterns();
  runInlineTester();
}

// ─── Theme toggle ─────────────────────────────────────────────────────────────

function applyTheme(t2) {
  theme = t2;
  document.documentElement.dataset.theme = t2;
  $('theme-toggle').textContent = t2 === 'dark' ? t('themeLight') : t('themeDark');
  localStorage.setItem('rc-theme', t2);
}

// ─── Init ────────────────────────────────────────────────────────────────────

function init() {
  // Restore theme
  const savedTheme = localStorage.getItem('rc-theme') ?? 'dark';
  applyTheme(savedTheme);

  $('lang-toggle').addEventListener('click', () => {
    applyLang(lang === 'ja' ? 'en' : 'ja');
  });
  $('theme-toggle').addEventListener('click', () => {
    applyTheme(theme === 'dark' ? 'light' : 'dark');
  });

  buildInlineTester();
  applyLang('ja');
}

document.addEventListener('DOMContentLoaded', init);
