import "../styles/globals.css"
import "regenerator-runtime" // relay network requirement
import App from "next/app"
import type { AppContext, AppProps } from "next/app"
import { graphql } from "react-relay"
import { getSession } from "next-auth/react"
import { AppLoggedInQuery } from "__generated__/AppLoggedInQuery.graphql"
import { RelaySSRAdaptor } from "./system/relay/RelaySSRAdaptor"
import { fetchRelayData } from "./system/relay/fetchRelayData"
import { Boot } from "./system/Boot"

export default function MyApp({ Component, pageProps }: AppProps) {
  const initialRecords = pageProps?.preloadedQueries?.pageQuery?.records

  return (
    <Boot initialRecords={initialRecords} session={pageProps.session}>
      <RelaySSRAdaptor Component={Component} props={pageProps} />
    </Boot>
  )
}

MyApp.getInitialProps = async (appContext: AppContext) => {
  const session = await getSession(appContext.ctx)
  const appProps = await App.getInitialProps(appContext)

  // Query private field if user appears to be logged in, to validate token
  if (session?.user) {
    const { data } = await fetchRelayData<AppLoggedInQuery>({
      query: graphql`
        query AppLoggedInQuery {
          me {
            createdAt
          }
        }
      `,
      cacheConfig: {
        networkCacheConfig: {
          force: true,
        },
      },
      variables: {},
      ctx: appContext.ctx,
    })

    appProps.pageProps.tokenValid = !!data?.me?.createdAt
  }

  appProps.pageProps.session = session

  return appProps
}