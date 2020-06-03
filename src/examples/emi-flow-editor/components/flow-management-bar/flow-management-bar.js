import * as React from 'react';
import { withAlert } from 'react-alert';

import { getErrorMessage, loadingAlert } from '../common';
import { STG } from '../../common';
import OpenSelector from './open-selector';
import VersionSelector from './version-selector';
import NameInput from './name-input';
import RestoreButton from './restore-button';
import NewButton from './new-button';
import CloneButton from './clone-button';
import EditModeButton from './edit-mode-button';
import ShipButton from './ship-button';
import SaveButton from './save-button';
import DeleteButton from './delete-button';

class FlowManagementBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      legacy: false,
      s3stored: false,
      editMode: false,
    };
    this.alert = this.props.alert;
  }

  componentDidMount() {
    this.flowChanged();
  }

  componentDidUpdate(prevProps) {
    const { flowName, env } = this.props;

    if (prevProps.flowName != flowName || prevProps.env != env) {
      this.flowChanged();
    }
  }

  getModuleEverPublished = (isModule, draft) => {
    const {
      flowManagementHandlers: { getModuleLastPublishedVersionNumber },
    } = this.props;

    if (!isModule) {
      return Promise.resolve(false);
    } else if (!draft) {
      return Promise.resolve(true);
    } else {
      return getModuleLastPublishedVersionNumber().then(v => !!v);
    }
  };

  flowChanged = () => {
    const {
      flowManagementHandlers: { isModule, parseImportPath },
      flowName,
    } = this.props;
    const { name, version: moduleVersion, draft } = isModule()
      ? parseImportPath(flowName)
      : {
          name: flowName ? flowName.slice(0, -5) : flowName,
          draft: true,
        };

    this.getModuleEverPublished(isModule(), draft).then(moduleEverPublished =>
      this.setState({
        editMode: false,
        name,
        moduleVersion,
        isModule: isModule(),
        moduleEverPublished,
        draft: draft,
        s3stored: !!flowName,
        legacy: flowName && flowName.endsWith('.py.json'),
      })
    );
  };

  getEnv = () => this.props.env || STG;

  unsavedChanges = () => this.props.initialJsonText !== this.props.jsonText;

  unshippedChanges = () => this.props.jsonText !== this.props.prodJsonText;

  unsavedChangesConfirmParams = {
    title: 'You have unsaved changes',
    message:
      'If you click "Yes", your unsaved changes will be lost. Do you still want to continue?',
    mustConfirmF: this.unsavedChanges,
  };

  onFlowVersionOpened = versionLastModified =>
    this.setState({ versionLastModified });

  onRename = flowName => {
    const closeAlert = loadingAlert('Renaming');

    this.props.flowManagementHandlers
      .rename(flowName)
      .then(() => this.setState({ editMode: true }))
      .catch(err =>
        this.alert.error(`Flow renaming failed: ${getErrorMessage(err)}`)
      )
      .finally(() => closeAlert());
  };

  saveEnabled = () => {
    const { editMode } = this.state;

    return this.unsavedChanges() && editMode;
  };

  editModeEnabled = () => {
    const { legacy, draft } = this.state;
    const { flowName, flowVersionId } = this.props;

    return (
      flowName && !legacy && this.getEnv() === STG && !flowVersionId && draft
    );
  };

  switchEditMode = () => {
    if (!this.editModeEnabled()) {
      return;
    }

    this.setState(prevState => ({
      editMode: !prevState.editMode,
    }));
  };

  deleteEnabled = () => {
    const { s3stored, legacy } = this.state;
    const { flowVersionId } = this.props;

    return s3stored && !legacy && this.getEnv() === STG && !flowVersionId;
  };

  cloneEnabled = () => this.state.s3stored;

  shipEnabled = () => {
    const { s3stored, legacy, isModule, draft } = this.state;
    const { flowVersionId } = this.props;

    return (
      s3stored &&
      !legacy &&
      !this.unsavedChanges() &&
      this.getEnv() === STG &&
      !flowVersionId &&
      (!isModule || !draft) &&
      this.unshippedChanges()
    );
  };

  restoreEnabled = () => {
    const { legacy } = this.state;
    const { flowVersionId } = this.props;

    return flowVersionId && !legacy && this.getEnv() === STG;
  };

  versionsEnabled = () => this.state.s3stored && this.props.flowName;

  render() {
    const {
      name,
      moduleEverPublished,
      moduleVersion,
      isModule,
      draft,
      editMode,
      legacy,
      versionLastModified,
    } = this.state;
    const {
      flowManagementHandlers: {
        cloneFlow,
        deleteFlow,
        getModuleDefs,
        getModuleFolders,
        getFlow,
        getFlows,
        getVersions,
        newFlow,
        openFlow,
        saveFlow,
        shipFlow,
      },
      flowName,
      flowVersionId,
      jsonText,
      s3Available,
    } = this.props;

    return (
      <div className="d-flex flex-column">
        <NameInput
          flowName={name}
          moduleEverPublished={moduleEverPublished}
          moduleVersion={moduleVersion}
          isModule={isModule}
          draft={draft}
          flowPath={flowName}
          flowVersionId={flowVersionId}
          legacy={legacy}
          flowEnv={this.getEnv()}
          versionLastModified={versionLastModified}
          unsavedChanges={this.unsavedChanges()}
          onRename={this.onRename}
        />
        {s3Available && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <NewButton
              newFlow={newFlow}
              onNewFlow={() => null}
              unsavedChangesConfirmParams={this.unsavedChangesConfirmParams}
            />
            <CloneButton
              cloneFlow={cloneFlow}
              enabled={this.cloneEnabled()}
              onFlowCloned={() => null}
              unsavedChangesConfirmParams={this.unsavedChangesConfirmParams}
            />
            <OpenSelector
              openFlow={openFlow}
              onFlowOpened={() => null}
              getFlows={getFlows}
              getModuleFolders={getModuleFolders}
              getModuleDefs={getModuleDefs}
              unsavedChanges={this.unsavedChanges}
              unsavedChangesConfirmParams={this.unsavedChangesConfirmParams}
            />
            <EditModeButton
              enabled={this.editModeEnabled()}
              active={editMode}
              switchEditMode={this.switchEditMode}
            />
            <SaveButton
              enabled={this.saveEnabled()}
              saveFlow={saveFlow}
              flowName={flowName}
              jsonText={jsonText}
              onFlowSaved={() => null}
            />
            <DeleteButton
              enabled={this.deleteEnabled()}
              deleteFlow={deleteFlow}
              onFlowDeleted={() => null}
            />
            <ShipButton
              flowName={flowName}
              jsonText={jsonText}
              getFlow={getFlow}
              enabled={this.shipEnabled()}
              shipFlow={shipFlow}
            />
            <VersionSelector
              env={this.getEnv()}
              flowName={flowName}
              onFlowOpened={() => null}
              onFlowVersionOpened={this.onFlowVersionOpened}
              unsavedChangesConfirmParams={this.unsavedChangesConfirmParams}
              getVersions={getVersions}
              enabled={this.versionsEnabled()}
              openFlow={openFlow}
            />
            <RestoreButton
              flowName={flowName}
              onFlowRestored={() => null}
              saveFlow={saveFlow}
              getFlow={getFlow}
              jsonText={jsonText}
              enabled={this.restoreEnabled()}
            />
          </div>
        )}
      </div>
    );
  }
}

export default withAlert()(FlowManagementBar);
