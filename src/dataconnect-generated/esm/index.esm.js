import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'abradacaone',
  location: 'us-east4'
};

export const addCategoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddCategory', inputVars);
}
addCategoryRef.operationName = 'AddCategory';

export function addCategory(dcOrVars, vars) {
  return executeMutation(addCategoryRef(dcOrVars, vars));
}

export const listImagesByCategoryRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListImagesByCategory', inputVars);
}
listImagesByCategoryRef.operationName = 'ListImagesByCategory';

export function listImagesByCategory(dcOrVars, vars) {
  return executeQuery(listImagesByCategoryRef(dcOrVars, vars));
}

export const addToCartRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'AddToCart', inputVars);
}
addToCartRef.operationName = 'AddToCart';

export function addToCart(dcOrVars, vars) {
  return executeMutation(addToCartRef(dcOrVars, vars));
}

export const getUserProfileRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetUserProfile', inputVars);
}
getUserProfileRef.operationName = 'GetUserProfile';

export function getUserProfile(dcOrVars, vars) {
  return executeQuery(getUserProfileRef(dcOrVars, vars));
}

