import {
  LAST_NODE,
  MODULE_CONFIG_KEY,
  NON_NODE_KEYS,
} from '../../../utilities/transformers/flow-v1-transformer';
import { STG } from '../common';

const getModuleConfigHandlers = (bwdlEditable, flowManagementHandlers) => {
  bwdlEditable.isModule = function() {
    const { bwdlJson } = this.state;

    return MODULE_CONFIG_KEY in bwdlJson;
  }.bind(bwdlEditable);

  bwdlEditable.getLastPublishedVersionNumber = function() {
    const { version, draft } = this.getModuleConfig();

    if (draft) {
      return version > 1 ? version - 1 : null;
    } else {
      return version;
    }
  }.bind(bwdlEditable);

  bwdlEditable.getSameModule = function({ version, draft }) {
    return this.getModule(this.getSameImportPath({ version, draft }));
  }.bind(bwdlEditable);

  bwdlEditable.getModuleConfig = function() {
    const { bwdlJson } = this.state;

    return bwdlJson.module_config;
  }.bind(bwdlEditable);

  bwdlEditable._setDraft = function(draft) {
    return this.changeJson(json => {
      json[MODULE_CONFIG_KEY].draft = draft;
    });
  }.bind(bwdlEditable);

  bwdlEditable._raiseVersion = function() {
    const {
      bwdlJson: { [MODULE_CONFIG_KEY]: moduleConfig },
    } = this.state;

    return this.changeJson(json => {
      moduleConfig.version += 1;
    });
  }.bind(bwdlEditable);

  bwdlEditable.raiseModuleVersion = function() {
    return this._raiseVersion()
      .then(() => flowManagementHandlers.saveFlow())
      .then(
        function() {
          flowManagementHandlers.moveOrCreate(this.getSameImportPath());
        }.bind(bwdlEditable)
      );
  }.bind(bwdlEditable);

  bwdlEditable.publishModuleVersion = function() {
    const versionImportPath = this.getSameImportPath({ draft: false });
    const { _setDraft } = this;

    return _setDraft(false)
      .then(() => flowManagementHandlers.saveFlow())
      .then(() => flowManagementHandlers.copyFlow(versionImportPath))
      .then(() => _setDraft(true))
      .then(() => flowManagementHandlers.saveFlow());
  }.bind(bwdlEditable);

  bwdlEditable.getSameImportPath = function({ version, draft } = {}) {
    return flowManagementHandlers.getSameImportPath({ version, draft });
  }.bind(bwdlEditable);

  bwdlEditable.getPublishedModule = function() {
    return flowManagementHandlers
      .flowExists(this.getSameImportPath({ draft: false }))
      .then(exists => exists && this.getSameModule({ draft: false }));
  }.bind(bwdlEditable);

  bwdlEditable.getImportPath = function(folder, name, version, draft) {
    return flowManagementHandlers.getImportPath(folder, name, version, draft);
  }.bind(bwdlEditable);

  bwdlEditable.turnIntoModule = function(folder) {
    const { flowName } = this.props;
    const moduleName = flowName.slice(0, -5);
    const version = 1;
    const draft = true;
    const newPath = this.getImportPath(folder, moduleName, version, draft);
    const writeConfig = () =>
      this.changeJson((json, prevState) => {
        json[MODULE_CONFIG_KEY] = {
          name: moduleName,
          folder,
          version,
          draft,
        };
      });

    return flowManagementHandlers
      .moveOrCreate(newPath)
      .then(() => flowManagementHandlers.openFlow(STG, newPath))
      .then(() => writeConfig())
      .then(() => flowManagementHandlers.saveFlow())
      .then(() => this.handleModuleLibClicked());
  }.bind(bwdlEditable);

  bwdlEditable.setLastNode = function() {
    const { bwdlJson: json } = this.state;
    const nodeKeys = Object.keys(json).filter(k => !NON_NODE_KEYS.includes(k));
    const lastNodes = nodeKeys.filter(
      k => json[k].question.connections.length == 0
    );

    return this.changeJson(json => {
      if (lastNodes.length > 1) {
        throw new Error(
          `Multiple last nodes found. Modules can only have one last node`
        );
      }

      json[LAST_NODE] = lastNodes[0];
    });
  }.bind(bwdlEditable);

  return bwdlEditable;
};

export default getModuleConfigHandlers;
