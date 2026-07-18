import { useEffect, useRef } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { AboutPage } from './pages/AboutPage'
import { AdminPage } from './pages/AdminPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProfilePage } from './pages/ProfilePage'

function RouteEffects() {
  const { pathname } = useLocation()
  const isFirstRoute = useRef(true)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
    document.title = pathname.startsWith('/people/')
      ? 'Profil i życzenia · Sto lat!'
      : pathname === '/admin'
        ? 'Administracja demo · Sto lat!'
        : pathname === '/o-projekcie'
          ? 'O projekcie · Sto lat!'
          : 'Sto lat! · kalendarz urodzin'

    if (isFirstRoute.current) {
      isFirstRoute.current = false
      return
    }

    window.requestAnimationFrame(() => {
      document.getElementById('main-content')?.focus()
    })
  }, [pathname])

  return null
}

export default function App() {
  return (
    <>
      <RouteEffects />
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="people/:personId" element={<ProfilePage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="o-projekcie" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  )
}
