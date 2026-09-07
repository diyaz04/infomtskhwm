import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Berita } from './pages/Berita';
import { BeritaDetail } from './pages/BeritaDetail';
import { Opini } from './pages/Opini';
import { OpiniDetail } from './pages/OpiniDetail';
import { Buletin } from './pages/Buletin';
import { GuruStaf } from './pages/GuruStaf';
import { GuruStafDetail } from './pages/GuruStafDetail';
import { ProgramUnggulan } from './pages/ProgramUnggulan';
import { AdminLayout } from './components/AdminLayout';
import { Login } from './pages/admin/Login';
import { BuletinAdmin } from './pages/admin/BuletinAdmin';
import { NewsAdmin } from './pages/admin/NewsAdmin';
import { OpinionsAdmin } from './pages/admin/OpinionsAdmin';
import { StaffAdmin } from './pages/admin/StaffAdmin';
import { ProgramsAdmin } from './pages/admin/ProgramsAdmin';
import { VideosAdmin } from './pages/admin/VideosAdmin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="berita" element={<NewsAdmin />} />
          <Route path="opini" element={<OpinionsAdmin />} />
          <Route path="buletin" element={<BuletinAdmin />} />
          <Route path="guru-staf" element={<StaffAdmin />} />
          <Route path="program-unggulan" element={<ProgramsAdmin />} />
          <Route path="video" element={<VideosAdmin />} />
        </Route>

        {/* Public Routes */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex flex-col font-sans">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/berita" element={<Berita />} />
                  <Route path="/berita/:slug" element={<BeritaDetail />} />
                  <Route path="/opini" element={<Opini />} />
                  <Route path="/opini/:slug" element={<OpiniDetail />} />
                  <Route path="/buletin" element={<Buletin />} />
                  <Route path="/guru-staf" element={<GuruStaf />} />
                  <Route path="/guru-staf/:id" element={<GuruStafDetail />} />
                  <Route path="/program-unggulan" element={<ProgramUnggulan />} />
                </Routes>
              </main>
              <Footer />
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
