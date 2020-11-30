import * as Assert from '@robinblomberg/assert';
import { Url } from './index.js';

// Url.splitPath:
Assert.equal(
  Url.splitPath('/'),
  []
);
Assert.equal(
  Url.splitPath('/foo//bar/index.php/'),
  ['foo', '', 'bar', 'index.php']
);
Assert.equal(
  Url.splitPath('/api/User/[userId]'),
  ['api', 'User', '[userId]']
);

// Url.normalizePath:
Assert.equal(
  Url.normalizePath('/foo//bar/index.php/'),
  '/foo//bar/index.php'
);
