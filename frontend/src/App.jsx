// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Header from './components/common/Header'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import OrderConfirmation from './pages/OrderConfirmation'
import Dashboard from './pages/Dashboard'
import OrderDetails from './pages/OrderDetails';

// ADMIN IMPORTS
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import ProductManagement from './pages/admin/ProductManagement'
import OrderManagement from './pages/admin/OrderManagement'
import CustomOrdersManagement from './pages/admin/CustomOrdersManagement'

// ARTISAN IMPORTS
import ArtisanDashboard from './pages/artisan/ArtisanDashboard'
import ArtisanProducts from './pages/artisan/ProductManagement'
import ArtisanOrders from './pages/artisan/OrderManagement'
import ArtisanProfile from './pages/artisan/Profile'

// PUBLIC ARTISAN PROFILE
import ArtisanPublicProfile from './pages/ArtisanPublicProfile'

import Footer from './components/common/Footer'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <Header />
            <div className="main-content">
              <Routes>
                {/* PUBLIC ROUTES */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/artisans/:artisanId" element={<ArtisanPublicProfile />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/cart" element={<Cart />} />

                {/* PROTECTED ROUTES (Any authenticated user) */}
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/order-success"
                  element={
                    <ProtectedRoute>
                      <OrderSuccess />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/order/:orderId"
                  element={
                    <ProtectedRoute>
                      <OrderDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/order-confirmation"
                  element={
                    <ProtectedRoute>
                      <OrderConfirmation />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                {/*  ADMIN PROTECTED ROUTES (Admin only) */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/products"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <ProductManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <OrderManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/custom-orders"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <CustomOrdersManagement />
                    </ProtectedRoute>
                  }
                />

                {/* ARTISAN PROTECTED ROUTES (Artisan only) */}
                <Route
                  path="/artisan"
                  element={
                    <ProtectedRoute>
                      <ArtisanDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/artisan/dashboard"
                  element={
                    <ProtectedRoute>
                      <ArtisanDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/artisan/products"
                  element={
                    <ProtectedRoute>
                      <ArtisanProducts />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/artisan/orders"
                  element={
                    <ProtectedRoute>
                      <ArtisanOrders />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/artisan/profile"
                  element={
                    <ProtectedRoute>
                      <ArtisanProfile />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </div>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

export default App