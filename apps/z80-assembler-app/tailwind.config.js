const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
    'node_modules/daisyui/dist/**/*.js', 
    'node_modules/react-daisyui/dist/**/*.js'
  ],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
};
