import * as React from 'react';
import Select from 'react-select';

import { STG } from '../../../common';
import { getSimpleItem } from '../../common';
import { EnvSelector } from './common';
import ModuleSelector from '../../module/module-selector';

const TYPE_DRAFT = 'draft';
const TYPE_PUBLISHED = 'published';

const ModuleVersionSelector = ({ onVersionSelected, value, versions }) => (
  <Select
    className="selectShortContainer"
    isSearchable={true}
    onChange={item => onVersionSelected(item.value)}
    options={versions.map(v => getSimpleItem(v))}
    value={getSimpleItem(value)}
  />
);

const ModuleVersionTypeSelector = ({ onTypeSelected, value }) => (
  <Select
    className="selectShortContainer"
    isSearchable={false}
    onChange={item => onTypeSelected(item.value)}
    options={[TYPE_DRAFT, TYPE_PUBLISHED].map(v => getSimpleItem(v))}
    value={getSimpleItem(value)}
  />
);

class OpenModuleSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      env: STG,
      modulesDict: {},
      type: TYPE_DRAFT,
    };
  }

  changeEnv = env => this.setState({ env });

  getVersions = () => {
    const { modulesDict, name } = this.state;
    const versions = Object.keys(modulesDict[name]);

    versions.sort();

    return versions.reverse().filter(v => v !== TYPE_DRAFT);
  };

  onModuleSelected = (name, modulesDict) => {
    const { onOpen } = this.props;
    const { type } = this.state;

    if (type === TYPE_DRAFT) {
      onOpen(modulesDict[name][TYPE_DRAFT].path);
    } else {
      this.setState({ name, modulesDict });
    }
  };

  onVersionSelected = version => {
    const { onOpen } = this.props;
    const { modulesDict, name } = this.state;

    onOpen(modulesDict[name][version].path);
  };

  render() {
    const { env, name, version, type } = this.state;
    const { getModuleFolders, getModuleDefs } = this.props;

    return (
      <div style={{ display: 'inherit', alignItems: 'center' }}>
        <EnvSelector env={env} onSelect={this.changeEnv} />
        <ModuleVersionTypeSelector
          onTypeSelected={newType => this.setState({ type: newType })}
          value={type}
        />
        <ModuleSelector
          env={env}
          getModuleFolders={getModuleFolders}
          getModuleDefs={getModuleDefs}
          onModuleSelected={this.onModuleSelected}
          value={name}
        />
        {name && type === TYPE_PUBLISHED && (
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
