import {
  cacheMiddleware,
  errorMiddleware,
  Headers,
  loggerMiddleware,
  Middleware,
  RelayNetworkLayer,
  urlMiddleware,
} from "react-relay-network-modern"
import { Environment, RecordSource, Store } from "relay-runtime"

const GRAPHQL_API_URL = process.env.GRAPHQL_API_URL || "https://api.example.com/graphql"

const LOG_SERVER_RELAY_EVENTS = false
const LOG_CLIENT_RELAY_EVENTS = false

const isServer = typeof window === "undefined"

export const createRelayEnvironment = (
  user?: any,
  initialRecords?: Record<string, any> | undefined
) => {
  const network = new RelayNetworkLayer(
    [
      urlMiddleware({
        url: GRAPHQL_API_URL,
        headers: getAuthenticationHeaders(user),
      }),
      cacheMiddleware({
        size: 100,
        ttl: 60 * 1000,
        clearOnMutation: true,
      }),
      !isServer && loggerMiddleware(),
      !isServer && errorMiddleware({ disableServerMiddlewareTip: true }),
    ] as Middleware[],
    {
      noThrow: true,
    }
  )

  const environment = new Environment({
    network,
    store: new Store(new RecordSource(initialRecords)),
    isServer,
    log(event) {
      if (isServer && LOG_SERVER_RELAY_EVENTS) {
        console.debug("[relay server event]", event)
      }

      if (!isServer && LOG_CLIENT_RELAY_EVENTS) {
        console.debug("[relay client event]", event)
      }
    },
  })

  return environment
}

const getAuthenticationHeaders = (user?: any) => {
  const authenticatedHeaders: Headers = user
    ? {
        "Authorization": `Bearer ${user.accessToken}`,
        "X-USER-ID": user.id,
      }
    : {}

  return authenticatedHeaders
}