import * as React from 'react';
import Select from 'react-select';

import { getSimpleItem, LoadingWrapper, getErrorMessage } from '../common';

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

  componentDidUpdate(prevProps) {
    const { env } = this.props;

    if (env !== prevProps.env) {
      this._reloadFolders();
    }
  }

  _reloadFolders = () => {
    const { env, getModuleFolders } = this.props;

    this.setState({
      loadingFolders: true,
    });

    return getModuleFolders(env)
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
    const { folder, theme, large } = this.props;
    const { folderItems, loadingFolders } = this.state;

    if (large) {
      return (
        <label style={{ display: 'flex', border: 'none' }}>
          Library Folder
          <LoadingWrapper
            isLoading={loadingFolders}
            width="100px"
            height="40px"
          >
            <Select
              className="selectShortContainer"
              theme={theme}
              value={getSimpleItem(folder || '')}
              onChange={item => this._selectFolder(item.value)}
              options={folderItems}
              isSearchable={true}
            />
          </LoadingWrapper>
        </label>
      );
    } else {
      return (
        <LoadingWrapper isLoading={loadingFolders} width="100px" height="40px">
          <Select
            className="selectShortContainer"
            theme={theme}
            value={getSimpleItem(folder || '')}
            onChange={item => this._selectFolder(item.value)}
            options={folderItems}
            isSearchable={true}
          />
        </LoadingWrapper>
      );
    }
  }
}

export default FolderSelector;
