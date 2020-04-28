import * as React from 'react';
import { withAlert } from 'react-alert';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css

import { Button, getErrorMessage, LoadingWrapper } from '../common';
import FolderSelector from './folder-selector';

class ModuleConfigEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      lastPublishedVersionNumber: null,
      lastPublishedVersionContents: null,
    };
  }

  componentDidMount() {
    const { moduleConfigHandlers, alert } = this.props;
    const { getLastPublishedModule, isModule } = moduleConfigHandlers;

    if (isModule()) {
      this.setState({ s3Loading: true });
      getLastPublishedModule()
        .then(({ version: lastPublishedVersionNumber, contents }) => {
          const lastPublishedVersionContents = contents.replace(
            `"version": "${lastPublishedVersionNumber}"`,
            `"version": "master"`
          );

          this.setState({
            lastPublishedVersionNumber,
            lastPublishedVersionContents,
          });
        })
        .catch(err => {
          alert.error(
            `Couldn't get last published version: ${getErrorMessage(err)}`
          );
        })
        .finally(() => this.setState({ s3Loading: false }));
    }
  }

  unpublishedChanges = () => {
    const { bwdlText } = this.props;
    const { lastPublishedVersionContents: vContents } = this.state;
    const master = JSON.stringify(JSON.parse(bwdlText), null, 2);
    const version = JSON.stringify(JSON.parse(vContents), null, 2);

    return master !== version;
  };

  _openTurnMenu = () => {
    const { alert, flowName } = this.props;

    if (!flowName) {
      alert.error(
        `Can't turn flow into a module. Please name your flow first!`
      );
    } else {
      this.setState({ turnMenuOpened: true });
    }
  };

  _turnIntoModule = newFolder => {
    const { moduleConfigHandlers, alert } = this.props;
    const { turnIntoModule } = moduleConfigHandlers;

    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="react-confirm-alert-body">
          <h1>Turn flow into module?</h1>
          <p>This operation is not undoable!</p>
          <p>Are you sure?</p>
          <div className="react-confirm-alert-button-group">
            <Button
              onClick={() =>
                turnIntoModule(newFolder).catch(err =>
                  alert.error(
                    `Couldn't turn Flow into Module: ${getErrorMessage(err)}`
                  )
                )
              }
            >
              Yes, do it god damn it!
            </Button>
            <Button onClick={onClose}>No, I changed my mind</Button>
          </div>
        </div>
      ),
    });
  };

  render() {
    const {
      turnMenuOpened,
      newFolder,
      lastPublishedVersionNumber,
      s3Loading,
    } = this.state;
    const { moduleConfigHandlers } = this.props;
    const {
      isModule,
      getModuleFolders,
      getModuleConfig,
      publishModuleVersion,
    } = moduleConfigHandlers;
    const moduleConfig = getModuleConfig();

    return (
      <div id="moduleConfigEditor" className="rightEditor">
        <h1>Module Configuration</h1>
        {isModule() ? (
          <div>
            <label className="flex-grow-0">
              Name:
              <span>{moduleConfig.name}</span>
            </label>
            <label className="vertical-label">
              <h4>Version</h4>
              <label className="flex-grow-0">
                Last published:
                <LoadingWrapper
                  isLoading={s3Loading}
                  width="20px"
                  height="20px"
                >
                  <span>{lastPublishedVersionNumber || 'None'}</span>
                </LoadingWrapper>
              </label>
              <label className="vertical-label">
                <h4>Master</h4>
                <label className="flex-grow-0">
                  Unpublished changes:
                  <LoadingWrapper
                    isLoading={s3Loading}
                    width="20px"
                    height="20px"
                  >
                    <span>{this.unpublishedChanges() ? 'Yes' : 'None'}</span>
                  </LoadingWrapper>
                </label>
                {!s3Loading && this.unpublishedChanges() && (
                  <div>
                    <label
                      className="vertical-label"
                      style={{
                        border: 'None',
                        paddingLeft: '0px',
                      }}
                    >
                      <label className="flex-grow-0">
                        Breaking changes:
                        <span>[no]</span>
                      </label>
                      <label
                        className="vertical-label"
                        style={{
                          border: 'None',
                          paddingLeft: '0px',
                        }}
                      >
                        <label className="flex-grow-0">
                          Next version:
                          <span>[*]</span>
                        </label>
                        <span
                          className="tips"
                          style={{ alignSelf: 'baseline' }}
                        >
                          The the module version below was automatically raised
                          due to breaking changes.
                        </span>
                      </label>
                    </label>
                    <label className="vertical-label">
                      <Button
                        name="publishModuleVersion"
                        onClick={publishModuleVersion}
                      >
                        Publish Changes
                      </Button>
                    </label>
                  </div>
                )}
              </label>
            </label>
          </div>
        ) : (
          <label className="flex-grow-0">
            <Button name="changeModule" onClick={this._openTurnMenu}>
              Turn into Module
            </Button>
            {turnMenuOpened && (
              <label style={{ flexGrow: 0 }}>
                <FolderSelector
                  folder={newFolder}
                  getModuleFolders={getModuleFolders}
                  onFolderSelected={this._turnIntoModule}
                />
              </label>
            )}
          </label>
        )}
      </div>
    );
  }
}

export default withAlert()(ModuleConfigEditor);
