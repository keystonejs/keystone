import { SkipLink } from '@westpac/a11y';

export const scope = { SkipLink };

export const demo = `<div>
  <h2>Screen reader skip link</h2>
  <p>Note: The example link below is visibility hidden until focussed.</p>
  <SkipLink href="#content">This is screen reader only text (visible when foccused)</SkipLink>
  <p>
    <a href="?">Links in this section</a> are skipped over
  </p>
  <p>
    <a href="?">Links in this section</a> are skipped over
  </p>
  <p>
    <a href="?">Links in this section</a> are skipped over
  </p>
  <p>
    <a href="?">Links in this section</a> are skipped over
  </p>
  <div id="content">
    <p>
      This is example content, linked to by the SkipLink component above. Sit sint irure do eu.
      Non aliquip voluptate et nisi est voluptate in aliquip. Tempor ea est et velit anim
      incididunt qui ipsum anim id. Irure exercitation adipisicing velit minim ea aute esse elit
      amet minim in minim cillum. <a href="?">Cupidatat aliqua</a> eiusmod ipsum occaecat
      proident exercitation.
    </p>
    <p>
      Velit irure et ullamco aute do consectetur non est veniam irure. Sunt nulla incididunt
      esse incididunt qui velit est laboris labore reprehenderit adipisicing voluptate magna ex.
      Velit esse minim nisi consectetur adipisicing amet et officia <a href="?">occaecat qui</a>
      . Voluptate aliqua adipisicing Lorem fugiat ipsum id aliqua elit velit irure sint. Sit
      voluptate ex id ea dolor. Occaecat pariatur ullamco duis occaecat dolore veniam duis
      tempor.
    </p>
    <p>
      Irure voluptate enim ullamco sint nulla magna labore ullamco elit voluptate ex fugiat
      nostrud. Lorem et est culpa ut ullamco dolor eiusmod enim dolor labore. Sint duis et in
      velit anim eiusmod tempor velit anim proident. Velit eu culpa irure pariatur reprehenderit
      enim elit laborum commodo. Est fugiat occaecat ullamco deserunt nulla eu Lorem nulla est
      ex eu excepteur. Ullamco nisi Lorem laboris reprehenderit cupidatat reprehenderit
      incididunt in est.
    </p>
  </div>
</div>`;
