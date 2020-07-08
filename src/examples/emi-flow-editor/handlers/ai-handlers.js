import {
  commonIntents,
  defaultQuestionStr,
  empathyDefaults,
  entitiesByQuestionStr,
  getDefaultCommonIntentsDict,
} from '../empathy';
import getServerHandlers from './server-handlers';

const getAiHandlers = bwdlEditable => {
  bwdlEditable.setAiDefaults = function(nodeJson, newQuestionStr) {
    nodeJson.ai = Object.assign(
      { question_str: newQuestionStr },
      JSON.parse(JSON.stringify(empathyDefaults[newQuestionStr]))
    );

    const prediction_data = nodeJson.ai.prediction_data;

    if (prediction_data && 'options' in prediction_data) {
      nodeJson.question.quickReplies.forEach(function(quickReply) {
        prediction_data.options[quickReply] = [];
      });
    }
  }.bind(bwdlEditable);

  bwdlEditable.onChangeAI = function(aiEnabled) {
    this.changeSelectedNode(node => {
      if (aiEnabled) {
        this.setAiDefaults(node, defaultQuestionStr);
      } else {
        if (node.question.exactMatch) {
          this.onChangeExactMatch(false);
        }

        delete node.ai;
      }
    });
  }.bind(bwdlEditable);

  bwdlEditable.onChangeAiQuestionStr = function(item) {
    this.changeSelectedNode(node => {
      this.setAiDefaults(node, item.value);
    });
  }.bind(bwdlEditable);

  bwdlEditable.onChangePredictionDataOptions = function(key, newValue) {
    this.changeSelectedNode(node => {
      node.ai.prediction_data.options[key] = newValue;
    });
  }.bind(bwdlEditable);

  bwdlEditable.onChangeLang = function(item) {
    this.changeSelectedNode(node => {
      node.ai.lang = item.value;
    });
  }.bind(bwdlEditable);

  bwdlEditable.onChangeCountry = function(item) {
    this.changeSelectedNode(node => {
      node.ai.country = item.value;
    });
  }.bind(bwdlEditable);

  bwdlEditable.onChangeUseCommonIntents = function(value) {
    this.changeSelectedNode(node => {
      const { ai } = node;
      const { prediction_data } = ai;
      const { intent_responses } = prediction_data;

      if (value) {
        prediction_data.intent_responses = {
          ...intent_responses,
          ...getDefaultCommonIntentsDict(),
        };
      } else {
        Object.keys(intent_responses)
          .filter(i => commonIntents.includes(i))
          .forEach(i => delete intent_responses[i]);
      }

      ai.use_common_intents = value;
    });
  }.bind(bwdlEditable);

  bwdlEditable.onChangePredictionDataNumber = function(
    field,
    min,
    max,
    newValue
  ) {
    if (newValue !== '' && (newValue > max || newValue < min)) {
      return;
    }

    this.changeSelectedNode(node => {
      node.ai.prediction_data[field] = newValue;
    });
  }.bind(bwdlEditable);

  bwdlEditable.onChangeMinSimilarity = function(newValue) {
    this.onChangePredictionDataNumber('min_similarity', 1, 100, newValue);
  }.bind(bwdlEditable);

  bwdlEditable.onChangeMinValue = function(newValue) {
    this.onChangePredictionDataNumber(
      'min_value',
      0,
      Number.MAX_SAFE_INTEGER,
      newValue
    );
  }.bind(bwdlEditable);

  bwdlEditable.onChangeMaxValue = function(newValue) {
    this.onChangePredictionDataNumber(
      'max_value',
      0,
      Number.MAX_SAFE_INTEGER,
      newValue
    );
  }.bind(bwdlEditable);

  bwdlEditable.onChangeIntentResponses = function(newValue) {
    this.changeSelectedNode(node => {
      node.ai.prediction_data.intent_responses = newValue;
    });
  }.bind(bwdlEditable);

  bwdlEditable.getIntents = function() {
    const { prediction_data = {} } = this.state.selected.gnode.ai || {};

    return Object.keys(prediction_data.intent_responses || {}).concat(
      Object.keys(prediction_data.options || {})
    );
  }.bind(bwdlEditable);

  bwdlEditable.getEntities = function() {
    const { ai } = this.state.selected.gnode;

    return ai ? entitiesByQuestionStr[ai.question_str] : [];
  }.bind(bwdlEditable);

  bwdlEditable.aiServerHandlers = getServerHandlers(bwdlEditable, 'ai');

  return bwdlEditable;
};

export default getAiHandlers;
