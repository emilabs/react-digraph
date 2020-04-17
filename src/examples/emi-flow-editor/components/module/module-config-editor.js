import * as React from 'react';
import { withAlert } from 'react-alert';

import { Button } from '../common';
import FolderSelector from './folder-selector';

class ModuleConfigEditor extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  _openTurnMenu = () => this.setState({ turnMenuOpened: true });

  _turnIntoModule = folder => {
    const { moduleConfigHandlers } = this.props;
    const { turnIntoModule } = moduleConfigHandlers;

    turnIntoModule();
  };

  render() {
    const { turnMenuOpened, folder } = this.state;
    const { moduleConfigHandlers } = this.props;
    const { isModule, getModuleFolders } = moduleConfigHandlers;

    return (
      <div id="moduleConfigEditor" className="rightEditor">
        <h1>Module Configuration</h1>
        {!isModule() && (
          <label style={{ flexGrow: 0 }}>
            <Button name="changeModule" onClick={this._openTurnMenu}>
              Turn into Module
            </Button>
            {turnMenuOpened && (
              <label style={{ flexGrow: 0 }}>
                <FolderSelector
                  folder={folder}
                  getModuleFolders={getModuleFolders}
                  onFolderSelected={this._turnIntoModule}
                />
              </label>
            )}
          </label>
        )}
      </div>
    );
  }
}

export default withAlert()(ModuleConfigEditor);
