import * as React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import ChatbotScript from './chatbot-script';
import ChatbotRunner from './chatbot-runner';

class ChatbotEditor extends React.Component {
  componentDidUpdate(prevProps) {
    const { flowName, chatbotHandlers } = this.props;
    const { setScriptItems } = chatbotHandlers;

    if (flowName !== prevProps.flowName) {
      setScriptItems(null);
    }
  }

  render() {
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
            />
          </TabPanel>
        </Tabs>
      </div>
    );
  }
}

export default ChatbotEditor;
