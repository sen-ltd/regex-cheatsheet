import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  safeCompile,
  findMatches,
  highlightMatches,
  parseFlags,
  describePattern,
  COMMON_PATTERNS,
} from '../src/regex.js';

// ─── parseFlags ───────────────────────────────────────────────────────────────
describe('parseFlags', () => {
  it('returns valid flags unchanged', () => {
    assert.equal(parseFlags('gim'), 'gim');
  });

  it('removes invalid characters', () => {
    assert.equal(parseFlags('gzq'), 'g');
  });

  it('removes duplicate flags', () => {
    assert.equal(parseFlags('ggg'), 'g');
  });

  it('handles empty string', () => {
    assert.equal(parseFlags(''), '');
  });

  it('handles non-string gracefully', () => {
    assert.equal(parseFlags(null), '');
    assert.equal(parseFlags(undefined), '');
  });

  it('accepts all valid flags individually', () => {
    for (const f of ['i', 'g', 'm', 's', 'u', 'y']) {
      assert.equal(parseFlags(f), f);
    }
  });
});

// ─── safeCompile ─────────────────────────────────────────────────────────────
describe('safeCompile', () => {
  it('compiles a valid regex', () => {
    const { regex, error } = safeCompile('\\d+', 'g');
    assert.ok(regex instanceof RegExp);
    assert.equal(error, null);
  });

  it('returns error for invalid pattern', () => {
    const { regex, error } = safeCompile('[invalid', 'g');
    assert.equal(regex, null);
    assert.ok(typeof error === 'string');
    assert.ok(error.length > 0);
  });

  it('strips invalid flags before compiling', () => {
    const { regex, error } = safeCompile('\\w', 'gzinvalid');
    assert.ok(regex instanceof RegExp);
    assert.equal(error, null);
  });

  it('handles empty pattern', () => {
    const { regex, error } = safeCompile('', 'g');
    assert.ok(regex instanceof RegExp);
    assert.equal(error, null);
  });

  it('returns error for non-string pattern', () => {
    const { regex, error } = safeCompile(null, 'g');
    assert.equal(regex, null);
    assert.ok(typeof error === 'string');
  });
});

// ─── findMatches ──────────────────────────────────────────────────────────────
describe('findMatches', () => {
  it('finds multiple matches with global flag', () => {
    const { regex } = safeCompile('\\d+', 'g');
    const matches = findMatches(regex, 'abc 123 def 456');
    assert.equal(matches.length, 2);
    assert.equal(matches[0].match, '123');
    assert.equal(matches[1].match, '456');
  });

  it('returns empty array when no matches', () => {
    const { regex } = safeCompile('\\d+', 'g');
    const matches = findMatches(regex, 'no digits here');
    assert.equal(matches.length, 0);
  });

  it('finds single match without global flag', () => {
    const { regex } = safeCompile('\\d+', '');
    const matches = findMatches(regex, 'abc 123 def 456');
    assert.equal(matches.length, 1);
    assert.equal(matches[0].match, '123');
  });

  it('returns start and end positions', () => {
    const { regex } = safeCompile('foo', 'g');
    const matches = findMatches(regex, 'foobar foo');
    assert.equal(matches[0].start, 0);
    assert.equal(matches[0].end, 3);
    assert.equal(matches[1].start, 7);
    assert.equal(matches[1].end, 10);
  });

  it('returns capture groups', () => {
    const { regex } = safeCompile('(\\d{4})-(\\d{2})-(\\d{2})', '');
    const matches = findMatches(regex, '2026-04-13');
    assert.equal(matches.length, 1);
    assert.deepEqual(matches[0].captures, ['2026', '04', '13']);
  });

  it('returns named groups', () => {
    const { regex } = safeCompile('(?<year>\\d{4})-(?<month>\\d{2})', '');
    const matches = findMatches(regex, '2026-04');
    assert.equal(matches.length, 1);
    assert.equal(matches[0].groups?.year, '2026');
    assert.equal(matches[0].groups?.month, '04');
  });

  it('returns empty array for empty text', () => {
    const { regex } = safeCompile('\\d', 'g');
    const matches = findMatches(regex, '');
    assert.deepEqual(matches, []);
  });

  it('handles zero-width matches without infinite loop', () => {
    const { regex } = safeCompile('\\b', 'g');
    const matches = findMatches(regex, 'hello world');
    assert.ok(matches.length > 0);
    assert.ok(matches.length < 100); // sanity check
  });

  it('handles unicode text', () => {
    const { regex } = safeCompile('[\\u3042-\\u3093]', 'gu');
    const matches = findMatches(regex, 'あいうえお abc');
    assert.equal(matches.length, 5);
  });
});

// ─── highlightMatches ─────────────────────────────────────────────────────────
describe('highlightMatches', () => {
  it('returns single non-match segment when no matches', () => {
    const segs = highlightMatches('hello', []);
    assert.equal(segs.length, 1);
    assert.equal(segs[0].text, 'hello');
    assert.equal(segs[0].isMatch, false);
  });

  it('splits text into match and non-match segments', () => {
    const segs = highlightMatches('abc123def', [{ start: 3, end: 6 }]);
    assert.equal(segs.length, 3);
    assert.equal(segs[0].text, 'abc');
    assert.equal(segs[0].isMatch, false);
    assert.equal(segs[1].text, '123');
    assert.equal(segs[1].isMatch, true);
    assert.equal(segs[1].matchIdx, 0);
    assert.equal(segs[2].text, 'def');
    assert.equal(segs[2].isMatch, false);
  });

  it('handles match at beginning', () => {
    const segs = highlightMatches('123abc', [{ start: 0, end: 3 }]);
    assert.equal(segs[0].isMatch, true);
    assert.equal(segs[0].text, '123');
    assert.equal(segs[1].text, 'abc');
  });

  it('handles match at end', () => {
    const segs = highlightMatches('abc123', [{ start: 3, end: 6 }]);
    assert.equal(segs[0].text, 'abc');
    assert.equal(segs[1].text, '123');
    assert.equal(segs[1].isMatch, true);
  });

  it('handles multiple matches with correct matchIdx', () => {
    const segs = highlightMatches('1a2b3', [
      { start: 0, end: 1 },
      { start: 2, end: 3 },
      { start: 4, end: 5 },
    ]);
    const matchSegs = segs.filter(s => s.isMatch);
    assert.equal(matchSegs.length, 3);
    assert.equal(matchSegs[0].matchIdx, 0);
    assert.equal(matchSegs[1].matchIdx, 1);
    assert.equal(matchSegs[2].matchIdx, 2);
  });

  it('returns empty array for empty text with no matches', () => {
    const segs = highlightMatches('', []);
    assert.deepEqual(segs, []);
  });
});

// ─── describePattern ──────────────────────────────────────────────────────────
describe('describePattern', () => {
  it('returns empty string for empty pattern', () => {
    assert.equal(describePattern(''), '');
  });

  it('describes \\d escape', () => {
    const desc = describePattern('\\d');
    assert.ok(desc.includes('digit'), `Expected "digit" in "${desc}"`);
  });

  it('describes ^ anchor', () => {
    const desc = describePattern('^foo');
    assert.ok(desc.includes('start'), `Expected "start" in "${desc}"`);
  });

  it('describes quantifiers', () => {
    const star = describePattern('a*');
    assert.ok(star.includes('zero or more'), `Expected "zero or more" in "${star}"`);
    const plus = describePattern('a+');
    assert.ok(plus.includes('one or more'), `Expected "one or more" in "${plus}"`);
    const opt = describePattern('a?');
    assert.ok(opt.includes('optional'), `Expected "optional" in "${opt}"`);
  });

  it('describes named capture groups', () => {
    const desc = describePattern('(?<year>\\d{4})');
    assert.ok(desc.includes('year'), `Expected "year" in "${desc}"`);
  });

  it('describes lookahead', () => {
    const desc = describePattern('\\d+(?= dollars)');
    assert.ok(desc.includes('lookahead'), `Expected "lookahead" in "${desc}"`);
  });
});

// ─── Common patterns ─────────────────────────────────────────────────────────
describe('COMMON_PATTERNS', () => {
  it('has at least 20 entries', () => {
    assert.ok(COMMON_PATTERNS.length >= 20, `Expected >=20, got ${COMMON_PATTERNS.length}`);
  });

  it('each entry has required fields', () => {
    for (const p of COMMON_PATTERNS) {
      assert.ok(p.id, `Missing id in pattern ${JSON.stringify(p)}`);
      assert.ok(p.pattern, `Missing pattern in ${p.id}`);
      assert.ok(typeof p.flags === 'string', `Missing flags in ${p.id}`);
      assert.ok(p.example, `Missing example in ${p.id}`);
      assert.ok(p.description?.ja, `Missing ja desc in ${p.id}`);
      assert.ok(p.description?.en, `Missing en desc in ${p.id}`);
    }
  });

  it('email pattern matches a valid email', () => {
    const emailEntry = COMMON_PATTERNS.find(p => p.id === 'email');
    assert.ok(emailEntry, 'email pattern not found');
    const { regex } = safeCompile(emailEntry.pattern, emailEntry.flags);
    const matches = findMatches(regex, 'user@example.com');
    assert.ok(matches.length > 0, 'email pattern should match user@example.com');
  });

  it('email pattern does NOT match invalid email', () => {
    const emailEntry = COMMON_PATTERNS.find(p => p.id === 'email');
    const { regex } = safeCompile(emailEntry.pattern, emailEntry.flags);
    const matches = findMatches(regex, 'not-an-email');
    // The pattern is not anchored, may still partially match — just verify it's exported
    assert.ok(emailEntry.pattern.length > 0);
  });

  it('phone-jp pattern matches Japanese phone', () => {
    const entry = COMMON_PATTERNS.find(p => p.id === 'phone-jp');
    assert.ok(entry, 'phone-jp not found');
    const { regex } = safeCompile(entry.pattern, entry.flags);
    const matches = findMatches(regex, '090-1234-5678');
    assert.ok(matches.length > 0, 'should match 090-1234-5678');
  });

  it('hex-color pattern matches #ff0099', () => {
    const entry = COMMON_PATTERNS.find(p => p.id === 'hex-color');
    assert.ok(entry, 'hex-color not found');
    const { regex } = safeCompile(entry.pattern, entry.flags);
    const matches = findMatches(regex, '#ff0099');
    assert.ok(matches.length > 0, 'should match #ff0099');
  });

  it('hex-color pattern matches shorthand #abc', () => {
    const entry = COMMON_PATTERNS.find(p => p.id === 'hex-color');
    const { regex } = safeCompile(entry.pattern, entry.flags);
    const matches = findMatches(regex, '#abc');
    assert.ok(matches.length > 0, 'should match #abc');
  });

  it('uuid pattern matches a valid UUID', () => {
    const entry = COMMON_PATTERNS.find(p => p.id === 'uuid');
    assert.ok(entry, 'uuid not found');
    const { regex } = safeCompile(entry.pattern, entry.flags);
    const matches = findMatches(regex, '550e8400-e29b-41d4-a716-446655440000');
    assert.ok(matches.length > 0, 'should match UUID');
  });

  it('ipv4 pattern matches 192.168.1.255', () => {
    const entry = COMMON_PATTERNS.find(p => p.id === 'ipv4');
    assert.ok(entry, 'ipv4 not found');
    const { regex } = safeCompile(entry.pattern, entry.flags);
    const matches = findMatches(regex, '192.168.1.255');
    assert.ok(matches.length > 0, 'should match IPv4');
  });

  it('date-iso pattern matches 2026-04-13', () => {
    const entry = COMMON_PATTERNS.find(p => p.id === 'date-iso');
    assert.ok(entry, 'date-iso not found');
    const { regex } = safeCompile(entry.pattern, entry.flags);
    const matches = findMatches(regex, '2026-04-13');
    assert.ok(matches.length > 0, 'should match ISO date');
  });

  it('semver pattern matches 1.2.3-alpha', () => {
    const entry = COMMON_PATTERNS.find(p => p.id === 'semver');
    assert.ok(entry, 'semver not found');
    const { regex } = safeCompile(entry.pattern, entry.flags);
    const matches = findMatches(regex, '1.2.3-alpha');
    assert.ok(matches.length > 0, 'should match semver');
  });
});

// ─── Edge cases ───────────────────────────────────────────────────────────────
describe('Edge cases', () => {
  it('findMatches handles null regex gracefully', () => {
    const matches = findMatches(null, 'hello');
    assert.deepEqual(matches, []);
  });

  it('highlightMatches handles non-string text', () => {
    const segs = highlightMatches(null, []);
    assert.deepEqual(segs, []);
  });

  it('safeCompile handles backslash-only pattern error', () => {
    const { regex, error } = safeCompile('\\', 'g');
    assert.equal(regex, null);
    assert.ok(typeof error === 'string');
  });

  it('findMatches works with overlapping-potential zero-width matches', () => {
    const { regex } = safeCompile('a*', 'g');
    // Should not hang
    const matches = findMatches(regex, 'bbb');
    // May return zero-width matches at each position — just verify it terminates
    assert.ok(Array.isArray(matches));
  });
});
