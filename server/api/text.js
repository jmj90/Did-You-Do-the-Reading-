const router = require('express').Router();
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const {WordList} = require('../db/models');
const {lookup, getRandomIndex, getRandomWords} = require('./utils');


module.exports = router;

router.post('/vocab', async (req, res, next)=> {
  const textArray = req.body;

  try {
    const response = await WordList.findAll({
      where: {
        word:{
          [Op.or]: textArray
        }
      }
    });

    const vocabWords = response.map(entry => {
      return entry.word
    })

    const questions = await Promise.all(vocabWords.map(async word => {

      const questionObject = {};
      const thesaurusInfo = await lookup(word);

      // this is currently hard-coding to the first part of speech
      const partOfSpeech = Object.keys(thesaurusInfo)[0];

      const synIndex = getRandomIndex(thesaurusInfo[partOfSpeech].syn)

      const synonym = thesaurusInfo[partOfSpeech].syn[synIndex];

      let antonym = '';

      if (thesaurusInfo[partOfSpeech].ant){
        const antIndex = getRandomIndex(thesaurusInfo[partOfSpeech].ant);
        antonym = thesaurusInfo[partOfSpeech].ant[antIndex];
      }
      const randomWords = await getRandomWords(word);


      questionObject.question = `What word means ${word}?`;
      questionObject.rightAnswer = synonym;

      if (!antonym.length){
        questionObject.wrongAnswers = randomWords;
      } else {
        questionObject.wrongAnswers = [antonym, randomWords[0], randomWords[1]];
      }
      //nice-to-haves
      /*
      - randomize which part of speech it uses
      - OR add part of speech to consideration
      - do some matching on the word and answer
      */
      return questionObject;
    }))

    res.json(questions);
  }
  catch (error) {
    next(error)
  }
})
