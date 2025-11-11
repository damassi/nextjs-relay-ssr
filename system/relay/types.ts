import { PreloadedQuery } from "react-relay"
import {
  CacheConfig as RelayCacheConfig,
  FetchQueryFetchPolicy,
  OperationType,
} from "relay-runtime"

export type CacheConfig = {
  fetchPolicy?: FetchQueryFetchPolicy | null | undefined
  networkCacheConfig?: RelayCacheConfig | null | undefined
} | null

export type PreloadedQueryRefs = Record<
  string,
  Omit<PreloadedQuery<any, any>, "dispose">
>

export interface PreloadedQueryProps<T extends OperationType> {
  cacheConfig: CacheConfig
  params: any
  variables: T["variables"]
  response: T["response"] | undefined | null
  records: Record<string, any> | null | undefined
}

export interface RelayPageProps {
  pageQuery: PreloadedQuery<any, any>
}