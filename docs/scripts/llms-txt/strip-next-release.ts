// The llms.txt artifacts are generated from the raw Markdoc on disk. That raw
// content still contains `{% if $nextRelease %}` blocks: in production these are
// hidden at *render time* (the `nextRelease` Markdoc variable is false unless
// SHOW_NEXT_RELEASE is set — see markdoc/show-next-release.ts). Nothing removes
// them from the file itself. So when we read the files directly we must strip
// these blocks ourselves, otherwise the artifacts would leak unreleased docs.
//
// This is the *inverse* of scripts/replace-show-next-release, which unwraps
// (reveals) the same blocks permanently at release time. Here we hide the
// `if` branch and keep the `else` branch, matching `nextRelease: false`:
//
//   {% if $nextRelease %}A{% else /%}B{% /if %}  ->  B
//   {% if $nextRelease %}A{% /if %}              ->  (nothing)
//
// Nested `$nextRelease` conditionals are not supported, matching the existing
// reveal script's regex approach.
const pattern =
  /{%\s+if\s+\$nextRelease\s+%}\s*[^]*?\s*(?:{%\s+else\s+\/%}\s*([^]*?)\s*)?{%\s+\/if\s+%}/g

export function stripNextReleaseConditions(contents: string): string {
  return contents.replace(pattern, (_match, elseBranch) => elseBranch ?? '')
}
