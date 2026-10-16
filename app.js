const initialModel = {
  page: {
    filename: "my-homepage.html",
    title: "はじめてのペライチ",
    backgroundColor: "#f7f9fc",
    backgroundImage: "",
    backgroundSize: "cover",
    backgroundPosition: "center",
    anchors: [],
  },
  layout: "single",
  layoutDirection: "row",
  layoutGap: 24,
  layoutRatios: [1],
  columns: ["left"],
  groups: [],
  elements: [
    {
      id: "hero-title",
      type: "heading",
      column: "left",
      content: "はじめてのホームページを、ここから。",
      style: {
        color: "#18222f",
        fontFamily: "system",
        backgroundColor: "#ffffff",
        fontSize: 42,
        fontWeight: 700,
        textAlign: "left",
        verticalAlign: "top",
        lineHeight: 1.3,
        padding: 24,
        margin: 0,
        width: 88,
        borderWidth: 0,
        borderColor: "#b9d0ff",
        borderRadius: 18,
        shadow: "none",
        depth: "none",
        borderStyle: "none",
        glow: "none",
      },
    },
  ],
  selectedId: "hero-title",
};

const model = structuredClone(initialModel);
model.activePreset = "simple";
model.selectedColumn = "left";
model.selectedIds = ["hero-title"];
model.selectedGroupId = null;
model.selectedColumns = [];
model.selectedBackground = false;
const frame = document.querySelector("#preview-frame");
const projectSetup = document.querySelector("#project-setup");
const projectSetupForm = document.querySelector("#project-setup-form");
const projectFilename = document.querySelector("#project-filename");
const projectTitle = document.querySelector("#project-title");
const pageSettings = document.querySelector("#page-settings");
const pageBackground = document.querySelector("#page-background");
const imageFile = document.querySelector("#image-file");
const imageReplaceFile = document.querySelector("#image-replace-file");
const addSeparator = document.querySelector("#add-separator");
const addButton = document.querySelector("#add-button");
const backgroundFile = document.querySelector("#background-file");
const backgroundSize = document.querySelector("#background-size");
const backgroundPosition = document.querySelector("#background-position");
const loadHtmlFile = document.querySelector("#load-html-file");
const loadProjectFile = document.querySelector("#load-project-file");
const bodyTools = document.querySelector("#body-tools");
const buttonTools = document.querySelector("#button-tools");
const layoutTools = document.querySelector("#layout-tools");
const layoutGap = document.querySelector("#layout-gap");
const layoutGapValue = document.querySelector("#layout-gap-value");
const layoutWidth = document.querySelector("#layout-width");
const layoutWidthValue = document.querySelector("#layout-width-value");
const layoutHeight = document.querySelector("#layout-height");
const layoutHeightValue = document.querySelector("#layout-height-value");
const layoutWidthField = document.querySelector("#layout-width-field");
const layoutHeightField = document.querySelector("#layout-height-field");
const layoutAnchorName = document.querySelector("#layout-anchor-name");
const saveLayoutAnchor = document.querySelector("#save-layout-anchor");
const layoutPopover = document.querySelector("#layout-popover");
const deleteSection = document.querySelector("#delete-section");
const deleteButton = document.querySelector("#delete-selected");
const actionToast = document.querySelector("#action-toast");
const actionToastMessage = document.querySelector("#action-toast-message");
const undoDelete = document.querySelector("#undo-delete");
const undoButton = document.querySelector("#undo-button");
const contextMenu = document.querySelector("#context-menu");
let contextTarget = null;
const imageAlt = document.querySelector("#image-alt");
const imageWidth = document.querySelector("#image-width");
const imageWidthValue = document.querySelector("#image-width-value");
const imageMargin = document.querySelector("#image-margin");
const imageMarginValue = document.querySelector("#image-margin-value");
const imageRadius = document.querySelector("#image-radius");
const imageRadiusValue = document.querySelector("#image-radius-value");
const imageBorderWidth = document.querySelector("#image-border-width");
const imageBorderColor = document.querySelector("#image-border-color");
const separatorWidth = document.querySelector("#separator-width");
const separatorWidthValue = document.querySelector("#separator-width-value");
const separatorThickness = document.querySelector("#separator-thickness");
const separatorColor = document.querySelector("#separator-color");
const separatorStyle = document.querySelector("#separator-style");
const buttonLabel = document.querySelector("#button-label");
const buttonLinkType = document.querySelector("#button-link-type");
const buttonUrl = document.querySelector("#button-url");
const buttonAnchorField = document.querySelector("#button-anchor-field");
const buttonUrlField = document.querySelector("#button-url-field");
const buttonAnchor = document.querySelector("#button-anchor");
const buttonTargetBlank = document.querySelector("#button-target-blank");
const buttonTextColor = document.querySelector("#button-text-color");
const buttonBackgroundColor = document.querySelector("#button-background-color");
const buttonWidth = document.querySelector("#button-width");
const buttonWidthValue = document.querySelector("#button-width-value");
const buttonHeight = document.querySelector("#button-height");
const buttonHeightValue = document.querySelector("#button-height-value");
const buttonRadius = document.querySelector("#button-radius");
const buttonRadiusValue = document.querySelector("#button-radius-value");
const buttonBorderWidth = document.querySelector("#button-border-width");
const buttonBorderColor = document.querySelector("#button-border-color");
const imageOffsetX = document.querySelector("#image-offset-x");
const imageOffsetXValue = document.querySelector("#image-offset-x-value");
const imageOffsetY = document.querySelector("#image-offset-y");
const imageOffsetYValue = document.querySelector("#image-offset-y-value");
const history = [];
let pendingPreviewScrollTop = 0;
const collapsedSections = new Set(["preset-tools", "decoration-tools"]);

projectSetupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const filename = projectFilename.value.trim();
  const title = projectTitle.value.trim();
  if (!filename || !title) return;
  model.page.filename = filename;
  model.page.title = title;
  document.querySelector("#app-page-title").textContent = title;
  document.querySelector("#footer-page-title").textContent = title;
  projectSetup.hidden = true;
  render();
});

function toggleSection(section) {
  if (collapsedSections.has(section.id)) collapsedSections.delete(section.id);
  else collapsedSections.add(section.id);
  const expanded = !collapsedSections.has(section.id);
  section.setAttribute("aria-expanded", String(expanded));
}

document.querySelectorAll("[data-collapsible]").forEach((section) => {
  const title = section.querySelector(".collapsible-title");
  title.addEventListener("click", () => toggleSection(section));
  title.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleSection(section);
    }
  });
});

contextMenu.querySelectorAll("[data-context-action]").forEach((button) => button.addEventListener("click", () => setColumnAnchor(button.dataset.contextAction)));
document.addEventListener("click", (event) => { if (!contextMenu.hidden && !contextMenu.contains(event.target)) closeContextMenu(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeContextMenu(); });

function snapshotModel() {
  return structuredClone({ page: model.page, layout: model.layout, layoutDirection: model.layoutDirection, layoutGap: model.layoutGap, layoutRatios: model.layoutRatios, columns: model.columns, groups: model.groups, elements: model.elements, selectedIds: model.selectedIds, selectedColumn: model.selectedColumn, selectedGroupId: model.selectedGroupId, selectedColumns: model.selectedColumns, selectedBackground: model.selectedBackground, activePreset: model.activePreset });
}

function anchorHtmlId(anchor) {
  return anchor.id || `anchor-${anchor.name.toLowerCase().replace(/[^a-z0-9一-龯ぁ-んァ-ン]+/g, "-")}`;
}

function linkHref(element) {
  if (element.linkType === "anchor" && element.anchorId) return `#${element.anchorId}`;
  return element.url || "#";
}

function anchorFor(groupId, column) {
  return (model.page.anchors || []).find((anchor) => (anchor.groupId || null) === (groupId || null) && anchor.column === column);
}

function pushHistory() {
  history.push(snapshotModel());
  if (history.length > 30) history.shift();
}

function undoLastChange() {
  const snapshot = history.pop();
  if (!snapshot) return;
  Object.assign(model, snapshot);
  actionToast.hidden = true;
  render();
}

function currentContextAnchor() {
  return contextTarget ? anchorFor(contextTarget.groupId, contextTarget.column) : null;
}

function closeContextMenu() {
  contextMenu.hidden = true;
  contextTarget = null;
}

function openContextMenu(target) {
  contextTarget = target;
  const anchor = currentContextAnchor();
  contextMenu.querySelector('[data-context-action="anchor-edit"]').hidden = !anchor;
  contextMenu.querySelector('[data-context-action="anchor-remove"]').hidden = !anchor;
  const left = Math.min(window.innerWidth - 190, Math.max(8, target.x));
  const top = Math.min(window.innerHeight - 140, Math.max(8, target.y));
  contextMenu.style.left = `${left}px`;
  contextMenu.style.top = `${top}px`;
  contextMenu.hidden = false;
}

function setColumnAnchor(action) {
  if (!contextTarget) return;
  const anchors = model.page.anchors || (model.page.anchors = []);
  const existing = currentContextAnchor();
  if (action === "anchor-add" || action === "anchor-edit") {
    const name = window.prompt(existing ? "この場所の名前を変更" : "この場所につける名前", existing?.name || "");
    if (!name?.trim()) return closeContextMenu();
    const trimmed = name.trim();
    const duplicate = anchors.find((anchor) => anchor.name === trimmed && anchor.id !== existing?.id);
    if (duplicate) {
      showToast("同じ名前がすでにあります");
      return closeContextMenu();
    }
    pushHistory();
    if (existing) existing.name = trimmed;
    else anchors.push({ id: `anchor-${anchors.length + 1}`, name: trimmed, groupId: contextTarget.groupId || null, column: contextTarget.column });
    closeContextMenu();
    render();
  } else if (action === "anchor-remove" && existing) {
    const linked = model.elements.filter((element) => element.type === "button" && element.anchorId === existing.id);
    if (linked.length && !window.confirm(`この場所を使っているボタンが${linked.length}個あります。名前を削除しますか？`)) return closeContextMenu();
    pushHistory();
    anchors.splice(anchors.indexOf(existing), 1);
    linked.forEach((element) => { element.anchorId = ""; element.linkType = "url"; });
    closeContextMenu();
    render();
  }
}

const controls = {
  content: document.querySelector("#content-input"),
  textColor: document.querySelector("#text-color"),
  backgroundColor: document.querySelector("#background-color"),
  backgroundNone: document.querySelector("#background-none"),
  fontSize: document.querySelector("#font-size"),
  fontSizeValue: document.querySelector("#font-size-value"),
  fontWeight: document.querySelector("#font-weight"),
  fontFamily: document.querySelector("#font-family"),
  lineHeight: document.querySelector("#line-height"),
  lineHeightValue: document.querySelector("#line-height-value"),
  padding: document.querySelector("#padding"),
  paddingValue: document.querySelector("#padding-value"),
  margin: document.querySelector("#margin"),
  marginValue: document.querySelector("#margin-value"),
  width: document.querySelector("#width"),
  widthValue: document.querySelector("#width-value"),
  borderWidth: document.querySelector("#border-width"),
  borderColor: document.querySelector("#border-color"),
  radius: document.querySelector("#radius"),
  radiusValue: document.querySelector("#radius-value"),
};
const buttonFontFamily = document.querySelector("#button-font-family");
const buttonFontWeight = document.querySelector("#button-font-weight");

function selectedElement() {
  return model.elements.find((element) => element.id === model.selectedIds[0]) || model.elements[0];
}

function hasSelection() {
  return model.selectedIds.length > 0 && model.elements.some((element) => model.selectedIds.includes(element.id));
}

function selectionCount() {
  return model.selectedIds.filter((id) => model.elements.some((element) => element.id === id)).length;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
}

function fontFamilyFor(value) {
  return {
    system: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    sans: '"Noto Sans JP", sans-serif',
    serif: '"Noto Serif JP", serif',
    rounded: '"Zen Maru Gothic", sans-serif',
  }[value] || 'system-ui, -apple-system, "Segoe UI", sans-serif';
}

const googleFontImport = '@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700;900&family=Noto+Serif+JP:wght@400;700;900&family=Zen+Maru+Gothic:wght@400;700;900&display=swap");';

function cssFor(element) {
  const buttonDefaults = { color: "#ffffff", backgroundColor: "#2563eb", fontFamily: "system", fontSize: 16, fontWeight: 700, textAlign: "center", verticalAlign: "center", lineHeight: 1.4, padding: 12, margin: 12, width: 48, height: 48, borderWidth: 0, borderColor: "#1d4ed8", borderRadius: 12, buttonAlign: "center", shadow: "soft", depth: "none", borderStyle: "solid", glow: "none" };
  const bodyDefaults = { color: "#334155", backgroundColor: "#ffffff", fontFamily: "system", fontSize: 18, fontWeight: 400, textAlign: "left", verticalAlign: "top", lineHeight: 1.8, padding: 18, margin: 12, width: 88, borderWidth: 0, borderColor: "#b9d0ff", borderRadius: 12, shadow: "none", depth: "none", borderStyle: "none", glow: "none" };
  const headingDefaults = { ...initialModel.elements[0].style };
  const rawStyle = Object.fromEntries(Object.entries(element.style || {}).filter(([, value]) => value !== undefined && value !== null && value !== ""));
  const s = { ...(element.type === "button" ? buttonDefaults : element.type === "body" ? bodyDefaults : element.type === "heading" ? headingDefaults : bodyDefaults), ...rawStyle };
  const effectiveBackgroundColor = s.backgroundColor || (element.type === "image" || element.type === "separator" ? "transparent" : "#ffffff");
  const imageMargin = element.type === "image"
    ? { left: `${s.margin}px auto ${s.margin}px 0`, center: `${s.margin}px auto`, right: `${s.margin}px 0 ${s.margin}px auto` }[s.imagePosition || "center"]
    : element.type === "button"
      ? `${s.margin}px ${s.buttonAlign === "right" ? "0" : s.buttonAlign === "left" ? "auto" : "auto"} ${s.margin}px ${s.buttonAlign === "left" ? "0" : s.buttonAlign === "right" ? "auto" : "auto"}`
      : `${s.margin}px auto`;
  const border = s.borderStyle === "double" ? `${Math.max(3, s.borderWidth)}px double ${s.borderColor}` : `${s.borderWidth}px solid ${s.borderColor}`;
  const shadows = [
    { none: "none", soft: "0 8px 20px rgba(30,52,79,.14)", strong: "0 12px 28px rgba(30,52,79,.28)" }[s.shadow],
    { none: "", emboss: "inset 0 2px 0 rgba(255,255,255,.72), inset 0 -2px 0 rgba(20,35,55,.16)", inset: "inset 0 3px 5px rgba(20,35,55,.2)" }[s.depth],
  ].filter(Boolean);
  const glow = { none: "", soft: "0 0 10px rgba(96,165,250,.4)", strong: "0 0 18px rgba(96,165,250,.75)" }[s.glow];
  if (glow) shadows.push(glow);
  return [
    `color: ${s.color};`,
    `font-family: ${fontFamilyFor(s.fontFamily)};`,
    `background-color: ${effectiveBackgroundColor};`,
    `font-size: ${s.fontSize}px;`,
    `font-weight: ${s.fontWeight};`,
    `text-align: ${s.textAlign};`,
    ["heading", "body"].includes(element.type) ? "display: flex; flex-direction: column;" : "",
    ["heading", "body"].includes(element.type) ? `justify-content: ${{ top: "flex-start", center: "center", bottom: "flex-end" }[s.verticalAlign || "top"]};` : "",
    `line-height: ${s.lineHeight};`,
    `padding: ${s.padding}px;`,
    `margin: ${imageMargin};`,
    `width: ${s.width}%;`,
    element.type === "button" ? `min-height: ${s.height || 48}px;` : "",
    `border: ${border};`,
    `border-radius: ${s.borderRadius}px;`,
    element.type === "button" ? "display: block; text-decoration: none; cursor: pointer;" : "",
    element.type === "separator" ? "height: 0; min-height: 0; padding: 0;" : "",
    element.type === "image" ? "display: block;" : "",
    element.type === "image" ? `object-fit: ${s.objectFit || "contain"};` : "",
    element.type === "image" ? `transform: translate(${s.offsetX || 0}px, ${s.offsetY || 0}px);` : "",
    `box-shadow: ${shadows.length ? shadows.join(", ") : "none"};`,
  ].join(" ");
}

function elementMarkup(element, inlineStyles = false, source = false) {
    const selectedIndex = model.selectedIds.indexOf(element.id);
    const selected = inlineStyles && selectedIndex >= 0 ? ` is-selected is-selected-${selectedIndex + 1}` : "";
  const inline = inlineStyles ? ` style="${escapeHtml(cssFor(element))}"` : "";
  const elementData = inlineStyles ? ` data-element-id="${element.id}"` : "";
  const editable = inlineStyles && ["heading", "body"].includes(element.type) ? ` data-editable="true"` : "";
    if (element.type === "separator") {
      return `    <div id="${element.id}"${elementData} class="text-element separator-element${selected}"${inline}></div>`;
    }
    if (element.type === "button") {
      return `    <a id="${element.id}"${elementData} class="text-element button-element${selected}" href="${escapeHtml(linkHref(element))}"${element.target === "blank" ? " target=\"_blank\" rel=\"noopener\"" : ""}${editable}${inline}>${escapeHtml(element.content || "ボタン")}</a>`;
    }
    if (element.type === "image") {
      const imageSource = source ? imageAssetPath(element) : element.src;
      return `    <img id="${element.id}"${elementData} class="text-element image-element${selected}" src="${imageSource}" alt="${escapeHtml(element.alt)}"${inline} />`;
    }
    if (element.type === "body" && element.format === "list") {
      const items = element.content.split(/\r?\n/).filter(Boolean).map((line) => `<li>${escapeHtml(line)}</li>`).join("");
      return `    <ul id="${element.id}"${elementData} class="text-element body-element${selected}"${editable}${inline}>${items}</ul>`;
    }
    const tag = element.type === "body" ? "p" : "h1";
    const kind = element.type === "body" ? "body-element" : "heading-element";
    const content = element.type === "body" && element.format === "strong" ? `<strong>${escapeHtml(element.content)}</strong>` : escapeHtml(element.content);
    return `    <${tag} id="${element.id}"${elementData} class="text-element ${kind}${selected}"${editable}${inline}>${content}</${tag}>`;
}

function layoutColumnLabel(direction, index, total) {
  if (direction === "column") return total === 2 ? ["上段", "下段"][index] : `第${index + 1}段`;
  return total === 2 ? ["左側", "右側"][index] : `第${index + 1}列`;
}

function isGuideTarget(groupId, root = false) {
  if (selectionCount() > 0) return false;
  if (model.selectedGroupId) return groupId === model.selectedGroupId;
  return root;
}

function columnSelectionKey(groupId, column) {
  return `${groupId || "root"}::${column}`;
}

function selectedLayoutConfig() {
  const group = model.groups.find((candidate) => candidate.id === model.selectedGroupId);
  return group
    ? { direction: group.direction, columns: group.columns, ratios: group.ratios }
    : { direction: model.layoutDirection, columns: model.columns, ratios: model.layoutRatios };
}

function selectedLayoutRatio() {
  const config = selectedLayoutConfig();
  const index = config.columns.indexOf(model.selectedColumn);
  if (index < 0 || config.columns.length < 2) return null;
  const total = config.ratios.reduce((sum, ratio) => sum + ratio, 0) || config.columns.length;
  return Math.round((config.ratios[index] / total) * 100);
}

function updateSelectedLayoutRatio(value) {
  const config = selectedLayoutConfig();
  const index = config.columns.indexOf(model.selectedColumn);
  if (index < 0 || config.columns.length < 2) return;
  pushHistory();
  const selectedRatio = Number(value);
  const remaining = Math.max(0, 100 - selectedRatio);
  const otherCount = config.columns.length - 1;
  config.columns.forEach((_, columnIndex) => {
    config.ratios[columnIndex] = columnIndex === index ? selectedRatio : remaining / otherCount;
  });
  render();
}

function isColumnSelected(groupId, column) {
  return model.selectedColumns.includes(columnSelectionKey(groupId, column));
}

function groupMarkup(group, { inlineStyles = false, preview = false, source = false } = {}) {
  const columns = group.columns;
  const columnMarkup = columns.map((column) => {
    const nestedGroups = model.groups.filter((candidate) => candidate.parentGroupId === group.id && candidate.parentColumn === column);
    const parts = [
      ...group.elementIds.map((id) => model.elements.find((element) => element.id === id)).filter((element) => element?.groupId === group.id && element.column === column).map((element) => elementMarkup(element, inlineStyles, source)),
      ...nestedGroups.map((nestedGroup) => groupMarkup(nestedGroup, { inlineStyles, preview, source })),
    ].join("\n");
    const active = preview && column === model.selectedColumn && group.id === model.selectedGroupId ? " is-active" : "";
    const empty = parts.trim() ? "" : " is-empty";
    const selectedColumn = preview && isColumnSelected(group.id, column) ? " is-column-selected" : "";
    const guide = preview && isGuideTarget(group.id) ? " layout-guide-column" : "";
    const label = guide ? ` data-layout-label="${layoutColumnLabel(group.direction, columns.indexOf(column), columns.length)}"` : "";
    const columnData = preview ? ` data-group-id="${group.id}" data-column-id="${column}"` : "";
    const anchor = anchorFor(group.id, column);
    const anchorData = anchor ? ` id="${escapeHtml(anchor.id)}"` : "";
    const anchorLabel = preview && anchor && isColumnSelected(group.id, column) ? ` data-anchor-label="${escapeHtml(anchor.name)}"` : "";
    return `      <div class="layout-column${active}${selectedColumn}${guide}${empty}"${anchorData}${columnData}${label}${anchorLabel}>${parts}</div>`;
  }).join("\n");
  const layoutClass = `nested-layout layout-split layout-${group.direction}`;
  return `    <div class="${layoutClass}" data-group-id="${group.id}">${columnMarkup}\n    </div>`;
}

function generatedHtml({ inlineStyles = false, preview = false, source = false } = {}) {
  const groupedIds = new Set(model.groups.flatMap((group) => group.elementIds));
  const columns = model.columns;
  const columnMarkup = columns.map((column) => {
    const directGroups = model.groups.filter((group) => !group.parentGroupId && group.parentColumn === column);
    const parts = [
      ...model.elements.filter((element) => !groupedIds.has(element.id) && (element.column || "left") === column).map((element) => elementMarkup(element, inlineStyles, source)),
      ...directGroups.map((group) => groupMarkup(group, { inlineStyles, preview, source })),
    ].join("\n");
    const active = preview && column === model.selectedColumn ? " is-active" : "";
    const empty = parts.trim() ? "" : " is-empty";
    const selectedColumn = preview && isColumnSelected(null, column) ? " is-column-selected" : "";
    const guide = preview && isGuideTarget(null, true) ? " layout-guide-column" : "";
    const label = guide ? ` data-layout-label="${layoutColumnLabel(model.layoutDirection, columns.indexOf(column), columns.length)}"` : "";
    const columnData = preview ? ` data-column-id="${column}"` : "";
    const anchor = anchorFor(null, column);
    const anchorData = anchor ? ` id="${escapeHtml(anchor.id)}"` : "";
    const anchorLabel = preview && anchor && isColumnSelected(null, column) ? ` data-anchor-label="${escapeHtml(anchor.name)}"` : "";
    return `    <div class="layout-column${active}${selectedColumn}${guide}${empty}"${anchorData}${columnData}${label}${anchorLabel}>\n${parts}\n    </div>`;
  }).join("\n");
  const layoutClass = columns.length > 1 ? `layout layout-split layout-${model.layoutDirection}` : "layout layout-single";
  return `<main class="page">\n  <section class="hero ${layoutClass}">\n${columnMarkup}\n  </section>\n</main>`;
}

function layoutDeclaration(direction, ratios, gap) {
  if (direction === "column") return `display:flex;flex-direction:column;gap:${gap}px;align-items:stretch;`;
  return `display:grid;grid-template-columns:${ratios.map((ratio) => `minmax(0, ${ratio}fr)`).join(" ")};gap:${gap}px;align-items:stretch;`;
}

function pageBackgroundDeclaration({ source = false } = {}) {
  if (!model.page.backgroundImage) return `background-color: ${model.page.backgroundColor};`;
  const image = source ? `images/page-background${imageExtension(model.page.backgroundImage)}` : model.page.backgroundImage;
  const mode = ["cover", "contain", "repeat"].includes(model.page.backgroundSize) ? model.page.backgroundSize : "cover";
  const tiled = mode === "repeat";
  return `background-color: ${model.page.backgroundColor}; background-image: url("${image}"); background-size: ${tiled ? "auto" : mode}; background-position: ${model.page.backgroundPosition || "center"}; background-repeat: ${tiled ? "repeat" : "no-repeat"};`;
}

function imageExtension(dataUrl) {
  const match = String(dataUrl || "").match(/^data:image\/([a-z0-9+.-]+)/i);
  const type = match?.[1]?.toLowerCase();
  return type === "jpeg" ? ".jpg" : type ? `.${type}` : ".png";
}

function imageAssetPath(element) {
  return `images/${element.id}${imageExtension(element.src)}`;
}

function formatCssForSource(css) {
  return css.replace(/([^{}]+)\{([^{}]*)\}/g, (_, selector, declarations) => {
    const lines = declarations.split(";").map((declaration) => declaration.trim()).filter(Boolean).map((declaration) => `  ${declaration};`);
    return `${selector.trim()} {\n${lines.join("\n")}\n}`;
  });
}

function generatedCss({ source = false } = {}) {
  const elementCss = model.elements.map((element) => `#${element.id} { ${cssFor(element)} }`).join("\n");
  const layoutRule = layoutDeclaration(model.layoutDirection, model.layoutRatios, model.layoutGap);
  const columnFlex = model.layoutDirection === "column" ? ".layout-column { flex: 0 0 auto; }" : "";
  const groupCss = model.groups.map((group) => `.nested-layout[data-group-id="${group.id}"] { ${layoutDeclaration(group.direction, group.ratios, group.gap)} }`).join("\n");
  const css = `html, body { margin: 0; min-height: 100%; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }\n.page { min-height: 100vh; box-sizing: border-box; padding: 48px 24px; ${pageBackgroundDeclaration({ source })} }\n.hero { max-width: 760px; margin: 0 auto; }\n.layout-split { ${layoutRule} }\n.nested-layout { width: 100%; max-width: 100%; min-width: 0; }\n.layout-column { box-sizing: border-box; width: 100%; min-width: 0; min-height: 0; padding: 8px; border-radius: 12px; }\n.layout-column.is-empty { min-height: 130px; }\n.text-element { box-sizing: border-box; max-width: 100%; white-space: pre-wrap; overflow-wrap: anywhere; word-break: break-word; }\n.heading-element, .body-element { background-color: #ffffff; }\n.button-element { display: block; background-color: #2563eb; color: #ffffff; text-decoration: none; }\n${columnFlex}\n${groupCss}\n${elementCss}`;
  return `${googleFontImport}\n${source ? formatCssForSource(css) : css}`;
}

function previewDocument() {
  const elementCss = model.elements.map((element) => `#${element.id}{${cssFor(element)}}`).join("");
  const layoutRule = layoutDeclaration(model.layoutDirection, model.layoutRatios, model.layoutGap);
  const columnFlex = model.layoutDirection === "column" ? ".layout-column{flex:0 0 auto}" : "";
  const groupCss = model.groups.map((group) => `.nested-layout[data-group-id="${group.id}"]{${layoutDeclaration(group.direction, group.ratios, group.gap)}}`).join("");
  const anchorCss = ".layout-column[data-anchor-label]{position:relative}.layout-column[data-anchor-label]::after{content:attr(data-anchor-label);position:absolute;top:8px;left:-1px;z-index:2;max-width:calc(100% - 16px);overflow:hidden;padding:2px 7px;border-radius:0 6px 6px 0;background:#dff4ff;color:#075985;font-size:10px;font-weight:800;line-height:1.25;pointer-events:none;white-space:nowrap;text-overflow:ellipsis}";
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>${escapeHtml(model.page.title)}</title><style>${googleFontImport}html,body{margin:0;min-height:100%;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}.page{min-height:100vh;padding:48px 24px;${pageBackgroundDeclaration()};box-sizing:border-box}.hero{max-width:760px;margin:0 auto}.layout-split{${layoutRule}}${columnFlex}${groupCss}${anchorCss}.nested-layout{width:100%;max-width:100%;min-width:0}.layout-column{box-sizing:border-box;width:100%;min-width:0;min-height:0;padding:8px;border-radius:12px}.layout-column.is-empty{min-height:130px}.layout-split > .layout-column:not(.layout-guide-column){background:rgba(138,180,255,.025);box-shadow:inset 0 0 0 1px rgba(138,180,255,.16)}.layout-column.is-active{background:rgba(37,99,235,.04)}.layout-column.is-column-selected{background:rgba(37,99,235,.12);outline:3px solid #2563eb;outline-offset:4px}.layout-guide-column{position:relative;display:flex;flex-direction:column;outline:2px dashed #8ab4ff;outline-offset:4px;background:rgba(138,180,255,.07)}.layout-guide-column.is-column-selected{outline:3px solid #2563eb;outline-offset:4px;background:rgba(37,99,235,.12)}.layout-guide-column::before{content:attr(data-layout-label);position:absolute;top:-13px;left:8px;padding:2px 6px;border-radius:999px;background:#e8f0ff;color:#2563eb;font-size:10px;font-weight:700;line-height:1.2;pointer-events:none}.empty-column{display:grid;height:100%;min-height:110px;box-sizing:border-box;place-items:center;border:2px dashed #b9d0ff;border-radius:12px;color:#6b86b5;font-size:13px}.column-add-zone{flex:1;min-height:110px;margin-top:8px}.layout-guide-column > .empty-column:not(.column-add-zone){border-color:transparent;background:transparent}.text-element{box-sizing:border-box;max-width:100%;white-space:pre-wrap;overflow-wrap:anywhere;word-break:break-word;cursor:pointer;transition:outline .15s ease,filter .2s ease;}.text-element:hover{outline:2px solid #8ab4ff;outline-offset:5px}.text-element.is-selected{outline:3px solid #111827;outline-offset:6px}.text-element.is-selected-2{outline-color:#2563eb}.text-element.is-selected-3{outline-color:#7c3aed}.text-element[contenteditable="true"]{outline:3px solid #2563eb;outline-offset:6px;cursor:text}</style></head><body>${generatedHtml({ inlineStyles: true, preview: true })}<script>document.querySelectorAll('.text-element').forEach((element)=>{let clickTimer;element.addEventListener('click',(event)=>{if(element.classList.contains('button-element'))event.preventDefault();event.stopPropagation();clearTimeout(clickTimer);clickTimer=setTimeout(()=>parent.postMessage({type:'select',id:element.dataset.elementId,column:element.closest('.layout-column')?.dataset.columnId,groupId:element.closest('.layout-column')?.dataset.groupId,shift:event.shiftKey},'*'),220)});element.addEventListener('dblclick',(event)=>{if(element.dataset.editable!=='true')return;event.stopPropagation();clearTimeout(clickTimer);element.dataset.originalText=element.innerText;element.contentEditable='true';element.focus();const range=document.caretRangeFromPoint?.(event.clientX,event.clientY);const selection=window.getSelection();if(range&&element.contains(range.startContainer)){selection.removeAllRanges();selection.addRange(range)}else{const fallback=document.createRange();fallback.selectNodeContents(element);fallback.collapse(false);selection.removeAllRanges();selection.addRange(fallback)}parent.postMessage({type:'edit-start',id:element.dataset.elementId},'*')});element.addEventListener('input',()=>parent.postMessage({type:'edit-content',id:element.dataset.elementId,content:element.innerText},'*'));element.addEventListener('keydown',(event)=>{if(event.key==='Escape'){element.innerText=element.dataset.originalText||element.innerText;element.blur()}});element.addEventListener('blur',()=>{element.contentEditable='false';parent.postMessage({type:'edit-end',id:element.dataset.elementId},'*')})});document.querySelectorAll('.layout-column').forEach((column)=>column.addEventListener('click',(event)=>{if(event.target===column||event.target.classList.contains('empty-column')){event.stopPropagation();parent.postMessage({type:'select-column',column:column.dataset.columnId,groupId:column.dataset.groupId,shift:event.shiftKey},'*')}}));document.querySelectorAll('.text-element,.layout-column').forEach((target)=>target.addEventListener('contextmenu',(event)=>{event.preventDefault();const element=event.target.closest('.text-element');parent.postMessage({type:'context-menu',id:element?.dataset.elementId,column:target.closest('.layout-column')?.dataset.columnId,groupId:target.closest('.layout-column')?.dataset.groupId,x:event.clientX,y:event.clientY},'*')}));window.addEventListener('scroll',()=>parent.postMessage({type:'preview-scroll',top:window.scrollY},'*'));document.body.addEventListener('click',()=>parent.postMessage({type:'clear-selection'},'*'));window.addEventListener('message',(event)=>{if(event.data?.type==='restore-scroll'){window.scrollTo(0,Math.max(0,Number(event.data.top)||0));}if(event.data?.type==='focus'){const target=document.getElementById(event.data.id);if(target){target.scrollIntoView({block:'center',behavior:'smooth'});target.animate([{filter:'brightness(1.12)'},{filter:'brightness(1)'}],{duration:450});}}});<\/script></body></html>`;
}

function syncControls() {
  const element = selectedElement();
  const s = element.style;
  const count = selectionCount();
  const columnCount = model.selectedColumns.length;
  const layoutActive = !model.selectedBackground && (count === 0 || count > 1);
  const activeGroup = model.groups.find((group) => group.id === model.selectedGroupId);
  const editorType = model.selectedBackground ? "background" : count === 1 && element.type === "image" ? "image" : count === 1 && element.type === "separator" ? "separator" : count === 1 && element.type === "button" ? "button" : count === 1 ? "text" : "layout";
  const editorTitle = { background: "背景の道具箱", image: "画像の道具箱", separator: "区切り線の道具箱", button: "ボタンの道具箱", text: element.type === "body" ? "本文の道具箱" : "見出しの道具箱", layout: "レイアウトの道具箱" }[editorType];
  document.querySelector("#edit-heading").textContent = editorTitle;
  document.querySelector("#edit-subheading").textContent = editorType === "background" ? "ページ全体の背景に必要な道具だけ表示します。" : editorType === "image" ? "画像に必要な道具だけ表示します。" : editorType === "separator" ? "区切り線に必要な道具だけ表示します。" : editorType === "button" ? "ボタンに必要な道具だけ表示します。" : editorType === "text" ? "文字に必要な道具だけ表示します。" : "選択中の場所に必要な道具だけ表示します。";
  document.querySelectorAll("[data-collapsible]").forEach((section) => section.setAttribute("aria-expanded", String(!collapsedSections.has(section.id))));
  pageBackground.value = model.page.backgroundColor;
  backgroundSize.value = model.page.backgroundSize;
  backgroundPosition.value = model.page.backgroundPosition;
  undoButton.disabled = history.length === 0;
  deleteSection.hidden = count === 0;
  deleteButton.textContent = count > 1 ? `🗑 選択した${count}個を削除` : "🗑 このパーツを削除";
  layoutTools.hidden = !layoutActive;
  document.querySelectorAll(".right-panel > .customize-section[data-editor]").forEach((section) => { section.hidden = layoutActive || !section.dataset.editor.split(/\s+/).includes(editorType); });
  document.querySelector("#layout-selection-count").textContent = columnCount > 1 ? `レイアウトの場所を${columnCount}つ選択中` : columnCount === 1 ? "選択中の場所" : count > 1 ? `${count}個選択中` : "ページの並び方";
  document.querySelector("#layout-help").textContent = columnCount > 1 ? "選んだ場所に、横長の段を追加できます。" : columnCount === 1 ? "この場所を左右・上下に分けられます。" : count > 1 ? "選んだパーツを、ひとつのまとまりとして並べます。" : "空白を選んで、パーツの並び方を決めます。点線は編集用の目印です。";
  document.querySelector("#layout-gap-field").hidden = activeGroup ? activeGroup.columns.length < 2 : model.columns.length < 2;
  layoutGap.value = activeGroup ? activeGroup.gap : model.layoutGap;
  layoutGapValue.value = `${layoutGap.value}px`;
  const selectedRatio = selectedLayoutRatio();
  const ratioEnabled = !hasSelection() && model.selectedColumns.length <= 1 && selectedRatio !== null;
  const config = selectedLayoutConfig();
  const widthEnabled = ratioEnabled && config.direction === "row";
  const heightEnabled = false;
  layoutWidth.disabled = !widthEnabled;
  layoutHeight.disabled = !heightEnabled;
  layoutWidth.setAttribute("aria-disabled", String(!widthEnabled));
  layoutHeight.setAttribute("aria-disabled", String(!heightEnabled));
  layoutWidthField.classList.toggle("is-disabled", !widthEnabled);
  layoutHeightField.classList.toggle("is-disabled", !heightEnabled);
  document.querySelector("#layout-dimension-note").textContent = !ratioEnabled
    ? (hasSelection() ? "パーツを選択中です。カラムを選ぶと幅を調整できます。" : "1カラム、または複数選択中のため幅調整は使えません。")
    : config.direction === "row" ? "左右分割なので、横幅だけ調整できます。"
      : "上下分割の高さは、文字量と中身に合わせて自動で決まります。";
  layoutWidth.value = selectedRatio ?? 50;
  layoutWidthValue.value = selectedRatio === null ? "" : `${selectedRatio}%`;
  layoutHeight.value = selectedRatio ?? 50;
  layoutHeightValue.value = selectedRatio === null ? "" : `${selectedRatio}%`;
  const selectedAnchor = anchorFor(model.selectedGroupId, model.selectedColumn);
  layoutAnchorName.value = selectedAnchor?.name || "";
  layoutAnchorName.disabled = columnCount > 1 || count > 0;
  saveLayoutAnchor.disabled = columnCount > 1 || count > 0;
  document.querySelectorAll("[data-layout-action]").forEach((button) => {
    const action = button.dataset.layoutAction;
    button.textContent = count > 1 && action === "row" ? "↔ 左右に並べる" : count > 1 && action === "column" ? "↕ 上下に並べる" : action === "row" ? "↔ 左右に分ける" : action === "column" ? "↕ 上下に分ける" : "＋ ひとつに戻す";
    button.hidden = action === "merge" ? model.columns.length < 2 : false;
  });
  bodyTools.hidden = element.type !== "body";
  buttonTools.hidden = editorType !== "button";
  document.querySelector("#basic-tools").classList.toggle("is-button-mode", editorType === "button");
  document.querySelectorAll("[data-body-format]").forEach((button) => button.setAttribute("aria-pressed", String((element.format || "plain") === button.dataset.bodyFormat)));
  controls.content.value = element.content;
  controls.textColor.value = s.color;
  controls.backgroundNone.checked = s.backgroundColor === "transparent";
  controls.backgroundColor.disabled = controls.backgroundNone.checked;
  controls.backgroundColor.value = controls.backgroundNone.checked ? "#ffffff" : s.backgroundColor;
  controls.fontSize.value = s.fontSize;
  controls.fontSizeValue.value = `${s.fontSize}px`;
  controls.fontFamily.value = s.fontFamily || "system";
  controls.fontWeight.value = String(s.fontWeight || 400);
  controls.lineHeight.value = s.lineHeight;
  controls.lineHeightValue.value = s.lineHeight;
  controls.padding.value = s.padding;
  controls.paddingValue.value = `${s.padding}px`;
  controls.margin.value = s.margin;
  controls.marginValue.value = `${s.margin}px`;
  controls.width.value = s.width;
  controls.widthValue.value = `${s.width}%`;
  controls.borderWidth.value = s.borderWidth;
  controls.borderColor.value = s.borderColor;
  controls.radius.value = s.borderRadius;
  controls.radiusValue.value = `${s.borderRadius}px`;
  document.querySelectorAll("[data-decoration]").forEach((button) => {
    const [key, value] = button.dataset.decoration.split(":");
    button.setAttribute("aria-pressed", String(s[key] === value));
  });
  document.querySelectorAll("[data-preset]").forEach((button) => button.classList.toggle("is-applied", button.dataset.preset === model.activePreset));
  document.querySelectorAll("[data-align]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.align === s.textAlign)));
  document.querySelectorAll("[data-valign]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.valign === (s.verticalAlign || "top"))));
  imageAlt.value = element.type === "image" ? element.alt : "";
  imageWidth.value = element.type === "image" ? element.style.width : 100;
  imageWidthValue.value = element.type === "image" ? `${element.style.width}%` : "";
  imageMargin.value = element.type === "image" ? element.style.margin : 0;
  imageMarginValue.value = element.type === "image" ? `${element.style.margin}px` : "";
  imageRadius.value = element.type === "image" ? element.style.borderRadius : 0;
  imageRadiusValue.value = element.type === "image" ? `${element.style.borderRadius}px` : "";
  imageBorderWidth.value = element.type === "image" ? element.style.borderWidth : 0;
  imageBorderColor.value = element.type === "image" ? element.style.borderColor : "#b9d0ff";
  separatorWidth.value = element.type === "separator" ? element.style.width : 88;
  separatorWidthValue.value = element.type === "separator" ? `${element.style.width}%` : "";
  separatorThickness.value = element.type === "separator" ? element.style.borderWidth : 1;
  separatorColor.value = element.type === "separator" ? element.style.borderColor : "#b9d0ff";
  separatorStyle.value = element.type === "separator" ? element.style.borderStyle : "solid";
  imageOffsetX.value = element.type === "image" ? (element.style.offsetX || 0) : 0;
  imageOffsetXValue.value = element.type === "image" ? `${element.style.offsetX || 0}px` : "";
  imageOffsetY.value = element.type === "image" ? (element.style.offsetY || 0) : 0;
  imageOffsetYValue.value = element.type === "image" ? `${element.style.offsetY || 0}px` : "";
  document.querySelectorAll("[data-image-position]").forEach((button) => button.setAttribute("aria-pressed", String(element.type === "image" && (element.style.imagePosition || "center") === button.dataset.imagePosition)));
  const isButton = element.type === "button";
  buttonLabel.value = isButton ? element.content : "";
  buttonLinkType.value = isButton ? (element.linkType || "url") : "url";
  buttonUrl.value = isButton && element.linkType !== "anchor" ? (element.url || "") : "";
  buttonTargetBlank.checked = isButton && element.target === "blank";
  buttonTextColor.value = isButton ? element.style.color : "#ffffff";
  buttonFontFamily.value = isButton ? (element.style.fontFamily || "system") : "system";
  buttonFontWeight.value = isButton ? String(element.style.fontWeight || 700) : "700";
  buttonBackgroundColor.value = isButton ? element.style.backgroundColor : "#2563eb";
  buttonWidth.value = isButton ? element.style.width : 88;
  buttonWidthValue.value = isButton ? `${element.style.width}%` : "";
  buttonHeight.value = isButton ? (element.style.height || 48) : 48;
  buttonHeightValue.value = isButton ? `${element.style.height || 48}px` : "";
  buttonRadius.value = isButton ? element.style.borderRadius : 12;
  buttonRadiusValue.value = isButton ? `${element.style.borderRadius}px` : "";
  buttonBorderWidth.value = isButton ? element.style.borderWidth : 0;
  buttonBorderColor.value = isButton ? element.style.borderColor : "#2563eb";
  buttonUrlField.hidden = !isButton || buttonLinkType.value === "anchor";
  buttonAnchorField.hidden = !isButton || buttonLinkType.value !== "anchor";
  buttonAnchor.replaceChildren(new Option("場所を選択", ""), ...((model.page.anchors || []).map((anchor) => new Option(anchor.name, anchor.id))));
  buttonAnchor.value = isButton ? (element.anchorId || "") : "";
  document.querySelectorAll("[data-button-align]").forEach((button) => button.setAttribute("aria-pressed", String(isButton && (element.style.buttonAlign || "center") === button.dataset.buttonAlign)));
}

function render() {
  const documentScroller = document.scrollingElement;
  const pageScrollTop = documentScroller?.scrollTop || 0;
  const rightPanel = document.querySelector(".right-panel");
  const rightPanelScrollTop = rightPanel?.scrollTop || 0;
  syncControls();
  frame.srcdoc = previewDocument();
  const selectionLabel = hasSelection()
    ? selectedElement().type === "body" ? "本文" : selectedElement().type === "image" ? "画像" : selectedElement().type === "separator" ? "区切り線" : selectedElement().type === "button" ? "ボタン" : "見出し"
    : "レイアウト";
  document.querySelector("#selection-status").textContent = selectionCount() > 1 ? `${selectionCount()}個のパーツを選択中` : `${selectionLabel}を選択中`;
  document.querySelector("#footer-element-count").textContent = model.elements.length;
  document.querySelector("#footer-selection").textContent = selectionCount() > 1 ? `${selectionCount()}個のパーツ` : hasSelection() ? (selectedElement().type === "body" ? "本文" : selectedElement().type === "image" ? "画像" : selectedElement().type === "separator" ? "区切り線" : selectedElement().type === "button" ? "ボタン" : "見出し") : "レイアウト";
  requestAnimationFrame(() => {
    if (documentScroller) documentScroller.scrollTop = pageScrollTop;
    if (rightPanel) rightPanel.scrollTop = rightPanelScrollTop;
  });
}

frame.addEventListener("load", () => {
  const id = selectionCount() === 1 ? model.selectedIds[0] : null;
  if (id) frame.contentWindow?.postMessage({ type: "focus", id }, "*");
  else frame.contentWindow?.postMessage({ type: "restore-scroll", top: pendingPreviewScrollTop }, "*");
  frame.contentDocument?.addEventListener("keydown", handleUndoShortcut, true);
});

const basePreviewDocument = previewDocument;
const previewDragScript = `
(function(){
  var style=document.createElement('style');
  style.textContent='.button-element{display:block;background-color:#2563eb;color:#ffffff;text-decoration:none}.text-element{cursor:grab}.text-element.is-dragging{opacity:.35}.layout-column.is-drag-target{outline:3px solid #2563eb;outline-offset:-5px;background:rgba(37,99,235,.1)!important}.layout-column.is-drag-target::after{content:"ここに追加";display:grid;min-height:44px;margin:8px;border:2px dashed #2563eb;border-radius:10px;place-items:center;color:#2563eb;font-size:12px;font-weight:800;background:rgba(255,255,255,.72)}.text-element.is-drag-before{box-shadow:inset 0 4px 0 #2563eb!important}.text-element.is-drag-after{box-shadow:inset 0 -4px 0 #2563eb!important}.layout-column.is-drag-target:has(.is-drag-before)::after,.layout-column.is-drag-target:has(.is-drag-after)::after{display:none}';
  document.head.appendChild(style);
  var dragging=null;
  function clearDrag(){
    document.querySelectorAll('.is-drag-target,.is-drag-before,.is-drag-after,.is-dragging').forEach(function(node){node.classList.remove('is-drag-target','is-drag-before','is-drag-after','is-dragging')});
    document.querySelectorAll('.layout-column').forEach(function(column){delete column.dataset.dragReference;delete column.dataset.dragBefore});
    dragging=null;
    parent.postMessage({type:'drag-status',message:''},'*');
  }
  document.querySelectorAll('.text-element').forEach(function(element){
    element.draggable=true;
    element.addEventListener('dragstart',function(event){
      dragging={id:element.dataset.elementId};
      element.classList.add('is-dragging');
      event.dataTransfer.effectAllowed='move';
      event.dataTransfer.setData('text/plain',element.dataset.elementId);
      var label=element.classList.contains('image-element')?'画像':element.classList.contains('button-element')?'ボタン':element.classList.contains('body-element')?'本文':'見出し';
      parent.postMessage({type:'drag-status',message:label+'を移動中'},'*');
    });
    element.addEventListener('dragend',clearDrag);
  });
  document.querySelectorAll('.layout-column').forEach(function(column){
    column.addEventListener('dragover',function(event){
      if(!dragging)return;
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect='move';
      document.querySelectorAll('.is-drag-target,.is-drag-before,.is-drag-after').forEach(function(node){node.classList.remove('is-drag-target','is-drag-before','is-drag-after')});
      var target=event.target.closest('.text-element');
      var sameColumn=target&&target.closest('.layout-column')===column;
      column.classList.add('is-drag-target');
      if(sameColumn&&target.dataset.elementId!==dragging.id){
        var before=event.clientY<target.getBoundingClientRect().top+target.getBoundingClientRect().height/2;
        target.classList.add(before?'is-drag-before':'is-drag-after');
        column.dataset.dragReference=target.dataset.elementId;
        column.dataset.dragBefore=String(before);
      }else{delete column.dataset.dragReference;delete column.dataset.dragBefore}
    });
    column.addEventListener('dragleave',function(event){if(!column.contains(event.relatedTarget)){column.classList.remove('is-drag-target');delete column.dataset.dragReference;delete column.dataset.dragBefore}});
    column.addEventListener('drop',function(event){
      if(!dragging)return;
      event.preventDefault();
      event.stopPropagation();
      parent.postMessage({type:'move-element',id:dragging.id,groupId:column.dataset.groupId||null,column:column.dataset.columnId,referenceId:column.dataset.dragReference||null,insertBefore:column.dataset.dragBefore==='true'},'*');
      clearDrag();
    });
  });
})();
`;
previewDocument = () => basePreviewDocument().replace("</script></body></html>", `${previewDragScript}</script></body></html>`);

function updateStyle(key, value) {
  if (!hasSelection()) return;
  pushHistory();
  selectedElement().style[key] = value;
  render();
}

function moveElementTo(elementId, targetGroupId, targetColumn, referenceId, insertBefore) {
  const element = model.elements.find((candidate) => candidate.id === elementId);
  const targetGroup = targetGroupId ? model.groups.find((group) => group.id === targetGroupId) : null;
  if (!element || (targetGroupId && !targetGroup)) return;
  if (element.groupId === (targetGroupId || null) && element.column === targetColumn && (!referenceId || referenceId === elementId)) return;
  pushHistory();
  model.groups.forEach((group) => { group.elementIds = group.elementIds.filter((id) => id !== elementId); });
  element.groupId = targetGroupId || null;
  element.column = targetColumn;
  if (targetGroup) {
    const referenceIndex = referenceId ? targetGroup.elementIds.indexOf(referenceId) : -1;
    const insertIndex = referenceIndex < 0 ? targetGroup.elementIds.length : referenceIndex + (insertBefore ? 0 : 1);
    targetGroup.elementIds.splice(insertIndex, 0, elementId);
  } else {
    const elements = model.elements.filter((candidate) => candidate.id !== elementId);
    const referenceIndex = referenceId ? elements.findIndex((candidate) => candidate.id === referenceId) : -1;
    const insertIndex = referenceIndex < 0 ? elements.length : referenceIndex + (insertBefore ? 0 : 1);
    elements.splice(insertIndex, 0, element);
    model.elements = elements;
  }
  model.selectedIds = [elementId];
  model.selectedGroupId = targetGroupId || null;
  model.selectedColumn = targetColumn;
  model.selectedColumns = [];
  render();
}

function setupPreviewDragAndDrop() {
  const doc = frame.contentDocument;
  if (!doc || doc.documentElement.dataset.dragReady === "true") return;
  doc.documentElement.dataset.dragReady = "true";
  const dragStyle = doc.createElement("style");
  dragStyle.textContent = ".text-element{cursor:grab}.text-element.is-dragging{opacity:.35}.layout-column.is-drag-target{outline:3px solid #2563eb;outline-offset:-5px;background:rgba(37,99,235,.1)!important}.layout-column.is-drag-target::after{content:'ここに追加';display:grid;min-height:44px;margin:8px;border:2px dashed #2563eb;border-radius:10px;place-items:center;color:#2563eb;font-size:12px;font-weight:800;background:rgba(255,255,255,.72)}.text-element.is-drag-before{box-shadow:inset 0 4px 0 #2563eb!important}.text-element.is-drag-after{box-shadow:inset 0 -4px 0 #2563eb!important}.layout-column.is-drag-target:has(.is-drag-before)::after,.layout-column.is-drag-target:has(.is-drag-after)::after{display:none}";
  doc.head.appendChild(dragStyle);
  let drag = null;
  const clearPreview = (rerender = false) => {
    doc.querySelectorAll(".is-drag-target,.is-drag-before,.is-drag-after,.is-dragging").forEach((node) => node.classList.remove("is-drag-target", "is-drag-before", "is-drag-after", "is-dragging"));
    doc.querySelectorAll(".layout-column").forEach((column) => { delete column.dataset.dragReference; delete column.dataset.dragBefore; });
    drag = null;
    if (rerender) render();
  };
  doc.querySelectorAll(".text-element").forEach((element) => {
    element.draggable = true;
    element.addEventListener("dragstart", (event) => {
      drag = { id: element.dataset.elementId };
      element.classList.add("is-dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", element.dataset.elementId);
      const label = element.classList.contains("image-element") ? "画像" : element.classList.contains("button-element") ? "ボタン" : element.classList.contains("body-element") ? "本文" : "見出し";
      document.querySelector("#selection-status").textContent = `${label}を移動中`;
    });
    element.addEventListener("dragend", () => clearPreview(true));
  });
  doc.querySelectorAll(".layout-column").forEach((column) => {
    column.addEventListener("dragover", (event) => {
      if (!drag) return;
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = "move";
      doc.querySelectorAll(".is-drag-target,.is-drag-before,.is-drag-after").forEach((node) => node.classList.remove("is-drag-target", "is-drag-before", "is-drag-after"));
      const target = event.target.closest(".text-element");
      const sameColumn = target && target.closest(".layout-column") === column;
      column.classList.add("is-drag-target");
      if (sameColumn && target.dataset.elementId !== drag.id) {
        const before = event.clientY < target.getBoundingClientRect().top + target.getBoundingClientRect().height / 2;
        target.classList.add(before ? "is-drag-before" : "is-drag-after");
        column.dataset.dragReference = target.dataset.elementId;
        column.dataset.dragBefore = String(before);
      } else {
        delete column.dataset.dragReference;
        delete column.dataset.dragBefore;
      }
    });
    column.addEventListener("dragleave", (event) => { if (!column.contains(event.relatedTarget)) { column.classList.remove("is-drag-target"); delete column.dataset.dragReference; } });
    column.addEventListener("drop", (event) => {
      if (!drag) return;
      event.preventDefault();
      event.stopPropagation();
      const elementId = drag.id;
      const targetGroupId = column.dataset.groupId || null;
      const targetColumn = column.dataset.columnId;
      const referenceId = column.dataset.dragReference || null;
      const insertBefore = column.dataset.dragBefore === "true";
      clearPreview();
      moveElementTo(elementId, targetGroupId, targetColumn, referenceId, insertBefore);
    });
  });
}

controls.content.addEventListener("input", (event) => { if (!hasSelection()) return; pushHistory(); selectedElement().content = event.target.value; render(); });
controls.textColor.addEventListener("input", (event) => updateStyle("color", event.target.value));
controls.backgroundColor.addEventListener("input", (event) => { controls.backgroundNone.checked = false; updateStyle("backgroundColor", event.target.value); });
controls.backgroundNone.addEventListener("change", (event) => updateStyle("backgroundColor", event.target.checked ? "transparent" : controls.backgroundColor.value));
controls.fontSize.addEventListener("input", (event) => updateStyle("fontSize", Number(event.target.value)));
controls.fontFamily.addEventListener("change", (event) => updateStyle("fontFamily", event.target.value));
controls.fontWeight.addEventListener("change", (event) => updateStyle("fontWeight", Number(event.target.value)));
controls.lineHeight.addEventListener("input", (event) => updateStyle("lineHeight", Number(event.target.value)));
controls.padding.addEventListener("input", (event) => updateStyle("padding", Number(event.target.value)));
controls.margin.addEventListener("input", (event) => updateStyle("margin", Number(event.target.value)));
controls.width.addEventListener("input", (event) => updateStyle("width", Number(event.target.value)));
controls.borderWidth.addEventListener("change", (event) => updateStyle("borderWidth", Number(event.target.value)));
controls.borderColor.addEventListener("input", (event) => updateStyle("borderColor", event.target.value));
controls.radius.addEventListener("input", (event) => updateStyle("borderRadius", Number(event.target.value)));
function updateButton(change) {
  if (!hasSelection() || selectedElement().type !== "button") return;
  pushHistory();
  Object.assign(selectedElement(), change);
  render();
}
function updateButtonStyle(key, value) {
  if (!hasSelection() || selectedElement().type !== "button") return;
  pushHistory();
  selectedElement().style[key] = value;
  render();
}
buttonLabel.addEventListener("input", (event) => updateButton({ content: event.target.value }));
buttonLinkType.addEventListener("change", (event) => updateButton({ linkType: event.target.value, anchorId: event.target.value === "anchor" ? selectedElement().anchorId || "" : "" }));
buttonUrl.addEventListener("input", (event) => updateButton({ url: event.target.value, linkType: "url" }));
buttonAnchor.addEventListener("change", (event) => updateButton({ anchorId: event.target.value, linkType: "anchor" }));
buttonTargetBlank.addEventListener("change", (event) => updateButton({ target: event.target.checked ? "blank" : "same" }));
buttonTextColor.addEventListener("input", (event) => updateButtonStyle("color", event.target.value));
buttonFontFamily.addEventListener("change", (event) => updateButtonStyle("fontFamily", event.target.value));
buttonFontWeight.addEventListener("change", (event) => updateButtonStyle("fontWeight", Number(event.target.value)));
buttonBackgroundColor.addEventListener("input", (event) => updateButtonStyle("backgroundColor", event.target.value));
buttonWidth.addEventListener("input", (event) => updateButtonStyle("width", Number(event.target.value)));
buttonHeight.addEventListener("input", (event) => updateButtonStyle("height", Number(event.target.value)));
buttonRadius.addEventListener("input", (event) => updateButtonStyle("borderRadius", Number(event.target.value)));
buttonBorderWidth.addEventListener("change", (event) => updateButtonStyle("borderWidth", Number(event.target.value)));
buttonBorderColor.addEventListener("input", (event) => updateButtonStyle("borderColor", event.target.value));
document.querySelectorAll("[data-button-align]").forEach((button) => button.addEventListener("click", () => updateButtonStyle("buttonAlign", button.dataset.buttonAlign)));
document.querySelectorAll("[data-align]").forEach((button) => button.addEventListener("click", () => updateStyle("textAlign", button.dataset.align)));
document.querySelectorAll("[data-valign]").forEach((button) => button.addEventListener("click", () => updateStyle("verticalAlign", button.dataset.valign)));
imageAlt.addEventListener("input", (event) => { if (hasSelection() && selectedElement().type === "image") { pushHistory(); selectedElement().alt = event.target.value; render(); } });
imageWidth.addEventListener("input", (event) => { if (hasSelection() && selectedElement().type === "image") { updateStyle("width", Number(event.target.value)); } });
imageMargin.addEventListener("input", (event) => { if (hasSelection() && selectedElement().type === "image") { updateStyle("margin", Number(event.target.value)); } });
imageRadius.addEventListener("input", (event) => { if (hasSelection() && selectedElement().type === "image") { updateStyle("borderRadius", Number(event.target.value)); } });
imageBorderWidth.addEventListener("change", (event) => { if (hasSelection() && selectedElement().type === "image") { updateStyle("borderWidth", Number(event.target.value)); } });
imageBorderColor.addEventListener("input", (event) => { if (hasSelection() && selectedElement().type === "image") { updateStyle("borderColor", event.target.value); } });
separatorWidth.addEventListener("input", (event) => { if (hasSelection() && selectedElement().type === "separator") { updateStyle("width", Number(event.target.value)); } });
separatorThickness.addEventListener("change", (event) => { if (hasSelection() && selectedElement().type === "separator") { updateStyle("borderWidth", Number(event.target.value)); } });
separatorColor.addEventListener("input", (event) => { if (hasSelection() && selectedElement().type === "separator") { updateStyle("borderColor", event.target.value); } });
separatorStyle.addEventListener("change", (event) => { if (hasSelection() && selectedElement().type === "separator") { updateStyle("borderStyle", event.target.value); } });
imageOffsetX.addEventListener("input", (event) => { if (hasSelection() && selectedElement().type === "image") { updateStyle("offsetX", Number(event.target.value)); } });
imageOffsetY.addEventListener("input", (event) => { if (hasSelection() && selectedElement().type === "image") { updateStyle("offsetY", Number(event.target.value)); } });
document.querySelectorAll("[data-image-position]").forEach((button) => button.addEventListener("click", () => {
  if (!hasSelection() || selectedElement().type !== "image") return;
  pushHistory();
  const image = selectedElement();
  image.style.imagePosition = button.dataset.imagePosition;
  image.style.offsetX = 0;
  render();
}));

const presets = {
  simple: { color: "#18222f", backgroundColor: "#ffffff", fontSize: 42, fontWeight: 700, textAlign: "left", padding: 24, margin: 0, width: 88, borderWidth: 0, borderRadius: 18, shadow: "none", depth: "none", borderStyle: "none", glow: "none" },
  soft: { color: "#334155", backgroundColor: "#eff6ff", fontSize: 40, fontWeight: 700, textAlign: "left", padding: 30, margin: 0, width: 88, borderWidth: 0, borderRadius: 24, shadow: "soft", depth: "none", borderStyle: "none", glow: "none" },
  business: { color: "#102a43", backgroundColor: "#ffffff", fontSize: 38, fontWeight: 700, textAlign: "left", padding: 20, margin: 0, width: 92, borderWidth: 2, borderRadius: 6, shadow: "none", depth: "none", borderStyle: "solid", glow: "none" },
  luxury: { color: "#f8fafc", backgroundColor: "#1e293b", fontSize: 44, fontWeight: 700, textAlign: "center", padding: 34, margin: 0, width: 88, borderWidth: 1, borderRadius: 12, shadow: "strong", depth: "none", borderStyle: "solid", glow: "none" },
  pop: { color: "#7c2d12", backgroundColor: "#fed7aa", fontSize: 46, fontWeight: 700, textAlign: "center", padding: 28, margin: 0, width: 86, borderWidth: 4, borderRadius: 30, shadow: "soft", depth: "emboss", borderStyle: "solid", glow: "none" },
};

document.querySelectorAll("[data-preset]").forEach((button) => button.addEventListener("click", () => {
  if (!hasSelection()) return;
  pushHistory();
  Object.assign(selectedElement().style, presets[button.dataset.preset]);
  model.activePreset = button.dataset.preset;
  render();
}));

document.querySelectorAll("[data-decoration]").forEach((button) => button.addEventListener("click", () => {
  const [key, value] = button.dataset.decoration.split(":");
  updateStyle(key, value);
}));

document.querySelector("#footer-source-button").addEventListener("click", () => {
  const sourceWindow = window.open("", "_blank");
  if (!sourceWindow) {
    showToast("ソースを開けませんでした。ポップアップを許可してください");
    return;
  }
  const source = `<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>0EN Builder ソース</title><style>body{margin:24px;background:#17202d;color:#dbeafe;font:14px/1.6 ui-monospace,SFMono-Regular,Consolas,monospace}h1{font:700 18px system-ui,sans-serif;color:#fff}h2{margin:24px 0 8px;font:700 14px system-ui,sans-serif;color:#93c5fd}pre{white-space:pre-wrap;overflow-wrap:anywhere}.note{color:#93c5fd;font:13px/1.5 system-ui,sans-serif}</style></head><body><h1>生成されたソース</h1><p class="note">画像は読みやすさのため、images/フォルダのファイルパスとして表示しています。</p><h2>HTML</h2><pre>${escapeHtml(generatedHtml({ source: true }))}</pre><h2>CSS</h2><pre>${escapeHtml(generatedCss({ source: true }))}</pre></body></html>`;
  sourceWindow.document.open();
  sourceWindow.document.write(source);
  sourceWindow.document.close();
});
document.querySelector("#footer-preview-button").addEventListener("click", () => {
  const previewWindow = window.open("", "_blank");
  if (!previewWindow) {
    showToast("ブラウザで開けませんでした。ポップアップを許可してください");
    return;
  }
  const output = `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(model.page.title)}</title><style>${generatedCss()}</style></head><body>${generatedHtml()}</body></html>`;
  previewWindow.document.open();
  previewWindow.document.write(output);
  previewWindow.document.close();
});

async function saveTextFile(filename, content, type = "text/plain;charset=utf-8") {
  if (window.showSaveFilePicker) {
    try {
      const handle = await window.showSaveFilePicker({ suggestedName: filename, types: [{ description: type.includes("json") ? "0ENプロジェクト" : "HTMLファイル", accept: { [type.split(";")[0]]: [filename.endsWith(".json") ? ".json" : ".html"] } }] });
      const writer = await handle.createWritable();
      await writer.write(content);
      await writer.close();
      return;
    } catch (error) {
      if (error?.name === "AbortError") return;
    }
  }
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function exportPage() {
  return exportWebPackage();
}

async function exportWebPackage() {
  if (!window.showDirectoryPicker) {
    showToast("このブラウザではHTMLと画像フォルダの書き出しに対応していません");
    return;
  }
  try {
    const parent = await window.showDirectoryPicker({ mode: "readwrite" });
    const imageElements = model.elements.filter((element) => element.type === "image" && String(element.src || "").startsWith("data:"));
    const hasBackground = String(model.page.backgroundImage || "").startsWith("data:");
    const images = imageElements.length || hasBackground ? await parent.getDirectoryHandle("images", { create: true }) : null;
    const html = `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(model.page.title)}</title><style>${generatedCss({ source: true })}</style></head><body>${generatedHtml({ source: true })}</body></html>`;
    const htmlHandle = await parent.getFileHandle(model.page.filename || "my-homepage.html", { create: true });
    const htmlWriter = await htmlHandle.createWritable();
    await htmlWriter.write(html);
    await htmlWriter.close();
    if (images) {
      for (const element of imageElements) {
        const handle = await images.getFileHandle(`${element.id}${imageExtension(element.src)}`, { create: true });
        const writer = await handle.createWritable();
        await writer.write(await (await fetch(element.src)).blob());
        await writer.close();
      }
      if (hasBackground) {
        const handle = await images.getFileHandle(`page-background${imageExtension(model.page.backgroundImage)}`, { create: true });
        const writer = await handle.createWritable();
        await writer.write(await (await fetch(model.page.backgroundImage)).blob());
        await writer.close();
      }
    }
    showToast("HTMLと画像を書き出しました");
  } catch (error) {
    if (error?.name !== "AbortError") showToast("書き出しに失敗しました");
  }
}

document.querySelector("#save-project").addEventListener("click", async () => {
  await saveTextFile(`${(model.page.filename || "my-homepage").replace(/\.html?$/i, "")}.0en.json`, JSON.stringify(snapshotModel(), null, 2), "application/json;charset=utf-8");
});
document.querySelector("#load-project").addEventListener("click", () => loadProjectFile.click());
loadProjectFile.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const saved = JSON.parse(reader.result);
      if (!saved.page || !Array.isArray(saved.elements)) throw new Error("invalid project");
      pushHistory();
      Object.assign(model, saved);
      model.page = { ...structuredClone(initialModel.page), ...saved.page };
      model.selectedBackground = false;
      document.querySelector("#app-page-title").textContent = model.page.title;
      document.querySelector("#footer-page-title").textContent = model.page.title;
      event.target.value = "";
      render();
    } catch (error) {
      showToast("プロジェクトを読み込めませんでした");
    }
  });
  reader.readAsText(file);
});
document.querySelector("#export-html").addEventListener("click", exportPage);
document.querySelector("#load-html").addEventListener("click", () => loadHtmlFile.click());
function fileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });
}

loadHtmlFile.addEventListener("change", (event) => {
  const files = [...(event.target.files || [])];
  const file = files.find((candidate) => /\.html?$/i.test(candidate.name)) || files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", async () => {
    const parsed = new DOMParser().parseFromString(reader.result, "text/html");
    const imported = [...parsed.body.querySelectorAll("h1,h2,h3,p,img,hr,a.button-element")];
    if (!imported.length) { showToast("読み込めるパーツがありませんでした"); return; }
    pushHistory();
    model.page.title = parsed.title || file.name.replace(/\.html?$/i, "");
    const imageFiles = files.filter((candidate) => candidate.type.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg)$/i.test(candidate.name));
    const missingImages = [];
    model.elements = await Promise.all(imported.map(async (node, index) => {
      const isImage = node.tagName.toLowerCase() === "img";
      const isSeparator = node.tagName.toLowerCase() === "hr";
      const isButton = node.matches("a.button-element");
      const type = isImage ? "image" : isSeparator ? "separator" : isButton ? "button" : node.tagName.toLowerCase() === "p" ? "body" : "heading";
      const baseStyle = type === "body"
        ? { color: "#334155", backgroundColor: "#ffffff", fontSize: 18, fontWeight: 400, textAlign: "left", verticalAlign: "top", lineHeight: 1.8, padding: 18, margin: 12, width: 88, borderWidth: 0, borderColor: "#b9d0ff", borderRadius: 12, shadow: "none", depth: "none", borderStyle: "none", glow: "none" }
        : type === "image"
          ? { color: "#18222f", backgroundColor: "transparent", fontSize: 16, fontWeight: 400, textAlign: "left", lineHeight: 1.4, padding: 0, margin: 16, width: 88, borderWidth: 0, borderColor: "#b9d0ff", borderRadius: 12, imagePosition: "center", objectFit: "contain", offsetX: 0, offsetY: 0, shadow: "none", depth: "none", borderStyle: "none", glow: "none" }
          : type === "button"
            ? { color: "#ffffff", backgroundColor: "#2563eb", fontSize: 16, fontWeight: 700, textAlign: "center", verticalAlign: "center", lineHeight: 1.4, padding: 12, margin: 12, width: 48, height: 48, borderWidth: 0, borderColor: "#1d4ed8", borderRadius: 12, buttonAlign: "center", shadow: "soft", depth: "none", borderStyle: "solid", glow: "none" }
          : structuredClone(initialModel.elements[0].style);
      let src = isImage ? node.getAttribute("src") || "" : undefined;
      if (isImage && src && !src.startsWith("data:")) {
        const filename = decodeURIComponent(src.split(/[?#]/)[0].split("/").pop() || "").toLowerCase();
        const imageFile = imageFiles.find((candidate) => candidate.name.toLowerCase() === filename);
        if (imageFile) src = await fileAsDataUrl(imageFile);
        else { src = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="; missingImages.push(filename || "画像"); }
      }
      if (isImage && !src) src = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
      return { id: `${type}-${index + 1}`, type, column: "left", content: isImage || isSeparator ? "" : node.textContent || "", src, alt: isImage ? node.getAttribute("alt") || "" : undefined, url: isButton ? node.getAttribute("href") || "" : undefined, linkType: isButton && (node.getAttribute("href") || "").startsWith("#") ? "anchor" : "url", anchorId: isButton && (node.getAttribute("href") || "").startsWith("#") ? (node.getAttribute("href") || "").slice(1) : "", target: isButton && node.getAttribute("target") === "_blank" ? "blank" : "same", style: { ...baseStyle, ...(isSeparator ? { height: 0, padding: 0, borderWidth: 1, borderStyle: "solid" } : {}) } };
    }));
    model.groups = [];
    model.columns = ["left"];
    model.layout = "single";
    model.layoutDirection = "row";
    model.layoutRatios = [1];
    model.selectedIds = [model.elements[0].id];
    model.selectedBackground = false;
    document.querySelector("#app-page-title").textContent = model.page.title;
    document.querySelector("#footer-page-title").textContent = model.page.title;
    event.target.value = "";
    if (missingImages.length) showToast(`画像 ${missingImages.length}件は見つかりませんでした。書き出したページフォルダを選択してください`);
    render();
  });
  reader.readAsText(file);
});
document.querySelector("#page-menu-toggle").addEventListener("click", (event) => {
  const open = pageSettings.hidden;
  pageSettings.hidden = !open;
  event.currentTarget.setAttribute("aria-expanded", String(open));
});
pageBackground.addEventListener("input", (event) => { pushHistory(); model.page.backgroundColor = event.target.value; render(); });
document.querySelectorAll("[data-page-background]").forEach((button) => button.addEventListener("click", () => { pushHistory(); model.page.backgroundColor = button.dataset.pageBackground; render(); }));
backgroundSize.addEventListener("change", (event) => { if (!model.selectedBackground) return; pushHistory(); model.page.backgroundSize = event.target.value; render(); });
backgroundPosition.addEventListener("change", (event) => { if (!model.selectedBackground) return; pushHistory(); model.page.backgroundPosition = event.target.value; render(); });
backgroundFile.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file || !model.selectedBackground) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => { pushHistory(); model.page.backgroundImage = reader.result; event.target.value = ""; render(); });
  reader.addEventListener("error", () => showToast("背景画像を読み込めませんでした"));
  reader.readAsDataURL(file);
});
layoutGap.addEventListener("input", (event) => { if (model.selectedGroupId) { const group = model.groups.find((candidate) => candidate.id === model.selectedGroupId); if (group) group.gap = Number(event.target.value); } else model.layoutGap = Number(event.target.value); render(); });
layoutWidth.addEventListener("input", (event) => { if (selectedLayoutConfig().direction === "row") updateSelectedLayoutRatio(event.target.value); });
layoutHeight.addEventListener("input", (event) => { if (selectedLayoutConfig().direction === "column") updateSelectedLayoutRatio(event.target.value); });
saveLayoutAnchor.addEventListener("click", () => {
  if (model.selectedColumns.length > 1 || hasSelection()) return;
  const name = layoutAnchorName.value.trim();
  const groupId = model.selectedGroupId || null;
  const column = model.selectedColumn;
  if (!name || !column) return;
  const anchors = model.page.anchors || (model.page.anchors = []);
  const existing = anchorFor(groupId, column);
  const duplicate = anchors.find((anchor) => anchor.name === name && anchor.id !== existing?.id);
  if (duplicate) { showToast("同じ名前がすでにあります"); return; }
  pushHistory();
  if (existing) existing.name = name;
  else anchors.push({ id: `anchor-${anchors.length + 1}`, name, groupId, column });
  render();
});

function applyLayout(direction) {
  const ids = model.selectedIds.filter((id) => model.elements.some((element) => element.id === id));
  pushHistory();
  model.layoutDirection = direction;
  if (ids.length > 1) {
    model.columns = ids.map((_, index) => `column-${index + 1}`);
    model.elements.forEach((element) => { element.column = ids.includes(element.id) ? model.columns[ids.indexOf(element.id)] : model.columns[0]; });
    model.selectedColumn = model.columns[0];
  } else {
    model.columns = ["column-1", "column-2"];
    model.elements.forEach((element) => { element.column = "column-1"; });
    model.selectedColumn = "column-2";
    model.selectedIds = [];
  }
  model.layoutRatios = model.columns.map(() => 1);
  model.layout = "split";
  render();
}

function addRootRowBelow() {
  const oldColumns = [...model.columns];
  const oldDirection = model.layoutDirection;
  const oldRatios = [...model.layoutRatios];
  const groupId = `layout-group-${model.groups.length + 1}`;
  const groupColumns = oldColumns.map((_, index) => `${groupId}-column-${index + 1}`);
  const directElements = model.elements.filter((element) => !element.groupId);
  const directGroups = model.groups.filter((group) => !group.parentGroupId);
  const rootColumn = "column-1";
  const topGroup = { id: groupId, parentGroupId: null, parentColumn: rootColumn, direction: oldDirection, ratios: oldRatios, gap: model.layoutGap, columns: groupColumns, elementIds: directElements.map((element) => element.id) };
  directElements.forEach((element) => {
    const index = Math.max(0, oldColumns.indexOf(element.column || oldColumns[0]));
    element.groupId = groupId;
    element.column = groupColumns[index] || groupColumns[0];
  });
  directGroups.forEach((group) => {
    const index = Math.max(0, oldColumns.indexOf(group.parentColumn || oldColumns[0]));
    group.parentGroupId = groupId;
    group.parentColumn = groupColumns[index] || groupColumns[0];
  });
  model.groups.push(topGroup);
  model.layout = "split";
  model.layoutDirection = "column";
  model.columns = [rootColumn, "column-2"];
  model.layoutRatios = [1, 1];
  model.selectedIds = [];
  model.selectedColumns = [];
  model.selectedGroupId = null;
  model.selectedColumn = "column-2";
}

function addLayoutArea(direction) {
  pushHistory();
  if (direction === "column" && !model.selectedGroupId && model.selectedColumns.length > 1) {
    const rootKeys = new Set(model.columns.map((column) => columnSelectionKey(null, column)));
    const selectedKeys = new Set(model.selectedColumns);
    if (selectedKeys.size === rootKeys.size && [...rootKeys].every((key) => selectedKeys.has(key))) {
      addRootRowBelow();
      render();
      return;
    }
  }
  if (direction === "column" && model.selectedGroupId) {
    const selectedGroup = model.groups.find((group) => group.id === model.selectedGroupId);
    if (selectedGroup) {
      const wrapperId = `layout-group-${model.groups.length + 1}`;
      const wrapperColumns = [`${wrapperId}-column-1`, `${wrapperId}-column-2`];
      const wrapper = {
        id: wrapperId,
        parentGroupId: selectedGroup.parentGroupId || null,
        parentColumn: selectedGroup.parentColumn,
        direction: "column",
        ratios: [1, 1],
        gap: model.layoutGap,
        columns: wrapperColumns,
        elementIds: [],
      };
      selectedGroup.parentGroupId = wrapperId;
      selectedGroup.parentColumn = wrapperColumns[0];
      model.groups.push(wrapper);
      model.selectedGroupId = wrapperId;
      model.selectedColumn = wrapperColumns[1];
      model.selectedIds = [];
      render();
      return;
    }
  }
  const hasColumnTarget = Boolean(model.selectedGroupId) || model.columns.length > 1;
  if (hasColumnTarget) {
    const parentGroupId = model.selectedGroupId || null;
    const parentColumn = model.selectedColumn || model.columns[0];
    const groupId = `layout-group-${model.groups.length + 1}`;
    const columns = [`${groupId}-column-1`, `${groupId}-column-2`];
    const childElements = model.elements.filter((element) => (element.groupId || null) === parentGroupId && element.column === parentColumn);
    const childGroups = model.groups.filter((group) => (group.parentGroupId || null) === parentGroupId && group.parentColumn === parentColumn);
    model.groups.push({ id: groupId, parentGroupId, parentColumn, direction, ratios: [1, 1], gap: model.layoutGap, columns, elementIds: childElements.map((element) => element.id) });
    childElements.forEach((element) => { element.groupId = groupId; element.column = columns[0]; });
    childGroups.forEach((group) => { group.parentGroupId = groupId; group.parentColumn = columns[0]; });
    model.selectedIds = [];
    model.selectedGroupId = groupId;
    model.selectedColumn = columns[0];
    render();
    return;
  }
  const newColumn = model.selectedGroupId
    ? `${model.selectedGroupId}-column-${Date.now()}`
    : `column-${model.columns.length + 1}`;
  if (model.selectedGroupId) {
    const group = model.groups.find((candidate) => candidate.id === model.selectedGroupId);
    if (!group) return;
    group.direction = direction;
    group.columns.push(newColumn);
    group.ratios = group.columns.map(() => 1);
    model.selectedColumn = newColumn;
  } else {
    model.layoutDirection = direction;
    model.columns.push(newColumn);
    model.layoutRatios = model.columns.map(() => 1);
    model.layout = "split";
    model.selectedColumn = newColumn;
  }
  render();
}

function applyLayoutTemplate(template) {
  if (template === "single") {
    mergeLayout();
    return;
  }
  if (template === "add-horizontal") {
    addLayoutArea("row");
    return;
  }
  if (template === "add-vertical") {
    addLayoutArea("column");
    return;
  }
  const templates = {
    two: { direction: "row", ratios: [1, 1] },
    "wide-left": { direction: "row", ratios: [1.8, 1] },
    "wide-right": { direction: "row", ratios: [1, 1.8] },
    three: { direction: "row", ratios: [1, 1, 1] },
  };
  const selected = model.selectedIds.filter((id) => model.elements.some((element) => element.id === id));
  pushHistory();
  const config = templates[template] || templates.two;
  // A selected column inside an existing layout is a container target. Split
  // that column by nesting a new group inside it; changing the owning group
  // here would incorrectly replace the whole parent layout (for example,
  // turning an upper/lower layout into a left/right layout).
  if (selected.length === 0 && (model.selectedGroupId || model.columns.length > 1)) {
    const parentGroupId = model.selectedGroupId || null;
    const parentColumn = model.selectedColumn || model.columns[0];
    const groupId = `layout-group-${model.groups.length + 1}`;
    const columns = config.ratios.map((_, index) => `${groupId}-column-${index + 1}`);
    const childElements = model.elements.filter((element) => (element.groupId || null) === parentGroupId && element.column === parentColumn);
    const childGroups = model.groups.filter((group) => (group.parentGroupId || null) === parentGroupId && group.parentColumn === parentColumn);
    model.groups.push({
      id: groupId,
      parentGroupId,
      parentColumn,
      direction: config.direction,
      ratios: config.ratios,
      gap: model.layoutGap,
      columns,
      elementIds: childElements.map((element) => element.id),
    });
    childElements.forEach((element) => { element.groupId = groupId; element.column = columns[0]; });
    childGroups.forEach((group) => { group.parentGroupId = groupId; group.parentColumn = columns[0]; });
    model.selectedIds = [];
    model.selectedGroupId = groupId;
    model.selectedColumn = columns[0];
    layoutPopover.hidden = true;
    document.querySelector("#layout-card").setAttribute("aria-expanded", "false");
    render();
    return;
  }
  if (model.selectedGroupId && selected.length === 0) {
    const group = model.groups.find((candidate) => candidate.id === model.selectedGroupId);
    if (group) {
      group.direction = config.direction;
      group.ratios = config.ratios;
      group.columns = config.ratios.map((_, index) => `${group.id}-column-${index + 1}`);
      group.elementIds.forEach((id, index) => {
        const element = model.elements.find((candidate) => candidate.id === id);
        if (element) element.column = group.columns[Math.min(index, group.columns.length - 1)];
      });
      model.selectedColumn = group.columns[0];
      layoutPopover.hidden = true;
      document.querySelector("#layout-card").setAttribute("aria-expanded", "false");
      render();
      return;
    }
  }
  if (selected.length >= 1) {
    const groupId = `layout-group-${model.groups.length + 1}`;
    const columns = config.ratios.map((_, index) => `${groupId}-column-${index + 1}`);
    const parentGroupId = model.selectedGroupId || null;
    const parentColumn = parentGroupId ? model.selectedColumn : model.elements.find((element) => element.id === selected[0])?.column || model.columns[0];
    model.groups.push({ id: groupId, parentGroupId, parentColumn, direction: config.direction, ratios: config.ratios, gap: model.layoutGap, columns, elementIds: selected });
    selected.forEach((id, index) => {
      const element = model.elements.find((candidate) => candidate.id === id);
      if (element) { element.groupId = groupId; element.column = columns[Math.min(index, columns.length - 1)]; }
    });
    model.selectedGroupId = groupId;
    model.selectedColumn = columns[0];
    layoutPopover.hidden = true;
    document.querySelector("#layout-card").setAttribute("aria-expanded", "false");
    render();
    return;
  }
  model.layoutDirection = config.direction;
  model.layoutRatios = config.ratios;
  model.columns = config.ratios.map((_, index) => `column-${index + 1}`);
  const directElements = model.elements.filter((element) => !element.groupId);
  const directGroups = model.groups.filter((group) => !group.parentGroupId);
  const directNodes = [
    ...directElements.map((element) => ({ kind: "element", order: model.elements.indexOf(element), value: element })),
    ...directGroups.map((group) => ({ kind: "group", order: Math.min(...group.elementIds.map((id) => model.elements.findIndex((element) => element.id === id))), value: group })),
  ].sort((a, b) => a.order - b.order);
  directNodes.forEach((node, index) => {
    const column = model.columns[Math.min(index, model.columns.length - 1)];
    if (node.kind === "element") node.value.column = column;
    else node.value.parentColumn = column;
  });
  model.selectedColumn = model.columns[0];
  model.layout = "split";
  layoutPopover.hidden = true;
  document.querySelector("#layout-card").setAttribute("aria-expanded", "false");
  render();
}

function mergeLayout() {
  pushHistory();
  if (model.selectedGroupId) {
    const group = model.groups.find((candidate) => candidate.id === model.selectedGroupId);
    const removedGroupIds = new Set([model.selectedGroupId]);
    let changed = true;
    while (changed) {
      changed = false;
      model.groups.forEach((candidate) => {
        if (removedGroupIds.has(candidate.parentGroupId) && !removedGroupIds.has(candidate.id)) {
          removedGroupIds.add(candidate.id);
          changed = true;
        }
      });
    }
    model.groups = model.groups.filter((candidate) => !removedGroupIds.has(candidate.id));
    model.elements.forEach((element) => {
      if (removedGroupIds.has(element.groupId)) {
        delete element.groupId;
        element.column = group?.parentColumn || "left";
      }
    });
    model.selectedGroupId = null;
    model.selectedColumn = group?.parentColumn || model.columns[0];
    render();
    return;
  }
  model.groups = [];
  model.elements.forEach((element) => { delete element.groupId; element.column = "column-1"; });
  model.columns = ["column-1"];
  model.layoutRatios = [1];
  model.layout = "single";
  model.elements.forEach((element) => { if (!element.groupId) element.column = "column-1"; });
  model.groups.filter((group) => !group.parentGroupId).forEach((group) => { group.parentColumn = "column-1"; });
  model.selectedColumn = "column-1";
  render();
}

function deleteSelectedLayoutColumn() {
  const selectedColumn = model.selectedColumn;
  if (!selectedColumn) return;
  pushHistory();
  if (model.selectedGroupId) {
    const group = model.groups.find((candidate) => candidate.id === model.selectedGroupId);
    if (!group) return;
    if (group.columns.length <= 1) {
      history.pop();
      mergeLayout();
      return;
    }
    const remaining = group.columns.filter((column) => column !== selectedColumn);
    const destination = remaining[0];
    model.elements.forEach((element) => {
      if (element.groupId === group.id && element.column === selectedColumn) element.column = destination;
    });
    model.groups.forEach((candidate) => {
      if (candidate.parentGroupId === group.id && candidate.parentColumn === selectedColumn) candidate.parentColumn = destination;
    });
    group.columns = remaining;
    group.ratios = remaining.map(() => 1);
    model.selectedColumn = destination;
    model.selectedIds = [];
    render();
    return;
  }
  if (model.columns.length <= 1) {
    history.pop();
    mergeLayout();
    return;
  }
  const remaining = model.columns.filter((column) => column !== selectedColumn);
  const destination = remaining[0];
  model.elements.forEach((element) => {
    if (!element.groupId && (element.column || "left") === selectedColumn) element.column = destination;
  });
  model.groups.forEach((group) => {
    if (!group.parentGroupId && group.parentColumn === selectedColumn) group.parentColumn = destination;
  });
  model.columns = remaining;
  model.layoutRatios = remaining.map(() => 1);
  model.layout = remaining.length > 1 ? "split" : "single";
  model.selectedColumn = destination;
  model.selectedIds = [];
  render();
}

function showToast(message) {
  actionToastMessage.textContent = message;
  actionToast.hidden = false;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => { actionToast.hidden = true; }, 4500);
}

deleteButton.addEventListener("click", () => {
  const ids = model.selectedIds.filter((id) => model.elements.some((element) => element.id === id));
  if (!ids.length) return;
  if (ids.length === model.elements.length) {
    showToast("最後のパーツは残します");
    return;
  }
  pushHistory();
  model.elements = model.elements.filter((element) => !ids.includes(element.id));
  model.selectedIds = [];
  showToast(`${ids.length}個のパーツを削除しました`);
  render();
});

undoDelete.addEventListener("click", () => {
  undoLastChange();
});
undoButton.addEventListener("click", undoLastChange);
function handleUndoShortcut(event) {
  const isUndo = (event.ctrlKey || event.metaKey) && (event.key.toLowerCase() === "z" || event.code === "KeyZ");
  if (!isUndo || history.length === 0) return;
  event.preventDefault();
  event.stopPropagation();
  undoLastChange();
}
document.addEventListener("keydown", handleUndoShortcut, true);

document.querySelectorAll("[data-layout-action]").forEach((button) => button.addEventListener("click", () => {
  if (button.dataset.layoutAction === "merge") mergeLayout();
  else applyLayout(button.dataset.layoutAction);
}));
document.querySelectorAll("[data-layout-template]").forEach((button) => button.addEventListener("click", () => applyLayoutTemplate(button.dataset.layoutTemplate)));

function insertionTarget() {
  const group = model.groups.find((candidate) => candidate.id === model.selectedGroupId);
  if (group) {
    return { groupId: group.id, column: group.columns.includes(model.selectedColumn) ? model.selectedColumn : group.columns[0] };
  }
  return { groupId: undefined, column: model.columns.includes(model.selectedColumn) ? model.selectedColumn : model.columns[0] };
}

function addTextPart(type) {
  const id = `${type}-${model.elements.length + 1}`;
  const bodyStyle = { color: "#334155", backgroundColor: "#ffffff", fontFamily: "system", fontSize: 18, fontWeight: 400, textAlign: "left", verticalAlign: "top", lineHeight: 1.8, padding: 18, margin: 12, width: 88, borderWidth: 0, borderColor: "#b9d0ff", borderRadius: 12, shadow: "none", depth: "none", borderStyle: "none", glow: "none" };
  const { groupId, column } = insertionTarget();
  const template = type === "body" ? { id, type, column, groupId, format: "plain", content: "サービスの特徴や、お客さまへのメッセージをここに入力できます。", style: bodyStyle } : { ...structuredClone(initialModel.elements[0]), id, type, column, groupId, content: "ここに見出しを入力できます。" };
  model.elements.push(template);
  if (groupId) model.groups.find((group) => group.id === groupId)?.elementIds.push(id);
  model.selectedBackground = false;
  model.selectedIds = [id];
  render();
}

function addSeparatorPart() {
  pushHistory();
  const id = `separator-${model.elements.length + 1}`;
  const { groupId, column } = insertionTarget();
  const separatorStyle = { color: "#18222f", backgroundColor: "transparent", fontSize: 16, fontWeight: 400, textAlign: "left", verticalAlign: "top", lineHeight: 1.4, padding: 0, margin: 16, width: 88, borderWidth: 1, borderColor: "#b9d0ff", borderRadius: 0, borderStyle: "solid", shadow: "none", depth: "none", glow: "none" };
  model.elements.push({ id, type: "separator", column, groupId, content: "", style: separatorStyle });
  if (groupId) model.groups.find((group) => group.id === groupId)?.elementIds.push(id);
  model.selectedBackground = false;
  model.selectedIds = [id];
  render();
}

function addButtonPart() {
  pushHistory();
  const id = `button-${model.elements.length + 1}`;
  const { groupId, column } = insertionTarget();
  const buttonStyle = { color: "#ffffff", backgroundColor: "#2563eb", fontFamily: "system", fontSize: 16, fontWeight: 700, textAlign: "center", verticalAlign: "center", lineHeight: 1.4, padding: 12, margin: 12, width: 48, height: 48, borderWidth: 0, borderColor: "#1d4ed8", borderRadius: 12, buttonAlign: "center", shadow: "soft", depth: "none", borderStyle: "solid", glow: "none" };
  model.elements.push({ id, type: "button", column, groupId, content: "お問い合わせ", url: "", linkType: "url", anchorId: "", target: "same", style: buttonStyle });
  if (groupId) model.groups.find((group) => group.id === groupId)?.elementIds.push(id);
  model.selectedBackground = false;
  model.selectedIds = [id];
  render();
}

document.querySelector("#add-text").addEventListener("click", () => addTextPart("heading"));
document.querySelector("#add-body").addEventListener("click", () => addTextPart("body"));
addSeparator.addEventListener("click", addSeparatorPart);
addButton.addEventListener("click", addButtonPart);
document.querySelector("#select-background").addEventListener("click", () => {
  model.selectedBackground = true;
  model.selectedIds = [];
  model.selectedColumns = [];
  model.selectedGroupId = null;
  render();
});
document.querySelector("#layout-card").addEventListener("click", () => {
  model.selectedBackground = false;
  model.selectedIds = [];
  model.selectedColumns = [];
  model.selectedColumn = model.columns[0];
  model.selectedGroupId = null;
  const open = layoutPopover.hidden;
  layoutPopover.hidden = !open;
  document.querySelector("#layout-card").setAttribute("aria-expanded", String(open));
  render();
});
document.querySelector("#close-layout-popover").addEventListener("click", () => {
  layoutPopover.hidden = true;
  document.querySelector("#layout-card").setAttribute("aria-expanded", "false");
});
document.addEventListener("click", (event) => {
  if (!layoutPopover.contains(event.target) && event.target.closest("#layout-card") === null) {
    layoutPopover.hidden = true;
    document.querySelector("#layout-card").setAttribute("aria-expanded", "false");
  }
});
document.querySelectorAll("[data-body-format]").forEach((button) => button.addEventListener("click", () => {
  if (!hasSelection() || selectedElement().type !== "body") return;
  selectedElement().format = button.dataset.bodyFormat;
  render();
}));
imageFile.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const id = `image-${model.elements.length + 1}`;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const { groupId, column } = insertionTarget();
    model.elements.push({ id, type: "image", column, groupId, content: "", src: reader.result, alt: file.name.replace(/\.[^.]+$/, ""), style: { color: "#18222f", backgroundColor: "transparent", fontSize: 16, fontWeight: 400, textAlign: "left", lineHeight: 1.4, padding: 0, margin: 16, width: 88, borderWidth: 0, borderColor: "#b9d0ff", borderRadius: 12, imagePosition: "center", objectFit: "contain", offsetX: 0, offsetY: 0, shadow: "none", depth: "none", borderStyle: "none", glow: "none" } });
    if (groupId) model.groups.find((group) => group.id === groupId)?.elementIds.push(id);
    model.selectedBackground = false;
    model.selectedIds = [id];
    event.target.value = "";
    render();
  });
  reader.addEventListener("error", () => showToast("画像を読み込めませんでした"));
  reader.readAsDataURL(file);
});

imageReplaceFile.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file || !hasSelection() || selectedElement().type !== "image") return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    pushHistory();
    selectedElement().src = reader.result;
    selectedElement().alt = file.name.replace(/\.[^.]+$/, "");
    event.target.value = "";
    render();
  });
  reader.addEventListener("error", () => showToast("画像を読み込めませんでした"));
  reader.readAsDataURL(file);
});

document.querySelector("#reset-page").addEventListener("click", () => {
  model.page = structuredClone(initialModel.page);
  model.layout = initialModel.layout;
  model.layoutDirection = initialModel.layoutDirection;
  model.layoutGap = initialModel.layoutGap;
  model.layoutRatios = structuredClone(initialModel.layoutRatios);
  model.columns = structuredClone(initialModel.columns);
  model.groups = [];
  model.elements = structuredClone(initialModel.elements);
  model.selectedIds = [initialModel.selectedId];
  model.selectedBackground = false;
  model.selectedColumns = [];
  model.selectedColumn = "left";
  model.selectedGroupId = null;
  model.activePreset = "simple";
  render();
});

window.addEventListener("message", (event) => {
  if (event.data?.type === "move-element") {
    moveElementTo(event.data.id, event.data.groupId || null, event.data.column, event.data.referenceId || null, event.data.insertBefore === true);
  } else if (event.data?.type === "drag-status") {
    if (event.data.message) document.querySelector("#selection-status").textContent = event.data.message;
    else render();
  } else if (event.data?.type === "edit-content" && model.elements.some((element) => element.id === event.data.id)) {
    const element = model.elements.find((candidate) => candidate.id === event.data.id);
    element.content = event.data.content;
    controls.content.value = event.data.content;
  } else if (event.data?.type === "edit-end") {
    render();
  } else if (event.data?.type === "select" && model.elements.some((element) => element.id === event.data.id)) {
    model.selectedBackground = false;
    model.selectedIds = event.data.shift ? model.selectedIds.includes(event.data.id) ? model.selectedIds.filter((id) => id !== event.data.id) : [...model.selectedIds, event.data.id] : [event.data.id];
    model.selectedColumn = event.data.column || model.elements.find((element) => element.id === event.data.id)?.column || "left";
    model.selectedGroupId = event.data.groupId || model.elements.find((element) => element.id === event.data.id)?.groupId || null;
    model.selectedColumns = [];
    render();
  } else if (event.data?.type === "select-column" && (model.columns.includes(event.data.column) || event.data.groupId)) {
    model.selectedBackground = false;
    model.selectedColumn = event.data.column;
    model.selectedGroupId = event.data.groupId || null;
    model.selectedIds = [];
    const key = columnSelectionKey(model.selectedGroupId, event.data.column);
    const currentKeys = model.selectedColumns.filter((candidate) => candidate.startsWith(`${model.selectedGroupId || "root"}::`));
    model.selectedColumns = event.data.shift
      ? currentKeys.includes(key) ? currentKeys.filter((candidate) => candidate !== key) : [...currentKeys, key]
      : [key];
    render();
  } else if (event.data?.type === "preview-scroll") {
    pendingPreviewScrollTop = Number(event.data.top) || 0;
  } else if (event.data?.type === "context-menu" && !event.data.id && event.data.column) {
    model.selectedBackground = false;
    model.selectedIds = [];
    model.selectedGroupId = event.data.groupId || null;
    model.selectedColumn = event.data.column;
    model.selectedColumns = [columnSelectionKey(model.selectedGroupId, model.selectedColumn)];
    const rect = frame.getBoundingClientRect();
    openContextMenu({ groupId: event.data.groupId || null, column: event.data.column, x: rect.left + Number(event.data.x || 0), y: rect.top + Number(event.data.y || 0) });
    render();
  } else if (event.data?.type === "clear-selection") {
    model.selectedBackground = false;
    model.selectedIds = [];
    model.selectedColumns = [];
    model.selectedGroupId = null;
    render();
  }
});

render();
