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
    const { flowName, legacy, flowEnv, isModule } = this.props;

    if (!legacy && flowEnv != PROD && !isModule) {
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
      isModule,
      published,
      flowVersionId,
      legacy,
      flowEnv,
      versionLastModified,
      unsavedChanges,
    } = this.props;

    if (isModule) {
      return `${flowName} ${flowEnv === PROD ? ' (prod,readonly)' : ''}${
        published ? ' (published,readonly)' : ''
      }${flowVersionId ? ' [' + versionLastModified + ']' : ''}${
        unsavedChanges ? '*' : ''
      }`;
    } else {
      return `${flowName ? flowName : 'unnamed'}${
        legacy ? ' (legacy,readonly)' : ''
      }${flowEnv === PROD ? ' (prod,readonly)' : ''}${
        flowVersionId ? ' [' + versionLastModified + ']' : ''
      }${unsavedChanges ? '*' : ''}`;
    }
  };

  getDisplayVersion = () => {
    const { moduleVersion, isModule } = this.props;

    return (
      isModule && `${moduleVersion === 'draft' ? '' : 'v'}${moduleVersion}`
    );
  };

  render() {
    const { legacy, unsavedChanges, isModule } = this.props;
    const { showRenameInput, newFlowName } = this.state;

    return (
      <div
        className={`pt-2 pb-0 d-flex flex-row justify-content-center align-items-center ${
          isModule ? 'moduleName px-4' : ''
        }`}
        style={{ alignSelf: 'center' }}
      >
        {isModule && (
          <svg
            className="px-4"
            aria-hidden="true"
            data-prefix="fas"
            data-icon="project-diagram"
            height="20px"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 512"
          >
            <path d="M384 320H256c-17.67 0-32 14.33-32 32v128c0 17.67 14.33 32 32 32h128c17.67 0 32-14.33 32-32V352c0-17.67-14.33-32-32-32zM192 32c0-17.67-14.33-32-32-32H32C14.33 0 0 14.33 0 32v128c0 17.67 14.33 32 32 32h95.72l73.16 128.04C211.98 300.98 232.4 288 256 288h.28L192 175.51V128h224V64H192V32zM608 0H480c-17.67 0-32 14.33-32 32v128c0 17.67 14.33 32 32 32h128c17.67 0 32-14.33 32-32V32c0-17.67-14.33-32-32-32z"></path>
          </svg>
        )}
        {!showRenameInput ? (
          <div className="d-flex flex-row align-items-center">
            <h2
              style={{ color: legacy ? 'crimson' : 'black' }}
              onClick={this.startRename}
            >
              {this.getDisplayName()}
            </h2>
            {this.getDisplayVersion() && (
              <h2 className="ml-4">{this.getDisplayVersion()}</h2>
            )}
          </div>
        ) : (
          <div className="d-flex flex-row align-items-center">
            <Input
              name="flowName"
              value={newFlowName}
              onKeyDown={this.handleKeyDown}
              onBlur={this.cancelRename}
              onChange={value => this.setState({ newFlowName: value })}
              style={{
                fontSize: '1.5em',
                fontFamily: 'sans-serif',
              }}
              autoFocus
            />
            <h2>{`.json${unsavedChanges ? '*' : ''}`}</h2>
          </div>
        )}
      </div>
    );
  }
}

export default NameInput;
