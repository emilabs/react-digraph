import * as React from 'react';

import ChatbotEditor from './chatbot/chatbot-editor';
import MultiEdgeEditor from './multi-edge-editor';
import FaqEditor from './faq-editor';
import ModuleConfigEditor from './module/module-config-editor';
import NodeEditor from './node-editor';

class RightEditor extends React.Component {
  render() {
    const {
      chatbotMode,
      chatbotHandlers,
      children,
      faqMode,
      moduleConfigHandlers,
      moduleLibMode,
      nodeHandlers,
      edgeHandlers,
      faqHandlers,
      bwdlText,
      flowName,
    } = this.props;

    if (faqMode) {
      return <FaqEditor faqHandlers={faqHandlers} />;
    } else if (moduleLibMode) {
      return (
        <ModuleConfigEditor
          moduleConfigHandlers={moduleConfigHandlers}
          bwdlText={bwdlText}
        />
      );
    } else if (chatbotMode) {
      return (
        <ChatbotEditor chatbotHandlers={chatbotHandlers} flowName={flowName} />
      );
    } else if (!children) {
      return (
        <div id="rightEditor" className="rightEditor">
          <h1>Select a node or an edge, or click on FAQ...</h1>
        </div>
      );
    } else if (children.source) {
      return (
        <MultiEdgeEditor edgeHandlers={edgeHandlers}>
          {children}
        </MultiEdgeEditor>
      );
    } else {
      return <NodeEditor nodeHandlers={nodeHandlers}>{children}</NodeEditor>;
    }
  }
}

export default RightEditor;
