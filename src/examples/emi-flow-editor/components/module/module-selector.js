import * as React from 'react';
import Select from 'react-select';
import { withAlert } from 'react-alert';

import { getSimpleItem, LoadingWrapper, getErrorMessage } from '../common';
import FolderSelector from './folder-selector';

const ActualModuleSelector = ({
  loading,
  modulesDict,
  moduleItems,
  onModuleSelected,
  theme,
}) => (
  <LoadingWrapper isLoading={loading} width="300px" height="40px">
    <Select
      className="selectLongContainer"
      isSearchable={true}
      onChange={item => onModuleSelected(item.value, modulesDict)}
      options={moduleItems}
      theme={theme}
      value=""
    />
  </LoadingWrapper>
);

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
    const { getModuleFolders, onModuleSelected, theme, large } = this.props;

    return (
      <div>
        <div style={large ? {} : { display: 'flex' }}>
          <FolderSelector
            folder={folder}
            getModuleFolders={getModuleFolders}
            onFolderSelected={this._selectFolder}
            theme={theme}
            large={large}
          />
          {folder && large && (
            <label style={{ display: 'flex', border: 'none' }}>
              <ActualModuleSelector
                loading={loadingModuleList}
                modulesDict={modulesDict}
                moduleItems={moduleItems}
                onModuleSelected={onModuleSelected}
                theme={theme}
              />
            </label>
          )}
          {folder && !large && (
            <ActualModuleSelector
              loading={loadingModuleList}
              modulesDict={modulesDict}
              moduleItems={moduleItems}
              onModuleSelected={onModuleSelected}
              theme={theme}
            />
          )}
        </div>
      </div>
    );
  }
}

export default withAlert()(ModuleSelector);
