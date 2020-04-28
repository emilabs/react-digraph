import * as React from 'react';
import ReactListInput from 'react-list-input';
import { withAlert } from 'react-alert';

import { QuestionItemHOC } from './question-item';
import { getErrorMessage } from '../common';

class ChatbotScript extends React.Component {
  render() {
    const { alert, getScriptItems, setScriptItems, onIndexFocus } = this.props;
    let scriptItems;

    try {
      scriptItems = getScriptItems();
    } catch (err) {
      alert.error(`Couldn't build chatbot script: ${getErrorMessage(err)}`);
      scriptItems = [];
    }

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
          value={scriptItems}
        />
      </label>
    );
  }
}

export default withAlert()(ChatbotScript);
