import { STG_BUCKET, ENV_BUCKETS } from '../cognito';
import { PROD, STG } from '../common';
import { MODULES_LIBS_PATH } from './module-node-handlers';

const moduleRegex = /libs\/modules\/(.*)\/(.*)_v(\d+|master)(_draft|)\.json$/;

const getFlowManagementHandlers = app => {
  app.getFlows = function({ env, Prefix = '', includeLegacy = true }) {
    return this.state.s3
      .listObjects({
        Bucket: ENV_BUCKETS[env],
        Prefix,
        Delimiter: '/',
      })
      .promise()
      .then(data =>
        data.Contents.filter(f => f.Key.endsWith('.json')).filter(
          f => includeLegacy || !f.Key.endsWith('.py.json')
        )
      );
  }.bind(app);

  app.newFlow = function() {
    this.setFlow(null, '{}');
  }.bind(app);

  app.getVersions = function(env = STG) {
    const params = {
      Bucket: ENV_BUCKETS[env],
      Prefix: this.state.flowName,
    };

    return this.state.s3
      .listObjectVersions(params)
      .promise()
      .then(data => data.Versions);
  }.bind(app);

  app.getFlow = function(env, flowName, VersionId) {
    return this.state.s3
      .getObject({ Bucket: ENV_BUCKETS[env], Key: flowName, VersionId })
      .promise()
      .then(data => data.Body.toString());
  }.bind(app);

  app._getProdFlow = function(flowName) {
    return this.flowExists(flowName, PROD).then(exists =>
      exists ? this.getFlow(PROD, flowName) : ''
    );
  }.bind(app);

  app._setFlow = function(flowName, flow, env = STG, versionId) {
    const fetchProdFlow = env === STG && !versionId;

    if (!fetchProdFlow) {
      return this.setFlow(flowName, flow, null, env, versionId);
    } else {
      return this._getProdFlow(flowName).then(prodFlow =>
        this.setFlow(flowName, flow, prodFlow, env, versionId)
      );
    }
  }.bind(app);

  app.getProdJsonText = function() {
    return this.state.prodJsonText;
  }.bind(app);

  app.openFlow = function(env, flowName, versionId) {
    return this.getFlow(env, flowName, versionId).then(flow =>
      this._setFlow(flowName, flow, env, versionId)
    );
  }.bind(app);

  app.shipFlow = function() {
    return app.saveFlow({ env: PROD });
  }.bind(app);

  app.isModule = function() {
    const { flowName } = this.state;

    return flowName && flowName.includes('libs/modules/');
  }.bind(app);

  app.changeModuleConfig = function(moduleConfigDelta) {
    const { jsonText } = this.state;
    const json = JSON.parse(jsonText);

    json.module_config = {
      ...json.module_config,
      ...moduleConfigDelta,
    };

    return this.changeState({ jsonText: JSON.stringify(json, null, 2) });
  }.bind(app);

  app.cloneModule = function() {
    const { flowName } = this.state;
    const { folder, name, version, draft } = this.parseImportPath(flowName);
    const newFlowName = this.getImportPath(
      folder,
      `${name}-copy`,
      version,
      draft
    );

    return this.flowExists(newFlowName).then(exists => {
      if (exists) {
        throw 'Flow already exists';
      }

      return this.changeModuleConfig({
        name: newFlowName,
        version: 1,
        draft: true,
      }).then(() => this.saveFlow({ newFlowName }));
    });
  }.bind(app);

  app.cloneFlow = function() {
    const { flowName } = this.state;

    if (this.isModule()) {
      return this.cloneModule();
    } else {
      const newFlowName = `${flowName.slice(0, -5)}-copy.json`;

      return this.saveFlow({ newFlowName });
    }
  }.bind(app);

  app.saveFlow = function({ newFlowName, env = STG } = {}) {
    const { jsonText, s3 } = this.state;
    const flowName = newFlowName || this.state.flowName;
    const params = {
      Bucket: ENV_BUCKETS[env],
      CacheControl: 'no-cache',
      Key: flowName,
      Body: jsonText,
      ContentType: 'application/json;charset=utf-8',
    };
    const options = {};

    return s3
      .upload(params, options)
      .promise()
      .then(() => this._setFlow(flowName, jsonText));
  }.bind(app);

  app.flowExists = function(flowName, env = STG) {
    const params = { Bucket: ENV_BUCKETS[env], Key: flowName };

    return this.state.s3
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
  }.bind(app);

  app.deleteFlow = function() {
    const { s3, flowName } = this.state;

    return s3
      .deleteObject({ Key: flowName })
      .promise()
      .then(() => this.newFlow());
  }.bind(app);

  app.copyFlow = function(newFlowName) {
    const { flowName, s3 } = this.state;

    return s3
      .copyObject({
        Bucket: STG_BUCKET,
        CopySource: encodeURIComponent(`/${STG_BUCKET}/${flowName}`),
        Key: newFlowName,
      })
      .promise();
  }.bind(app);

  app.rename = function(newFlowName) {
    const renameModule = () => {
      const modulePath = this.getSameImportPath({
        name: newFlowName.slice(0, -5),
      });

      return this.saveFlow().then(this.moveOrCreate(modulePath));
    };

    if (!this.isModule()) {
      return this.moveOrCreate(newFlowName);
    } else {
      return this.changeModuleConfig({ name: newFlowName.slice(0, -5) }).then(
        renameModule
      );
    }
  }.bind(app);

  app.moveOrCreate = function(newFlowName) {
    const { flowName, jsonText, s3 } = this.state;

    return this.flowExists(newFlowName).then(exists => {
      if (exists) {
        throw 'Flow already exists';
      } else {
        if (!flowName) {
          return this.saveFlow({ newFlowName });
        }

        return this.copyFlow(newFlowName).then(() =>
          // Delete the old object
          s3
            .deleteObject({
              Key: flowName,
            })
            .promise()
            .then(() => this._setFlow(newFlowName, jsonText))
        );
      }
    });
  }.bind(app);

  app.getModuleFolders = function(env = STG) {
    const Prefix = `${MODULES_LIBS_PATH}/`;
    const { s3 } = this.state;

    return s3
      .listObjectsV2({
        Bucket: ENV_BUCKETS[env],
        Delimiter: '/',
        Prefix,
      })
      .promise()
      .then(data =>
        data.CommonPrefixes.map(cp => cp.Prefix).map(p =>
          p.slice(Prefix.length, -1)
        )
      );
  }.bind(app);

  app.getModuleDefs = function(folder, name) {
    const prefix = name ? `${name}_v` : '';
    const { s3 } = this.state;

    return s3
      .listObjectsV2({
        Bucket: STG_BUCKET,
        Delimiter: '/',
        Prefix: `${MODULES_LIBS_PATH}/${folder}/${prefix}`,
      })
      .promise()
      .then(
        function(data) {
          const modulesDict = {};

          data.Contents.filter(m => m.Key.endsWith('.json')).forEach(m => {
            try {
              const { name, version, draft } = this.parseImportPath(m.Key);

              if (!modulesDict[name]) {
                modulesDict[name] = {};
              }

              const key = draft ? 'draft' : version;

              modulesDict[name][key] = {
                path: m.Key,
                name,
                version,
                draft,
              };
            } catch (err) {
              console.log(  // eslint-disable-line no-console,prettier/prettier
                `Warning: Ignored flow ${m.Key}. Couldn't parse path.`
              );
            }
          });

          return modulesDict;
        }.bind(app)
      );
  }.bind(app);

  app.getModuleLastPublishedVersionNumber = function() {
    const { flowName } = this.state;
    const { folder, name, version } = this.parseImportPath(flowName);
    const versionExists = v =>
      this.flowExists(this.getImportPath(folder, name, v, false));

    return versionExists(version).then(exists =>
      exists
        ? version
        : version > 1 &&
          versionExists(version - 1).then(exists ? version - 1 : null)
    );
  }.bind(app);

  app.getImportPath = function(folder, name, version, draft) {
    const moduleFileName = `${name}_v${version}${draft ? '_draft' : ''}.json`;

    return `${MODULES_LIBS_PATH}/${folder}/${moduleFileName}`;
  }.bind(app);

  app.getSameImportPath = function({ name, version, draft } = {}) {
    const { jsonText } = this.state;
    const json = JSON.parse(jsonText);
    const {
      name: currName,
      folder,
      version: currVersion,
      draft: currDraft,
    } = json.module_config;

    name = name || currName;
    version = version || currVersion;
    draft = draft !== undefined ? draft : currDraft;

    return this.getImportPath(folder, name, version, draft);
  }.bind(app);

  app.parseImportPath = function(importPath) {
    try {
      if (importPath) {
        const [, folder, name, version, draft, ..._] = moduleRegex.exec( // eslint-disable-line no-unused-vars,prettier/prettier
          importPath
        );

        return { folder, name, version, draft: !!draft };
      } else {
        return { folder: null, name: null, version: null, draft: false };
      }
    } catch (err) {
      throw Error(`Can't parse module path '${importPath}'`, err);
    }
  }.bind(app);

  return app;
};

export { getFlowManagementHandlers };
