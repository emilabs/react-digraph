import * as React from 'react';
import { withAlert } from 'react-alert';
import Tooltip from 'react-tooltip-lite';

import { Button, getErrorMessage } from '../common';

const FINISHED_STATUS = 'conversation finished';
const RUNNING_STATUS = 'running';
const FAILED_STATUS = 'failed';
const Message = ({ source, message, extractedData }) => {
  if (extractedData) {
    return (
      <Tooltip
        content={JSON.stringify(extractedData, null, 2)}
        className={`messageContainer ${source}Message chatMessage `}
      >
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

  componentDidUpdate() {
    this.scrollToBottom();
  }

  downloadCSV = () => {
    const { flowName } = this.props;
    const { questionResponses } = this.state;
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
    const { messages } = this.state;
    const { onIndexFocus } = this.props;

    onIndexFocus(index);
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

  messageReceived = ({
    emiMessages,
    extractedData,
    questionResponses,
    index,
  }) => {
    let { messages } = this.state;

    messages = messages.slice();

    if (index) {
      messages[messages.length - 1].extractedData = extractedData;
    }

    messages.push(...emiMessages);
    this.setState({ messages, questionResponses });
  };

  initChat = () => {
    const { alert, runChatScript, getScriptItems } = this.props;

    this.setState({
      status: RUNNING_STATUS,
      messages: [],
      questionResponses: [],
    });
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

  scrollToBottom = () => {
    this.messagesEnd.scrollIntoView({ behavior: 'smooth' });
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
