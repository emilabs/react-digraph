import * as React from 'react';

import { PROD } from '../../common';
import { Input } from '../common';

class NameInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showRenameInput: false,
    };
  }

  cancelRename = () => {
    this.setState({ showRenameInput: false });
  };

  rename = () => {
    const { onRename } = this.props;

    this.setState({ showRenameInput: false });
    const flowName = `${this.state.newFlowName}.json`;

    onRename(flowName);
  };

  startRename = () => {
    const { flowName, legacy, flowEnv } = this.props;

    if (!legacy && flowEnv != PROD) {
      this.setState({
        showRenameInput: true,
        newFlowName: (flowName && flowName.slice(0, -5)) || '',
      });
    }
  };

  handleKeyDown = e => {
    this.executeOnEnter(e, this.rename);
    this.executeOnEsc(e, this.cancelRename);
  };

  executeOnEnter = (e, f) => {
    if (e.key === 'Enter') {
      f();
    }
  };

  executeOnEsc = (e, f) => {
    if (e.keyCode === 27) {
      f();
    }
  };

  getDisplayName = () => {
    const {
      flowName,
      flowVersionId,
      legacy,
      flowEnv,
      versionLastModified,
      unsavedChanges,
    } = this.props;

    return `${flowName ? flowName : 'unnamed'}${
      legacy ? '(legacy,readonly)' : ''
    }${flowEnv === PROD ? '(prod,readonly)' : ''}${
      flowVersionId ? '[' + versionLastModified + ']' : ''
    }${unsavedChanges ? '*' : ''}`;
  };

  render() {
    const { legacy, unsavedChanges } = this.props;
    const { showRenameInput, newFlowName } = this.state;

    return (
      <div>
        {!showRenameInput ? (
          <h2
            style={{
              flex: 1,
              color: legacy ? 'crimson' : 'black',
              marginLeft: '50px',
              marginRight: '50px',
            }}
            onClick={this.startRename}
          >
            {this.getDisplayName()}
          </h2>
        ) : (
          <div style={{ display: 'flex' }}>
            <Input
              name="flowName"
              value={newFlowName}
              onKeyDown={this.handleKeyDown}
              onBlur={this.cancelRename}
              onChange={value => this.setState({ newFlowName: value })}
              style={{
                height: 30,
                alignSelf: 'center',
                fontSize: '1.5em',
                marginBlockStart: '0.83em',
                marginBlockEnd: '0.83em',
                marginInlineStart: '0px',
                marginInlineEnd: '0px',
                fontWeight: 'bold',
                fontFamily: 'sans-serif',
              }}
              autoFocus
            />
            <h2 style={{ flex: 1 }}>{`.json${unsavedChanges ? '*' : ''}`}</h2>
          </div>
        )}
      </div>
    );
  }
}

export default NameInput;
