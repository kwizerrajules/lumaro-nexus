import { AddCategoryData, AddCategoryVariables, ListImagesByCategoryData, ListImagesByCategoryVariables, AddToCartData, AddToCartVariables, GetUserProfileData, GetUserProfileVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useAddCategory(options?: useDataConnectMutationOptions<AddCategoryData, FirebaseError, AddCategoryVariables>): UseDataConnectMutationResult<AddCategoryData, AddCategoryVariables>;
export function useAddCategory(dc: DataConnect, options?: useDataConnectMutationOptions<AddCategoryData, FirebaseError, AddCategoryVariables>): UseDataConnectMutationResult<AddCategoryData, AddCategoryVariables>;

export function useListImagesByCategory(vars: ListImagesByCategoryVariables, options?: useDataConnectQueryOptions<ListImagesByCategoryData>): UseDataConnectQueryResult<ListImagesByCategoryData, ListImagesByCategoryVariables>;
export function useListImagesByCategory(dc: DataConnect, vars: ListImagesByCategoryVariables, options?: useDataConnectQueryOptions<ListImagesByCategoryData>): UseDataConnectQueryResult<ListImagesByCategoryData, ListImagesByCategoryVariables>;

export function useAddToCart(options?: useDataConnectMutationOptions<AddToCartData, FirebaseError, AddToCartVariables>): UseDataConnectMutationResult<AddToCartData, AddToCartVariables>;
export function useAddToCart(dc: DataConnect, options?: useDataConnectMutationOptions<AddToCartData, FirebaseError, AddToCartVariables>): UseDataConnectMutationResult<AddToCartData, AddToCartVariables>;

export function useGetUserProfile(vars: GetUserProfileVariables, options?: useDataConnectQueryOptions<GetUserProfileData>): UseDataConnectQueryResult<GetUserProfileData, GetUserProfileVariables>;
export function useGetUserProfile(dc: DataConnect, vars: GetUserProfileVariables, options?: useDataConnectQueryOptions<GetUserProfileData>): UseDataConnectQueryResult<GetUserProfileData, GetUserProfileVariables>;
