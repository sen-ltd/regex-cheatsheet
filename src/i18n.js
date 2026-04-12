export const TRANSLATIONS = {
  ja: {
    siteTitle: '正規表現チートシート',
    siteSubtitle: 'ライブテスター付き 40+ パターン解説 & 20+ 実用パターン',
    searchPlaceholder: 'パターンを検索…',
    themeLight: 'ライトモード',
    themeDark: 'ダークモード',
    langToggle: 'English',
    commonPatterns: '実用パターン',
    reference: 'パターン解説',
    matchCount: (n) => `${n} 件のマッチ`,
    noMatch: 'マッチなし',
    copyPattern: 'コピー',
    copied: 'コピー済み',
    loadPattern: '読み込む',
    flagsLabel: 'フラグ',
    testTextLabel: 'テスト文字列',
    patternLabel: 'パターン',
    matchesLabel: 'マッチ結果',
    errorLabel: 'エラー',
    captureGroups: 'キャプチャグループ',
    allCategories: 'すべて',
    testThisPattern: 'テスト',
    explanation: '説明',
    example: '例',
    flags: {
      i: '大文字小文字を区別しない',
      g: '全体マッチ（グローバル）',
      m: '複数行モード（^ と $ が各行に対応）',
      s: '単一行モード（. が改行にもマッチ）',
      u: 'Unicode モード',
      y: '粘着モード（lastIndex から検索）',
    },
  },
  en: {
    siteTitle: 'Regex Cheatsheet',
    siteSubtitle: 'Live tester on every entry. 40+ syntax examples + 20+ common patterns.',
    searchPlaceholder: 'Search patterns…',
    themeLight: 'Light mode',
    themeDark: 'Dark mode',
    langToggle: '日本語',
    commonPatterns: 'Common Patterns',
    reference: 'Reference',
    matchCount: (n) => `${n} match${n !== 1 ? 'es' : ''}`,
    noMatch: 'No matches',
    copyPattern: 'Copy',
    copied: 'Copied!',
    loadPattern: 'Load',
    flagsLabel: 'Flags',
    testTextLabel: 'Test string',
    patternLabel: 'Pattern',
    matchesLabel: 'Matches',
    errorLabel: 'Error',
    captureGroups: 'Capture groups',
    allCategories: 'All',
    testThisPattern: 'Test',
    explanation: 'Explanation',
    example: 'Example',
    flags: {
      i: 'Case-insensitive matching',
      g: 'Global — find all matches',
      m: 'Multiline — ^ and $ match line boundaries',
      s: 'Dotall — . matches newline too',
      u: 'Unicode mode',
      y: 'Sticky — search from lastIndex',
    },
  },
};

let _lang = 'ja';

export function getLang() {
  return _lang;
}

export function setLang(lang) {
  if (lang === 'ja' || lang === 'en') _lang = lang;
}

export function t(key, ...args) {
  const trans = TRANSLATIONS[_lang];
  const val = trans[key];
  if (typeof val === 'function') return val(...args);
  return val ?? key;
}
