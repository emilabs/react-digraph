import * as React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import ReactListInput from 'react-list-input';
import { ItemHOC, StagingItemHOC } from './common';
import AiEditor from './ai-editor';
import ServerEditor from './server-editor';
import { CardItem, StagingCardItem } from './cards';

const MAX_CHARS = 20;

class AnswerEditor extends React.Component {
  render() {
    const { children, answerHandlers } = this.props;
    const {
      onChangeQuickReplies,
      onChangeCards,
      onChangeIsAudio,
      onChangeExactMatch,
      onChangeTextArea,
      aiHandlers,
      serverHandlers,
    } = answerHandlers;
    const node = children;
    const question = node.gnode.question;
    const quickReplies = question.quickReplies || [];

    return (
      <div id="answerEditor" className="rightEditor">
        {!question.cards && (
          <label className="inputList">
            Quick replies:
            <ReactListInput
              initialStagingValue=""
              onChange={onChangeQuickReplies}
              maxItems={20}
              minItems={0}
              ItemComponent={ItemHOC({ maxChars: MAX_CHARS })}
              StagingComponent={StagingItemHOC({ maxChars: MAX_CHARS })}
              value={quickReplies}
            />
          </label>
        )}
        {quickReplies.length === 0 && (
          <label className="inputList">
            Cards:
            <ReactListInput
              initialStagingValue={{
                type: null,
                title: '',
                payload: null,
                url: null,
              }}
              onChange={onChangeCards}
              maxItems={20}
              minItems={0}
              ItemComponent={CardItem}
              StagingComponent={StagingCardItem}
              value={question.cards ? question.cards[0].buttons : []}
            />
          </label>
        )}
        {(quickReplies.length > 0 || question.cards) && (
          <label>
            Exact match:
            <input
              name="exactMatch"
              type="checkbox"
              checked={question.exactMatch}
              onChange={e => onChangeExactMatch(e.target.checked)}
            />
          </label>
        )}
        {question.exactMatch && (
          <label>
            Error Message:
            <TextareaAutosize
              value={question.errorMessageNotMatch}
              onChange={e =>
                onChangeTextArea('errorMessageNotMatch', e.target.value)
              }
            />
          </label>
        )}
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Is Audio:
          <input
            name="isAudio"
            type="checkbox"
            checked={question.isAudio || false}
            onChange={e => onChangeIsAudio(e.target.checked)}
          />
          {question.isAudio && (
            <label style={{ display: 'flex' }}>
              No Audio - Error Message:
              <TextareaAutosize
                value={question.audioErrorMessage}
                onChange={e =>
                  onChangeTextArea('audioErrorMessage', e.target.value)
                }
              />
            </label>
          )}
        </label>
        <AiEditor aiHandlers={aiHandlers}>{children}</AiEditor>
        <ServerEditor serverHandlers={serverHandlers}>{children}</ServerEditor>
      </div>
    );
  }
}

export default AnswerEditor;
