import * as React from 'react';
import Select from 'react-select';
import { withAlert } from 'react-alert';
import Tooltip from 'react-tooltip-lite';
import OutsideClickHandler from 'react-outside-click-handler';

import { getErrorMessage, getSimpleItem, LoadingWrapper } from '../common';
import { STG, ENVS } from '../../common';

class OpenSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      env: STG,
      flows: [],
      includeLegacy: false,
      s3Loading: false,
    };
  }

  openFlow = flowName => {
    const { onOpenFlow } = this.props;
    const { env } = this.state;

    this.setState({ expanded: false });

    onOpenFlow(flowName, env);
  };

  onClickOpenIcon = () => {
    const { env, includeLegacy, expanded } = this.state;

    if (!expanded) {
      this._reloadFlows(env, includeLegacy);
    }

    this.setState({ expanded: !expanded });
  };

  onClickIncludeLegacy = includeLegacy => {
    this.setState({ includeLegacy });
    this._reloadFlows(this.state.env, includeLegacy);
  };

  changeEnv = env => {
    this.setState({ env });
    this._reloadFlows(env, this.state.includeLegacy);
  };

  _reloadFlows = (env, includeLegacy) => {
    const { alert, getFlows } = this.props;

    this.setState({
      s3Loading: true,
    });
    getFlows(env, includeLegacy)
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

  render() {
    const { expanded, includeLegacy, env, s3Loading, flows } = this.state;

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
              <label style={{ display: 'flex', border: 'none' }}>
                <input
                  name="includeLegacy"
                  type="checkbox"
                  checked={includeLegacy}
                  onChange={e => this.onClickIncludeLegacy(e.target.checked)}
                />
                +Legacy
              </label>
              <label style={{ display: 'flex', border: 'none' }}>
                <Select
                  className="selectShortContainer"
                  value={getSimpleItem(env)}
                  onChange={item => this.changeEnv(item.value)}
                  options={ENVS.map(env => getSimpleItem(env))}
                  isSearchable={false}
                />
              </label>
              <label style={{ display: 'flex', border: 'none' }}>
                <LoadingWrapper
                  isLoading={s3Loading}
                  width="300px"
                  height="40px"
                >
                  <Select
                    className="selectLongContainer"
                    value=""
                    onChange={item => this.openFlow(item.value)}
                    options={flows}
                    isSearchable={true}
                  />
                </LoadingWrapper>
              </label>
            </div>
          )}
        </div>
      </OutsideClickHandler>
    );
  }
}

export default withAlert()(OpenSelector);
