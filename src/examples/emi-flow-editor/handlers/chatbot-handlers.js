const getChatbotHandlers = bwdlEditable => {
  bwdlEditable.getOderedIndexesWithOptions = function() {
    const { bwdlJson: json } = this.state;

    return this.bdsTraverse().map(index => ({
      index,
      options: json[index].question.quickReplies,
    }));
  }.bind(bwdlEditable);

  bwdlEditable.onIndexFocus = function(nodeIndex) {
    this.GraphView.panToNode(nodeIndex);
  }.bind(bwdlEditable);

  return bwdlEditable;
};

export default getChatbotHandlers;
