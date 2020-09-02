// NOTE: We don't test the `.send()` functionality as we assume keystone-email
// has tested it and it works.
const { emailSender } = require('../');

// @babel/register(which express-react-views uses to transform the files) seems to be messing up on Jest so let's just let Jest do the transform
const expressReactViewsOptions = { transformViews: false };

describe('email senders', () => {
  test('jsx', async () => {
    const jsxEmailSender = emailSender.jsx({
      root: `${__dirname}/jsx-views`,
      expressReactViewsOptions,
    });
    const { html, text } = await jsxEmailSender('view.jsx').render({ name: 'Foo' });

    expect(text).toEqual('Hello Foo');
    expect(html).toEqual('<!DOCTYPE html><html><body><div>Hello Foo</div></body></html>');
  });

  test('pug', async () => {
    const pugEmailSender = emailSender.pug({ root: `${__dirname}/pug-views` });
    const { html, text } = await pugEmailSender('view.pug').render({ name: 'Foo' });

    expect(text).toEqual('Foo is Awesome');
    expect(html).toEqual('<!DOCTYPE html><html><body><div>Foo is Awesome</div></body></html>');
  });

  test('mjml', async () => {
    const mjmlEmailSender = emailSender.mjml({
      root: `${__dirname}/mjml-views`,
      expressReactViewsOptions,
    });
    const { html, text } = await mjmlEmailSender('view.jsx').render({ name: 'Foo' });

    expect(text).toMatchSnapshot();
    expect(html).toMatchSnapshot();
  });
});
