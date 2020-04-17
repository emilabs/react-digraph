import * as React from 'react';
import Select from 'react-select';

import {
  selectTheme,
  getSimpleItem,
  LoadingWrapper,
  getErrorMessage,
} from './common';
import ModuleFolderComponent from './module-folder-component';

class ModuleSelector extends React.Component {
  constructor(props) {
    super(props);

    this.alert = this.props.alert;
    this.state = {
      loadingModuleList: false,
      moduleItems: [],
      modulesDict: {},
      showModuleSelect: false,
    };
  }

  _selectFolder = folder => {
    this._reloadModules(folder);
    this.setState({ folder });
  };

  _reloadModules = folder => {
    this.setState({
      loadingModuleList: true,
    });

    return this.props
      .getModuleDefs(folder)
      .then(modules => {
        this.setState({
          modulesDict: modules,
          moduleItems: Object.keys(modules).map(m => getSimpleItem(m)),
          loadingModuleList: false,
        });
      })
      .catch(err => {
        this.setState({
          loadingModuleList: false,
          modules: [],
        });
        this.alert.error(`Couldn't retrieve modules: ${getErrorMessage(err)}`);
      });
  };

  render() {
    const { moduleItems, folder, loadingModuleList, modulesDict } = this.state;
    const { getModuleFolders, onModuleSelected } = this.props;

    return (
      <div>
        <div>
          <ModuleFolderComponent
            folder={folder}
            getModuleFolders={getModuleFolders}
            onFolderSelected={this._selectFolder}
          />
          {folder && (
            <label style={{ display: 'flex', border: 'none' }}>
              <LoadingWrapper
                isLoading={loadingModuleList}
                width="300px"
                height="40px"
              >
                <Select
                  className="selectLongContainer"
                  theme={selectTheme}
                  value=""
                  onChange={item => onModuleSelected(item.value, modulesDict)}
                  options={moduleItems}
                  isSearchable={true}
                />
              </LoadingWrapper>
            </label>
          )}
        </div>
      </div>
    );
  }
}

export default ModuleSelector;
