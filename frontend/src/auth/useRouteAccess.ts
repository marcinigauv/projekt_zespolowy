import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../store/authStore'

interface UseRouteAccessOptions {
  requireAdmin?: boolean
}

export function useRouteAccess(options: UseRouteAccessOptions = {}) {
  const { requireAdmin = false } = options
  const router = useRouter()
  const isAuthResolved = useAuthStore((state) => state.isAuthResolved)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)

  useEffect(() => {
    if (!isAuthResolved) {
      return
    }

    if (!isAuthenticated) {
      router.replace('/login')
      return
    }

    if (requireAdmin && !user?.isAdmin) {
      router.replace('/')
    }
  }, [isAuthResolved, isAuthenticated, requireAdmin, router, user?.isAdmin])

  const canRender = isAuthResolved && isAuthenticated && (!requireAdmin || Boolean(user?.isAdmin))

  return {
    canRender,
    isAuthResolved,
    isAuthenticated,
    user,
  }
}