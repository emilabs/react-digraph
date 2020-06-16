const getEdgeHandlers = bwdlEditable => {
  bwdlEditable.getFilterItems = function(filters) {
    return Object.keys(filters).map(key => ({
      key: key.substr(0, key.lastIndexOf('_')),
      op: key.substr(key.lastIndexOf('_') + 1),
      value: filters[key],
    }));
  }.bind(bwdlEditable);

  bwdlEditable.setSelectedConnIndex = function(connIndex) {
    this._changeSelectedConn((conn, nodeConns, edgeConns) => {
      conn.isSelected = false;
      edgeConns[connIndex].isSelected = true;
    });
  }.bind(bwdlEditable);

  bwdlEditable.getSelectedConnIndex = function() {
    const index = this.state.selected.conns.findIndex(c => c.isSelected);

    return index == -1 ? 0 : index;
  }.bind(bwdlEditable);

  bwdlEditable.onDeleteSelectedEdgeConn = function() {
    if (this.state.selected.conns.length > 1) {
      this._changeSelectedConn((conn, nodeConns, edgeConns) => {
        const newSelectedConnIndex = Math.max(
          this.getSelectedConnIndex() - 1,
          0
        );

        nodeConns.splice(nodeConns.indexOf(conn), 1);
        edgeConns[newSelectedConnIndex].isSelected = true;
      });
    }
  }.bind(bwdlEditable);

  bwdlEditable.newEdgeConn = function() {
    const targetIndex = this.state.selected.targetNode.gnode.question.index;

    this._changeSelectedConn((conn, nodeConns) => {
      conn.isSelected = false;
      nodeConns.push({
        goto: targetIndex,
        isString: '',
        isDefault: false,
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
        isSelected: true,
      });
    });
  }.bind(bwdlEditable);

  bwdlEditable._changeSelectedConn = function(f) {
    const index = this.state.selected.sourceNode.gnode.question.index;
    const targetIndex = this.state.selected.targetNode.gnode.question.index;

    this.changeJson(json => {
      const nodeConns = json[index].question.connections;
      const edgeConns = nodeConns.filter(c => c.goto == targetIndex);
      const conn = edgeConns[this.getSelectedConnIndex()];

      f(
        conn,
        nodeConns,
        edgeConns
        // json,
        // index,
        // targetIndex
      );
    });
  }.bind(bwdlEditable);

  bwdlEditable.onChangeConn = function(connProperty, newValue) {
    this._changeSelectedConn(conn => (conn[connProperty] = newValue));
  }.bind(bwdlEditable);

  bwdlEditable.onMakeDefaultConn = function(enabling) {
    this._changeSelectedConn((conn, nodeConns) => {
      if (enabling) {
        const defaultConn = nodeConns.find(conn => conn.isDefault);

        if (defaultConn) {
          defaultConn.isDefault = false;
        }

        // clear conn conditions
        Object.assign(conn, {
          isString: '',
          answers: {},
          containsAny: [],
          context: {},
          greaterThan: '',
          inArray: [],
          isNotString: '',
          lessThan: '',
          notInArray: [],
          nlp: {},
        });
      }

      conn.isDefault = enabling;
    });
  }.bind(bwdlEditable);

  bwdlEditable.getPrevAnswerIndexes = function() {
    const { bwdlJson: json } = this.state;

    return this.getAncestorIndexes(this.state.selected.source).filter(
      i => json[i].Type !== 'Module'
    );
  }.bind(bwdlEditable);

  bwdlEditable.getSourceNodeIntents = function() {
    return Object.keys(
      this.state.selected.sourceNode.gnode.ai.prediction_data.intent_responses
    );
  }.bind(bwdlEditable);

  bwdlEditable.getSelectedEdgePrevContextVars = function() {
    return this.getPrevContextVars(this.state.selected);
  }.bind(bwdlEditable);

  return bwdlEditable;
};

export default getEdgeHandlers;
