const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const request = require('request');

dotenv.config();

let myglobal = 'hi';

function readPhotoFileNames(directoryPath) {
  const photoNames = [];
  fs.readdirSync(directoryPath).forEach((file) => {
    const extname = path.extname(file).toLowerCase();
    photoNames.push(file);
  });
  return photoNames;
}

function createObjectsArray(arrayOfStrings) {
  const objectArray = arrayOfStrings.map((str) => {
    return { fileName: str };
  });

  return objectArray;
}

function transformToBarcodeObjects(arrayOfStrings) {
  const barcodeArray = arrayOfStrings.map((str) => {
    const matches = str.match(/(\d+)_\d+\.jpeg/);

    const barcode = matches && matches[1] ? matches[1] : 'Номер не найден';

    return { fileName: str, barcode };
  });

  return barcodeArray;
}

function getUniqueBarcodes(barcodeArray) {
  const uniqueBarcodes = new Set();

  for (const barcodeObject of barcodeArray) {
    uniqueBarcodes.add(barcodeObject.barcode);
  }

  return [...uniqueBarcodes];
}

function makeRequest(body, callback, barcodeArray) {
  const options = {
    url: 'http://1c.trimiata.ru:2028/utd/hs/api/photo_renaming/',
    method: 'POST',
    body: body,
    json: true,
    auth: {
      username: process.env.USERNAME1,
      password: process.env.PASSWORD1,
    },
  };

  request.post(options, function (error, response, responseBody) {
    if (error) {
      callback(error, null);
    } else {
      callback(null, responseBody, barcodeArray);
    }
  });
}

// Функция для сопоставления артикулов с ШК
function mapArticulesToBarcodes(barcodeArray, responseBody) {
  const barcodesToArticules = {};

  for (const item of responseBody) {
    const barcode = item['ШК'];
    const articul = item['Артикул'];

    barcodesToArticules[barcode] = articul;
  }

  for (const barcodeObject of barcodeArray) {
    const barcode = barcodeObject.barcode;
    barcodeObject.article = barcodesToArticules[barcode] || 'Артикул не найден';
  }
  ass = 1;
}


function my_func(error, responseBody, barcodeArray) {
    for (const file_name of barcodeArray) {
        for (const row_response of responseBody) {
            if (file_name.barcode === row_response.ШК) {
                file_name['article'] = row_response.Артикул
            }
        }
    }
    
}


// Укажите путь к вашей директории с фотографиями
const directoryPath = '/home/yar/Dev/TRIMIATA/node_task/photo';
const photoNames = readPhotoFileNames(directoryPath);
const barcodeArray = transformToBarcodeObjects(photoNames);
const uniqueBarcodes = getUniqueBarcodes(barcodeArray);
const objectToSend = { series: uniqueBarcodes };

// makeRequest(objectToSend, (error, response) => {
//   if (error) {
//     console.error('Ошибка запроса:', error);
//   } else {
//     //console.log('Ответ сервера:', response);

//     // Сопоставляем артикулы и обновляем массив barcodeArray
//     mapArticulesToBarcodes(barcodeArray, response);

//     console.log('Массив с артикулами:', barcodeArray);
//   }
// });
makeRequest(objectToSend, my_func, barcodeArray)
1