import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Cavalos from './pages/Cavalos';
import Baias from './pages/Baias';
import Proprietarios from './pages/Proprietarios';
import Layout from './components/Layout';
import RotaProtegida from './components/RotaProtegida';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Telas que exigem login */}
        <Route element={<RotaProtegida />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/cavalos" element={<Cavalos />} />
            <Route path="/baias" element={<Baias />} />
            <Route path="/proprietarios" element={<Proprietarios />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;