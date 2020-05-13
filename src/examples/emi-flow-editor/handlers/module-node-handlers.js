import { STG_BUCKET } from '../cognito';
import { NON_NODE_KEYS } from '../../../utilities/transformers/flow-v1-transformer';

const LIBS_PATH = 'libs';

export const MODULES_LIBS_PATH = `${LIBS_PATH}/modules`;

const slotContextVarsPrefix = 'slot_';

const getModuleNodeHandlers = (bwdlEditable, flowManagementHandlers) => {
  bwdlEditable.getLatestVersionModuleDef = function(folder, name) {
    return this.getModuleDefs(folder, name).then(modulesDict =>
      this.getModuleDef(modulesDict, name)
    );
  }.bind(bwdlEditable);

  bwdlEditable.getModuleFolders = function() {
    return flowManagementHandlers.getModuleFolders();
  }.bind(bwdlEditable);

  bwdlEditable.getModuleDefs = function(folder, name) {
    return flowManagementHandlers.getModuleDefs(folder, name);
  }.bind(bwdlEditable);

  bwdlEditable.getModule = function(importPath, VersionId) {
    return this.props.s3
      .getObject({ Bucket: STG_BUCKET, Key: importPath, VersionId })
      .promise()
      .then(data => data.Body.toString());
  }.bind(bwdlEditable);

  bwdlEditable.parseImportPath = function(importPath) {
    return flowManagementHandlers.parseImportPath(importPath);
  }.bind(bwdlEditable);

  bwdlEditable._changeModuleIndex = function(json, prevState, newIndex) {
    this._changeJsonIndex(json, prevState, newIndex);
  }.bind(bwdlEditable);

  bwdlEditable.getModuleDef = function(modulesDict, name, version) {
    version = version || Object.keys(modulesDict[name]).slice(-1);

    return modulesDict[name][version];
  }.bind(bwdlEditable);

  bwdlEditable.getNodeKeys = function(moduleJson) {
    return Object.keys(moduleJson).filter(k => !NON_NODE_KEYS.includes(k));
  }.bind(bwdlEditable);

  bwdlEditable.getSlotContextVars = function(moduleJson) {
    return [
      ...new Set(
        this.getNodeKeys(moduleJson)
          .map(k => moduleJson[k])
          .map(n => n.question.connections)
          .flat(1)
          .map(conn => conn.setContext)
          .map(c => Object.keys(c))
          .flat(1)
          .filter(cvar => cvar.startsWith(slotContextVarsPrefix))
      ),
    ];
  }.bind(bwdlEditable);

  bwdlEditable.getModuleOutput = function(importPath) {
    return this.getModule(importPath).then(
      function(contents) {
        const moduleJson = JSON.parse(contents || '{}');

        return {
          slotContextVars: this.getSlotContextVars(moduleJson),
          size: this.getNodeKeys(moduleJson).length,
        };
      }.bind(bwdlEditable)
    );
  }.bind(bwdlEditable);

  bwdlEditable.reloadImportedModules = function() {
    const modulesOutput = {};

    const promises = [
      ...new Set(this.getModuleNodes().map(m => m.importPath)),
    ].map(importPath =>
      this.getModuleOutput(importPath).then(
        output => (modulesOutput[importPath] = output)
      )
    );

    return Promise.all(promises).then(
      function() {
        return (
          Object.keys(modulesOutput).length &&
          this.changeJson(
            function(json, prevState) {
              this.getModuleNodeIndexes().forEach(
                i =>
                  (json[i] = {
                    ...json[i],
                    ...modulesOutput[json[i].importPath],
                  })
              );
            }.bind(bwdlEditable)
          )
        );
      }.bind(bwdlEditable)
    );
  }.bind(bwdlEditable);

  bwdlEditable.getModuleNodes = function() {
    const { bwdlJson: json } = this.state;

    return Object.keys(json)
      .filter(k => !NON_NODE_KEYS.includes(k))
      .map(k => json[k])
      .filter(n => n.Type === 'Module');
  }.bind(bwdlEditable);

  bwdlEditable.getModuleNodeIndexes = function() {
    return this.getModuleNodes().map(m => m.question.index);
  }.bind(bwdlEditable);

  bwdlEditable.importModule = function(moduleDef) {
    return this.getModuleOutput(moduleDef.path).then(
      function({ slotContextVars, size }) {
        this.changeJson(
          function(json, prevState) {
            const { newIndex } = this.getAvailableIndex(
              json,
              moduleDef.name,
              '-'
            );

            this._changeModuleIndex(json, prevState, newIndex);
            json[newIndex] = {
              ...json[newIndex],
              slotContextVars,
              size,
              importPath: moduleDef.path,
            };
          }.bind(bwdlEditable)
        );
      }.bind(bwdlEditable)
    );
  }.bind(bwdlEditable);

  bwdlEditable.onChangeModulePrefix = function(newPrefix) {
    this.changeSelectedNode((node, index, newJson) => {
      const nodeNames = Object.keys(newJson);
      const updatedEdges = new Set();
      const oldSlotPrefix = node.prefix ? `${node.prefix}-` : node.prefix;
      const newSlotPrefix = newPrefix ? `${newPrefix}-` : newPrefix;
      const updatePrefix = slotContextVar =>
        `${slotContextVarsPrefix}${newSlotPrefix}${slotContextVar.substr(
          slotContextVarsPrefix.length + oldSlotPrefix.length
        )}`;

      nodeNames.forEach(name => {
        const aNode = newJson[name];

        if (!aNode || NON_NODE_KEYS.includes(name)) {
          return;
        }

        const q = aNode.question;

        q.connections.forEach(
          function(connection) {
            const { context } = connection;

            this.getFilterItems(context)
              .filter(
                ({ key, op, value }) =>
                  node.slotContextVars.includes(key) &&
                  key.startsWith(slotContextVarsPrefix)
              )
              .forEach(({ key, op, value }) => {
                delete context[`${key}_${op}`];
                context[`${updatePrefix(key)}_${op}`] = value;

                updatedEdges.add(
                  this.state.edges.find(
                    e => e.target === connection.goto && e.source === name
                  )
                );
              });
          }.bind(bwdlEditable)
        );
      });
      updatedEdges.forEach(e => this.GraphView.asyncRenderEdge(e));

      node.slotContextVars = node.slotContextVars.map(s => updatePrefix(s));
      node.prefix = newPrefix;
    });
  }.bind(bwdlEditable);

  return bwdlEditable;
};

export { getModuleNodeHandlers };
