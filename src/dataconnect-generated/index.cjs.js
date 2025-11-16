const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'abradacaone',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const addCategoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddCategory', inputVars);
}
addCategoryRef.operationName = 'AddCategory';
exports.addCategoryRef = addCategoryRef;

exports.addCategory = function addCategory(dcOrVars, vars) {
  return executeMutation(addCategoryRef(dcOrVars, vars));
};

const listImagesByCategoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListImagesByCategory', inputVars);
}
listImagesByCategoryRef.operationName = 'ListImagesByCategory';
exports.listImagesByCategoryRef = listImagesByCategoryRef;

exports.listImagesByCategory = function listImagesByCategory(dcOrVars, vars) {
  return executeQuery(listImagesByCategoryRef(dcOrVars, vars));
};

const addToCartRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddToCart', inputVars);
}
addToCartRef.operationName = 'AddToCart';
exports.addToCartRef = addToCartRef;

exports.addToCart = function addToCart(dcOrVars, vars) {
  return executeMutation(addToCartRef(dcOrVars, vars));
};

const getUserProfileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserProfile', inputVars);
}
getUserProfileRef.operationName = 'GetUserProfile';
exports.getUserProfileRef = getUserProfileRef;

exports.getUserProfile = function getUserProfile(dcOrVars, vars) {
  return executeQuery(getUserProfileRef(dcOrVars, vars));
};
