import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  {
    rules: {
      'implicit-arrow-linebreak': 'off',
      'function-paren-newline': 'off',
      'no-console': 'off',
      'testing-library/ender-result-naming-convention': 'off',
    },
  },
];
