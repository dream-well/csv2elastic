import { config } from 'dotenv';
config();
import csv from 'csv-parser';
import fs from 'fs-extra';
import sequelize from './db';
import Data from './models/data.model';

let buff = "";
let count = 0;

// fs.createReadStream("data/data.csv", { encoding: 'utf-8'}).on('data', (chunk) => {
//     buff += chunk;
//     if(++count == 10) {
//         fs.writeFileSync("data/part1.csv", buff);
//         process.exit();
//     }
// })

const headers = ["url","description","duration","thumbnail","iframe","keywords","author","no","type","quality"];

function readcsv(filename) {
      // Read CSV file
      let cache = [];
      let rowCount = 0;
      let finalRowCount;

    fs.createReadStream(filename)
    .pipe(csv({ headers: headers, separator: ";", }))
    .on('data', (rowData) => {
        const rawData = (Object.values(rowData).reduce((a,b) => a + ';' + b) as string).split(';');
        for(let i = 0; i < headers.length; i ++) {
            rowData[headers[i]] = rawData[i];
        }
        cache.push(rowData);
        rowCount ++;
        // console.log(cache);
        if(cache.length == 3000) {
            insert_rows(cache, rowCount)
            cache = [];
            return;
        }
    })
    .on('end', () => {
        finalRowCount = rowCount;
        if(cache.length) {
            insert_rows(cache, finalRowCount);
        }
        console.log('upload ended', finalRowCount);
    });

}

function insert_rows(cache, rowCount) {
    Data.bulkCreate(cache).then(() => {
        console.log('saved', rowCount);
    });
}

sequelize.sync().then(() => {
    readcsv('data/data.csv');
});