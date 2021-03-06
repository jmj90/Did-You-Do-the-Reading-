import React, { Component } from 'react'
import { connect } from 'react-redux'
import { setGameOnStateThunk, setCurrentQuestionThunk, updateGameState, listenForNewStudents, stopListeningForNewStudents } from '../../../store'
import history from '../../../history'
import { Button } from 'semantic-ui-react'
import Leaderboard from '../../Leaderboard'
import HeaderSmall  from '../../HeaderSmall'


export class TeacherAnswerReveal extends Component {
  constructor() {
    super()
    this.state = {
      gameRoomId: '',
      questionId: '',
    }

    this.nextQuestion = this.nextQuestion.bind(this)
    this.endGame = this.endGame.bind(this)
  }

  componentDidMount() {
    this.props.setGameOnStateThunk(this.props.match.params.pin)
    this.props.setCurrentQuestionThunk(this.props.match.params.questionId, this.props.match.params.pin)
    this.props.listenForNewStudents(this.props.match.params.pin);
  }

  componentWillReceiveProps(nextProps){
    this.setState({
      gameRoomId: this.props.match.params.pin,
      questionId: this.props.match.params.questionId
    })

  }

  nextQuestion() {
    const currentGame = this.props.currentGame
    const gameRoomId = this.props.match.params.pin;
    const questionsArr = Object.keys(currentGame)
    const currentQuestionId = this.props.match.params.questionId
    const nextIndex = questionsArr.indexOf(currentQuestionId) + 1
    const nextId = questionsArr[nextIndex]

    this.props.updateGameState(gameRoomId, 'askingQuestion');
    history.push(`/teacher/${gameRoomId}/question/${nextId}`)
  }

  endGame() {
    const gameRoomId = this.props.match.params.pin

    this.props.updateGameState(gameRoomId, 'gameOver')
    history.push(`/teacher/${gameRoomId}/gameOver`)
  }

  render() {


    const currentGame = this.props.currentGame
    const questionsArr = Object.keys(currentGame)
    const currentQuestionId = this.props.match.params.questionId

    let lastQuestion;
    if (questionsArr.indexOf(currentQuestionId) === questionsArr.length - 1){
      lastQuestion = true;
    } else {
      lastQuestion = false;
    }

    const currentQuestion = this.props.currentQuestion.question || ''
    const rightAnswer = this.props.currentQuestion.rightAnswer || ''
    return (
      <div>
        <HeaderSmall />
        <hr />
        <div className="answer-reveal-wrapper">
          <div id="current-question">{currentQuestion}</div>
          <h1>correct answer: </h1>
          <div id="current-answer">{rightAnswer}</div>
          {
            lastQuestion ?
            <Button className="ui button purple" onClick={this.endGame}> End Game</Button> :
            <Button className="ui button teal" onClick={this.nextQuestion}> Next Question</Button>
          }
          <br />
          {
            this.props.currentStudents.length > 0 ?
            <Leaderboard />
              :
              <div>
                <center>
                <h1>Leaderboard</h1>
                <h4>No current players to display</h4>
              </center>
              </div>
            }

        </div>
      </div>
    )
  }

}

const mapState = state => {
  return {
    currentGame: state.currentGame,
    currentQuestion: state.currentQuestion,
    currentStudents: state.currentStudents,
  }
}

const mapDispatch = { setGameOnStateThunk, setCurrentQuestionThunk, updateGameState, stopListeningForNewStudents, listenForNewStudents }

export default connect(mapState, mapDispatch)(TeacherAnswerReveal)
