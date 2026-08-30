# Developing AEPCodes Themes

This document covers the maintainer workflow for previewing, generating, validating, packaging, and publishing the extension.

## Prerequisites

- Node.js 24
- npm
- Visual Studio Code

Install the local development dependencies:

```sh
npm install
```

`@vscode/vsce` is a local development dependency and does not need to be installed globally.

## Preview in an Extension Development Host

1. Open this directory in Visual Studio Code.
2. Press `F5` and choose **Preview AEPCodes Themes** if prompted.
3. In the Extension Development Host, run **Preferences: Color Theme**.
4. Select a Caltagirone Dusk, Etna & Travertine, or Conca d'Oro Light/Dark theme.

The extension host reads this theme-only project directly, so compiling is not required.

## Generate themes

The six files in `themes/` are generated from the checked-in palette source at `src/palettes.json` by `scripts/generate-themes.mjs`.

```sh
npm run generate
```

The generated extension is self-contained. Previewing and packaging do not depend on another project.

## Validate

```sh
npm run check:generated
npm run validate
npm run check
```

- `check:generated` fails if a generated theme is missing or stale.
- `validate` verifies the manifest, extension icon, identifiers, light/dark declarations, workbench coverage, TextMate and semantic-token coverage, terminal ANSI colors, contrast, formatting, licensing, and public branding.
- `check` runs the stale-generation and structural validation checks together.

Run `npm run check` before packaging or publishing.

## Package and install locally

```sh
npm run package
code --install-extension ./aepcodes-themes.vsix --force
```

The package command validates the project before creating `aepcodes-themes.vsix`.

## Publish

Publishing requires permission for the `aepcodes` Visual Studio Marketplace publisher and a suitable Personal Access Token.

```sh
npx vsce login aepcodes
npm run publish:marketplace
```

Before publishing:

1. Update the version in `package.json` and `package-lock.json`.
2. Update `CHANGELOG.md`.
3. Run `npm run check`.
4. Run `npm run package` and test the resulting VSIX.
5. Publish only after the packaged extension has been reviewed.

The publish command is never run automatically by validation or packaging.

## Project layout

```text
.
├── .vscode/launch.json
├── images/aepcodes-themes-icon.png
├── scripts/
│   ├── generate-themes.mjs
│   └── validate.mjs
├── src/
│   ├── branding/aepcodes-themes-icon.svg
│   └── palettes.json
├── themes/aepcodes-*-color-theme.json
├── CHANGELOG.md
├── DEVELOPMENT.md
├── LICENSE
├── README.md
└── package.json
```
