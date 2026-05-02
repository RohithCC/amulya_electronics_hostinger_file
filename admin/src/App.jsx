// App.jsx
import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { Routes, Route, Navigate } from 'react-router-dom'
import Add from './pages/Add'
import List from './pages/List'
import Orders from './pages/Orders'
import AddBlog from './pages/AddBlog'
import ListBlog from './pages/ListBlog'
import Login from './components/Login'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import FooterEditor     from './pages/FooterEditor'
import ContactsList     from './pages/ContactsList'
import HeroBannerAdmin  from './pages/HeroBannerAdmin'
import Categories       from './pages/Categories'   // ← NEW
import TestimonialsAndBlogAdmin from './pages/Testimonialsandblogadmin'
import ShowcaseBanners from './pages/ShowcaseBanners'
import ProjectsAdminPage from "./pages/ProjectsAdmin";

export const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:10000'
export const currency = '₹'

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '')

  useEffect(() => { localStorage.setItem('token', token) }, [token])

  return (
    <div style={{ minHeight: '100vh', background: '#d2deff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <ToastContainer
        position="top-right" autoClose={3000} theme="dark"
        toastStyle={{ background: '#d2deff', border: '1px solid #00c2ff33', color: '#e2e8f0' }}
      />

      {token === '' ? (
        <Login setToken={setToken} />
      ) : (
        <>
          <Navbar setToken={setToken} />
          <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #00c2ff44, transparent)' }} />

          <div className="flex w-full">
            <Sidebar />
            <main className="flex-1 min-h-screen" style={{
              background: '#d2deff',
              padding: '32px clamp(16px, 4vw, 40px)',
              overflowX: 'hidden',
            }}>
              <Routes>
                <Route path="/"              element={<Navigate to="/list" replace />} />
                <Route path="/add"           element={<Add           token={token} />} />
                <Route path="/list"          element={<List          token={token} />} />
                <Route path="/orders"        element={<Orders        token={token} />} />
                <Route path="/categories"    element={<Categories    token={token} />} />  {/* ← NEW */}
                <Route path="/hero-banner"   element={<HeroBannerAdmin token={token} />} />
                <Route path="/footer-settings" element={<FooterEditor  token={token} />} />
                <Route path="/contacts"      element={<ContactsList  token={token} />} />
                <Route path="/blog/add"      element={<AddBlog       token={token} />} />
                <Route path="/blog/list"     element={<ListBlog      token={token} />} />
                   <Route path="/banner_footer"     element={<ShowcaseBanners      token={token} />} />
                  <Route path="/blog/frontend"     element={<TestimonialsAndBlogAdmin      token={token} />} />
                  // Add alongside your existing admin routes:
                  <Route
                    path="/blog/projects"
                    element={<ProjectsAdminPage token={token} />}
                  />
                <Route path="*"              element={<Navigate to="/list" replace />} />
              </Routes>
            </main>
          </div>
        </>
      )}
    </div>
  )
}

export default App