import * as React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import { PROD } from '../../config';
import {
  Button,
  confirmExecute,
  getErrorMessage,
  loadingAlert,
} from '../common';
import ChatbotScript from './chatbot-script';
import ChatbotRunner, { IDLE_STATUS } from './chatbot-runner';

class ChatbotEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      messages: [],
      questionResponses: [],
      status: IDLE_STATUS,
      hasModuleImports: this.hasModuleImports(),
      env: PROD,
    };
  }

  resolveFlow = () => {
    const {
      chatbotHandlers: { loadResolvedFlow },
    } = this.props;

    confirmExecute({
      f: () => {
        const closeAlert = loadingAlert('Resolving flow');

        loadResolvedFlow()
          .catch(err =>
            alert.error(`Flow resolution failed: ${getErrorMessage(err)}`)
          )
          .finally(closeAlert);
      },
      title: 'Resolve Flow?',
      message: `You will loose unsaved changes, and won't be able to keep editing.`,
    });
  };

  hasModuleImports = () => {
    const {
      chatbotHandlers: { getModuleNodes },
    } = this.props;

    return getModuleNodes().length > 0;
  };

  componentDidUpdate(prevProps) {
    const { flowName, chatbotHandlers } = this.props;
    const { setScriptItems } = chatbotHandlers;

    if (flowName !== prevProps.flowName) {
      setScriptItems(null);
      this.setState({
        messages: [],
        hasModuleImports: this.hasModuleImports(),
      });
    }
  }

  onEnvChanged = env => this.setState({ env });

  onMessagesChanged = ({ messages, questionResponses = null }) => {
    this.setState({ messages });

    if (questionResponses !== null) {
      this.setState({ questionResponses });
    }
  };

  onStatusChanged = status => this.setState({ status });

  render() {
    const {
      env,
      hasModuleImports,
      messages,
      questionResponses,
      status,
    } = this.state;
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
        {hasModuleImports ? (
          <div>
            <span>
              Chatbot does not support modules. Please click the button below to
              load a resolved version of the flow.
            </span>
            <label>
              <Button name="resolveFlow" onClick={this.resolveFlow}>
                Load resolved flow
              </Button>
            </label>
          </div>
        ) : (
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
                env={env}
                flowName={flowName}
                getScriptItems={getScriptItems}
                runChatScript={runChatScript}
                onIndexFocus={onIndexFocus}
                messages={messages}
                questionResponses={questionResponses}
                status={status}
                onEnvChanged={this.onEnvChanged}
                onMessagesChanged={this.onMessagesChanged}
                onStatusChanged={this.onStatusChanged}
              />
            </TabPanel>
          </Tabs>
        )}
      </div>
    );
  }
}

export default ChatbotEditor;
