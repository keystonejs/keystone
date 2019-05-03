// NOTE: We don't test the `.send()` functionality as we assume keystone-email
// has tested it and it works.
describe('email senders', () => {
  test('jsx', async () => {
    const { emailSender } = require('../');

    const jsxEmailSender = emailSender.jsx({ root: `${__dirname}/jsx-views` });
    const { html, text } = await jsxEmailSender('view.jsx').render({ name: 'Foo' });

    expect(text).toEqual('Hello Foo');
    expect(html).toEqual('<!DOCTYPE html><html><body><div>Hello Foo</div></body></html>');
  });

  test('pug', async () => {
    const { emailSender } = require('../');

    const pugEmailSender = emailSender.pug({ root: `${__dirname}/pug-views` });
    const { html, text } = await pugEmailSender('view.pug').render({ name: 'Foo' });

    expect(text).toEqual('Foo is Awesome');
    expect(html).toEqual('<!DOCTYPE html><html><body><div>Foo is Awesome</div></body></html>');
  });

  test('mjml', async () => {
    const { emailSender } = require('../');

    const mjmlEmailSender = emailSender.mjml({ root: `${__dirname}/mjml-views` });
    const { html, text } = await mjmlEmailSender('view.jsx').render({ name: 'Foo' });

    expect(text).toMatchSnapshot();
    expect(html).toMatchSnapshot();
  });
});
