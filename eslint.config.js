// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    files: ['src/game/**/*.js'],
    languageOptions: {
      globals: {
        THREE: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        performance: 'readonly',
        requestAnimationFrame: 'readonly',
        setTimeout: 'readonly',
        localStorage: 'readonly',
      },
    },
  },
  {
    ignores: ['dist/*', 'assets/*.js', 'assets/three.min.js', '**/*.min.js'],
  },
]);
