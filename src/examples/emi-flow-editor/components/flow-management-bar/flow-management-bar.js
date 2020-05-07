import * as React from 'react';
import { withAlert } from 'react-alert';

import { confirmExecute, getErrorMessage, loadingAlert } from '../common';
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
      env: STG,
      flowEnv: STG,
      editMode: false,
    };
    this.alert = this.props.alert;
  }

  componentDidUpdate(prevProps) {
    const { flowName } = this.props;

    if (prevProps.flowName != flowName) {
      const legacy = flowName && flowName.endsWith('.py.json');

      this.setState({
        editMode: false,
        legacy,
      });
    }
  }

  unsavedChanges = () => this.props.initialJsonText !== this.props.jsonText;

  unshippedChanges = () => this.props.jsonText !== this.props.prodJsonText;

  unsavedChangesConfirmParams = {
    title: 'You have unsaved changes',
    message:
      'If you click "Yes", your unsaved changes will be lost. Do you still want to continue?',
    mustConfirmF: this.unsavedChanges,
  };

  onFlowDeleted = () => this.setState({ s3stored: false, flowEnv: STG });

  _openFlow = ({ flowName, env, versionId }) => {
    const { openFlow } = this.props.flowManagementHandlers;

    return openFlow(env, flowName, versionId)
      .then(() =>
        this.setState({
          s3stored: true,
          flowEnv: env,
          editMode: false,
        })
      )
      .catch(err => {
        this.alert.error(`Couldn't open flow: ${getErrorMessage(err)}`);
      });
  };

  safeOpenVersion = (versionId, lastModified) => {
    const { flowName } = this.props;
    const { flowEnv: env } = this.state;

    confirmExecute({
      f: () => {
        const closeAlert = loadingAlert('Opening flow version');

        this._openFlow({ flowName, env, versionId })
          .then(() =>
            this.setState({
              versionLastModified: lastModified,
            })
          )
          .finally(closeAlert);
      },
      ...this.unsavedChangesConfirmParams,
    });
  };

  safeOpen = (flowName, env) => {
    const { flowEnv } = this.state;

    env = env || flowEnv;
    confirmExecute({
      f: () => {
        const closeAlert = loadingAlert('Opening flow');

        this._openFlow({ flowName, env }).finally(closeAlert);
      },
      ...this.unsavedChangesConfirmParams,
    });
  };

  onNewFlow = () => this.setState({ s3stored: false, flowEnv: STG });

  onFlowCloned = () => this.setState({ s3stored: true, flowEnv: STG });

  onRename = flowName => {
    const closeAlert = loadingAlert('Renaming');

    this.props.flowManagementHandlers
      .moveOrCreate(flowName)
      .catch(err =>
        this.alert.error(`Flow renaming failed: ${getErrorMessage(err)}`)
      )
      .then(this.setState({ s3stored: true }))
      .finally(() => closeAlert());
  };

  onFlowRestored = () => this.setState({ s3stored: true });

  onFlowSaved = () => this.setState({ s3stored: true });

  saveEnabled = () => {
    const { editMode } = this.state;

    return this.unsavedChanges() && editMode;
  };

  editModeEnabled = () => {
    const { legacy, flowEnv } = this.state;
    const { flowName, flowVersionId } = this.props;

    return flowName && !legacy && flowEnv === STG && !flowVersionId;
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
    const { s3stored, legacy, flowEnv } = this.state;
    const { flowVersionId } = this.props;

    return s3stored && !legacy && flowEnv === STG && !flowVersionId;
  };

  cloneEnabled = () => this.state.s3stored;

  shipEnabled = () => {
    const { s3stored, legacy, flowEnv } = this.state;
    const { flowVersionId } = this.props;

    return (
      s3stored &&
      !legacy &&
      !this.unsavedChanges() &&
      flowEnv === STG &&
      !flowVersionId &&
      this.unshippedChanges()
    );
  };

  restoreEnabled = () => {
    const { legacy, flowEnv } = this.state;
    const { flowVersionId } = this.props;

    return flowVersionId && !legacy && flowEnv === STG;
  };

  versionsEnabled = () => this.state.s3stored && this.props.flowName;

  render() {
    const { editMode, flowEnv, legacy, versionLastModified } = this.state;
    const {
      flowManagementHandlers: {
        cloneFlow,
        deleteFlow,
        getFlow,
        getFlows,
        getVersions,
        newFlow,
        saveFlow,
        shipFlow,
      },
      flowName,
      flowVersionId,
      jsonText,
      s3Available,
    } = this.props;

    return (
      <div style={{ display: 'flex' }}>
        {s3Available && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <NewButton
              newFlow={newFlow}
              onNewFlow={this.onNewFlow}
              unsavedChangesConfirmParams={this.unsavedChangesConfirmParams}
            />
            <CloneButton
              enabled={this.cloneEnabled()}
              cloneFlow={cloneFlow}
              onFlowCloned={this.onFlowCloned}
              unsavedChangesConfirmParams={this.unsavedChangesConfirmParams}
            />
            <OpenSelector
              onOpenFlow={this.safeOpen}
              getFlows={getFlows}
              unsavedChanges={this.unsavedChanges}
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
              onFlowSaved={this.onFlowSaved}
            />
            <DeleteButton
              enabled={this.deleteEnabled()}
              deleteFlow={deleteFlow}
              onFlowDeleted={this.onFlowDeleted}
            />
            <ShipButton
              flowName={flowName}
              jsonText={jsonText}
              getFlow={getFlow}
              enabled={this.shipEnabled()}
              shipFlow={shipFlow}
            />
            <VersionSelector
              onOpenCurrentVersion={() => this.safeOpen(flowName)}
              onOpenPastVersion={this.safeOpenVersion}
              getVersions={getVersions}
              enabled={this.versionsEnabled()}
              env={flowEnv}
            />
            <RestoreButton
              flowName={flowName}
              onFlowRestored={this.onFlowRestored}
              saveFlow={saveFlow}
              getFlow={getFlow}
              jsonText={jsonText}
              enabled={this.restoreEnabled()}
            />
          </div>
        )}
        <NameInput
          flowName={flowName}
          flowVersionId={flowVersionId}
          legacy={legacy}
          flowEnv={flowEnv}
          versionLastModified={versionLastModified}
          unsavedChanges={this.unsavedChanges()}
          onRename={this.onRename}
        />
      </div>
    );
  }
}

export default withAlert()(FlowManagementBar);
