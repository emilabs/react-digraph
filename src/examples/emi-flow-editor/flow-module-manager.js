/* 
  This class is a replica of flow-defs-api flow_module_manager.py and must
  be updated accordingly.
  In the future we might consider adding a new endpoint to flow-defs-api for this.
*/
import { NON_NODE_KEYS } from '../../utilities/transformers/flow-v1-transformer';

const moduleIndexes = (flowJson, modulePath) =>
  Object.keys(flowJson)
    .filter(k => flowJson[k].Type == 'Module')
    .filter(k => !modulePath || flowJson[k].importPath === modulePath);

const prefixAllIndexes = (moduleJson, prefix) => {
  const addPrefix = text => `${prefix}-${text}`;

  const splitFilterNameOp = filterKey => {
    const split = filterKey.split('_');
    const name = split.slice(0, -1).join('_');
    const op = split.slice(-1)[0];

    return [name, op];
  };

  const createFilterKey = (name, op) => `${name}_${op}`;

  const prefixAnswerFilter = (key, value) => {
    let [name, op] = splitFilterNameOp(key); // eslint-disable-line prefer-const

    name = addPrefix(name);

    return [createFilterKey(name, op), value];
  };

  const addPrefixToFilters = filters => {
    const newFilters = {};

    Object.keys(filters).forEach(key => {
      let value = filters[key];

      [key, value] = prefixAnswerFilter(key, value);
      newFilters[key] = value;
    });

    return newFilters;
  };

  Object.keys(moduleJson)
    .filter(k => !NON_NODE_KEYS.includes(k))
    .forEach(index => {
      const node = moduleJson[index];
      const newIndex = addPrefix(index);

      delete moduleJson[index];
      node.question.index = newIndex;

      node.question.connections.forEach(c => {
        c.goto = addPrefix(c.goto);
        c.answers = addPrefixToFilters(c.answers);
      });

      moduleJson[newIndex] = node;
    });

  moduleJson.current = addPrefix(moduleJson.current);
  moduleJson.last_node = addPrefix(moduleJson.last_node);
};

const loadModuleIntoNode = (flowJson, moduleJson, index) => {
  prefixAllIndexes(moduleJson, index);
  const moduleFirst = moduleJson.current;
  const moduleLast = moduleJson.last_node;

  delete moduleJson.module_config;
  delete moduleJson.current;
  delete moduleJson.last_node;

  Object.keys(flowJson)
    .filter(k => !NON_NODE_KEYS.includes(k))
    .map(k => flowJson[k].question.connections)
    .flat()
    .filter(c => c.goto === index)
    .forEach(c => (c.goto = moduleFirst));

  const nodeConns = flowJson[index].question.connections;

  delete flowJson[index];
  moduleJson[moduleLast].question.connections = nodeConns;

  flowJson = { ...flowJson, ...moduleJson };

  return flowJson;
};

const loadModule = (flowJson, modulePath, moduleContents) => {
  moduleIndexes(flowJson, modulePath).forEach(
    index =>
      (flowJson = loadModuleIntoNode(
        flowJson,
        JSON.parse(moduleContents),
        index
      ))
  );

  return flowJson;
};

const getResolvedFlow = (flowJson, moduleContentsByPath) => {
  flowJson = JSON.parse(JSON.stringify(flowJson));
  Object.keys(moduleContentsByPath).forEach(
    modulePath =>
      (flowJson = loadModule(
        flowJson,
        modulePath,
        moduleContentsByPath[modulePath]
      ))
  );

  return flowJson;
};

export default getResolvedFlow;
