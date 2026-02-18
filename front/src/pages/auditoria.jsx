import React, { useState, useEffect, useRef, useCallback } from 'react';
import 'react-quill/dist/quill.snow.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-datepicker/dist/react-datepicker.css';
import useUsuariosController from '../controller/userController.jsx';
import { Popover, OverlayTrigger, Tooltip as BootstrapTooltip } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import useMesaController from '../controller/MesaController.jsx';
import useCaseController from '../controller/CasesController.jsx';
import useAsistenciaController from '../controller/AsistenciaController.jsx';

const Auditoria = () => {
    const navigate = useNavigate();

    const { getMesas } = useMesaController();
    const { users, getUsers } = useUsuariosController();
    const { getCasesFecha, getCasesPenFecha } = useCaseController();
    const { getAsistenciasCaso } = useAsistenciaController();

    const [casosPen, setCasosPen] = useState([])
    const [userData, setUserData] = useState([]);
    const [asistencias, setAsistencias] = useState([]);
    const [asistenciasAll, setAsistenciasAll] = useState([]);
    const [casosRes, setCasosRes] = useState([]);
    const [mesas, setMesas] = useState([]);
    const [imageSrc, setImageSrc] = useState([]);
    const [usuarios, setUsuarios] = useState({});
    const [selectedMesa, setSelectedMesa] = useState([]);

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [orderDirection, setOrderDirection] = useState(null);
    const [orderColumn, setOrderColumn] = useState(null);

    const lastRowRef = useRef(null);
    const [filterText, setFilterText] = useState('');

    const filteredCases = mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.asistencia)[0]
        ? casosPen.filter(caso =>
            (selectedMesa.id === caso.mesa) && // Filtra por mesa
            (caso.id.toString().includes(filterText) ||
                caso.admission.toString().includes(filterText) ||
                caso.patient_id.toString().includes(filterText) ||
                caso.description.toString().toUpperCase().includes(filterText.toUpperCase()) ||
                caso.user_create?.toString().toUpperCase().includes(filterText.toUpperCase())
            ))
        : casosRes.filter(caso =>
            (selectedMesa.id === caso.mesa) && // Filtra por mesa
            (caso.id?.toString().includes(filterText) ||
                caso.admission?.toString().toUpperCase().includes(filterText.toUpperCase()) ||
                caso.patient_id?.toString().includes(filterText) ||
                caso.description?.toString().toUpperCase().includes(filterText.toUpperCase()) ||
                caso.responsable?.toString().toUpperCase().includes(filterText.toUpperCase()) ||
                caso.user_create?.toString().toUpperCase().includes(filterText.toUpperCase()) ||
                caso.user_pend?.toString().toUpperCase().includes(filterText.toUpperCase()) ||
                caso.user_process?.toString().toUpperCase().includes(filterText.toUpperCase()) ||
                caso.user_resolved?.toString().toUpperCase().includes(filterText.toUpperCase())
            )
        );

    // Obtener usuarios al montar el componente
    useEffect(() => {
        if (users.length === 0) {
            getUsers();
        }
    }, [users, getUsers]);

    useEffect(() => {
        const intervalId = setInterval(fetchMesas, (mesas.length > 0 ? 600000 : 10));

        return () => clearInterval(intervalId);
    }, [fetchMesas, mesas]);

    async function fetchUsers() {
        try {
            const users = await getUsers();
            if (users && users.length > 0 && Array.isArray(users)) {
                if (JSON.stringify(users) !== JSON.stringify(usuarios)) {
                    setUsuarios(users);
                }
            } else {
                console.warn("No se encontraron usuarios o los datos no son una matriz.");
            }

        } catch (error) {
            console.error('Error al obtener los usuarios', error);
        }
    }

    useEffect(() => {
        const intervalId2 = setInterval(fetchUsers, (usuarios.length > 0 ? 600000 : 10));

        return () => clearInterval(intervalId2);
    }, [fetchUsers, usuarios]);

    const handleMesaChange = (e) => {
        const id = mesas.find(mesa => mesa.nombre == e.target.value).id
        const aux = {
            id: id,
            nombre: e.target.value
        }
        setSelectedMesa(aux); // Actualiza el estado con el valor seleccionado
    };

    async function fetchMesas() {
        try {
            const table = await getMesas();
            if (table && table.length > 0 && Array.isArray(table)) {
                if (JSON.stringify(table) !== JSON.stringify(mesas)) {
                    setMesas(table);
                }
            }
        } catch (error) {
            console.error('Error al obtener las mesas', error);
        }
    }

    async function fetchCasos(start, end) {
        try {
            const state = mesas.filter(mesa => mesa.id === selectedMesa.id)
            console.log(state)

            if (state.length > 0 && state[0].estado === false) {
                sessionStorage.removeItem('userData')
                navigate('/')
            }

            if (mesas.filter(mesa => mesa.id == selectedMesa.id).map(mesa => mesa.asistencia)[0]) {
                const casesPen = await getCasesPenFecha(selectedMesa.id, start, end);
                if (Array.isArray(casesPen)) {
                    if (JSON.stringify(casesPen) !== JSON.stringify(casosPen)) {
                        setCasosPen(casesPen);
                    }
                }

                console.log(casesPen)
                setImageSrc(imgRuta(casesPen, "./adjuntoMesa"));

                const resultados = await Promise.all(
                    casesPen.map(async (casoPen) => {
                        console.log(casoPen.id)
                        return await getAsistenciasCaso(casoPen.id);
                    })
                );

                const asis = resultados.filter(as => as && as !== false).flat()
                if (asis && asis.length > 0 && Array.isArray(asis)) {
                    if (JSON.stringify(asis) !== JSON.stringify(asistencias)) {
                        setAsistencias(asis);
                    }
                }
                console.log(asis)
            }
            else {
                const casesRes = await getCasesFecha(selectedMesa.id, start, end);
                if (Array.isArray(casesRes)) {
                    if (JSON.stringify(casesRes) !== JSON.stringify(casosRes)) {
                        setCasosRes(casesRes);
                    }
                }

                console.log(casesRes)
                setImageSrc(imgRuta(casesRes, "./adjuntoMesa"));
            }
        } catch (error) {
            console.error('Error al obtener los casos', error);
        }
    }

    const imgRuta = (casos, ruta) => {
        const imageUrls = [];

        casos.forEach(caso => {
            if (caso.documentoCreate || caso.documento || caso.documentoPro || caso.documentoRes) {
                const img = caso.documentoCreate ? 'https://10.20.2.170:3030/case/download' + caso.documentoCreate.replace(ruta, "") : null;
                const img2 = caso.documento ? 'https://10.20.2.170:3030/case/download' + caso.documento.replace(ruta, "") : null;
                const img3 = caso.documentoPro ? 'https://10.20.2.170:3030/case/download' + caso.documentoPro.replace(ruta, "") : null;
                const img4 = caso.documentoRes ? 'https://10.20.2.170:3030/case/download' + caso.documentoRes.replace(ruta, "") : null;
                imageUrls.push({
                    url: img,
                    url2: img2,
                    url3: img3,
                    url4: img4,
                    id: caso.id
                });
            } else {
                imageUrls.push({
                    url: null,
                    id: caso.id
                });
            }
        });

        return imageUrls
    }

    // Verificar si hay datos de usuario en sessionStorage
    useEffect(() => {
        const storedUserData = sessionStorage.getItem('userData');
        if (storedUserData) {
            setUserData(JSON.parse(storedUserData));
        }
    }, [navigate, setUserData]);

    function handleDateChange(dates) {
        const [start, end] = dates;

        if (end) {
            end.setHours(23, 59, 59, 999);
        }

        setStartDate(start);
        setEndDate(end);
        if (end) {
            fetchCasos(start, end);
        }
    };

    const popover = (
        <Popover id="popover-date-picker">
            <Popover.Body>
                <DatePicker
                    selected={startDate}
                    onChange={handleDateChange}
                    startDate={startDate}
                    endDate={endDate}
                    selectsRange
                    isClearable
                    inline
                    dateFormat="dd/MM/yyyy"
                    maxDate={new Date()} // No permitir fechas futuras
                />
            </Popover.Body>
        </Popover>
    );

    const variants = {
        hidden: {
            opacity: 0
        },
        visible: {
            opacity: 1,
            transition: {
                duration: 1.5
            }
        }
    }

    function getSortedCases() {
        var filter = null;

        //Muestra todo menos el caso que ya respondiste
        console.log(mesas.filter(mesa => mesa.id == selectedMesa.id).map(mesa => mesa.asistencia)[0])
        if (mesas.filter(mesa => mesa.id == selectedMesa.id).map(mesa => mesa.asistencia)[0]) {
            console.log(filteredCases)
            filter = filteredCases.filter(caso =>
                !asistencias.some(asistencia => asistencia.caso == caso.id)
            );
        }

        if (orderColumn === 'cedula') {
            if (orderDirection === 'asc') {
                return [...(filter == null ? filteredCases : filter)].sort((a, b) => a.patient_id - b.patient_id);
            } else if (orderDirection === 'desc') {
                return [...(filter == null ? filteredCases : filter)].sort((a, b) => b.patient_id - a.patient_id);
            }
        } else if (orderColumn === 'caso') {
            if (orderDirection === 'asc') {
                return [...(filter == null ? filteredCases : filter)].sort((a, b) => a.id - b.id);
            } else if (orderDirection === 'desc') {
                return [...(filter == null ? filteredCases : filter)].sort((a, b) => b.id - a.id);
            }
        } else if (orderColumn === 'admission') {
            if (orderDirection === 'asc') {
                return [...(filter == null ? filteredCases : filter)].sort((a, b) => parseInt(a.admission.replace("AS", "")) - parseInt(b.admission.replace("AS", "")));
            } else if (orderDirection === 'desc') {
                return [...(filter == null ? filteredCases : filter)].sort((a, b) => parseInt(b.admission.replace("AS", "")) - parseInt(a.admission.replace("AS", "")));
            }
        }
        else if (orderColumn === 'valor') {
            if (orderDirection === 'asc') {
                return [...(filter == null ? filteredCases : filter)].sort((a, b) => a.valor - b.valor);
            } else if (orderDirection === 'desc') {
                return [...(filter == null ? filteredCases : filter)].sort((a, b) => b.valor - a.valor);
            }
        }
        return (filter == null ? filteredCases : filter);
    };

    const handleSortByCedula = () => {
        if (orderColumn !== 'cedula') {
            setOrderColumn('cedula');
            setOrderDirection('asc');
        } else if (orderDirection === 'asc') {
            setOrderDirection('desc');
        } else if (orderDirection === 'desc') {
            setOrderDirection(null);
            setOrderColumn(null);
        } else {
            setOrderDirection('asc');
        }
    };

    function handleSortByCaso() {
        if (orderColumn !== 'caso') {
            // Al hacer clic en una nueva columna, inicia con ascendente y cambia el estado
            setOrderColumn('caso');
            setOrderDirection('asc');
        } else if (orderDirection === 'asc') {
            setOrderDirection('desc');
        } else if (orderDirection === 'desc') {
            setOrderDirection(null);
            setOrderColumn(null);
        } else {
            setOrderDirection('asc');
        }
    };

    function handleSortByAdmission() {
        if (orderColumn !== 'admission') {
            // Al hacer clic en una nueva columna, comienza con ascendente
            setOrderColumn('admission');
            setOrderDirection('asc');
        } else if (orderDirection === 'asc') {
            setOrderDirection('desc');
        } else if (orderDirection === 'desc') {
            setOrderDirection(null);
            setOrderColumn(null);
        } else {
            setOrderDirection('asc');
        }
    };

    function indexImageSrc(messageId, img) {
        try {
            return [
                img.find(item => item.id === messageId.id).url,
                img.find(item => item.id === messageId.id).url2,
                img.find(item => item.id === messageId.id).url3,
                img.find(item => item.id === messageId.id).url4
            ]
        } catch (error) {
            return ''
        }
    };

    // Renderizado del formulario
    return (
        <motion.div
            className={`chat-container container ${window.innerWidth > 600 ? 'mt-4' : ''}`}
            initial='hidden'
            animate='visible'
            variants={variants}
        >
            <div className='d-flex'>
                <div>
                    <select
                        id="accion"
                        name="accion"
                        className="form-select"
                        value={selectedMesa?.nombre || ''}
                        onChange={handleMesaChange}
                    >
                        <option value="" disabled hidden>Seleccione una mesa</option>
                        {mesas.length > 0 && mesas.map(mesa => !mesa.nombre.toLowerCase().includes('prueba') &&(
                            <option key={mesa.id} value={mesa.nombre}>{mesa.nombre}</option>
                        ))}
                    </select>
                </div>
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Filtrar mensaje por caso, admision, descripcion, cedula del creador o del personal que responde."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        style={{ maxHeight: 'fit-content' }}
                        disabled={!selectedMesa?.nombre?.trim()}
                    />
                    <div className="input-group-append">
                        <OverlayTrigger
                            trigger="click"
                            placement="bottom"
                            overlay={popover}
                            rootClose // Para cerrar el popover al hacer clic fuera de él
                        >
                            <button type="button" className="btn btn-outline-secundary" disabled={!selectedMesa?.nombre?.trim()}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-calendar" viewBox="0 0 16 16">
                                    <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" />
                                </svg>
                            </button>
                        </OverlayTrigger>
                    </div>
                </div>
            </div>
            {(filterText && (!endDate || !selectedMesa?.nombre.trim())) && (<p className='text-danger fw-bold text-center'>Debe colocar la fecha inicial y fecha final</p>)}
            <div className="chat-box bg-light p-3 border rounded mt-4">
                <div className="chat-messages mb-3">
                    {((casosRes.length > 0 || casosPen.length > 0) && imageSrc.length > 0) ? (
                        <div className="table-responsive">
                            <table className="table table-striped table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th onClick={handleSortByCaso} style={{ cursor: 'pointer', maxWidth: mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.asistencia)[0] ? '80px' : '15px ' }}>
                                            {mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.asistencia)[0] ? "# Comunicado" : "Caso"}
                                            {
                                                orderColumn === "caso" ? (
                                                    orderDirection ?
                                                        orderDirection === "asc" ?
                                                            <img className='clasificar' src='../clasificar-abajo.png' ></img>
                                                            :
                                                            <img className='clasificar' src='../clasificar-arriba.png'></img>
                                                        : <img className='clasificar' src='../clasificar.png'></img>)
                                                    : <img className='clasificar' src='../clasificar.png'></img>
                                            }
                                        </th>
                                        {mesas.length > 0 && mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.patientEnable)[0] && (
                                            <>
                                                <th onClick={handleSortByAdmission}
                                                    style={mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.asistencia)[0] != null ? { cursor: 'pointer' } : {}}
                                                >
                                                    {mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.asistencia)[0] != null ? 'Admision' : 'Origen Paciente'}
                                                    {mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.asistencia)[0] != null && (
                                                        orderColumn === "admission" ? (
                                                            orderDirection ?
                                                                orderDirection === "asc" ?
                                                                    <img className='clasificar' src='../clasificar-abajo.png' ></img>
                                                                    :
                                                                    <img className='clasificar' src='../clasificar-arriba.png'></img>
                                                                : <img className='clasificar' src='../clasificar.png'></img>)
                                                            : <img className='clasificar' src='../clasificar.png'></img>
                                                    )}
                                                </th>
                                                {mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.asistencia)[0] == null && (
                                                    <th>Destino Paciente</th>
                                                )}
                                                <th>Paciente</th>
                                                <th onClick={handleSortByCedula} style={{ cursor: 'pointer' }}>Cedula
                                                    {
                                                        orderColumn === "cedula" ? (
                                                            orderDirection ?
                                                                orderDirection === "asc" ?
                                                                    <img className='clasificar' src='../clasificar-abajo.png' ></img>
                                                                    :
                                                                    <img className='clasificar' src='../clasificar-arriba.png'></img>
                                                                : <img className='clasificar' src='../clasificar.png'></img>)
                                                            : <img className='clasificar' src='../clasificar.png'></img>
                                                    }
                                                </th>
                                            </>
                                        )}
                                        {mesas.length > 0 && mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.patientEnable)[0] === null && (
                                            <>
                                                <th>Admision</th>
                                                <th>Responsable</th>
                                            </>
                                        )}
                                        <th>{mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.asistencia)[0] != null ? 'Descripcion' : 'Indicaciones'}</th>
                                        {mesas.length > 0 && mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.patientEnable)[0] === false && (
                                            <>
                                                <th>{mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.asistencia)[0] ? "Respuestas" : "Responsable"}</th>
                                            </>
                                        )}
                                        <th>Creado</th>
                                        {(mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.adjunto)[0]
                                            ?
                                            (mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.patientEnable)[0] == true
                                                ||
                                                mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.patientEnable)[0] == false)
                                                ?
                                                false
                                                :
                                                true
                                            :
                                            true
                                        ) && (
                                                <th>F. Creación</th>
                                            )
                                        }
                                        {!mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.asistencia)[0] && (
                                            <>
                                                <th>Encargado</th>
                                                {(mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.adjunto)[0]
                                                    ?
                                                    ((mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.patientEnable)[0] == true
                                                        ||
                                                        mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.patientEnable)[0] == false)
                                                    )
                                                        ?
                                                        false
                                                        :
                                                        true
                                                    :
                                                    true
                                                )
                                                    &&
                                                    (mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.asistencia)[0] != null) && (
                                                        <th>F. Pend</th>
                                                    )
                                                }
                                                {mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.asistencia)[0] != null && (
                                                    <th>Comentario</th>
                                                )}
                                                <th>Estado</th>
                                                {(mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.adjunto)[0]
                                                    ?
                                                    (mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.patientEnable)[0] == true
                                                        ||
                                                        mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.patientEnable)[0] == false)
                                                        ?
                                                        false
                                                        :
                                                        true
                                                    :
                                                    true
                                                ) && (
                                                        <th>F. Resuelto</th>
                                                    )
                                                }

                                            </>
                                        )}
                                        {(mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.adjunto)[0]) && (
                                            <th>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="currentColor" className="bi bi-paperclip" viewBox="0 0 16 16">
                                                    <path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0z" />
                                                </svg>
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {!mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.asistencia)[0] ? (
                                        getSortedCases().length > 0 && getSortedCases().map((caso, index) => (
                                            <tr key={index} ref={index === casosRes.length - 1 ? lastRowRef : null}>
                                                <td>{caso.id}</td>
                                                {mesas.length > 0 && mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.patientEnable)[0] === null && (
                                                    <>
                                                        <td>{caso.numFactura}</td>
                                                        <td>{caso.responsable}</td>
                                                    </>
                                                )}

                                                {mesas.length > 0 && mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.patientEnable)[0] && (
                                                    <>
                                                        <td>{caso.admission}</td>
                                                        {mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.asistencia)[0] == null && (
                                                            <td>{caso.destinoPaciente}</td>
                                                        )}
                                                        <td className="text-wrap" style={{ maxWidth: '100px', whiteSpace: 'pre-wrap' }}>{caso.patient_name}</td>
                                                        <td>{caso.patient_id}</td>
                                                    </>
                                                )}
                                                <td className="text-wrap" style={{ maxWidth: '100px', whiteSpace: 'pre-wrap' }}>{caso.description}</td>
                                                {mesas.length > 0 && mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.patientEnable)[0] === false && (
                                                    <td>{caso.responsable}</td>
                                                )}
                                                <td className="text-wrap" style={{ maxWidth: '100px', whiteSpace: 'pre-wrap' }}>{
                                                    (mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.adjunto)[0]
                                                        ?
                                                        (mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.patientEnable)[0] == true
                                                            ||
                                                            mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.patientEnable)[0] == false)
                                                            ?
                                                            false
                                                            :
                                                            true
                                                        :
                                                        true
                                                    )
                                                        ?
                                                        caso.user_create
                                                        :
                                                        <p> {caso.user_create + " "}
                                                            <OverlayTrigger
                                                                placement="top"
                                                                overlay={
                                                                    <BootstrapTooltip id="tooltip-right">
                                                                        <p>{new Date(caso.createdAt).toLocaleString().replace(',', '')}</p>
                                                                    </BootstrapTooltip>
                                                                }
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="12" fill="currentColor" className="bi bi-info-circle" viewBox="0 0 16 16">
                                                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                                                    <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
                                                                </svg>
                                                            </OverlayTrigger>
                                                        </p>
                                                }</td>
                                                {!mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.adjunto)[0] && (
                                                    <td className="text-wrap" style={{ maxWidth: '30px', whiteSpace: 'pre-wrap' }}>{new Date(caso.createdAt).toLocaleString().replace(',', '')}</td>
                                                )}
                                                <td className="text-wrap" style={{ maxWidth: '100px', whiteSpace: 'pre-wrap' }}>{
                                                    (!mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.adjunto)[0]
                                                        ?
                                                        (mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.asistencia)[0] == null)
                                                            ?
                                                            true
                                                            :
                                                            false
                                                        :
                                                        false
                                                    )
                                                        ?
                                                        caso.user_resolved
                                                        :
                                                        <>
                                                            <div>
                                                                {caso.user_pend != null && (
                                                                    <p>{caso.user_pend + " "}
                                                                        <OverlayTrigger
                                                                            placement="top"
                                                                            overlay={
                                                                                <BootstrapTooltip id="tooltip-right">
                                                                                    <p>{new Date(caso.fechaEstado).toLocaleString().replace(',', '')}</p>
                                                                                </BootstrapTooltip>
                                                                            }
                                                                        >
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="12" fill="currentColor" className="bi bi-info-circle" viewBox="0 0 16 16">
                                                                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                                                                <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
                                                                            </svg>
                                                                        </OverlayTrigger>
                                                                    </p>
                                                                )}
                                                                {caso.user_process != null && (
                                                                    <p>{caso.user_process + " "}
                                                                        <OverlayTrigger
                                                                            placement="top"
                                                                            overlay={
                                                                                <BootstrapTooltip id="tooltip-right">
                                                                                    <p>{new Date(caso.processAt).toLocaleString().replace(',', '')}</p>
                                                                                </BootstrapTooltip>
                                                                            }
                                                                        >
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="12" fill="currentColor" className="bi bi-info-circle" viewBox="0 0 16 16">
                                                                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                                                                <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
                                                                            </svg>
                                                                        </OverlayTrigger>
                                                                    </p>
                                                                )}
                                                                <p>{caso.user_resolved + " "}
                                                                    <OverlayTrigger
                                                                        placement="top"
                                                                        overlay={
                                                                            <BootstrapTooltip id="tooltip-right">
                                                                                <p>{new Date(caso.resolvedAt).toLocaleString().replace(',', '')}</p>
                                                                            </BootstrapTooltip>
                                                                        }
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="12" fill="currentColor" className="bi bi-info-circle" viewBox="0 0 16 16">
                                                                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                                                            <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
                                                                        </svg>
                                                                    </OverlayTrigger>
                                                                </p>
                                                            </div>
                                                        </>
                                                }</td>
                                                {(mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.adjunto)[0]
                                                    ?
                                                    (mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.patientEnable)[0] == true
                                                        ||
                                                        mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.patientEnable)[0] == false)
                                                        ?
                                                        false
                                                        :
                                                        true
                                                    :
                                                    true
                                                ) &&
                                                    (mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.asistencia)[0] != null) && (
                                                        <td className="text-wrap" style={{ maxWidth: '30px', whiteSpace: 'pre-wrap' }}>{new Date(caso.fechaEstado).toLocaleString().replace(',', '')}</td>
                                                    )}
                                                {mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.asistencia)[0] != null && (
                                                    <td className="text-wrap" style={{ maxWidth: '100px', whiteSpace: 'pre-wrap' }}>{caso.comentario}</td>
                                                )}
                                                <td>{caso.estado ? "Finalizado" : "En Proceso"}</td>
                                                {(mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.adjunto)[0]
                                                    ?
                                                    (mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.patientEnable)[0] == true
                                                        ||
                                                        mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.patientEnable)[0] == false)
                                                        ?
                                                        false
                                                        :
                                                        true
                                                    :
                                                    true
                                                ) && (
                                                        <td className="text-wrap" style={{ maxWidth: '90px', whiteSpace: 'pre-wrap' }}>{new Date(caso.resolvedAt).toLocaleString().replace(',', '')}</td>
                                                    )
                                                }
                                                {((caso?.documento || caso?.documentoRes) && mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.adjunto)[0]) && (
                                                    <td className="text-wrap" style={{ maxWidth: '50px', whiteSpace: 'pre-wrap', paddingLeft: 0, paddingRight: 0 }}>
                                                        <div className='d-inline-flex'
                                                            style={mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.patientEnable)[0] == true ? { marginLeft: '-15px' } : {}}
                                                        >
                                                            <OverlayTrigger
                                                                placement="top"
                                                                overlay={
                                                                    <BootstrapTooltip id="tooltip-right">
                                                                        <p>Creado</p>
                                                                    </BootstrapTooltip>
                                                                }
                                                            >
                                                                <div>
                                                                    {caso?.documentoCreate ? (
                                                                        <a href={indexImageSrc(caso, imageSrc)[0]}>
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="currentColor" className="bi bi-paperclip" viewBox="0 0 16 16">
                                                                                <path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0z" />
                                                                            </svg>
                                                                        </a>
                                                                    )
                                                                        :
                                                                        <p style={{ marginLeft: '7px' }}>ㅤ</p>
                                                                    }
                                                                </div>
                                                            </OverlayTrigger>
                                                            <OverlayTrigger
                                                                placement="top"
                                                                overlay={
                                                                    <BootstrapTooltip id="tooltip-right">
                                                                        <p>Pendiente</p>
                                                                    </BootstrapTooltip>
                                                                }
                                                            >
                                                                <div>
                                                                    {caso?.documento ? (
                                                                        <a href={indexImageSrc(caso, imageSrc)[1]}>
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="currentColor" className="bi bi-paperclip" viewBox="0 0 16 16">
                                                                                <path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0z" />
                                                                            </svg>
                                                                        </a>
                                                                    )
                                                                        :
                                                                        <p style={{ marginLeft: '7px' }}>ㅤ</p>
                                                                    }
                                                                </div>
                                                            </OverlayTrigger>
                                                            <OverlayTrigger
                                                                placement="top"
                                                                overlay={
                                                                    <BootstrapTooltip id="tooltip-right">
                                                                        <p>Proceso</p>
                                                                    </BootstrapTooltip>
                                                                }
                                                            >
                                                                <div>
                                                                    {caso?.documentoPro ? (
                                                                        <a href={indexImageSrc(caso, imageSrc)[2]}>
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="currentColor" className="bi bi-paperclip" viewBox="0 0 16 16">
                                                                                <path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0z" />
                                                                            </svg>
                                                                        </a>
                                                                    )
                                                                        :
                                                                        <p style={{ marginLeft: '7px' }}>ㅤ</p>
                                                                    }
                                                                </div>
                                                            </OverlayTrigger>
                                                            <OverlayTrigger
                                                                placement="top"
                                                                overlay={
                                                                    <BootstrapTooltip id="tooltip-right">
                                                                        <p>Respuesta</p>
                                                                    </BootstrapTooltip>
                                                                }
                                                            >
                                                                <div>
                                                                    {caso?.documentoRes ? (
                                                                        <a href={indexImageSrc(caso, imageSrc)[3]}>
                                                                            <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="currentColor" className="bi bi-paperclip" viewBox="0 0 16 16">
                                                                                <path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0z" />
                                                                            </svg>
                                                                        </a>
                                                                    )
                                                                        :
                                                                        <p style={{ marginLeft: '7px' }}>ㅤ</p>
                                                                    }
                                                                </div>
                                                            </OverlayTrigger>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        )))
                                        :
                                        (//Asistencias
                                            console.log(filteredCases),
                                            filteredCases.length > 0 && filteredCases.map((caso, index) => (
                                                <tr key={index} ref={index === casosRes.length - 1 ? lastRowRef : null}>
                                                    <td>{caso.id}</td>
                                                    <td className="text-justify" style={{ maxWidth: '250px', whiteSpace: 'pre-wrap' }}>{caso.description}</td>
                                                    <td className="text-justify" style={{ whiteSpace: 'pre-wrap' }}>
                                                        {asistencias
                                                            .filter(dato => dato.caso == caso.id)
                                                            .map(dato => {
                                                                const usuario = usuarios.find(user => user.id_usuario == dato.cedula);
                                                                return (
                                                                    <div key={dato.id} style={{ display: 'flex', alignItems: 'center' }}>
                                                                        <span>{usuario ? usuario.nombre : "Desconocido"}</span>
                                                                        <OverlayTrigger
                                                                            placement="right"
                                                                            overlay={
                                                                                <BootstrapTooltip id={`tooltip-${dato.id}`}>
                                                                                    <p className="text-justify text-start" style={{ whiteSpace: 'pre-wrap', marginBottom: '0' }}>
                                                                                        {
                                                                                            new Date(
                                                                                                new Date(dato.fecha).getTime() + 5 * 60 * 60 * 1000 // Sumar 5 horas
                                                                                            ).toLocaleString().replace(',', '') +
                                                                                            (dato.comentario == null ? "" : "\n" + dato.comentario)
                                                                                        }
                                                                                    </p>

                                                                                </BootstrapTooltip>
                                                                            }
                                                                        >
                                                                            <motion.svg
                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                x="0px" y="0px"
                                                                                width="16"
                                                                                height="16"
                                                                                fill="currentColor"
                                                                                className="badge-info bi bi-question-circle"
                                                                                viewBox="0 0 24 24"
                                                                                style={{ marginLeft: '5px', cursor: 'pointer' }}
                                                                            >
                                                                                <path d="M 12 2 C 6.4889971 2 2 6.4889971 2 12 C 2 17.511003 6.4889971 22 12 22 C 17.511003 22 22 17.511003 22 12 C 22 6.4889971 17.511003 2 12 2 z M 12 4 C 16.430123 4 20 7.5698774 20 12 C 20 16.430123 16.430123 20 12 20 C 7.5698774 20 4 16.430123 4 12 C 4 7.5698774 7.5698774 4 12 4 z M 11 7 L 11 9 L 13 9 L 13 7 L 11 7 z M 11 11 L 11 17 L 13 17 L 13 11 L 11 11 z"></path>
                                                                            </motion.svg>
                                                                        </OverlayTrigger>
                                                                    </div>
                                                                );
                                                            })}
                                                    </td>
                                                    <td className="text-wrap" style={{ maxWidth: '100px', whiteSpace: 'pre-wrap' }}>{
                                                        (mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.adjunto)[0]
                                                            ?
                                                            (mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.patientEnable)[0] == true
                                                                ||
                                                                mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.patientEnable)[0] == false)
                                                                ?
                                                                false
                                                                :
                                                                true
                                                            :
                                                            true
                                                        )
                                                            ?
                                                            caso.user_create
                                                            :
                                                            <p> {caso.user_create + " "}
                                                                <OverlayTrigger
                                                                    placement="top"
                                                                    overlay={
                                                                        <BootstrapTooltip id="tooltip-right">
                                                                            <p>{new Date(caso.createdAt).toLocaleString().replace(',', '')}</p>
                                                                        </BootstrapTooltip>
                                                                    }
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="12" fill="currentColor" className="bi bi-info-circle" viewBox="0 0 16 16">
                                                                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                                                        <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
                                                                    </svg>
                                                                </OverlayTrigger>
                                                            </p>
                                                    }</td>
                                                    {!mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.adjunto)[0] && (
                                                        <td className="text-wrap" style={{ maxWidth: '30px', whiteSpace: 'pre-wrap' }}>{new Date(caso.createdAt).toLocaleString().replace(',', '')}</td>
                                                    )}
                                                    {((caso?.documento || caso?.documentoRes) && mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.adjunto)[0]) && (
                                                        <td className="text-wrap" style={{ maxWidth: '1px', whiteSpace: 'pre-wrap' }}>
                                                            {caso?.documento && (
                                                                <a href={indexImageSrc(caso, imageSrc)[0]}>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="currentColor" className="bi bi-paperclip" viewBox="0 0 16 16">
                                                                        <path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0z" />
                                                                    </svg>
                                                                </a>
                                                            )}
                                                        </td>
                                                    )}
                                                    {((caso?.documentoCreate) && mesas.filter(mesa => mesa.id === selectedMesa.id).map(mesa => mesa.adjunto)[0]) && (
                                                        <td>
                                                            {caso?.documentoCreate && (
                                                                <a href={indexImageSrc(caso, imageSrc)[0]}>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="currentColor" className="bi bi-paperclip" viewBox="0 0 16 16">
                                                                        <path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0z" />
                                                                    </svg>
                                                                </a>
                                                            )}
                                                        </td>
                                                    )}
                                                </tr>
                                            )
                                            )
                                        )
                                    }
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p>No hay mensajes para mostrar.</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default Auditoria;