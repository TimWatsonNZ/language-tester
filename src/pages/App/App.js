import React, { Component } from 'react';
import * as UI from 'semantic-ui-react';
import axios from 'axios';

class App extends Component {

  testStates = {
    "START": {},
    "TEST_RUNNING": {},
    "TEST_FINISHED": {},
  }

  state = {
    test: [],
    currentWordIndex: 0,
    guess: "",
    guesses: [],
    testState: this.testStates.START,
  };

  startTest = () => {
    if (this.state.test && this.state.test.type === 'multiplechoice') {
      this.setState({ 
        test: { ...this.state.test, type: 'input'},
        currentWordIndex: 0,
        testState: this.testStates.TEST_RUNNING
      });
    } else {
      this.getTest();
    }
  }

  getTest = () => {
    axios.get('api/tests')
      .then(response => {
        this.setState({ 
                        test: response.data,
                        currentWordIndex: 0,
                        testState: this.testStates.TEST_RUNNING 
                    });
      })
      .catch(err => console.log(err));
  }

  postResults = (results) => {
    axios.post('api/tests', { testResults: results})
      .then(result => console.log(result))
      .catch(err => console.log(err));
  }

  nextWord = () => {
    const { test, currentWordIndex, guess } = this.state;
    test.list[currentWordIndex].guess = guess;
        
    this.setState({ guess: "", test });
    if (currentWordIndex === test.list.length - 1) {
      this.finishTest();
    }
    
    this.setState({ currentWordIndex: currentWordIndex + 1 });
  }

  multichoiceAnswer = (words) => {
    const { test, currentWordIndex } = this.state;
    test.list[currentWordIndex].guess = words[0];
        
    this.setState({ test });
    if (currentWordIndex === test.list.length - 1) {
      this.finishTest();
    }
    
    this.setState({ currentWordIndex: currentWordIndex + 1 });
  }

  guessChange = (event, change) => {
    if (change.value === '\n') {
      this.nextWord();
    }
    this.setState({ guess: change.value });
  }

  onKeyDown = (event) => {
    if (event.key === 'Enter') this.nextWord();
  }

  compareWords = (wordA, wordB) => {
    return wordA.toLowerCase() === wordB.toLowerCase();
  }

  finishTest = () => {
    //  for each guess compare with the test and create a score.
    this.setState({ testState: this.testStates.TEST_FINISHED });

    const testList = this.state.test.list;
    let words = testList.map(t => {
      return {...t, correct: t.englishWords.some(w => this.compareWords(w, t.guess))}
    });
    const totalCorrect = words.reduce((agg, current) => 
      (current.correct ? ++agg : agg), 0);
    
    this.setState({ score: { words, totalCorrect } });
    this.postResults(words);
  }

  renderScore = () => {
    const score = this.state.score;
    return (
      <UI.Grid>
        <UI.Grid.Row>
          <UI.Grid.Column width={16} textAlign='center'>
            You scored { score.totalCorrect } out of { score.words.length }
          </UI.Grid.Column>
        </UI.Grid.Row>
        <br />
        { score.words.map(this.renderScoreRow) }
      </UI.Grid>
    );
  }

  renderScoreRow = (scoreRow) => {
    const guessStyle = scoreRow.correct ?  { color: 'green' } :  { color: 'red' };
    const iconName = scoreRow.correct ? "checkmark" : "remove";
    return (
      <UI.Grid.Row>
        <UI.Grid.Column width={5}>
          { scoreRow.germanWord }
        </UI.Grid.Column>
        <UI.Grid.Column width={5}>
          { scoreRow.englishWords.join(', ') }
        </UI.Grid.Column>
        <UI.Grid.Column width={4}>
          <span style={ guessStyle }>
            { scoreRow.guess }
          </span>
        </UI.Grid.Column>
        <UI.Grid.Column width={2}>
          <UI.Icon name={iconName} />
        </UI.Grid.Column>
      </UI.Grid.Row>
    );
  }

  renderTest = () => {
    if (this.state.test.type === 'input') {
      return this.renderInputTest();
    }
    return this.renderMultipleChoiceTest();
  }

  renderInputTest = () => {
    const { test, guess, currentWordIndex } = this.state;
    return (
      <UI.Grid style={{ padding: 8 }}>
        <UI.Grid.Row>
          <UI.Grid.Column width={1} />
          <UI.Grid.Column width={4} textAlign='right'>
            <UI.Label size="large">
              { test.list[currentWordIndex].germanWord }
            </UI.Label>
          </UI.Grid.Column>
          <UI.Grid.Column width={4} textAlign='left'>
            <UI.Input
              placeholder="Translation"
              onChange={this.guessChange}
              onKeyDown={this.onKeyDown}
              value={guess}
            />
          </UI.Grid.Column>
          <UI.Grid.Column width={6} />
        </UI.Grid.Row>
        <UI.Grid.Row>
          <UI.Grid.Column width={1} />
          <UI.Grid.Column width={4} textAlign='right'>
            <UI.Button
              content={currentWordIndex < test.list.length - 1 ?
                "Next" :
                "Finish"
              }
              onClick={this.nextWord}
            />
          </UI.Grid.Column>
          <UI.Grid.Column width={11} />
        </UI.Grid.Row>
      </UI.Grid>
    );
  }

  renderMultipleChoiceTest = () => {
    const { test, guess, currentWordIndex } = this.state;
    const choicesLength = test.list[0].choices.length;
    return (
      <UI.Grid style={{ padding: 8 }}>
        <UI.Grid.Row>
            <UI.Grid.Column width={8}>
            <UI.Label size="large">
              { test.list[currentWordIndex].germanWord }
            </UI.Label>
          </UI.Grid.Column>
        </UI.Grid.Row>
        <UI.Grid.Row>
          { test.list[currentWordIndex].choices.map(choice => 
            <UI.Grid.Column width={16/choicesLength} key={choice.germanWord}>
              <UI.Button onClick={() => this.multichoiceAnswer(choice)}>{choice.join(', ')}</UI.Button>
            </UI.Grid.Column>
          )}
        </UI.Grid.Row>
      </UI.Grid>
    )
  }

  render() {
    const { testState } = this.state;
    return (
      <div className="App" style={{ padding: 8 }}>
        {
          testState === this.testStates.START && 
          <UI.Grid>
            <UI.Grid.Row>
              <UI.Grid.Column width={16} textAlign={'center'}>
                Click Start Test to begin a test.
              </UI.Grid.Column>
            </UI.Grid.Row>            
            <UI.Grid.Row>              
              <UI.Grid.Column style={{ padding: 8 }} textAlign={'center'}>
                <UI.Button content='Start Test' onClick={this.startTest}/>
              </UI.Grid.Column>
            </UI.Grid.Row>
          </UI.Grid>
        }

        {
          testState === this.testStates.TEST_FINISHED && 
          <div>
            <UI.Grid>
              <UI.Grid.Row>
                <UI.Grid.Column textAlign='center'>
                  The test is finished, review your score below and click begin to 
                  start a new test.
                </UI.Grid.Column>            
              </UI.Grid.Row>
              <UI.Grid.Row>
                <UI.Grid.Column textAlign='center'>
                  <UI.Button content='Start Test' onClick={this.startTest}/>
                </UI.Grid.Column>
              </UI.Grid.Row>
            </UI.Grid>
            <br />
            { this.renderScore() }
          </div>
        }

        { testState === this.testStates.TEST_RUNNING &&
          this.renderTest()
        }
      </div>
    );
  }
}

export default App;
