/**
 * Pure helpers for regex operations.
 * No DOM dependencies — fully testable in Node.
 */

const VALID_FLAGS = new Set(['i', 'g', 'm', 's', 'u', 'y']);

/**
 * Parse and validate a flag string.
 * Removes invalid and duplicate flags, returns sorted string.
 * @param {string} flagStr
 * @returns {string}
 */
export function parseFlags(flagStr) {
  if (typeof flagStr !== 'string') return '';
  const seen = new Set();
  let result = '';
  for (const ch of flagStr) {
    if (VALID_FLAGS.has(ch) && !seen.has(ch)) {
      seen.add(ch);
      result += ch;
    }
  }
  return result;
}

/**
 * Safely compile a regex.
 * @param {string} pattern
 * @param {string} flags
 * @returns {{ regex: RegExp|null, error: string|null }}
 */
export function safeCompile(pattern, flags) {
  if (typeof pattern !== 'string') {
    return { regex: null, error: 'Pattern must be a string' };
  }
  const cleanFlags = parseFlags(flags ?? '');
  try {
    const regex = new RegExp(pattern, cleanFlags);
    return { regex, error: null };
  } catch (e) {
    return { regex: null, error: e.message };
  }
}

/**
 * Find all matches in text using regex.
 * Always uses a fresh regex to avoid lastIndex issues.
 * @param {RegExp} regex
 * @param {string} text
 * @returns {Array<{ start: number, end: number, match: string, groups: Object|null }>}
 */
export function findMatches(regex, text) {
  if (!(regex instanceof RegExp) || typeof text !== 'string') return [];
  if (text === '') return [];

  // Rebuild with 'd' flag support; ensure global or run once
  const flags = parseFlags(regex.flags);
  const hasGlobal = flags.includes('g') || flags.includes('y');

  const results = [];
  try {
    if (hasGlobal) {
      const re = new RegExp(regex.source, flags);
      let match;
      let lastIndex = -1;
      while ((match = re.exec(text)) !== null) {
        // Guard against zero-width infinite loops
        if (match.index === lastIndex) {
          re.lastIndex++;
          continue;
        }
        lastIndex = match.index;
        results.push({
          start: match.index,
          end: match.index + match[0].length,
          match: match[0],
          groups: match.groups ?? null,
          captures: match.slice(1),
        });
      }
    } else {
      const re = new RegExp(regex.source, flags);
      const match = re.exec(text);
      if (match) {
        results.push({
          start: match.index,
          end: match.index + match[0].length,
          match: match[0],
          groups: match.groups ?? null,
          captures: match.slice(1),
        });
      }
    }
  } catch (_) {
    // Swallow runtime errors
  }
  return results;
}

/**
 * Split text into segments for highlighting.
 * @param {string} text
 * @param {Array<{ start: number, end: number }>} matches
 * @returns {Array<{ text: string, isMatch: boolean, matchIdx: number }>}
 */
export function highlightMatches(text, matches) {
  if (typeof text !== 'string') return [];
  if (!matches || matches.length === 0) {
    return text ? [{ text, isMatch: false, matchIdx: -1 }] : [];
  }

  const segments = [];
  let cursor = 0;

  for (let i = 0; i < matches.length; i++) {
    const { start, end } = matches[i];
    if (start < cursor) continue; // skip overlapping

    if (start > cursor) {
      segments.push({ text: text.slice(cursor, start), isMatch: false, matchIdx: -1 });
    }
    segments.push({ text: text.slice(start, end), isMatch: true, matchIdx: i });
    cursor = end;
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), isMatch: false, matchIdx: -1 });
  }

  return segments;
}

/**
 * Describe a regex pattern in human-readable terms.
 * Tokenizes the pattern and returns a description string.
 * @param {string} pattern
 * @returns {string}
 */
export function describePattern(pattern) {
  if (!pattern) return '';

  const tokens = tokenizePattern(pattern);
  if (tokens.length === 0) return '';

  const parts = tokens.map(describeToken);
  return parts.filter(Boolean).join(', ');
}

function tokenizePattern(pattern) {
  const tokens = [];
  let i = 0;
  while (i < pattern.length) {
    const ch = pattern[i];

    // Escape sequence
    if (ch === '\\' && i + 1 < pattern.length) {
      tokens.push({ type: 'escape', value: pattern.slice(i, i + 2) });
      i += 2;
      continue;
    }

    // Character class [...]
    if (ch === '[') {
      let end = i + 1;
      if (pattern[end] === '^') end++;
      while (end < pattern.length && pattern[end] !== ']') {
        if (pattern[end] === '\\') end++; // skip escaped
        end++;
      }
      tokens.push({ type: 'class', value: pattern.slice(i, end + 1) });
      i = end + 1;
      continue;
    }

    // Group (...)
    if (ch === '(') {
      let depth = 1;
      let j = i + 1;
      while (j < pattern.length && depth > 0) {
        if (pattern[j] === '\\') { j += 2; continue; }
        if (pattern[j] === '(') depth++;
        else if (pattern[j] === ')') depth--;
        j++;
      }
      tokens.push({ type: 'group', value: pattern.slice(i, j) });
      i = j;
      continue;
    }

    // Quantifier
    if ('*+?'.includes(ch)) {
      let val = ch;
      if (pattern[i + 1] === '?') { val += '?'; i++; }
      tokens.push({ type: 'quantifier', value: val });
      i++;
      continue;
    }

    // {n,m} quantifier
    if (ch === '{') {
      const end = pattern.indexOf('}', i);
      if (end !== -1) {
        let val = pattern.slice(i, end + 1);
        if (pattern[end + 1] === '?') { val += '?'; i = end + 2; }
        else i = end + 1;
        tokens.push({ type: 'quantifier', value: val });
        continue;
      }
    }

    // Anchors
    if (ch === '^' || ch === '$') {
      tokens.push({ type: 'anchor', value: ch });
      i++;
      continue;
    }

    // Dot
    if (ch === '.') {
      tokens.push({ type: 'dot', value: '.' });
      i++;
      continue;
    }

    // Alternation
    if (ch === '|') {
      tokens.push({ type: 'alternation', value: '|' });
      i++;
      continue;
    }

    // Literal
    tokens.push({ type: 'literal', value: ch });
    i++;
  }
  return tokens;
}

function describeToken(token) {
  switch (token.type) {
    case 'escape': return describeEscape(token.value);
    case 'class': return describeClass(token.value);
    case 'group': return describeGroup(token.value);
    case 'quantifier': return describeQuantifier(token.value);
    case 'anchor': return token.value === '^' ? 'start of string' : 'end of string';
    case 'dot': return 'any character (except newline)';
    case 'alternation': return 'or';
    case 'literal': return `literal "${token.value}"`;
    default: return '';
  }
}

function describeEscape(val) {
  const map = {
    '\\d': 'digit [0-9]',
    '\\D': 'non-digit',
    '\\w': 'word character [a-zA-Z0-9_]',
    '\\W': 'non-word character',
    '\\s': 'whitespace',
    '\\S': 'non-whitespace',
    '\\b': 'word boundary',
    '\\B': 'non-word boundary',
    '\\n': 'newline',
    '\\r': 'carriage return',
    '\\t': 'tab',
    '\\0': 'null character',
  };
  if (map[val]) return map[val];
  if (/^\\[0-9]$/.test(val)) return `backreference ${val.slice(1)}`;
  return `escaped "${val.slice(1)}"`;
}

function describeClass(val) {
  const negated = val[1] === '^';
  const inner = negated ? val.slice(2, -1) : val.slice(1, -1);
  const prefix = negated ? 'not in ' : 'one of ';
  return `${prefix}[${inner}]`;
}

function describeGroup(val) {
  if (val.startsWith('(?:')) return 'non-capturing group';
  if (val.startsWith('(?<')) {
    const nameMatch = val.match(/^\(\?<([^>]+)>/);
    return nameMatch ? `named capture "${nameMatch[1]}"` : 'named capture group';
  }
  if (val.startsWith('(?=')) return 'positive lookahead';
  if (val.startsWith('(?!')) return 'negative lookahead';
  if (val.startsWith('(?<=')) return 'positive lookbehind';
  if (val.startsWith('(?<!')) return 'negative lookbehind';
  return 'capture group';
}

function describeQuantifier(val) {
  const lazy = val.endsWith('?') && val.length > 1;
  const base = lazy ? val.slice(0, -1) : val;
  const suffix = lazy ? ' (lazy)' : '';
  const qmap = {
    '*': `zero or more${suffix}`,
    '+': `one or more${suffix}`,
    '?': 'optional (zero or one)',
  };
  if (qmap[base]) return qmap[base];
  const exact = base.match(/^\{(\d+)\}$/);
  if (exact) return `exactly ${exact[1]}${suffix}`;
  const minMax = base.match(/^\{(\d+),(\d*)\}$/);
  if (minMax) {
    if (minMax[2] === '') return `${minMax[1]} or more${suffix}`;
    return `between ${minMax[1]} and ${minMax[2]}${suffix}`;
  }
  return `quantifier ${val}`;
}

/** Pre-built common patterns */
export const COMMON_PATTERNS = [
  {
    id: 'email',
    name: 'Email',
    pattern: '[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}',
    flags: 'i',
    example: 'user@example.com',
    description: { ja: 'メールアドレス', en: 'Email address' },
  },
  {
    id: 'url',
    name: 'URL',
    pattern: 'https?:\\/\\/[\\w\\-]+(\\.[\\w\\-]+)+([\\w\\-.,@?^=%&:/~+#]*[\\w\\-@?^=%&/~+#])?',
    flags: 'i',
    example: 'https://example.com/path?q=1',
    description: { ja: 'URL (http / https)', en: 'URL (http / https)' },
  },
  {
    id: 'phone-jp',
    name: 'Phone (JP)',
    pattern: '0\\d{1,4}[\\-\\s]?\\d{1,4}[\\-\\s]?\\d{4}',
    flags: 'g',
    example: '090-1234-5678',
    description: { ja: '日本の電話番号', en: 'Japanese phone number' },
  },
  {
    id: 'phone-intl',
    name: 'Phone (intl)',
    pattern: '\\+?[1-9]\\d{1,14}',
    flags: 'g',
    example: '+1 800 555 0100',
    description: { ja: '国際電話番号 (E.164)', en: 'International phone (E.164)' },
  },
  {
    id: 'date-iso',
    name: 'Date (ISO)',
    pattern: '\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])',
    flags: 'g',
    example: '2026-04-13',
    description: { ja: '日付 YYYY-MM-DD', en: 'Date YYYY-MM-DD' },
  },
  {
    id: 'date-slash',
    name: 'Date (slash)',
    pattern: '(?:0?[1-9]|[12]\\d|3[01])\\/(?:0?[1-9]|1[0-2])\\/(?:19|20)\\d{2}',
    flags: 'g',
    example: '13/04/2026',
    description: { ja: '日付 DD/MM/YYYY', en: 'Date DD/MM/YYYY' },
  },
  {
    id: 'time-24',
    name: 'Time (24h)',
    pattern: '(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d)?',
    flags: 'g',
    example: '23:59:00',
    description: { ja: '24時間形式 HH:MM[:SS]', en: '24-hour time HH:MM[:SS]' },
  },
  {
    id: 'hex-color',
    name: 'Hex color',
    pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b',
    flags: 'g',
    example: '#ff0099 and #abc',
    description: { ja: '16進数カラーコード', en: 'Hex color code' },
  },
  {
    id: 'ipv4',
    name: 'IPv4',
    pattern: '(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)',
    flags: 'g',
    example: '192.168.1.255',
    description: { ja: 'IPv4アドレス', en: 'IPv4 address' },
  },
  {
    id: 'ipv6',
    name: 'IPv6',
    pattern: '(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}',
    flags: 'i',
    example: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
    description: { ja: 'IPv6アドレス（完全形）', en: 'IPv6 address (full)' },
  },
  {
    id: 'uuid',
    name: 'UUID',
    pattern: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}',
    flags: 'i',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: { ja: 'UUID v4', en: 'UUID v4' },
  },
  {
    id: 'credit-card',
    name: 'Credit card',
    pattern: '(?:\\d{4}[\\s\\-]?){3}\\d{4}',
    flags: 'g',
    example: '4111 1111 1111 1111',
    description: { ja: 'クレジットカード番号', en: 'Credit card number (16 digit)' },
  },
  {
    id: 'postal-jp',
    name: 'Postal (JP)',
    pattern: '〒?\\d{3}-\\d{4}',
    flags: 'g',
    example: '〒100-0001',
    description: { ja: '日本の郵便番号', en: 'Japanese postal code' },
  },
  {
    id: 'slug',
    name: 'Slug',
    pattern: '[a-z0-9]+(?:-[a-z0-9]+)*',
    flags: 'g',
    example: 'my-url-slug',
    description: { ja: 'URLスラグ', en: 'URL slug' },
  },
  {
    id: 'semver',
    name: 'Semver',
    pattern: '\\bv?(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)(?:-[\\w.]+)?(?:\\+[\\w.]+)?\\b',
    flags: 'i',
    example: '1.2.3-alpha+build.1',
    description: { ja: 'セマンティックバージョン', en: 'Semantic version' },
  },
  {
    id: 'html-tag',
    name: 'HTML tag',
    pattern: '<([a-z][a-z0-9]*)(?:\\s[^>]*)?>',
    flags: 'ig',
    example: '<div class="box"> <img src="a.png">',
    description: { ja: 'HTMLタグ（開きタグ）', en: 'HTML opening tag' },
  },
  {
    id: 'whitespace',
    name: 'Whitespace',
    pattern: '\\s+',
    flags: 'g',
    example: 'hello   world\ttab\nnewline',
    description: { ja: '空白文字（1文字以上）', en: 'Whitespace (one or more)' },
  },
  {
    id: 'password-strong',
    name: 'Strong password',
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\w\\s]).{8,}$',
    flags: '',
    example: 'Passw0rd!',
    description: { ja: '強いパスワード（8文字以上、大小文字・数字・記号）', en: 'Strong password (8+ chars, upper, lower, digit, symbol)' },
  },
  {
    id: 'markdown-link',
    name: 'Markdown link',
    pattern: '\\[([^\\]]+)\\]\\(([^)]+)\\)',
    flags: 'g',
    example: '[link text](https://example.com)',
    description: { ja: 'Markdownリンク', en: 'Markdown hyperlink' },
  },
  {
    id: 'hashtag',
    name: 'Hashtag',
    pattern: '#[\\w\\u3000-\\u9fff]+',
    flags: 'g',
    example: '#JavaScript #正規表現 #regex',
    description: { ja: 'ハッシュタグ（ASCII & 日本語）', en: 'Hashtag (ASCII & Japanese)' },
  },
];
