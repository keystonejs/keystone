// NOTE: We don't test the `.send()` functionality as we assume keystone-email
// has tested it and it works.
describe('email senders', () => {
  test('jsx', async () => {
    const emailSender = require('../');

    const jsxEmailSender = emailSender.jsx({ root: `${__dirname}/jsx-views` });
    const { html, text } = await jsxEmailSender('view.jsx').render({ name: 'Foo' });

    expect(text).toEqual('Hello Foo');
    expect(html).toEqual('<!DOCTYPE html><html><body><div>Hello Foo</div></body></html>');
  });

  test('jade', async () => {
    const emailSender = require('../');

    const jadeEmailSender = emailSender.jade({ root: `${__dirname}/jade-views` });
    const { html, text } = await jadeEmailSender('view.jade').render({ name: 'Foo' });

    expect(text).toEqual('Foo is Awesome');
    expect(html).toEqual('<!DOCTYPE html><html><body><div>Foo is Awesome</div></body></html>');
  });
});
