const { promises: fs } = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

main();

async function main() {
  const rootPath = path.resolve(__dirname, '../');
  const distPath = path.join(rootPath, 'dist/');
  const imagesPath = path.join(distPath, 'images/');

  await mkdirp(imagesPath);
  await fs.copyFile(
    path.join(rootPath, 'images/icon.svg'),
    path.join(imagesPath, 'icon.svg'),
  );

  const htmlContents = await fs.readFile(
    path.join(rootPath, 'index.html'),
    'utf8',
  );
  await fs.writeFile(
    path.join(distPath, 'index.html'),
    htmlContents.replace(
      // eslint-disable-next-line no-template-curly-in-string
      'const snapId = `local:${window.location.href}`;',
      // eslint-disable-next-line no-template-curly-in-string
      // 'const snapId = `local:${window.location.href}bundle.js`;', // Well-formatted URL ends with an '/'
      // eslint-disable-next-line no-template-curly-in-string
      'const snapId = `npm:aleo-snap`;', // Well-formatted URL ends with an '/'
      // 'const snapId = `npm:aleo-snap`;',
    ),
    // htmlContents,
  );
}
