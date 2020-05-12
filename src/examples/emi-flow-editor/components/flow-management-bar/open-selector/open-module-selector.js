import * as React from 'react';
import Select from 'react-select';

import { STG } from '../../../common';
import { getSimpleItem } from '../../common';
import { EnvSelector } from './common';
import ModuleSelector from '../../module/module-selector';

const ModuleVersionSelector = ({ onVersionSelected, value, versions }) => (
  <Select
    className="selectShortContainer"
    isSearchable={true}
    onChange={item => onVersionSelected(item.value)}
    options={versions.map(v => getSimpleItem(v))}
    value={getSimpleItem(value)}
  />
);

class OpenModuleSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      env: STG,
      modulesDict: {},
    };
  }

  changeEnv = env => this.setState({ env });

  getVersions = () => {
    const { modulesDict, name } = this.state;
    const versions = Object.keys(modulesDict[name]);

    versions.sort();

    return versions.reverse();
  };

  onModuleSelected = (name, modulesDict) =>
    this.setState({ name, modulesDict });

  onVersionSelected = version => {
    const { onOpen } = this.props;
    const { modulesDict, name } = this.state;

    onOpen(modulesDict[name][version].path);
  };

  render() {
    const { env, name, version } = this.state;
    const { getModuleFolders, getModuleDefs } = this.props;

    return (
      <div style={{ display: 'inherit', alignItems: 'center' }}>
        <EnvSelector env={env} onSelect={this.changeEnv} />
        <ModuleSelector
          env={env}
          getModuleFolders={getModuleFolders}
          getModuleDefs={getModuleDefs}
          onModuleSelected={this.onModuleSelected}
          value={name}
        />
        {name && (
          <ModuleVersionSelector
            onVersionSelected={this.onVersionSelected}
            value={version}
            versions={this.getVersions()}
          />
        )}
      </div>
    );
  }
}

export default OpenModuleSelector;
