module.exports = {
  // TypeScript and JavaScript files
  "**/*.{ts,tsx,js,jsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  // CSS, SCSS, and other style files
  "**/*.{css,scss}": [
    "prettier --write"
  ],
  // JSON, YAML, and Markdown files
  "**/*.{json,md,yaml,yml}": [
    "prettier --write"
  ]
}
