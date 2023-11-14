import { removeNextReleaseConditions } from './markdoc'

test('removes if', () => {
  const content = `## Heading 1
{% if $nextRelease %}
some content

## Some heading

{% /if %}
  `
  expect(removeNextReleaseConditions(content)).toMatchInlineSnapshot(`
    {
      "contents": "## Heading 1
    some content

    ## Some heading
      ",
      "errors": [],
    }
  `)
})

test('removes if with else', () => {
  const content = `## Heading 1
{% if $nextRelease %}
some content

## Some heading

{% else /%}

Content in else

{% /if %}
  `
  expect(removeNextReleaseConditions(content)).toMatchInlineSnapshot(`
    {
      "contents": "## Heading 1
    some content

    ## Some heading
      ",
      "errors": [],
    }
  `)
})

test('errors if nextRelease variables is still used', () => {
  const content = `## Heading 1

{% $nextRelease %}
  
{% if $nextRelease %}
some content

## Some heading

{% else /%}

Content in else

{% /if %}
  `
  expect(removeNextReleaseConditions(content)).toMatchInlineSnapshot(`
    {
      "contents": "## Heading 1

    {% $nextRelease %}
      
    some content

    ## Some heading
      ",
      "errors": [
        {
          "error": {
            "id": "variable-undefined",
            "level": "error",
            "message": "Undefined variable: 'nextRelease'",
          },
          "lines": [
            2,
            3,
          ],
          "location": {
            "end": {
              "character": undefined,
              "line": 3,
            },
            "file": undefined,
            "start": {
              "character": undefined,
              "line": 2,
            },
          },
          "type": "text",
        },
      ],
    }
  `)
})
