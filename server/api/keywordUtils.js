const nlp = require('compromise')
const { findSyntax } = require('./quoteUtils')
const { shuffle } = require('./utils')
const datamuse = require('datamuse');


const findNonPeopleKeywords = async (text, fullText) => {

  try {
    let nonPersonArr = text.keywords.filter(obj => {
      let doc = nlp(obj.text)
      let person = doc.match('#Person')
      let realPerson = person.data()

      if (!realPerson.length) {
        return obj
      }
    })
    // const place = doc.match('#Place')
    const questionObj = await makeQuestionObj(nonPersonArr, fullText)
    return questionObj
  }
  catch (err) {
    console.error('ERROR:', err);
  }
}
const makeWrongAnswers = async (obj) => {

  const answerArr = obj.map(q => {
    return q.rightAnswer
  })

  try {
    const wrongArr = await Promise.all(answerArr.map(text => {
      if (text.charCodeAt(0) > 96) {
        let similar = datamuse.words({
          ml: `${text}`
        })
          .then((json) => {
            if (json.length > 2) {
              let wrongWords = json.slice(0, 3)
              return wrongWords
            }
            return []
          })
        return similar
      } else return []
    })
    )
    let simplifiedArr = wrongArr.map(arr => {
      let newArr = arr.map(wordObj => {
        return wordObj.word
      })
      return newArr
    })
    return simplifiedArr
  }
  catch (err) {
    console.error('ERROR:', err);
  }
}

const makeQuestionObj = async (arr, text) => {
  try {
    const sentences = await findSyntax(text)
    const filteredSentences = sentences.filter(sentence => {
      return sentence.text.length > 40 && sentence.text.length < 140 && sentence.text.charCodeAt(0) < 97 && ((sentence.text.slice(-7).includes('.')) ||
        (sentence.text.slice(-7).includes('!')) ||
        (sentence.text.slice(-7).includes('?')))
    })

    const properArr = arr.filter(keywordObj => {
      return keywordObj.text.charCodeAt(0) < 96
    })

    let sentenceObjArr = []
    for (let i = 0; i < filteredSentences.length; i++) {
      for (let j = 0; j < properArr.length; j++) {
        if (filteredSentences[i].text.includes(properArr[j].text)) {
          let questionStartIdx = filteredSentences[i].text.indexOf(properArr[j].text)
          let endIdx = properArr[j].text.length + questionStartIdx
          let question = filteredSentences[i].text.slice(0, questionStartIdx) + '_____________' + filteredSentences[i].text.slice(endIdx)
          sentenceObjArr.push({
            question: question,
            rightAnswer: properArr[j].text
          })
        }
      }
    }
    // let wrongAnswers = await makeWrongAnswers(sentenceObjArr)
    let wrongAnswers = sentenceObjArr.map(obj => {
        let filtered = properArr.filter(el => {
          return obj.rightAnswer !== el.text && !obj.rightAnswer.includes(el.text) && !el.text.includes(obj.rightAnswer)
        })
        let shuffled = shuffle(filtered)
        let simpleShuffled = shuffled.slice(0, 3).map(word => {
          return word.text
        })
        return simpleShuffled
    })

    let finalQuestionObj = sentenceObjArr.map((obj, idx) => {
      let wrongAnswersArr = wrongAnswers[idx]
      let answers = wrongAnswersArr.concat(obj.rightAnswer)
      obj.answers = shuffle(answers)
      return obj
    })
    return finalQuestionObj
  }
  catch (err) {
    console.error('ERROR:', err);
  }
}



module.exports = { findNonPeopleKeywords }
