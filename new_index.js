const fs = require("fs");
const dotenv = require("dotenv");
const request = require("request");

dotenv.config();

function readPhotoFileNames(directoryPath) {
  const photoNames = [];
  fs.readdirSync(directoryPath).forEach((file) => {
    photoNames.push(file);
  });
  return photoNames;
}

function transformToBarcodeObjects(arrayOfStrings) {
  const barcodeArray = arrayOfStrings.map((str) => {
    const matches = str.match(/(\d+)_\d+\.jpeg/);

    const barcode = matches && matches[1] ? matches[1] : "Номер не найден";

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

function getRequestPromise(body) {
  const options = {
    url: "http://1c.trimiata.ru:2028/utd/hs/api/photo_renaming/",
    method: "POST",
    body: body,
    json: true,
    auth: {
      username: process.env.USERNAME1,
      password: process.env.PASSWORD1,
    },
  };

  return new Promise((resolve, reject) => {
    request.post(options, (error, response, body) => {
      resolve(body);
    });
  });
}

async function main() {
  const directoryPath = "/Users/frqhero/Dev/node/node_request/photo";
  const photoNames = readPhotoFileNames(directoryPath);
  const barcodeArray = transformToBarcodeObjects(photoNames);

  const uniqueBarcodes = getUniqueBarcodes(barcodeArray);
  const objectToSend = { series: uniqueBarcodes };
  const responseResult = await getRequestPromise(objectToSend);
}

main();
