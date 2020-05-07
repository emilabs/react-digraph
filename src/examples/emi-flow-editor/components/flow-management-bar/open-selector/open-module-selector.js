import * as React from 'react';

import { STG } from '../../../common';
import { EnvSelector } from './common';
import ModuleSelector from '../../module/module-selector';

class OpenModuleSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      env: STG,
    };
  }

  changeEnv = env => {
    // const { reloadFolders } = this.props;

    this.setState({ env });
    // reloadFlows(env, this.state.includeLegacy);
  };

  render() {
    const { env } = this.state;
    const { getModuleFolders, getModuleDefs } = this.props;

    return (
      <div style={{ display: 'inherit', alignItems: 'center' }}>
        <EnvSelector env={env} onSelect={this.changeEnv} />
        <ModuleSelector
          getModuleFolders={getModuleFolders}
          getModuleDefs={getModuleDefs}
          onModuleSelected={() => ''}
        />
      </div>
    );
  }
}

export default OpenModuleSelector;
