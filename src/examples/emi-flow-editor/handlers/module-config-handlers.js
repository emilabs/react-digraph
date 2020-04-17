import { MODULE_CONFIG_KEY } from '../../../utilities/transformers/flow-v1-transformer';

const getModuleConfigHandlers = bwdlEditable => {
  bwdlEditable.isModule = function() {
    const { bwdlJson } = this.state;

    return MODULE_CONFIG_KEY in bwdlJson;
  }.bind(bwdlEditable);

  bwdlEditable.turnIntoModule = function() {
    this.changeJson(
      function(json, prevState) {
        json[MODULE_CONFIG_KEY] = {};
      }.bind(bwdlEditable)
    );
  }.bind(bwdlEditable);

  return bwdlEditable;
};

export default getModuleConfigHandlers;
