import getAiHandlers from './ai-handlers';
import getServerHandlers from './server-handlers';

const getAnswerHandlers = bwdlEditable => {
  bwdlEditable.onChangeIsAudio = function(newValue) {
    if (!newValue) {
      this.state.selected.gnode.question.audioErrorMessage = '';
    }

    this.changeQuestionProperty('isAudio', newValue);
  }.bind(bwdlEditable);

  bwdlEditable.onChangeExactMatch = function(newValue) {
    if (!newValue) {
      this.state.selected.gnode.question.errorMessageNotMatch = '';
    } else {
      if (!this.state.selected.gnode.ai) {
        this.onChangeAI(true);
      }
    }

    this.changeQuestionProperty('exactMatch', newValue);
  }.bind(bwdlEditable);

  bwdlEditable.onChangeQuickReplies = function(newValue) {
    this.changeSelectedQuestion(question => {
      question.quickReplies = newValue;

      if (newValue.length == 0) {
        question.exactMatch = false;
        question.errorMessageNotMatch = '';
      } else {
        const { ai } = this.state.selected.gnode;

        if (ai && ai.question_str == 'best_match_no_retry') {
          const { options } = ai.prediction_data;

          Object.keys(options).forEach(key => {
            const index = newValue.indexOf(key);

            if (index == -1) {
              delete options[key];
            } else {
              options[key].splice(0, 1, index + 1);
            }
          });

          newValue
            .filter(key => !options[key])
            .forEach(key => (options[key] = [newValue.indexOf(key) + 1]));
        }
      }
    });
  }.bind(bwdlEditable);

  bwdlEditable.onChangeCards = function(newValue) {
    this.changeSelectedQuestion(question => {
      if (!question.cards) {
        question.cards = [{}];
      }

      question.cards[0].buttons = newValue;

      if (newValue.length == 0) {
        question.exactMatch = false;
        question.errorMessageNotMatch = '';
        delete question.cards;
      }
    });
  }.bind(bwdlEditable);

  bwdlEditable.onChangeSetContextActions = function(newValue) {
    this.changeSelectedQuestion(question => {
      question.setContextFromActions = newValue;
    });
  }.bind(bwdlEditable);

  bwdlEditable.aiHandlers = getAiHandlers(bwdlEditable);
  bwdlEditable.serverHandlers = getServerHandlers(bwdlEditable);

  return bwdlEditable;
};

export default getAnswerHandlers;
