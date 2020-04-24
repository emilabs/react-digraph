import * as React from 'react';
import ReactListInput from 'react-list-input';

import { QuestionItemHOC } from './question-item';

class ChatbotScript extends React.Component {
  render() {
    const { getScriptItems, setScriptItems, onIndexFocus } = this.props;

    return (
      <label className="inputList vertical-label">
        Script:
        <ReactListInput
          initialStagingValue={{ index: null, answer: null }}
          onChange={value => setScriptItems(value)}
          maxItems={200}
          minItems={0}
          ItemComponent={QuestionItemHOC(onIndexFocus)}
          StagingComponent={() => null}
          value={getScriptItems()}
        />
      </label>
    );
  }
}

export default ChatbotScript;
