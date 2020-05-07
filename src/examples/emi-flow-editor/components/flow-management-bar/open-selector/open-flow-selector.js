import * as React from 'react';
import Select from 'react-select';

import { LoadingWrapper } from '../../common';
import { STG } from '../../../common';
import { EnvSelector } from './common';

const FlowSelector = ({ loading, flows, onSelect }) => (
  <LoadingWrapper isLoading={loading} width="300px" height="40px">
    <Select
      className="selectLongContainer"
      value=""
      onChange={item => onSelect(item.value)}
      options={flows}
      isSearchable={true}
    />
  </LoadingWrapper>
);

class OpenFlowSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      env: STG,
      includeLegacy: false,
    };
  }

  onClickIncludeLegacy = includeLegacy => {
    const { reloadFlows } = this.props;

    this.setState({ includeLegacy });
    reloadFlows(this.state.env, includeLegacy);
  };

  changeEnv = env => {
    const { reloadFlows } = this.props;

    this.setState({ env });
    reloadFlows(env, this.state.includeLegacy);
  };

  render() {
    const { env, includeLegacy } = this.state;
    const { flows, onOpen, s3Loading } = this.props;

    return (
      <div style={{ display: 'inherit', alignItems: 'center' }}>
        <label style={{ display: 'flex', border: 'none' }}>
          <input
            name="includeLegacy"
            type="checkbox"
            checked={includeLegacy}
            onChange={e => this.onClickIncludeLegacy(e.target.checked)}
          />
          +Legacy
        </label>
        <EnvSelector env={env} onSelect={this.changeEnv} />
        <FlowSelector loading={s3Loading} flows={flows} onSelect={onOpen} />
      </div>
    );
  }
}

export default OpenFlowSelector;
