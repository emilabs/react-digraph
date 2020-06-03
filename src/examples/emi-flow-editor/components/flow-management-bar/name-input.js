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
    const { flowName, legacy, flowEnv, moduleEverPublished } = this.props;

    if (!legacy && flowEnv != PROD && !moduleEverPublished) {
      this.setState({
        showRenameInput: true,
        newFlowName: flowName || '',
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
      flowVersionId,
      versionLastModified,
      unsavedChanges,
    } = this.props;

    if (isModule) {
      return `${flowName}
      ${flowVersionId ? ' [' + versionLastModified + ']' : ''}${
        unsavedChanges ? '*' : ''
      }`;
    } else {
      return `${flowName ? flowName : 'unnamed'}${
        flowVersionId ? ' [' + versionLastModified + ']' : ''
      }${unsavedChanges ? '*' : ''}`;
    }
  };

  getDisplayModuleVersion = () => {
    const { moduleVersion, draft } = this.props;

    return draft ? 'draft' : `v${moduleVersion}`;
  };

  getTags = () => {
    const {
      draft,
      legacy,
      flowEnv,
      flowVersionId,
      isModule,
      moduleEverPublished,
    } = this.props;
    const tags = [
      ...(isModule && !moduleEverPublished ? ['unpublished'] : []),
      ...(isModule && !draft ? ['publishedVersion'] : []),
      ...(flowEnv === PROD ? ['prod'] : []),
      ...(legacy ? ['legacy'] : []),
      ...(flowEnv === PROD || !draft || legacy ? ['readonly'] : []),
      ...(flowVersionId ? ['pastVersion'] : []),
    ];

    return tags;
  };

  render() {
    const { legacy, unsavedChanges, isModule } = this.props;
    const { showRenameInput, newFlowName } = this.state;

    return (
      <div>
        {!showRenameInput ? (
          <div className="pt-2 pb-0 d-flex flex-row justify-content-center align-items-center">
            <div
              className={`d-flex flex-row justify-content-center align-items-center ${
                isModule ? 'px-4' : ''
              }`}
            >
              <h2
                className="mb-0"
                style={{ color: legacy ? 'crimson' : 'black' }}
                onClick={this.startRename}
              >
                {this.getDisplayName()}
              </h2>
              {isModule && (
                <div className="moduleLibBarIcon ml-3 d-flex flex-row justify-content-center align-items-center">
                  <svg
                    className="mx-2"
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
                  <h3 className="mb-0 mx-1 barModuleVersion">
                    {this.getDisplayModuleVersion()}
                  </h3>
                </div>
              )}
              <div className="ml-5 d-flex flex-row justify-content-center align-items-center">
                {this.getTags().map(t => (
                  <h5 key={t} className="mb-0 ml-4 flowTag">
                    {t}
                  </h5>
                ))}
              </div>
            </div>
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
            <h2>{`${unsavedChanges ? '*' : ''}`}</h2>
          </div>
        )}
      </div>
    );
  }
}

export default NameInput;
