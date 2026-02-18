import React, { useCallback, useEffect, useState, useMemo } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useMesaController from '../controller/MesaController';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [mesas, setMesas] = useState([]);
    const [userData, setUserData] = useState(null);

    const { getMesas } = useMesaController();

    const isHomeOrMesasOrLogin = useMemo(() =>
        ['/', '/sa/mesas', '/login', '/lider/auditoria'].includes(location.pathname),
        [location.pathname]
    );

    const navbarClass = isHomeOrMesasOrLogin ? 'navbar justify-content-start' : 'navbar justify-content-between';
    const navbarTitle = isHomeOrMesasOrLogin ? 'navbar-title' : 'navbar-title-chat';

    useEffect(() => {
        const storedUserData = sessionStorage.getItem('userData');
        if (!storedUserData) {
            if (!['/sa/mesas', '/login', '/lider/auditoria', '/ubicacion'].includes(location.pathname)) {
                navigate('/');
            }
        } else {
            fetchMesas();
            setUserData(JSON.parse(storedUserData));
        }
    }, [navigate, location.pathname]);

    const fetchMesas = useCallback(async () => {
        const workTable = await getMesas();
        if (workTable?.length > 0 && JSON.stringify(workTable) !== JSON.stringify(mesas)) {
            setMesas(workTable);
        }
    }, [getMesas, mesas]);

    const handleLogout = () => {
        sessionStorage.removeItem('userData');
        navigate(currentMesa.asistencia == null ? '/login' : '/');
    };

    const handlePage = () => {
        navigate(location.pathname === '/casos' ? '/mesas' : '/casos');
    };

    const handleUbi = () => {
        navigate(location.pathname === '/casos' ? '/ubicacion' : '/casos');
    };

    const currentMesa = useMemo(() =>
        mesas.find(mesa => mesa.id === userData?.mesa),
        [mesas, userData]
    );

    const userOwnsMesa = useMemo(() =>
        mesas.some(mesa => mesa.owner === userData?.id_usuario),
        [mesas, userData]
    );

    return (
        <motion.nav className={navbarClass} style={{ padding: "1rem" }}
            initial={{ y: -250 }}
            animate={{ y: -10 }}
        >
            <motion.div className="navbar-brand">
                <span className="navbar-logo">
                    <img src="https://www.gestionsaludips.com/assets/images/logonuevo.png" alt="Logo" style={{ height: "3rem" }} />
                </span>
                <span className="navbar-caption-wrap text-gs">
                    <a className="navbar-caption text-logo" href="/">Gestión Salud IPS</a>
                </span>
            </motion.div>
            <motion.div className={navbarTitle}>
                <h1 className='title'>{
                    location.pathname === '/login'
                        ?
                        'Translados GS'
                        :
                        location.pathname === '/'
                            ?
                            'Gestión de Casos'
                            :
                            location.pathname === '/lider/auditoria'
                                ?
                                'Auditoria'
                                :
                                currentMesa?.asistencia == null
                                    ?
                                    'Translados GS'
                                    :
                                    'Gestión de Casos'
                }</h1>
            </motion.div>
            {((location.pathname === '/casos' || location.pathname === '/mesas') || location.pathname === '/casosView' || location.pathname == '/ubicacion') && (
                <div className='d-flex'>
                    {userOwnsMesa && (
                        <button type="button" className="btn btn-primary me-2" onClick={handlePage}>
                            {(location.pathname === '/casos' || location.pathname === '/casosView') ? "Mesas" : "Casos"}
                        </button>
                    )}
                    {(location.pathname == '/casos' || location.pathname == '/ubicacion') && (
                        <button type="button" className="btn btn-primary me-2" onClick={handleUbi}>
                            {location.pathname === '/casos' ? "Editar Ubicaciones" : "Casos"}
                        </button>
                    )}
                    <button type="button" className="btn btn-danger logout" onClick={handleLogout}>Cerrar Sesión</button>
                </div>
            )}
        </motion.nav>
    );
};

export default Navbar;