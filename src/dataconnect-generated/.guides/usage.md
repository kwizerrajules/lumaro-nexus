# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useAddCategory, useListImagesByCategory, useAddToCart, useGetUserProfile } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useAddCategory(addCategoryVars);

const { data, isPending, isSuccess, isError, error } = useListImagesByCategory(listImagesByCategoryVars);

const { data, isPending, isSuccess, isError, error } = useAddToCart(addToCartVars);

const { data, isPending, isSuccess, isError, error } = useGetUserProfile(getUserProfileVars);

```

Here's an example from a different generated SDK:

```ts
import { useListAllMovies } from '@dataconnect/generated/react';

function MyComponent() {
  const { isLoading, data, error } = useListAllMovies();
  if(isLoading) {
    return <div>Loading...</div>
  }
  if(error) {
    return <div> An Error Occurred: {error} </div>
  }
}

// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from './my-component';

function App() {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>
    <MyComponent />
  </QueryClientProvider>
}
```



## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { addCategory, listImagesByCategory, addToCart, getUserProfile } from '@dataconnect/generated';


// Operation AddCategory:  For variables, look at type AddCategoryVars in ../index.d.ts
const { data } = await AddCategory(dataConnect, addCategoryVars);

// Operation ListImagesByCategory:  For variables, look at type ListImagesByCategoryVars in ../index.d.ts
const { data } = await ListImagesByCategory(dataConnect, listImagesByCategoryVars);

// Operation AddToCart:  For variables, look at type AddToCartVars in ../index.d.ts
const { data } = await AddToCart(dataConnect, addToCartVars);

// Operation GetUserProfile:  For variables, look at type GetUserProfileVars in ../index.d.ts
const { data } = await GetUserProfile(dataConnect, getUserProfileVars);


```