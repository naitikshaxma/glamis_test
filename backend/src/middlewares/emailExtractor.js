import fs from 'fs';
import csv from 'csv-parser';

function emailExtractor(filePath) {

    fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
            if (row.email) {
                console.log(row.email.trim());
            }
        })
        .on('end', () => {
            console.log('Finished reading CSV file.');
        })
        .on('error', (err) => {
            console.error('Error reading CSV file:', err);
        });
}

export default emailExtractor;
