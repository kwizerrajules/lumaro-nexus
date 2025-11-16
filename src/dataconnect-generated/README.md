# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListImagesByCategory*](#listimagesbycategory)
  - [*GetUserProfile*](#getuserprofile)
- [**Mutations**](#mutations)
  - [*AddCategory*](#addcategory)
  - [*AddToCart*](#addtocart)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListImagesByCategory
You can execute the `ListImagesByCategory` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listImagesByCategory(vars: ListImagesByCategoryVariables): QueryPromise<ListImagesByCategoryData, ListImagesByCategoryVariables>;

interface ListImagesByCategoryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListImagesByCategoryVariables): QueryRef<ListImagesByCategoryData, ListImagesByCategoryVariables>;
}
export const listImagesByCategoryRef: ListImagesByCategoryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listImagesByCategory(dc: DataConnect, vars: ListImagesByCategoryVariables): QueryPromise<ListImagesByCategoryData, ListImagesByCategoryVariables>;

interface ListImagesByCategoryRef {
  ...
  (dc: DataConnect, vars: ListImagesByCategoryVariables): QueryRef<ListImagesByCategoryData, ListImagesByCategoryVariables>;
}
export const listImagesByCategoryRef: ListImagesByCategoryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listImagesByCategoryRef:
```typescript
const name = listImagesByCategoryRef.operationName;
console.log(name);
```

### Variables
The `ListImagesByCategory` query requires an argument of type `ListImagesByCategoryVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListImagesByCategoryVariables {
  category: string;
}
```
### Return Type
Recall that executing the `ListImagesByCategory` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListImagesByCategoryData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListImagesByCategoryData {
  images: ({
    id: UUIDString;
    title: string;
    imageUrl: string;
    price: number;
  } & Image_Key)[];
}
```
### Using `ListImagesByCategory`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listImagesByCategory, ListImagesByCategoryVariables } from '@dataconnect/generated';

// The `ListImagesByCategory` query requires an argument of type `ListImagesByCategoryVariables`:
const listImagesByCategoryVars: ListImagesByCategoryVariables = {
  category: ..., 
};

// Call the `listImagesByCategory()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listImagesByCategory(listImagesByCategoryVars);
// Variables can be defined inline as well.
const { data } = await listImagesByCategory({ category: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listImagesByCategory(dataConnect, listImagesByCategoryVars);

console.log(data.images);

// Or, you can use the `Promise` API.
listImagesByCategory(listImagesByCategoryVars).then((response) => {
  const data = response.data;
  console.log(data.images);
});
```

### Using `ListImagesByCategory`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listImagesByCategoryRef, ListImagesByCategoryVariables } from '@dataconnect/generated';

// The `ListImagesByCategory` query requires an argument of type `ListImagesByCategoryVariables`:
const listImagesByCategoryVars: ListImagesByCategoryVariables = {
  category: ..., 
};

// Call the `listImagesByCategoryRef()` function to get a reference to the query.
const ref = listImagesByCategoryRef(listImagesByCategoryVars);
// Variables can be defined inline as well.
const ref = listImagesByCategoryRef({ category: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listImagesByCategoryRef(dataConnect, listImagesByCategoryVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.images);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.images);
});
```

## GetUserProfile
You can execute the `GetUserProfile` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getUserProfile(vars: GetUserProfileVariables): QueryPromise<GetUserProfileData, GetUserProfileVariables>;

interface GetUserProfileRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUserProfileVariables): QueryRef<GetUserProfileData, GetUserProfileVariables>;
}
export const getUserProfileRef: GetUserProfileRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserProfile(dc: DataConnect, vars: GetUserProfileVariables): QueryPromise<GetUserProfileData, GetUserProfileVariables>;

interface GetUserProfileRef {
  ...
  (dc: DataConnect, vars: GetUserProfileVariables): QueryRef<GetUserProfileData, GetUserProfileVariables>;
}
export const getUserProfileRef: GetUserProfileRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserProfileRef:
```typescript
const name = getUserProfileRef.operationName;
console.log(name);
```

### Variables
The `GetUserProfile` query requires an argument of type `GetUserProfileVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUserProfileVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetUserProfile` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserProfileData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUserProfileData {
  user?: {
    id: UUIDString;
    displayName: string;
    email: string;
    photoUrl?: string | null;
    bio?: string | null;
  } & User_Key;
}
```
### Using `GetUserProfile`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserProfile, GetUserProfileVariables } from '@dataconnect/generated';

// The `GetUserProfile` query requires an argument of type `GetUserProfileVariables`:
const getUserProfileVars: GetUserProfileVariables = {
  id: ..., 
};

// Call the `getUserProfile()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserProfile(getUserProfileVars);
// Variables can be defined inline as well.
const { data } = await getUserProfile({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserProfile(dataConnect, getUserProfileVars);

console.log(data.user);

// Or, you can use the `Promise` API.
getUserProfile(getUserProfileVars).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

### Using `GetUserProfile`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserProfileRef, GetUserProfileVariables } from '@dataconnect/generated';

// The `GetUserProfile` query requires an argument of type `GetUserProfileVariables`:
const getUserProfileVars: GetUserProfileVariables = {
  id: ..., 
};

// Call the `getUserProfileRef()` function to get a reference to the query.
const ref = getUserProfileRef(getUserProfileVars);
// Variables can be defined inline as well.
const ref = getUserProfileRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserProfileRef(dataConnect, getUserProfileVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.user);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## AddCategory
You can execute the `AddCategory` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
addCategory(vars: AddCategoryVariables): MutationPromise<AddCategoryData, AddCategoryVariables>;

interface AddCategoryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddCategoryVariables): MutationRef<AddCategoryData, AddCategoryVariables>;
}
export const addCategoryRef: AddCategoryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
addCategory(dc: DataConnect, vars: AddCategoryVariables): MutationPromise<AddCategoryData, AddCategoryVariables>;

interface AddCategoryRef {
  ...
  (dc: DataConnect, vars: AddCategoryVariables): MutationRef<AddCategoryData, AddCategoryVariables>;
}
export const addCategoryRef: AddCategoryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the addCategoryRef:
```typescript
const name = addCategoryRef.operationName;
console.log(name);
```

### Variables
The `AddCategory` mutation requires an argument of type `AddCategoryVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface AddCategoryVariables {
  name: string;
  description?: string | null;
}
```
### Return Type
Recall that executing the `AddCategory` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AddCategoryData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AddCategoryData {
  category_insert: Category_Key;
}
```
### Using `AddCategory`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, addCategory, AddCategoryVariables } from '@dataconnect/generated';

// The `AddCategory` mutation requires an argument of type `AddCategoryVariables`:
const addCategoryVars: AddCategoryVariables = {
  name: ..., 
  description: ..., // optional
};

// Call the `addCategory()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await addCategory(addCategoryVars);
// Variables can be defined inline as well.
const { data } = await addCategory({ name: ..., description: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await addCategory(dataConnect, addCategoryVars);

console.log(data.category_insert);

// Or, you can use the `Promise` API.
addCategory(addCategoryVars).then((response) => {
  const data = response.data;
  console.log(data.category_insert);
});
```

### Using `AddCategory`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, addCategoryRef, AddCategoryVariables } from '@dataconnect/generated';

// The `AddCategory` mutation requires an argument of type `AddCategoryVariables`:
const addCategoryVars: AddCategoryVariables = {
  name: ..., 
  description: ..., // optional
};

// Call the `addCategoryRef()` function to get a reference to the mutation.
const ref = addCategoryRef(addCategoryVars);
// Variables can be defined inline as well.
const ref = addCategoryRef({ name: ..., description: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = addCategoryRef(dataConnect, addCategoryVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.category_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.category_insert);
});
```

## AddToCart
You can execute the `AddToCart` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
addToCart(vars: AddToCartVariables): MutationPromise<AddToCartData, AddToCartVariables>;

interface AddToCartRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddToCartVariables): MutationRef<AddToCartData, AddToCartVariables>;
}
export const addToCartRef: AddToCartRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
addToCart(dc: DataConnect, vars: AddToCartVariables): MutationPromise<AddToCartData, AddToCartVariables>;

interface AddToCartRef {
  ...
  (dc: DataConnect, vars: AddToCartVariables): MutationRef<AddToCartData, AddToCartVariables>;
}
export const addToCartRef: AddToCartRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the addToCartRef:
```typescript
const name = addToCartRef.operationName;
console.log(name);
```

### Variables
The `AddToCart` mutation requires an argument of type `AddToCartVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface AddToCartVariables {
  userId: UUIDString;
  imageId: UUIDString;
  quantity: number;
}
```
### Return Type
Recall that executing the `AddToCart` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AddToCartData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AddToCartData {
  cartItem_insert: CartItem_Key;
}
```
### Using `AddToCart`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, addToCart, AddToCartVariables } from '@dataconnect/generated';

// The `AddToCart` mutation requires an argument of type `AddToCartVariables`:
const addToCartVars: AddToCartVariables = {
  userId: ..., 
  imageId: ..., 
  quantity: ..., 
};

// Call the `addToCart()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await addToCart(addToCartVars);
// Variables can be defined inline as well.
const { data } = await addToCart({ userId: ..., imageId: ..., quantity: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await addToCart(dataConnect, addToCartVars);

console.log(data.cartItem_insert);

// Or, you can use the `Promise` API.
addToCart(addToCartVars).then((response) => {
  const data = response.data;
  console.log(data.cartItem_insert);
});
```

### Using `AddToCart`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, addToCartRef, AddToCartVariables } from '@dataconnect/generated';

// The `AddToCart` mutation requires an argument of type `AddToCartVariables`:
const addToCartVars: AddToCartVariables = {
  userId: ..., 
  imageId: ..., 
  quantity: ..., 
};

// Call the `addToCartRef()` function to get a reference to the mutation.
const ref = addToCartRef(addToCartVars);
// Variables can be defined inline as well.
const ref = addToCartRef({ userId: ..., imageId: ..., quantity: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = addToCartRef(dataConnect, addToCartVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.cartItem_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.cartItem_insert);
});
```

