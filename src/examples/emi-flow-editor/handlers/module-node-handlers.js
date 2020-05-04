import { STG_BUCKET } from '../cognito';
import { NON_NODE_KEYS } from '../../../utilities/transformers/flow-v1-transformer';

const LIBS_PATH = 'libs';

export const MODULES_LIBS_PATH = `${LIBS_PATH}/modules`;

const moduleRegex = /libs\/modules\/(.*)\/(.*)_v(\d+|master)(_draft|)\.json$/;
const slotContextVarsPrefix = 'slot_';

const getModuleNodeHandlers = bwdlEditable => {
  bwdlEditable.getLatestVersionModuleDef = function(folder, name) {
    return this.getModuleDefs(folder, name).then(modulesDict =>
      this.getModuleDef(modulesDict, name)
    );
  }.bind(bwdlEditable);

  bwdlEditable.getModuleFolders = function() {
    const Prefix = `${MODULES_LIBS_PATH}/`;

    return this.props.s3
      .listObjectsV2({
        Bucket: STG_BUCKET,
        Delimiter: '/',
        Prefix,
      })
      .promise()
      .then(data =>
        data.CommonPrefixes.map(cp => cp.Prefix).map(p =>
          p.slice(Prefix.length, -1)
        )
      );
  }.bind(bwdlEditable);

  bwdlEditable.getModuleDefs = function(folder, name) {
    const prefix = name ? `${name}_v` : '';

    return this.props.s3
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

              if (!modulesDict.name) {
                modulesDict[name] = {};
              }

              modulesDict[name][version] = {
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
        }.bind(bwdlEditable)
      );
  }.bind(bwdlEditable);

  bwdlEditable.getModule = function(importPath, VersionId) {
    return this.props.s3
      .getObject({ Bucket: STG_BUCKET, Key: importPath, VersionId })
      .promise()
      .then(data => data.Body.toString());
  }.bind(bwdlEditable);

  bwdlEditable.parseImportPath = function(importPath) {
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

  bwdlEditable.getModuleOutput = function(moduleDef) {
    return this.getModule(moduleDef.path).then(
      function(contents) {
        const moduleJson = JSON.parse(contents || '{}');

        return {
          slotContextVars: this.getSlotContextVars(moduleJson),
          size: this.getNodeKeys(moduleJson).length,
        };
      }.bind(bwdlEditable)
    );
  }.bind(bwdlEditable);

  bwdlEditable.importModule = function(moduleDef) {
    return this.getModuleOutput(moduleDef).then(
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
