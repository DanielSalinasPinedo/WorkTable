import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import useMesaController from '../controller/MesaController';
import { useLocation, useNavigate } from 'react-router-dom';

const FloatingMesaWindow = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    // Estado para almacenar las mesas
    const [isOpen, setIsOpen] = useState(false);
    const [mesas, setMesas] = useState([]);
    const { getMesas } = useMesaController();

    // Simulación de datos de mesas (puedes reemplazar esto con una llamada a una API)
    const fetchMesas = useCallback(async () => {
        const workTable = await getMesas();
        if (workTable.length > 0 && Array.isArray(workTable)) {
            if (JSON.stringify(workTable) !== JSON.stringify(mesas)) {
                setMesas(workTable);
            }
        }
    })

    useEffect(() => {
        fetchMesas();
    }, [navigate, location.pathname]);

    // Efecto para manejar clics fuera del menú
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Verifica si el clic ocurrió fuera del contenedor del menú
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false); // Cierra el menú
            }
        };

        // Agregar el listener al documento
        document.addEventListener('mousedown', handleClickOutside);

        // Limpiar el listener al desmontar el componente
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <motion.div
            className="floating-window"
            style={isOpen ? { maxWidth: '60%', overflowY: 'scroll', maxHeight: '80%' } : { maxWidth: '60%', maxHeight: '80%' }}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            ref={dropdownRef}
        >
            <div
                className='d-flex flex-row-reverse bd-highlight'
                style={isOpen ? { marginTop: '2px', marginRight: '3px' } : {}}
            >
                <button
                    className="mesas-button"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? 'Cerrar' : 'Mesas'}
                </button>
            </div>

            {isOpen && (
                <motion.div
                    className="content"
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {(mesas.length) > 0 ? (
                        mesas.map((mesa) => (
                            (mesa.id != 50
                                ?
                                !mesa.nombre.toLowerCase().includes('camillas')
                                    ?
                                    !mesa.nombre.toLowerCase().includes('prueba')
                                        ?
                                        true
                                        :
                                        false
                                    :
                                    false
                                :
                                false
                            ) && (
                                <div key={mesa.id} className="mesa-item">
                                    <span className="num-mesa">Mesa #{mesa.id}</span>
                                    <span className="nombre-mesa text-wrap" style={{ maxWidth: '60%', textAlign: 'end' }}>{mesa.nombre}</span>
                                </div>
                            )
                        ))
                    ) : (
                        <p>No hay mesas disponibles.</p>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
};

export default FloatingMesaWindow;