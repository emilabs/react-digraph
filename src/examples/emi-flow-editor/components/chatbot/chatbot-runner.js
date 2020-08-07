import * as React from 'react';
import { withAlert } from 'react-alert';
import Select from 'react-select';

import { ENVS } from '../../config';
import { Button, getErrorMessage, getSimpleItem, selectTheme } from '../common';
import Message from './message';

const FINISHED_STATUS = 'conversation finished';
const RUNNING_STATUS = 'running';
const FAILED_STATUS = 'failed';

export const IDLE_STATUS = 'idle';

class ChatbotRunner extends React.Component {
  componentDidUpdate() {
    this.scrollToBottom();
  }

  downloadCSV = () => {
    const { flowName } = this.props;
    const { questionResponses, slotContextVars } = this.props;
    const element = document.createElement('a');
    const lines = Object.keys(questionResponses)
      .map(k => `${k},"${questionResponses[k]}"`)
      .concat(
        Object.keys(slotContextVars).map(k => `${k},"${slotContextVars[k]}"`)
      );
    const csvContent = lines.join('\n');
    const file = new Blob([csvContent], { type: 'text/csv' });

    element.href = URL.createObjectURL(file);
    element.download = `${flowName || 'unnamed'}-answers.csv`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  messageSent = (message, index) => {
    const { messages, onIndexFocus, onMessagesChanged } = this.props;
    const newMessages = [
      ...messages,
      {
        source: 'human',
        message: message,
        extractedData: null,
      },
    ];

    onIndexFocus(index);
    onMessagesChanged({ messages: newMessages });
  };

  messageReceived = ({
    emiMessages,
    extractedData,
    questionResponses,
    slotContextVars,
    index,
  }) => {
    const { messages, onMessagesChanged } = this.props;
    const newMessages = messages.slice();

    if (index) {
      newMessages[newMessages.length - 1].extractedData = extractedData;
    }

    newMessages.push(...emiMessages);
    onMessagesChanged({
      messages: newMessages,
      questionResponses,
      slotContextVars,
    });
  };

  initChat = () => {
    const {
      alert,
      env,
      listingId,
      runChatScript,
      getScriptItems,
      onMessagesChanged,
      onStatusChanged,
    } = this.props;

    onMessagesChanged({
      messages: [],
      questionResponses: [],
      slotContextVars: [],
    });
    onStatusChanged(RUNNING_STATUS);
    const customVars = listingId ? { jobId: listingId } : null;

    runChatScript({
      env,
      customVars,
      scriptItems: getScriptItems(),
      onSendingMessage: this.messageSent,
      onMessageReceived: this.messageReceived,
    })
      .then(() => onStatusChanged(FINISHED_STATUS))
      .catch(err => {
        alert.error(`Chat aborted: ${getErrorMessage(err)}`);
        onStatusChanged(FAILED_STATUS);
      });
  };

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({ behavior: 'smooth' });
  };

  render() {
    const {
      env,
      messages,
      listingId,
      onListingIdChanged,
      onSendListingIdChanged,
      onEnvChanged,
      status,
      sendListingId,
    } = this.props;

    return (
      <div id="chatbotRunner" className="rightEditor">
        <label>
          Environment
          <Select
            className="selectMidContainer"
            theme={selectTheme}
            value={getSimpleItem(env)}
            onChange={item => onEnvChanged(item.value)}
            options={ENVS.map(option => getSimpleItem(option))}
            isSearchable={false}
          />
        </label>
        <label>
          Specify Listing:
          <input
            name="sendListingId"
            type="checkbox"
            checked={sendListingId}
            onChange={e => onSendListingIdChanged(e.target.checked)}
          />
          {sendListingId && (
            <input
              type="text"
              name="listingId"
              value={listingId}
              onChange={e => onListingIdChanged(e.target.value)}
            />
          )}
        </label>
        <label>
          <Button name="runChatSript" onClick={this.initChat}>
            Run chat script
          </Button>
        </label>
        <label>
          Status: {status}
          {status === FINISHED_STATUS && (
            <Button name="downloadCSV" onClick={this.downloadCSV}>
              Download CSV
            </Button>
          )}
        </label>
        <label className="vertical-label chatBkg">
          {messages.map(({ source, message, extractedData }, i) => (
            <Message
              key={i}
              source={source}
              message={message}
              extractedData={extractedData}
            />
          ))}
        </label>
        <div
          style={{ float: 'left', clear: 'both' }}
          ref={el => (this.messagesEnd = el)}
        ></div>
      </div>
    );
  }
}

export default withAlert()(ChatbotRunner);
