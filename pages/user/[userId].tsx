import { GetServerSideProps } from "next"
import { graphql } from "react-relay"
import { UserIdQuery } from "__generated__/UserIdQuery.graphql"
import Head from "next/head"
import { getSession } from "next-auth/react"
import { fetchRelayData } from "../../system/relay/fetchRelayData"
import { usePreloadedQuery } from "react-relay"
import { RelayPageProps } from "../../system/relay/types"

const UserPage: React.FC<RelayPageProps> = ({ pageQuery }) => {
  const data = usePreloadedQuery<UserIdQuery>(QUERY, pageQuery)

  if (!data.user) {
    return <div>User not found</div>
  }

  return (
    <>
      <Head>
        <title>User: {data.user.name}</title>
      </Head>

      <h1>User Profile</h1>
      <div>
        <h2>{data.user.name}</h2>
        <p>Email: {data.user.email}</p>
        <p>Created: {data.user.createdAt}</p>
      </div>
    </>
  )
}

const QUERY = graphql`
  query UserIdQuery($userId: String!) {
    user(id: $userId) {
      id
      name
      email
      createdAt
    }
  }
`

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getSession({ req: ctx.req })

  const props = await fetchRelayData({
    query: QUERY,
    variables: {
      userId: ctx.query.userId,
    },
    ctx,
  })

  return {
    props,
  }
}

export default UserPage