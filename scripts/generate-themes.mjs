import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PALETTE_PATH = resolve(ROOT, "src/palettes.json");
const THEMES_DIRECTORY = resolve(ROOT, "themes");
const CHECK_MODE = process.argv.includes("--check");

function alpha(color, opacity) {
  if (!/^#[0-9a-f]{6}$/i.test(color)) {
    throw new Error(`Cannot add opacity to invalid color: ${color}`);
  }

  const channel = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, "0");
  return `${color}${channel}`.toLowerCase();
}

function workbenchColors(palette, status, git, appearance) {
  const dark = appearance === "dark";
  const selected = dark ? palette.action : palette.navy;
  const onSelected = dark ? palette.onAction : palette.onNavy;
  const listActiveBackground = dark ? selected : palette.wash;
  const listActiveForeground = dark ? onSelected : palette.navy;
  const listInactiveBackground = dark
    ? alpha(selected, 0.18)
    : palette.raised;
  const listInactiveForeground = dark ? palette.text : palette.navy;
  const listFocusBackground = dark ? alpha(selected, 0.24) : palette.wash;
  const activityActiveBackground = dark ? palette.wash : palette.onNavy;
  const activityActiveForeground = dark ? palette.onNavy : palette.navy;
  const success = dark ? status.success.border : status.success.text;
  const warning = dark ? status.warning.border : status.warning.text;
  const danger = status.danger.text;
  const info = dark ? status.info.border : status.info.text;
  const shadow = dark ? "#02070ab8" : "#080e1294";
  const transparent = alpha(palette.navy, 0);
  const commentBackground = dark ? palette.raised : palette.action;
  const commentForeground = dark ? palette.action : palette.onAction;

  const colors = {
    "foreground": palette.text,
    "disabledForeground": alpha(palette.muted, 0.72),
    "descriptionForeground": palette.muted,
    "errorForeground": status.danger.text,
    "icon.foreground": palette.muted,
    "focusBorder": palette.focus,
    "selection.background": alpha(palette.action, 0.3),
    "sash.hoverBorder": palette.focus,
    "window.activeBorder": palette.borderStrong,
    "window.inactiveBorder": palette.border,
    "widget.border": palette.borderStrong,
    "widget.shadow": shadow,

    "textBlockQuote.background": palette.wash,
    "textBlockQuote.border": palette.brassInk,
    "textCodeBlock.background": palette.raised,
    "textLink.foreground": palette.link,
    "textLink.activeForeground": palette.linkHover,
    "textPreformat.foreground": palette.blueInk,
    "textPreformat.background": palette.surface,
    "textSeparator.foreground": palette.borderStrong,

    "toolbar.hoverBackground": alpha(palette.action, 0.18),
    "toolbar.hoverOutline": palette.focus,
    "toolbar.activeBackground": alpha(palette.action, 0.3),
    "button.background": palette.action,
    "button.foreground": palette.onAction,
    "button.border": palette.action,
    "button.hoverBackground": palette.actionHover,
    "button.secondaryBackground": palette.raised,
    "button.secondaryForeground": palette.text,
    "button.secondaryBorder": palette.muted,
    "button.secondaryHoverBackground": palette.wash,
    "checkbox.background": palette.surface,
    "checkbox.foreground": palette.text,
    "checkbox.border": palette.muted,
    "dropdown.background": palette.surface,
    "dropdown.foreground": palette.text,
    "dropdown.border": palette.muted,
    "dropdown.listBackground": palette.surface,
    "input.background": palette.surface,
    "input.foreground": palette.text,
    "input.border": palette.muted,
    "input.placeholderForeground": palette.muted,
    "inputOption.activeBackground": alpha(selected, 0.2),
    "inputOption.activeForeground": palette.text,
    "inputOption.activeBorder": palette.focus,
    "inputOption.hoverBackground": alpha(selected, 0.12),
    "inputValidation.infoBackground": status.info.background,
    "inputValidation.infoForeground": status.info.text,
    "inputValidation.infoBorder": status.info.border,
    "inputValidation.warningBackground": status.warning.background,
    "inputValidation.warningForeground": status.warning.text,
    "inputValidation.warningBorder": status.warning.border,
    "inputValidation.errorBackground": status.danger.background,
    "inputValidation.errorForeground": status.danger.text,
    "inputValidation.errorBorder": status.danger.border,

    "scrollbar.shadow": shadow,
    "scrollbarSlider.background": alpha(palette.muted, 0.38),
    "scrollbarSlider.hoverBackground": alpha(palette.muted, 0.56),
    "scrollbarSlider.activeBackground": alpha(palette.muted, 0.72),
    "badge.background": selected,
    "badge.foreground": onSelected,
    "progressBar.background": palette.action,

    "list.activeSelectionBackground": listActiveBackground,
    "list.activeSelectionForeground": listActiveForeground,
    "list.activeSelectionIconForeground": listActiveForeground,
    "list.inactiveSelectionBackground": listInactiveBackground,
    "list.inactiveSelectionForeground": listInactiveForeground,
    "list.inactiveSelectionIconForeground": listInactiveForeground,
    "list.focusBackground": listFocusBackground,
    "list.focusForeground": listInactiveForeground,
    "list.focusHighlightForeground": palette.linkHover,
    "list.focusOutline": palette.focus,
    "list.inactiveFocusBackground": dark
      ? alpha(selected, 0.12)
      : palette.raised,
    "list.inactiveFocusOutline": palette.focus,
    "list.focusAndSelectionOutline": dark
      ? palette.onAction
      : palette.focus,
    "list.hoverBackground": alpha(palette.raised, 0.72),
    "list.hoverForeground": palette.text,
    "list.highlightForeground": palette.link,
    "list.filterMatchBackground": alpha(palette.action, 0.24),
    "list.filterMatchBorder": palette.brassInk,
    "list.dropBackground": alpha(selected, 0.22),
    "list.errorForeground": status.danger.text,
    "list.warningForeground": status.warning.text,
    "list.invalidItemForeground": status.danger.text,
    "list.deemphasizedForeground": palette.muted,
    "tree.indentGuidesStroke": alpha(palette.borderStrong, 0.75),
    "tree.inactiveIndentGuidesStroke": alpha(palette.border, 0.7),
    "tree.tableColumnsBorder": palette.border,
    "tree.tableOddRowsBackground": alpha(palette.raised, 0.32),

    "activityBar.background": palette.navy,
    "activityBar.foreground": activityActiveForeground,
    "activityBar.inactiveForeground": alpha(palette.onNavy, 0.66),
    "activityBar.border": palette.focusInverse,
    "activityBar.activeBorder": palette.focusInverse,
    "activityBar.activeBackground": activityActiveBackground,
    "activityBar.activeFocusBorder": activityActiveForeground,
    "activityBar.dropBorder": palette.focusInverse,
    "activityBarTop.background": palette.navy,
    "activityBarTop.foreground": activityActiveForeground,
    "activityBarTop.inactiveForeground": alpha(palette.onNavy, 0.66),
    "activityBarTop.activeBackground": activityActiveBackground,
    "activityBarTop.activeBorder": palette.focusInverse,
    "activityBarTop.dropBorder": palette.focusInverse,
    "activityBarBadge.background": palette.action,
    "activityBarBadge.foreground": palette.onAction,
    "activityWarningBadge.background": status.warning.background,
    "activityWarningBadge.foreground": status.warning.text,
    "activityErrorBadge.background": status.danger.background,
    "activityErrorBadge.foreground": status.danger.text,

    "sideBar.background": palette.canvas,
    "sideBar.foreground": palette.text,
    "sideBar.border": palette.border,
    "sideBar.dropBackground": alpha(selected, 0.2),
    "sideBarTitle.background": palette.canvas,
    "sideBarTitle.foreground": palette.text,
    "sideBarTitle.border": palette.border,
    "sideBarActivityBarTop.border": palette.border,
    "sideBarSectionHeader.background": palette.wash,
    "sideBarSectionHeader.foreground": palette.text,
    "sideBarSectionHeader.border": palette.border,
    "sideBarStickyScroll.background": palette.canvas,
    "sideBarStickyScroll.border": palette.border,
    "sideBarStickyScroll.shadow": shadow,

    "titleBar.activeBackground": palette.navy,
    "titleBar.activeForeground": palette.onNavy,
    "titleBar.inactiveBackground": palette.navy,
    "titleBar.inactiveForeground": alpha(palette.onNavy, 0.68),
    "titleBar.border": palette.focusInverse,
    "menubar.selectionBackground": alpha(palette.onNavy, 0.16),
    "menubar.selectionForeground": palette.onNavy,
    "menubar.selectionBorder": palette.focusInverse,
    "menu.background": palette.surface,
    "menu.foreground": palette.text,
    "menu.selectionBackground": alpha(selected, 0.2),
    "menu.selectionForeground": palette.text,
    "menu.selectionBorder": palette.focus,
    "menu.separatorBackground": palette.border,
    "menu.border": palette.borderStrong,
    "commandCenter.background": alpha(palette.onNavy, 0.1),
    "commandCenter.foreground": palette.onNavy,
    "commandCenter.border": alpha(palette.onNavy, 0.4),
    "commandCenter.activeBackground": alpha(palette.onNavy, 0.2),
    "commandCenter.activeForeground": palette.onNavy,
    "commandCenter.activeBorder": palette.focusInverse,
    "commandCenter.inactiveForeground": alpha(palette.onNavy, 0.64),
    "commandCenter.inactiveBorder": alpha(palette.onNavy, 0.26),

    "editorGroup.border": palette.border,
    "editorGroup.dropBackground": alpha(selected, 0.2),
    "editorGroup.emptyBackground": palette.canvas,
    "editorGroup.focusedEmptyBorder": palette.focus,
    "editorGroupHeader.tabsBackground": palette.canvas,
    "editorGroupHeader.tabsBorder": palette.border,
    "editorGroupHeader.noTabsBackground": palette.canvas,
    "editorGroupHeader.border": palette.border,
    "tab.activeBackground": palette.surface,
    "tab.activeForeground": palette.text,
    "tab.activeBorder": palette.surface,
    "tab.activeBorderTop": palette.focus,
    "tab.inactiveBackground": palette.canvas,
    "tab.inactiveForeground": palette.muted,
    "tab.unfocusedActiveBackground": palette.surface,
    "tab.unfocusedActiveForeground": palette.muted,
    "tab.unfocusedActiveBorder": palette.surface,
    "tab.unfocusedActiveBorderTop": alpha(palette.focus, 0.5),
    "tab.unfocusedInactiveBackground": palette.canvas,
    "tab.unfocusedInactiveForeground": alpha(palette.muted, 0.7),
    "tab.hoverBackground": palette.raised,
    "tab.hoverForeground": palette.text,
    "tab.unfocusedHoverBackground": alpha(palette.raised, 0.72),
    "tab.unfocusedHoverForeground": palette.text,
    "tab.border": palette.border,
    "tab.lastPinnedBorder": palette.borderStrong,
    "tab.activeModifiedBorder": palette.brassInk,
    "tab.inactiveModifiedBorder": alpha(palette.brassInk, 0.7),
    "tab.unfocusedActiveModifiedBorder": alpha(palette.brassInk, 0.58),
    "tab.unfocusedInactiveModifiedBorder": alpha(palette.brassInk, 0.45),
    "tab.dragAndDropBorder": palette.focus,

    "editor.background": palette.surface,
    "editor.foreground": palette.text,
    "editorLineNumber.foreground": alpha(palette.muted, 0.82),
    "editorLineNumber.activeForeground": palette.text,
    "editorLineNumber.dimmedForeground": alpha(palette.muted, 0.58),
    "editorCursor.foreground": palette.focus,
    "editorCursor.background": palette.surface,
    "editorMultiCursor.primary.foreground": palette.focus,
    "editorMultiCursor.primary.background": palette.surface,
    "editorMultiCursor.secondary.foreground": palette.brassInk,
    "editorMultiCursor.secondary.background": palette.surface,
    "editor.selectionBackground": alpha(palette.action, 0.3),
    "editor.selectionForeground": palette.text,
    "editor.inactiveSelectionBackground": alpha(palette.action, 0.18),
    "editor.selectionHighlightBackground": alpha(palette.blue, 0.18),
    "editor.selectionHighlightBorder": alpha(palette.blueInk, 0.72),
    "editor.wordHighlightBackground": alpha(palette.brass, 0.18),
    "editor.wordHighlightBorder": alpha(palette.brassInk, 0.68),
    "editor.wordHighlightStrongBackground": alpha(palette.link, 0.18),
    "editor.wordHighlightStrongBorder": alpha(palette.link, 0.68),
    "editor.wordHighlightTextBackground": alpha(palette.blue, 0.18),
    "editor.wordHighlightTextBorder": alpha(palette.blueInk, 0.68),
    "editor.findMatchBackground": alpha(palette.link, 0.26),
    "editor.findMatchForeground": palette.text,
    "editor.findMatchBorder": palette.link,
    "editor.findMatchHighlightBackground": alpha(palette.action, 0.2),
    "editor.findMatchHighlightForeground": palette.text,
    "editor.findMatchHighlightBorder": alpha(palette.brassInk, 0.76),
    "editor.findRangeHighlightBackground": alpha(palette.blue, 0.18),
    "editor.findRangeHighlightBorder": alpha(palette.blueInk, 0.68),
    "editor.hoverHighlightBackground": alpha(palette.blue, 0.18),
    "editor.lineHighlightBackground": alpha(palette.raised, 0.52),
    "editor.lineHighlightBorder": alpha(palette.borderStrong, 0.48),
    "editor.rangeHighlightBackground": alpha(palette.action, 0.12),
    "editor.rangeHighlightBorder": alpha(palette.focus, 0.5),
    "editor.symbolHighlightBackground": alpha(palette.blue, 0.18),
    "editor.symbolHighlightBorder": alpha(palette.blueInk, 0.68),
    "editorLink.activeForeground": palette.linkHover,
    "editorWhitespace.foreground": alpha(palette.muted, 0.42),
    "editorIndentGuide.background1": alpha(palette.borderStrong, 0.42),
    "editorIndentGuide.activeBackground1": palette.borderStrong,
    "editorRuler.foreground": alpha(palette.borderStrong, 0.45),
    "editor.foldBackground": alpha(palette.blue, 0.16),
    "editor.foldPlaceholderForeground": palette.muted,
    "editor.linkedEditingBackground": alpha(palette.action, 0.16),
    "editor.snippetTabstopHighlightBackground": alpha(palette.action, 0.2),
    "editor.snippetTabstopHighlightBorder": palette.brassInk,
    "editor.snippetFinalTabstopHighlightBackground": alpha(
      palette.blue,
      0.18,
    ),
    "editor.snippetFinalTabstopHighlightBorder": palette.blueInk,
    "editor.stackFrameHighlightBackground": alpha(status.warning.background, 0.7),
    "editor.focusedStackFrameHighlightBackground": alpha(
      status.success.background,
      0.7,
    ),
    "editor.inlineValuesBackground": alpha(palette.raised, 0.7),
    "editor.inlineValuesForeground": palette.muted,
    "editorCodeLens.foreground": palette.muted,
    "editorLightBulb.foreground": palette.brassInk,
    "editorLightBulbAutoFix.foreground": palette.blueInk,
    "editorInlayHint.background": alpha(palette.raised, 0.68),
    "editorInlayHint.foreground": palette.muted,
    "editorInlayHint.typeBackground": alpha(palette.blue, 0.16),
    "editorInlayHint.typeForeground": palette.blueInk,
    "editorInlayHint.parameterBackground": alpha(palette.brass, 0.14),
    "editorInlayHint.parameterForeground": palette.brassInk,
    "editorGhostText.background": transparent,
    "editorGhostText.foreground": alpha(palette.muted, 0.7),
    "editorGhostText.border": alpha(palette.borderStrong, 0.45),
    "editorStickyScroll.background": palette.surface,
    "editorStickyScrollHover.background": palette.raised,
    "editorStickyScroll.border": palette.border,
    "editorStickyScroll.shadow": shadow,

    "editorBracketMatch.background": alpha(palette.focus, 0.16),
    "editorBracketMatch.border": palette.focus,
    "editorBracketHighlight.unexpectedBracket.foreground": danger,
    "editorBracketPairGuide.background1": alpha(palette.link, 0.36),
    "editorBracketPairGuide.background2": alpha(palette.blueInk, 0.36),
    "editorBracketPairGuide.background3": alpha(palette.brassInk, 0.36),
    "editorBracketPairGuide.background4": alpha(palette.purple, 0.36),
    "editorBracketPairGuide.background5": alpha(palette.text, 0.28),
    "editorBracketPairGuide.background6": alpha(palette.linkHover, 0.36),
    "editorBracketPairGuide.activeBackground1": palette.link,
    "editorBracketPairGuide.activeBackground2": palette.blueInk,
    "editorBracketPairGuide.activeBackground3": palette.brassInk,
    "editorBracketPairGuide.activeBackground4": palette.purple,
    "editorBracketPairGuide.activeBackground5": palette.text,
    "editorBracketPairGuide.activeBackground6": palette.linkHover,

    "editorGutter.background": palette.surface,
    "editorGutter.foldingControlForeground": palette.muted,
    "editorGutter.commentRangeForeground": commentBackground,
    "editorGutter.commentGlyphForeground": commentForeground,
    "editorGutter.commentUnresolvedGlyphForeground": commentForeground,
    "editorGutter.commentDraftGlyphForeground": commentForeground,
    "editorGutter.addedBackground": success,
    "editorGutter.modifiedBackground": info,
    "editorGutter.deletedBackground": danger,

    "editorError.foreground": status.danger.border,
    "editorError.background": alpha(status.danger.background, 0.22),
    "editorError.border": status.danger.border,
    "editorWarning.foreground": status.warning.border,
    "editorWarning.background": alpha(status.warning.background, 0.22),
    "editorWarning.border": status.warning.border,
    "editorInfo.foreground": status.info.border,
    "editorInfo.background": alpha(status.info.background, 0.22),
    "editorInfo.border": status.info.border,
    "editorHint.foreground": palette.blueInk,
    "editorHint.border": palette.blueInk,
    "editorUnnecessaryCode.opacity": alpha(palette.muted, 0.62),
    "editorUnnecessaryCode.border": alpha(palette.muted, 0.42),
    "problemsErrorIcon.foreground": status.danger.border,
    "problemsWarningIcon.foreground": status.warning.border,
    "problemsInfoIcon.foreground": status.info.border,

    "editorOverviewRuler.background": palette.surface,
    "editorOverviewRuler.border": palette.border,
    "editorOverviewRuler.findMatchForeground": alpha(palette.link, 0.8),
    "editorOverviewRuler.rangeHighlightForeground": alpha(
      palette.blueInk,
      0.7,
    ),
    "editorOverviewRuler.selectionHighlightForeground": alpha(
      palette.action,
      0.72,
    ),
    "editorOverviewRuler.wordHighlightForeground": alpha(
      palette.brassInk,
      0.72,
    ),
    "editorOverviewRuler.wordHighlightStrongForeground": alpha(
      palette.link,
      0.76,
    ),
    "editorOverviewRuler.modifiedForeground": info,
    "editorOverviewRuler.addedForeground": success,
    "editorOverviewRuler.deletedForeground": danger,
    "editorOverviewRuler.errorForeground": status.danger.border,
    "editorOverviewRuler.warningForeground": status.warning.border,
    "editorOverviewRuler.infoForeground": status.info.border,
    "editorOverviewRuler.bracketMatchForeground": palette.focus,

    "minimap.background": palette.surface,
    "minimap.foregroundOpacity": alpha(palette.text, 0.72),
    "minimap.findMatchHighlight": alpha(palette.link, 0.82),
    "minimap.selectionHighlight": alpha(palette.action, 0.7),
    "minimap.selectionOccurrenceHighlight": alpha(palette.blueInk, 0.7),
    "minimap.errorHighlight": status.danger.border,
    "minimap.warningHighlight": status.warning.border,
    "minimapSlider.background": alpha(palette.muted, 0.24),
    "minimapSlider.hoverBackground": alpha(palette.muted, 0.38),
    "minimapSlider.activeBackground": alpha(palette.muted, 0.54),

    "editorWidget.background": palette.canvas,
    "editorWidget.foreground": palette.text,
    "editorWidget.border": palette.borderStrong,
    "editorWidget.resizeBorder": palette.focus,
    "editorSuggestWidget.background": palette.surface,
    "editorSuggestWidget.foreground": palette.text,
    "editorSuggestWidget.border": palette.borderStrong,
    "editorSuggestWidget.highlightForeground": palette.link,
    "editorSuggestWidget.selectedBackground": alpha(selected, 0.22),
    "editorSuggestWidget.selectedForeground": palette.text,
    "editorSuggestWidget.selectedIconForeground": palette.text,
    "editorSuggestWidget.focusHighlightForeground": palette.linkHover,
    "editorSuggestWidgetStatus.foreground": palette.muted,
    "editorHoverWidget.background": palette.surface,
    "editorHoverWidget.foreground": palette.text,
    "editorHoverWidget.border": palette.borderStrong,
    "editorHoverWidget.highlightForeground": palette.link,
    "editorHoverWidget.statusBarBackground": palette.raised,
    "debugExceptionWidget.background": status.danger.background,
    "debugExceptionWidget.border": status.danger.border,

    "editorMarkerNavigation.background": palette.canvas,
    "editorMarkerNavigationError.background": status.danger.background,
    "editorMarkerNavigationError.headerBackground": alpha(
      status.danger.background,
      0.72,
    ),
    "editorMarkerNavigationWarning.background": status.warning.background,
    "editorMarkerNavigationWarning.headerBackground": alpha(
      status.warning.background,
      0.72,
    ),
    "editorMarkerNavigationInfo.background": status.info.background,
    "editorMarkerNavigationInfo.headerBackground": alpha(
      status.info.background,
      0.72,
    ),

    "peekView.border": palette.focus,
    "peekViewEditor.background": palette.surface,
    "peekViewEditorGutter.background": palette.surface,
    "peekViewEditor.matchHighlightBackground": alpha(palette.action, 0.26),
    "peekViewEditor.matchHighlightBorder": palette.brassInk,
    "peekViewResult.background": palette.canvas,
    "peekViewResult.fileForeground": palette.text,
    "peekViewResult.lineForeground": palette.muted,
    "peekViewResult.matchHighlightBackground": alpha(palette.action, 0.24),
    "peekViewResult.selectionBackground": selected,
    "peekViewResult.selectionForeground": onSelected,
    "peekViewTitle.background": palette.raised,
    "peekViewTitleLabel.foreground": palette.text,
    "peekViewTitleDescription.foreground": palette.muted,

    "diffEditor.border": palette.borderStrong,
    "diffEditor.insertedLineBackground": alpha(status.success.background, 0.46),
    "diffEditor.removedLineBackground": alpha(status.danger.background, 0.46),
    "diffEditor.insertedTextBackground": alpha(status.success.background, 0.7),
    "diffEditor.removedTextBackground": alpha(status.danger.background, 0.7),
    "diffEditor.insertedTextBorder": status.success.border,
    "diffEditor.removedTextBorder": status.danger.border,
    "diffEditor.diagonalFill": alpha(palette.borderStrong, 0.5),
    "diffEditor.unchangedCodeBackground": palette.canvas,
    "diffEditor.unchangedRegionBackground": palette.raised,
    "diffEditor.unchangedRegionForeground": palette.text,
    "diffEditor.unchangedRegionShadow": shadow,
    "diffEditor.move.border": palette.blueInk,
    "diffEditor.moveActive.border": palette.focus,
    "diffEditorGutter.insertedLineBackground": alpha(
      status.success.background,
      0.7,
    ),
    "diffEditorGutter.removedLineBackground": alpha(
      status.danger.background,
      0.7,
    ),
    "diffEditorOverview.insertedForeground": status.success.border,
    "diffEditorOverview.removedForeground": status.danger.border,
    "merge.currentHeaderBackground": alpha(status.info.background, 0.7),
    "merge.currentContentBackground": alpha(status.info.background, 0.42),
    "merge.incomingHeaderBackground": alpha(status.success.background, 0.7),
    "merge.incomingContentBackground": alpha(status.success.background, 0.42),
    "merge.commonHeaderBackground": alpha(palette.raised, 0.7),
    "merge.commonContentBackground": alpha(palette.raised, 0.42),
    "merge.border": palette.borderStrong,

    "breadcrumb.background": palette.surface,
    "breadcrumb.foreground": palette.muted,
    "breadcrumb.focusForeground": palette.text,
    "breadcrumb.activeSelectionForeground": palette.link,
    "breadcrumbPicker.background": palette.canvas,

    "panel.background": palette.canvas,
    "panel.border": palette.borderStrong,
    "panel.dropBorder": palette.focus,
    "panelInput.border": palette.muted,
    "panelTitle.activeForeground": palette.text,
    "panelTitle.inactiveForeground": palette.muted,
    "panelTitle.activeBorder": palette.focus,
    "panelTitleBadge.background": selected,
    "panelTitleBadge.foreground": onSelected,
    "panelSection.border": palette.border,
    "panelSection.dropBackground": alpha(selected, 0.2),
    "panelSectionHeader.background": palette.wash,
    "panelSectionHeader.foreground": palette.text,
    "panelSectionHeader.border": palette.border,
    "panelStickyScroll.background": palette.canvas,
    "panelStickyScroll.border": palette.border,
    "panelStickyScroll.shadow": shadow,

    "statusBar.background": palette.navy,
    "statusBar.foreground": palette.onNavy,
    "statusBar.border": palette.focusInverse,
    "statusBar.focusBorder": palette.onNavy,
    "statusBar.noFolderBackground": palette.navy,
    "statusBar.noFolderForeground": palette.onNavy,
    "statusBar.debuggingBackground": palette.action,
    "statusBar.debuggingForeground": palette.onAction,
    "statusBarItem.activeBackground": alpha(palette.onNavy, 0.24),
    "statusBarItem.hoverBackground": alpha(palette.onNavy, 0.16),
    "statusBarItem.hoverForeground": palette.onNavy,
    "statusBarItem.focusBorder": palette.focusInverse,
    "statusBarItem.prominentBackground": palette.action,
    "statusBarItem.prominentForeground": palette.onAction,
    "statusBarItem.prominentHoverBackground": palette.actionHover,
    "statusBarItem.prominentHoverForeground": palette.onAction,
    "statusBarItem.remoteBackground": palette.action,
    "statusBarItem.remoteForeground": palette.onAction,
    "statusBarItem.remoteHoverBackground": palette.actionHover,
    "statusBarItem.remoteHoverForeground": palette.onAction,
    "statusBarItem.errorBackground": status.danger.background,
    "statusBarItem.errorForeground": status.danger.text,
    "statusBarItem.errorHoverBackground": status.danger.text,
    "statusBarItem.errorHoverForeground": status.danger.background,
    "statusBarItem.warningBackground": status.warning.background,
    "statusBarItem.warningForeground": status.warning.text,
    "statusBarItem.warningHoverBackground": status.warning.text,
    "statusBarItem.warningHoverForeground": status.warning.background,

    "notificationCenter.border": palette.borderStrong,
    "notificationCenterHeader.background": palette.raised,
    "notificationCenterHeader.foreground": palette.text,
    "notificationToast.border": palette.borderStrong,
    "notifications.background": palette.surface,
    "notifications.foreground": palette.text,
    "notifications.border": palette.borderStrong,
    "notificationLink.foreground": palette.link,
    "notificationsErrorIcon.foreground": status.danger.border,
    "notificationsWarningIcon.foreground": status.warning.border,
    "notificationsInfoIcon.foreground": status.info.border,

    "banner.background": palette.wash,
    "banner.foreground": palette.text,
    "banner.iconForeground": palette.blueInk,
    "pickerGroup.border": palette.border,
    "pickerGroup.foreground": palette.link,
    "quickInput.background": palette.surface,
    "quickInput.foreground": palette.text,
    "quickInputTitle.background": palette.raised,
    "quickInputList.focusBackground": selected,
    "quickInputList.focusForeground": onSelected,
    "quickInputList.focusIconForeground": onSelected,
    "quickInputList.focusHighlightForeground": dark
      ? palette.onAction
      : palette.focusInverse,
    "keybindingLabel.background": palette.raised,
    "keybindingLabel.foreground": palette.text,
    "keybindingLabel.border": palette.borderStrong,
    "keybindingLabel.bottomBorder": palette.muted,
    "keybindingTable.headerBackground": palette.wash,
    "keybindingTable.rowsBackground": alpha(palette.raised, 0.4),

    "settings.headerForeground": palette.text,
    "settings.headerBorder": palette.border,
    "settings.modifiedItemIndicator": palette.brassInk,
    "settings.rowHoverBackground": alpha(palette.raised, 0.58),
    "settings.focusedRowBackground": alpha(selected, 0.14),
    "settings.focusedRowBorder": palette.focus,
    "settings.sashBorder": palette.borderStrong,
    "settings.dropdownBackground": palette.surface,
    "settings.dropdownForeground": palette.text,
    "settings.dropdownBorder": palette.muted,
    "settings.dropdownListBorder": palette.borderStrong,
    "settings.checkboxBackground": palette.surface,
    "settings.checkboxForeground": palette.text,
    "settings.checkboxBorder": palette.muted,
    "settings.textInputBackground": palette.surface,
    "settings.textInputForeground": palette.text,
    "settings.textInputBorder": palette.muted,
    "settings.numberInputBackground": palette.surface,
    "settings.numberInputForeground": palette.text,
    "settings.numberInputBorder": palette.muted,

    "welcomePage.background": palette.canvas,
    "welcomePage.tileBackground": palette.surface,
    "welcomePage.tileHoverBackground": palette.raised,
    "welcomePage.tileBorder": palette.border,
    "welcomePage.progress.background": palette.raised,
    "welcomePage.progress.foreground": palette.focus,
    "walkThrough.embeddedEditorBackground": palette.surface,
    "extensionButton.prominentBackground": palette.action,
    "extensionButton.prominentForeground": palette.onAction,
    "extensionButton.prominentHoverBackground": palette.actionHover,
    "extensionBadge.remoteBackground": selected,
    "extensionBadge.remoteForeground": onSelected,

    "debugToolBar.background": palette.canvas,
    "debugToolBar.border": palette.borderStrong,
    "debugView.exceptionLabelBackground": status.danger.background,
    "debugView.exceptionLabelForeground": status.danger.text,
    "debugView.stateLabelBackground": status.info.background,
    "debugView.stateLabelForeground": status.info.text,
    "debugView.valueChangedHighlight": alpha(palette.action, 0.3),
    "debugConsole.infoForeground": status.info.text,
    "debugConsole.warningForeground": status.warning.text,
    "debugConsole.errorForeground": status.danger.text,
    "debugConsole.sourceForeground": palette.blueInk,
    "debugConsoleInputIcon.foreground": palette.link,
    "debugIcon.breakpointForeground": status.danger.border,
    "debugIcon.breakpointDisabledForeground": palette.muted,
    "debugIcon.breakpointUnverifiedForeground": status.warning.border,
    "debugIcon.breakpointCurrentStackframeForeground": status.warning.text,
    "debugIcon.breakpointStackframeForeground": status.info.border,
    "debugIcon.startForeground": success,
    "debugIcon.pauseForeground": warning,
    "debugIcon.stopForeground": danger,
    "debugIcon.disconnectForeground": danger,
    "debugIcon.restartForeground": success,
    "debugIcon.stepOverForeground": info,
    "debugIcon.stepIntoForeground": info,
    "debugIcon.stepOutForeground": info,
    "debugIcon.continueForeground": success,
    "debugIcon.stepBackForeground": info,
    "debugTokenExpression.name": palette.text,
    "debugTokenExpression.value": palette.blueInk,
    "debugTokenExpression.string": palette.blueInk,
    "debugTokenExpression.boolean": palette.link,
    "debugTokenExpression.number": palette.link,
    "debugTokenExpression.error": status.danger.text,

    "terminal.background": palette.surface,
    "terminal.foreground": palette.text,
    "terminal.border": palette.borderStrong,
    "terminal.selectionBackground": alpha(palette.action, 0.3),
    "terminal.selectionForeground": palette.text,
    "terminal.inactiveSelectionBackground": alpha(palette.action, 0.18),
    "terminal.findMatchBackground": alpha(palette.link, 0.26),
    "terminal.findMatchBorder": palette.link,
    "terminal.findMatchHighlightBackground": alpha(palette.action, 0.2),
    "terminal.findMatchHighlightBorder": palette.brassInk,
    "terminal.hoverHighlightBackground": alpha(palette.blue, 0.18),
    "terminal.dropBackground": alpha(selected, 0.2),
    "terminalCursor.foreground": palette.focus,
    "terminalCursor.background": palette.surface,
    "terminal.tab.activeBorder": palette.focus,
    "terminalCommandDecoration.defaultBackground": palette.blueInk,
    "terminalCommandDecoration.successBackground": status.success.border,
    "terminalCommandDecoration.errorBackground": status.danger.border,
    "terminalCommandGuide.foreground": alpha(palette.borderStrong, 0.7),
    "terminalStickyScroll.background": palette.surface,
    "terminalStickyScroll.border": palette.border,
    "terminalStickyScrollHover.background": palette.raised,
    "terminalOverviewRuler.cursorForeground": palette.focus,
    "terminalOverviewRuler.findMatchForeground": palette.link,
    "terminal.ansiBlack": dark
      ? alpha(palette.muted, 0.82)
      : palette.text,
    "terminal.ansiRed": dark
      ? alpha(palette.pink, 0.9)
      : status.danger.text,
    "terminal.ansiGreen": dark
      ? status.success.border
      : alpha(status.success.text, 0.84),
    "terminal.ansiYellow": dark
      ? status.warning.border
      : alpha(status.warning.text, 0.84),
    "terminal.ansiBlue": dark
      ? alpha(palette.blueInk, 0.88)
      : palette.navy,
    "terminal.ansiMagenta": palette.purple,
    "terminal.ansiCyan": dark
      ? status.info.border
      : alpha(status.info.text, 0.84),
    "terminal.ansiWhite": dark
      ? alpha(palette.text, 0.82)
      : alpha(palette.muted, 0.92),
    "terminal.ansiBrightBlack": palette.muted,
    "terminal.ansiBrightRed": dark
      ? status.danger.text
      : status.danger.border,
    "terminal.ansiBrightGreen": status.success.text,
    "terminal.ansiBrightYellow": status.warning.text,
    "terminal.ansiBrightBlue": palette.blueInk,
    "terminal.ansiBrightMagenta": palette.link,
    "terminal.ansiBrightCyan": status.info.text,
    "terminal.ansiBrightWhite": dark
      ? palette.text
      : alpha(palette.text, 0.86),

    "gitDecoration.addedResourceForeground": git.added,
    "gitDecoration.modifiedResourceForeground": git.modified,
    "gitDecoration.deletedResourceForeground": git.deleted,
    "gitDecoration.renamedResourceForeground": git.renamed,
    "gitDecoration.untrackedResourceForeground": git.added,
    "gitDecoration.ignoredResourceForeground": alpha(palette.muted, 0.72),
    "gitDecoration.conflictingResourceForeground": palette.purple,
    "gitDecoration.submoduleResourceForeground": palette.blueInk,
    "gitDecoration.stageModifiedResourceForeground": git.modified,
    "gitDecoration.stageDeletedResourceForeground": git.deleted,

    "testing.iconFailed": danger,
    "testing.iconErrored": status.danger.border,
    "testing.iconPassed": success,
    "testing.iconQueued": warning,
    "testing.iconUnset": palette.muted,
    "testing.iconSkipped": palette.muted,
    "testing.peekBorder": palette.focus,
    "testing.peekHeaderBackground": palette.raised,
    "testing.message.error.badgeBackground": status.danger.background,
    "testing.message.error.badgeBorder": status.danger.border,
    "testing.message.error.badgeForeground": status.danger.text,
    "testing.message.error.lineBackground": alpha(status.danger.background, 0.35),
    "testing.message.info.decorationForeground": info,
    "testing.message.info.lineBackground": alpha(status.info.background, 0.35),

    "notebook.editorBackground": palette.canvas,
    "notebook.cellEditorBackground": palette.surface,
    "notebook.cellBorderColor": palette.border,
    "notebook.cellHoverBackground": alpha(palette.raised, 0.52),
    "notebook.cellInsertionIndicator": palette.focus,
    "notebook.cellStatusBarItemHoverBackground": alpha(palette.raised, 0.7),
    "notebook.cellToolbarSeparator": palette.border,
    "notebook.focusedCellBackground": alpha(selected, 0.1),
    "notebook.focusedCellBorder": palette.focus,
    "notebook.focusedEditorBorder": palette.focus,
    "notebook.inactiveFocusedCellBorder": alpha(palette.focus, 0.58),
    "notebook.inactiveSelectedCellBorder": palette.borderStrong,
    "notebook.outputContainerBackgroundColor": palette.surface,
    "notebook.outputContainerBorderColor": palette.border,
    "notebook.selectedCellBackground": alpha(selected, 0.12),
    "notebook.selectedCellBorder": palette.borderStrong,
    "notebook.symbolHighlightBackground": alpha(palette.blue, 0.18),
    "notebookScrollbarSlider.background": alpha(palette.muted, 0.28),
    "notebookScrollbarSlider.hoverBackground": alpha(palette.muted, 0.42),
    "notebookScrollbarSlider.activeBackground": alpha(palette.muted, 0.58),
    "notebookStatusErrorIcon.foreground": danger,
    "notebookStatusRunningIcon.foreground": warning,
    "notebookStatusSuccessIcon.foreground": success,
    "interactive.activeCodeBorder": palette.focus,
    "interactive.inactiveCodeBorder": palette.border,

    "charts.foreground": palette.text,
    "charts.lines": alpha(palette.muted, 0.56),
    "charts.red": status.danger.border,
    "charts.blue": palette.blueInk,
    "charts.yellow": status.warning.border,
    "charts.orange": palette.brassInk,
    "charts.green": status.success.border,
    "charts.purple": palette.purple,
    "ports.iconRunningProcessForeground": success,
    "search.resultsInfoForeground": palette.muted,
    "searchEditor.findMatchBackground": alpha(palette.link, 0.26),
    "searchEditor.findMatchBorder": palette.link,
    "searchEditor.textInputBorder": palette.muted,
    "multiDiffEditor.background": palette.canvas,
    "multiDiffEditor.headerBackground": palette.raised,
    "multiDiffEditor.border": palette.borderStrong,
  };

  const bracketColors = [
    palette.link,
    palette.blueInk,
    palette.brassInk,
    palette.purple,
    palette.text,
    palette.linkHover,
  ];

  for (const [index, color] of bracketColors.entries()) {
    colors[`editorBracketHighlight.foreground${index + 1}`] = color;
  }

  return colors;
}

function tokenColors(palette, status) {
  const success = status.success.text;
  const warning = status.warning.text;
  const danger = status.danger.text;

  return [
    {
      name: "Default source text",
      scope: [
        "source",
        "meta.embedded",
        "source.groovy.embedded",
        "meta.jsx.children",
      ],
      settings: {
        foreground: palette.text,
      },
    },
    {
      name: "Comments",
      scope: [
        "comment",
        "punctuation.definition.comment",
        "string.comment",
      ],
      settings: {
        foreground: palette.muted,
        fontStyle: "italic",
      },
    },
    {
      name: "Keywords and storage",
      scope: [
        "keyword",
        "storage.type",
        "storage.modifier",
        "keyword.control",
        "keyword.other",
      ],
      settings: {
        foreground: palette.link,
      },
    },
    {
      name: "Operators",
      scope: [
        "keyword.operator",
        "keyword.operator.assignment",
        "keyword.operator.arithmetic",
        "keyword.operator.logical",
        "keyword.operator.comparison",
      ],
      settings: {
        foreground: palette.text,
      },
    },
    {
      name: "Punctuation",
      scope: [
        "punctuation",
        "meta.brace",
        "punctuation.separator",
        "punctuation.terminator",
      ],
      settings: {
        foreground: palette.text,
      },
    },
    {
      name: "Strings",
      scope: [
        "string",
        "string.quoted",
        "string.template",
        "string.interpolated",
      ],
      settings: {
        foreground: palette.blueInk,
      },
    },
    {
      name: "String escapes",
      scope: [
        "constant.character.escape",
        "constant.character.entity",
        "punctuation.definition.entity",
      ],
      settings: {
        foreground: palette.brassInk,
      },
    },
    {
      name: "Numbers",
      scope: [
        "constant.numeric",
        "constant.numeric.integer",
        "constant.numeric.float",
        "constant.numeric.hex",
      ],
      settings: {
        foreground: palette.link,
      },
    },
    {
      name: "Language constants",
      scope: [
        "constant.language",
        "constant.character",
        "variable.language",
        "support.constant",
      ],
      settings: {
        foreground: palette.brassInk,
      },
    },
    {
      name: "User constants",
      scope: [
        "constant.other",
        "entity.name.constant",
        "variable.other.constant",
        "variable.other.enummember",
      ],
      settings: {
        foreground: palette.brassInk,
      },
    },
    {
      name: "Functions and methods",
      scope: [
        "entity.name.function",
        "entity.name.method",
        "support.function",
        "variable.function",
        "meta.function-call entity.name.function",
      ],
      settings: {
        foreground: palette.purple,
      },
    },
    {
      name: "Types classes interfaces and namespaces",
      scope: [
        "entity.name.type",
        "entity.name.class",
        "entity.name.interface",
        "entity.name.namespace",
        "entity.other.inherited-class",
        "support.type",
        "support.class",
      ],
      settings: {
        foreground: palette.blueInk,
      },
    },
    {
      name: "Variables",
      scope: [
        "variable",
        "variable.other",
        "variable.other.readwrite",
        "support.variable",
      ],
      settings: {
        foreground: palette.text,
      },
    },
    {
      name: "Parameters",
      scope: [
        "variable.parameter",
        "meta.function.parameters variable",
      ],
      settings: {
        foreground: palette.brassInk,
      },
    },
    {
      name: "Properties and attributes",
      scope: [
        "variable.other.property",
        "support.type.property-name",
        "entity.other.attribute-name",
        "meta.object-literal.key",
      ],
      settings: {
        foreground: palette.text,
      },
    },
    {
      name: "Regular expressions",
      scope: [
        "string.regexp",
        "source.regexp",
        "constant.regexp",
      ],
      settings: {
        foreground: palette.brassInk,
      },
    },
    {
      name: "Decorators and annotations",
      scope: [
        "meta.decorator",
        "meta.annotation",
        "punctuation.decorator",
        "entity.name.function.decorator",
      ],
      settings: {
        foreground: palette.brassInk,
      },
    },
    {
      name: "JavaScript and TypeScript functions",
      scope: [
        "entity.name.function.js",
        "entity.name.function.ts",
        "entity.name.function.method.js",
        "entity.name.function.method.ts",
        "support.function.dom.js",
        "support.function.dom.ts",
      ],
      settings: {
        foreground: palette.purple,
      },
    },
    {
      name: "JavaScript and TypeScript types",
      scope: [
        "entity.name.type.class.js",
        "entity.name.type.class.ts",
        "entity.name.type.interface.ts",
        "support.type.primitive.ts",
        "support.type.builtin.ts",
      ],
      settings: {
        foreground: palette.blueInk,
      },
    },
    {
      name: "JavaScript and TypeScript template delimiters",
      scope: [
        "punctuation.definition.template-expression.begin.js",
        "punctuation.definition.template-expression.end.js",
        "punctuation.definition.template-expression.begin.ts",
        "punctuation.definition.template-expression.end.ts",
      ],
      settings: {
        foreground: palette.link,
      },
    },
    {
      name: "JSON property names",
      scope: [
        "support.type.property-name.json",
        "meta.structure.dictionary.json string.quoted.double.json",
      ],
      settings: {
        foreground: palette.brassInk,
      },
    },
    {
      name: "JSON constants",
      scope: [
        "constant.language.json",
        "constant.numeric.json",
      ],
      settings: {
        foreground: palette.link,
      },
    },
    {
      name: "HTML tags",
      scope: [
        "entity.name.tag.html",
        "entity.name.tag.block.any.html",
        "entity.name.tag.inline.any.html",
        "entity.name.tag.doctype.html",
        "punctuation.definition.tag.html",
      ],
      settings: {
        foreground: palette.blueInk,
      },
    },
    {
      name: "HTML attributes",
      scope: [
        "entity.other.attribute-name.html",
        "meta.attribute-with-value.html entity.other.attribute-name.html",
      ],
      settings: {
        foreground: palette.text,
      },
    },
    {
      name: "CSS selectors",
      scope: [
        "entity.name.tag.css",
        "entity.other.attribute-name.class.css",
        "entity.other.attribute-name.id.css",
        "entity.other.attribute-name.pseudo-class.css",
        "entity.other.attribute-name.pseudo-element.css",
      ],
      settings: {
        foreground: palette.blueInk,
      },
    },
    {
      name: "CSS properties",
      scope: [
        "support.type.property-name.css",
        "meta.property-name.css",
      ],
      settings: {
        foreground: palette.text,
      },
    },
    {
      name: "CSS values and units",
      scope: [
        "support.constant.property-value.css",
        "support.constant.color.w3c-standard-color-name.css",
        "support.constant.font-name.css",
        "keyword.other.unit.css",
      ],
      settings: {
        foreground: palette.brassInk,
      },
    },
    {
      name: "Markdown headings",
      scope: [
        "markup.heading.markdown",
        "entity.name.section.markdown",
        "punctuation.definition.heading.markdown",
      ],
      settings: {
        foreground: palette.blueInk,
        fontStyle: "bold",
      },
    },
    {
      name: "Markdown bold",
      scope: [
        "markup.bold.markdown",
        "punctuation.definition.bold.markdown",
      ],
      settings: {
        foreground: palette.text,
        fontStyle: "bold",
      },
    },
    {
      name: "Markdown italic",
      scope: [
        "markup.italic.markdown",
        "punctuation.definition.italic.markdown",
      ],
      settings: {
        foreground: palette.text,
        fontStyle: "italic",
      },
    },
    {
      name: "Markdown quotes and lists",
      scope: [
        "markup.quote.markdown",
        "punctuation.definition.quote.begin.markdown",
        "punctuation.definition.list.begin.markdown",
      ],
      settings: {
        foreground: palette.brassInk,
      },
    },
    {
      name: "Markdown code",
      scope: [
        "markup.inline.raw.string.markdown",
        "markup.fenced_code.block.markdown",
        "punctuation.definition.raw.markdown",
      ],
      settings: {
        foreground: palette.blueInk,
      },
    },
    {
      name: "Markdown links",
      scope: [
        "markup.underline.link.markdown",
        "string.other.link.title.markdown",
        "constant.other.reference.link.markdown",
        "meta.link.inline.markdown",
      ],
      settings: {
        foreground: palette.link,
      },
    },
    {
      name: "PowerShell functions",
      scope: [
        "entity.name.function.powershell",
        "support.function.powershell",
      ],
      settings: {
        foreground: palette.purple,
      },
    },
    {
      name: "PowerShell variables and parameters",
      scope: [
        "variable.other.readwrite.powershell",
        "variable.parameter.powershell",
        "variable.language.powershell",
      ],
      settings: {
        foreground: palette.brassInk,
      },
    },
    {
      name: "PowerShell keywords",
      scope: [
        "keyword.control.powershell",
        "keyword.other.powershell",
        "keyword.operator.powershell",
        "storage.type.powershell",
      ],
      settings: {
        foreground: palette.link,
      },
    },
    {
      name: "Shell functions and commands",
      scope: [
        "entity.name.function.shell",
        "entity.name.function.call.shell",
        "entity.name.command.shell",
        "support.function.builtin.shell",
      ],
      settings: {
        foreground: palette.purple,
      },
    },
    {
      name: "Shell variables and parameters",
      scope: [
        "variable.other.normal.shell",
        "variable.other.bracket.shell",
        "variable.language.special.shell",
        "variable.parameter.shell",
      ],
      settings: {
        foreground: palette.brassInk,
      },
    },
    {
      name: "Shell options and operators",
      scope: [
        "string.unquoted.argument.option.shell",
        "keyword.operator.logical.shell",
        "keyword.operator.redirect.shell",
      ],
      settings: {
        foreground: palette.link,
      },
    },
    {
      name: "Hugo template keywords",
      scope: [
        "keyword.control.hugo",
        "keyword.operator.initialize.hugo",
        "keyword.control.gotemplate",
      ],
      settings: {
        foreground: palette.link,
      },
    },
    {
      name: "Hugo template functions",
      scope: [
        "support.function.hugo",
        "support.function.builtin.hugo",
        "support.function.builtin.gotemplate",
      ],
      settings: {
        foreground: palette.purple,
      },
    },
    {
      name: "Hugo template variables",
      scope: [
        "variable.hugo",
        "variable.other.gotemplate",
      ],
      settings: {
        foreground: palette.brassInk,
      },
    },
    {
      name: "Hugo template delimiters",
      scope: [
        "punctuation.section.embedded.begin.hugo",
        "punctuation.section.embedded.end.hugo",
        "punctuation.section.embedded.begin.gotemplate",
        "punctuation.section.embedded.end.gotemplate",
      ],
      settings: {
        foreground: palette.link,
      },
    },
    {
      name: "Diff inserted",
      scope: [
        "markup.inserted",
        "markup.inserted.diff",
        "punctuation.definition.inserted.diff",
      ],
      settings: {
        foreground: success,
      },
    },
    {
      name: "Diff deleted",
      scope: [
        "markup.deleted",
        "markup.deleted.diff",
        "punctuation.definition.deleted.diff",
      ],
      settings: {
        foreground: danger,
      },
    },
    {
      name: "Diff changed",
      scope: [
        "markup.changed",
        "markup.changed.diff",
        "punctuation.definition.changed.diff",
      ],
      settings: {
        foreground: warning,
      },
    },
    {
      name: "Invalid and deprecated",
      scope: [
        "invalid",
        "invalid.illegal",
        "invalid.broken",
        "invalid.deprecated",
      ],
      settings: {
        foreground: danger,
      },
    },
  ];
}

function semanticTokenColors(palette, status) {
  return {
    "namespace": palette.blueInk,
    "type": palette.blueInk,
    "class": palette.blueInk,
    "enum": palette.blueInk,
    "interface": palette.blueInk,
    "struct": palette.blueInk,
    "typeParameter": palette.blueInk,
    "parameter": palette.brassInk,
    "variable": palette.text,
    "property": palette.text,
    "enumMember": palette.brassInk,
    "event": palette.brassInk,
    "function": palette.purple,
    "method": palette.purple,
    "macro": palette.purple,
    "label": palette.brassInk,
    "comment": {
      foreground: palette.muted,
      italic: true,
    },
    "string": palette.blueInk,
    "keyword": palette.link,
    "number": palette.link,
    "regexp": palette.brassInk,
    "operator": palette.text,
    "decorator": palette.brassInk,
    "*.readonly": palette.brassInk,
    "*.deprecated": {
      foreground: status.danger.text,
      strikethrough: true,
    },
    "variable.defaultLibrary": palette.blueInk,
    "function.defaultLibrary": palette.purple,
    "method.defaultLibrary": palette.purple,
  };
}

function buildTheme(source, slug, appearance) {
  const definition = source.themes[slug];
  const palette = definition[appearance].colors;
  const status = source.status[appearance];
  const git = source.git[appearance];
  const appearanceLabel = appearance === "dark" ? "Dark" : "Light";

  return {
    "$schema": "vscode://schemas/color-theme",
    "name": `${definition.displayName} ${appearanceLabel}`,
    "type": appearance,
    "semanticHighlighting": true,
    "colors": workbenchColors(palette, status, git, appearance),
    "tokenColors": tokenColors(palette, status),
    "semanticTokenColors": semanticTokenColors(palette, status),
  };
}

export async function generatedThemes() {
  const source = JSON.parse(await readFile(PALETTE_PATH, "utf8"));
  const generated = new Map();

  for (const slug of Object.keys(source.themes)) {
    for (const appearance of ["light", "dark"]) {
      const filename = `aepcodes-${slug}-${appearance}-color-theme.json`;
      const theme = buildTheme(source, slug, appearance);
      generated.set(filename, `${JSON.stringify(theme, null, 2)}\n`);
    }
  }

  return generated;
}

async function run() {
  const generated = await generatedThemes();
  const stale = [];

  if (!CHECK_MODE) {
    await mkdir(THEMES_DIRECTORY, { recursive: true });
  }

  for (const [filename, contents] of generated) {
    const destination = resolve(THEMES_DIRECTORY, filename);

    if (CHECK_MODE) {
      let existing;
      try {
        existing = await readFile(destination, "utf8");
      } catch (error) {
        if (error.code !== "ENOENT") {
          throw error;
        }
      }

      if (existing !== contents) {
        stale.push(filename);
      }
    } else {
      await writeFile(destination, contents);
      console.log(`Generated themes/${filename}`);
    }
  }

  if (stale.length > 0) {
    console.error("Generated theme files are missing or stale:");
    for (const filename of stale) {
      console.error(`- themes/${filename}`);
    }
    console.error("Run `npm run generate` and commit the results.");
    process.exitCode = 1;
    return;
  }

  if (CHECK_MODE) {
    console.log(`All ${generated.size} generated theme files are current.`);
  }
}

const invokedDirectly =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  await run();
}
