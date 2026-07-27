import { test, expect } from 'vitest'
import { stripNextReleaseConditions } from './strip-next-release'

test('removes an if-only block entirely', () => {
  const content = `## Heading 1
{% if $nextRelease %}
some unreleased content

## Some heading

{% /if %}
end`
  expect(stripNextReleaseConditions(content)).toBe(`## Heading 1

end`)
})

test('keeps the else branch when the if has an else', () => {
  const content = `before
{% if $nextRelease %}
unreleased
{% else /%}
released
{% /if %}
after`
  expect(stripNextReleaseConditions(content)).toBe(`before
released
after`)
})

test('handles multiple blocks in one document', () => {
  const content = `a
{% if $nextRelease %}X{% /if %}
b
{% if $nextRelease %}Y{% else /%}Z{% /if %}
c`
  expect(stripNextReleaseConditions(content)).toBe(`a

b
Z
c`)
})

test('leaves content without nextRelease blocks untouched', () => {
  const content = `# Title

Some {% hint kind="tip" %}inline tag{% /hint %} and text.`
  expect(stripNextReleaseConditions(content)).toBe(content)
})
