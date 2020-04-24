import * as React from 'react';
import { withAlert } from 'react-alert';
import Tooltip from 'react-tooltip-lite';

import { Button, getErrorMessage } from '../common';

const FINISHED_STATUS = 'conversation finished';
const RUNNING_STATUS = 'running';
const FAILED_STATUS = 'failed';

const Message = ({ source, message, extraData }) => {
  if (extraData) {
    return (
      <Tooltip content={extraData} className={`${source}Message chatMessage`}>
        <label className={`${source}Message chatMessage`}>{message}</label>
      </Tooltip>
    );
  } else {
    return <label className={`${source}Message chatMessage`}>{message}</label>;
  }
};

class ChatbotRunner extends React.Component {
  constructor(props) {
    super(props);

    this.state = { messages: [] };
  }

  downloadCSV = () => {
    const { flowName, getScriptItems } = this.props;
    const element = document.createElement('a');
    const csvContent = getScriptItems()
      .map(({ index, answer }) => `${index}, "${answer}"`)
      .join('\n');
    const file = new Blob([csvContent], { type: 'text/csv' });

    element.href = URL.createObjectURL(file);
    element.download = `${flowName || 'unnamed'}-answers.csv`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  messageSent = message => {
    const { messages } = this.state;

    this.setState({
      messages: [
        ...messages,
        {
          source: 'human',
          message: message,
          extractedData: null,
        },
      ],
    });
  };

  messageReceived = transcript => {
    const { messages: oldMessages } = this.state;
    const messages = oldMessages.slice();
    const humanMessageTranscript = transcript.find(m => m.human !== undefined);

    if (humanMessageTranscript) {
      const humanMessage = messages[messages.length - 1];

      humanMessage.extractedData = humanMessageTranscript.extractedData;
    }

    const remoteMessages = transcript
      .filter(m => m.bot !== undefined)
      .map(m => ({
        source: 'emi',
        message: m.bot,
      }));

    messages.push(...remoteMessages);

    this.setState({ messages });
  };

  initChat = () => {
    const { alert, runChatScript, getScriptItems } = this.props;

    this.setState({ status: RUNNING_STATUS, messages: [] });
    runChatScript({
      scriptItems: getScriptItems(),
      onSendingMessage: this.messageSent,
      onMessageReceived: this.messageReceived,
    })
      .then(() => this.setState({ status: FINISHED_STATUS }))
      .catch(err => {
        alert.error(`Chat aborted: ${getErrorMessage(err)}`);
        this.setState({ status: FAILED_STATUS });
      });
  };

  render() {
    const { messages, status } = this.state;

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
          {messages.map(({ source, message, extraData }, i) => (
            <Message
              key={i}
              source={source}
              message={message}
              extraData={extraData}
            />
          ))}
        </label>
      </div>
    );
  }
}

export default withAlert()(ChatbotRunner);
