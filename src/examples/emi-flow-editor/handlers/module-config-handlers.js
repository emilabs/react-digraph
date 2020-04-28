import { MODULE_CONFIG_KEY } from '../../../utilities/transformers/flow-v1-transformer';
import { STG_BUCKET, ENV_BUCKETS } from '../cognito';
import { STG } from '../common';
import { MODULES_LIBS_PATH } from './module-node-handlers';

const getModuleConfigHandlers = (bwdlEditable, flowManagementHandlers) => {
  bwdlEditable.isModule = function() {
    const { bwdlJson } = this.state;

    return MODULE_CONFIG_KEY in bwdlJson;
  }.bind(bwdlEditable);

  bwdlEditable.getLastPublishedVersionNumber = function() {
    const { folder, name } = this.getModuleConfig();

    return this.getLatestVersionModuleDef(folder, name).then(
      ({ version }) => version
    );
  }.bind(bwdlEditable);

  bwdlEditable.getLastPublishedModule = function() {
    const { folder, name } = this.getModuleConfig();

    return this.getLastPublishedVersionNumber().then(
      function(version) {
        return this.getModule(this.getImportPath(folder, name, version)).then(
          contents => ({ version, contents })
        );
      }.bind(bwdlEditable)
    );
  }.bind(bwdlEditable);

  bwdlEditable._flowExists = function(flowName, env = STG) {
    const params = { Bucket: ENV_BUCKETS[env], Key: flowName };

    return this.props.s3
      .headObject(params)
      .promise()
      .then(() => true)
      .catch(err => {
        if (err.code === 'NotFound') {
          return false;
        } else {
          throw err;
        }
      });
  }.bind(bwdlEditable);

  bwdlEditable.moveFlow = function(oldPath, newPath) {
    const { s3 } = this.props;

    return this._flowExists(newPath).then(exists => {
      if (exists) {
        throw 'Module already exists';
      } else {
        return s3
          .copyObject({
            Bucket: STG_BUCKET,
            CopySource: `${STG_BUCKET}/${oldPath}`,
            Key: newPath,
          })
          .promise()
          .then(() =>
            s3
              .deleteObject({
                Bucket: STG_BUCKET,
                Key: oldPath,
              })
              .promise()
          );
      }
    });
  }.bind(bwdlEditable);

  bwdlEditable.getModuleConfig = function() {
    const { bwdlJson } = this.state;

    return bwdlJson.module_config;
  }.bind(bwdlEditable);

  bwdlEditable.publishModuleVersion = function() {
    this.changeJson(
      function(json, prevState) {
        json[MODULE_CONFIG_KEY].published = true;
      }.bind(bwdlEditable)
    );
  }.bind(bwdlEditable);

  bwdlEditable.getImportPath = function(folder, name, version) {
    const moduleFileName = `${name}_v${version}.json`;

    return `${MODULES_LIBS_PATH}/${folder}/${moduleFileName}`;
  }.bind(bwdlEditable);

  bwdlEditable.turnIntoModule = function(folder) {
    const { flowName } = this.props;
    const moduleName = flowName.slice(0, -5);
    const version = 'master';
    const newPath = this.getImportPath(folder, moduleName, version);

    return this.changeJson(
      function(json, prevState) {
        json[MODULE_CONFIG_KEY] = {
          name: moduleName,
          folder,
          version,
        };
      }.bind(bwdlEditable)
    )
      .then(
        function() {
          this.moveFlow(flowName, newPath);
        }.bind(bwdlEditable)
      )
      .then(() => flowManagementHandlers.openFlow(STG, newPath));
  }.bind(bwdlEditable);

  return bwdlEditable;
};

export default getModuleConfigHandlers;
