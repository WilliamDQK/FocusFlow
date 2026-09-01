import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { useAppStore } from '../stores/app-store'

export function App() {
  const hydrate = useAppStore((state) => state.hydrate); const hydrated = useAppStore((state) => state.hydrated)
  useEffect(() => { void hydrate() }, [hydrate])
  if (!hydrated) return <div className="boot-screen"><div className="boot-mark">F</div><span>FocusFlow</span></div>
  return <RouterProvider router={router} />
}
