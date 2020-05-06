import * as React from 'react';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import { withAlert } from 'react-alert';
import Tooltip from 'react-tooltip-lite';

import GraphUtils from '../../../../utilities/graph-util';
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

  safeExecute = (
    f,
    mustConfirm,
    title = 'You have unsaved changes',
    message = 'If you click "Yes", your unsaved changes will be lost. Do you still want to continue?',
    customUI = null
  ) => {
    if (mustConfirm) {
      confirmAlert({
        title: title,
        message: message,
        buttons: [
          {
            label: 'Yes',
            onClick: () => f(),
          },
          {
            label: 'No',
            onClick: () => null,
          },
        ],
        customUI,
      });
    } else {
      f();
    }
  };

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

    this.safeExecute(() => {
      const closeAlert = loadingAlert('Opening flow version');

      this._openFlow({ flowName, env, versionId })
        .then(() =>
          this.setState({
            versionLastModified: lastModified,
          })
        )
        .finally(closeAlert);
    }, this.unsavedChanges());
  };

  safeOpen = (flowName, env) => {
    const { flowEnv } = this.state;

    env = env || flowEnv;
    this.safeExecute(() => {
      const closeAlert = loadingAlert('Opening flow');

      this._openFlow({ flowName, env }).finally(closeAlert);
    }, this.unsavedChanges());
  };

  safeNew = () => {
    const { newFlow } = this.props.flowManagementHandlers;

    this.safeExecute(() => {
      newFlow();
      this.setState({ s3stored: false, flowEnv: STG });
    }, this.unsavedChanges());
  };

  safeDelete = () => {
    if (!this.deleteEnabled()) {
      return;
    }

    const { deleteFlow } = this.props.flowManagementHandlers;

    this.safeExecute(
      () =>
        deleteFlow()
          .then(() =>
            this.setState({
              s3stored: false,
              flowEnv: STG,
            })
          )
          .catch(err =>
            this.alert.error(`Flow deletion failed: ${getErrorMessage(err)}`)
          ),
      true,
      'Delete the flow?',
      'This flow will be deleted remotely from s3 and will be no longer available'
    );
  };

  safeClone = () => {
    const { alert, cloneFlow } = this.props.flowManagementHandlers;

    if (!this.cloneEnabled()) {
      return;
    }

    this.safeExecute(() => {
      const closeAlert = loadingAlert('Cloning');

      cloneFlow()
        .then(
          this.setState({
            s3stored: true,
            flowEnv: STG,
          })
        )
        .catch(err =>
          alert.error(`Flow cloning failed: ${getErrorMessage(err)}`)
        )
        .finally(closeAlert);
    }, this.unsavedChanges());
  };

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

  deleteClasses = () => {
    const classes = ['managerButton svg-inline--fa fa-trash fa-w-14'];

    return GraphUtils.classNames(
      classes.concat(this.deleteEnabled() ? ['enabled'] : [])
    );
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
        getFlow,
        getFlows,
        getJsonText,
        getVersions,
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
            <NewButton onNew={this.safeNew} />
            <CloneButton
              enabled={this.cloneEnabled()}
              onClone={this.safeClone}
            />
            <OpenSelector
              safeExecute={this.safeExecute}
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
            <Tooltip content="Delete" distance={5} padding="6px">
              <svg
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="trash"
                className={this.deleteClasses()}
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
                onClick={() => this.safeDelete()}
              >
                <path d="M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z"></path>
              </svg>
            </Tooltip>
            <ShipButton
              flowName={flowName}
              getJsonText={getJsonText}
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
              getJsonText={getJsonText}
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
