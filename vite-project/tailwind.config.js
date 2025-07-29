import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/** @type {import('tailwindcss').Config} */
export const content = [
  "./src/**/*.{js,jsx,ts,tsx}", // Catches all JS/JSX/TS/TSX files in src/ and its subdirectories
  "./public/index.html", // Catches your main HTML file
];
export const theme = {
  extend: {},
};
export const plugins = [];