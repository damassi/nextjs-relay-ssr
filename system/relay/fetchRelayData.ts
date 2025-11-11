import { GetServerSidePropsContext, NextPageContext } from "next"
import { GraphQLTaggedNode } from "react-relay"
import {
  OperationType,
  GraphQLTaggedNode as GraphQLTaggedNodeRuntime,
  fetchQuery,
} from "relay-runtime"
import { getSession } from "next-auth/react"
import { createRelayEnvironment } from "./environment"
import { CacheConfig, PreloadedQueryProps } from "./types"

export interface FetchRelayDataProps<T extends OperationType> {
  query: GraphQLTaggedNode
  variables: T["variables"]
  cacheConfig?: CacheConfig
  ctx: GetServerSidePropsContext | NextPageContext
}

export async function fetchRelayData<T extends OperationType>({
  query,
  variables,
  cacheConfig = {
    fetchPolicy: "store-or-network",
    networkCacheConfig: {
      force: false,
    },
  },
  ctx,
}: FetchRelayDataProps<T>) {
  const session = await getSession(ctx)
  const user = session?.user

  // @ts-ignore - `default` is not defined on `query`, yet exists
  const params = query.default.params

  // If next data exists, we can skip the network call in getServerSideProps
  // and return the already-fetched preloaded relay query reference
  const skipSubsequentServerSideCalls =
    ctx.req?.url?.indexOf("/_next/data/") !== -1 &&
    !cacheConfig?.networkCacheConfig?.force

  // Cached
  if (skipSubsequentServerSideCalls) {
    console.log("[relay] Cache-hit. Skipping query:", params.name)

    return createPreloadedQueryPageProps<T>({
      cacheConfig,
      params,
      response: null,
      records: null,
      variables,
    })
  }

  const environment = createRelayEnvironment(user)
  const typedQuery = query as GraphQLTaggedNodeRuntime

  const response = await fetchQuery<T>(
    environment,
    typedQuery,
    variables,
    cacheConfig
  ).toPromise()

  const records = environment.getStore().getSource().toJSON()

  return createPreloadedQueryPageProps<T>({
    cacheConfig,
    params,
    response,
    variables,
    records,
  })
}

interface CreatePreloadedQueryPageProps<T extends OperationType> {
  data: T["response"]
  preloadedQueries: {
    pageQuery: PreloadedQueryProps<T>
  }
}

function createPreloadedQueryPageProps<T extends OperationType>({
  cacheConfig,
  params,
  response,
  variables,
  records = null,
}: PreloadedQueryProps<T>): CreatePreloadedQueryPageProps<T> {
  const data = response != null ? response : null

  // Can't run JSON.stringify on undefined values
  const serializableVariables = Object.entries(variables).reduce(
    (acc, [key, value]) => {
      return {
        ...acc,
        [key]: typeof value === "undefined" ? null : value,
      }
    },
    {}
  )

  return {
    data,
    preloadedQueries: {
      pageQuery: {
        cacheConfig,
        params,
        variables: serializableVariables,
        response,
        records,
      },
    },
  }
}