import * as React from 'react';
import Select from 'react-select';

import {
  selectTheme,
  getSimpleItem,
  LoadingWrapper,
  getErrorMessage,
} from '../common';

class FolderSelector extends React.Component {
  constructor(props) {
    super(props);

    this.alert = this.props.alert;
    this.state = {
      folderItems: [],
      loadingFolders: false,
    };
  }

  componentDidMount() {
    this._reloadFolders();
  }

  _reloadFolders = () => {
    this.setState({
      loadingFolders: true,
    });

    return this.props
      .getModuleFolders()
      .then(folders => {
        this.setState({
          folderItems: folders.map(m => getSimpleItem(m)),
          loadingFolders: false,
        });
      })
      .catch(err => {
        this.setState({
          loadingFolders: false,
          folderItems: [],
        });
        this.alert.error(
          `Couldn't retrieve module folders: ${getErrorMessage(err)}`
        );
      });
  };

  _selectFolder = folder => {
    const { onFolderSelected } = this.props;

    onFolderSelected(folder);
  };

  render() {
    const { folder } = this.props;
    const { folderItems, loadingFolders } = this.state;

    return (
      <label style={{ display: 'flex', border: 'none' }}>
        Library Folder:
        <LoadingWrapper isLoading={loadingFolders} width="100px" height="40px">
          <Select
            className="selectShortContainer"
            theme={selectTheme}
            value={getSimpleItem(folder || '')}
            onChange={item => this._selectFolder(item.value)}
            options={folderItems}
            isSearchable={true}
          />
        </LoadingWrapper>
      </label>
    );
  }
}

export default FolderSelector;
