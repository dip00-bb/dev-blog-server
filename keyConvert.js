const fs = require('fs');
const key = fs.readFileSync('./firebaseKey.json', 'utf8');
const base64 = Buffer.from(key).toString('base64');
