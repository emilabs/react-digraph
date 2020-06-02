// @flow
/*
  Copyright(c) 2018 Uber Technologies, Inc.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

          http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import * as React from 'react';
import AceEditor from 'react-ace';
import 'brace';
import 'brace/ext/searchbox';
import 'brace/mode/json';
import 'brace/theme/monokai';
import { withAlert } from 'react-alert';
import { Helmet } from 'react-helmet';
import 'react-reflex/styles.css';
import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex';

import { type IEdge } from '../../components/edge';
import GraphView from '../../components/graph-view';
import { type INode } from '../../components/node';
import { type LayoutEngineType } from '../../utilities/layout-engine/layout-engine-types';

import FlowV1Transformer from '../../utilities/transformers/flow-v1-transformer';
import Sidebar from '../sidebar';
import RightEditor from './components';
import GraphConfig, { CHOICE_TYPE, MODULE_TYPE, NODE_KEY } from './bwdl-config'; // Configures node/edge types
import GraphUtils from '../../utilities/graph-util';
// import bwdlExample from './bwdl-example-data';
import getChatbotHandlers from './handlers/chatbot-handlers';
import getEdgeHandlers from './handlers/edge-handlers';
import getNodeHandlers from './handlers/node-handlers';
import getFaqHandlers from './handlers/faq-handlers';
import getModuleConfigHandlers from './handlers/module-config-handlers';
import { getErrorMessage } from './components/common';

type IBwdlState = {
  nodes: INode[],
  edges: IEdge[],
  selected: INode | IEdge | null,
  layoutEngineType: LayoutEngineType,
  bwdlText: string,
  bwdlJson: any,
  copiedNode: any,
};

const indexNameRegex = /"index": "(.*)",/;
const nodeStartLineRegex = /^ {2}"((?!(faqs|module_config)).)*": {/;
const nodeEndLineRegex = /^ {2}}/;

const connsStartLineRegex = /^ {6}"connections": \[/;
const noConnsLineRegex = /^ {6}"connections": \[\]/;
const connsEndLineRegex = /^ {6}]/;

const connStartLineRegex = /^ {8}{/;
const connEndLineRegex = /^ {8}}/;
const gotoIndexRegex = /"goto": "(.*)",/;

const makeid = function(length) {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

class BwdlEditable extends React.Component<{}, IBwdlState> {
  GraphView: GraphView | null;

  constructor(props: any) {
    super(props);

    this.chatbotHandlers = getChatbotHandlers(this);
    this.nodeHandlers = getNodeHandlers(this, props.flowManagementHandlers);
    this.edgeHandlers = getEdgeHandlers(this);
    this.faqHandlers = getFaqHandlers(this);
    this.moduleConfigHandlers = getModuleConfigHandlers(
      this,
      props.flowManagementHandlers
    );
    this.state = this.getInitialState();

    this.sidebarRef = React.createRef();
    this.alert = this.props.alert;
  }

  getInitialState = () => {
    const { initialJsonText } = this.props;
    const jsonObj = JSON.parse(initialJsonText || '{}');
    const jsonText = this.stringify(jsonObj);
    const transformed = FlowV1Transformer.transform(jsonObj);

    return {
      initialRawText: initialJsonText,
      initialText: jsonText,
      bwdlJson: jsonObj,
      bwdlText: jsonText,
      copiedNode: null,
      edges: transformed.edges,
      layoutEngineType: 'None',
      nodes: transformed.nodes,
      selected: null,
      locked: true,
      chatbotSelected: false,
      faqSelected: false,
      moduleLibSelected: false,
      syncError: false,
    };
  };

  componentDidUpdate(prevProps, prevState) {
    const { flowName, flowVersionId, env, initialJsonText } = this.props;
    const { initialRawText } = this.state;

    const flowFileChanged =
      prevProps.flowName !== flowName ||
      prevProps.flowVersionId !== flowVersionId ||
      prevProps.env !== env;

    if (flowFileChanged) {
      this.setState(this.getInitialState());
      setTimeout(() => this.GraphView.handleZoomToFit(), 100);
    } else if (initialRawText !== initialJsonText) {
      // on save
      this.setState({
        initialRawText: initialJsonText,
        initialText: initialJsonText,
      });
    }

    if (this.state.layoutEngineType !== prevState.layoutEngineType) {
      this.updateAllNodesPosition();
      setTimeout(() => this.GraphView.handleZoomToFit(), 100);
    }

    this.state.editor.resize();
  }

  unsavedChanges = () => this.state.initialText !== this.state.bwdlText;

  stringify = bwdlJson => JSON.stringify(bwdlJson, null, 2);

  linkEdge(sourceNode: INode, targetNode: INode, edge?: IEdge) {
    if (
      targetNode.first &&
      !this.getAncestorIndexes(sourceNode.title).includes(targetNode.title)
    ) {
      this.alert.info(`Cannot link to first node, unless it's a loop.`);

      return;
    }

    this.changeJson(json => {
      const nodeJson = json[sourceNode.title];
      const isDefault = nodeJson.question.connections.every(
        conn => !conn.isDefault
      );

      const newConnection = {
        goto: targetNode.title,
        isString: '',
        isDefault: isDefault,
        answers: {},
        containsAny: [],
        context: {},
        greaterThan: '',
        inArray: [],
        isNotString: '',
        lessThan: '',
        notInArray: [],
        setContext: {},
        nlp: {},
      };

      const connections = nodeJson.question.connections;

      if (connections) {
        // check if swapping edge
        let swapped = false;

        if (edge) {
          connections.forEach(connection => {
            if (edge && connection.goto === edge.target) {
              connection.goto = targetNode.title;
              swapped = true;
            }
          });
        }

        if (!swapped) {
          connections.push(newConnection);
        }
      } else {
        nodeJson.question.connections = [newConnection];
      }
    });
  }

  scrollToLine = node => {
    const nodeIndex = this.state.bwdlText.indexOf(`"index": "${node.title}"`);
    const lineNumber = this.state.bwdlText.substring(0, nodeIndex).split('\n')
      .length;

    this.state.editor.gotoLine(lineNumber);
  };

  scrollToLineEdge = edge => {
    const nodeIndex = this.state.bwdlText.indexOf(`  "${edge.source}"`);

    const gotoIndex = this.state.bwdlText
      .substr(nodeIndex)
      .indexOf(`"goto": "${edge.target}"`);
    const lineNumber = this.state.bwdlText
      .substring(0, nodeIndex + gotoIndex)
      .split('\n').length;

    this.state.editor.gotoLine(lineNumber);
  };

  onSelectNode = (node: INode | null) => {
    if (node !== null && this.state.locked) {
      this.scrollToLine(node);
    }

    this.setState(prevState => {
      return {
        selected: node,
        faqSelected: false,
        moduleLibSelected: false,
        chatbotSelected: false,
      };
    });
  };

  getDefaultJson = (nodeType, index) => {
    return {
      [CHOICE_TYPE]: {
        Type: CHOICE_TYPE,
        question: {
          errorMessageNotMatch: '',
          exactMatch: false,
          index: index,
          connections: [],
          text: '',
          immediateNext: false,
          isAudio: false,
          audioErrorMessage: '',
          quickReplies: [],
        },
      },
      [MODULE_TYPE]: {
        Type: MODULE_TYPE,
        question: {
          index: index,
          connections: [],
        },
        importPath: null,
        prefix: '',
        slots: [],
        slotContextVars: [],
      },
    }[nodeType];
  };

  onCreateNode = (x: number, y: number) => {
    this.changeJson(json => {
      const index = `node-${makeid(4)}`;

      json[index] = { ...this.getDefaultJson(CHOICE_TYPE, index), x, y };

      if (!('current' in json)) {
        json.current = index;
      }
    });
  };

  updateNodePositionOnJson = (json, node) => {
    const index = node.title;

    json[index].x = node.x;
    json[index].y = node.y;
  };

  onUpdateNode = (node: INode) => {
    this.changeJson(json => {
      this.updateNodePositionOnJson(json, node);
    });
  };

  updateAllNodesPosition = () => {
    this.changeJson(json => {
      this.state.nodes.forEach(node =>
        this.updateNodePositionOnJson(json, node)
      );
    });
  };

  onDeleteNode = (selected: INode, nodeId: string, nodes: any[]) => {
    const deleteIndex = selected.title;

    this.changeJson(json => {
      if (selected.first) {
        if (this.state.nodes.length > 1) {
          this.alert.error(
            `Cannot delete first node.
            Please pick a different node to be the first one,
            and then delete this node`
          );

          return;
        }

        delete json.current;
      }

      const nodeNames = this.getIncomingEdgeIndexes(deleteIndex);

      nodeNames.forEach(name => {
        const q = json[name].question;

        q.connections = q.connections.filter(c => c.goto !== deleteIndex);
      });
      delete json[deleteIndex];

      return null;
    });
  };

  onSelectEdge = (edge: IEdge) => {
    if (edge !== null) {
      edge.targetNode = this.state.nodes.find(
        node => node.title === edge.target
      );

      if (this.state.locked) {
        this.scrollToLineEdge(edge);
      }
    }

    this.setState(prevState => {
      const faqSelected = edge ? null : prevState.faqSelected;
      const moduleLibSelected = edge ? null : prevState.moduleLibSelected;
      const chatbotSelected = edge ? null : prevState.chatbotSelected;

      return {
        selected: edge,
        faqSelected,
        moduleLibSelected,
        chatbotSelected,
      };
    });
  };

  onCreateEdge = (sourceNode: INode, targetNode: INode) => {
    this.linkEdge(sourceNode, targetNode);
  };

  onSwapEdge = (sourceNode: INode, targetNode: INode, edge: IEdge) => {
    this.linkEdge(sourceNode, targetNode, edge);
  };

  onDeleteEdge = (selectedEdge: IEdge, edges: IEdge[]) => {
    this.changeJson(json => {
      const nodeJson = json[selectedEdge.source];

      const connections = nodeJson.question.connections;

      // if (connections) {
      nodeJson.question.connections = connections.filter(connection => {
        return connection.goto !== selectedEdge.target;
      });
      // } else {
      //   delete sourceNodeBwdl.Next;
      // }

      return null;
    });
  };

  onUndo = () => this.state.editor.undo();

  onRedo = () => this.state.editor.redo();

  onCopySelectedNode = () => {
    const { selected, bwdlJson } = this.state;

    if (!selected) {
      return;
    }

    const original = bwdlJson[selected.title];
    const copiedNode = JSON.parse(JSON.stringify(original));

    this.setState({
      copiedNode,
      copiedEdge: null,
    });
  };

  onCopySelectedEdge = () => {
    const { selected } = this.state;

    if (!selected) {
      return;
    }

    const original = selected;
    const copiedEdge = JSON.parse(JSON.stringify(original));

    this.setState({
      copiedEdge,
      copiedNode: null,
    });
  };

  getFilterKeys = filters =>
    Object.keys(filters).map(filter =>
      filter.substr(0, filter.lastIndexOf('_'))
    );

  getPrevContextVars = edge => {
    const { bwdlJson: json } = this.state;
    const vars = new Set();

    this.getAncestorIndexes(edge.source, edge => {
      edge.conns
        .map(c => Object.keys(c.setContext))
        .flat()
        .forEach(vars.add, vars);
    });
    this.getAncestorIndexes(edge.target)
      .filter(i => json[i].Type === 'Module')
      .map(i => json[i].slotContextVars)
      .flat()
      .forEach(vars.add, vars);

    return Array.from(vars);
  };

  validateFilterKeys = (filterName, filters, validKeys) => {
    let keys = filters.map(filters => this.getFilterKeys(filters)).flat();

    keys = keys.filter(k => !validKeys.includes(k));

    if (keys.length) {
      throw new Error(`${filterName} filters contain invalid keys: ${keys}`);
    }
  };

  validatePasteEdge = (question, copiedEdge) => {
    this.validateFilterKeys(
      'Answer',
      copiedEdge.conns.map(conn => conn.answers).flat(),
      this.getAncestorIndexes(question.index)
    );
    this.validateFilterKeys(
      'Context',
      copiedEdge.conns.map(conn => conn.context).flat(),
      this.getPrevContextVars(question.index)
    );
  };

  getAvailableIndex = (json, index, prefix) => {
    for (let k = 0; k < 100; k++) {
      const newIndex = `${index}${k > 0 ? prefix || '' : ''}${k ? k : ''}`;

      if (!json[newIndex]) {
        return { count: k, newIndex: newIndex };
      }
    }

    return { count: 1, newIndex: `${index}-${makeid(2)}` };
  };

  getClonedIndex = (json, index) => {
    return this.getAvailableIndex(json, index, '-clone');
  };

  onPasteSelected = (x, y) => {
    const { copiedNode, copiedEdge, selected } = this.state;

    if (copiedNode) {
      const index = copiedNode.question.index;

      this.changeJson(json => {
        const { count, newIndex } = this.getClonedIndex(json, index);
        const clonedNode = JSON.parse(JSON.stringify(copiedNode));

        clonedNode.question.index = newIndex;
        clonedNode.question.connections = [];
        clonedNode.x += count * 100;
        clonedNode.y += count * 50;
        json[newIndex] = clonedNode;
      });
    } else if (copiedEdge && selected.source) {
      const index = selected.source;

      this.changeJson(json => {
        const question = json[index].question;

        this.validatePasteEdge(question, copiedEdge);

        copiedEdge.conns.forEach(c => {
          c.goto = selected.target;
          c.isDefault = false;
        });

        copiedEdge.conns.forEach(c => {
          c.goto = selected.target;
          c.isDefault = false;
        });

        question.connections = question.connections
          .filter(c => c.goto !== selected.target)
          .concat(copiedEdge.conns);
      });
    }
  };

  updateSelected = (newState, selected) => {
    if (selected) {
      if (selected.gnode) {
        selected = newState.nodes.find(
          node => node.gnode.question.index === selected.gnode.question.index
        );
      } else if (selected.source) {
        selected = newState.edges.find(
          edge =>
            edge.source === selected.source && edge.target === selected.target
        );

        if (selected) {
          selected.targetNode = this.state.nodes.find(
            node => node.title === selected.target
          );
        }
      }
    }

    newState.selected = selected;
  };

  updatedState = (json, text, selected) => {
    const transformed = FlowV1Transformer.transform(json);
    const newState = {
      bwdlJson: json,
      bwdlText: text,
      edges: transformed.edges,
      nodes: transformed.nodes,
      syncError: false,
    };

    this.updateSelected(newState, selected);
    this.props.onJsonTextChange(text);

    return newState;
  };

  updatedStateFromJson = (json, selected) =>
    this.updatedState(json, this.stringify(json), selected);

  updatedStateFromText = (text, selected) => {
    try {
      return this.updatedState(JSON.parse(text), text, selected);
    } catch (e) {
      // on json parse error, still update the text, and only the text
      if (e instanceof SyntaxError) {
        return { bwdlText: text, syncError: true };
      } else {
        throw e;
      }
    }
  };

  changeText = text => {
    this.setState(prevState => {
      try {
        return this.updatedStateFromText(text, prevState.selected);
      } catch (e) {
        this.alert.error(e.message);
      }
    });
  };

  handleTextAreaChange = (value: string, event: any) => {
    this.changeText(value);
  };

  handleChangeLayoutEngineType = (event: any) => {
    this.setState({
      layoutEngineType: (event.target.value: LayoutEngineType | 'None'),
    });
  };

  handleToggleLock = e => {
    this.setState({ locked: !this.state.locked });
  };

  extractTextFromBlock = (
    row,
    blockStartRegex,
    blockEndRegex,
    lineIncludes,
    lineExtractRegex
  ) => {
    const lines = this.state.bwdlText.split('\n');
    const findStartIndex = lines
      .slice(0, row + 1)
      .reverse()
      .findIndex(line => blockStartRegex.test(line));

    if (findStartIndex === -1) {
      return -1;
    }

    const nodeStartRow = row - findStartIndex;
    const findEndIndex = lines
      .slice(row)
      .findIndex(line => blockEndRegex.test(line));

    if (findEndIndex === -1) {
      return -1;
    }

    const nodeEndRow = row + findEndIndex;
    const indexLine = lines
      .slice(nodeStartRow, nodeEndRow)
      .find(l => l.includes(lineIncludes));

    const match = lineExtractRegex.exec(indexLine);

    return match[1];
  };

  nodeIndexForRow = row => {
    return this.extractTextFromBlock(
      row,
      nodeStartLineRegex,
      nodeEndLineRegex,
      `"index": "`,
      indexNameRegex
    );
  };

  gotoIndexForRow = row => {
    const lines = this.state.bwdlText.split('\n');
    const prevLines = lines.slice(0, row).reverse();
    const startIndex = prevLines.findIndex(line =>
      connsStartLineRegex.test(line)
    );

    if (startIndex === -1) {
      return -1;
    }

    const nNoConnsIndex = prevLines.findIndex(line =>
      noConnsLineRegex.test(line)
    );

    if (nNoConnsIndex !== -1 && nNoConnsIndex <= startIndex) {
      return -1;
    }

    const endIndex = prevLines.findIndex(line => connsEndLineRegex.test(line));

    if (endIndex != -1 && endIndex < startIndex) {
      return -1;
    }

    // inside connections block
    return this.extractTextFromBlock(
      row,
      connStartLineRegex,
      connEndLineRegex,
      `"goto": "`,
      gotoIndexRegex
    );
  };

  handleCursorChanged = selection => {
    if (this.state.locked && this.GraphView) {
      const nodeIndex = this.nodeIndexForRow(selection.getCursor().row);

      if (nodeIndex !== -1) {
        let selected = null;
        const gotoIndex = this.gotoIndexForRow(selection.getCursor().row);

        if (gotoIndex !== -1) {
          this.GraphView.panToEdge(nodeIndex, gotoIndex);
          selected = this.state.edges.find(
            edge => edge.source == nodeIndex && edge.target == gotoIndex
          );
          selected.targetNode = this.state.nodes.find(
            node => node.title === gotoIndex
          );
        } else {
          this.GraphView.panToNode(nodeIndex);
          selected = this.state.nodes.find(node => node.title === nodeIndex);
        }

        this.setState({
          selected: selected,
        });
      }
    }
  };

  onload = editor => {
    editor.setAutoScrollEditorIntoView(true);
    this.setState({ editor: editor });
  };

  changeJson = f =>
    new Promise((resolve, reject) =>
      this.setState(
        prevState => {
          const json = {
            ...prevState.bwdlJson,
          };

          try {
            let selected = f(json, prevState);

            if (selected === undefined) {
              selected = prevState.selected;
            }

            return this.updatedStateFromJson(json, selected);
          } catch (err) {
            reject(err);

            return {};
          }
        },
        () => resolve()
      )
    );

  changeSelectedNode = f => {
    const index = this.state.selected.gnode.question.index;

    this.changeJson(json => f(json[index], index, json));
  };

  changeSelectedQuestion = f => {
    const index = this.state.selected.gnode.question.index;

    this.changeJson(json => f(json[index].question));
  };

  getAncestorIndexes = (index, edgeCallback) => {
    const ancestorIndexes = new Set();

    let prevSize = -1;

    while (ancestorIndexes.size > prevSize) {
      prevSize = ancestorIndexes.size;
      this.state.edges.forEach(edge => {
        if (ancestorIndexes.has(edge.target) || edge.target === index) {
          ancestorIndexes.add(edge.source);

          if (edgeCallback) {
            edgeCallback(edge);
          }
        }
      });
    }

    return Array.from(ancestorIndexes);
  };

  bdsTraverseFrom = ({ startIndex, f, flowJson }) => {
    const { bwdlJson } = this.state;

    flowJson = flowJson || bwdlJson;
    const exploreQueue = [startIndex];
    const visited = [];

    while (exploreQueue.length) {
      const nodeIndex = exploreQueue.shift();

      try {
        if (f) {
          f(startIndex);
        }

        visited.push(nodeIndex);
        flowJson[nodeIndex].question.connections.forEach(c => {
          if (!visited.includes(c.goto) && !exploreQueue.includes(c.goto)) {
            exploreQueue.push(c.goto);
          }
        });
      } catch (err) {
        throw new Error(
          `Error traversing node ${nodeIndex}: ${getErrorMessage(err)}`
        );
      }
    }

    return visited;
  };

  bdsTraverse = ({ f, flowJson } = {}) => {
    const { bwdlJson } = this.state;

    flowJson = flowJson || bwdlJson;
    const { current: startIndex } = flowJson;

    return startIndex ? this.bdsTraverseFrom({ startIndex, f, flowJson }) : [];
  };

  getIncomingEdgeIndexes = index => {
    return this.state.edges.filter(e => e.target == index).map(e => e.source);
  };

  handleFaqClicked = () => {
    if (!this.faqEnabled()) {
      return;
    }

    this.setState(prevState => {
      const faqSelected = !prevState.faqSelected;
      const selected = faqSelected ? null : prevState.selected;
      const moduleLibSelected = faqSelected
        ? null
        : prevState.moduleLibSelected;
      const chatbotSelected = faqSelected ? null : prevState.chatbotSelected;

      return {
        faqSelected,
        moduleLibSelected,
        selected,
        chatbotSelected,
      };
    });
  };

  handleModuleLibClicked = () => {
    this.setState(prevState => {
      const moduleLibSelected = !prevState.moduleLibSelected;
      const selected = moduleLibSelected ? null : prevState.selected;
      const faqSelected = moduleLibSelected ? null : prevState.faqSelected;
      const chatbotSelected = moduleLibSelected
        ? null
        : prevState.chatbotSelected;

      return {
        faqSelected,
        moduleLibSelected,
        selected,
        chatbotSelected,
      };
    });
  };

  handleChatbotClicked = () => {
    this.setState(prevState => {
      const chatbotSelected = !prevState.chatbotSelected;
      const selected = chatbotSelected ? null : prevState.selected;
      const faqSelected = chatbotSelected ? null : prevState.faqSelected;
      const moduleLibSelected = chatbotSelected
        ? null
        : prevState.moduleLibSelected;

      return {
        faqSelected,
        moduleLibSelected,
        selected,
        chatbotSelected,
      };
    });
  };

  moduleLibClasses = () => {
    const classes = ['svg-inline--fa', 'fa-project-diagram', 'fa-w-20'];
    const { moduleLibSelected } = this.state;

    const classNames = [
      'enabled',
      ...classes,
      ...(moduleLibSelected ? ['selected'] : []),
    ];

    return GraphUtils.classNames(classNames);
  };

  chatbotClasses = () =>
    GraphUtils.classNames([
      'enabled',
      ...(this.state.chatbotSelected ? ['selected'] : []),
    ]);

  faqEnabled = () => !this.isModule();

  faqClasses = () =>
    GraphUtils.classNames([
      ...(this.state.faqSelected ? ['selected'] : []),
      ...(this.faqEnabled() ? ['enabled'] : []),
    ]);

  renderTextEditor() {
    const { locked, syncError, bwdlText } = this.state;

    return (
      <Sidebar
        direction="left"
        size={'100%'}
        locked={locked}
        onLockChanged={this.handleToggleLock}
        refx={this.sidebarRef}
        syncError={syncError}
      >
        <div>
          <AceEditor
            mode="json"
            theme="monokai"
            onChange={this.handleTextAreaChange}
            name="bwdl-editor"
            width="100%"
            height="100%"
            fontSize={10}
            editorProps={{ $blockScrolling: Infinity }}
            highlightActiveLine={true}
            onLoad={this.onload}
            onCursorChange={this.handleCursorChanged}
            showPrintMargin={true}
            showGutter={true}
            setOptions={{
              showLineNumbers: true,
              tabSize: 2,
            }}
            value={bwdlText}
            wrapEnabled={true}
          />
        </div>
      </Sidebar>
    );
  }

  renderGraph() {
    const { nodes, edges, selected } = this.state;
    const { NodeTypes, NodeSubtypes, EdgeTypes } = GraphConfig;

    return (
      <div className="d-flex flex-grow-1 flex-shrink-1 flex-fill w-100">
        <div className="layout-engine">
          <span>Layout:</span>
          <select
            name="layout-engine-type"
            onChange={this.handleChangeLayoutEngineType}
            value={this.state.layoutEngineType}
          >
            <option value={undefined}>None</option>
            <option value={'SnapToGrid'}>Snap to Grid</option>
            <option value={'VerticalTree'}>Vertical Tree</option>
            <option value={'HorizontalTree'}>Horizontal Tree</option>
          </select>
        </div>
        <GraphView
          ref={el => (this.GraphView = el)}
          nodeKey={NODE_KEY}
          nodes={nodes}
          edges={edges}
          selected={selected}
          minZoom={0.05}
          nodeTypes={NodeTypes}
          nodeSubtypes={NodeSubtypes}
          edgeTypes={EdgeTypes}
          onSelectNode={this.onSelectNode}
          onCreateNode={this.onCreateNode}
          onUpdateNode={this.onUpdateNode}
          onDeleteNode={this.onDeleteNode}
          onSelectEdge={this.onSelectEdge}
          onCreateEdge={this.onCreateEdge}
          onSwapEdge={this.onSwapEdge}
          onDeleteEdge={this.onDeleteEdge}
          onUndo={this.onUndo}
          onRedo={this.onRedo}
          onCopySelectedNode={this.onCopySelectedNode}
          onCopySelectedEdge={this.onCopySelectedEdge}
          onPasteSelected={this.onPasteSelected}
          layoutEngineType={this.state.layoutEngineType}
        />
        <div id="sectionBtnMenu">
          <svg
            id="chatbot"
            className={`sectionBtn ${this.chatbotClasses()}`}
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            x="0px"
            y="0px"
            viewBox="0 0 100 125"
            enableBackground="new 0 0 100 100"
            onClick={this.handleChatbotClicked}
          >
            <g display="none">
              <rect
                x="-574.249"
                y="-277.244"
                display="inline"
                fill="#000000"
                width="1345.273"
                height="1337.592"
              />
            </g>
            <g>
              <g>
                <path d="M4.825,78.18c0,5.699,1.734,11.171,5.015,15.826l0.448,0.636h44.089l0.448-0.636c3.281-4.655,5.015-10.127,5.015-15.826    c0-5.362-1.548-10.366-4.211-14.601v0.134h-3.531c2.978,4.058,4.742,9.06,4.742,14.467c0,4.82-1.392,9.457-4.034,13.462H11.858    C9.217,87.637,7.825,83,7.825,78.18c0-13.514,10.994-24.508,24.508-24.508c0.988,0,1.96,0.065,2.917,0.18v-3.023    c-0.959-0.102-1.932-0.156-2.917-0.156C17.165,50.671,4.825,63.012,4.825,78.18z" />
                <path d="M32.333,87.81c10.638,0,19.262-8.624,19.262-19.262H13.071C13.071,79.187,21.695,87.81,32.333,87.81z M39.936,76.552    c1.149,0,2.212,0.382,2.994,1.077c0.867,0.77,1.325,1.891,1.325,3.241h-8.636C35.618,77.887,37.786,76.552,39.936,76.552z     M24.73,76.552c1.149,0,2.212,0.382,2.993,1.077c0.867,0.77,1.325,1.891,1.325,3.241h-8.636    C20.412,77.887,22.581,76.552,24.73,76.552z" />
                <path d="M95.175,13.915c0-4.718-3.838-8.556-8.556-8.556H18.417c-4.718,0-8.556,3.838-8.556,8.556v26.543    c0,4.718,3.838,8.556,8.556,8.556H35.25h11.023l0.851,9.992l2.187-1.724c0.177-0.14,3.236-2.557,6.319-5.367    c1.039-0.947,2.081-1.938,3.016-2.902h27.974c4.718,0,8.556-3.838,8.556-8.556V13.915z M92.175,40.458    c0,3.063-2.493,5.556-5.556,5.556H57.356l-0.444,0.472c-2.184,2.319-5.235,4.96-7.276,6.661l-0.607-7.132H18.417    c-3.063,0-5.556-2.493-5.556-5.556V13.915c0-3.063,2.493-5.556,5.556-5.556h68.202c3.063,0,5.556,2.493,5.556,5.556V40.458z" />
                <circle cx="65.37" cy="27.2" r="3.417" />
                <circle cx="52.069" cy="27.2" r="3.417" />
                <circle cx="38.769" cy="27.2" r="3.417" />
              </g>
            </g>
          </svg>
          <svg
            id="moduleLib"
            aria-hidden="true"
            data-prefix="fas"
            data-icon="project-diagram"
            className={`sectionBtn ${this.moduleLibClasses()}`}
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 512"
            onClick={this.handleModuleLibClicked}
          >
            <path d="M384 320H256c-17.67 0-32 14.33-32 32v128c0 17.67 14.33 32 32 32h128c17.67 0 32-14.33 32-32V352c0-17.67-14.33-32-32-32zM192 32c0-17.67-14.33-32-32-32H32C14.33 0 0 14.33 0 32v128c0 17.67 14.33 32 32 32h95.72l73.16 128.04C211.98 300.98 232.4 288 256 288h.28L192 175.51V128h224V64H192V32zM608 0H480c-17.67 0-32 14.33-32 32v128c0 17.67 14.33 32 32 32h128c17.67 0 32-14.33 32-32V32c0-17.67-14.33-32-32-32z"></path>
          </svg>
          <svg
            id="faq"
            className={`sectionBtn ${this.faqClasses()}`}
            height="681pt"
            viewBox="-21 -97 681.33466 681"
            width="681pt"
            xmlns="http://www.w3.org/2000/svg"
            onClick={this.handleFaqClicked}
          >
            <path d="m604.726562-4.988281h-570.535156c-18.804687 0-34.1093748 15.296875-34.1093748 34.105469v347.863281c0 18.804687 15.3046878 34.105469 34.1093748 34.105469h47.070313l37.6875 55.691406c9.628906 14.230468 29.042969 19.148437 44.257812 11.050781 4.246094-2.261719 7.96875-5.433594 10.914063-9.230469l44.710937-57.511718h249.574219c16.160156 0 16.183594-25.167969 0-25.167969h-255.730469c-3.882812 0-7.554687 1.792969-9.9375 4.855469l-48.488281 62.375c-3.675781 4.726562-11.105469 4.476562-14.453125-.476563l-41.429687-61.222656c-2.339844-3.460938-6.246094-5.53125-10.421876-5.53125h-53.753906c-4.925781 0-8.9375-4.011719-8.9375-8.9375v-347.863281c0-4.925782 4.011719-8.9375 8.9375-8.9375h570.535156c4.925782 0 8.933594 4.011718 8.933594 8.9375v347.863281c0 4.925781-4.007812 8.9375-8.933594 8.9375h-35.019531c-16.125 0-16.15625 25.167969 0 25.167969h35.019531c18.804688 0 34.109376-15.300782 34.109376-34.105469v-347.863281c0-18.808594-15.304688-34.105469-34.109376-34.105469zm0 0" />
            <path d="m238.183594 110.011719c12.15625 0 12.191406-23.261719 0-23.261719h-101.898438c-5.4375 0-11.625 3.132812-11.625 9.3125v194.527344c0 12.203125 25.570313 12.1875 25.570313 0v-86.789063h44.53125c12.023437 0 11.984375-21.523437 0-21.523437h-44.53125v-72.265625zm0 0" />
            <path d="m230.386719 296.628906c5.695312 3.511719 17.019531 5.261719 19.558593-3.085937l12.558594-42.269531h75.660156l12.605469 42.4375c3.636719 11.441406 26.835938 4.992187 24.671875-6.503907l-59.476562-193.234375c-3.699219-12.308594-27.011719-12.347656-30.714844-.066406l-59.242188 192.433594c-1.382812 4.125.71875 8.03125 4.378907 10.289062 3.214843 1.984375-3.3125-2.039062 0 0 5.695312 3.511719-3.3125-2.039062 0 0zm38.511719-66.875 31.550781-106.210937 31.355469 106.210937zm0 0" />
            <path d="m454.863281 329.21875c6.007813 5.445312 15.8125 1.207031 15.8125-6.953125v-21.535156c16.222657-1.230469 29.308594-7.011719 38.910157-17.1875 9.714843-10.304688 14.644531-25.746094 14.644531-45.890625v-87.15625c0-21.894532-5.820313-38.171875-17.292969-48.386719-23.6875-21.066406-67.941406-21.214844-91.585938.007813-11.375 10.207031-17.144531 26.484374-17.144531 48.378906v87.15625c0 20.34375 4.929688 35.835937 14.648438 46.039062 9.601562 10.074219 22.78125 15.8125 39.195312 17.039063v21.535156c-.078125 2.738281.863281 5.058594 2.8125 6.953125 1.453125 1.324219-1.480469-1.339844 0 0 2.835938 2.570312-1.867187-1.6875 0 0 6.007813 5.445312-1.867187-1.6875 0 0zm12.988281-77.996094c-5.945312-5.046875-15.800781-1.296875-15.800781 6.828125v19.351563c-18.757812-3.246094-28.269531-16.480469-28.269531-39.339844v-87.4375c0-27.328125 12.203125-40.613281 37.296875-40.613281 24.65625 0 37.582031 17.117187 37.582031 40.613281v87.4375c0 23.050781-9.417968 36.1875-27.984375 39.0625v-19.070312c0-2.953126-1.082031-5.402344-3.355469-7.277344.363282.296875.71875.601562 1.074219.910156-1.507812-1.316406-1.402343-1.195312-.542969-.464844-2.640624-2.246094.648438.550782 0 0-2.960937-2.511718 1.875 1.597656 0 0zm0 0" />
            <path d="m518.738281 386.589844c-6.734375 0-12.480469 5.628906-12.570312 12.367187-.085938 6.972657 5.640625 12.753907 12.597656 12.761719 6.941406.011719 12.691406-5.910156 12.542969-12.84375-.136719-6.691406-5.894532-12.285156-12.570313-12.285156zm0 0" />
          </svg>
        </div>
      </div>
    );
  }

  render() {
    const { flowName } = this.props;
    const {
      faqSelected,
      moduleLibSelected,
      chatbotSelected,
      bwdlText,
    } = this.state;

    return (
      <div
        id="bwdl-editable-graph"
        className="d-flex flex-grow-1 flex-shrink-1 flex-fill w-100"
      >
        <Helmet>
          <meta charSet="utf-8" />
          <title>{flowName || 'unnamed'}</title>
        </Helmet>
        {/*<div className="d-flex flex-fill flex-grow-1 flex-shrink-1 w-100">{this.renderTextEditor()}</div>*/}

        <ReflexContainer orientation="vertical">
          <ReflexElement
            onResize={() => this.state.editor.resize()}
            minSize="100"
            maxSize="500"
            className="left-pane"
          >
            {this.renderTextEditor()}
          </ReflexElement>

          <ReflexSplitter propagate={true} />

          <ReflexElement
            className="middle-pane d-flex flex-shrink-1 "
            flex={0.55}
            minSize="500"
          >
            <div className="graph-container d-flex flex-grow-1 flex-shrink-1 flex-fill w-100">
              {this.renderGraph()}
            </div>
          </ReflexElement>

          <ReflexSplitter propagate={true} />

          <ReflexElement
            minSize="300"
            flex={0.3}
            maxSize="800"
            className="right-pane"
            propagateDimensions={true}
          >
            <div id="rightBar">
              <RightEditor
                chatbotHandlers={this.chatbotHandlers}
                nodeHandlers={this.nodeHandlers}
                edgeHandlers={this.edgeHandlers}
                faqHandlers={this.faqHandlers}
                faqMode={faqSelected}
                chatbotMode={chatbotSelected}
                moduleLibMode={moduleLibSelected}
                moduleConfigHandlers={this.moduleConfigHandlers}
                bwdlText={bwdlText}
                flowName={flowName}
              >
                {this.state.selected}
              </RightEditor>
            </div>
          </ReflexElement>
        </ReflexContainer>
      </div>
    );
  }
}

export default withAlert()(BwdlEditable);
