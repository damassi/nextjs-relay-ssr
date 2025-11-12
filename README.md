# Relay SSR Example for Next.js Pages

A minimal example demonstrating how to implement Server-Side Rendering (SSR) with Relay in a Next.js pages app.

#### The SSR flow works as follows:

1. App Setup (`_app.tsx`): Configures the Relay environment and wraps the app with providers
2. Data Fetching (`getServerSideProps`): Uses `fetchRelayData` to fetch GraphQL data on the server
3. Hydration (`RelaySSRAdaptor`): Transforms server-side data into client-side Relay query references
4. Component Rendering: Pages use `usePreloadedQuery` to access the pre-fetched data


#### Usage

```tsx
// 1. Define your GraphQL query
const QUERY = graphql`
  query MyPageQuery($id: String!) {
    item(id: $id) {
      id
      name
    }
  }
`

// 2. Fetch data server-side
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const props = await fetchRelayData({
    query: QUERY,
    variables: { id: ctx.query.id },
    ctx,
  })

  return { props }
}

// 3. Use preloaded data in component
const MyPage: React.FC<RelayPageProps> = ({ pageQuery }) => {
  const data = usePreloadedQuery<MyPageQuery>(QUERY, pageQuery)

  return <div>{data.item.name}</div>
}
```
