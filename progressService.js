const fs = require('fs');
const filename = './progress.json';
const readProgress = () => {
  const fileContents = fs.readFileSync(filename, 'utf-8');
  try {
    return JSON.parse(fileContents);
  } catch (exception) {
    return {};
  }
}

const writeProgress = (testResults) => {
  const progress = readProgress();
  testResults.forEach(result => {
    if (progress[result.germanWord]) {
      progress[result.germanWord].guessedCount++;
      progress[result.germanWord].correctCount += result.correct ? 1 : 0;
    } else {
      progress[result.germanWord] = { guessedCount: 1, correctCount: result.correct ? 1 : 0 }
    }
  });

  fs.writeFileSync(filename, JSON.stringify(progress), 'utf-8');
}

module.exports = { readProgress, writeProgress };