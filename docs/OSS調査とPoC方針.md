# 0EN Builder：参考OSS調査とPoC①方針

調査日：2026-10-16  
対象：`dontakosu1975/0EN-Builder` の `README.md` と `docs/企画書.md`、および以下の公開OSS・デモ

- [VvvebJs](https://github.com/givanz/VvvebJs) / [Live Demo](https://www.vvveb.com/vvvebjs/editor.html)
- [GrapesJS](https://github.com/GrapesJS/grapesjs) / [Demo](https://grapesjs.com/demo.html)
- [Silex](https://github.com/silexlabs/Silex) / [Editor](https://editor.silex.me/)
- [synapxLab/wysiwyg](https://github.com/synapxLab/wysiwyg) / [Live demo](https://synapx.fr/sdk/wysiwyg/)

## 前提

0EN Builderの核は「CSSを簡単にする」ことではなく、「CSSを知らなくてもCSSを使えるようにする」ことである。初心者には日常語・視覚操作を見せ、必要になった利用者だけが詳細設定やHTML/CSSへ降りられるようにする。出力は普通のHTML/CSSを優先し、0EN専用形式へのロックインは避ける。

企画書に従い、PoC①は「HTML/CSSをGUI化すると本当に初心者向けになるか」を触って確認する実験とする。高機能なBuilderの完成を目的にしない。

## 1. 参考OSS調査結果

### VvvebJs

確認した構造は、`editor.html` が画面全体、`html/_canvas.html` がキャンバス内UI、`libs/builder/builder.js` がBuilder本体、`inputs.js` が入力UI、各 `components*.js` が要素定義、`undo.js` が履歴を担当する構成である。READMEにも、Vanilla JS・ビルドツールなし、左右パネル、コンポーネント／セクション／ブロック、Undo/Redo、ライブコード編集、HTML exportが明記されている。

デモを確認すると、左側に Pages / Components / Sections、右側に Style / Properties、中央に編集対象のiframeがあり、選択した要素の周囲に選択枠とパンくずが出る。コード表示・Preview・Downloadも上部操作にまとまっている。

使える仕組み：

- 編集キャンバスと操作パネルを分離する構造
- iframe内のページを編集し、親側のUIから制御する考え方
- 選択要素をコンポーネント定義から判定し、入力項目を組み立てる考え方
- 生成HTMLをそのまま保存・ダウンロードする導線

0EN Builderには重すぎる部分：

- Bootstrap部品、セクション、ウィジェット、画像管理などの大量の初期部品
- 既存HTMLの任意要素をすべて編集可能にする汎用判定
- PHP/Node保存、ファイルマネージャ、複数ページ

### GrapesJS

GrapesJSは完成画面よりもFrameworkとしての分離が重要である。`Editor`から `Canvas`、`StyleManager`、`BlockManager`、`LayerManager`、`StorageManager`等へアクセスし、設定でも `canvas`、`styleManager`、`blockManager`、`storageManager`、`deviceManager` などを独立モジュールとして扱う。Componentモデル、Style Manager、Block、Canvas、Storageがイベントを介して結びつく。

デモでは中央iframeのページ、左側の部品・操作領域、Style Manager / Layer Manager / Blocksの切り替え、Preview、View codeが確認できた。ダブルクリックでテキストを編集でき、コード表示ではHTML/CSSを別々に扱える。

使える仕組み：

- `Component model → Canvas render → Style/Block/Storage` の責務分離
- 将来の入れ子構造・レスポンシブ・保存を見越した拡張点
- Style Managerを差し替えて、内部のCSSプロパティを利用者向けの言葉へ翻訳できる余地

0EN Builderには重すぎる部分：

- 任意のHTML構造、クラス、セレクタ、レスポンシブ、Asset Managerを最初から扱うこと
- プラグインとイベントを大量に導入すること
- 初心者にそのままStyle Managerを見せること

### Silex

SilexはGrapesJSを核に、ページ、テンプレート、公開、HTML HEAD / CSS / JavaScript編集、レスポンシブ表示、ファイル操作を製品UXとして組み立てている。`editor/grapesjs/index.ts` では多数のプラグインを登録し、ページ・ブロック・シンボル・CSS変数・公開・ストレージ等を追加している。公開処理はHTMLファイルとCSS等を成果物として扱う。

デモでは上部にFile / Add elements / Code / Pages / Undo / Redo / Preview / Mobile / Settingsが並び、選択要素の右側にPosition and size、Layout、Margin、Padding、SEO & Accessibility、Border、Elementなどが表示される。初心者導線として、Text / Image / Container / Sectionを追加できる一方、詳細編集への出口も明確である。

使える思想：

- 初心者向けの部品追加と、HTML/CSS/JSへ降りる導線を同一編集環境に置く
- 公開成果物を標準ファイルとして扱い、エディタ専用形式を絶対条件にしない
- 「簡単な入口」と「高度な出口」を分離する

0EN Builderには重すぎる部分：

- 認証、CMS、クラウド保存、複数ページ、公開先の統合
- 大量のGrapesJSプラグインと詳細レイアウトの早期導入
- 最初からSEO、Flex、レスポンシブ、CSS変数まで見せること

### synapxLab/wysiwyg

synapxLab/wysiwygはcontenteditableを基礎にしたゼロ依存のTypeScriptエディタで、`getValue()` / `setValue()` でHTMLを読み書きする。デモではSource HTML、Undo/Redo、左・中央・右寄せ、文字サイズ、太字、文字色、背景色、HTMLコピー、HTMLダウンロードが一つの編集面に並ぶ。ブロックをホバーするとProperties / CSS raw / Move / Duplicate / DeleteのInspectorが出る。

使える仕組み：

- 「今選択しているもの」を直接操作する分かりやすさ
- HTML sourceとWYSIWYGを同じ内容から切り替える導線
- Undo/RedoとHTML exportを小さなAPIとして切り出すこと

0EN Builderには重すぎる部分：

- リッチテキスト編集、表、Mermaid、KaTeX、SVG、Twig、PDF等をPoCに持ち込むこと
- contenteditableのブラウザ差異を、ページ構造編集の基盤まで広げること

## 2. 0EN Builderへ取り入れる考え方

- 左：将来の追加部品。ただしPoC①では「テキストを追加」だけにする。
- 中央：ページの結果を見せるライブプレビュー。選択中であることを枠と状態表示で知らせる。
- 右：選択中の文章に対する「文字の色」「文字の大きさ」「文字の位置」「内側の余白」のような日常語UI。
- 内部は `GUI操作 → 内部モデル → HTML/CSS生成 → iframe Preview` の一方向フローにする。
- HTMLとCSSを別々に確認できる出口を常に残す。
- 将来の詳細設定は、初心者向けUIを壊さない別レベルとして追加する。

## 3. 今は取り入れないもの

本格的なドラッグ＆ドロップ、任意のDOM編集、複雑な入れ子、テーブル、Flex／グリッド、複数ページ、画像アップロード、アセット管理、レスポンシブブレークポイント、クラウドストレージ、ログイン、CMS、AI補助、汎用プラグインシステムはPoC①の対象外とする。

`contenteditable`による直接編集も、モデルとの同期仕様が固まる前には必須にしない。まずは右ペインの「文章」入力を入口にし、プレビュー選択との同期を成立させる。

## 4. PoC①の画面構成

1. 左ペイン：追加できるもの（テキスト追加、リセット）
2. 中央：iframeのライブプレビュー。文章をクリックすると選択状態になる。
3. 右ペイン：選択中の文章の設定。文章、文字色、背景色、文字サイズ、太字、文字位置、行間、内側／外側の余白、幅、枠線、角の丸みを操作する。
4. 中央下部：折りたたみ式の生成HTML/CSS。通常操作の邪魔をしないが、いつでも標準出力を確認できる。

## 5. PoC①の内部構造

ビルド工程なしのVanilla HTML/CSS/JSで実装する。内部モデルは次のような小さな配列とする。

```js
{
  elements: [{
    id: 'hero-title',
    type: 'text',
    content: '...',
    style: {
      color, backgroundColor, fontSize, fontWeight, textAlign,
      lineHeight, padding, margin, width, borderWidth, borderColor, borderRadius
    }
  }],
  selectedId: 'hero-title'
}
```

右ペインの入力はモデルだけを更新し、モデルからHTML/CSS文字列とiframeの `srcdoc` を毎回生成する。iframe内のクリックは `postMessage` で選択IDを親へ伝え、親が選択状態と入力欄を同期する。PoCでは同一オリジンへの直接DOM書き換えを前提にしない。

## 6. 実装対象／対象外

実装対象：テキスト編集、文字色、背景色、文字サイズ、太字、左／中央／右寄せ、行間、内側の余白、外側の余白、幅、枠線、角の丸み、即時プレビュー、HTML/CSS確認、テキスト追加、リセット。

対象外：本格的D&D、画像・ボタン、複雑なセクション、カラム、複数ページ、保存・ログイン・バックエンド、外部OSSコードのコピー、GrapesJS等の依存追加。

## 7. 将来拡張を壊さないため最低限残す設計

- 要素を単一DOMではなく `elements` のモデルとして持つ。
- `type` と `id` を持たせ、将来 `section`、`image`、`button` を追加できる形にする。
- styleキーはCSS名をそのまま画面ラベルにしない。翻訳層をUI側に置く。
- rendererをUIイベントから分離する。
- HTML/CSS生成を一箇所に集約し、将来のExport・Preview・保存で共有する。
- 選択はDOMノードそのものではなく安定した要素IDで扱う。
- iframeとの通信境界を残し、将来のPreview sandboxや外部HTML読み込みに備える。
- Undo/Redoは次段階でモデルのスナップショット履歴として追加する。ブラウザのDOM履歴に依存しない。

## 8. ライセンス上の注意点

今回のPoCは4つのOSSのコードをコピー・改変せず、画面構造・UX・責務分離を参考にした独自実装とする。したがって、これらのライセンス文面や著作権表示をPoCコードへ取り込む必要はないが、参考元とライセンスは本書に記録する。

| OSS | ライセンス | 今回の扱い |
| --- | --- | --- |
| VvvebJs | Apache-2.0 | コード不使用。iframeキャンバス、パネル、export思想を参考にする。 |
| GrapesJS | BSD-3-Clause | コード不使用。Component / Canvas / Style / Storageの分離を参考にする。 |
| Silex | AGPL-3.0 | コード不使用。標準ファイル出力と初心者から高度編集への導線を参考にする。 |
| synapxLab/wysiwyg | MIT | コード不使用。選択Inspector、source、HTML exportを参考にする。 |

将来これらのコードまたはパッケージを直接取り込む場合は、採用するコミット、対象ファイル、依存関係、ライセンス表示、NOTICE要否、AGPLのネットワーク利用条件を採用前に別文書で確定する。現時点ではライセンスを決め打ちせず、PoCの独自実装で体験を検証する。

## 実装後の検証観点

Playwrightで、説明書なしの初見利用者を想定して次の操作を通す。

`文章を選択 → 文章を変更 → 文字の色を変更 → 文字を大きくする → 中央にする → 余白を付ける → HTMLを見る`

検証では、操作が完了したかだけでなく、選択対象が分かるか、右ペインの日本語が意味を伝えるか、変更が即時に中央へ反映されるか、生成HTML/CSSが普通のWeb技術として読めるか、途中でCSS用語を要求されないかを記録する。
