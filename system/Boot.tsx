import { SessionProvider } from "next-auth/react"
import { Environment, RelayEnvironmentProvider } from "react-relay"
import { useMemo } from "react"
import { useRouter } from "next/router"
import { createRelayEnvironment } from "./relay/environment"
import { Session } from "next-auth"

interface BootProps {
  initialRecords: Record<string, any> | undefined
  session: Session
}

export const Boot: React.FC<BootProps> = ({
  children,
  initialRecords,
  session,
}) => {
  const environment = useMemo(() => {
    return createRelayEnvironment(
      session?.user,
      initialRecords
    )
    // Instantiate the relay environment once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const location = useRouter().pathname

  return (
    <RelayEnvironmentProvider environment={environment as Environment}>
      <SessionProvider session={session}>
        <div key={location}>
          {children}
        </div>
      </SessionProvider>
    </RelayEnvironmentProvider>
  )
}