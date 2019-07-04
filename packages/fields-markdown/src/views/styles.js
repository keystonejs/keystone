export let styles = `
  /* BASICS */

  .CodeMirror {
    /* Set height, width, borders, and global font properties here */
    font-family: monospace;
    height: 300px;
    color: black;
  }

  /* PADDING */

  .CodeMirror-lines {
    padding: 4px 0; /* Vertical padding around content */
  }
  .CodeMirror pre {
    padding: 0 4px; /* Horizontal padding of content */
  }

  .CodeMirror-scrollbar-filler,
  .CodeMirror-gutter-filler {
    background-color: white; /* The little square between H and V scrollbars */
  }

  /* GUTTER */

  .CodeMirror-gutters {
    border-right: 1px solid #ddd;
    background-color: #f7f7f7;
    white-space: nowrap;
  }
  .CodeMirror-linenumbers {
  }
  .CodeMirror-linenumber {
    padding: 0 3px 0 5px;
    min-width: 20px;
    text-align: right;
    color: #999;
    -moz-box-sizing: content-box;
    box-sizing: content-box;
  }

  .CodeMirror-guttermarker {
    color: black;
  }
  .CodeMirror-guttermarker-subtle {
    color: #999;
  }

  /* CURSOR */

  .CodeMirror div.CodeMirror-cursor {
    border-left: 1px solid black;
  }
  /* Shown when moving in bi-directional text */
  .CodeMirror div.CodeMirror-secondarycursor {
    border-left: 1px solid silver;
  }
  .CodeMirror.cm-fat-cursor div.CodeMirror-cursor {
    width: auto;
    border: 0;
    background: #7e7;
  }
  .CodeMirror.cm-fat-cursor div.CodeMirror-cursors {
    z-index: 1;
  }

  .cm-animate-fat-cursor {
    width: auto;
    border: 0;
    -webkit-animation: blink 1.06s steps(1) infinite;
    -moz-animation: blink 1.06s steps(1) infinite;
    animation: blink 1.06s steps(1) infinite;
  }
  @-moz-keyframes blink {
    0% {
      background: #7e7;
    }
    50% {
      background: none;
    }
    100% {
      background: #7e7;
    }
  }
  @-webkit-keyframes blink {
    0% {
      background: #7e7;
    }
    50% {
      background: none;
    }
    100% {
      background: #7e7;
    }
  }
  @keyframes blink {
    0% {
      background: #7e7;
    }
    50% {
      background: none;
    }
    100% {
      background: #7e7;
    }
  }

  /* Can style cursor different in overwrite (non-insert) mode */
  div.CodeMirror-overwrite div.CodeMirror-cursor {
  }

  .cm-tab {
    display: inline-block;
    text-decoration: inherit;
  }

  .CodeMirror-ruler {
    border-left: 1px solid #ccc;
    position: absolute;
  }

  /* DEFAULT THEME */

  .cm-s-default .cm-keyword {
    color: #708;
  }
  .cm-s-default .cm-atom {
    color: #219;
  }
  .cm-s-default .cm-number {
    color: #164;
  }
  .cm-s-default .cm-def {
    color: #00f;
  }
  .cm-s-default .cm-variable,
  .cm-s-default .cm-punctuation,
  .cm-s-default .cm-property,
  .cm-s-default .cm-operator {
  }
  .cm-s-default .cm-variable-2 {
    color: #05a;
  }
  .cm-s-default .cm-variable-3 {
    color: #085;
  }
  .cm-s-default .cm-comment {
    color: #a50;
  }
  .cm-s-default .cm-string {
    color: #a11;
  }
  .cm-s-default .cm-string-2 {
    color: #f50;
  }
  .cm-s-default .cm-meta {
    color: #555;
  }
  .cm-s-default .cm-qualifier {
    color: #555;
  }
  .cm-s-default .cm-builtin {
    color: #30a;
  }
  .cm-s-default .cm-bracket {
    color: #997;
  }
  .cm-s-default .cm-tag {
    color: #170;
  }
  .cm-s-default .cm-attribute {
    color: #00c;
  }
  .cm-s-default .cm-header {
    color: blue;
  }
  .cm-s-default .cm-quote {
    color: #090;
  }
  .cm-s-default .cm-hr {
    color: #999;
  }
  .cm-s-default .cm-link {
    color: #00c;
  }

  .cm-negative {
    color: #d44;
  }
  .cm-positive {
    color: #292;
  }
  .cm-header,
  .cm-strong {
    font-weight: bold;
  }
  .cm-em {
    font-style: italic;
  }
  .cm-link {
    text-decoration: underline;
  }
  .cm-strikethrough {
    text-decoration: line-through;
  }

  .cm-s-default .cm-error {
    color: #f00;
  }
  .cm-invalidchar {
    color: #f00;
  }

  /* Default styles for common addons */

  div.CodeMirror span.CodeMirror-matchingbracket {
    color: #0f0;
  }
  div.CodeMirror span.CodeMirror-nonmatchingbracket {
    color: #f22;
  }
  .CodeMirror-matchingtag {
    background: rgba(255, 150, 0, 0.3);
  }
  .CodeMirror-activeline-background {
    background: #e8f2ff;
  }

  /* STOP */

  /* The rest of this file contains styles related to the mechanics of
   the editor. You probably shouldn't touch them. */

  .CodeMirror {
    position: relative;
    overflow: hidden;
    background: white;
  }

  .CodeMirror-scroll {
    overflow: scroll !important; /* Things will break if this is overridden */
    /* 30px is the magic margin used to hide the element's real scrollbars */
    /* See overflow: hidden in .CodeMirror */
    margin-bottom: -30px;
    margin-right: -30px;
    padding-bottom: 30px;
    height: 100%;
    outline: none; /* Prevent dragging from highlighting the element */
    position: relative;
    -moz-box-sizing: content-box;
    box-sizing: content-box;
  }
  .CodeMirror-sizer {
    position: relative;
    border-right: 30px solid transparent;
    -moz-box-sizing: content-box;
    box-sizing: content-box;
  }

  /* The fake, visible scrollbars. Used to force redraw during scrolling
   before actuall scrolling happens, thus preventing shaking and
   flickering artifacts. */
  .CodeMirror-vscrollbar,
  .CodeMirror-hscrollbar,
  .CodeMirror-scrollbar-filler,
  .CodeMirror-gutter-filler {
    position: absolute;
    z-index: 6;
    display: none;
  }
  .CodeMirror-vscrollbar {
    right: 0;
    top: 0;
    overflow-x: hidden;
    overflow-y: scroll;
  }
  .CodeMirror-hscrollbar {
    bottom: 0;
    left: 0;
    overflow-y: hidden;
    overflow-x: scroll;
  }
  .CodeMirror-scrollbar-filler {
    right: 0;
    bottom: 0;
  }
  .CodeMirror-gutter-filler {
    left: 0;
    bottom: 0;
  }

  .CodeMirror-gutters {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 3;
  }
  .CodeMirror-gutter {
    white-space: normal;
    height: 100%;
    -moz-box-sizing: content-box;
    box-sizing: content-box;
    display: inline-block;
    margin-bottom: -30px;
    /* Hack to make IE7 behave */
    *zoom: 1;
    *display: inline;
  }
  .CodeMirror-gutter-wrapper {
    position: absolute;
    z-index: 4;
    height: 100%;
  }
  .CodeMirror-gutter-elt {
    position: absolute;
    cursor: default;
    z-index: 4;
  }
  .CodeMirror-gutter-wrapper {
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
  }

  .CodeMirror-lines {
    cursor: text;
    min-height: 1px; /* prevents collapsing before first draw */
  }
  .CodeMirror pre {
    /* Reset some styles that the rest of the page might have set */
    -moz-border-radius: 0;
    -webkit-border-radius: 0;
    border-radius: 0;
    border-width: 0;
    background: transparent;
    font-family: inherit;
    font-size: inherit;
    margin: 0;
    white-space: pre;
    word-wrap: normal;
    line-height: inherit;
    color: inherit;
    z-index: 2;
    position: relative;
    overflow: visible;
    -webkit-tap-highlight-color: transparent;
  }
  .CodeMirror-wrap pre {
    word-wrap: break-word;
    white-space: pre-wrap;
    word-break: normal;
  }

  .CodeMirror-linebackground {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 0;
  }

  .CodeMirror-linewidget {
    position: relative;
    z-index: 2;
    overflow: auto;
  }

  .CodeMirror-widget {
  }

  .CodeMirror-code {
    outline: none;
  }

  .CodeMirror-measure {
    position: absolute;
    width: 100%;
    height: 0;
    overflow: hidden;
    visibility: hidden;
  }
  .CodeMirror-measure pre {
    position: static;
  }

  .CodeMirror div.CodeMirror-cursor {
    position: absolute;
    border-right: none;
    width: 0;
  }

  div.CodeMirror-cursors {
    visibility: hidden;
    position: relative;
    z-index: 3;
  }
  .CodeMirror-focused div.CodeMirror-cursors {
    visibility: visible;
  }

  .CodeMirror-selected {
    background: #d9d9d9;
  }
  .CodeMirror-focused .CodeMirror-selected {
    background: #d7d4f0;
  }
  .CodeMirror-crosshair {
    cursor: crosshair;
  }
  .CodeMirror ::selection {
    background: #d7d4f0;
  }
  .CodeMirror ::-moz-selection {
    background: #d7d4f0;
  }

  .cm-searching {
    background: #ffa;
    background: rgba(255, 255, 0, 0.4);
  }

  /* IE7 hack to prevent it from returning funny offsetTops on the spans */
  .CodeMirror span {
    *vertical-align: text-bottom;
  }

  /* Used to force a border model for a node */
  .cm-force-border {
    padding-right: 0.1px;
  }

  @media print {
    /* Hide the cursor when printing */
    .CodeMirror div.CodeMirror-cursors {
      visibility: hidden;
    }
  }

  /* See issue #2901 */
  .cm-tab-wrap-hack:after {
    content: '';
  }

  /* Help users use markselection to safely style text background */
  span.CodeMirror-selectedtext {
    background: none;
  }

  .cm-s-mirrormark .cm-m-markdown {
    color: #000;
    font-family: sans-serif;
  }
  .cm-s-mirrormark .cm-m-markdown.cm-header {
    font-family: Menlo, Consolas, Monaco, 'Andale Mono', monospace;
    font-weight: bold;
  }
  .cm-s-mirrormark .cm-m-markdown.cm-header-1 {
    font-size: 28px;
  }
  .cm-s-mirrormark .cm-m-markdown.cm-header-2 {
    font-size: 22px;
  }
  .cm-s-mirrormark .cm-m-markdown.cm-header-2 {
    font-size: 18px;
  }
  .cm-s-mirrormark .cm-m-markdown.cm-quote {
    color: #888;
    background-color: rgba(128, 128, 128, 0.05);
    padding: 5px;
  }
  .cm-s-mirrormark .cm-m-markdown.cm-quote,
  .cm-s-mirrormark .cm-m-markdown.cm-string {
    color: #888;
  }
  .cm-s-mirrormark .cm-m-markdown.cm-tag,
  .cm-s-mirrormark .cm-m-markdown.cm-link {
    color: #444;
  }
  .cm-s-mirrormark .cm-m-markdown.cm-comment {
    color: #a50;
    font-family: Menlo, Consolas, Monaco, 'Andale Mono', monospace;
  }
  .cm-s-mirrormark .cm-m-markdown.cm-m-xml,
  .cm-s-mirrormark .cm-m-markdown.cm-bracket {
    color: #170;
    font-family: inherit;
  }
  .cm-s-mirrormark.CodeMirror.CodeMirror-has-preview .CodeMirror-scroll {
    display: none;
  }
  .cm-s-mirrormark.CodeMirror.CodeMirror-has-preview .CodeMirror-preview {
    display: block;
  }
  .cm-s-mirrormark.CodeMirror .CodeMirror-preview {
    display: none;
    height: auto !important;
    overflow: visible !important;
    padding: 30px 4%;
    box-sizing: border-box;
    font-family: sans-serif;
  }
  .cm-s-mirrormark.CodeMirror .CodeMirror-preview h1,
  .cm-s-mirrormark.CodeMirror .CodeMirror-preview h2,
  .cm-s-mirrormark.CodeMirror .CodeMirror-preview h3 {
    font-fami: Menlo, Consolas, Monaco, 'Andale Mono', monospace;
  }
  .cm-s-mirrormark.CodeMirror .CodeMirror-preview pre,
  .cm-s-mirrormark.CodeMirror .CodeMirror-preview code {
    font-family: Menlo, Consolas, Monaco, 'Andale Mono', monospace;
  }
  .cm-s-mirrormark.CodeMirror .CodeMirror-fullscreen .CodeMirror-preview {
    height: 100% !important;
    overflow: scroll !important;
  }
  .mirrormark-toolbar li > a {
    display: inline-block;
    font: normal normal normal 14px/1 FontAwesome;
    font-size: inherit;
    text-rendering: auto;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    transform: translate(0, 0);
  }
  .mirrormark-toolbar li > a.pull-left {
    margin-right: 0.3em;
  }
  .mirrormark-toolbar li > a.pull-right {
    margin-left: 0.3em;
  }
  .mirrormark-toolbar .bold a:before {
    content: '\\f032';
  }
  .mirrormark-toolbar .italicize a:before {
    content: '\\f033';
  }
  .mirrormark-toolbar .blockquote a:before {
    content: '\\f10d';
  }
  .mirrormark-toolbar .strikethrough a:before {
    content: '\\f0cc';
  }
  .mirrormark-toolbar .link a:before {
    content: '\\f0c1';
  }
  .mirrormark-toolbar .image a:before {
    content: '\\f03e';
  }
  .mirrormark-toolbar .unorderedList a:before {
    content: '\\f03a';
  }
  .mirrormark-toolbar .orderedList a:before {
    content: '\\f0cb';
  }
  .mirrormark-toolbar .fullScreen a:before {
    content: '\\f065';
  }
  .mirrormark-toolbar .preview a:before {
    content: '\\f15b';
  }
  .cm-s-mirrormark.CodeMirror-fullscreen .mirrormark-toolbar .fullScreen a:before {
    content: '\\f066';
  }
  .cm-s-mirrormark.CodeMirror-has-preview .mirrormark-toolbar .preview a:before {
    content: '\\f016';
  }
  /* Toolbar Theme */
  .mirrormark-toolbar {
    background: #fff;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    display: block;
    width: 100%;
    margin-top: 0;
    margin-bottom: 0;
    padding-left: 0;
    padding-right: 0;
    /* First level */
  }
  .mirrormark-toolbar li {
    display: inline-block;
    position: relative;
    z-index: 1;
  }
  .mirrormark-toolbar li.fullScreen,
  .mirrormark-toolbar li.preview {
    float: right;
  }
  .mirrormark-toolbar li.has-nested:after {
    content: '\\2304';
    color: #888;
    position: absolute;
    bottom: 3px;
    right: 3px;
    font-size: 11px;
    transform: scale(1.3, 1);
  }
  .mirrormark-toolbar li a {
    background-color: #fff;
    color: #888;
    cursor: pointer;
    display: block;
    font-size: 16px;
    height: 40px;
    line-height: 40px;
    text-align: center;
    transition: color 0.2s linear;
    width: 40px;
  }
  .mirrormark-toolbar li:hover a,
  .mirrormark-toolbar li:hover.has-nested:after {
    color: #000;
  }
  .mirrormark-toolbar li:hover ul {
    display: block;
  }
  .mirrormark-toolbar li ul {
    background: #e5e5e5;
    display: none;
    position: absolute;
    top: 41px;
    width: 150px;
    z-index: 1000;
  }
  .mirrormark-toolbar li ul li {
    float: none;
    width: 100%;
  }
  .mirrormark-toolbar li ul li a {
    background: transparent;
    color: #888 !important;
    font-family: 'Helvetica Neue', sans-serif;
    font-size: 12px;
    height: auto;
    line-height: normal;
    padding: 0.25rem 0.75rem;
    text-align: left;
    width: auto;
  }
  .mirrormark-toolbar li ul li:hover a {
    color: black !important;
  }
  .cm-s-mirrormark {
    font: 16px/1.7 Menlo, Consolas, Monaco, 'Andale Mono', monospace;
    box-sizing: border-box;
    height: auto;
    margin: auto;
    position: relative;
    z-index: 0;
  }
  .cm-s-mirrormark .CodeMirror-scroll {
    height: auto !important;
    overflow: visible !important;
    padding: 30px 4%;
    box-sizing: border-box;
  }
  .cm-s-mirrormark.CodeMirror-fullscreen .CodeMirror-scroll {
    height: 100% !important;
    overflow: scroll !important;
  }
  .cm-s-mirrormark pre.CodeMirror-placeholder {
    color: #999;
  }

  .CodeMirror-fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: auto;
    z-index: 9;
  }

  .CodeMirror-dialog {
    position: absolute;
    left: 0;
    right: 0;
    background: white;
    z-index: 15;
    padding: 0.1em 0.8em;
    overflow: hidden;
    color: #333;
  }

  .CodeMirror-dialog-top {
    border-bottom: 1px solid #eee;
    top: 0;
  }

  .CodeMirror-dialog-bottom {
    border-top: 1px solid #eee;
    bottom: 0;
  }

  .CodeMirror-dialog input {
    border: none;
    outline: none;
    background: transparent;
    width: 20em;
    color: inherit;
    font-family: monospace;
  }

  .CodeMirror-dialog button {
    font-size: 70%;
  }

  .CodeMirror-search-match {
    background: gold;
    border-top: 1px solid orange;
    border-bottom: 1px solid orange;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    opacity: 0.5;
  }
`;
