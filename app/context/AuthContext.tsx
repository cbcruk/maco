'use client'

import { IronSession } from 'iron-session'
import { SessionData } from '../lib/auth'
import { ComponentProps, createContext, useContext } from 'react'

const AuthContext = createContext<IronSession<SessionData> | null>(null)

type AuthProviderProps = ComponentProps<typeof AuthContext.Provider>

export function AuthProvider({ children, ...props }: AuthProviderProps) {
  return <AuthContext.Provider {...props}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  return context!
}
