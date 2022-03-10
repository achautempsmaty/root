import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

import { rootPath } from './options.js';
const directoryPath = path.resolve(rootPath);

const logPercent = (i, length, isConvert) => {
  let label = isConvert
    ? '\x1b[34m' + 'Conversion des fichiers' + '\x1b[0m'
    : 'Analyse des dossiers';

  console.log(
    label,
    '\x1b[1m' + Math.round(((i + 1) / length) * 100) + '%' + '\x1b[0m'
  );
};

let informations = {
  errors: [],
  numberFile: 0,
  temporary: 0,
};

const filesToProcess = [];

function endScript() {
  console.log('Nombre de fichiers convertis : ' + informations.numberFile);
  console.log(
    'Nombre de Dossier Temporary supprimés : ' + informations.temporary
  );
  if (informations.errors.length > 0) {
    let label = informations.errors.length === 1 ? 'erreur' : 'erreurs';
    console.log(
      informations.errors.length + ' ' + label + ' dans le traitement'
    );
    informations.errors.forEach((error) => console.log(error));
  } else {
    console.log('Aucune erreur dans le traitement des images');
  }
}

const processImage = async (file) => {
  return new Promise((resolve, reject) => {
    sharp(file.jpg)
      .webp({
        quality: 80,
      })
      .toFile(file.webp)
      .then((result) => resolve(result))
      .catch((err) => reject(err));
  });
};

function getFiles(directory) {
  const filesInDirectory = fs.readdirSync(directory);
  filesInDirectory.forEach(async (file, index) => {
    const pathname = path.join(directory, file);
    if (fs.statSync(pathname).isDirectory() && file !== 'temporary') {
      logPercent(index, filesInDirectory.length, false);
      getFiles(pathname);
    } else if (fs.statSync(pathname).isDirectory() && file == 'temporary') {
      this.informations = {
        ...this.informations,
        temporary: this.informations.temporary + 1,
      };
      fs.rmSync(pathname, { recursive: true, force: true });
    } else {
      if (path.extname(pathname).toLowerCase() == '.jpg') {
        const jpg = pathname;
        const webp = jpg.replace('jpg', 'webp').replace('JPG', 'webp');
        if (!fs.existsSync(webp)) {
          filesToProcess.push({ jpg, webp });
        }
      }
    }
  });
}

getFiles(directoryPath, false);

(async () => {
  let count = 0;
  const promises = filesToProcess.map((file, index) =>
    processImage(file)
      .then(() => {
        informations = {
          ...informations,
          numberFile: informations.numberFile + 1,
        };
      })
      .catch((err) => {
        informations = {
          ...informations,
          errors: [...informations.errors, err],
        };
      })
      .then(() => {
        logPercent(count, filesToProcess.length, true);
        count++;
      })
  );
  await Promise.all(promises);
  endScript();
})();
