const { getWords } = require('../dictionaryService');
const { writeProgress, readProgress } = require('../progressService');
const endPoint = "/api/tests";

function initialize(app) {
  app.get(endPoint, getTest);
  app.post(endPoint, saveTestResults);
}

function getTest(req, res) {
  if (Math.random() < 0.5) {
    res.status(200).json(generateInputTest());
    return;
  }
  res.status(200).json( generateMultiplechoiceTest())
}

function saveTestResults(req, res) {
  const results = req.body.testResults;
  writeProgress(results);
}

function generateMultiplechoiceTest() {
  const test = getRandomTest();
  const testWords = getWords();

  const multiChoiceTest = test.map(t => {
    var choices = getRandomSelection(testWords, 3).map(w => w.englishWords);
    return { ...t, choices: insertAtRandomIndex(choices, t.englishWords) };
  });
  return { list: multiChoiceTest, type: 'multiplechoice' };
}

function insertAtRandomIndex(array, item) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return [...array.slice(0, randomIndex), item, ...array.slice(randomIndex)];
}

function generateInputTest() {
    return { list: getRandomTest(), type: 'input' };
}

function getRandomTest(testLength = 10) {
  const testWords = getWords();
  return getRandomSelection(testWords, testLength);
}

function getRandomSelection(words, length) {
  const progressData = readProgress();

  return [...(new Array(words.length))]
  .map((_, i) => {
    return {
      word: words[i],
      weight: progressData[words[i] || 0]
    }
  })
  .sort((a,b) => Math.random(a.weight) - Math.random(b.weight))
  .sort((a,b) => Math.random(a.weight) - Math.random(b.weight))
  .slice(0, length)
  .map(i => i.word);
}

module.exports = { initialize };
