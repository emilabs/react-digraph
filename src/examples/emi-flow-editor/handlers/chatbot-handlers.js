import axios from 'axios';

import { motionUrl } from '../config';
import { slotContextVarsPrefix } from './module-node-handlers';

const getChatbotHandlers = bwdlEditable => {
  bwdlEditable.getOderedIndexesWithOptions = function() {
    const { bwdlJson } = this.state;

    return this.bdsTraverse()
      .filter(i => !bwdlJson[i].question.immediateNext)
      .map(index => {
        const { quickReplies: options = [], text } = bwdlJson[index].question;

        return {
          index,
          text,
          options,
        };
      });
  }.bind(bwdlEditable);

  bwdlEditable.onIndexFocus = function(nodeIndex) {
    this.GraphView.panToNode(nodeIndex);
  }.bind(bwdlEditable);

  bwdlEditable.getScriptItems = function() {
    const { scriptItems } = this.state;

    return scriptItems
      ? scriptItems
      : this.getOderedIndexesWithOptions().map(iwo => ({
          ...iwo,
          answer: '',
        }));
  }.bind(bwdlEditable);

  bwdlEditable.setScriptItems = function(scriptItems) {
    this.setState({ scriptItems });
  }.bind(bwdlEditable);

  bwdlEditable.getChatbotSlots = function(contextVars) {
    const slots = {};

    Object.keys(contextVars)
      .filter(k => k.startsWith(slotContextVarsPrefix))
      .forEach(k => (slots[k] = contextVars[k]));

    return slots;
  }.bind(bwdlEditable);

  bwdlEditable.runChatScript = function({
    env,
    customVars,
    scriptItems,
    onSendingMessage,
    onMessageReceived,
  }) {
    const { bwdlJson: customPayload } = this.state;

    return this._runChatScript({
      env,
      customVars,
      scriptItems,
      onSendingMessage,
      onMessageReceived,
      customPayload,
      prevIndexes: [],
    });
  }.bind(bwdlEditable);

  bwdlEditable._runChatScript = function({
    env,
    customVars,
    scriptItems,
    onSendingMessage,
    onMessageReceived,
    customPayload,
    prevIndexes,
    index,
    message,
  }) {
    if (prevIndexes.length) {
      onSendingMessage(message, index);
    }

    return this.sendMessage(env, customVars, customPayload, message).then(
      ({ customPayload, extractedData, questionResponses, emiMessages }) => {
        const slotContextVars = this.getChatbotSlots(
          customPayload.context || {}
        );

        onMessageReceived({
          emiMessages,
          extractedData,
          questionResponses,
          slotContextVars,
          index,
        });
        const { current: nextIndex } = customPayload;

        if (nextIndex === null) {
          return;
        }

        if (nextIndex === index) {
          throw new Error(`Emi didn't understand you`);
        }

        if (prevIndexes.includes(nextIndex)) {
          throw new Error(`Conversational loop`);
        }

        const scriptItem = scriptItems.find(item => item.index === nextIndex);

        if (!scriptItem) {
          throw new Error(`Question not in Script`);
        }

        const { answer: message } = scriptItem;

        if (!message) {
          throw new Error(`Question not in Script`);
        }

        return this._runChatScript({
          env,
          customVars,
          scriptItems,
          onSendingMessage,
          onMessageReceived,
          customPayload,
          message,
          prevIndexes: [...prevIndexes, index],
          index: nextIndex,
        });
      }
    );
  }.bind(bwdlEditable);

  bwdlEditable.sendMessage = function(env, customVars, customPayload, message) {
    return axios
      .post(motionUrl[env], {
        customPayload,
        customVars,
        message,
      })
      .then(function({
        data: { customVars, customPayload, questionResponses, transcript },
      }) {
        const humanTranscript = transcript.find(m => m.human !== undefined);
        const extractedData = humanTranscript && humanTranscript.extractedData;
        const emiMessages = transcript
          .filter(m => m.bot !== undefined)
          .map(m => ({
            source: 'emi',
            message: m.bot,
          }));

        return {
          customPayload,
          extractedData,
          questionResponses,
          emiMessages,
        };
      });
  }.bind(bwdlEditable);

  return bwdlEditable;
};

export default getChatbotHandlers;
