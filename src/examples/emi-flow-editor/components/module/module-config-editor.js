import * as React from 'react';
import { withAlert } from 'react-alert';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import FlowDiff from '../flow-diff';

import {
  Button,
  getErrorMessage,
  LoadingWrapper,
  loadingAlert,
} from '../common';
import FolderSelector from './folder-selector';

class ModuleConfigEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      lastVersionContents: null,
    };
  }

  componentDidMount() {
    const {
      moduleConfigHandlers: { isModule },
    } = this.props;

    if (isModule()) {
      this.fetchPublishedContents();
    }
  }

  _processContentsForDiff = contents =>
    contents.replace(`"draft": false`, `"draft": true`);

  fetchPublishedContents = () => {
    const {
      moduleConfigHandlers: { getPublishedModule },
      alert,
    } = this.props;

    this.setState({ s3Loading: true });
    getPublishedModule()
      .then(contents => {
        if (contents) {
          contents = this._processContentsForDiff(contents);
          this.setState({
            lastVersionContents: contents,
          });
        }
      })
      .catch(err => {
        alert.error(
          `Couldn't get last published module: ${getErrorMessage(err)}`
        );
      })
      .finally(() => this.setState({ s3Loading: false }));
  };

  unpublishedChanges = () => {
    const { bwdlText } = this.props;
    const { lastVersionContents } = this.state;
    const master = JSON.stringify(JSON.parse(bwdlText), null, 2);
    const version = JSON.stringify(JSON.parse(lastVersionContents), null, 2);

    return master !== version;
  };

  _publishModuleVersion = () => {
    const { lastVersionContents } = this.state;
    const {
      bwdlText,
      moduleConfigHandlers: { publishModuleVersion, getModuleConfig },
    } = this.props;
    const { version } = getModuleConfig() || {};

    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="react-confirm-alert-body" style={{ width: '1000px' }}>
          <h1>Publish changes to module version {version}?</h1>
          <p>Please review the changes first:</p>
          <FlowDiff str1={lastVersionContents || ''} str2={bwdlText} />
          <p>Are you sure?</p>
          <div className="react-confirm-alert-button-group">
            <Button
              onClick={() => {
                onClose();
                const closeAlert = loadingAlert('Publishing changes');

                publishModuleVersion()
                  .then(() => this.fetchPublishedContents())
                  .finally(() => closeAlert());
              }}
            >
              Yes, Publish!
            </Button>
            <Button onClick={onClose}>No, I changed my mind</Button>
          </div>
        </div>
      ),
    });
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
    const {
      moduleConfigHandlers: { turnIntoModule },
      alert,
    } = this.props;

    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="react-confirm-alert-body">
          <h1>Turn flow into module?</h1>
          <p>This operation is not undoable!</p>
          <p>Are you sure?</p>
          <div className="react-confirm-alert-button-group">
            <Button
              onClick={() => {
                onClose();
                const closeAlert = loadingAlert('Turning flow into module');

                turnIntoModule(newFolder)
                  .catch(err =>
                    alert.error(
                      `Couldn't turn Flow into Module: ${getErrorMessage(err)}`
                    )
                  )
                  .finally(() => closeAlert());
              }}
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
    const { turnMenuOpened, newFolder, s3Loading } = this.state;
    const {
      moduleConfigHandlers: { isModule, getModuleFolders, getModuleConfig },
    } = this.props;
    const { name, version, draft } = getModuleConfig() || {};

    return (
      <div id="moduleConfigEditor" className="rightEditor">
        <h1>Module Configuration</h1>
        {isModule() ? (
          <div>
            <label className="flex-grow-0">
              Name:
              <span>{name}</span>
            </label>
            <label className="vertical-label">
              <h4>Version</h4>
              <label className="flex-grow-0">
                Version:
                <span>{version || 'None'}</span>
              </label>
              <label className="flex-grow-0">
                Type:
                <span>{draft ? 'draft' : 'published'}</span>
              </label>
              <label className="vertical-label">
                <h4>Recent Changes</h4>
                <label className="flex-grow-0">
                  Unpublished changes:
                  <LoadingWrapper
                    isLoading={s3Loading}
                    width="20px"
                    height="20px"
                  >
                    <span>{this.unpublishedChanges() ? 'Yes' : 'None'}</span>
                    {this.unpublishedChanges() && (
                      <Button
                        name="publishModuleVersion"
                        onClick={this._publishModuleVersion}
                      >
                        Publish Changes
                      </Button>
                    )}
                  </LoadingWrapper>
                </label>
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
