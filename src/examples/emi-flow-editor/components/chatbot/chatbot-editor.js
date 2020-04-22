import * as React from 'react';
import ReactListInput from 'react-list-input';

import { QuestionItemHOC } from './question-item';

class ChatbotEditor extends React.Component {
  render() {
    const { chatbotHandlers } = this.props;
    const { getOderedIndexesWithOptions, onIndexFocus } = chatbotHandlers;

    const items = getOderedIndexesWithOptions().map(iwo => ({
      ...iwo,
      answer: '',
    }));

    return (
      <div id="chatbotEditor" className="rightEditor rightMainEditor">
        <h1>Chatbot</h1>
        <label className="inputList vertical-label">
          Script:
          <ReactListInput
            initialStagingValue={{ index: null, answer: null }}
            onChange={value => null}
            maxItems={200}
            minItems={0}
            ItemComponent={QuestionItemHOC(onIndexFocus)}
            StagingComponent={() => null}
            value={items}
          />
        </label>
      </div>
    );
  }
}

export default ChatbotEditor;
