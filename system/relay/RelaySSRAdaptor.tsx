import { useRelayEnvironment } from "react-relay"
import { useMemo } from "react"
import { PreloadedQueryProps, PreloadedQueryRefs } from "./types"

interface RelaySSRAdaptorProps {
  Component: React.ComponentType<any>
  props: {
    preloadedQueries: PreloadedQueryProps<any>[]
  }
}

export const RelaySSRAdaptor: React.FC<RelaySSRAdaptorProps> = ({
  Component,
  props,
}) => {
  return <Hydrate Component={Component} props={props} />
}

const Hydrate: React.FC<RelaySSRAdaptorProps> = ({ Component, props }) => {
  const environment = useRelayEnvironment()

  const transformedProps = useMemo(() => {
    if (props == null) {
      return props
    }

    // Returned from fetchRelayData response
    const { preloadedQueries, ...otherProps } = props

    if (preloadedQueries == null) {
      return props
    }

    const queryRefs: PreloadedQueryRefs = Object.entries(
      preloadedQueries
    ).reduce((acc: PreloadedQueryRefs, preloadedQuery) => {
      const [queryName, { cacheConfig, params, variables }] = preloadedQuery

      acc[queryName] = {
        environment,
        fetchKey: params.id,
        fetchPolicy: cacheConfig?.fetchPolicy ?? "store-or-network",
        isDisposed: false,
        name: params.name,
        kind: "PreloadedQuery",
        variables,
      }
      return acc
    }, {})

    return {
      ...otherProps,
      // If we ever need to pass multiple preloaded queries, we can update
      // so that we return queryRefs as props
      pageQuery: queryRefs.pageQuery,
    }
  }, [props, environment])

  return <Component {...transformedProps} />
}