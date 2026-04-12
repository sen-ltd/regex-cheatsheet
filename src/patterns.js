export const CATEGORIES = [
  // ─── Character Classes ───────────────────────────────────────────────
  {
    id: 'char-classes',
    name: { ja: '文字クラス', en: 'Character Classes' },
    entries: [
      {
        pattern: '.',
        title: { ja: '任意の 1 文字（改行除く）', en: 'Any single character (except newline)' },
        testText: 'abc\n123',
        flags: 'g',
        description: {
          ja: '改行 (\\n) 以外のすべての文字に 1 文字マッチします。s フラグを使うと改行にもマッチします。',
          en: 'Matches any single character except newline. With the s flag it also matches newline.',
        },
      },
      {
        pattern: '\\d',
        title: { ja: '数字 [0-9]', en: 'Digit [0-9]' },
        testText: 'Phone: 090-1234-5678',
        flags: 'g',
        description: {
          ja: '0〜9 の数字 1 文字にマッチします。[0-9] と同等です。',
          en: 'Matches a single digit 0–9. Equivalent to [0-9].',
        },
      },
      {
        pattern: '\\D',
        title: { ja: '数字以外', en: 'Non-digit' },
        testText: 'abc 123 !@#',
        flags: 'g',
        description: {
          ja: '数字（0〜9）以外の文字 1 文字にマッチします。[^0-9] と同等です。',
          en: 'Matches any character that is not a digit. Equivalent to [^0-9].',
        },
      },
      {
        pattern: '\\w',
        title: { ja: '単語文字 [a-zA-Z0-9_]', en: 'Word character [a-zA-Z0-9_]' },
        testText: 'hello_world 123!',
        flags: 'g',
        description: {
          ja: 'アルファベット・数字・アンダースコアにマッチします。',
          en: 'Matches any word character: letters, digits, and underscore.',
        },
      },
      {
        pattern: '\\W',
        title: { ja: '非単語文字', en: 'Non-word character' },
        testText: 'hello! world, 123.',
        flags: 'g',
        description: {
          ja: '\\w 以外の文字にマッチします（スペース・記号など）。',
          en: 'Matches any character that is not a word character (spaces, punctuation, etc.).',
        },
      },
      {
        pattern: '\\s',
        title: { ja: '空白文字', en: 'Whitespace character' },
        testText: 'hello world\ttab\nnewline',
        flags: 'g',
        description: {
          ja: 'スペース・タブ・改行など空白文字にマッチします。',
          en: 'Matches any whitespace character: space, tab, newline, etc.',
        },
      },
      {
        pattern: '\\S',
        title: { ja: '非空白文字', en: 'Non-whitespace character' },
        testText: 'hello world 123',
        flags: 'g',
        description: {
          ja: 'スペース以外の文字にマッチします。',
          en: 'Matches any non-whitespace character.',
        },
      },
      {
        pattern: '[aeiou]',
        title: { ja: 'カスタム文字クラス', en: 'Custom character class' },
        testText: 'The quick brown fox',
        flags: 'gi',
        description: {
          ja: '角括弧内の文字のいずれか 1 文字にマッチします。',
          en: 'Matches any single character listed inside the brackets.',
        },
      },
      {
        pattern: '[^aeiou\\s]',
        title: { ja: '否定文字クラス', en: 'Negated character class' },
        testText: 'The quick brown fox',
        flags: 'gi',
        description: {
          ja: '^（キャレット）を先頭に置くと「以外」になります。',
          en: 'A ^ at the start negates the class — matches any character NOT listed.',
        },
      },
      {
        pattern: '[a-z]',
        title: { ja: '範囲指定', en: 'Character range' },
        testText: 'Hello World 123',
        flags: 'g',
        description: {
          ja: 'ハイフンで範囲を指定できます（[a-z], [0-9], [A-Za-z] など）。',
          en: 'Use a hyphen to specify a range: [a-z], [0-9], [A-Za-z], etc.',
        },
      },
    ],
  },

  // ─── Quantifiers ─────────────────────────────────────────────────────
  {
    id: 'quantifiers',
    name: { ja: '量指定子', en: 'Quantifiers' },
    entries: [
      {
        pattern: 'ab*c',
        title: { ja: '* — 0 回以上', en: '* — Zero or more' },
        testText: 'ac abc abbc abbbc',
        flags: 'g',
        description: {
          ja: '直前の要素の 0 回以上の繰り返しにマッチします。',
          en: 'Matches zero or more repetitions of the preceding element.',
        },
      },
      {
        pattern: 'ab+c',
        title: { ja: '+ — 1 回以上', en: '+ — One or more' },
        testText: 'ac abc abbc abbbc',
        flags: 'g',
        description: {
          ja: '直前の要素の 1 回以上の繰り返しにマッチします（0 回はマッチしません）。',
          en: 'Matches one or more repetitions. Unlike *, it requires at least one.',
        },
      },
      {
        pattern: 'colou?r',
        title: { ja: '? — 0 回または 1 回（省略可能）', en: '? — Zero or one (optional)' },
        testText: 'color colour',
        flags: 'g',
        description: {
          ja: '直前の要素が 0 回または 1 回出現する場合にマッチします。',
          en: 'Makes the preceding element optional — matches if it appears 0 or 1 times.',
        },
      },
      {
        pattern: '\\d{4}',
        title: { ja: '{n} — ちょうど n 回', en: '{n} — Exactly n times' },
        testText: '2026-04-13 999 12345',
        flags: 'g',
        description: {
          ja: '直前の要素がちょうど n 回繰り返す部分にマッチします。',
          en: 'Matches exactly n repetitions of the preceding element.',
        },
      },
      {
        pattern: '\\d{2,4}',
        title: { ja: '{n,m} — n 〜 m 回', en: '{n,m} — Between n and m times' },
        testText: '1 12 123 1234 12345',
        flags: 'g',
        description: {
          ja: '直前の要素が n 〜 m 回繰り返す部分にマッチします（最長マッチ）。',
          en: 'Matches between n and m repetitions (greedy by default).',
        },
      },
      {
        pattern: '\\d{2,}',
        title: { ja: '{n,} — n 回以上', en: '{n,} — n or more times' },
        testText: '1 12 123 1234',
        flags: 'g',
        description: {
          ja: '直前の要素が n 回以上繰り返す部分にマッチします。',
          en: 'Matches n or more repetitions.',
        },
      },
      {
        pattern: '<.+?>',
        title: { ja: '遅延マッチ (lazy) +?', en: 'Lazy quantifier +?' },
        testText: '<a>hello</a><b>world</b>',
        flags: 'g',
        description: {
          ja: '? を付けると「できるだけ短く」マッチします（遅延マッチ / non-greedy）。',
          en: 'Adding ? makes the quantifier lazy — it matches as few characters as possible.',
        },
      },
      {
        pattern: '<.*>',
        title: { ja: '貪欲マッチ (greedy) .*', en: 'Greedy quantifier .*' },
        testText: '<a>hello</a><b>world</b>',
        flags: 'g',
        description: {
          ja: 'デフォルトは「貪欲（greedy）」。できるだけ長くマッチします。',
          en: 'By default quantifiers are greedy — they match as many characters as possible.',
        },
      },
    ],
  },

  // ─── Anchors ──────────────────────────────────────────────────────────
  {
    id: 'anchors',
    name: { ja: 'アンカー', en: 'Anchors' },
    entries: [
      {
        pattern: '^hello',
        title: { ja: '^ — 文字列の先頭', en: '^ — Start of string' },
        testText: 'hello world\nhello again',
        flags: 'g',
        description: {
          ja: '文字列（または m フラグ使用時は行）の先頭にマッチします。',
          en: 'Matches at the start of the string (or line in multiline mode).',
        },
      },
      {
        pattern: 'world$',
        title: { ja: '$ — 文字列の末尾', en: '$ — End of string' },
        testText: 'hello world\ngoodbye world',
        flags: 'g',
        description: {
          ja: '文字列（または m フラグ使用時は行）の末尾にマッチします。',
          en: 'Matches at the end of the string (or line in multiline mode).',
        },
      },
      {
        pattern: '^hello$',
        title: { ja: '^ と $ の組み合わせ', en: 'Combining ^ and $' },
        testText: 'hello\nhello world\njust hello',
        flags: 'gm',
        description: {
          ja: '^ と $ を組み合わせると、まるごと一行にマッチします。',
          en: 'Combining ^ and $ anchors the match to the entire line (with m flag).',
        },
      },
      {
        pattern: '\\bword\\b',
        title: { ja: '\\b — 単語境界', en: '\\b — Word boundary' },
        testText: 'word password swordfish a word here',
        flags: 'g',
        description: {
          ja: '単語の境界（\\w と \\W の間）にマッチします。文字は消費しません。',
          en: 'Matches at a boundary between a word character and a non-word character. Zero-width.',
        },
      },
      {
        pattern: '\\Bword\\B',
        title: { ja: '\\B — 非単語境界', en: '\\B — Non-word boundary' },
        testText: 'word password swordfish keyword',
        flags: 'g',
        description: {
          ja: '単語境界以外の位置にマッチします。単語の内部に現れるパターンを探します。',
          en: 'Matches at a position that is NOT a word boundary — inside a word.',
        },
      },
    ],
  },

  // ─── Groups ───────────────────────────────────────────────────────────
  {
    id: 'groups',
    name: { ja: 'グループ', en: 'Groups' },
    entries: [
      {
        pattern: '(foo)+',
        title: { ja: '(...) — キャプチャグループ', en: '(...) — Capture group' },
        testText: 'foo foofoofoo bar',
        flags: 'g',
        description: {
          ja: '括弧内にマッチした内容を後から参照できます。$1, $2, ... または match[1] でアクセス。',
          en: 'Parentheses create a capture group. The matched content is accessible as $1, $2, etc.',
        },
      },
      {
        pattern: '(?:foo)+',
        title: { ja: '(?:...) — 非キャプチャグループ', en: '(?:...) — Non-capturing group' },
        testText: 'foo foofoofoo bar',
        flags: 'g',
        description: {
          ja: '(?:) はグループとして量指定子を適用できますが、キャプチャはしません。',
          en: 'Groups without capturing. Useful when you want to apply a quantifier to a group.',
        },
      },
      {
        pattern: '(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})',
        title: { ja: '(?<name>...) — 名前付きキャプチャ', en: '(?<name>...) — Named capture group' },
        testText: '2026-04-13',
        flags: 'g',
        description: {
          ja: 'グループに名前を付けることで match.groups.name でアクセスできます。',
          en: 'Named groups are accessible via match.groups.year, .month, .day etc.',
        },
      },
      {
        pattern: '(\\d+) \\1',
        title: { ja: '\\1 — 後方参照', en: '\\1 — Backreference' },
        testText: '42 42 yes 99 100 no',
        flags: 'g',
        description: {
          ja: '\\1 は最初のキャプチャグループと同じ内容にマッチします。',
          en: 'Backreferences match the same text as previously captured by a group.',
        },
      },
    ],
  },

  // ─── Alternation ─────────────────────────────────────────────────────
  {
    id: 'alternation',
    name: { ja: '選択（OR）', en: 'Alternation' },
    entries: [
      {
        pattern: 'cat|dog|bird',
        title: { ja: '| — 選択（OR）', en: '| — Alternation (OR)' },
        testText: 'I have a cat, a dog, and a bird.',
        flags: 'g',
        description: {
          ja: '| で区切られたいずれかのパターンにマッチします。',
          en: 'Matches either the left or the right alternative.',
        },
      },
      {
        pattern: '(?:jpg|jpeg|png|gif|webp)',
        title: { ja: 'グループ内の選択', en: 'Alternation inside a group' },
        testText: 'photo.jpg image.png icon.gif file.pdf doc.webp',
        flags: 'gi',
        description: {
          ja: '非キャプチャグループと組み合わせることで選択のスコープを限定できます。',
          en: 'Wrap alternatives in a non-capturing group to limit the alternation scope.',
        },
      },
    ],
  },

  // ─── Lookaround ───────────────────────────────────────────────────────
  {
    id: 'lookaround',
    name: { ja: '先読み / 後読み', en: 'Lookaround' },
    entries: [
      {
        pattern: '\\d+(?= dollars)',
        title: { ja: '(?=...) — 肯定先読み', en: '(?=...) — Positive lookahead' },
        testText: '100 dollars 200 euros 50 dollars',
        flags: 'g',
        description: {
          ja: '後ろに指定パターンが続く位置にマッチしますが、そのパターン自体はマッチに含めません。',
          en: 'Matches if followed by the lookahead pattern, without including it in the match.',
        },
      },
      {
        pattern: '\\d+(?! dollars)',
        title: { ja: '(?!...) — 否定先読み', en: '(?!...) — Negative lookahead' },
        testText: '100 dollars 200 euros 50 dollars',
        flags: 'g',
        description: {
          ja: '後ろに指定パターンが続かない位置にマッチします。',
          en: 'Matches if NOT followed by the lookahead pattern.',
        },
      },
      {
        pattern: '(?<=\\$)\\d+',
        title: { ja: '(?<=...) — 肯定後読み', en: '(?<=...) — Positive lookbehind' },
        testText: '$100 €200 $50 ¥1000',
        flags: 'g',
        description: {
          ja: '前に指定パターンがある位置にマッチしますが、そのパターン自体はマッチに含めません。',
          en: 'Matches if preceded by the lookbehind pattern, without including it in the match.',
        },
      },
      {
        pattern: '(?<!\\$)\\d+',
        title: { ja: '(?<!...) — 否定後読み', en: '(?<!...) — Negative lookbehind' },
        testText: '$100 total: 200 count: 50',
        flags: 'g',
        description: {
          ja: '前に指定パターンが来ない位置にマッチします。',
          en: 'Matches if NOT preceded by the lookbehind pattern.',
        },
      },
    ],
  },

  // ─── Flags ────────────────────────────────────────────────────────────
  {
    id: 'flags',
    name: { ja: 'フラグ', en: 'Flags' },
    entries: [
      {
        pattern: 'hello',
        title: { ja: 'i — 大文字小文字を区別しない', en: 'i — Case-insensitive' },
        testText: 'Hello HELLO hello hElLo',
        flags: 'gi',
        description: {
          ja: 'i フラグ: 大文字小文字を区別せずマッチします。',
          en: 'i flag: Matches regardless of case.',
        },
      },
      {
        pattern: '^line',
        title: { ja: 'm — 複数行モード', en: 'm — Multiline mode' },
        testText: 'line one\nline two\nline three',
        flags: 'gm',
        description: {
          ja: 'm フラグ: ^ と $ が各行の先頭・末尾にマッチするようになります。',
          en: 'm flag: Makes ^ and $ match the start and end of each line.',
        },
      },
      {
        pattern: '.+',
        title: { ja: 's — ドットオール（改行にもマッチ）', en: 's — Dotall mode' },
        testText: 'line one\nline two\nend',
        flags: 'gs',
        description: {
          ja: 's フラグ: . が改行文字 \\n にもマッチするようになります。',
          en: 's flag: Makes . match newline characters too.',
        },
      },
      {
        pattern: '\\p{Script=Hiragana}+',
        title: { ja: 'u — Unicode モード', en: 'u — Unicode mode' },
        testText: 'こんにちは Hello 日本語',
        flags: 'gu',
        description: {
          ja: 'u フラグ: Unicode プロパティエスケープ (\\p{...}) が使えるようになります。',
          en: 'u flag: Enables Unicode property escapes like \\p{Script=Hiragana}.',
        },
      },
    ],
  },

  // ─── Special characters ───────────────────────────────────────────────
  {
    id: 'special',
    name: { ja: '特殊文字・エスケープ', en: 'Special Characters' },
    entries: [
      {
        pattern: '\\n',
        title: { ja: '\\n — 改行', en: '\\n — Newline' },
        testText: 'line1\nline2\nline3',
        flags: 'g',
        description: {
          ja: '改行文字 (LF) にマッチします。',
          en: 'Matches a newline (line feed) character.',
        },
      },
      {
        pattern: '\\t',
        title: { ja: '\\t — タブ', en: '\\t — Tab' },
        testText: 'col1\tcol2\tcol3',
        flags: 'g',
        description: {
          ja: 'タブ文字にマッチします。',
          en: 'Matches a tab character.',
        },
      },
      {
        pattern: '\\.',
        title: { ja: '\\. — リテラルドット', en: '\\. — Literal dot' },
        testText: 'file.txt log.md 3.14 ...',
        flags: 'g',
        description: {
          ja: '特殊文字をエスケープすることでリテラルとして扱います。\\.はドット自体にマッチ。',
          en: 'Escape special characters with \\ to match them literally. \\. matches a real dot.',
        },
      },
      {
        pattern: '\\u3042',
        title: { ja: '\\uXXXX — Unicode コードポイント', en: '\\uXXXX — Unicode code point' },
        testText: 'あいうえお abc',
        flags: 'g',
        description: {
          ja: '\\u に続く 16 進数 4 桁で Unicode 文字を指定します（\\u3042 = あ）。',
          en: 'Matches the Unicode character at the given code point (\\u3042 = あ).',
        },
      },
    ],
  },

  // ─── Common Patterns Quick reference ─────────────────────────────────
  {
    id: 'practical',
    name: { ja: 'よく使うパターン例', en: 'Practical Examples' },
    entries: [
      {
        pattern: '^[a-z_$][\\w$]*$',
        title: { ja: 'JS 変数名', en: 'JS identifier' },
        testText: 'myVar _private $jquery 123bad kebab-case',
        flags: 'i',
        description: {
          ja: 'JavaScript の変数名として有効かチェックします。',
          en: 'Validates a JavaScript identifier.',
        },
      },
      {
        pattern: '^#{1,6}\\s.+',
        title: { ja: 'Markdown 見出し', en: 'Markdown heading' },
        testText: '# H1\n## H2\n### H3\nnot a heading',
        flags: 'gm',
        description: {
          ja: 'Markdown の見出し行（# から ###### まで）を検出します。',
          en: 'Detects Markdown headings (H1–H6).',
        },
      },
      {
        pattern: '//.*$|/\\*[\\s\\S]*?\\*/',
        title: { ja: 'JS コメント', en: 'JS comment' },
        testText: '// line comment\ncode(); /* block\ncomment */ code();',
        flags: 'gm',
        description: {
          ja: '// 行コメントと /* */ ブロックコメントを検出します。',
          en: 'Detects // line comments and /* */ block comments.',
        },
      },
      {
        pattern: '(?:^|\\s)@[\\w]+',
        title: { ja: '@メンション', en: '@mention' },
        testText: 'Hello @user1! cc @admin and @support-team',
        flags: 'g',
        description: {
          ja: 'SNS などの @メンションを検出します。',
          en: 'Detects @mentions as used in social media.',
        },
      },
    ],
  },
];
