import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

import { rootPath, webpQuality } from './options.js';
const directoryPath = path.resolve(rootPath);

const logPercent = (i, length, isConvert) => {
  let label = isConvert
    ? '\x1b[34m' + 'Conversion des fichiers' + '\x1b[0m'
    : '\x1b[34m' + 'Dossiers analysés' + '\x1b[0m';

  console.log(
    label,
    '\x1b[1m' + Math.round(((i + 1) / length) * 100) + '%' + '\x1b[0m'
  );
};

let informations = {
  imagesprocessed: 0,
  temporary: 0,
  errors: 0,
};

function success(result) {
  informations = {
    ...informations,
    imagesprocessed: informations.imagesprocessed + 1,
  };
  console.log(
    '\x1b[32m' +
      'Nombre de fichiers convertis' +
      '\x1b[0m :' +
      '\x1b[1m' +
      informations.imagesprocessed +
      '\x1b[0m'
  );
}
function error(err) {
  informations = {
    ...informations,
    errors: informations.errors + 1,
  };
  console.log(
    '\x1b[31m' +
      "Nombre d'erreur" +
      '\x1b[0m : ' +
      '\x1b[1m' +
      informations.errors +
      '\x1b[0m'
  );
  console.log(err);
}

function checkFiles(directory) {
  const filesInDirectory = fs.readdirSync(directory);
  filesInDirectory.forEach(async (file, index) => {
    const pathname = path.join(directory, file);
    if (fs.statSync(pathname).isDirectory() && file !== 'temporary') {
      logPercent(index, filesInDirectory.length, false);
      checkFiles(pathname);
    } else if (fs.statSync(pathname).isDirectory() && file == 'temporary') {
      informations = {
        ...informations,
        temporary: informations.temporary + 1,
      };
      fs.rmSync(pathname, {
        recursive: true,
        force: true,
      });
      console.log(
        'Nombre de Dossier Temporary supprimés : ' + informations.temporary
      );
    } else {
      if (path.extname(pathname).toLowerCase() == '.jpg') {
        const jpg = pathname;
        const webp = jpg.replace('jpg', 'webp').replace('JPG', 'webp');
        if (!fs.existsSync(webp)) {
          sharp(jpg)
            .webp({
              quality: webpQuality,
            })
            .toFile(webp)
            .then((result) => success(result))
            .catch((err) => error(err));
        }
      }
    }
  });
}

checkFiles(directoryPath, false);
