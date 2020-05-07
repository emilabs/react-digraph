import * as React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import ChatbotScript from './chatbot-script';
import ChatbotRunner, { IDLE_STATUS } from './chatbot-runner';

class ChatbotEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      questionResponses: [],
      status: IDLE_STATUS,
    };
  }

  componentDidUpdate(prevProps) {
    const { flowName, chatbotHandlers } = this.props;
    const { setScriptItems } = chatbotHandlers;

    if (flowName !== prevProps.flowName) {
      setScriptItems(null);
      this.setState({ messages: [] });
    }
  }

  onMessagesChanged = ({ messages, questionResponses = null }) => {
    this.setState({ messages });

    if (questionResponses !== null) {
      this.setState({ questionResponses });
    }
  };

  onStatusChanged = status => this.setState({ status });

  render() {
    const { messages, questionResponses, status } = this.state;
    const { chatbotHandlers, flowName } = this.props;
    const {
      onIndexFocus,
      runChatScript,
      getScriptItems,
      setScriptItems,
    } = chatbotHandlers;

    return (
      <div id="chatbotEditor" className="rightEditor rightMainEditor">
        <h1>Chatbot</h1>
        <Tabs>
          <TabList>
            <Tab>Script Editor</Tab>
            <Tab>Chatbot Runner</Tab>
          </TabList>
          <TabPanel>
            <ChatbotScript
              getScriptItems={getScriptItems}
              setScriptItems={setScriptItems}
              onIndexFocus={onIndexFocus}
              flowName={flowName}
            />
          </TabPanel>
          <TabPanel>
            <ChatbotRunner
              getScriptItems={getScriptItems}
              runChatScript={runChatScript}
              flowName={flowName}
              onIndexFocus={onIndexFocus}
              messages={messages}
              questionResponses={questionResponses}
              status={status}
              onMessagesChanged={this.onMessagesChanged}
              onStatusChanged={this.onStatusChanged}
            />
          </TabPanel>
        </Tabs>
      </div>
    );
  }
}

export default ChatbotEditor;