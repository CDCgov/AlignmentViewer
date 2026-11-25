import js from '@eslint/js';

export default [
  { ignores: ['dist/', 'node_modules/'] },
  js.configs.recommended,
  {
    // index.js is a UMD browser script (AMD / CommonJS / global).
    files: ['index.js'],
    languageOptions: {
      sourceType: 'script',
      globals: {
        define: 'readonly',
        module: 'readonly',
        self: 'readonly',
        document: 'readonly',
      },
    },
  },
  {
    // Tests, benchmarks and tool config are ES modules run by Node/Vitest.
    files: ['**/*.mjs', 'index.test.js', 'alignment-viewer.bench.js', 'bench-helpers.js'],
    languageOptions: {
      sourceType: 'module',
      globals: {
        globalThis: 'readonly',
        URL: 'readonly',
        document: 'readonly',
      },
    },
  },
];
