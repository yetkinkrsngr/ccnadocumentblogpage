import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { Suspense, lazy } from 'react'
import ProtectedRoute from './components/ProtectedRoute'
import IdleLogout from './components/IdleLogout'
import ErrorBoundary from './components/ErrorBoundary'

const Home = lazy(()=>import('./pages/Home'))
const Categories = lazy(()=>import('./pages/Categories'))
const About = lazy(()=>import('./pages/About'))
const Contact = lazy(()=>import('./pages/Contact'))
const Post = lazy(()=>import('./pages/Post'))
const LoginPage = lazy(()=>import('./pages/Login'))
const RegisterPage = lazy(()=>import('./pages/Register'))
const AuthCallback = lazy(()=>import('./pages/AuthCallback'))
const SearchPage = lazy(()=>import('./pages/Search'))

const Dashboard = lazy(()=>import('./admin/Dashboard'))
const PostsAdmin = lazy(()=>import('./admin/Posts'))
const EditPost = lazy(()=>import('./admin/EditPost'))
const CategoriesAdmin = lazy(()=>import('./admin/Categories'))
const CommentsAdmin = lazy(()=>import('./admin/Comments'))
const MediaAdmin = lazy(()=>import('./admin/Media'))
const ChangePassword = lazy(()=>import('./pages/ChangePassword'))

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <IdleLogout timeoutMs={30*60*1000} />
        <Suspense fallback={<div>Yükleniyor...</div>}>
          <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/kategoriler" element={<Categories />} />
            <Route path="/hakkinda" element={<About />} />
            <Route path="/iletisim" element={<Contact />} />
            <Route path="/yazi/:slug" element={<Post />} />
            <Route path="/ara" element={<SearchPage />} />

            {/* Üyelik */}
            <Route path="/giris" element={<LoginPage />} />
            <Route path="/kayit" element={<RegisterPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/sifre-degistir" element={<ChangePassword />} />

            {/* Admin */}
            <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin/yazilar" element={<ProtectedRoute><PostsAdmin /></ProtectedRoute>} />
            <Route path="/admin/yazilar/yeni" element={<ProtectedRoute><EditPost /></ProtectedRoute>} />
            <Route path="/admin/yazilar/:id" element={<ProtectedRoute><EditPost /></ProtectedRoute>} />
            <Route path="/admin/kategoriler" element={<ProtectedRoute><CategoriesAdmin /></ProtectedRoute>} />
            <Route path="/admin/yorumlar" element={<ProtectedRoute><CommentsAdmin /></ProtectedRoute>} />
            <Route path="/admin/medya" element={<ProtectedRoute><MediaAdmin /></ProtectedRoute>} />
          </Routes>
          </ErrorBoundary>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

export default App
