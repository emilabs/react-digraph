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
      lastVersionContents: '{}',
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

  changesStatus = () => {
    const {
      bwdlText,
      moduleConfigHandlers: { getSlotContextVars },
    } = this.props;
    const { lastVersionContents } = this.state;
    const draftJson = JSON.parse(bwdlText);
    const versionJson = JSON.parse(lastVersionContents);
    const master = JSON.stringify(draftJson, null, 2);
    const version = JSON.stringify(versionJson, null, 2);
    const unpublishedChanges = master !== version;
    const slotContextVars = getSlotContextVars(draftJson);
    const missingSlotContextVars = getSlotContextVars(versionJson).filter(
      scv => !slotContextVars.includes(scv)
    );
    const breakingChanges = missingSlotContextVars.length > 0;

    return {
      breakingChanges,
      missingSlotContextVars,
      unpublishedChanges,
      slotContextVars,
    };
  };

  _confirmAndPublish = () => {
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

  _publishModuleVersion = breakingChanges => {
    const {
      alert,
      moduleConfigHandlers: { validateModule, unsavedChanges },
    } = this.props;

    if (unsavedChanges()) {
      alert.error(`You have unsaved changes. Please save your changes first`);

      return;
    }

    try {
      validateModule();
    } catch (err) {
      alert.error(`Module is not valid. Please fix: ${getErrorMessage(err)}`);

      return;
    }

    this._confirmAndPublish();
  };

  _raiseModuleVersion = () => {
    const { alert } = this.props;

    alert.info(`raising version`);
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
    const {
      breakingChanges,
      missingSlotContextVars,
      unpublishedChanges,
      slotContextVars,
    } = this.changesStatus();

    return (
      <div id="moduleConfigEditor" className="rightEditor">
        <h1>Module Configuration</h1>
        {isModule() ? (
          <div>
            <label className="flex-grow-0">
              Name:
              <span>{name}</span>
            </label>
            <label className="vertical-label flex-grow-0">
              <h4>Version</h4>
              <label className="flex-grow-0">
                Version:
                <span>{version || 'None'}</span>
              </label>
              <label className="flex-grow-0">
                Type:
                <span>{draft ? 'draft' : 'published'}</span>
              </label>
              <label className="vertical-label flex-grow-0">
                Slots:
                <ul>
                  {slotContextVars.map(s => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </label>
              <label className="vertical-label flex-grow-0">
                <h4>Recent Changes</h4>
                <LoadingWrapper
                  isLoading={s3Loading}
                  width="200px"
                  height="40px"
                >
                  <label className="flex-grow-0">
                    Unpublished changes:
                    <span>{unpublishedChanges ? 'Yes' : 'None'}</span>
                    {unpublishedChanges && !breakingChanges && (
                      <Button
                        className="rightButton"
                        name="publishModuleVersion"
                        sytle={{ marginLeft: '5px' }}
                        onClick={this._publishModuleVersion}
                      >
                        Publish Changes
                      </Button>
                    )}
                  </label>
                  <label className="flex-grow-0">
                    Breaking changes:
                    <span>{breakingChanges ? 'Yes' : 'None'}</span>
                  </label>
                  {unpublishedChanges && breakingChanges && (
                    <label className="vertical-label flex-grow-0">
                      Missing slots:
                      <ul>
                        {missingSlotContextVars.map(s => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
                      <Button
                        className="rightButton"
                        name="raiseModuleVersion"
                        sytle={{ marginLeft: '5px' }}
                        onClick={this._raiseModuleVersion}
                      >
                        Raise Version
                      </Button>
                    </label>
                  )}
                </LoadingWrapper>
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
