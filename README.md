# Relay SSR Example for Next.js Pages

A minimal example demonstrating how to implement Server-Side Rendering (SSR) with Relay in a Next.js pages app.

### Architecture Overview

The SSR flow works as follows:

1. App Setup (`_app.tsx`): Configures the Relay environment and wraps the app with providers
2. Data Fetching (`getServerSideProps`): Uses `fetchRelayData` to fetch GraphQL data on the server
3. Hydration (`RelaySSRAdaptor`): Transforms server-side data into client-side Relay query references
4. Component Rendering: Pages use `usePreloadedQuery` to access the pre-fetched data

### Key Files

#### `_app.tsx`

- Sets up the Relay environment with initial records from SSR
- Wraps the app with `Boot` component that provides Relay and session context
- Uses `RelaySSRAdaptor` to handle SSR hydration

#### `pages/artists.tsx` & `pages/user/[userId].tsx`

- Example pages showing how to:
  - Define GraphQL queries with `graphql` tagged template
  - Fetch data server-side with `fetchRelayData` in `getServerSideProps`
  - Use `usePreloadedQuery` to access the data in components
  - Handle both static and dynamic routes

#### `system/relay/fetchRelayData.ts`

- Core SSR function that:
  - Executes GraphQL queries on the server
  - Handles authentication and session management
  - Caches query results to avoid duplicate server calls
  - Returns serializable data for Next.js

#### `system/relay/RelaySSRAdaptor.tsx`

- Transforms server-side preloaded query data into client-side Relay query references
- Ensures seamless hydration between server and client
- Uses the `useRelayEnvironment` hook to access the current Relay environment

#### `system/relay/environment.ts`

- Creates Relay environments for both server and client
- Configures network layer with authentication headers
- Handles initial records for SSR hydration
- Sets up caching and middleware

### Usage Pattern

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
