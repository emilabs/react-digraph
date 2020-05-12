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

  changeEnv = env => this.setState({ env });

  // onModuleSelected = (name, modulesDict) => {
  //   const { getModuleDef } = this.props;

  //   this._importModule(getModuleDef(modulesDict, name)).finally(() => {
  //     this.setState({
  //       showModuleSelect: false,
  //     });
  //   });
  // };

  render() {
    const { env } = this.state;
    const { getModuleFolders, getModuleDefs } = this.props;

    return (
      <div style={{ display: 'inherit', alignItems: 'center' }}>
        <EnvSelector env={env} onSelect={this.changeEnv} />
        <ModuleSelector
          env={env}
          getModuleFolders={getModuleFolders}
          getModuleDefs={getModuleDefs}
          onModuleSelected={() => ''}
        />
      </div>
    );
  }
}

export default OpenModuleSelector;
