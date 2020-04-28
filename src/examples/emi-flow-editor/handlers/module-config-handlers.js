import { MODULE_CONFIG_KEY } from '../../../utilities/transformers/flow-v1-transformer';
import { STG } from '../common';
import { MODULES_LIBS_PATH } from './module-node-handlers';

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

  bwdlEditable.publishModuleVersion = function() {
    const versionImportPath = this.getSameImportPath({ newDraft: false });
    const { _setDraft } = this;

    // TODO error alert on unsaved changes
    return _setDraft(false)
      .then(() => flowManagementHandlers.saveFlow())
      .then(() => flowManagementHandlers.copyFlow(versionImportPath))
      .then(() => _setDraft(true))
      .then(() => flowManagementHandlers.saveFlow());
  }.bind(bwdlEditable);

  bwdlEditable.getSameImportPath = function({ version, draft }) {
    const { bwdlJson: json } = this.state;
    const { name, folder, version: currVersion, draft: currDraft } = json[
      MODULE_CONFIG_KEY
    ];

    version = version || currVersion;
    draft = draft !== undefined ? draft : currDraft;

    return this.getImportPath(folder, name, version, draft);
  }.bind(bwdlEditable);

  bwdlEditable.getPublishedModule = function() {
    return flowManagementHandlers
      .flowExists(this.getSameImportPath({ draft: false }))
      .then(exists => exists && this.getSameModule({ draft: false }));
  }.bind(bwdlEditable);

  bwdlEditable.getImportPath = function(folder, name, version, draft) {
    const moduleFileName = `${name}_v${version}${draft ? '_draft' : ''}.json`;

    return `${MODULES_LIBS_PATH}/${folder}/${moduleFileName}`;
  }.bind(bwdlEditable);

  bwdlEditable.turnIntoModule = function(folder) {
    const { flowName } = this.props;
    const moduleName = flowName.slice(0, -5);
    const version = 1;
    const draft = true;
    const newPath = this.getImportPath(folder, moduleName, version, draft);

    return this.changeJson(
      function(json, prevState) {
        json[MODULE_CONFIG_KEY] = {
          name: moduleName,
          folder,
          version,
          draft,
        };
      }.bind(bwdlEditable)
    )
      .then(() => flowManagementHandlers.saveFlow())
      .then(() => flowManagementHandlers.moveOrCreate(newPath))
      .then(() => flowManagementHandlers.openFlow(STG, newPath));
  }.bind(bwdlEditable);

  return bwdlEditable;
};

export default getModuleConfigHandlers;
