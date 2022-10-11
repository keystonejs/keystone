import { replaceShowNextRelease } from './typescript';
test('no usage', async () => {
  expect(await replaceShowNextRelease('a.ts', "const a = 'something';")).toMatchInlineSnapshot(`
    "const a = 'something';
    "
  `);
});
test('assignment to variable', async () => {
  expect(await replaceShowNextRelease('a.ts', 'const a = process.env.SHOW_NEXT_RELEASE;'))
    .toMatchInlineSnapshot(`
    "const a = '1';
    "
  `);
});
test('basic if statement', async () => {
  expect(
    await replaceShowNextRelease(
      'a.ts',
      `
function a() {
  if (process.env.SHOW_NEXT_RELEASE) {
    console.log('yes')
  } else {
    console.log('other')
  }
}
`
    )
  ).toMatchInlineSnapshot(`
    "function a() {
      console.log('yes');
    }
    "
  `);
});
test('conditional expression', async () => {
  expect(
    await replaceShowNextRelease(
      'a.ts',
      `
function a() {
  const a = process.env.SHOW_NEXT_RELEASE ? 'new release' : 'old';
}
`
    )
  ).toMatchInlineSnapshot(`
    "function a() {
      const a = 'new release';
    }
    "
  `);
});
test('conditional expression in jsx', async () => {
  expect(
    await replaceShowNextRelease(
      'a.tsx',
      `
function MyThing() {
  return <div>something {process.env.SHOW_NEXT_RELEASE ? 'next release' : 'previous release'} other</div>
}
`
    )
  ).toMatchInlineSnapshot(`
    "function MyThing() {
      return <div>something {'next release'} other</div>;
    }
    "
  `);
});
test('conditional expression in jsx with jsx in consequent', async () => {
  expect(
    await replaceShowNextRelease(
      'a.tsx',
      `
function MyThing() {
  return <div>something {process.env.SHOW_NEXT_RELEASE ? <div>new release</div>: 'previous release'} other</div>
}
`
    )
  ).toMatchInlineSnapshot(`
    "function MyThing() {
      return (
        <div>
          something <div>new release</div> other
        </div>
      );
    }
    "
  `);
});

test('&&', async () => {
  expect(
    await replaceShowNextRelease(
      'a.tsx',
      `
function MyThing() {
  return <div>something {process.env.SHOW_NEXT_RELEASE && <div>new release</div>} other</div>
}
`
    )
  ).toMatchInlineSnapshot(`
    "function MyThing() {
      return (
        <div>
          something <div>new release</div> other
        </div>
      );
    }
    "
  `);
});
