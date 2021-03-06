const Sequelize = require('sequelize')
const db = require('../db')

const WordList = db.define('wordList', {
  word: {
    type: Sequelize.STRING,
    allowNull: false
  },
  partOfSpeech: {
    type: Sequelize.STRING
  }
})

module.exports = WordList

/**
 * instanceMethods
 */
