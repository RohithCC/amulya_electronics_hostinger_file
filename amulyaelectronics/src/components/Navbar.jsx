// src/components/Navbar.jsx
// ─────────────────────────────────────────────────────────────────────────────
// ✅ Search now uses Redux searchSlice (openSearch/closeSearch actions)
//    and renders <SearchModal /> instead of inline JSX
// ✅ All original functionality preserved
// ✅ Mobile responsive
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef }   from 'react'
import { Link, NavLink, useNavigate }    from 'react-router-dom'
import {
  FiSearch, FiShoppingCart, FiMenu, FiX,
  FiUser, FiHeart, FiChevronDown,
  FiLogOut, FiPackage, FiSettings,
} from 'react-icons/fi'
import { useSelector, useDispatch }  from 'react-redux'
import { logoutUser, fetchUserProfile } from '../app/authSlice'
import { loadCart, syncGuestCartToServer, clearAll } from '../app/cartSlice'

// ✅ Redux search actions
import { openSearch, selectSearchOpen } from '../app/searchSlice'

// ✅ SearchModal rendered at top level — keeps Navbar clean
import SearchModal from './SearchModal'

const ALL_CATEGORIES = [
  'VOLTMETER', 'Sensors & Modules', 'SOLDERING', 'Battery',
  'Battery Holders', 'Motor', 'Motor Driver', 'Wireless Modules',
  'Audio Related', 'Basic Tools', 'Micro Controller', 'Capacitors',
  'Components', 'Display', 'ICS', 'Jumper Wires & Cables', 'Kits',
  'LEDs', 'Medical', 'Other Modules', 'Power Boards', 'Relay Modules',
  'Resistors', 'Robotics', 'Wheels',
]

const PRODUCT_LINKS = [
  { label: 'Kits',        path: '/collection/Kits' },
  { label: 'Sensors',     path: '/collection/Sensors%20%26%20Modules' },
  { label: 'Accessories', path: '/collection/Basic%20Tools' },
  { label: 'Robotics',    path: '/collection/Robotics' },
]

// ─── Badge ────────────────────────────────────────────────────────────────────
function Badge({ count }) {
  if (!count || count < 1) return null
  return (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full font-black leading-none shadow-sm pointer-events-none">
      {count > 99 ? '99+' : count}
    </span>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, avatar, size = 'sm' }) {
  const [imgError, setImgError] = useState(false)
  const letter  = name ? name.charAt(0).toUpperCase() : '?'
  const sizecls = size === 'lg' ? 'w-10 h-10 text-base' : 'w-8 h-8 text-sm'

  if (avatar && !imgError) {
    return (
      <img src={avatar} alt={name || 'User'} onError={() => setImgError(true)}
        className={`${sizecls} rounded-full object-cover border-2 border-blue-100 select-none`} />
    )
  }
  return (
    <span className={`${sizecls} rounded-full bg-blue-600 text-white font-black flex items-center justify-center select-none`}>
      {letter}
    </span>
  )
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
const Navbar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { user, isLoggedIn, token } = useSelector((s) => s.auth)
  const isSearchOpen = useSelector(selectSearchOpen)    // ✅ from Redux

  const cartCount = useSelector((s) => {
    const items = s.cart?.items
    if (!Array.isArray(items)) return 0
    return items.reduce((sum, i) => sum + (i.quantity ?? 1), 0)
  })
  const wishlistCount = useSelector((s) => s.wishlist?.items?.length ?? 0)

  // ── Desktop dropdown state ─────────────────────────────────────────────────
  const [desktopCatOpen,     setDesktopCatOpen]     = useState(false)
  const [desktopProductOpen, setDesktopProductOpen] = useState(false)
  const [userMenuOpen,       setUserMenuOpen]        = useState(false)

  const catCloseTimer     = useRef(null)
  const productCloseTimer = useRef(null)

  const openDesktopCat      = () => { clearTimeout(catCloseTimer.current);     setDesktopCatOpen(true)  }
  const closeDesktopCat     = () => { catCloseTimer.current     = setTimeout(() => setDesktopCatOpen(false),     150) }
  const openDesktopProduct  = () => { clearTimeout(productCloseTimer.current); setDesktopProductOpen(true)  }
  const closeDesktopProduct = () => { productCloseTimer.current = setTimeout(() => setDesktopProductOpen(false), 150) }

  // ── Mobile menu state ──────────────────────────────────────────────────────
  const [mobileOpen,        setMobileOpen]       = useState(false)
  const [mobileCatOpen,     setMobileCatOpen]    = useState(false)
  const [mobileProductOpen, setMobileProductOpen]= useState(false)

  const userMenuRef       = useRef(null)
  const prevLoggedInRef   = useRef(isLoggedIn)

  // ── Fetch profile ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (token && !user) dispatch(fetchUserProfile())
  }, [token, user, dispatch])

  // ── One-time cart load ─────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(loadCart())
  }, [])  // eslint-disable-line

  // ── Login/logout transitions ───────────────────────────────────────────────
  useEffect(() => {
    const wasLoggedIn = prevLoggedInRef.current
    prevLoggedInRef.current = isLoggedIn

    if (!wasLoggedIn && isLoggedIn) {
      dispatch(syncGuestCartToServer()).then(() => dispatch(loadCart()))
    }
    if (wasLoggedIn && !isLoggedIn) {
      dispatch(clearAll())
    }
  }, [isLoggedIn, dispatch])

  // ── Close user menu on outside click ──────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target))
        setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Close mobile on resize ─────────────────────────────────────────────────
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMobileOpen(false) }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // ── Body scroll lock when mobile open ─────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = (mobileOpen || isSearchOpen) ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen, isSearchOpen])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleLogout = () => {
    dispatch(logoutUser())
    dispatch(clearAll())
    setUserMenuOpen(false)
    setMobileOpen(false)
    navigate('/')
  }

  const handleDesktopCategoryClick = (cat) => {
    clearTimeout(catCloseTimer.current)
    setDesktopCatOpen(false)
    navigate(`/collection/${encodeURIComponent(cat)}`)
  }

  const handleMobileCategoryClick = (cat) => {
    navigate(`/collection/${encodeURIComponent(cat)}`)
    setMobileOpen(false)
    setMobileCatOpen(false)
  }

  const closeMobileMenu = () => {
    setMobileOpen(false)
    setMobileCatOpen(false)
    setMobileProductOpen(false)
  }

  const navClass = ({ isActive }) =>
    isActive
      ? 'bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full font-bold text-sm'
      : 'px-3 py-1.5 hover:text-blue-700 text-gray-800 transition-colors duration-200 font-semibold text-sm'

  return (
    <>
      {/* ✅ Search modal — rendered from Redux state, outside header z-stack */}
      {isSearchOpen && <SearchModal />}

      <header className="w-full shadow-sm bg-white sticky top-0 z-50">

        {/* ANNOUNCEMENT BAR */}
        <div className="bg-blue-900 text-white text-center text-xs sm:text-sm py-1.5 tracking-wide font-semibold">
          🎉 Back2School Sale is Live! Free delivery on orders above ₹499
        </div>

        {/* MAIN HEADER */}
        <div className="max-w-[1400px] mx-auto px-4 flex items-center justify-between py-3 gap-3">

          {/* ── LEFT ─────────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3">
            <img
              src="https://amulyaelectronics.com/wp-content/uploads/2026/01/CONNECT-WITH-ELECTRONICS-1.png"
              onClick={() => navigate('/')}
              className="h-10 cursor-pointer flex-shrink-0 hover:opacity-90 transition-opacity"
              alt="Amulya Electronics"
            />

            {/* ── DESKTOP: All Categories ─── */}
            <div
              className="relative hidden md:block"
              onMouseEnter={openDesktopCat}
              onMouseLeave={closeDesktopCat}
            >
              <button
                onClick={() => setDesktopCatOpen(!desktopCatOpen)}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full cursor-pointer transition-colors text-sm font-bold text-gray-800"
              >
                <FiMenu size={15} />
                <span>All Categories</span>
                <FiChevronDown size={13} className={`transition-transform duration-200 ${desktopCatOpen ? 'rotate-180' : ''}`} />
              </button>
              {desktopCatOpen && (
                <div
                  className="absolute top-12 left-0 w-64 bg-white shadow-2xl rounded-2xl py-2 z-50 border border-gray-100 max-h-96 overflow-y-auto"
                  onMouseEnter={openDesktopCat}
                  onMouseLeave={closeDesktopCat}
                >
                  {ALL_CATEGORIES.map((item) => (
                    <button
                      key={item}
                      onMouseDown={() => handleDesktopCategoryClick(item)}
                      className="w-full text-left px-4 py-2.5 hover:bg-blue-50 hover:text-blue-700 text-sm text-gray-800 transition-colors font-semibold"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── DESKTOP: Nav links ─── */}
            <nav className="hidden md:flex items-center gap-1 text-gray-800">
              <NavLink to="/" className={navClass} end>Home</NavLink>

              {/* Our Products dropdown 
              <div
                className="relative"
                onMouseEnter={openDesktopProduct}
                onMouseLeave={closeDesktopProduct}
              >
                <button
                  onClick={() => setDesktopProductOpen(!desktopProductOpen)}
                  className="flex items-center gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-1.5 rounded-full font-bold transition-colors text-sm"
                >
                  Our Products
                  <FiChevronDown size={13} className={`transition-transform duration-200 ${desktopProductOpen ? 'rotate-180' : ''}`} />
                </button>
                {desktopProductOpen && (
                  <div
                    className="absolute top-10 left-0 w-52 bg-white shadow-xl rounded-xl py-2 border border-gray-100 z-50"
                    onMouseEnter={openDesktopProduct}
                    onMouseLeave={closeDesktopProduct}
                  >
                    {PRODUCT_LINKS.map((item) => (
                      <Link
                        key={item.label}
                        to={item.path}
                        onMouseDown={() => setDesktopProductOpen(false)}
                        onClick={() => setDesktopProductOpen(false)}
                        className="block px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-800 hover:text-blue-700 transition-colors font-semibold"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              */}

              <NavLink to="/collection" className={navClass}>Product Catalog</NavLink>
               <NavLink to="/about" className={navClass}>About</NavLink>
              <NavLink to="/contact"    className={navClass}>Contact</NavLink>
            </nav>
          </div>

          {/* ── RIGHT ACTIONS ─────────────────────────────────────────────── */}
          <div className="flex items-center gap-0.5 sm:gap-1">

            {/* ✅ Search button — dispatches Redux openSearch action */}
            <button
              onClick={() => dispatch(openSearch())}
              className="p-2.5 rounded-full hover:bg-gray-100 transition-colors group"
              aria-label="Search"
            >
              <FiSearch className="text-[22px] text-gray-700 group-hover:text-blue-700 transition-colors" />
            </button>

            {/* USER dropdown */}
            {isLoggedIn ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="p-1 rounded-full hover:ring-2 hover:ring-blue-200 transition-all"
                  aria-label="Account"
                >
                  <Avatar name={user?.name} avatar={user?.avatar} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-12 w-56 bg-white shadow-xl rounded-2xl py-2 border border-gray-100 z-50">
                    <div className="px-4 py-3 border-b border-gray-100 mb-1 flex items-center gap-3">
                      <Avatar name={user?.name} avatar={user?.avatar} />
                      <div className="min-w-0">
                        <p className="text-sm font-black text-gray-900 truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email || ''}</p>
                      </div>
                    </div>
                    <Link to="/profile" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-800 hover:text-blue-700 transition-colors font-semibold">
                      <FiSettings size={15} /> My Profile
                    </Link>
                    <Link to="/orders" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-800 hover:text-blue-700 transition-colors font-semibold">
                      <FiPackage size={15} /> My Orders
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-sm text-red-600 hover:text-red-700 transition-colors font-semibold">
                      <FiLogOut size={15} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => navigate('/login')}
                className="p-2.5 rounded-full hover:bg-gray-100 transition-colors group" aria-label="Login">
                <FiUser className="text-[22px] text-gray-700 group-hover:text-blue-700 transition-colors" />
              </button>
            )}

            {/* Wishlist */}
            <button onClick={() => navigate('/wishlist')}
              className="relative p-2.5 rounded-full hover:bg-gray-100 transition-colors group" aria-label="Wishlist">
              <FiHeart className="text-[22px] text-gray-700 group-hover:text-red-500 transition-colors" />
              <Badge count={wishlistCount} />
            </button>

            {/* Cart */}
            <button onClick={() => navigate('/cart')}
              className="relative p-2.5 rounded-full hover:bg-gray-100 transition-colors group" aria-label="Cart">
              <FiShoppingCart className="text-[22px] text-gray-700 group-hover:text-blue-700 transition-colors" />
              <Badge count={cartCount} />
            </button>

            {/* Hamburger — mobile only */}
            <button
              className="md:hidden p-2.5 rounded-full hover:bg-gray-100 text-gray-800 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>

        {/* ── MOBILE MENU ──────────────────────────────────────────────────── */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg overflow-y-auto max-h-[80vh]">
            <div className="px-4 py-4 space-y-1">

              {/* ── Mobile search bar ── */}
              <button
                onClick={() => { dispatch(openSearch()); closeMobileMenu() }}
                className="w-full flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-500 text-sm font-medium hover:border-blue-300 hover:bg-blue-50 transition-all mb-2"
              >
                <FiSearch size={16} className="text-gray-400" />
                <span className="text-gray-400">Search products, kits, sensors…</span>
              </button>

              {/* Main nav links */}
              {[
                { label: 'Home',            to: '/'          },
                { label: 'Product Catalog', to: '/collection' },
                { label: 'Contact',         to: '/contact'   },
              ].map((item) => (
                <Link key={item.label} to={item.to} onClick={closeMobileMenu}
                  className="flex items-center px-3 py-3 rounded-xl hover:bg-gray-50 text-gray-800 font-semibold text-sm transition-colors">
                  {item.label}
                </Link>
              ))}

              {/* ── Our Products submenu ── */}
              <div className="rounded-xl overflow-hidden border border-gray-100">
                <button
                  onClick={() => setMobileProductOpen(!mobileProductOpen)}
                  className="w-full flex items-center justify-between px-3 py-3 bg-blue-50 text-blue-700 font-bold text-sm transition-colors hover:bg-blue-100"
                >
                  <span>Our Products</span>
                  <FiChevronDown size={15} className={`transition-transform duration-200 ${mobileProductOpen ? 'rotate-180' : ''}`} />
                </button>
                {mobileProductOpen && (
                  <div className="bg-white border-t border-gray-100">
                    {PRODUCT_LINKS.map((item) => (
                      <Link key={item.label} to={item.path} onClick={closeMobileMenu}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition-colors font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* ── All Categories submenu ── */}
              <div className="rounded-xl overflow-hidden border border-gray-100">
                <button
                  onClick={() => setMobileCatOpen(!mobileCatOpen)}
                  className="w-full flex items-center justify-between px-3 py-3 text-gray-800 font-bold text-sm hover:bg-gray-50 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FiMenu size={15} /> All Categories
                  </span>
                  <FiChevronDown size={15} className={`transition-transform duration-200 ${mobileCatOpen ? 'rotate-180' : ''}`} />
                </button>
                {mobileCatOpen && (
                  <div className="bg-gray-50 border-t border-gray-100 max-h-60 overflow-y-auto">
                    {ALL_CATEGORIES.map((cat) => (
                      <button key={cat} onClick={() => handleMobileCategoryClick(cat)}
                        className="w-full text-left flex items-center gap-2 px-5 py-2.5 text-sm text-gray-700 hover:text-blue-700 hover:bg-blue-50 transition-colors font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Auth section ── */}
              <div className="pt-2 border-t border-gray-100 mt-2">
                {isLoggedIn ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 px-3 py-3 bg-blue-50 rounded-xl mb-2">
                      <Avatar name={user?.name} avatar={user?.avatar} />
                      <div className="min-w-0">
                        <p className="text-sm font-black text-gray-900 truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
                      </div>
                    </div>
                    <Link to="/profile" onClick={closeMobileMenu}
                      className="flex items-center gap-2 px-3 py-3 rounded-xl hover:bg-gray-50 text-gray-800 font-semibold text-sm transition-colors">
                      <FiSettings size={15} className="text-gray-500" /> My Profile
                    </Link>
                    <Link to="/orders" onClick={closeMobileMenu}
                      className="flex items-center gap-2 px-3 py-3 rounded-xl hover:bg-gray-50 text-gray-800 font-semibold text-sm transition-colors">
                      <FiPackage size={15} className="text-gray-500" /> My Orders
                    </Link>
                    <Link to="/wishlist" onClick={closeMobileMenu}
                      className="flex items-center gap-2 px-3 py-3 rounded-xl hover:bg-gray-50 text-gray-800 font-semibold text-sm transition-colors">
                      <FiHeart size={15} className="text-red-400" />
                      My Wishlist
                      {wishlistCount > 0 && (
                        <span className="ml-auto text-xs bg-red-100 text-red-600 font-black px-2 py-0.5 rounded-full">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>
                    <button onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-3 rounded-xl hover:bg-red-50 text-red-600 font-semibold text-sm transition-colors">
                      <FiLogOut size={15} /> Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 px-1">
                    <button
                      onClick={() => { navigate('/login'); closeMobileMenu() }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full font-bold text-sm transition-colors shadow-md shadow-blue-100"
                    >
                      Login / Sign Up
                    </button>
                    <p className="text-center text-xs text-gray-500">
                      Get access to orders, wishlist & more
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}

export default Navbar