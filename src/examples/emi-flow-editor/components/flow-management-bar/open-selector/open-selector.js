import * as React from 'react';
import Select from 'react-select';
import { withAlert } from 'react-alert';
import Tooltip from 'react-tooltip-lite';
import OutsideClickHandler from 'react-outside-click-handler';

import {
  confirmExecute,
  getErrorMessage,
  getSimpleItem,
  loadingAlert,
} from '../../common';
import { STG } from '../../../common';
import OpenFlowSelector from './open-flow-selector';
import OpenModuleSelector from './open-module-selector';

const TYPE_FLOW = 'flow';
const TYPE_MODULE = 'module';
const TYPES = [TYPE_FLOW, TYPE_MODULE];

class OpenSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      env: STG,
      expanded: false,
      folders: [],
      flows: [],
      includeLegacy: false,
      s3Loading: false,
      type: TYPE_FLOW,
    };
  }

  openFlow = (flowName, isModule) => {
    const { alert, openFlow, onFlowOpened } = this.props;
    const { env } = this.state;

    return openFlow(env, flowName)
      .then(() => onFlowOpened(env, isModule))
      .catch(err => {
        alert.error(`Couldn't open flow: ${getErrorMessage(err)}`);
      });
  };

  safeOpen = (flowName, isModule) => {
    const { unsavedChangesConfirmParams } = this.props;

    this.setState({ expanded: false });
    confirmExecute({
      f: () => {
        const closeAlert = loadingAlert('Opening flow');

        this.openFlow(flowName, isModule).finally(closeAlert);
      },
      ...unsavedChangesConfirmParams,
    });
  };

  onClickOpenIcon = () => {
    const { env, includeLegacy, expanded } = this.state;

    if (!expanded) {
      this.reloadFlows(env, includeLegacy);
    }

    this.setState({ expanded: !expanded });
  };

  reloadFlows = (env, includeLegacy) => {
    const { alert, getFlows } = this.props;

    this.setState({
      s3Loading: true,
    });
    getFlows({ env, includeLegacy })
      .then(flows => {
        this.setState({
          flows: flows.map(f => getSimpleItem(f.Key)),
          s3Loading: false,
        });
      })
      .catch(err => {
        this.setState({
          expanded: false,
          s3Loading: false,
          flows: [],
        });
        alert.error(`Couldn't retrieve flows: ${getErrorMessage(err)}`);
      });
  };

  reloadFolders = env => {
    const { alert, getModuleFolders } = this.props;

    this.setState({
      s3Loading: true,
    });
    getModuleFolders(env)
      .then(folders => {
        this.setState({
          folders: folders.map(f => getSimpleItem(f.Key)),
          s3Loading: false,
        });
      })
      .catch(err => {
        this.setState({
          expanded: false,
          s3Loading: false,
          folders: [],
        });
        alert.error(`Couldn't retrieve folders: ${getErrorMessage(err)}`);
      });
  };

  changeType = type => this.setState({ type });

  render() {
    const { getModuleFolders, getModuleDefs } = this.props;
    const { expanded, flows, folders, s3Loading, type } = this.state;

    return (
      <OutsideClickHandler
        onOutsideClick={() => this.setState({ expanded: false })}
        display="contents"
      >
        <div style={{ display: 'inherit', alignItems: 'center' }}>
          <Tooltip
            content={expanded ? 'Hide Open menu' : 'Open'}
            distance={5}
            padding="6px"
          >
            <svg
              className="managerButton enabled"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              viewBox="0 0 225.693 225.693"
              style={{
                enableBackground: 'new 0 0 225.693 225.693',
              }}
              onClick={this.onClickOpenIcon}
            >
              <path
                d="M8.427,78.346h208.839c2.391,0,4.596,0.971,6.211,2.732s2.391,4.044,2.183,6.425l-10.222,117.15
                c-0.383,4.385-3.99,7.692-8.393,7.692H21.4c-4.301,0-7.9-3.224-8.374-7.497L0.053,87.698c-0.267-2.413,0.478-4.737,2.097-6.546
                C3.77,79.342,5.999,78.346,8.427,78.346z M214.513,63.346V44.811c0-4.143-2.524-7.465-6.667-7.465h-83.333v-2.341
                c0-12.219-8.176-21.659-19.25-21.659H30.43c-11.074,0-20.917,9.44-20.917,21.659v24.951c0,1.231,0.68,2.379,1.267,3.39H214.513z"
              />
            </svg>
          </Tooltip>
          {expanded && (
            <div
              style={{
                display: 'flex',
                background:
                  'linear-gradient(45deg, rgb(115, 164, 255), rgb(249, 88, 71))',
              }}
            >
              <Select
                className="selectShortContainer"
                value={getSimpleItem(type)}
                onChange={item => this.changeType(item.value)}
                options={TYPES.map(type => getSimpleItem(type))}
                isSearchable={false}
              />
              {type == TYPE_FLOW ? (
                <OpenFlowSelector
                  flows={flows}
                  onOpen={this.safeOpen}
                  reloadFlows={this.reloadFlows}
                  s3Loading={s3Loading}
                />
              ) : (
                <OpenModuleSelector
                  folders={folders}
                  getModuleDefs={getModuleDefs}
                  getModuleFolders={getModuleFolders}
                  onOpen={flowPath => this.safeOpen(flowPath, true)}
                  reloadFolders={this.reloadFolders}
                  s3Loading={s3Loading}
                />
              )}
            </div>
          )}
        </div>
      </OutsideClickHandler>
    );
  }
}

export default withAlert()(OpenSelector);
