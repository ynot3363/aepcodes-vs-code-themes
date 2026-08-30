# AEPCodes Themes

Six warm, tactile color themes for Visual Studio Code, inspired by Sicilian ceramics, stone, volcanic landscapes, citrus, and aged metal.

## Themes

| Palette           | Light                                                                 | Dark                                                       |
| ----------------- | --------------------------------------------------------------------- | ---------------------------------------------------------- |
| Caltagirone Dusk  | Ceramic navy, weathered blue, brass, wine pink, and warm limestone    | Deep navy and mineral blue with softened brass and rose    |
| Etna & Travertine | Travertine, ash, smoky navy, aged brass, and dusty rose               | Volcanic charcoal with mineral blue and warm metal accents |
| Conca d'Oro       | Warm limestone, earthy citrus, terracotta, brass, and structural navy | Deep navy-charcoal balanced by matte orange and gold       |

Light variants stay warm rather than stark white. Dark variants are deep and readable without using pure black.

## Install

In Visual Studio Code, open **Extensions**, search for **AEPCodes Themes**, and install the extension published by `aepcodes`.

You can also install it by identifier:

```sh
code --install-extension aepcodes.aepcodes-themes
```

For a downloaded package, run **Extensions: Install from VSIX...** and select `aepcodes-themes.vsix`.

## Choose a theme

1. Open the Command Palette.
2. Run **Preferences: Color Theme**.
3. Choose one of these themes:

- Caltagirone Dusk Light
- Caltagirone Dusk Dark
- Etna & Travertine Light
- Etna & Travertine Dark
- Conca d'Oro Light
- Conca d'Oro Dark

You can also set a theme directly in your VS Code settings:

```json
{
  "workbench.colorTheme": "Caltagirone Dusk Dark"
}
```

## What is themed

Each theme covers the editor and complete workbench, including tabs, sidebars, panels, menus, inputs, notifications, settings, the debugger, Git decorations, diffs, diagnostics, peek views, breadcrumbs, and the integrated terminal.

Syntax and semantic highlighting cover common language constructs across JavaScript, TypeScript, JSON, HTML, CSS, Markdown, PowerShell, shell scripts, and Hugo templates. Comments use restrained italics; other syntax styling remains minimally opinionated.

Terminal ANSI colors are distinct and coordinated with each palette. Selection, focus, status, and diagnostic colors are designed to remain readable without introducing neon accents.

## Privacy and compatibility

AEPCodes Themes is a theme-only extension. It has no activation code, runtime JavaScript, telemetry, or network access. It supports untrusted and virtual workspaces.

## Development

Maintainer instructions for previewing, generation, validation, packaging, and publishing are in [DEVELOPMENT.md](./DEVELOPMENT.md).

## Support

- [Source repository](https://github.com/ynot3363/aepcodes-vs-code-themes)
- [Report a bug](https://github.com/ynot3363/aepcodes-vs-code-themes/issues)

## License

GNU Affero General Public License v3.0 only (`AGPL-3.0-only`) © 2026 AEPCodes. See the included `LICENSE` file.
