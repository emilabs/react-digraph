import * as React from 'react';
import debounce from 'debounce';
import { withAlert } from 'react-alert';
import Tooltip from 'react-tooltip-lite';

import IndexInput from '../index-input';
import { Button, Input, getErrorMessage, loadingAlert } from '../common';
import ModuleImport from './module-import';

class ModuleNodeEditor extends React.Component {
  constructor(props) {
    super(props);

    const { children, moduleNodeHandlers } = props;
    const { prefix } = children.gnode;
    const { onChangeModulePrefix } = moduleNodeHandlers;

    this.state = { newPrefix: prefix };
    this.onChangeModulePrefix = debounce(onChangeModulePrefix, 250);
  }

  static getDerivedStateFromProps(props, state) {
    const { children, moduleNodeHandlers, alert } = props;
    const { importPath } = children.gnode;

    if (state.importPath != importPath) {
      const { parseImportPath } = moduleNodeHandlers;
      const { importPathError } = state;

      try {
        const { folder, name, version } = parseImportPath(importPath);

        alert.remove(importPathError);

        return { importPath, folder, name, version };
      } catch (err) {
        const importPathError = alert.error(
          `Couldn't parse module import path: ${getErrorMessage(err)}`
        );

        return {
          importPathError,
          importPath,
          folder: null,
          name: null,
          version: null,
        };
      }
    }

    return null;
  }

  onChangeNewPrefix = newPrefix => {
    this.setState({ newPrefix });
    this.onChangeModulePrefix(newPrefix);
  };

  reloadImportedModules = () => {
    const {
      alert,
      moduleNodeHandlers: { reloadImportedModules },
    } = this.props;
    const closeAlert = loadingAlert('Reloading imported modules');

    reloadImportedModules()
      .catch(err =>
        alert.error(`Module import reloading failed: ${getErrorMessage(err)}`)
      )
      .finally(closeAlert);
  };

  render() {
    const { newPrefix, folder, name, version } = this.state;
    const { moduleNodeHandlers, children } = this.props;
    const {
      getModuleDefs,
      importModule,
      getModuleDef,
      getModuleFolders,
      getModuleOutput,
      onChangeIndex,
      getLatestVersionModuleDef,
    } = moduleNodeHandlers;
    const node = children;
    const { question, importPath, slotContextVars } = node.gnode;

    return (
      <div id="moduleNodeEditor" className="rightEditor">
        <label className="d-flex flex-column align-items-start">
          <div className="d-flex flew-row align-items-center">
            Reload All:
            <Tooltip
              content="Reload all modules will retrieve the last update of the same version.
                It will not import a newer version.
                This is a 100% retro compatible operation and it's useful to have actual module sizes
                reflected on the graph and access to new slots context vars, if any."
            >
              <Button
                className="ml-4"
                name="reloadAllModules"
                onClick={this.reloadImportedModules}
              >
                Reload all imported Modules
              </Button>
            </Tooltip>
          </div>
        </label>
        <ModuleImport
          importPath={importPath}
          getModuleDefs={getModuleDefs}
          folder={folder}
          name={name}
          version={version}
          getModuleDef={getModuleDef}
          getModuleFolders={getModuleFolders}
          importModule={importModule}
          getLatestVersionModuleDef={getLatestVersionModuleDef}
          getModuleOutput={getModuleOutput}
          slotContextVars={slotContextVars}
        />
        <IndexInput onChangeIndex={onChangeIndex}>{question.index}</IndexInput>
        <label>
          Prefix:
          <Input value={newPrefix} onChange={this.onChangeNewPrefix} />
        </label>
        {slotContextVars && (
          <label>
            Slot Context Vars:
            <ul>
              {slotContextVars.map(s => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </label>
        )}
      </div>
    );
  }
}

export default withAlert()(ModuleNodeEditor);
