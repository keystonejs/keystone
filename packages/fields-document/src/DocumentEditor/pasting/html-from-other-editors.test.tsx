/** @jest-environment jsdom */
/** @jsxRuntime classic */
/** @jsx jsx */
import { makeEditor, jsx } from '../tests/utils';
import { MyDataTransfer } from './data-transfer';

// TODO: lists from notion have a newline in the list item before a nested list
// (i'm guessing this is because notion does the Right thing with nested lists
// by having them as the child of the last list item and
// the document editor does the wrong thing by having the nested list as a direct child of the list)
// TODO: Word and Pages maybe? (i believe the data is massive mess though so not super eager for it rn)

const deserializeHTML = (html: string) => {
  let editor = makeEditor(
    <editor>
      <paragraph>
        <text>
          <cursor />
        </text>
      </paragraph>
    </editor>
  );
  const data = new MyDataTransfer();
  data.setData('text/html', html);
  editor.insertData(data);
  return editor;
};

test('confluence', () => {
  expect(
    deserializeHTML(
      `<h1 data-pm-slice="1 1 []">Heading 1</h1><h2>Heading 2</h2><h3>Heading 3</h3><h4>Heading 4</h4><h5>Heading 5</h5><h6>Heading 6</h6><pre><code>some code</code></pre><blockquote><p>blockquote</p></blockquote><p><strong>bold</strong></p><p><em>italic</em></p><p><s>strikethrough</s></p><p><u>underline</u></p><p><span style="white-space: pre-wrap;" class="code" spellcheck="false">inline code</span></p><p><sub>subscript</sub></p><p><sup>superscript</sup></p><p><a href="https://keystonejs.com">A link</a></p><hr><ul class="ak-ul"><li><p>unordered list</p></li><li><p>item</p><ul class="ak-ul"><li><p>nested item</p></li></ul></li></ul><ol class="ak-ol"><li><p>ordered list</p></li><li><p>item</p><ol class="ak-ol"><li><p>nested item</p></li></ol></li></ol><p>some text<br>there is a break before this</p><div class="fabric-editor-block-mark fabric-editor-align-center" data-align="center"><p>align center</p></div><div class="fabric-editor-block-mark fabric-editor-align-end" data-align="end"><p>align end</p></div><div class="fabric-editor-block-mark fabric-editor-align-center" data-align="center"><h1>heading align center</h1></div><div class="fabric-editor-block-mark fabric-editor-align-end" data-align="end"><h1>heading align end</h1></div>`
    )
  ).toMatchInlineSnapshot(`
    <editor>
      <heading
        level={1}
      >
        <text>
          Heading 1
        </text>
      </heading>
      <heading
        level={2}
      >
        <text>
          Heading 2
        </text>
      </heading>
      <heading
        level={3}
      >
        <text>
          Heading 3
        </text>
      </heading>
      <heading
        level={4}
      >
        <text>
          Heading 4
        </text>
      </heading>
      <heading
        level={5}
      >
        <text>
          Heading 5
        </text>
      </heading>
      <heading
        level={6}
      >
        <text>
          Heading 6
        </text>
      </heading>
      <code>
        <text>
          some code
        </text>
      </code>
      <blockquote>
        <paragraph>
          <text>
            blockquote
          </text>
        </paragraph>
      </blockquote>
      <paragraph>
        <text
          bold={true}
        >
          bold
        </text>
      </paragraph>
      <paragraph>
        <text
          italic={true}
        >
          italic
        </text>
      </paragraph>
      <paragraph>
        <text
          strikethrough={true}
        >
          strikethrough
        </text>
      </paragraph>
      <paragraph>
        <text
          underline={true}
        >
          underline
        </text>
      </paragraph>
      <paragraph>
        <text
          code={true}
        >
          inline code
        </text>
      </paragraph>
      <paragraph>
        <text
          subscript={true}
        >
          subscript
        </text>
      </paragraph>
      <paragraph>
        <text
          superscript={true}
        >
          superscript
        </text>
      </paragraph>
      <paragraph>
        <text>
          
        </text>
        <link
          @@isInline={true}
          href="https://keystonejs.com"
        >
          <text>
            A link
          </text>
        </link>
        <text>
          
        </text>
      </paragraph>
      <divider
        @@isVoid={true}
      >
        <text>
          
        </text>
      </divider>
      <unordered-list>
        <list-item>
          <list-item-content>
            <text>
              unordered list
            </text>
          </list-item-content>
        </list-item>
        <list-item>
          <list-item-content>
            <text>
              item
            </text>
          </list-item-content>
          <unordered-list>
            <list-item>
              <list-item-content>
                <text>
                  nested item
                </text>
              </list-item-content>
            </list-item>
          </unordered-list>
        </list-item>
      </unordered-list>
      <ordered-list>
        <list-item>
          <list-item-content>
            <text>
              ordered list
            </text>
          </list-item-content>
        </list-item>
        <list-item>
          <list-item-content>
            <text>
              item
            </text>
          </list-item-content>
          <ordered-list>
            <list-item>
              <list-item-content>
                <text>
                  nested item
                </text>
              </list-item-content>
            </list-item>
          </ordered-list>
        </list-item>
      </ordered-list>
      <paragraph>
        <text>
          some text
    there is a break before this
        </text>
      </paragraph>
      <paragraph
        textAlign="center"
      >
        <text>
          align center
        </text>
      </paragraph>
      <paragraph
        textAlign="end"
      >
        <text>
          align end
        </text>
      </paragraph>
      <heading
        level={1}
        textAlign="center"
      >
        <text>
          heading align center
        </text>
      </heading>
      <heading
        level={1}
        textAlign="end"
      >
        <text>
          heading align end
          <cursor />
        </text>
      </heading>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});

// note that notion just doesn't serialize underline
test('notion', () => {
  expect(
    deserializeHTML(
      `<html><head><meta http-equiv="content-type" content="text/html; charset=utf-8"></head><body><h1>Heading 1</h1>
<h2>Heading 2</h2>
<h3>Heading 3</h3>
<pre><code>some code
</code></pre>
<blockquote>
<p>blockquote</p>
</blockquote>
<p><strong>bold</strong></p>
<p><em>italic</em></p>
<p><s>strikethrough</s></p>
<p>underline</p>
<p><code>inline code</code></p>
<p><a href="https://keystonejs.com/">A link</a></p>
<hr>
<ul>
<li>unordered list</li>
<li>item
<ul>
<li>nested item</li>
</ul>
</li>
</ul>
<ol>
<li>ordered list</li>
<li>item
<ol>
<li>nested item</li>
</ol>
</li>
</ol>
<p>some text
there is a break before this</p>
</body></html>
`
    )
  ).toMatchInlineSnapshot(`
    <editor>
      <heading
        level={1}
      >
        <text>
          Heading 1
        </text>
      </heading>
      <heading
        level={2}
      >
        <text>
          Heading 2
        </text>
      </heading>
      <heading
        level={3}
      >
        <text>
          Heading 3
        </text>
      </heading>
      <code>
        <text>
          some code

        </text>
      </code>
      <blockquote>
        <paragraph>
          <text>
            blockquote
          </text>
        </paragraph>
      </blockquote>
      <paragraph>
        <text
          bold={true}
        >
          bold
        </text>
      </paragraph>
      <paragraph>
        <text
          italic={true}
        >
          italic
        </text>
      </paragraph>
      <paragraph>
        <text
          strikethrough={true}
        >
          strikethrough
        </text>
      </paragraph>
      <paragraph>
        <text>
          underline
        </text>
      </paragraph>
      <paragraph>
        <text
          code={true}
        >
          inline code
        </text>
      </paragraph>
      <paragraph>
        <text>
          
        </text>
        <link
          @@isInline={true}
          href="https://keystonejs.com/"
        >
          <text>
            A link
          </text>
        </link>
        <text>
          
        </text>
      </paragraph>
      <divider
        @@isVoid={true}
      >
        <text>
          
        </text>
      </divider>
      <unordered-list>
        <list-item>
          <list-item-content>
            <text>
              unordered list
            </text>
          </list-item-content>
        </list-item>
        <list-item>
          <list-item-content>
            <text>
              item

            </text>
          </list-item-content>
          <unordered-list>
            <list-item>
              <list-item-content>
                <text>
                  nested item
                </text>
              </list-item-content>
            </list-item>
          </unordered-list>
        </list-item>
      </unordered-list>
      <ordered-list>
        <list-item>
          <list-item-content>
            <text>
              ordered list
            </text>
          </list-item-content>
        </list-item>
        <list-item>
          <list-item-content>
            <text>
              item

            </text>
          </list-item-content>
          <ordered-list>
            <list-item>
              <list-item-content>
                <text>
                  nested item
                </text>
              </list-item-content>
            </list-item>
          </ordered-list>
        </list-item>
      </ordered-list>
      <paragraph>
        <text>
          some text
    there is a break before this
          <cursor />
        </text>
      </paragraph>
    </editor>
  `);
});

// the input for this has been slightly modified to remove a class that looked like author-a-bunch-of-characters
// i wasn't sure if they identified my account or something so i removed them
// also, i'm not sure if paper lets you make stuff like super/subscript
// but i could paste it in
test('dropbox paper', () => {
  expect(
    deserializeHTML(
      `<div><h1><span class=" ">Heading 1</span></h1></div><div><h2><span class=" ">Heading 2</span></h2></div><div><span class=" ">Heading 3</span></div><div><code spellcheck="false" class="listtype-code listindent1 list-code1"><span class=" ">some code</span></code></div><div><ul style="list-style-type: none; font-style: italic; border-left: 1px solid;" class="listtype-quote listindent1 list-quote1"><li><span class=" ">blockquote</span></li></ul></div><div><span class="ace-all-bold-hthree"><span class=" "><b>bold</b></span></span></div><div><span class=" "><i>italic</i></span></div><div><span class=" "><s>strikethrough</s></span></div><div><span class=" ">inline code</span></div><div><span class=" "><sub>subscript</sub></span></div><div><span class=" "><sup>superscript</sup></span></div><div><span class="attrlink url "><a target="_blank" class="attrlink" data-target-href="https://keystonejs.com" href="https://keystonejs.com" rel="noreferrer nofollow noopener">A link</a></span></div><div><span class="ace-separator "><hr style="width: 100%;height: 1px;font-size: 1px;line-height: 16px;border-bottom: 1px solid #c1c7cd;display: inline-block;"></span></div><ul class="listtype-bullet listindent1 list-bullet1"><li><span class=" ">unordered list</span></li><li><span class=" ">item</span></li><ul class="listtype-bullet listindent2 list-bullet2"><li><span class=" ">nested item</span></li></ul></ul><ol  start="1" class="listtype-number listindent1 list-number1" style="list-style-type: decimal;"><li><span class=" ">ordered list</span></li><li><span class=" ">item</span></li><ol  start="1" class="listtype-number listindent2 list-number2" style="list-style-type: lower-latin;"><li><span class=" ">nested item</span></li></ol></ol><div><span class=" ">some text</span></div><div><span class=" ">more test</span></div>`
    )
  ).toMatchInlineSnapshot(`
    <editor>
      <heading
        level={1}
      >
        <text>
          Heading 1
        </text>
      </heading>
      <heading
        level={2}
      >
        <text>
          Heading 2
        </text>
      </heading>
      <paragraph>
        <text>
          Heading 3
        </text>
      </paragraph>
      <paragraph>
        <text
          code={true}
        >
          some code
        </text>
      </paragraph>
      <blockquote>
        <paragraph>
          <text>
            blockquote
          </text>
        </paragraph>
      </blockquote>
      <paragraph>
        <text
          bold={true}
        >
          bold
        </text>
      </paragraph>
      <paragraph>
        <text
          italic={true}
        >
          italic
        </text>
      </paragraph>
      <paragraph>
        <text
          strikethrough={true}
        >
          strikethrough
        </text>
      </paragraph>
      <paragraph>
        <text>
          inline code
        </text>
      </paragraph>
      <paragraph>
        <text
          subscript={true}
        >
          subscript
        </text>
      </paragraph>
      <paragraph>
        <text
          superscript={true}
        >
          superscript
        </text>
      </paragraph>
      <paragraph>
        <text>
          
        </text>
        <link
          @@isInline={true}
          href="https://keystonejs.com"
        >
          <text>
            A link
          </text>
        </link>
        <text>
          
        </text>
      </paragraph>
      <divider
        @@isVoid={true}
      >
        <text>
          
        </text>
      </divider>
      <unordered-list>
        <list-item>
          <list-item-content>
            <text>
              unordered list
            </text>
          </list-item-content>
        </list-item>
        <list-item>
          <list-item-content>
            <text>
              item
            </text>
          </list-item-content>
        </list-item>
        <list-item>
          <list-item-content>
            <text>
              nested item
            </text>
          </list-item-content>
        </list-item>
      </unordered-list>
      <ordered-list>
        <list-item>
          <list-item-content>
            <text>
              ordered list
            </text>
          </list-item-content>
        </list-item>
        <list-item>
          <list-item-content>
            <text>
              item
            </text>
          </list-item-content>
        </list-item>
        <list-item>
          <list-item-content>
            <text>
              nested item
            </text>
          </list-item-content>
        </list-item>
      </ordered-list>
      <paragraph>
        <text>
          some text
        </text>
      </paragraph>
      <paragraph>
        <text>
          more test
          <cursor />
        </text>
      </paragraph>
    </editor>
  `);
});

test('google docs', () => {
  expect(
    deserializeHTML(
      `<html><head><meta http-equiv="content-type" content="text/html; charset=utf-8"></head><body><meta charset="utf-8"><h1 dir="ltr" style="line-height:1.38;margin-top:24pt;margin-bottom:6pt;" id="docs-internal-guid-2e33d38c-7fff-c441-5833-161e85291b77"><span style="font-size:23pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Heading 1</span></h1><h2 dir="ltr" style="line-height:1.38;margin-top:18pt;margin-bottom:4pt;"><span style="font-size:17pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Heading 2</span></h2><h3 dir="ltr" style="line-height:1.38;margin-top:14pt;margin-bottom:4pt;"><span style="font-size:13pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Heading 3</span></h3><h4 dir="ltr" style="line-height:1.38;margin-top:12pt;margin-bottom:2pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Heading 4</span></h4><h5 dir="ltr" style="line-height:1.38;margin-top:11pt;margin-bottom:2pt;"><span style="font-size:10pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Heading 5</span></h5><h6 dir="ltr" style="line-height:1.38;margin-top:10pt;margin-bottom:2pt;"><span style="font-size:9pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">Heading 6</span></h6><p dir="ltr" style="line-height:1.38;margin-top:12pt;margin-bottom:12pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:700;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">bold</span></p><p dir="ltr" style="line-height:1.38;margin-top:12pt;margin-bottom:12pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:italic;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">italic</span></p><p dir="ltr" style="line-height:1.38;margin-top:12pt;margin-bottom:12pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:line-through;-webkit-text-decoration-skip:none;text-decoration-skip-ink:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">strikethrough</span></p><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:underline;-webkit-text-decoration-skip:none;text-decoration-skip-ink:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">underline</span></p><p dir="ltr" style="line-height:1.38;margin-top:12pt;margin-bottom:12pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;"><span style="font-size:0.6em;vertical-align:sub;">subscript</span></span></p><p dir="ltr" style="line-height:1.38;margin-top:12pt;margin-bottom:12pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;"><span style="font-size:0.6em;vertical-align:super;">superscript</span></span></p><p dir="ltr" style="line-height:1.38;margin-top:12pt;margin-bottom:12pt;"><a href="https://keystonejs.com" style="text-decoration:none;"><span style="font-size:11pt;font-family:Arial;color:#1155cc;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:underline;-webkit-text-decoration-skip:none;text-decoration-skip-ink:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">A link</span></a></p><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;"><hr /></p><ul style="margin-top:0;margin-bottom:0;padding-inline-start:48px;"><li dir="ltr" style="list-style-type:disc;font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;" aria-level="1"><p dir="ltr" style="line-height:1.38;margin-top:12pt;margin-bottom:0pt;" role="presentation"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">unordered list</span></p></li><li dir="ltr" style="list-style-type:disc;font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;" aria-level="1"><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;" role="presentation"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">item</span></p></li><ul style="margin-top:0;margin-bottom:0;padding-inline-start:48px;"><li dir="ltr" style="list-style-type:circle;font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;" aria-level="2"><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;" role="presentation"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">nested item</span></p></li></ul></ul><ol style="margin-top:0;margin-bottom:0;padding-inline-start:48px;"><li dir="ltr" style="list-style-type:decimal;font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;" aria-level="1"><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;" role="presentation"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">ordered list</span></p></li><li dir="ltr" style="list-style-type:decimal;font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;" aria-level="1"><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;" role="presentation"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">item</span></p></li><ol style="margin-top:0;margin-bottom:0;padding-inline-start:48px;"><li dir="ltr" style="list-style-type:decimal;font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;" aria-level="2"><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:12pt;" role="presentation"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">nested item</span></p></li></ol></ol><p dir="ltr" style="line-height:1.38;margin-top:12pt;margin-bottom:12pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">some text</span><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;"><br /></span><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">there is a break before this</span></p><p dir="ltr" style="line-height:1.38;text-align: center;margin-top:12pt;margin-bottom:12pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">align center</span></p><p dir="ltr" style="line-height:1.38;text-align: right;margin-top:12pt;margin-bottom:12pt;"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">align end</span></p><h1 dir="ltr" style="line-height:1.38;text-align: center;margin-top:24pt;margin-bottom:6pt;"><span style="font-size:23pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">heading align center</span></h1><h1 dir="ltr" style="line-height:1.38;text-align: right;margin-top:24pt;margin-bottom:6pt;"><span style="font-size:23pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">heading align end</span></h1></body></html>`
    )
  ).toMatchInlineSnapshot(`
    <editor>
      <heading
        level={1}
      >
        <text>
          Heading 1
        </text>
      </heading>
      <heading
        level={2}
      >
        <text>
          Heading 2
        </text>
      </heading>
      <heading
        level={3}
      >
        <text>
          Heading 3
        </text>
      </heading>
      <heading
        level={4}
      >
        <text>
          Heading 4
        </text>
      </heading>
      <heading
        level={5}
      >
        <text>
          Heading 5
        </text>
      </heading>
      <heading
        level={6}
      >
        <text>
          Heading 6
        </text>
      </heading>
      <paragraph>
        <text
          bold={true}
        >
          bold
        </text>
      </paragraph>
      <paragraph>
        <text
          italic={true}
        >
          italic
        </text>
      </paragraph>
      <paragraph>
        <text
          strikethrough={true}
        >
          strikethrough
        </text>
      </paragraph>
      <paragraph>
        <text
          underline={true}
        >
          underline
        </text>
      </paragraph>
      <paragraph>
        <text
          subscript={true}
        >
          subscript
        </text>
      </paragraph>
      <paragraph>
        <text
          superscript={true}
        >
          superscript
        </text>
      </paragraph>
      <paragraph>
        <text>
          
        </text>
        <link
          @@isInline={true}
          href="https://keystonejs.com"
        >
          <text>
            A link
          </text>
        </link>
        <text>
          
        </text>
      </paragraph>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
      <divider
        @@isVoid={true}
      >
        <text>
          
        </text>
      </divider>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
      <unordered-list>
        <list-item>
          <list-item-content>
            <text>
              unordered list
            </text>
          </list-item-content>
        </list-item>
        <list-item>
          <list-item-content>
            <text>
              item
            </text>
          </list-item-content>
        </list-item>
        <list-item>
          <list-item-content>
            <text>
              nested item
            </text>
          </list-item-content>
        </list-item>
      </unordered-list>
      <ordered-list>
        <list-item>
          <list-item-content>
            <text>
              ordered list
            </text>
          </list-item-content>
        </list-item>
        <list-item>
          <list-item-content>
            <text>
              item
            </text>
          </list-item-content>
        </list-item>
        <list-item>
          <list-item-content>
            <text>
              nested item
            </text>
          </list-item-content>
        </list-item>
      </ordered-list>
      <paragraph>
        <text>
          some text
    there is a break before this
        </text>
      </paragraph>
      <paragraph
        textAlign="center"
      >
        <text>
          align center
        </text>
      </paragraph>
      <paragraph
        textAlign="end"
      >
        <text>
          align end
        </text>
      </paragraph>
      <heading
        level={1}
        textAlign="center"
      >
        <text>
          heading align center
        </text>
      </heading>
      <heading
        level={1}
        textAlign="end"
      >
        <text>
          heading align end
          <cursor />
        </text>
      </heading>
      <paragraph>
        <text>
          
        </text>
      </paragraph>
    </editor>
  `);
});
