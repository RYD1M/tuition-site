import { Route, Routes } from 'react-router-dom'

import { Footer, Header } from './components/Header'
import About from './pages/About'
import Board from './pages/Board'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import PostRequest from './pages/PostRequest'
import RequestDetail from './pages/RequestDetail'
import TutorDetail from './pages/TutorDetail'
import Tutors from './pages/Tutors'

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tutions" element={<Board />} />
          <Route path="/tutions/:id" element={<RequestDetail />} />
          <Route path="/post" element={<PostRequest />} />
          <Route path="/tutors" element={<Tutors />} />
          <Route path="/tutors/:sub" element={<TutorDetail />} />
          <Route path="/me" element={<Dashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
