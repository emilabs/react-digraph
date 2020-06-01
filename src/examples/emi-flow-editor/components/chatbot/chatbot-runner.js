import * as React from 'react';
import { withAlert } from 'react-alert';

import { Button, getErrorMessage } from '../common';
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
    const { questionResponses } = this.props;
    const element = document.createElement('a');
    const csvContent = Object.keys(questionResponses)
      .map(k => `${k},"${questionResponses[k]}"`)
      .join('\n');
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
    index,
  }) => {
    const { messages, onMessagesChanged } = this.props;
    const newMessages = messages.slice();

    if (index) {
      newMessages[newMessages.length - 1].extractedData = extractedData;
    }

    newMessages.push(...emiMessages);
    onMessagesChanged({ messages: newMessages, questionResponses });
  };

  initChat = () => {
    const {
      alert,
      flowJson,
      runChatScript,
      getScriptItems,
      onMessagesChanged,
      onStatusChanged,
    } = this.props;

    onMessagesChanged({ messages: [], questionResponses: [] });
    onStatusChanged(RUNNING_STATUS);
    runChatScript({
      scriptItems: getScriptItems(flowJson),
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
    const { messages, status } = this.props;

    return (
      <div id="chatbotRunner" className="rightEditor">
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
