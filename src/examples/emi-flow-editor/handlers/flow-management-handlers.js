import { STG_BUCKET, ENV_BUCKETS } from '../cognito';
import { PROD, STG } from '../common';

const getFlowManagementHandlers = app => {
  app.getFlows = function(env, includeLegacy = true) {
    return this.state.s3
      .listObjects({
        Bucket: ENV_BUCKETS[env],
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
    return this._flowExists(flowName, PROD).then(exists =>
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

  app.getJsonText = function() {
    return this.state.jsonText;
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

  app.cloneFlow = function() {
    const newFlowName = `${this.state.flowName.slice(0, -5)}-copy.json`;

    return this.saveFlow({ newFlowName });
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

  app._flowExists = function(flowName, env = STG) {
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
  };

  app.moveOrCreate = function(newFlowName) {
    const { flowName, jsonText, s3 } = this.state;

    return this._flowExists(newFlowName).then(exists => {
      if (exists) {
        throw 'Flow already exists';
      } else {
        if (!flowName) {
          return this.saveFlow({ newFlowName });
        }

        this.copyFlow(newFlowName).then(() =>
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
  };

  return app;
};

export { getFlowManagementHandlers };
