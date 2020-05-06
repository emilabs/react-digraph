import * as React from 'react';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import { withAlert } from 'react-alert';
import debounce from 'debounce';
import Tooltip from 'react-tooltip-lite';

import GraphUtils from '../../../../utilities/graph-util';
import { getErrorMessage, loadingAlert } from '../common';
import { STG, PROD } from '../../common';
import FlowDiff from '../flow-diff';
import OpenSelector from './open-selector';
import VersionSelector from './version-selector';
import NameInput from './name-input';
import RestoreButton from './restore-button';
import NewButton from './new-button';
import CloneButton from './clone-button';

class FlowManagementBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      legacy: false,
      s3stored: false,
      env: STG,
      flowEnv: STG,
      saving: false,
      autosaveEnabled: true,
      editMode: false,
    };
    this.alert = this.props.alert;
    this.autosave = debounce(
      () => this.state.autosaveEnabled && this._saveFlow(),
      3000
    );
  }

  componentDidUpdate(prevProps) {
    const { flowName } = this.props;

    if (prevProps.flowName != flowName) {
      const legacy = flowName && flowName.endsWith('.py.json');

      this.setState({
        editMode: false,
        legacy,
      });
    } else if (prevProps.jsonText !== this.props.jsonText) {
      this.autosave();
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

  _shipFlow = () => {
    const { shipFlow } = this.props.flowManagementHandlers;

    return shipFlow()
      .then(() => {
        this.alert.success('Flow successfully shipped!');
      })
      .catch(err => {
        this.alert.error(`Flow shipping failed: ${getErrorMessage(err)}`);
      });
  };

  confirmAndShip = (lastFlow, newFlow) =>
    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="react-confirm-alert-body" style={{ width: '1000px' }}>
          <h1>Ship this flow to prod?</h1>
          <p>If a flow with the same name exists, it will be overriden</p>
          <p>Review your changes first:</p>
          <FlowDiff str1={lastFlow} str2={newFlow} />
          <p>Are you sure?</p>
          <div className="react-confirm-alert-button-group">
            <button
              onClick={() => {
                onClose();
                const closeAlert = loadingAlert('Shipping');

                this._shipFlow().finally(() => closeAlert());
              }}
            >
              Yes, Ship it!
            </button>
            <button onClick={onClose}>No</button>
          </div>
        </div>
      ),
    });

  safeShip = () => {
    const { flowName, flowManagementHandlers } = this.props;
    const { getJsonText, getFlow } = flowManagementHandlers;

    if (!this.shipEnabled()) {
      return;
    }

    getFlow(PROD, flowName)
      .then(lastFlow => this.confirmAndShip(lastFlow, getJsonText()))
      .catch(err => {
        if (err.statusCode == 404) {
          this.confirmAndShip('', getJsonText());
        } else {
          this.alert.error(`Flow ship failed: ${getErrorMessage(err)}`);
        }
      });
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

  _saveFlow = () => {
    const { saveFlow } = this.props.flowManagementHandlers;

    if (!this.saveEnabled()) {
      return;
    }

    this.setState({ saving: true });

    return saveFlow()
      .then(() => this.setState({ saving: false, s3stored: true }))
      .catch(err => {
        this.setState({ saving: false });
        this.alert.error(`Flow save failed: ${getErrorMessage(err)}`);
      });
  };

  saveEnabled = () => {
    const { editMode, saving } = this.state;

    return this.unsavedChanges() && editMode && !saving;
  };

  saveClasses = () =>
    GraphUtils.classNames(
      ['managerButton']
        .concat(this.saveEnabled() ? ['enabled'] : [])
        .concat(this.state.saving ? ['executing'] : [])
    );

  editModeEnabled = () => {
    const { legacy, flowEnv } = this.state;
    const { flowName, flowVersionId } = this.props;

    return flowName && !legacy && flowEnv === STG && !flowVersionId;
  };

  editModeClasses = () =>
    GraphUtils.classNames(
      ['managerButton']
        .concat(this.editModeEnabled() ? ['enabled'] : [])
        .concat(this.state.editMode ? ['editMode'] : [])
    );

  switchEditMode = () => {
    if (!this.editModeEnabled()) {
      return;
    }

    this.setState(prevState =>
      Object.assign(prevState, { editMode: !prevState.editMode })
    );
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

  shipClasses = () => {
    const classes = ['managerButton svg-inline--fa fa-rocket fa-w-16'];

    return GraphUtils.classNames(
      classes.concat(this.shipEnabled() ? ['enabled'] : [])
    );
  };

  restoreEnabled = () => {
    const { legacy, flowEnv } = this.state;
    const { flowVersionId } = this.props;

    return flowVersionId && !legacy && flowEnv === STG;
  };

  versionsEnabled = () => this.state.s3stored && this.props.flowName;

  render() {
    const { flowEnv, legacy, saving, versionLastModified } = this.state;
    const {
      s3Available,
      flowManagementHandlers: {
        getFlow,
        getFlows,
        getVersions,
        saveFlow,
        getJsonText,
      },
      flowName,
      flowVersionId,
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
            <Tooltip content="Edit" distance={5} padding="6px">
              <svg
                id="editFlowBtn"
                className={this.editModeClasses()}
                style={{
                  enableBackground: 'new 0 0 24 24',
                }}
                height="24px"
                version="1.1"
                viewBox="0 0 24 24"
                width="24px"
                xmlns="http://www.w3.org/2000/svg"
                onClick={() => this.switchEditMode()}
              >
                <path d="M21.635,6.366c-0.467-0.772-1.043-1.528-1.748-2.229c-0.713-0.708-1.482-1.288-2.269-1.754L19,1C19,1,21,1,22,2S23,5,23,5  L21.635,6.366z M10,18H6v-4l0.48-0.48c0.813,0.385,1.621,0.926,2.348,1.652c0.728,0.729,1.268,1.535,1.652,2.348L10,18z M20.48,7.52  l-8.846,8.845c-0.467-0.771-1.043-1.529-1.748-2.229c-0.712-0.709-1.482-1.288-2.269-1.754L16.48,3.52  c0.813,0.383,1.621,0.924,2.348,1.651C19.557,5.899,20.097,6.707,20.48,7.52z M4,4v16h16v-7l3-3.038V21c0,1.105-0.896,2-2,2H3  c-1.104,0-2-0.895-2-2V3c0-1.104,0.896-2,2-2h11.01l-3.001,3H4z" />
              </svg>
            </Tooltip>
            <Tooltip content="Save" distance={5} padding="6px">
              <svg
                id="saveFlowBtn"
                className={this.saveClasses()}
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                viewBox="0 0 1000 1000"
                style={{
                  enableBackground: 'new 0 0 1000 1000',
                }}
                onClick={() => this._saveFlow()}
              >
                <g>
                  <path d="M888.6,990c-259,0-518.1,0-777.1,0c-1.8-0.6-3.5-1.5-5.3-1.8c-45-8.1-74.9-33.8-90.2-76.7c-2.6-7.4-4-15.3-5.9-22.9c0-259,0-518.1,0-777.1c0.6-1.8,1.5-3.5,1.8-5.4c9.2-49.4,38.6-80,86.8-93c4.3-1.2,8.6-2.1,12.8-3.1c222.7,0,445.3,0,668,0c27.8,6.1,49.6,22.7,69.5,41.7c32.9,31.5,65.2,63.7,96.8,96.6c19.9,20.6,37.8,43.1,44.3,72.3c0,222.7,0,445.3,0,668c-0.6,1.8-1.5,3.5-1.8,5.3c-9.2,49.4-38.5,80-86.8,93C897.2,988,892.8,989,888.6,990z M500.1,952.5c111.3,0,222.6,0,333.9,0c28.3,0,43.2-14.9,43.2-42.9c0-122.2,0-244.3,0-366.5c0-28.1-15-43.3-42.9-43.3c-223,0-445.9,0-668.8,0c-27.4,0-42.8,15.2-42.8,42.5c0,122.5,0,244.9,0,367.4c0,4.4,0.1,9,1.1,13.3c4.6,19.4,19.1,29.5,42.2,29.5C277.5,952.5,388.8,952.5,500.1,952.5z M480.9,387.3c79.4,0,158.8,0,238.2,0c30.5,0,45.2-14.6,45.2-45c0-83.2,0-166.4,0-249.7c0-30.6-14.4-45-45.1-45c-158.8,0-317.6,0-476.4,0C212.7,47.5,198,62.1,198,92c-0.1,83.5-0.1,167.1,0,250.6c0,29.9,14.9,44.7,44.7,44.7C322.1,387.3,401.5,387.3,480.9,387.3z" />
                  {saving && (
                    <animate
                      attributeName="fill"
                      values="gray;violetblue;aqua;gray"
                      dur="0.5s"
                      repeatCount="indefinite"
                    />
                  )}
                  <path d="M576.4,86.1c37.3,0,73.6,0,110.7,0c0,87.5,0,174.5,0,262.1c-36.8,0-73.4,0-110.7,0C576.4,261.1,576.4,174,576.4,86.1z" />
                </g>
              </svg>
            </Tooltip>
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
            <Tooltip content="Ship to prod" distance={5} padding="6px">
              <svg
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="rocket"
                className={this.shipClasses()}
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                onClick={this.safeShip}
              >
                <path d="M505.12019,19.09375c-1.18945-5.53125-6.65819-11-12.207-12.1875C460.716,0,435.507,0,410.40747,0,307.17523,0,245.26909,55.20312,199.05238,128H94.83772c-16.34763.01562-35.55658,11.875-42.88664,26.48438L2.51562,253.29688A28.4,28.4,0,0,0,0,264a24.00867,24.00867,0,0,0,24.00582,24H127.81618l-22.47457,22.46875c-11.36521,11.36133-12.99607,32.25781,0,45.25L156.24582,406.625c11.15623,11.1875,32.15619,13.15625,45.27726,0l22.47457-22.46875V488a24.00867,24.00867,0,0,0,24.00581,24,28.55934,28.55934,0,0,0,10.707-2.51562l98.72834-49.39063c14.62888-7.29687,26.50776-26.5,26.50776-42.85937V312.79688c72.59753-46.3125,128.03493-108.40626,128.03493-211.09376C512.07526,76.5,512.07526,51.29688,505.12019,19.09375ZM384.04033,168A40,40,0,1,1,424.05,128,40.02322,40.02322,0,0,1,384.04033,168Z">
                  {this.shipEnabled() && (
                    <animate
                      attributeName="fill"
                      values="black;cornflowerblue;greenyellow;cornflowerblue;black"
                      dur="5s"
                      repeatCount="indefinite"
                    />
                  )}
                </path>
              </svg>
            </Tooltip>
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
