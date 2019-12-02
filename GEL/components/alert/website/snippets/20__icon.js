import { Alert } from '@westpac/alert';
import { HelpIcon } from '@westpac/icon';

export const scope = { Alert, HelpIcon };

export const help = `<Alert look="info" icon={HelpIcon}>
  <strong>Heads up!</strong> This alert needs your attention, but it’s not super important. Oh
  wow look, I have a custom icon. <a href="#">Link</a>
</Alert>`;

export const noIcon = `<Alert look="info" icon={null}>
  <strong>Heads up!</strong> This alert needs your attention, but it’s not super important. Oh
  wow look, I have no icon. <a href="#">Link</a>
</Alert>`;
