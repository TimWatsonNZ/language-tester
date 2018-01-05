const fs = require('fs');

function getWords() {
    const rawDictionary = fs.readFileSync('./foundationWords.txt', 'utf-8');
    return parseRawWords(rawDictionary.split('\n'));
}

function parseRawWords(raw) {
  const dict = raw.map(r => {
    const split = r.split(',');
    return {
      germanWord: split[0].trim(),
      englishWords: split[1].split('/').map(w => w.trim())
    };
  });
  return dict;
}

module.exports = { getWords };