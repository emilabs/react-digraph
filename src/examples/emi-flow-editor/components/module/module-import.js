import * as React from 'react';
import { withAlert } from 'react-alert';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css

import FlowDiff from '../flow-diff';
import { Button, getErrorMessage, selectTheme } from '../common';

import ModuleSelector from './module-selector';

class ModuleImport extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
    this.alert = this.props.alert;
  }

  componentDidMount() {
    const { name } = this.props;

    if (name) {
      this._setLatestVersionIntoState();
    }

    this.setState({ name });
  }

  componentDidUpdate() {
    const { name } = this.props;

    if (name != this.state.name) {
      if (name) {
        this._setLatestVersionIntoState();
      }

      this.setState({ name });
    }
  }

  _setLatestVersionIntoState = () => {
    const { folder, name, getLatestVersionModuleDef } = this.props;

    return getLatestVersionModuleDef(folder, name)
      .then(latestVersionModuleDef => this.setState({ latestVersionModuleDef }))
      .catch(err =>
        this.alert.error(
          `Couldn't fetch module versions: ${getErrorMessage(err)}`
        )
      );
  };

  _importModule = moduleDef => {
    const { importModule } = this.props;

    return importModule(moduleDef).catch(err => {
      this.alert.error(`Couldn't import module: ${getErrorMessage(err)}`);
    });
  };

  onModuleSelected = (name, modulesDict) => {
    const { getModuleDef } = this.props;

    this._importModule(getModuleDef(modulesDict, name)).finally(() => {
      this.setState({
        showModuleSelect: false,
      });
    });
  };

  updateToLatestVersion = () => {
    const { getModuleOutput, slotContextVars } = this.props;
    const { latestVersionModuleDef } = this.state;
    const { version: latestVersion } = latestVersionModuleDef;

    getModuleOutput(latestVersionModuleDef).then(
      ({ slotContextVars: latestSlotContextVars }) => {
        confirmAlert({
          customUI: ({ onClose }) => (
            <div
              className="react-confirm-alert-body"
              style={{ width: '1000px' }}
            >
              <h1>Update module to version {latestVersion}?</h1>
              <p>Observe the changes in module output between versions</p>
              <p>You might need to take action to adapt your flow to them:</p>
              <FlowDiff
                str1={slotContextVars.join('\n')}
                str2={latestSlotContextVars.join('\n')}
              />
              <p>Are you sure?</p>
              <div className="react-confirm-alert-button-group">
                <Button
                  onClick={() => {
                    this._importModule(latestVersionModuleDef);
                    onClose();
                  }}
                >
                  Yes, Update!
                </Button>
                <Button onClick={onClose}>No</Button>
              </div>
            </div>
          ),
        });
      }
    );
  };

  onShowModuleSelectClick = () => {
    this.setState(prevState => ({
      showModuleSelect: !prevState.showModuleSelect,
    }));
  };

  render() {
    const { latestVersionModuleDef, showModuleSelect } = this.state;
    const {
      folder,
      name,
      version,
      getModuleFolders,
      getModuleDefs,
    } = this.props;
    const { version: latestVersion } = latestVersionModuleDef || {};

    return (
      <div id="moduleImportComponent">
        <label>
          <h2>Module: {name || ''}</h2>
          <Button name="changeModule" onClick={this.onShowModuleSelectClick}>
            {`${showModuleSelect ? 'Cancel' : name ? 'Change' : 'Select'}`}
          </Button>
          {showModuleSelect && (
            <ModuleSelector
              getModuleFolders={getModuleFolders}
              getModuleDefs={getModuleDefs}
              onModuleSelected={this.onModuleSelected}
              theme={selectTheme}
              large={true}
            />
          )}
        </label>
        <label>
          <h3>Folder: {folder ? folder : ''}</h3>
        </label>
        <label>
          <h3>Version: {version ? version : ''}</h3>
          {version < latestVersion && (
            <Button
              name="updateModuleVersion"
              type="button"
              onClick={this.updateToLatestVersion}
            >
              {`Update to ${latestVersion}`}
            </Button>
          )}
        </label>
      </div>
    );
  }
}

export default withAlert()(ModuleImport);
