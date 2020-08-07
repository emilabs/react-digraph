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
      slotContextVars: {},
      status: IDLE_STATUS,
      hasModuleImports: this.hasModuleImports(),
      env: PROD,
      sendListingId: false,
      listingId: '',
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

  onListingIdChanged = listingId => this.setState({ listingId });

  onSendListingIdChanged = sendListingId => {
    let { listingId } = this.state;

    if (!sendListingId) {
      listingId = '';
    }

    this.setState({ sendListingId, listingId });
  };

  onEnvChanged = env => this.setState({ env });

  onMessagesChanged = ({
    messages,
    questionResponses = null,
    slotContextVars = null,
  }) => {
    this.setState({ messages });

    if (questionResponses !== null) {
      this.setState({ questionResponses });
    }

    if (slotContextVars !== null) {
      this.setState({ slotContextVars });
    }
  };

  onStatusChanged = status => this.setState({ status });

  render() {
    const {
      env,
      hasModuleImports,
      messages,
      listingId,
      questionResponses,
      slotContextVars,
      sendListingId,
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
                messages={messages}
                listingId={listingId}
                questionResponses={questionResponses}
                slotContextVars={slotContextVars}
                onEnvChanged={this.onEnvChanged}
                onIndexFocus={onIndexFocus}
                onMessagesChanged={this.onMessagesChanged}
                onListingIdChanged={this.onListingIdChanged}
                onSendListingIdChanged={this.onSendListingIdChanged}
                onStatusChanged={this.onStatusChanged}
                runChatScript={runChatScript}
                sendListingId={sendListingId}
                status={status}
              />
            </TabPanel>
          </Tabs>
        )}
      </div>
    );
  }
}

export default ChatbotEditor;
