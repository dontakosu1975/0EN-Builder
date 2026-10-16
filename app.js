const initialModel = {
  page: {
    title: "はじめてのペライチ",
    backgroundColor: "#f7f9fc",
  },
  layout: "single",
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
const frame = document.querySelector("#preview-frame");
const codeOutput = document.querySelector("#code-output");
const pageSettings = document.querySelector("#page-settings");
const pageBackground = document.querySelector("#page-background");
const imageFile = document.querySelector("#image-file");
const bodyTools = document.querySelector("#body-tools");

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
  return model.elements.find((element) => element.id === model.selectedId) || model.elements[0];
}

function hasSelection() {
  return Boolean(model.elements.find((element) => element.id === model.selectedId));
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
}

function cssFor(element) {
  const s = element.style;
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
    `margin: ${s.margin}px auto;`,
    `width: ${s.width}%;`,
    `border: ${border};`,
    `border-radius: ${s.borderRadius}px;`,
    `box-shadow: ${shadows.length ? shadows.join(", ") : "none"};`,
  ].join(" ");
}

function elementMarkup(element, inlineStyles = false) {
    const selected = element.id === model.selectedId ? " is-selected" : "";
    const inline = inlineStyles ? ` style="${cssFor(element)}"` : "";
    if (element.type === "image") {
      return `    <img id="${element.id}" data-element-id="${element.id}" class="text-element image-element${selected}" src="${element.src}" alt="${escapeHtml(element.alt)}"${inline} />`;
    }
    if (element.type === "body" && element.format === "list") {
      const items = element.content.split(/\r?\n/).filter(Boolean).map((line) => `<li>${escapeHtml(line)}</li>`).join("");
      return `    <ul id="${element.id}" data-element-id="${element.id}" class="text-element body-element${selected}"${inline}>${items}</ul>`;
    }
    const tag = element.type === "body" ? "p" : "h1";
    const kind = element.type === "body" ? "body-element" : "heading-element";
    const content = element.type === "body" && element.format === "strong" ? `<strong>${escapeHtml(element.content)}</strong>` : escapeHtml(element.content);
    return `    <${tag} id="${element.id}" data-element-id="${element.id}" class="text-element ${kind}${selected}"${inline}>${content}</${tag}>`;
}

function generatedHtml({ inlineStyles = false, preview = false } = {}) {
  const columns = model.layout === "two" ? ["left", "right"] : ["left"];
  const columnMarkup = columns.map((column) => {
    const parts = model.elements.filter((element) => (element.column || "left") === column).map((element) => elementMarkup(element, inlineStyles)).join("\n");
    const empty = preview && !parts ? `<div class="empty-column" data-column-id="${column}">ここにパーツを追加</div>` : "";
    const active = column === model.selectedColumn ? " is-active" : "";
    return `    <div class="layout-column${active}" data-column-id="${column}">\n${parts}${empty ? `\n${empty}` : ""}\n    </div>`;
  }).join("\n");
  const layoutClass = model.layout === "two" ? "layout layout-two" : "layout layout-single";
  return `<main class="page">\n  <section class="hero ${layoutClass}">\n${columnMarkup}\n  </section>\n</main>`;
}

function generatedCss() {
  const elementCss = model.elements.map((element) => `#${element.id} { ${cssFor(element)} }`).join("\n");
  return `.page { min-height: 100%; padding: 48px 24px; background: ${model.page.backgroundColor}; }\n.hero { max-width: 760px; margin: 0 auto; }\n.layout-two { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }\n.layout-column { min-width: 0; }\n${elementCss}`;
}

function previewDocument() {
  const elementCss = model.elements.map((element) => `#${element.id}{${cssFor(element)}}`).join("");
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><style>html,body{margin:0;min-height:100%;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}.page{min-height:100vh;padding:48px 24px;background:${model.page.backgroundColor};box-sizing:border-box}.hero{max-width:760px;margin:0 auto}.layout-two{display:grid;grid-template-columns:1fr 1fr;gap:24px}.layout-column{min-width:0;min-height:130px;padding:8px;border-radius:12px}.layout-column.is-active{background:rgba(37,99,235,.04)}.empty-column{display:grid;min-height:110px;place-items:center;border:2px dashed #b9d0ff;border-radius:12px;color:#6b86b5;font-size:13px}.text-element{box-sizing:border-box;cursor:pointer;transition:outline .15s ease,filter .2s ease;${elementCss}}.text-element:hover{outline:2px solid #8ab4ff;outline-offset:5px}.text-element.is-selected{outline:3px solid #111827;outline-offset:6px}</style></head><body>${generatedHtml({ inlineStyles: true, preview: true })}<script>document.querySelectorAll('.text-element').forEach((element)=>element.addEventListener('click',(event)=>{event.stopPropagation();parent.postMessage({type:'select',id:element.dataset.elementId,column:element.closest('.layout-column')?.dataset.columnId},'*')}));document.querySelectorAll('.layout-column').forEach((column)=>column.addEventListener('click',(event)=>{if(event.target===column||event.target.classList.contains('empty-column')){event.stopPropagation();parent.postMessage({type:'select-column',column:column.dataset.columnId},'*')}}));document.body.addEventListener('click',()=>parent.postMessage({type:'clear-selection'},'*'));window.addEventListener('message',(event)=>{if(event.data?.type==='focus'){const target=document.getElementById(event.data.id);if(target){target.scrollIntoView({block:'center',behavior:'smooth'});target.animate([{filter:'brightness(1.12)'},{filter:'brightness(1)'}],{duration:450});}}});<\/script></body></html>`;
}

function syncControls() {
  const element = selectedElement();
  const s = element.style;
  pageBackground.value = model.page.backgroundColor;
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
}

function render() {
  syncControls();
  frame.srcdoc = previewDocument();
  document.querySelector("#html-output").textContent = generatedHtml();
  document.querySelector("#css-output").textContent = generatedCss();
  document.querySelector("#selection-status").textContent = hasSelection() ? `${selectedElement().id}を編集中` : "パーツを選択してください";
  document.querySelector("#footer-element-count").textContent = model.elements.length;
  document.querySelector("#footer-selection").textContent = hasSelection() ? (selectedElement().type === "body" ? "本文" : "見出し") : "なし";
}

frame.addEventListener("load", () => {
  frame.contentWindow?.postMessage({ type: "focus", id: model.selectedId }, "*");
});

function updateStyle(key, value) {
  if (!hasSelection()) return;
  selectedElement().style[key] = value;
  render();
}

controls.content.addEventListener("input", (event) => { if (!hasSelection()) return; selectedElement().content = event.target.value; render(); });
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

const presets = {
  simple: { color: "#18222f", backgroundColor: "#ffffff", fontSize: 42, fontWeight: 700, textAlign: "left", padding: 24, margin: 0, width: 88, borderWidth: 0, borderRadius: 18, shadow: "none", depth: "none", borderStyle: "none", glow: "none" },
  soft: { color: "#334155", backgroundColor: "#eff6ff", fontSize: 40, fontWeight: 700, textAlign: "left", padding: 30, margin: 0, width: 88, borderWidth: 0, borderRadius: 24, shadow: "soft", depth: "none", borderStyle: "none", glow: "none" },
  business: { color: "#102a43", backgroundColor: "#ffffff", fontSize: 38, fontWeight: 700, textAlign: "left", padding: 20, margin: 0, width: 92, borderWidth: 2, borderRadius: 6, shadow: "none", depth: "none", borderStyle: "solid", glow: "none" },
  luxury: { color: "#f8fafc", backgroundColor: "#1e293b", fontSize: 44, fontWeight: 700, textAlign: "center", padding: 34, margin: 0, width: 88, borderWidth: 1, borderRadius: 12, shadow: "strong", depth: "none", borderStyle: "solid", glow: "none" },
  pop: { color: "#7c2d12", backgroundColor: "#fed7aa", fontSize: 46, fontWeight: 700, textAlign: "center", padding: 28, margin: 0, width: 86, borderWidth: 4, borderRadius: 30, shadow: "soft", depth: "emboss", borderStyle: "solid", glow: "none" },
};

document.querySelectorAll("[data-preset]").forEach((button) => button.addEventListener("click", () => {
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
document.querySelectorAll("[data-page-background]").forEach((button) => button.addEventListener("click", () => { model.page.backgroundColor = button.dataset.pageBackground; render(); }));

function addTextPart(type) {
  const id = `${type}-${model.elements.length + 1}`;
  const bodyStyle = { color: "#334155", backgroundColor: "#ffffff", fontSize: 18, fontWeight: 400, textAlign: "left", lineHeight: 1.8, padding: 18, margin: 12, width: 92, borderWidth: 0, borderColor: "#b9d0ff", borderRadius: 12, shadow: "none", depth: "none", borderStyle: "none", glow: "none" };
  const column = model.layout === "two" ? model.selectedColumn : "left";
  const template = type === "body" ? { id, type, column, format: "plain", content: "サービスの特徴や、お客さまへのメッセージをここに入力できます。", style: bodyStyle } : { ...structuredClone(initialModel.elements[0]), id, type, column, content: "ここに見出しを入力できます。" };
  model.elements.push(template);
  model.selectedId = id;
  render();
}

document.querySelector("#add-text").addEventListener("click", () => addTextPart("heading"));
document.querySelector("#add-body").addEventListener("click", () => addTextPart("body"));
document.querySelector("#add-two-columns").addEventListener("click", () => {
  model.layout = "two";
  model.elements.forEach((element) => { element.column = "left"; });
  model.selectedColumn = "right";
  model.selectedId = null;
  render();
});
document.querySelectorAll("[data-body-format]").forEach((button) => button.addEventListener("click", () => {
  if (!hasSelection() || selectedElement().type !== "body") return;
  selectedElement().format = button.dataset.bodyFormat;
  render();
}));
document.querySelector("#add-image").addEventListener("click", () => imageFile.click());
imageFile.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const id = `image-${model.elements.length + 1}`;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    model.elements.push({ id, type: "image", column: model.layout === "two" ? model.selectedColumn : "left", content: "", src: reader.result, alt: file.name.replace(/\\.[^.]+$/, ""), style: { color: "#18222f", backgroundColor: "transparent", fontSize: 16, fontWeight: 400, textAlign: "left", lineHeight: 1.4, padding: 0, margin: 16, width: 100, borderWidth: 0, borderColor: "#b9d0ff", borderRadius: 12, shadow: "none", depth: "none", borderStyle: "none", glow: "none" } });
    model.selectedId = id;
    event.target.value = "";
    render();
  });
  reader.readAsDataURL(file);
});

document.querySelector("#reset-page").addEventListener("click", () => {
  model.layout = initialModel.layout;
  model.elements = structuredClone(initialModel.elements);
  model.selectedId = initialModel.selectedId;
  model.selectedColumn = "left";
  model.activePreset = "simple";
  render();
});

window.addEventListener("message", (event) => {
  if (event.data?.type === "select" && model.elements.some((element) => element.id === event.data.id)) {
    model.selectedId = event.data.id;
    model.selectedColumn = event.data.column || model.elements.find((element) => element.id === event.data.id)?.column || "left";
    render();
  } else if (event.data?.type === "select-column" && (event.data.column === "left" || event.data.column === "right")) {
    model.selectedColumn = event.data.column;
    model.selectedId = null;
    render();
  } else if (event.data?.type === "clear-selection") {
    model.selectedId = null;
    render();
  }
});

render();
