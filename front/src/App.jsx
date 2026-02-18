import './App.css';
import Navbar from './component/navbar.jsx'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/login.jsx';
import LoginCamilla from './pages/loginCamillas.jsx';
import Cases from './pages/cases.jsx';
import Auditoria from './pages/auditoria.jsx';
import Ubicacion from './pages/Ubicacion.jsx';
import NotFound from './pages/notfound.jsx';
import { CasesContextProvider } from './context/CasesProvider.jsx';
import { UsuarioContextProvider } from './context/UserProvider.jsx';
import { MesasContextProvider } from './context/MesasProvider.jsx';
import { AsistenciaContextProvider } from './context/AsistenciaProvider.jsx';
import { UbiActualContextProvider } from './context/UbiActualProvider.jsx';
import Mesas from './pages/Mesas.jsx';
import MesasPersona from './pages/MesasPersona.jsx';
import { ConfigContextProvider } from './context/ConfigProvider.jsx';
import { UbiDestinoContextProvider } from './context/UbiDestinoProvider.jsx'

function App() {
  return (
    <UsuarioContextProvider>
      <MesasContextProvider>
        <CasesContextProvider>
          <AsistenciaContextProvider>
            <ConfigContextProvider>
              <UbiActualContextProvider>
                <UbiDestinoContextProvider>
                  <AppContent />
                </UbiDestinoContextProvider>
              </UbiActualContextProvider>
            </ConfigContextProvider>
          </AsistenciaContextProvider>
        </CasesContextProvider>
      </MesasContextProvider>
    </UsuarioContextProvider>
  );
}

function AppContent() {
  return (
    <>
      <div>
        <Navbar />
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/login' element={<LoginCamilla />} />
          <Route path='/casos' element={<Cases />} />
          <Route path='/sa/mesas' element={<Mesas />} />
          <Route path='/mesas' element={<MesasPersona />} />
          <Route path='/lider/auditoria' element={<Auditoria />} />
          <Route path='/ubicacion' element={<Ubicacion />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
