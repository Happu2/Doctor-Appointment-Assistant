const contextStore = new Map();

function storeContext(conversationId, context) {
  contextStore.set(conversationId, context);
}

function retrieveContext(conversationId) {
  return contextStore.get(conversationId) || {};
}

module.exports = { storeContext, retrieveContext };