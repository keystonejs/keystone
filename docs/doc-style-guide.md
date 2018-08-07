Documentation Style Guide
================================================================================

This document describes the conventions for formatting and style used throughout Keystone 5 docs.

Our practises align closely with those suggested in Ciro Santilli's
[Markdown Style Guide](http://www.cirosantilli.com/markdown-style-guide),
the de facto standard.
The specific points included below are a high-level overview and cover a few areas we diverge from this standard.

The aim of these conventions is to ensure:

* Consistency across project docs
* Readability when rendered as HTML
* Readability as plain text
* Readability when being updated (ie. in diffs)


General
--------------------------------------------------------------------------------

* All docs should include an intro that describes their purpose
* Ensure correct spelling; spell-check documents before committing
* Ensure correct capitalisation, inc. product names and acronyms (eg: URL, Node.js, MongoDB)
* Ensure correct English grammar
* Write clearly and keep it factual
* If you must assume knowledge on the part of the reader, link to related docs on the topic
* Emoji should only be used sparingly ✨

_Do we favour US or UK spellings?_


Tools
--------------------------------------------------------------------------------

If you're using Sublime Text, the following plugins may be of use:

* [Markdown Extended](https://packagecontrol.io/packages/Markdown%20Extended) --
	Better syntax highlighting of Markdown documents
* [MarkdownPreview](https://packagecontrol.io/packages/MarkdownPreview) --
	Allows Markdown documents to be previewed by running them through the GitHub renderer

_Any tips for other editors?_


Headings
--------------------------------------------------------------------------------

* We prefer the ["Setex" style of headings](http://www.cirosantilli.com/markdown-style-guide/#option-header-setex)
	with the `=` and `-` characters repeated for 80 chars
* Each document should contain a single level 1 heading
* Headings at all levels use [Title Case](https://en.wikipedia.org/wiki/Letter_case#Stylistic_or_specialised_usage)
* Try to keep all headings unique so they can be [linked to](#headings) reliably
* Emphasis (eg. **bold**) should not be used in place of headings


Text Blocks
--------------------------------------------------------------------------------

The sentences that form a paragraph should generally be separated with newlines.
Longer sentences, constructed with multiple clauses,
can contain newline characters at punctuation boundaries.
Likewise, sentences that contain
[Markdown formatted links](https://www.markdownguide.org/basic-syntax#links)
can include newlines at the link boundaries if needed.


Lists
--------------------------------------------------------------------------------

For unordered lists:

* Top level lists use and asterisk (`*`)
	- Second level lists use a hyphen (`-`)
		+ Third level lists use the plus sign (`+`)
			* Then the cycle repeats (`*`)
* Lists levels are indented with tabs
* Items should end in punctuation only if they contains multiple sentences.
	In other cases they should not.

_JM: This ^^ differs slightly from Ciro's guide but is my preference.. thoughts?_

For ordered lists:

1. Ordered lists should generally be avoided
1. If necessary, all items should start with the same number.
	This allows reordering of items without onerous diffs.


Links
--------------------------------------------------------------------------------

Links should be used generously to reference related material inside and outside the current doc.
You can link to any section in a markdown document by lower-casing it's heading,
replacing spaces with hyphens and prefixing with a hash, eg:
the [Text Blocks section](#text-blocks).


Code and Code Blocks
--------------------------------------------------------------------------------

Inline code using `single backticks` should only be used within sentences,
to refer to specific tools or single commands.

Where possible, code blocks (using the triple backtick) should be used.
All code blocks should specify the language they contain;
this produces syntax highlighting when published on GitHub.

For example, even a small series of shell commands should be given a `sh` block:

```sh
node --version
```

A complete list of languages recognised by GitHut can be found in the
[`linguist` languages file](https://github.com/github/linguist/blob/master/lib/linguist/languages.yml).


Emphasis
--------------------------------------------------------------------------------

* **Bold sections** are delineated with 2 asterisk
* _Italics_ can be added with a pair of underscores

Emphasis should be used inline, to highlight specific points,
or to indicate notes and comments that aren't part of the document flow.

_JM: This ^^ differs from Ciro's guide but is my preference.. thoughts?_
