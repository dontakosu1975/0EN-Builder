const initialModel = {
  page: {
    title: "はじめてのペライチ",
    backgroundColor: "#f7f9fc",
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
        backgroundColor: "#ffffff",
        fontSize: 42,
        fontWeight: 700,
        textAlign: "left",
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
const frame = document.querySelector("#preview-frame");
const codeOutput = document.querySelector("#code-output");
const pageSettings = document.querySelector("#page-settings");
const pageBackground = document.querySelector("#page-background");
const imageFile = document.querySelector("#image-file");
const imageReplaceFile = document.querySelector("#image-replace-file");
const bodyTools = document.querySelector("#body-tools");
const layoutTools = document.querySelector("#layout-tools");
const layoutGap = document.querySelector("#layout-gap");
const layoutGapValue = document.querySelector("#layout-gap-value");
const layoutWidth = document.querySelector("#layout-width");
const layoutWidthValue = document.querySelector("#layout-width-value");
const layoutHeight = document.querySelector("#layout-height");
const layoutHeightValue = document.querySelector("#layout-height-value");
const layoutWidthField = document.querySelector("#layout-width-field");
const layoutHeightField = document.querySelector("#layout-height-field");
const layoutPopover = document.querySelector("#layout-popover");
const deleteSection = document.querySelector("#delete-section");
const deleteButton = document.querySelector("#delete-selected");
const actionToast = document.querySelector("#action-toast");
const actionToastMessage = document.querySelector("#action-toast-message");
const undoDelete = document.querySelector("#undo-delete");
const undoButton = document.querySelector("#undo-button");
const imageAlt = document.querySelector("#image-alt");
const imageWidth = document.querySelector("#image-width");
const imageWidthValue = document.querySelector("#image-width-value");
const imageMargin = document.querySelector("#image-margin");
const imageMarginValue = document.querySelector("#image-margin-value");
const imageRadius = document.querySelector("#image-radius");
const imageRadiusValue = document.querySelector("#image-radius-value");
const imageOffsetX = document.querySelector("#image-offset-x");
const imageOffsetXValue = document.querySelector("#image-offset-x-value");
const imageOffsetY = document.querySelector("#image-offset-y");
const imageOffsetYValue = document.querySelector("#image-offset-y-value");
const history = [];
let pendingPreviewScrollTop = 0;
const collapsedSections = new Set(["preset-tools", "decoration-tools"]);

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

function snapshotModel() {
  return structuredClone({ page: model.page, layout: model.layout, layoutDirection: model.layoutDirection, layoutGap: model.layoutGap, layoutRatios: model.layoutRatios, columns: model.columns, groups: model.groups, elements: model.elements, selectedIds: model.selectedIds, selectedColumn: model.selectedColumn, selectedGroupId: model.selectedGroupId, selectedColumns: model.selectedColumns, activePreset: model.activePreset });
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

const controls = {
  content: document.querySelector("#content-input"),
  textColor: document.querySelector("#text-color"),
  backgroundColor: document.querySelector("#background-color"),
  fontSize: document.querySelector("#font-size"),
  fontSizeValue: document.querySelector("#font-size-value"),
  fontWeight: document.querySelector("#font-weight"),
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

function cssFor(element) {
  const s = element.style;
  const imageMargin = element.type === "image"
    ? { left: `${s.margin}px auto ${s.margin}px 0`, center: `${s.margin}px auto`, right: `${s.margin}px 0 ${s.margin}px auto` }[s.imagePosition || "center"]
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
    `background-color: ${s.backgroundColor};`,
    `font-size: ${s.fontSize}px;`,
    `font-weight: ${s.fontWeight};`,
    `text-align: ${s.textAlign};`,
    `line-height: ${s.lineHeight};`,
    `padding: ${s.padding}px;`,
    `margin: ${imageMargin};`,
    `width: ${s.width}%;`,
    `border: ${border};`,
    `border-radius: ${s.borderRadius}px;`,
    element.type === "image" ? "display: block;" : "",
    element.type === "image" ? `object-fit: ${s.objectFit || "contain"};` : "",
    element.type === "image" ? `transform: translate(${s.offsetX || 0}px, ${s.offsetY || 0}px);` : "",
    `box-shadow: ${shadows.length ? shadows.join(", ") : "none"};`,
  ].join(" ");
}

function elementMarkup(element, inlineStyles = false) {
    const selectedIndex = model.selectedIds.indexOf(element.id);
    const selected = selectedIndex >= 0 ? ` is-selected is-selected-${selectedIndex + 1}` : "";
    const inline = inlineStyles ? ` style="${cssFor(element)}"` : "";
  const editable = inlineStyles && element.type !== "image" ? ` data-editable="true"` : "";
    if (element.type === "image") {
      return `    <img id="${element.id}" data-element-id="${element.id}" class="text-element image-element${selected}" src="${element.src}" alt="${escapeHtml(element.alt)}"${inline} />`;
    }
    if (element.type === "body" && element.format === "list") {
      const items = element.content.split(/\r?\n/).filter(Boolean).map((line) => `<li>${escapeHtml(line)}</li>`).join("");
      return `    <ul id="${element.id}" data-element-id="${element.id}" class="text-element body-element${selected}"${editable}${inline}>${items}</ul>`;
    }
    const tag = element.type === "body" ? "p" : "h1";
    const kind = element.type === "body" ? "body-element" : "heading-element";
    const content = element.type === "body" && element.format === "strong" ? `<strong>${escapeHtml(element.content)}</strong>` : escapeHtml(element.content);
    return `    <${tag} id="${element.id}" data-element-id="${element.id}" class="text-element ${kind}${selected}"${editable}${inline}>${content}</${tag}>`;
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

function groupMarkup(group, { inlineStyles = false, preview = false } = {}) {
  const columns = group.columns;
  const columnMarkup = columns.map((column) => {
    const nestedGroups = model.groups.filter((candidate) => candidate.parentGroupId === group.id && candidate.parentColumn === column);
    const parts = [
      ...group.elementIds.map((id) => model.elements.find((element) => element.id === id)).filter((element) => element?.groupId === group.id && element.column === column).map((element) => elementMarkup(element, inlineStyles)),
      ...nestedGroups.map((nestedGroup) => groupMarkup(nestedGroup, { inlineStyles, preview })),
    ].join("\n");
    const active = column === model.selectedColumn && group.id === model.selectedGroupId ? " is-active" : "";
    const selectedColumn = isColumnSelected(group.id, column) ? " is-column-selected" : "";
    const guide = preview && isGuideTarget(group.id) ? " layout-guide-column" : "";
    const label = guide ? ` data-layout-label="${layoutColumnLabel(group.direction, columns.indexOf(column), columns.length)}"` : "";
    const ratio = group.ratios[columns.indexOf(column)] || 1;
    const size = group.direction === "column" ? ` style="flex: 0 0 auto; min-height: ${Math.max(130, Math.round(ratio * 2))}px;"` : "";
    return `      <div class="layout-column${active}${selectedColumn}${guide}" data-group-id="${group.id}" data-column-id="${column}"${label}${size}>${parts}</div>`;
  }).join("\n");
  const layoutClass = `nested-layout layout-split layout-${group.direction}`;
  return `    <div class="${layoutClass}" data-group-id="${group.id}">${columnMarkup}\n    </div>`;
}

function generatedHtml({ inlineStyles = false, preview = false } = {}) {
  const groupedIds = new Set(model.groups.flatMap((group) => group.elementIds));
  const columns = model.columns;
  const columnMarkup = columns.map((column) => {
    const directGroups = model.groups.filter((group) => !group.parentGroupId && group.parentColumn === column);
    const parts = [
      ...model.elements.filter((element) => !groupedIds.has(element.id) && (element.column || "left") === column).map((element) => elementMarkup(element, inlineStyles)),
      ...directGroups.map((group) => groupMarkup(group, { inlineStyles, preview })),
    ].join("\n");
    const active = column === model.selectedColumn ? " is-active" : "";
    const selectedColumn = isColumnSelected(null, column) ? " is-column-selected" : "";
    const guide = preview && isGuideTarget(null, true) ? " layout-guide-column" : "";
    const label = guide ? ` data-layout-label="${layoutColumnLabel(model.layoutDirection, columns.indexOf(column), columns.length)}"` : "";
    const ratio = model.layoutRatios[columns.indexOf(column)] || 1;
    const size = model.layoutDirection === "column" ? ` style="flex: 0 0 auto; min-height: ${Math.max(130, Math.round(ratio * 2))}px;"` : "";
    return `    <div class="layout-column${active}${selectedColumn}${guide}" data-column-id="${column}"${label}${size}>\n${parts}\n    </div>`;
  }).join("\n");
  const layoutClass = columns.length > 1 ? `layout layout-split layout-${model.layoutDirection}` : "layout layout-single";
  return `<main class="page">\n  <section class="hero ${layoutClass}">\n${columnMarkup}\n  </section>\n</main>`;
}

function layoutDeclaration(direction, ratios, gap) {
  if (direction === "column") return `display:flex;flex-direction:column;gap:${gap}px;align-items:stretch;`;
  return `display:grid;grid-template-columns:${ratios.map((ratio) => `minmax(0, ${ratio}fr)`).join(" ")};gap:${gap}px;align-items:stretch;`;
}

function generatedCss() {
  const elementCss = model.elements.map((element) => `#${element.id} { ${cssFor(element)} }`).join("\n");
  const layoutRule = layoutDeclaration(model.layoutDirection, model.layoutRatios, model.layoutGap);
  const columnFlex = model.layoutDirection === "column" ? ".layout-column { flex: 0 0 auto; }" : "";
  const groupCss = model.groups.map((group) => `.nested-layout[data-group-id="${group.id}"] { ${layoutDeclaration(group.direction, group.ratios, group.gap)} }`).join("\n");
  return `.page { min-height: 100%; padding: 48px 24px; background: ${model.page.backgroundColor}; }\n.hero { max-width: 760px; margin: 0 auto; }\n.layout-split { ${layoutRule} }\n.nested-layout { width: 100%; max-width: 100%; min-width: 0; }\n.layout-column { box-sizing: border-box; width: 100%; min-width: 0; }\n.text-element { overflow-wrap: anywhere; word-break: break-word; }\n${columnFlex}\n${groupCss}\n${elementCss}`;
}

function previewDocument() {
  const elementCss = model.elements.map((element) => `#${element.id}{${cssFor(element)}}`).join("");
  const layoutRule = layoutDeclaration(model.layoutDirection, model.layoutRatios, model.layoutGap);
  const columnFlex = model.layoutDirection === "column" ? ".layout-column{flex:0 0 auto}" : "";
  const groupCss = model.groups.map((group) => `.nested-layout[data-group-id="${group.id}"]{${layoutDeclaration(group.direction, group.ratios, group.gap)}}`).join("");
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><style>html,body{margin:0;min-height:100%;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}.page{min-height:100vh;padding:48px 24px;background:${model.page.backgroundColor};box-sizing:border-box}.hero{max-width:760px;margin:0 auto}.layout-split{${layoutRule}}${columnFlex}${groupCss}.nested-layout{width:100%;max-width:100%;min-width:0}.layout-column{box-sizing:border-box;width:100%;min-width:0;min-height:130px;padding:8px;border-radius:12px}.layout-split > .layout-column:not(.layout-guide-column){background:rgba(138,180,255,.025);box-shadow:inset 0 0 0 1px rgba(138,180,255,.16)}.layout-column.is-active{background:rgba(37,99,235,.04)}.layout-column.is-column-selected{background:rgba(37,99,235,.12);outline:3px solid #2563eb;outline-offset:4px}.layout-guide-column{position:relative;display:flex;flex-direction:column;outline:2px dashed #8ab4ff;outline-offset:4px;background:rgba(138,180,255,.07)}.layout-guide-column.is-column-selected{outline:3px solid #2563eb;outline-offset:4px;background:rgba(37,99,235,.12)}.layout-guide-column::before{content:attr(data-layout-label);position:absolute;top:-13px;left:8px;padding:2px 6px;border-radius:999px;background:#e8f0ff;color:#2563eb;font-size:10px;font-weight:700;line-height:1.2;pointer-events:none}.empty-column{display:grid;height:100%;min-height:110px;box-sizing:border-box;place-items:center;border:2px dashed #b9d0ff;border-radius:12px;color:#6b86b5;font-size:13px}.column-add-zone{flex:1;min-height:110px;margin-top:8px}.layout-guide-column > .empty-column:not(.column-add-zone){border-color:transparent;background:transparent}.text-element{box-sizing:border-box;max-width:100%;overflow-wrap:anywhere;word-break:break-word;cursor:pointer;transition:outline .15s ease,filter .2s ease;}.text-element:hover{outline:2px solid #8ab4ff;outline-offset:5px}.text-element.is-selected{outline:3px solid #111827;outline-offset:6px}.text-element.is-selected-2{outline-color:#2563eb}.text-element.is-selected-3{outline-color:#7c3aed}.text-element[contenteditable="true"]{outline:3px solid #2563eb;outline-offset:6px;cursor:text}</style></head><body>${generatedHtml({ inlineStyles: true, preview: true })}<script>document.querySelectorAll('.text-element').forEach((element)=>{let clickTimer;element.addEventListener('click',(event)=>{event.stopPropagation();clearTimeout(clickTimer);clickTimer=setTimeout(()=>parent.postMessage({type:'select',id:element.dataset.elementId,column:element.closest('.layout-column')?.dataset.columnId,groupId:element.closest('.layout-column')?.dataset.groupId,shift:event.shiftKey},'*'),220)});element.addEventListener('dblclick',(event)=>{event.stopPropagation();clearTimeout(clickTimer);element.dataset.originalText=element.innerText;element.contentEditable='true';element.focus();const range=document.caretRangeFromPoint?.(event.clientX,event.clientY);const selection=window.getSelection();if(range&&element.contains(range.startContainer)){selection.removeAllRanges();selection.addRange(range)}else{const fallback=document.createRange();fallback.selectNodeContents(element);fallback.collapse(false);selection.removeAllRanges();selection.addRange(fallback)}parent.postMessage({type:'edit-start',id:element.dataset.elementId},'*')});element.addEventListener('input',()=>parent.postMessage({type:'edit-content',id:element.dataset.elementId,content:element.innerText},'*'));element.addEventListener('keydown',(event)=>{if(event.key==='Enter'){event.preventDefault();element.blur()}if(event.key==='Escape'){element.innerText=element.dataset.originalText||element.innerText;element.blur()}});element.addEventListener('blur',()=>{element.contentEditable='false';parent.postMessage({type:'edit-end',id:element.dataset.elementId},'*')})});document.querySelectorAll('.layout-column').forEach((column)=>column.addEventListener('click',(event)=>{if(event.target===column||event.target.classList.contains('empty-column')){event.stopPropagation();parent.postMessage({type:'select-column',column:column.dataset.columnId,groupId:column.dataset.groupId,shift:event.shiftKey},'*')}}));document.querySelectorAll('.text-element,.layout-column').forEach((target)=>target.addEventListener('contextmenu',(event)=>{event.preventDefault();const element=event.target.closest('.text-element');parent.postMessage({type:'context-menu',id:element?.dataset.elementId,column:target.closest('.layout-column')?.dataset.columnId,groupId:target.closest('.layout-column')?.dataset.groupId,x:event.clientX,y:event.clientY},'*')}));window.addEventListener('scroll',()=>parent.postMessage({type:'preview-scroll',top:window.scrollY},'*'));document.body.addEventListener('click',()=>parent.postMessage({type:'clear-selection'},'*'));window.addEventListener('message',(event)=>{if(event.data?.type==='restore-scroll'){window.scrollTo(0,Math.max(0,Number(event.data.top)||0));}if(event.data?.type==='focus'){const target=document.getElementById(event.data.id);if(target){target.scrollIntoView({block:'center',behavior:'smooth'});target.animate([{filter:'brightness(1.12)'},{filter:'brightness(1)'}],{duration:450});}}});<\/script></body></html>`;
}

function syncControls() {
  const element = selectedElement();
  const s = element.style;
  const count = selectionCount();
  const columnCount = model.selectedColumns.length;
  const layoutActive = count === 0 || count > 1;
  const activeGroup = model.groups.find((group) => group.id === model.selectedGroupId);
  const editorType = count === 1 && element.type === "image" ? "image" : count === 1 ? "text" : "layout";
  const editorTitle = { image: "画像の道具箱", text: element.type === "body" ? "本文の道具箱" : "見出しの道具箱", layout: "レイアウトの道具箱" }[editorType];
  document.querySelector("#edit-heading").textContent = editorTitle;
  document.querySelector("#edit-subheading").textContent = editorType === "image" ? "画像に必要な道具だけ表示します。" : editorType === "text" ? "文字に必要な道具だけ表示します。" : "選択中の場所に必要な道具だけ表示します。";
  document.querySelectorAll("[data-collapsible]").forEach((section) => section.setAttribute("aria-expanded", String(!collapsedSections.has(section.id))));
  pageBackground.value = model.page.backgroundColor;
  undoButton.disabled = history.length === 0;
  deleteSection.hidden = count === 0;
  deleteButton.textContent = count > 1 ? `🗑 選択した${count}個を削除` : "🗑 このパーツを削除";
  layoutTools.hidden = !layoutActive;
  document.querySelectorAll(".right-panel > .customize-section[data-editor]").forEach((section) => { section.hidden = layoutActive || section.dataset.editor !== editorType; });
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
  document.querySelectorAll("[data-layout-action]").forEach((button) => {
    const action = button.dataset.layoutAction;
    button.textContent = count > 1 && action === "row" ? "↔ 左右に並べる" : count > 1 && action === "column" ? "↕ 上下に並べる" : action === "row" ? "↔ 左右に分ける" : action === "column" ? "↕ 上下に分ける" : "＋ ひとつに戻す";
    button.hidden = action === "merge" ? model.columns.length < 2 : false;
  });
  bodyTools.hidden = element.type !== "body";
  document.querySelectorAll("[data-body-format]").forEach((button) => button.setAttribute("aria-pressed", String((element.format || "plain") === button.dataset.bodyFormat)));
  controls.content.value = element.content;
  controls.textColor.value = s.color;
  controls.backgroundColor.value = s.backgroundColor;
  controls.fontSize.value = s.fontSize;
  controls.fontSizeValue.value = `${s.fontSize}px`;
  controls.fontWeight.checked = s.fontWeight >= 700;
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
  imageAlt.value = element.type === "image" ? element.alt : "";
  imageWidth.value = element.type === "image" ? element.style.width : 100;
  imageWidthValue.value = element.type === "image" ? `${element.style.width}%` : "";
  imageMargin.value = element.type === "image" ? element.style.margin : 0;
  imageMarginValue.value = element.type === "image" ? `${element.style.margin}px` : "";
  imageRadius.value = element.type === "image" ? element.style.borderRadius : 0;
  imageRadiusValue.value = element.type === "image" ? `${element.style.borderRadius}px` : "";
  imageOffsetX.value = element.type === "image" ? (element.style.offsetX || 0) : 0;
  imageOffsetXValue.value = element.type === "image" ? `${element.style.offsetX || 0}px` : "";
  imageOffsetY.value = element.type === "image" ? (element.style.offsetY || 0) : 0;
  imageOffsetYValue.value = element.type === "image" ? `${element.style.offsetY || 0}px` : "";
  document.querySelectorAll("[data-image-position]").forEach((button) => button.setAttribute("aria-pressed", String(element.type === "image" && (element.style.imagePosition || "center") === button.dataset.imagePosition)));
}

function render() {
  const documentScroller = document.scrollingElement;
  const pageScrollTop = documentScroller?.scrollTop || 0;
  const rightPanel = document.querySelector(".right-panel");
  const rightPanelScrollTop = rightPanel?.scrollTop || 0;
  syncControls();
  frame.srcdoc = previewDocument();
  document.querySelector("#html-output").textContent = generatedHtml();
  document.querySelector("#css-output").textContent = generatedCss();
  document.querySelector("#selection-status").textContent = selectionCount() > 1 ? `${selectionCount()}個のパーツを選択中` : hasSelection() ? `${selectedElement().id}を編集中` : "レイアウトを選択中";
  document.querySelector("#footer-element-count").textContent = model.elements.length;
  document.querySelector("#footer-selection").textContent = selectionCount() > 1 ? `${selectionCount()}個のパーツ` : hasSelection() ? (selectedElement().type === "body" ? "本文" : selectedElement().type === "image" ? "画像" : "見出し") : "レイアウト";
  requestAnimationFrame(() => {
    if (documentScroller) documentScroller.scrollTop = pageScrollTop;
    if (rightPanel) rightPanel.scrollTop = rightPanelScrollTop;
  });
}

frame.addEventListener("load", () => {
  const id = selectionCount() === 1 ? model.selectedIds[0] : null;
  if (id) frame.contentWindow?.postMessage({ type: "focus", id }, "*");
  else frame.contentWindow?.postMessage({ type: "restore-scroll", top: pendingPreviewScrollTop }, "*");
});

function updateStyle(key, value) {
  if (!hasSelection()) return;
  pushHistory();
  selectedElement().style[key] = value;
  render();
}

controls.content.addEventListener("input", (event) => { if (!hasSelection()) return; pushHistory(); selectedElement().content = event.target.value; render(); });
controls.textColor.addEventListener("input", (event) => updateStyle("color", event.target.value));
controls.backgroundColor.addEventListener("input", (event) => updateStyle("backgroundColor", event.target.value));
controls.fontSize.addEventListener("input", (event) => updateStyle("fontSize", Number(event.target.value)));
controls.fontWeight.addEventListener("change", (event) => updateStyle("fontWeight", event.target.checked ? 700 : 400));
controls.lineHeight.addEventListener("input", (event) => updateStyle("lineHeight", Number(event.target.value)));
controls.padding.addEventListener("input", (event) => updateStyle("padding", Number(event.target.value)));
controls.margin.addEventListener("input", (event) => updateStyle("margin", Number(event.target.value)));
controls.width.addEventListener("input", (event) => updateStyle("width", Number(event.target.value)));
controls.borderWidth.addEventListener("change", (event) => updateStyle("borderWidth", Number(event.target.value)));
controls.borderColor.addEventListener("input", (event) => updateStyle("borderColor", event.target.value));
controls.radius.addEventListener("input", (event) => updateStyle("borderRadius", Number(event.target.value)));
document.querySelectorAll("[data-align]").forEach((button) => button.addEventListener("click", () => updateStyle("textAlign", button.dataset.align)));
imageAlt.addEventListener("input", (event) => { if (hasSelection() && selectedElement().type === "image") { pushHistory(); selectedElement().alt = event.target.value; render(); } });
imageWidth.addEventListener("input", (event) => { if (hasSelection() && selectedElement().type === "image") { updateStyle("width", Number(event.target.value)); } });
imageMargin.addEventListener("input", (event) => { if (hasSelection() && selectedElement().type === "image") { updateStyle("margin", Number(event.target.value)); } });
imageRadius.addEventListener("input", (event) => { if (hasSelection() && selectedElement().type === "image") { updateStyle("borderRadius", Number(event.target.value)); } });
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

document.querySelector("#toggle-code").addEventListener("click", (event) => {
  const open = codeOutput.hidden;
  codeOutput.hidden = !open;
  event.currentTarget.setAttribute("aria-expanded", String(open));
  event.currentTarget.textContent = open ? "HTMLを隠す" : "HTMLを見る";
});

document.querySelector("#footer-code-button").addEventListener("click", () => document.querySelector("#toggle-code").click());
document.querySelector("#page-menu-toggle").addEventListener("click", (event) => {
  const open = pageSettings.hidden;
  pageSettings.hidden = !open;
  event.currentTarget.setAttribute("aria-expanded", String(open));
});
pageBackground.addEventListener("input", (event) => { model.page.backgroundColor = event.target.value; render(); });
document.querySelectorAll("[data-page-background]").forEach((button) => button.addEventListener("click", () => { pushHistory(); model.page.backgroundColor = button.dataset.pageBackground; render(); }));
layoutGap.addEventListener("input", (event) => { if (model.selectedGroupId) { const group = model.groups.find((candidate) => candidate.id === model.selectedGroupId); if (group) group.gap = Number(event.target.value); } else model.layoutGap = Number(event.target.value); render(); });
layoutWidth.addEventListener("input", (event) => { if (selectedLayoutConfig().direction === "row") updateSelectedLayoutRatio(event.target.value); });
layoutHeight.addEventListener("input", (event) => { if (selectedLayoutConfig().direction === "column") updateSelectedLayoutRatio(event.target.value); });

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
document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
    event.preventDefault();
    undoLastChange();
  }
});

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
  const bodyStyle = { color: "#334155", backgroundColor: "#ffffff", fontSize: 18, fontWeight: 400, textAlign: "left", lineHeight: 1.8, padding: 18, margin: 12, width: 88, borderWidth: 0, borderColor: "#b9d0ff", borderRadius: 12, shadow: "none", depth: "none", borderStyle: "none", glow: "none" };
  const { groupId, column } = insertionTarget();
  const template = type === "body" ? { id, type, column, groupId, format: "plain", content: "サービスの特徴や、お客さまへのメッセージをここに入力できます。", style: bodyStyle } : { ...structuredClone(initialModel.elements[0]), id, type, column, groupId, content: "ここに見出しを入力できます。" };
  model.elements.push(template);
  if (groupId) model.groups.find((group) => group.id === groupId)?.elementIds.push(id);
  model.selectedIds = [id];
  render();
}

document.querySelector("#add-text").addEventListener("click", () => addTextPart("heading"));
document.querySelector("#add-body").addEventListener("click", () => addTextPart("body"));
document.querySelector("#layout-card").addEventListener("click", () => {
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
  model.layout = initialModel.layout;
  model.layoutDirection = initialModel.layoutDirection;
  model.layoutGap = initialModel.layoutGap;
  model.layoutRatios = structuredClone(initialModel.layoutRatios);
  model.columns = structuredClone(initialModel.columns);
  model.groups = [];
  model.elements = structuredClone(initialModel.elements);
    model.selectedIds = [initialModel.selectedId];
    model.selectedColumns = [];
  model.selectedColumn = "left";
  model.selectedGroupId = null;
  model.activePreset = "simple";
  render();
});

window.addEventListener("message", (event) => {
  if (event.data?.type === "edit-content" && model.elements.some((element) => element.id === event.data.id)) {
    const element = model.elements.find((candidate) => candidate.id === event.data.id);
    element.content = event.data.content;
    controls.content.value = event.data.content;
    document.querySelector("#html-output").textContent = generatedHtml();
    document.querySelector("#css-output").textContent = generatedCss();
  } else if (event.data?.type === "edit-end") {
    render();
  } else if (event.data?.type === "select" && model.elements.some((element) => element.id === event.data.id)) {
    model.selectedIds = event.data.shift ? model.selectedIds.includes(event.data.id) ? model.selectedIds.filter((id) => id !== event.data.id) : [...model.selectedIds, event.data.id] : [event.data.id];
    model.selectedColumn = event.data.column || model.elements.find((element) => element.id === event.data.id)?.column || "left";
    model.selectedGroupId = event.data.groupId || model.elements.find((element) => element.id === event.data.id)?.groupId || null;
    model.selectedColumns = [];
    render();
  } else if (event.data?.type === "select-column" && (model.columns.includes(event.data.column) || event.data.groupId)) {
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
  } else if (event.data?.type === "clear-selection") {
    model.selectedIds = [];
    model.selectedColumns = [];
    model.selectedGroupId = null;
    render();
  }
});

render();
