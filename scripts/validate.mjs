import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, extname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { generatedThemes } from "./generate-themes.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const THEMES_DIRECTORY = resolve(ROOT, "themes");
const errors = [];

const ICON_PATH = "images/aepcodes-themes-icon.png";
const ICON_SHA256 =
  "48448da2571dbcb4a8791435d2a35358817f663bbb533ea0620dfef7c5bf72ca";
const REPOSITORY_URL =
  "https://github.com/ynot3363/aepcodes-vs-code-themes.git";
const BUGS_URL =
  "https://github.com/ynot3363/aepcodes-vs-code-themes/issues";
const HOMEPAGE_URL =
  "https://github.com/ynot3363/aepcodes-vs-code-themes#readme";
const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

const EXPECTED_THEMES = [
  {
    label: "Caltagirone Dusk Light",
    uiTheme: "vs",
    path: "./themes/aepcodes-caltagirone-dusk-light-color-theme.json",
    slug: "caltagirone-dusk",
    appearance: "light",
  },
  {
    label: "Caltagirone Dusk Dark",
    uiTheme: "vs-dark",
    path: "./themes/aepcodes-caltagirone-dusk-dark-color-theme.json",
    slug: "caltagirone-dusk",
    appearance: "dark",
  },
  {
    label: "Etna & Travertine Light",
    uiTheme: "vs",
    path: "./themes/aepcodes-etna-travertine-light-color-theme.json",
    slug: "etna-travertine",
    appearance: "light",
  },
  {
    label: "Etna & Travertine Dark",
    uiTheme: "vs-dark",
    path: "./themes/aepcodes-etna-travertine-dark-color-theme.json",
    slug: "etna-travertine",
    appearance: "dark",
  },
  {
    label: "Conca d'Oro Light",
    uiTheme: "vs",
    path: "./themes/aepcodes-conca-doro-light-color-theme.json",
    slug: "conca-doro",
    appearance: "light",
  },
  {
    label: "Conca d'Oro Dark",
    uiTheme: "vs-dark",
    path: "./themes/aepcodes-conca-doro-dark-color-theme.json",
    slug: "conca-doro",
    appearance: "dark",
  },
];

const REQUIRED_WORKBENCH_COLORS = [
  "foreground",
  "disabledForeground",
  "descriptionForeground",
  "errorForeground",
  "icon.foreground",
  "focusBorder",
  "selection.background",
  "widget.border",
  "widget.shadow",
  "textPreformat.foreground",
  "textPreformat.background",
  "toolbar.hoverBackground",
  "button.background",
  "button.foreground",
  "button.hoverBackground",
  "button.secondaryBackground",
  "button.secondaryForeground",
  "checkbox.background",
  "checkbox.foreground",
  "checkbox.border",
  "dropdown.background",
  "dropdown.foreground",
  "dropdown.border",
  "input.background",
  "input.foreground",
  "input.border",
  "input.placeholderForeground",
  "inputValidation.infoBackground",
  "inputValidation.infoForeground",
  "inputValidation.infoBorder",
  "inputValidation.warningBackground",
  "inputValidation.warningForeground",
  "inputValidation.warningBorder",
  "inputValidation.errorBackground",
  "inputValidation.errorForeground",
  "inputValidation.errorBorder",
  "scrollbarSlider.background",
  "scrollbarSlider.hoverBackground",
  "scrollbarSlider.activeBackground",
  "list.activeSelectionBackground",
  "list.activeSelectionForeground",
  "list.inactiveSelectionBackground",
  "list.hoverBackground",
  "list.focusBackground",
  "list.focusOutline",
  "list.filterMatchBackground",
  "list.filterMatchBorder",
  "tree.indentGuidesStroke",
  "activityBar.background",
  "activityBar.foreground",
  "activityBar.inactiveForeground",
  "activityBar.activeBorder",
  "activityBar.activeBackground",
  "activityBar.activeFocusBorder",
  "activityBarTop.background",
  "activityBarTop.foreground",
  "activityBarTop.inactiveForeground",
  "activityBarTop.activeBackground",
  "activityBarTop.activeBorder",
  "activityBarTop.dropBorder",
  "activityBarBadge.background",
  "activityBarBadge.foreground",
  "sideBar.background",
  "sideBar.foreground",
  "sideBar.border",
  "sideBarActivityBarTop.border",
  "sideBarSectionHeader.background",
  "sideBarSectionHeader.foreground",
  "titleBar.activeBackground",
  "titleBar.activeForeground",
  "titleBar.inactiveBackground",
  "titleBar.inactiveForeground",
  "statusBar.background",
  "statusBar.foreground",
  "statusBar.debuggingBackground",
  "statusBar.debuggingForeground",
  "statusBarItem.hoverBackground",
  "statusBarItem.remoteBackground",
  "statusBarItem.remoteForeground",
  "panel.background",
  "panel.border",
  "panelTitle.activeForeground",
  "panelTitle.activeBorder",
  "editorGroup.border",
  "editorGroupHeader.tabsBackground",
  "tab.activeBackground",
  "tab.activeForeground",
  "tab.inactiveBackground",
  "tab.inactiveForeground",
  "tab.activeBorderTop",
  "menu.background",
  "menu.foreground",
  "menu.selectionBackground",
  "menu.selectionForeground",
  "editor.background",
  "editor.foreground",
  "editorCursor.foreground",
  "editorLineNumber.foreground",
  "editorLineNumber.activeForeground",
  "editor.selectionBackground",
  "editor.inactiveSelectionBackground",
  "editor.selectionHighlightBackground",
  "editor.wordHighlightBackground",
  "editor.wordHighlightStrongBackground",
  "editor.findMatchBackground",
  "editor.findMatchHighlightBackground",
  "editor.findRangeHighlightBackground",
  "editor.lineHighlightBackground",
  "editorWhitespace.foreground",
  "editorIndentGuide.background1",
  "editorIndentGuide.activeBackground1",
  "editor.foldBackground",
  "editorBracketMatch.background",
  "editorBracketMatch.border",
  "editorBracketHighlight.foreground1",
  "editorBracketPairGuide.background1",
  "editorBracketPairGuide.activeBackground1",
  "editorGutter.addedBackground",
  "editorGutter.modifiedBackground",
  "editorGutter.deletedBackground",
  "editorError.foreground",
  "editorWarning.foreground",
  "editorInfo.foreground",
  "editorHint.foreground",
  "editorOverviewRuler.findMatchForeground",
  "minimap.findMatchHighlight",
  "minimap.selectionHighlight",
  "minimapSlider.background",
  "editorWidget.background",
  "editorWidget.foreground",
  "editorWidget.border",
  "editorSuggestWidget.background",
  "editorSuggestWidget.foreground",
  "editorSuggestWidget.selectedBackground",
  "editorHoverWidget.background",
  "editorHoverWidget.foreground",
  "editorHoverWidget.border",
  "peekView.border",
  "peekViewEditor.background",
  "peekViewEditor.matchHighlightBackground",
  "peekViewResult.background",
  "peekViewResult.selectionBackground",
  "peekViewTitle.background",
  "peekViewTitleLabel.foreground",
  "peekViewTitleDescription.foreground",
  "diffEditor.insertedTextBackground",
  "diffEditor.removedTextBackground",
  "diffEditor.insertedLineBackground",
  "diffEditor.removedLineBackground",
  "diffEditor.move.border",
  "diffEditor.moveActive.border",
  "breadcrumb.background",
  "breadcrumb.foreground",
  "breadcrumb.focusForeground",
  "notificationCenterHeader.background",
  "notifications.background",
  "notifications.foreground",
  "notifications.border",
  "notificationsErrorIcon.foreground",
  "notificationsWarningIcon.foreground",
  "notificationsInfoIcon.foreground",
  "quickInput.background",
  "quickInput.foreground",
  "quickInputList.focusBackground",
  "quickInputList.focusForeground",
  "settings.headerForeground",
  "settings.modifiedItemIndicator",
  "settings.dropdownBackground",
  "settings.dropdownForeground",
  "settings.textInputBackground",
  "settings.textInputForeground",
  "welcomePage.progress.background",
  "welcomePage.progress.foreground",
  "debugToolBar.background",
  "debugExceptionWidget.background",
  "debugExceptionWidget.border",
  "debugConsole.errorForeground",
  "debugIcon.breakpointForeground",
  "testing.message.error.badgeBackground",
  "testing.message.error.badgeBorder",
  "testing.message.error.badgeForeground",
  "testing.message.error.lineBackground",
  "terminal.background",
  "terminal.foreground",
  "terminal.selectionBackground",
  "terminalCursor.foreground",
  "terminal.findMatchBackground",
  "terminal.findMatchHighlightBackground",
  "gitDecoration.addedResourceForeground",
  "gitDecoration.modifiedResourceForeground",
  "gitDecoration.deletedResourceForeground",
  "gitDecoration.untrackedResourceForeground",
  "gitDecoration.ignoredResourceForeground",
  "gitDecoration.conflictingResourceForeground",
];

const REQUIRED_SEMANTIC_SELECTORS = [
  "type",
  "class",
  "interface",
  "parameter",
  "property",
  "variable",
  "function",
  "method",
  "keyword",
  "string",
  "number",
  "comment",
  "decorator",
  "*.readonly",
  "*.deprecated",
];

const REQUIRED_TOKEN_RULES = [
  "Comments",
  "Keywords and storage",
  "Strings",
  "Numbers",
  "Functions and methods",
  "Types classes interfaces and namespaces",
  "JSON property names",
  "HTML tags",
  "CSS selectors",
  "Markdown headings",
  "PowerShell functions",
  "Shell functions and commands",
  "Hugo template functions",
];

const ANSI_NAMES = [
  "Black",
  "Red",
  "Green",
  "Yellow",
  "Blue",
  "Magenta",
  "Cyan",
  "White",
];

const HEX_COLOR = /^#[0-9a-f]{6}(?:[0-9a-f]{2})?$/;
const AGPL_LICENSE_SHA256 =
  "0d96a4ff68ad6d4b6f1f30f713b18d5184912ba8dd389f86aa7710db079abcb0";

function fail(message) {
  errors.push(message);
}

async function parseJson(relativePath, canonical = true) {
  const absolutePath = resolve(ROOT, relativePath);
  let contents;

  try {
    contents = await readFile(absolutePath, "utf8");
  } catch (error) {
    fail(`${relativePath}: cannot read file (${error.message})`);
    return undefined;
  }

  let value;
  try {
    value = JSON.parse(contents);
  } catch (error) {
    fail(`${relativePath}: invalid JSON (${error.message})`);
    return undefined;
  }

  if (canonical && contents !== `${JSON.stringify(value, null, 2)}\n`) {
    fail(`${relativePath}: JSON is not consistently formatted`);
  }

  return value;
}

function relativePath(absolutePath) {
  return relative(ROOT, absolutePath).split(sep).join("/");
}

function linearChannel(value) {
  const channel = value / 255;
  return channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
}

function opaqueRgb(color) {
  return [1, 3, 5].map((index) => Number.parseInt(color.slice(index, index + 2), 16));
}

function composite(color, background) {
  if (color.length === 7) {
    return color;
  }

  const foregroundRgb = opaqueRgb(color);
  const backgroundRgb = opaqueRgb(background);
  const opacity = Number.parseInt(color.slice(7, 9), 16) / 255;
  const channels = foregroundRgb.map((channel, index) =>
    Math.round(channel * opacity + backgroundRgb[index] * (1 - opacity)),
  );
  return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function luminance(color) {
  const [red, green, blue] = opaqueRgb(color).map(linearChannel);
  return red * 0.2126 + green * 0.7152 + blue * 0.0722;
}

function contrast(foreground, background) {
  const foregroundLuminance = luminance(composite(foreground, background));
  const backgroundLuminance = luminance(background);
  const light = Math.max(foregroundLuminance, backgroundLuminance);
  const dark = Math.min(foregroundLuminance, backgroundLuminance);
  return (light + 0.05) / (dark + 0.05);
}

function checkContrast(label, foreground, background, minimum) {
  const ratio = contrast(foreground, background);
  if (ratio < minimum) {
    fail(`${label}: contrast ${ratio.toFixed(2)}:1 is below ${minimum}:1`);
  }
}

function tokenRule(theme, name) {
  return theme.tokenColors.find((rule) => rule.name === name);
}

function checkTheme(theme, expected, palettes) {
  const label = expected.label;
  const palette = palettes.themes[expected.slug][expected.appearance].colors;
  const status = palettes.status[expected.appearance];
  const git = palettes.git[expected.appearance];
  const dark = expected.appearance === "dark";
  const selected = dark ? palette.action : palette.navy;
  const onSelected = dark ? palette.onAction : palette.onNavy;
  const listActiveBackground = dark ? selected : palette.wash;
  const listActiveForeground = dark ? onSelected : palette.navy;
  const listInactiveBackground = dark
    ? `${selected}2e`
    : palette.raised;
  const listInactiveForeground = dark ? palette.text : palette.navy;
  const listFocusBackground = dark ? `${selected}3d` : palette.wash;
  const listInactiveFocusBackground = dark ? `${selected}1f` : palette.raised;
  const listFocusAndSelectionOutline = dark
    ? palette.onAction
    : palette.focus;
  const activityActiveBackground = dark ? palette.wash : palette.onNavy;
  const activityActiveForeground = dark ? palette.onNavy : palette.navy;

  if (theme.$schema !== "vscode://schemas/color-theme") {
    fail(`${label}: missing the VS Code color-theme schema`);
  }
  if (theme.name !== label) {
    fail(`${label}: generated theme name does not match its manifest label`);
  }
  if (theme.type !== expected.appearance) {
    fail(`${label}: expected type ${expected.appearance}`);
  }
  if (theme.semanticHighlighting !== true) {
    fail(`${label}: semanticHighlighting must be true`);
  }
  if ("include" in theme) {
    fail(`${label}: generated themes must be self-contained`);
  }
  if (!theme.colors || Object.keys(theme.colors).length < 500) {
    fail(`${label}: workbench coverage is unexpectedly incomplete`);
  }

  for (const key of REQUIRED_WORKBENCH_COLORS) {
    if (!(key in theme.colors)) {
      fail(`${label}: missing workbench color ${key}`);
    }
  }

  if ("testing.message.error.decorationForeground" in theme.colors) {
    fail(`${label}: obsolete testing error decoration color is present`);
  }

  for (const [key, color] of Object.entries(theme.colors)) {
    if (typeof color !== "string" || !HEX_COLOR.test(color)) {
      fail(`${label}: ${key} is not a lowercase six- or eight-digit hex color`);
    }
  }

  const expectedWorkbenchMappings = {
    "editor.background": palette.surface,
    "editor.foreground": palette.text,
    "sideBar.background": palette.canvas,
    "titleBar.activeBackground": palette.navy,
    "titleBar.activeForeground": palette.onNavy,
    "button.background": palette.action,
    "button.foreground": palette.onAction,
    "textLink.foreground": palette.link,
    "list.activeSelectionBackground": listActiveBackground,
    "list.activeSelectionForeground": listActiveForeground,
    "list.activeSelectionIconForeground": listActiveForeground,
    "list.inactiveSelectionBackground": listInactiveBackground,
    "list.inactiveSelectionForeground": listInactiveForeground,
    "list.inactiveSelectionIconForeground": listInactiveForeground,
    "list.focusBackground": listFocusBackground,
    "list.focusForeground": listInactiveForeground,
    "list.inactiveFocusBackground": listInactiveFocusBackground,
    "list.focusAndSelectionOutline": listFocusAndSelectionOutline,
    "activityBar.background": palette.navy,
    "activityBar.foreground": activityActiveForeground,
    "activityBar.activeBackground": activityActiveBackground,
    "activityBarTop.background": palette.navy,
    "activityBarTop.foreground": activityActiveForeground,
    "activityBarTop.activeBackground": activityActiveBackground,
    "gitDecoration.addedResourceForeground": git.added,
    "gitDecoration.modifiedResourceForeground": git.modified,
    "gitDecoration.deletedResourceForeground": git.deleted,
    "gitDecoration.renamedResourceForeground": git.renamed,
    "gitDecoration.untrackedResourceForeground": git.added,
    "gitDecoration.stageModifiedResourceForeground": git.modified,
    "gitDecoration.stageDeletedResourceForeground": git.deleted,
  };
  for (const [key, color] of Object.entries(expectedWorkbenchMappings)) {
    if (theme.colors[key] !== color) {
      fail(`${label}: ${key} does not use its source palette role`);
    }
  }

  const allowedBases = new Set([
    ...Object.values(palette),
    ...Object.values(status).flatMap((entry) => Object.values(entry)),
    ...Object.values(git),
    "#02070a",
    "#080e12",
  ]);
  for (const [key, color] of Object.entries(theme.colors)) {
    if (HEX_COLOR.test(color) && !allowedBases.has(color.slice(0, 7))) {
      fail(`${label}: ${key} uses a color outside the checked-in palette`);
    }
  }

  if (!Array.isArray(theme.tokenColors) || theme.tokenColors.length < 40) {
    fail(`${label}: TextMate coverage is unexpectedly incomplete`);
  }
  for (const ruleName of REQUIRED_TOKEN_RULES) {
    if (!tokenRule(theme, ruleName)) {
      fail(`${label}: missing TextMate rule ${ruleName}`);
    }
  }

  const commentRule = tokenRule(theme, "Comments");
  if (
    commentRule?.settings.foreground !== palette.muted ||
    commentRule?.settings.fontStyle !== "italic"
  ) {
    fail(`${label}: comments must use muted italic styling`);
  }

  const sourceRoleRules = {
    "Keywords and storage": palette.link,
    "Strings": palette.blueInk,
    "Functions and methods": palette.purple,
    "Types classes interfaces and namespaces": palette.blueInk,
    "User constants": palette.brassInk,
  };
  for (const [ruleName, color] of Object.entries(sourceRoleRules)) {
    if (tokenRule(theme, ruleName)?.settings.foreground !== color) {
      fail(`${label}: ${ruleName} does not use its source syntax role`);
    }
  }

  const allScopes = theme.tokenColors.flatMap((rule) =>
    Array.isArray(rule.scope) ? rule.scope : [rule.scope],
  );
  const languageMarkers = [
    ".js",
    ".ts",
    ".json",
    ".html",
    ".css",
    ".markdown",
    ".powershell",
    ".shell",
    ".hugo",
    ".gotemplate",
  ];
  for (const marker of languageMarkers) {
    if (!allScopes.some((scope) => scope?.includes(marker))) {
      fail(`${label}: no TextMate scopes found for ${marker}`);
    }
  }

  if (!theme.semanticTokenColors) {
    fail(`${label}: semanticTokenColors is missing`);
  } else {
    for (const selector of REQUIRED_SEMANTIC_SELECTORS) {
      if (!(selector in theme.semanticTokenColors)) {
        fail(`${label}: missing semantic selector ${selector}`);
      }
    }

    const semanticComment = theme.semanticTokenColors.comment;
    if (
      semanticComment?.foreground !== palette.muted ||
      semanticComment?.italic !== true
    ) {
      fail(`${label}: semantic comments must use muted italic styling`);
    }
    if (theme.semanticTokenColors["*.readonly"] !== palette.brassInk) {
      fail(`${label}: readonly semantic values must use the constant color`);
    }
    if (theme.semanticTokenColors["*.deprecated"]?.strikethrough !== true) {
      fail(`${label}: deprecated semantic symbols must be struck through`);
    }
    if (
      theme.semanticTokenColors["*.deprecated"]?.foreground !==
      status.danger.text
    ) {
      fail(`${label}: deprecated semantic symbols must use readable danger text`);
    }

    for (const [selector, style] of Object.entries(theme.semanticTokenColors)) {
      const foreground = typeof style === "string" ? style : style.foreground;
      if (foreground && !/^#[0-9a-f]{6}$/.test(foreground)) {
        fail(`${label}: semantic selector ${selector} must use an opaque color`);
      }
    }
  }

  for (const name of ANSI_NAMES) {
    const regular = `terminal.ansi${name}`;
    const bright = `terminal.ansiBright${name}`;
    if (!(regular in theme.colors) || !(bright in theme.colors)) {
      fail(`${label}: missing terminal ANSI pair for ${name}`);
      continue;
    }
    if (theme.colors[regular] === theme.colors[bright]) {
      fail(`${label}: terminal ANSI ${name} and Bright${name} are identical`);
    }
    checkContrast(
      `${label}: ${regular}`,
      theme.colors[regular],
      theme.colors["terminal.background"],
      4.5,
    );
    checkContrast(
      `${label}: ${bright}`,
      theme.colors[bright],
      theme.colors["terminal.background"],
      4.5,
    );
  }

  const regularAnsi = ANSI_NAMES.map((name) => theme.colors[`terminal.ansi${name}`]);
  const brightAnsi = ANSI_NAMES.map(
    (name) => theme.colors[`terminal.ansiBright${name}`],
  );
  if (new Set(regularAnsi).size !== regularAnsi.length) {
    fail(`${label}: regular terminal ANSI colors are not all distinguishable`);
  }
  if (new Set(brightAnsi).size !== brightAnsi.length) {
    fail(`${label}: bright terminal ANSI colors are not all distinguishable`);
  }
  if (new Set([...regularAnsi, ...brightAnsi]).size !== 16) {
    fail(`${label}: all 16 terminal ANSI colors must be distinct`);
  }

  const contrastPairs = [
    ["editor text", palette.text, palette.surface],
    ["editor comments", palette.muted, palette.surface],
    [
      "input placeholders",
      theme.colors["input.placeholderForeground"],
      theme.colors["input.background"],
    ],
    ["syntax links", palette.link, palette.surface],
    ["syntax blue ink", palette.blueInk, palette.surface],
    ["syntax brass ink", palette.brassInk, palette.surface],
    ["syntax functions", palette.purple, palette.surface],
    [
      "preformatted text",
      theme.colors["textPreformat.foreground"],
      theme.colors["textPreformat.background"],
    ],
    [
      "unchanged diff text",
      theme.colors["diffEditor.unchangedRegionForeground"],
      theme.colors["diffEditor.unchangedRegionBackground"],
    ],
    ["title bar", palette.onNavy, palette.navy],
    [
      "selected activity bar item",
      theme.colors["activityBar.foreground"],
      theme.colors["activityBar.activeBackground"],
    ],
    [
      "selected activity bar item with workbench foreground fallback",
      theme.colors.foreground,
      theme.colors["activityBar.activeBackground"],
    ],
    [
      "selected top activity bar item",
      theme.colors["activityBarTop.foreground"],
      theme.colors["activityBarTop.activeBackground"],
    ],
    ["buttons", palette.onAction, palette.action],
    [
      "selected lists",
      theme.colors["list.activeSelectionForeground"],
      theme.colors["list.activeSelectionBackground"],
    ],
    [
      "inactive selected lists",
      theme.colors["list.inactiveSelectionForeground"],
      composite(
        theme.colors["list.inactiveSelectionBackground"],
        theme.colors["sideBar.background"],
      ),
    ],
    [
      "selected-list focus outline",
      theme.colors["list.focusAndSelectionOutline"],
      theme.colors["list.activeSelectionBackground"],
    ],
    ["diagnostic info", status.info.text, status.info.background],
    ["diagnostic warning", status.warning.text, status.warning.background],
    ["diagnostic danger", status.danger.text, status.danger.background],
    ["diagnostic success", status.success.text, status.success.background],
  ];
  for (const [pairName, foreground, background] of contrastPairs) {
    checkContrast(`${label}: ${pairName}`, foreground, background, 4.5);
  }
  const gitColors = [git.added, git.modified, git.deleted, git.renamed];
  if (new Set(gitColors).size !== gitColors.length) {
    fail(`${label}: core Git decoration colors must be distinct`);
  }
  const inactiveExplorerSelection = composite(
    theme.colors["list.inactiveSelectionBackground"],
    theme.colors["sideBar.background"],
  );
  const activeExplorerSelection = composite(
    theme.colors["list.activeSelectionBackground"],
    theme.colors["sideBar.background"],
  );
  for (const [state, color] of Object.entries(git)) {
    checkContrast(
      `${label}: Git ${state} decoration on Explorer`,
      color,
      theme.colors["sideBar.background"],
      4.5,
    );
    if (!dark) {
      checkContrast(
        `${label}: Git ${state} decoration on active Explorer selection`,
        color,
        activeExplorerSelection,
        4.5,
      );
    }
    checkContrast(
      `${label}: Git ${state} decoration on inactive Explorer selection`,
      color,
      inactiveExplorerSelection,
      4.5,
    );
  }
  checkContrast(
    `${label}: welcome progress indicator`,
    theme.colors["welcomePage.progress.foreground"],
    theme.colors["welcomePage.progress.background"],
    3,
  );
  checkContrast(
    `${label}: inactive-list focus outline`,
    theme.colors["list.inactiveFocusOutline"],
    palette.canvas,
    3,
  );
}

async function collectProjectFiles(directory = ROOT) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if ([".git", "node_modules"].includes(entry.name)) {
      continue;
    }

    const absolutePath = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectProjectFiles(absolutePath)));
    } else if (!entry.name.endsWith(".vsix") && entry.name !== ".DS_Store") {
      files.push(absolutePath);
    }
  }

  return files;
}

async function checkBranding() {
  const forbiddenBrand = ["a", "a", "a", "s"].join("");
  const forbiddenPattern = new RegExp(forbiddenBrand, "i");
  const textExtensions = new Set(["", ".json", ".md", ".mjs", ".txt"]);

  for (const absolutePath of await collectProjectFiles()) {
    const projectPath = relativePath(absolutePath);
    if (forbiddenPattern.test(projectPath)) {
      fail(`${projectPath}: filename contains forbidden public branding`);
    }
    if (!textExtensions.has(extname(absolutePath))) {
      continue;
    }

    const contents = await readFile(absolutePath, "utf8");
    if (forbiddenPattern.test(contents)) {
      fail(`${projectPath}: contains forbidden public branding`);
    }
  }
}

async function checkJavaScriptFormatting() {
  for (const filename of [
    "scripts/generate-themes.mjs",
    "scripts/validate.mjs",
  ]) {
    const contents = await readFile(resolve(ROOT, filename), "utf8");
    if (!contents.endsWith("\n")) {
      fail(`${filename}: must end with a newline`);
    }
    if (contents.includes("\t") || contents.includes("\r")) {
      fail(`${filename}: use spaces and LF line endings`);
    }
    if (/ +$/m.test(contents)) {
      fail(`${filename}: contains trailing whitespace`);
    }
  }
}

async function run() {
  if (Number.parseInt(process.versions.node.split(".")[0], 10) !== 24) {
    fail(`Development scripts require Node.js 24; found ${process.version}`);
  }

  const manifest = await parseJson("package.json");
  const palettes = await parseJson("src/palettes.json");
  const launch = await parseJson(".vscode/launch.json");

  if (!manifest || !palettes || !launch) {
    throw new Error("Required project JSON could not be parsed");
  }

  if (manifest.name !== "aepcodes-themes") {
    fail("package.json: name must be aepcodes-themes");
  }
  if (manifest.displayName !== "AEPCodes Themes") {
    fail("package.json: displayName must be AEPCodes Themes");
  }
  if (manifest.publisher !== "aepcodes") {
    fail("package.json: publisher must be aepcodes");
  }
  if (manifest.license !== "AGPL-3.0-only") {
    fail("package.json: license must be AGPL-3.0-only");
  }
  if (manifest.icon !== ICON_PATH) {
    fail(`package.json: icon must be ${ICON_PATH}`);
  }
  if (
    manifest.repository?.type !== "git" ||
    manifest.repository.url !== REPOSITORY_URL
  ) {
    fail(`package.json: repository must point to ${REPOSITORY_URL}`);
  }
  if (manifest.bugs?.url !== BUGS_URL) {
    fail(`package.json: bugs must point to ${BUGS_URL}`);
  }
  if (manifest.homepage !== HOMEPAGE_URL) {
    fail(`package.json: homepage must point to ${HOMEPAGE_URL}`);
  }
  if (`${manifest.publisher}.${manifest.name}` !== "aepcodes.aepcodes-themes") {
    fail("package.json: Marketplace identifier must be aepcodes.aepcodes-themes");
  }
  if (manifest.engines?.node !== "24.x") {
    fail("package.json: engines.node must require Node.js 24");
  }
  for (const runtimeField of ["main", "browser", "activationEvents", "dependencies"]) {
    if (runtimeField in manifest) {
      fail(`package.json: theme-only extension must omit ${runtimeField}`);
    }
  }

  const contributions = manifest.contributes?.themes;
  if (!Array.isArray(contributions) || contributions.length !== 6) {
    fail("package.json: exactly six themes must be contributed");
  } else {
    const actual = contributions.map(({ label, uiTheme, path }) => ({
      label,
      uiTheme,
      path,
    }));
    const expected = EXPECTED_THEMES.map(({ label, uiTheme, path }) => ({
      label,
      uiTheme,
      path,
    }));
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      fail("package.json: theme labels, paths, order, or uiTheme values are incorrect");
    }
    if (new Set(contributions.map((theme) => theme.path)).size !== 6) {
      fail("package.json: contributed theme paths must be unique");
    }
  }

  if (palettes.primitiveOrder?.length !== 23) {
    fail("src/palettes.json: expected exactly 23 primitive names");
  }
  const gitKeys = ["added", "modified", "deleted", "renamed"];
  for (const appearance of ["light", "dark"]) {
    const git = palettes.git?.[appearance];
    if (
      !git ||
      JSON.stringify(Object.keys(git)) !== JSON.stringify(gitKeys)
    ) {
      fail(`src/palettes.json: ${appearance} Git colors are missing or unordered`);
      continue;
    }
    for (const [state, color] of Object.entries(git)) {
      if (!/^#[0-9a-f]{6}$/.test(color)) {
        fail(`src/palettes.json: ${appearance} Git ${state} color is invalid`);
      }
    }
  }
  for (const [slug, definition] of Object.entries(palettes.themes ?? {})) {
    for (const appearance of ["light", "dark"]) {
      const colors = definition[appearance]?.colors;
      if (!colors || Object.keys(colors).length !== 23) {
        fail(`src/palettes.json: ${slug} ${appearance} must define 23 colors`);
        continue;
      }
      if (
        JSON.stringify(Object.keys(colors)) !==
        JSON.stringify(palettes.primitiveOrder)
      ) {
        fail(`src/palettes.json: ${slug} ${appearance} primitive order is wrong`);
      }
      for (const [name, color] of Object.entries(colors)) {
        if (!/^#[0-9a-f]{6}$/.test(color)) {
          fail(`src/palettes.json: ${slug} ${appearance} ${name} is invalid`);
        }
      }
    }
  }

  if (
    launch.configurations?.[0]?.type !== "extensionHost" ||
    !launch.configurations[0].args?.includes(
      "--extensionDevelopmentPath=${workspaceFolder}",
    )
  ) {
    fail(".vscode/launch.json: F5 must launch the Extension Development Host");
  }

  const licenseContents = await readFile(resolve(ROOT, "LICENSE"), "utf8");
  const licenseHash = createHash("sha256").update(licenseContents).digest("hex");
  if (licenseHash !== AGPL_LICENSE_SHA256) {
    fail("LICENSE: expected the canonical GNU Affero GPL v3 text");
  }

  try {
    const iconPath = resolve(ROOT, ICON_PATH);
    const iconStats = await stat(iconPath);
    const icon = await readFile(iconPath);

    if (!iconStats.isFile()) {
      fail(`${ICON_PATH}: extension icon is not a file`);
    } else if (
      icon.length < 26 ||
      !icon.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE) ||
      icon.subarray(12, 16).toString("ascii") !== "IHDR"
    ) {
      fail(`${ICON_PATH}: extension icon must be a valid PNG`);
    } else {
      const width = icon.readUInt32BE(16);
      const height = icon.readUInt32BE(20);
      const colorType = icon[25];
      if (width !== 256 || height !== 256) {
        fail(`${ICON_PATH}: extension icon must be 256 by 256 pixels`);
      }
      if (colorType !== 6) {
        fail(`${ICON_PATH}: extension icon must use RGBA transparency`);
      }
    }

    const iconHash = createHash("sha256").update(icon).digest("hex");
    if (iconHash !== ICON_SHA256) {
      fail(`${ICON_PATH}: expected the AEPCodes Themes palette artwork`);
    }
  } catch (error) {
    fail(`${ICON_PATH}: cannot read extension icon (${error.message})`);
  }

  const generated = await generatedThemes();
  let themeFiles = [];
  try {
    themeFiles = (await readdir(THEMES_DIRECTORY))
      .filter((filename) => filename.endsWith(".json"))
      .sort();
  } catch (error) {
    fail(`themes: cannot read directory (${error.message})`);
  }

  const expectedFilenames = [...generated.keys()].sort();
  if (JSON.stringify(themeFiles) !== JSON.stringify(expectedFilenames)) {
    fail("themes: directory must contain exactly the six generated JSON files");
  }

  for (const expected of EXPECTED_THEMES) {
    const absolutePath = resolve(ROOT, expected.path);
    if (!absolutePath.startsWith(`${ROOT}${sep}`)) {
      fail(`${expected.path}: theme path escapes the project`);
      continue;
    }

    try {
      const fileStats = await stat(absolutePath);
      if (!fileStats.isFile()) {
        fail(`${expected.path}: declared theme path is not a file`);
        continue;
      }
    } catch (error) {
      fail(`${expected.path}: declared theme path does not exist (${error.message})`);
      continue;
    }

    const projectPath = relativePath(absolutePath);
    const theme = await parseJson(projectPath);
    if (!theme) {
      continue;
    }

    const expectedContents = generated.get(projectPath.replace("themes/", ""));
    const actualContents = await readFile(absolutePath, "utf8");
    if (actualContents !== expectedContents) {
      fail(`${projectPath}: generated theme is stale`);
    }
    checkTheme(theme, expected, palettes);
  }

  const vscodeIgnore = await readFile(resolve(ROOT, ".vscodeignore"), "utf8");
  for (const ignored of [".vscode/**", "scripts/**", "src/**", "node_modules/**"]) {
    if (!vscodeIgnore.split("\n").includes(ignored)) {
      fail(`.vscodeignore: must exclude ${ignored}`);
    }
  }

  await checkBranding();
  await checkJavaScriptFormatting();

  if (errors.length > 0) {
    console.error(`Validation failed with ${errors.length} error(s):`);
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(
    "Validated 6 themes, 23 source primitives per appearance, manifest identity, icon artwork, UI coverage, syntax coverage, contrast, formatting, and branding.",
  );
}

await run();
