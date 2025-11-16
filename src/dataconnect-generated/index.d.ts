import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface AddCategoryData {
  category_insert: Category_Key;
}

export interface AddCategoryVariables {
  name: string;
  description?: string | null;
}

export interface AddToCartData {
  cartItem_insert: CartItem_Key;
}

export interface AddToCartVariables {
  userId: UUIDString;
  imageId: UUIDString;
  quantity: number;
}

export interface CartItem_Key {
  userId: UUIDString;
  imageId: UUIDString;
  __typename?: 'CartItem_Key';
}

export interface Category_Key {
  id: UUIDString;
  __typename?: 'Category_Key';
}

export interface GetUserProfileData {
  user?: {
    id: UUIDString;
    displayName: string;
    email: string;
    photoUrl?: string | null;
    bio?: string | null;
  } & User_Key;
}

export interface GetUserProfileVariables {
  id: UUIDString;
}

export interface Image_Key {
  id: UUIDString;
  __typename?: 'Image_Key';
}

export interface ListImagesByCategoryData {
  images: ({
    id: UUIDString;
    title: string;
    imageUrl: string;
    price: number;
  } & Image_Key)[];
}

export interface ListImagesByCategoryVariables {
  category: string;
}

export interface OrderItem_Key {
  orderId: UUIDString;
  imageId: UUIDString;
  __typename?: 'OrderItem_Key';
}

export interface Order_Key {
  id: UUIDString;
  __typename?: 'Order_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface AddCategoryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddCategoryVariables): MutationRef<AddCategoryData, AddCategoryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AddCategoryVariables): MutationRef<AddCategoryData, AddCategoryVariables>;
  operationName: string;
}
export const addCategoryRef: AddCategoryRef;

export function addCategory(vars: AddCategoryVariables): MutationPromise<AddCategoryData, AddCategoryVariables>;
export function addCategory(dc: DataConnect, vars: AddCategoryVariables): MutationPromise<AddCategoryData, AddCategoryVariables>;

interface ListImagesByCategoryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListImagesByCategoryVariables): QueryRef<ListImagesByCategoryData, ListImagesByCategoryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListImagesByCategoryVariables): QueryRef<ListImagesByCategoryData, ListImagesByCategoryVariables>;
  operationName: string;
}
export const listImagesByCategoryRef: ListImagesByCategoryRef;

export function listImagesByCategory(vars: ListImagesByCategoryVariables): QueryPromise<ListImagesByCategoryData, ListImagesByCategoryVariables>;
export function listImagesByCategory(dc: DataConnect, vars: ListImagesByCategoryVariables): QueryPromise<ListImagesByCategoryData, ListImagesByCategoryVariables>;

interface AddToCartRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddToCartVariables): MutationRef<AddToCartData, AddToCartVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AddToCartVariables): MutationRef<AddToCartData, AddToCartVariables>;
  operationName: string;
}
export const addToCartRef: AddToCartRef;

export function addToCart(vars: AddToCartVariables): MutationPromise<AddToCartData, AddToCartVariables>;
export function addToCart(dc: DataConnect, vars: AddToCartVariables): MutationPromise<AddToCartData, AddToCartVariables>;

interface GetUserProfileRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserProfileVariables): QueryRef<GetUserProfileData, GetUserProfileVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUserProfileVariables): QueryRef<GetUserProfileData, GetUserProfileVariables>;
  operationName: string;
}
export const getUserProfileRef: GetUserProfileRef;

export function getUserProfile(vars: GetUserProfileVariables): QueryPromise<GetUserProfileData, GetUserProfileVariables>;
export function getUserProfile(dc: DataConnect, vars: GetUserProfileVariables): QueryPromise<GetUserProfileData, GetUserProfileVariables>;

