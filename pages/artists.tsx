import Head from "next/head"
import { graphql } from "react-relay"
import { GetServerSideProps } from "next"
import { artistsQuery } from "__generated__/artistsQuery.graphql"
import { usePreloadedQuery } from "react-relay"
import { RelayPageProps } from "../system/relay/types"
import { fetchRelayData } from "../system/relay/fetchRelayData"

const Artists: React.FC<RelayPageProps> = ({ pageQuery }) => {
  const data = usePreloadedQuery<artistsQuery>(QUERY, pageQuery)

  return (
    <>
      <Head>
        <title>Artists</title>
      </Head>

      <h1>Artists</h1>
      
      {data.viewer && (
        <div>
          <p>Found {data.viewer.artists?.totalCount} artists</p>
          {data.viewer.artists?.edges?.map((edge) => (
            <div key={edge?.node?.id}>
              <h3>{edge?.node?.name}</h3>
              <p>{edge?.node?.bio}</p>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

const QUERY = graphql`
  query artistsQuery($term: String) {
    viewer {
      artists(term: $term, first: 20) {
        totalCount
        edges {
          node {
            id
            name
            bio
          }
        }
      }
    }
  }
`

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const term = ctx.query.term as string

  const props = await fetchRelayData({
    query: QUERY,
    variables: { term },
    ctx,
  })

  return {
    props,
  }
}

export default Artists