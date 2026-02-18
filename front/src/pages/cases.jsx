import React, { useCallback, useEffect, useState, useRef } from 'react';
import useUsuariosController from '../controller/userController';
import useCaseController from '../controller/CasesController'
import useMesaController from '../controller/MesaController'
import useAsistenciaController from '../controller/AsistenciaController'
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import { Popover, OverlayTrigger, Tooltip as BootstrapTooltip } from 'react-bootstrap';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import useUbiActualController from '../controller/UbiActualController';
import useUbiDestinoController from '../controller/UbiDestinoController';

const Cases = () => {
    const navigate = useNavigate();
    const { getUsers } = useUsuariosController();
    const { getMesas } = useMesaController();
    const { sendAsistencia, getAsistencia, getAsistencias } = useAsistenciaController();
    const { getCasesMesa, sendCase, getCasesPen, getCasesPro, getCasesRes, uptCase, uptPenCase, uptProCase, uptResCase } = useCaseController();
    const { getUbisActual } = useUbiActualController()
    const { getUbisDestino } = useUbiDestinoController()

    const [casosMesa, setCasosMesa] = useState([])
    const [casosPen, setCasosPen] = useState([])
    const [casosPro, setCasosPro] = useState([])
    const [casosRes, setCasosRes] = useState([])
    const [imageSrc, setImageSrc] = useState([]);
    const [usuarios, setUsuarios] = useState([])
    const [userData, setUserData] = useState([]);
    const [caseImg, setCaseImg] = useState([]);
    const [mesas, setMesas] = useState([]);
    const [asistencias, setAsistencias] = useState([]);
    const [asistenciasAll, setAsistenciasAll] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [ubiActual, setUbiActual] = useState([])
    const [ubiDestino, setUbiDestino] = useState([])
    const [itemsPerPage, setItemsPerPage] = useState(30); // Valor por defecto
    const [screenSize, setScreenSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    const fileInputRef = useRef(null);
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const imageContainerRef = useRef(null);

    const [comentarios, setComentarios] = useState({});
    const [selectedEstados, setSelectedEstados] = useState({});

    const [activeTab, setActiveTab] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const lastRowRef = useRef(null); // Crear una referencia al último elemento de la tabla
    const [orderColumn, setOrderColumn] = useState(null);
    const [orderDirection, setOrderDirection] = useState(null);
    const hasFetched = useRef(false);

    useEffect(() => {
        if (activeTab === 2 && !hasFetched.current) {
            fetchCasos();
            hasFetched.current = true;
        }
    }, [activeTab, fetchCasos]);

    useEffect(() => {
        const intervalId3 = setInterval(fetchAsistencia, asistenciasAll.length > 0 ? 3000 : 100);

        return () => clearInterval(intervalId3);
    }, [userData, fetchAsistencia, asistencias]);

    useEffect(() => {
        const intervalId4 = setInterval(fetchUbicacion, (ubiActual?.length > 0 && ubiDestino?.length > 0) ? 600000 : 100);

        return () => clearInterval(intervalId4);
    }, [ubiActual, ubiDestino, fetchUbicacion]);

    useEffect(() => {
        setCurrentPage(1); // Resetear a la primera página cuando cambien los filtros o pestañas
    }, [activeTab, searchTerm, orderColumn, orderDirection]);

    useEffect(() => {
        const handleResize = () => {
            setScreenSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        setTimeout(() => {
            handleResize();
        }, 100);

        const intervalId4 = setInterval(() => {
            handleResize();
        }, 1000);

        // Agregar evento de redimensionamiento
        window.addEventListener('resize', handleResize);

        // Limpieza del evento al desmontar el componente
        return () => {
            window.removeEventListener('resize', handleResize);
            clearInterval(intervalId4); // Limpiar el intervalo
        };
    }, []);

    useEffect(() => {
        // Simular tiempo de carga de 2 segundos
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2300);

        return () => clearTimeout(timer); // Limpiar el timer si el componente se desmonta
    }, []);

    async function fetchUbicacion() {
        const ubiA = await getUbisActual()
        setUbiActual(ubiA)

        const ubiD = await getUbisDestino()
        setUbiDestino(ubiD)
    }

    function getPaginatedCases() {
        const sortedCases = getSortedCases();
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sortedCases.slice(startIndex, endIndex);
    }

    async function fetchAsistencia() {
        try {
            if (mesas && mesas.length > 0 && mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0]) {
                const resultados = await Promise.all(
                    filteredCases.map(async (caso) => {
                        return await getAsistencia(userData.id_usuario, caso.id);
                    })
                );

                const asisAll = await getAsistencias();

                const asis = resultados.filter(as => as && as !== false).flat()

                if (asis && asis.length > 0 && Array.isArray(asis)) {
                    if (JSON.stringify(asis) !== JSON.stringify(asistencias)) {
                        setAsistencias(asis);
                    }
                }

                if (asisAll && asisAll.length > 0 && Array.isArray(asisAll)) {
                    if (JSON.stringify(asisAll) !== JSON.stringify(asistencias)) {
                        setAsistenciasAll(asisAll)
                    }
                }
            }
        } catch (error) {
            console.error('Error al obtener las asistencias', error);
        }
    }

    function exportToExcel(id) {
        fetchCasos()

        // Filtrar los casos por la mesa donde estás
        const casosPenFiltered = casosPen.filter(caso => caso.mesa === id);
        const casosProFiltered = casosPro.filter(caso => caso.mesa === id);
        const casosResFiltered = casosRes.filter(caso => caso.mesa === id);

        if (casosPenFiltered.length > 0 || casosProFiltered.length > 0 || casosResFiltered.length > 0) {
            // Formatear los datos para cada hoja
            const sheet1Data = casosPenFiltered.map(caso => (mesas.length > 0 && mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] === null ? {
                Caso: Number(caso.id),
                Admision: caso.numFactura,
                Responsable: caso.responsable,
                Descripcion: caso.description,
                Creado: caso.user_create,
                'F. Creacion': new Date(caso.createdAt).toLocaleString().replace(',', '')
            }
                :
                (mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] == null &&
                    mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0]) ? {
                    Caso: Number(caso.id),
                    'Origen Paciente': caso.admission,
                    'Destino Paciente': caso.destinoPaciente,
                    Paciente: caso.patient_name,
                    Cedula: caso.patient_id,
                    EPS: caso.EPS,
                    Indicaciones: caso.description,
                    Creado: caso.user_create,
                    'F. Creacion': new Date(caso.createdAt).toLocaleString().replace(',', '')
                }
                    :
                    mesas.length > 0 && mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] ? {
                        Caso: Number(caso.id),
                        Admision: caso.admission,
                        Paciente: caso.patient_name,
                        Cedula: Number(caso.patient_id),
                        EPS: caso.EPS,
                        Descripcion: caso.description,
                        Creado: caso.user_create,
                        'F. Creacion': new Date(caso.createdAt).toLocaleString().replace(',', '')
                    }
                        :
                        {
                            Caso: Number(caso.id),
                            Descripcion: caso.description,
                            Creado: caso.user_create,
                            'F. Creacion': new Date(caso.createdAt).toLocaleString().replace(',', '')
                        }));

            const sheet2Data = casosProFiltered.map(caso => (mesas.length > 0 && mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] === null ? {
                Caso: Number(caso.id),
                Admision: caso.numFactura,
                responsable: caso.responsable,
                Descripcion: caso.description,
                Creado: caso.user_create,
                'F. Creacion': new Date(caso.createdAt).toLocaleString().replace(',', ''),
                Encargado: caso.user_resolved,
                'F. Pend': new Date(caso.fechaEstado).toLocaleString().replace(',', ''),
                Estado: caso.estado ? "Finalizado" : "En Proceso",
                Comentario: caso.comentario
            }
                : (mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] != null &&
                    mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0]) ? {
                    Caso: Number(caso.id),
                    Admision: caso.admission,
                    Paciente: caso.patient_name,
                    Cedula: Number(caso.patient_id),
                    EPS: caso.EPS,
                    Descripcion: caso.description,
                    Creado: caso.user_create,
                    'F. Creacion': new Date(caso.createdAt).toLocaleString().replace(',', ''),
                    Encargado: caso.user_resolved,
                    'F. Pend': new Date(caso.fechaEstado).toLocaleString().replace(',', ''),
                    Estado: caso.estado ? "Finalizado" : "En Proceso",
                    Comentario: caso.comentario
                }
                    :
                    {
                        Caso: Number(caso.id),
                        Descripcion: caso.description,
                        Creado: caso.user_create,
                        'F. Creacion': new Date(caso.createdAt).toLocaleString().replace(',', ''),
                        Encargado: caso.user_resolved,
                        'F. Pend': new Date(caso.fechaEstado).toLocaleString().replace(',', ''),
                        Estado: caso.estado ? "Finalizado" : "En Proceso",
                        Comentario: caso.comentario
                    }));

            const sheet3Data = casosResFiltered.map(caso => (mesas.length > 0 && mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] === null ? {
                Caso: Number(caso.id),
                Admision: caso.numFactura,
                responsable: caso.responsable,
                Descripcion: caso.description,
                Creado: caso.user_create,
                'F. Creacion': new Date(caso.createdAt).toLocaleString().replace(',', ''),
                Encargado: caso.user_resolved,
                'F. Pend': new Date(caso.fechaEstado).toLocaleString().replace(',', ''),
                Comentario: caso.comentario,
                Estado: caso.estado ? "Finalizado" : "En Proceso",
                'F. Resuelto': new Date(caso.resolvedAt).toLocaleString().replace(',', ''),
            }
                : (mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] == null &&
                    mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0]) ?
                    {
                        Caso: Number(caso.id),
                        'Origen Paciente': caso.admission,
                        'Destino Paciente': caso.destinoPaciente,
                        Paciente: caso.patient_name,
                        Cedula: caso.patient_id,
                        EPS: caso.EPS,
                        Indicaciones: caso.description,
                        Creado: caso.user_create,
                        'F. Creacion': new Date(caso.createdAt).toLocaleString().replace(',', ''),
                        Encargado: caso.user_resolved,
                        Estado: caso.estado ? "Finalizado" : "Pendiente",
                        'F. Resuelto': new Date(caso.resolvedAt).toLocaleString().replace(',', ''),
                    }
                    : mesas.length > 0 && mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] ? {
                        Caso: Number(caso.id),
                        Admision: caso.admission,
                        Paciente: caso.patient_name,
                        Cedula: Number(caso.patient_id),
                        EPS: caso.EPS,
                        Descripcion: caso.description,
                        Creado: caso.user_create,
                        'F. Creacion': new Date(caso.createdAt).toLocaleString().replace(',', ''),
                        Encargado: caso.user_resolved,
                        'F. Resuelto': new Date(caso.resolvedAt).toLocaleString().replace(',', ''),
                        Comentario: caso.comentario,
                        Estado: caso.estado ? "Finalizado" : "En Proceso",
                        'F. Pend': new Date(caso.fechaEstado).toLocaleString().replace(',', '')
                    }
                        :
                        {
                            Caso: Number(caso.id),
                            Descripcion: caso.description,
                            Creado: caso.user_create,
                            'F. Creacion': new Date(caso.createdAt).toLocaleString().replace(',', ''),
                            Encargado: caso.user_resolved,
                            'F. Resuelto': new Date(caso.resolvedAt).toLocaleString().replace(',', ''),
                            Comentario: caso.comentario,
                            Estado: caso.estado ? "Finalizado" : "En Proceso",
                            'F. Pend': new Date(caso.fechaEstado).toLocaleString().replace(',', '')
                        }));

            // Crear un nuevo libro de trabajo
            const workbook = XLSX.utils.book_new();

            // Agregar hojas al libro
            const worksheet1 = XLSX.utils.json_to_sheet(sheet1Data);
            const worksheet2 = XLSX.utils.json_to_sheet(sheet2Data);
            const worksheet3 = XLSX.utils.json_to_sheet(sheet3Data);

            XLSX.utils.book_append_sheet(workbook, worksheet1, "Casos Pendientes");
            {
                mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] != null && (
                    XLSX.utils.book_append_sheet(workbook, worksheet2, "Casos en Proceso")
                )
            }
            XLSX.utils.book_append_sheet(workbook, worksheet3, "Casos Resueltos");

            // Guardar el archivo
            XLSX.writeFile(workbook, "reporte_casos.xlsx");
        }
    };

    function getSortedCases() {
        var filter = null;

        //Muestra todo menos el caso que ya respondiste
        if (mesas.filter(mesa => mesa.id == userData.mesa).map(mesa => mesa.asistencia)[0]) {
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
        else if (orderColumn === 'EPS') {
            const cleanString = (str) => {
                if (!str) return ""; // Maneja null/undefined
                return str.trim().replace(/[^a-zA-Z0-9 ]/g, "").toLowerCase();
            };

            if (orderDirection === 'asc') {
                return [...(filter == null ? filteredCases : filter)].sort((a, b) => {
                    const epsA = cleanString(a.EPS);
                    const epsB = cleanString(b.EPS);
                    if (!epsA && epsB) return 1;  // Casos vacíos al final
                    if (epsA && !epsB) return -1;
                    return epsA.localeCompare(epsB);
                });
            } else if (orderDirection === 'desc') {
                return [...(filter == null ? filteredCases : filter)].sort((a, b) => {
                    const epsA = cleanString(a.EPS);
                    const epsB = cleanString(b.EPS);
                    if (!epsA && epsB) return 1;  // Casos vacíos al final
                    if (epsA && !epsB) return -1;
                    return epsB.localeCompare(epsA);
                });
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

    const handleSortByEPS = () => {
        if (orderColumn !== 'EPS') {
            setOrderColumn('EPS');
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

    function handleSortByValor() {
        if (orderColumn !== 'valor') {
            setOrderColumn('valor');
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

    useEffect(() => {
        // Realizar scroll hacia el último elemento al cambiar de pestaña
        if (lastRowRef.current && activeTab != 2) {
            lastRowRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [activeTab]); // Ejecutar el efecto cuando cambie activeTab

    useEffect(() => {
        const storedUserData = sessionStorage.getItem('userData');
        if (!storedUserData) {
            navigate('/');
        } else {
            setUserData(JSON.parse(storedUserData));
        }
    }, [navigate, setUserData]);

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

    async function fetchCasos() {
        try {
            const state = mesas.filter(mesa => mesa.id === userData.mesa)

            if (state.length > 0 && state[0].estado === false) {
                sessionStorage.removeItem('userData')
                navigate('/')
            }

            const casesMesa = await getCasesMesa(userData?.mesa);
            if (Array.isArray(casesMesa)) {
                if (JSON.stringify(casesMesa) !== JSON.stringify(casosMesa)) {
                    setCasosMesa(casesMesa);
                }
            }

            const casesPro = await getCasesPro(userData?.mesa);
            if (Array.isArray(casesPro)) {
                if (JSON.stringify(casesPro) !== JSON.stringify(casosPro)) {
                    setCasosPro(casesPro);
                }
            }

            const casesPen = await getCasesPen(userData?.mesa);
            if (Array.isArray(casesPen)) {
                if (JSON.stringify(casesPen) !== JSON.stringify(casosPen)) {
                    setCasosPen(casesPen);
                }
            }

            if (userData.mesa) {
                const casesRes = await getCasesRes(userData.mesa);
                if (Array.isArray(casesRes)) {
                    if (JSON.stringify(casesRes) !== JSON.stringify(casosRes)) {
                        setCasosRes(casesRes);
                    }
                }
            }

            const table = await getMesas();
            if (table && table.length > 0 && Array.isArray(table)) {
                if (JSON.stringify(table) !== JSON.stringify(mesas)) {
                    setMesas(table);
                }
            }

            setImageSrc(imgRuta(casosMesa, "./adjuntoMesa"));
        } catch (error) {
            console.error('Error al obtener los casos o las mesas', error);
        }
    }

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

    const validationSchema = Yup.object().shape(mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] != null ? {
        admission: Yup.string().required('Campo requerido'),
        patient_name: Yup.string().required('Campo requerido'),
        patient_id: Yup.string().required('Campo requerido'),
        description: Yup.string().required('Campo requerido')
    }
        :
        {
            admission: Yup.string().required('Campo requerido'),
            areaSalida: Yup.string().required('Campo requerido'),
            patient_name: Yup.string().required('Campo requerido'),
            patient_id: Yup.string().required('Campo requerido')
        }
    );

    const validationSchemaD = Yup.object().shape({
        description: Yup.string().required('Campo requerido')
    });
    const validationSchemaF = Yup.object().shape({
        factura: Yup.string().required('Campo requerido'),
        valor: Yup.string().required('Campo requerido'),
        responsable: Yup.string().required('Campo requerido')
    });

    function handleAddCase(values) {
        console.log("v", values)
        const caseData = {
            ...values,
            user_create: userData.nombre,
            mesa: userData.mesa,
            documento: image,
            numFactura: values.factura,
            EPS: values.patient_eps
        };
        console.log(caseData)
        sendCase(caseData)

        setTimeout(() => {
            fetchAsistencia()
            fetchCasos()
        }, 300);

        setImage(null);
        setPreviewUrl(null); // Limpiar la vista previa
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Reinicia el campo de entrada de archivos
        }
    };

    function handleAsistenecia(id) {
        const comentario = comentarios[id];

        if (userData && comentarios) {
            const data = {
                caso: String(id),
                cedula: userData.id_usuario,
                comentario: comentario
            }
            sendAsistencia(data)
        }

        setTimeout(() => {
            fetchAsistencia()
            fetchCasos()
        }, 300);
    }

    function handleUptCase(id) {
        // Obtén el estado y el comentario para el caso específico
        const estadoSeleccionado = mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] == null ? 'Finalizado' : selectedEstados[id];
        const comentario = comentarios[id] || mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] == null && 'Translado' || ''; // Asegúrate de que comentarios esté estructurado adecuadamente

        // Verifica que haya un estado seleccionado
        if (estadoSeleccionado !== undefined && comentario !== undefined) {
            const time = new Date();
            selectedEstados[id] = ""
            let caseData = {
                id: id,
                user_resolved: userData.nombre,
                comentario: mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] === null ? 'Translado' : comentario,
                mesa: userData?.mesa
            };

            const tipoMesa = mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0]

            if ((tipoMesa || tipoMesa == false) && estadoSeleccionado == "Finalizado") {
                console.log("a")
                caseData.documento = image;
                caseData.estado = 1; // Asignar estado correspondiente
                caseData.resolvedAt = time;
            }
            else if ((tipoMesa || tipoMesa == false) && estadoSeleccionado == "En proceso") {
                console.log("b")
                caseData.documento = image;
                caseData.estado = false; // Asignar estado correspondiente
                caseData.fechaEstado = time;
                caseData.user_pend = userData.nombre
            }
            else if (estadoSeleccionado == "En proceso") {
                caseData.documento = image;
                caseData.estado = false; // Asignar estado correspondiente
                caseData.fechaEstado = time;
                caseData.resolvedAt = null;
                caseData.user_pend = userData.nombre;
            } else if (estadoSeleccionado == "Finalizado") {
                caseData.documento = image;
                caseData.estado = 1; // Asignar estado correspondiente
                caseData.fechaEstado = time;
                caseData.resolvedAt = time;
            }

            // Llama a la función para actualizar el caso
            console.log(caseData)
            if (tipoMesa || tipoMesa == false) {
                if (estadoSeleccionado == "En proceso") {
                    uptPenCase(caseData);
                } else if (estadoSeleccionado == "Finalizado") {
                    uptResCase(caseData);
                }
            }
            else {
                uptCase(caseData);
            }
            setTimeout(() => {
                fetchCasos()
                console.log('upt')
            }, 100);
        } else {
            console.error("Estado o comentario no definidos para el caso ID:", id);
        }

        setImage(null);
        setPreviewUrl(null); // Limpiar la vista previa
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Reinicia el campo de entrada de archivos
        }
    };

    function handleComentarioChange(e, casoId) {
        setComentarios({
            ...comentarios,
            [casoId]: e.target.value,
        });
    };

    function handleEstadoChange(e, casoId) {
        setSelectedEstados({
            ...selectedEstados,
            [casoId]: e.target.value,
        });
    };

    useEffect(() => {
        const intervalId = setInterval(fetchCasos, (((casosPen.length > 0 || casosPro.length > 0) || (casosRes.length > 0 || mesas.length > 0)) ? 1000 : 100));

        return () => clearInterval(intervalId);
    }, [fetchCasos, casosPen, casosPro, casosRes, mesas, activeTab]);

    useEffect(() => {
        const intervalId2 = setInterval(fetchUsers, (usuarios.length > 0 ? 1200000 : 100));

        return () => clearInterval(intervalId2);
    }, [fetchUsers, usuarios]);

    function handleTabChange(tabNumber) {
        setActiveTab(tabNumber);
    };

    function handleSearchChange(e) {
        setSearchTerm(e.target.value);
    };

    const filteredCases = mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0]
        ? casosPen.filter(caso =>
            (userData.mesa === caso.mesa) && // Filtra por mesa
            (caso.id.toString().includes(searchTerm) ||
                caso.admission.toString().includes(searchTerm) ||
                caso.patient_id.toString().includes(searchTerm) ||
                caso.description.toString().toUpperCase().includes(searchTerm.toUpperCase())))

        : (activeTab === 0 ? casosPen : activeTab === 1 ? casosPro : casosRes).filter(caso =>
            (userData.mesa === caso.mesa) && // Filtra por mesa
            (caso.id.toString().includes(searchTerm) ||
                caso.admission.toString().includes(searchTerm) ||
                caso.patient_id.toString().includes(searchTerm)) ||
            caso.description.toString().toUpperCase().includes(searchTerm.toUpperCase() ||
                caso.EPS?.toString().toUpperCase().includes(searchTerm.toUpperCase()))
        );

    function formatNumber(n) {

        n = String(n).replace(/\D/g, "");

        return n === '' ? n : Number(n).toLocaleString('de-DE');

    }

    // Manejar el cambio en el campo de archivo
    function handleImageChange(event) {
        const file = event.target.files[0];
        if (file) {
            const time = new Date()
            setImage(file);
            setPreviewUrl(URL.createObjectURL(file)); // Crear una URL temporal para la vista previa

            if ((caseImg.documentoPro == null || caseImg.documentoPro == 'null') && selectedEstados[caseImg.id] != "Finalizado" && caseImg.estado == false) {
                const comentario = comentarios[caseImg.id] || mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] == null && 'Translado' || '';

                selectedEstados[caseImg.id] = ""
                let caseData = {
                    id: caseImg.id,
                    comentario: comentario,
                    mesa: userData?.mesa
                };

                caseData.user_process = userData.nombre;
                caseData.documento = file;
                caseData.estado = false; // Asignar estado correspondiente
                caseData.processAt = time;

                // Llama a la función para actualizar el caso
                console.log("ñ", caseData)
                uptProCase(caseData);
                setTimeout(() => {
                    fetchCasos()
                    console.log('upt')
                }, 500);
                setImage(null);
                setPreviewUrl(null); // Limpiar la vista previa
                if (fileInputRef.current) {
                    fileInputRef.current.value = ''; // Reinicia el campo de entrada de archivos
                }
            }

            setTimeout(() => {
                // Aquí hacemos scroll al contenedor usando el ref
                if (imageContainerRef.current) {
                    imageContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 500)
        }
    };

    function uploadArchivo(id) {
        const caso = casosMesa.filter(caso => caso.id == id)[0];
        console.log(caso)
        fileInputRef.current.click();
        setCaseImg(caso)
    };

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="mt-2">Cargando información...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className='container mt-4'>
                {userData?.nombre ? (
                    <div>
                        <h2>Bienvenid@, {userData.nombre}</h2>
                        {mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] != null && (
                            <>
                                <h3>Num mesa: {userData.mesa}. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Nombre de la mesa: {mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.nombre)}</h3>
                                <p>Cédula: {userData.id_usuario}</p>
                            </>
                        )}
                    </div>
                ) : (
                    <p>No se encontró información del usuario. Por favor, inicia sesión.</p>
                )}
            </div>
            <div className="d-flex justify-content-center align-items-center">
                <div className="container">
                    {userData.accion === "ASIGNAR" && (
                        <div className="card p-4 shadow-sm mb-5">
                            <Formik
                                initialValues={{
                                    admission: '',
                                    areaSalida: '',
                                    patient_name: '',
                                    patient_id: '',
                                    patient_eps: '',
                                    description: '',
                                    factura: '',
                                    responsable: '',
                                    valor: ''
                                }}

                                validationSchema={mesas.length > 0 && mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] === null ? validationSchemaF : mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] ? validationSchema : validationSchemaD}
                                onSubmit={(values, { resetForm }) => {
                                    values.description = ((values.areaSalida == 'SALIDA' || values.areaSalida == 'MORGUE') ? 'SALIDA' : values.description);
                                    values.admission = values.admission.split(' ')[0]
                                    values.patient_id = values.patient_id.split(' ')[0]
                                    handleAddCase(values); // Llama a tu función de envío
                                    resetForm(); // Resetea el formulario
                                }}
                            >
                                {({ values }) => (
                                    <Form>
                                        {mesas.length > 0 && mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] && (
                                            <>
                                                <div className="form-group mb-3">
                                                    {mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] == null ? (
                                                        <>
                                                            <label htmlFor="admission" className="form-label">Área Ubicación Actual del Paciente</label>
                                                            <Field as="select" id="admission" name="admission" className="form-control">
                                                                <option value="" label="Seleccione un área" hidden />
                                                                {ubiActual?.map(ubiA => (
                                                                    <option value={ubiA.Nombre}>{ubiA.Nombre}</option>
                                                                ))}
                                                            </Field>
                                                            <ErrorMessage name="admission" component="div" className="text-danger" />

                                                            <label htmlFor="areaSalida" className="form-label mt-3">Área Ubicación Destino del Paciente</label>
                                                            <Field as="select" id="areaSalida" name="areaSalida" className="form-control">
                                                                <option value="" label="Seleccione un área de salida" hidden />
                                                                {ubiDestino?.map(ubiD => (
                                                                    <option value={ubiD.Nombre}>{ubiD.Nombre}</option>
                                                                ))}
                                                            </Field>
                                                            <ErrorMessage name="areaSalida" component="div" className="text-danger" />
                                                        </>
                                                    )
                                                        :
                                                        (
                                                            <>
                                                                <label htmlFor="admission" className="form-label">Admisión</label>
                                                                <Field
                                                                    type="text"
                                                                    id="admission"
                                                                    name="admission"
                                                                    className="form-control"
                                                                    placeholder="Admisión"
                                                                />
                                                                <ErrorMessage name="admission" component="div" className="text-danger" />
                                                            </>
                                                        )
                                                    }
                                                </div>
                                                <div className="form-group mb-3">
                                                    <label htmlFor="patient_name" className="form-label">Nombre del Paciente</label>
                                                    <Field type="text" id="patient_name" name="patient_name" className="form-control" placeholder="Nombre del Paciente" />
                                                    <ErrorMessage name="patient_name" component="div" className="text-danger" />
                                                </div>
                                                <div className="form-group mb-3">
                                                    <label htmlFor="patient_id" className="form-label">Cédula del Paciente</label>
                                                    <Field type="text" id="patient_id" name="patient_id" className="form-control" placeholder="Cédula del Paciente" />
                                                    <ErrorMessage name="patient_id" component="div" className="text-danger" />
                                                </div>
                                                <div className="form-group mb-3">
                                                    <label htmlFor="patient_eps" className="form-label">EPS del Paciente</label>
                                                    <Field type="text" id="patient_eps" name="patient_eps" className="form-control" placeholder="EPS del Paciente" />
                                                    <ErrorMessage name="patient_eps" component="div" className="text-danger" />
                                                </div>
                                            </>
                                        )}
                                        {mesas.length > 0 && mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] === null && (
                                            <>
                                                <div className="form-group mb-3">
                                                    <label htmlFor="factura" className="form-label">Admision</label>
                                                    <Field
                                                        type="text"
                                                        id="factura"
                                                        name="factura"
                                                        className="form-control"
                                                        placeholder="Facturacion"
                                                    />
                                                    <ErrorMessage name="factura" component="div" className="text-danger" />
                                                </div>
                                                <div className="form-group mb-3">
                                                    <label htmlFor="responsable" className="form-label">Responsable</label>
                                                    <Field type="text" id="responsable" name="responsable" className="form-control" placeholder="Escriba un responsable" />
                                                    <ErrorMessage name="responsable" component="div" className="text-danger" />
                                                </div>
                                                <div className="form-group mb-3">
                                                    <label htmlFor="valor" className="form-label">Valor</label>
                                                    <Field type="number" id="valor" name="valor" className="form-control" placeholder="Escriba un Valor" min="1" />
                                                    <ErrorMessage name="valor" component="div" className="text-danger" />
                                                </div>
                                            </>
                                        )}
                                        {((!(values.areaSalida == 'SALIDA' || values.areaSalida == 'MORGUE')) && mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] == null) ? (
                                            <div className="form-group mb-3">
                                                <label htmlFor="description" className="form-label">Indicaciones del translado</label>
                                                <Field as="textarea" id="description" name="description" className="form-control" placeholder="Motivo del translado y bajo que condiciones" rows="3" required />
                                                <ErrorMessage name="description" component="div" className="text-danger" />
                                            </div>
                                        )
                                            : (!(values.areaSalida == 'SALIDA' || values.areaSalida == 'MORGUE')) &&
                                            (
                                                <div className="form-group mb-3">
                                                    <label htmlFor="description" className="form-label">Descripción</label>
                                                    <Field as="textarea" id="description" name="description" className="form-control" placeholder="Descripción" rows="3" />
                                                    <ErrorMessage name="description" component="div" className="text-danger" />
                                                </div>
                                            )}
                                        {(mesas.length > 0 && mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] == false && mesas.length > 0 && !(mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0])) && (
                                            <div className="form-group mb-3">
                                                <label htmlFor="responsable" className="form-label">Responsable</label>
                                                <Field type="text" id="responsable" name="responsable" className="form-control" placeholder="Escriba un responsable" />
                                                <ErrorMessage name="responsable" component="div" className="text-danger" />
                                            </div>
                                        )}

                                        {mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.adjunto)[0] && (
                                            <div className="form-group mb-3">
                                                <label htmlFor="responsable" className="form-label">Adjuntar</label>
                                                <input
                                                    type="file"
                                                    name="imgUp"
                                                    className="form-control"
                                                    onChange={handleImageChange}
                                                    ref={fileInputRef}
                                                />
                                            </div>
                                        )
                                        }

                                        <button type="submit" className="btn btn-primary w-100 mb-2">Enviar</button>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    )}

                    <div className="d-flex justify-content-center my-3">
                        <button
                            className={`btn tab  btn-primary ${activeTab === 0 ? "active" : ""} me-2`}
                            onClick={() => handleTabChange(0)}
                        >
                            {mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] ? "COMUNICADO" : mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] == null ? 'TRANSLADOS PENDIENTES' : "PENDIENTES"}
                        </button>
                        {
                            (mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] == false) && (
                                <button
                                    className={`btn tab btn-primary ${activeTab === 1 ? "active" : ""} me-2`}
                                    onClick={() => handleTabChange(1)}
                                >
                                    PROCESO
                                </button>
                            )
                        }

                        <button
                            className={`btn tab btn-primary ${activeTab === 2 ? "active" : ""} me-2`}
                            onClick={() => handleTabChange(2)}
                        >
                            {mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] ? "ACEPTADO / RECIBIDO" : mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] == null ? 'TRANSLADOS FINALIZADOS' : "FINALIZADO"}
                        </button>
                    </div>

                    <div className='bg-light px-3 border rounded'>
                        <div className='d-flex bd-highlight'>
                            <h2 className="me-auto p-2 bd-highlight mt-3">{
                                activeTab === 0
                                    ?
                                    mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] == null
                                        ?
                                        'Translados'
                                        :
                                        mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0]
                                            ?
                                            "Comunicados"
                                            :
                                            "Caso Pendientes"
                                    :
                                    activeTab === 1
                                        ?
                                        " Caso en Proceso"
                                        :
                                        mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] == null
                                            ?
                                            'Translados Resueltos'
                                            :
                                            mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0]
                                                ?
                                                "Comunicados Recibidos / Aceptados"
                                                :
                                                " Caso Resueltos"
                            }</h2>
                            {(mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] == false || mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] == null) && (
                                <button className='btn btn-success bd-highlight h-50 mt-4' onClick={() => exportToExcel(userData.mesa)}>Exportar
                                    <img src="excel.png" alt="excel" style={{ height: '30px' }} />
                                </button>
                            )}
                        </div>

                        {(mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] != null) && (
                            <div className="mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder={
                                        mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] == null ?
                                            "Buscar por Cedula"
                                            :
                                            mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0]
                                                ?
                                                "Buscar por Caso/Comunicado o Descripcion"
                                                :
                                                "Buscar por id, Admisión, Cedula, Descripcion o EPS"
                                    }
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />
                            </div>
                        )}

                        {/* Tabla filtrada por el estado activo */}
                        {activeTab === 0 && (
                            <>
                                <div className="table-responsive">
                                    <table className="table table-striped table-hover" style={{ overflow: 'hidden' }}>
                                        <thead className="table-light">
                                            <tr>
                                                {screenSize.width > 768 && (
                                                    <th onClick={handleSortByCaso} style={{ cursor: 'pointer', maxWidth: '103px ' }}>
                                                        {mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] ? "# Comunicado" : "Caso"}
                                                        {
                                                            orderColumn === "caso" ? (
                                                                orderDirection ?
                                                                    orderDirection === "asc" ?
                                                                        <img className='clasificar' src='clasificar-abajo.png' ></img>
                                                                        :
                                                                        <img className='clasificar' src='clasificar-arriba.png'></img>
                                                                    : <img className='clasificar' src='clasificar.png'></img>)
                                                                : <img className='clasificar' src='clasificar.png'></img>
                                                        }
                                                    </th>
                                                )}
                                                {mesas.length > 0 && mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] && (
                                                    <>
                                                        <th onClick={handleSortByAdmission}
                                                            style={mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] != null ? { cursor: 'pointer' } : {}}
                                                        >
                                                            {mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] != null ? 'Admision' : screenSize.width > 768 ? 'Origen Paciente' : 'Orig/Dest'}
                                                            {mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] != null && (
                                                                orderColumn === "admission" ? (
                                                                    orderDirection ?
                                                                        orderDirection === "asc" ?
                                                                            <img className='clasificar' src='clasificar-abajo.png' ></img>
                                                                            :
                                                                            <img className='clasificar' src='clasificar-arriba.png'></img>
                                                                        : <img className='clasificar' src='clasificar.png'></img>)
                                                                    : <img className='clasificar' src='clasificar.png'></img>
                                                            )}
                                                        </th>
                                                        {screenSize.width > 768 && mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] == null && (
                                                            <th>Destino Paciente</th>
                                                        )}
                                                        <th>{screenSize.width > 768 ? 'Paciente' : 'Pac'}</th>
                                                        {screenSize.width > 768 && (
                                                            <th onClick={handleSortByCedula} style={{ cursor: 'pointer' }}>Cedula
                                                                {
                                                                    orderColumn === "cedula" ? (
                                                                        orderDirection ?
                                                                            orderDirection === "asc" ?
                                                                                <img className='clasificar' src='clasificar-abajo.png' ></img>
                                                                                :
                                                                                <img className='clasificar' src='clasificar-arriba.png'></img>
                                                                            : <img className='clasificar' src='clasificar.png'></img>)
                                                                        : <img className='clasificar' src='clasificar.png'></img>
                                                                }
                                                            </th>
                                                        )}
                                                        <th onClick={handleSortByEPS} style={{ cursor: 'pointer' }}>EPS
                                                            {
                                                                orderColumn === "EPS" ? (
                                                                    orderDirection ?
                                                                        orderDirection === "asc" ?
                                                                            <img className='clasificar' src='clasificar-abajo.png' ></img>
                                                                            :
                                                                            <img className='clasificar' src='clasificar-arriba.png'></img>
                                                                        : <img className='clasificar' src='clasificar.png'></img>)
                                                                    : <img className='clasificar' src='clasificar.png'></img>
                                                            }
                                                        </th>
                                                    </>
                                                )}
                                                {mesas.length > 0 && mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] === null && (
                                                    <>
                                                        <th>Admision</th>
                                                        {!mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] && (
                                                            <th>Responsable</th>
                                                        )}
                                                        <th onClick={handleSortByValor} style={{ cursor: 'pointer' }}>Valor
                                                            {
                                                                orderColumn === "valor" ? (
                                                                    orderDirection ?
                                                                        orderDirection === "asc" ?
                                                                            <img className='clasificar' src='clasificar-abajo.png' ></img>
                                                                            :
                                                                            <img className='clasificar' src='clasificar-arriba.png'></img>
                                                                        : <img className='clasificar' src='clasificar.png'></img>)
                                                                    : <img className='clasificar' src='clasificar.png'></img>
                                                            }
                                                        </th>
                                                    </>
                                                )}
                                                <th>{mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] != null ? 'Descripcion' : screenSize.width > 768 ? 'Indicaciones' : 'Indic'}</th>
                                                {(mesas.length > 0 && mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] === false && !mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0]) && (
                                                    <th>Responsable</th>
                                                )}
                                                {screenSize.width > 768 && (
                                                    <th>Creado</th>
                                                )}
                                                <th>{screenSize.width > 768 ? 'F. Creacion' : 'F.C'}</th>
                                                {userData.accion === "RESOLVER" && (
                                                    <>
                                                        {mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] != null && (
                                                            <th>{mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] ? "Comentario" : "Comentario/Auto"}</th>
                                                        )}
                                                        {(mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] == false) && (
                                                            <th>Estados</th>
                                                        )}
                                                        {(mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.adjunto)[0] && mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] == false) && (
                                                            <th>Adjunto</th>
                                                        )}
                                                        {(mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] != null || screenSize.width > 768) && (
                                                            <th>Acciones</th>
                                                        )}
                                                    </>
                                                )}
                                                {(mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.adjunto)[0]) && (
                                                    <th>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="currentColor" className="bi bi-paperclip" viewBox="0 0 16 16">
                                                            <path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0z" />
                                                        </svg>
                                                    </th>
                                                )
                                                }
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] ? asistenciasAll.length > 0 : true && getPaginatedCases().length > 0) ? getPaginatedCases().map((caso, index) => (
                                                <tr key={index} ref={index === getPaginatedCases().length - 1 ? lastRowRef : null}>
                                                    {screenSize.width > 768 && (
                                                        <td>{caso.id}</td>
                                                    )}
                                                    {mesas.length > 0 && mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] && (
                                                        <>
                                                            <td className="text-wrap" style={{ maxWidth: '100px', whiteSpace: 'pre-wrap' }}>
                                                                <span>
                                                                    {caso.admission}
                                                                    {screenSize.width < 768 && (
                                                                        <>
                                                                            <span className='fw-bolder fs-5'> » </span>
                                                                            {caso.destinoPaciente}
                                                                        </>
                                                                    )}
                                                                </span>
                                                                {(screenSize.width < 768 && (mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] == null && userData.accion === "RESOLVER")) && (
                                                                    <button type="button" className='btn btn-success' onClick={() => handleUptCase(caso.id)}>
                                                                        Transladar
                                                                    </button>
                                                                )}
                                                            </td>
                                                            {screenSize.width > 768 && mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] == null && (
                                                                <td>{caso.destinoPaciente}</td>
                                                            )}
                                                            <td className="text-wrap" style={{ maxWidth: '100px', whiteSpace: 'pre-wrap' }}>{caso.patient_name}</td>
                                                            {screenSize.width > 768 && (
                                                                <td>{caso.patient_id}</td>
                                                            )}
                                                            <td className="text-wrap" style={{ maxWidth: '100px', whiteSpace: 'pre-wrap' }}>{caso.EPS}</td>
                                                        </>
                                                    )}
                                                    {mesas.length > 0 && mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] === null && (
                                                        <>
                                                            <td>{caso.numFactura}</td>
                                                            <td>{caso.responsable}</td>
                                                            <td>{formatNumber(caso.valor)}</td>
                                                        </>
                                                    )}
                                                    <td className="text-justify" style={{ maxWidth: '250px', whiteSpace: 'pre-line' }}>{caso.description}</td>
                                                    {(mesas.length > 0 && mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] === false && !mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0]) && (
                                                        <td>{caso.responsable}</td>
                                                    )}
                                                    {screenSize.width > 768 && (
                                                        <td className="text-wrap" style={{ maxWidth: '100px', whiteSpace: 'pre-wrap' }}>{caso.user_create}</td>
                                                    )}
                                                    <td className="text-wrap" style={{ maxWidth: '100px', whiteSpace: 'pre-wrap' }}>{new Date(caso.createdAt).toLocaleString().replace(',', '')}</td>
                                                    {userData.accion === "RESOLVER" && (
                                                        <>
                                                            {mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] != null && (
                                                                <td>
                                                                    <textarea
                                                                        disabled={(!mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0]) ? (!(selectedEstados[caso.id] && selectedEstados[caso.id].trim() !== "")) : false}
                                                                        className="form-control auto-height-textarea"
                                                                        rows="1"
                                                                        value={comentarios[caso.id] || ''}
                                                                        onChange={(e) => handleComentarioChange(e, caso.id)}
                                                                        onInput={(e) => e.target.style.height = e.target.scrollHeight + 'px'}>
                                                                    </textarea>
                                                                </td>
                                                            )}
                                                            {(mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] == false) && (
                                                                <td className="text-wrap" style={{ width: '10%' }}>
                                                                    <select
                                                                        className="form-select"
                                                                        value={selectedEstados[caso.id] || ""}
                                                                        onChange={(event) => handleEstadoChange(event, caso.id)}
                                                                    >
                                                                        <option value="" disabled hidden>Seleccione una opción</option>
                                                                        <option value="En proceso">En proceso</option>
                                                                        <option value="Finalizado">Finalizado</option>
                                                                    </select>
                                                                </td>
                                                            )}
                                                            {(mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.adjunto)[0] && mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] == false) && (
                                                                <td style={{ maxWidth: '50%', paddingRight: 0, paddingLeft: 0 }}>
                                                                    <div className="input-group">
                                                                        <label style={{ margin: 0 }} className="input-group-text" htmlFor={`inputGroupFile${caso.id}`}>Adjuntar</label>
                                                                        <input
                                                                            type="file"
                                                                            className="form-control"
                                                                            id={`inputGroupFile${caso.id}`}
                                                                            disabled={(selectedEstados[caso.id] != 'En proceso' ? selectedEstados[caso.id] != 'Finalizado' ? true : false : false)}
                                                                            hidden
                                                                            onChange={handleImageChange}
                                                                            ref={fileInputRef}
                                                                        />
                                                                    </div>
                                                                </td>
                                                            )}
                                                            <td style={{ paddingLeft: 0, paddingRight: 0 }}>
                                                                {mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0]
                                                                    ?
                                                                    <button type="button" className='btn btn-success' onClick={() => handleAsistenecia(caso.id)}>Aceptado / Recibido</button>
                                                                    :
                                                                    (mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] != null || screenSize.width > 768) && (
                                                                        <button type="button" className='btn btn-success' onClick={() => handleUptCase(caso.id)} disabled={mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] == null ? false : !(selectedEstados[caso.id] && selectedEstados[caso.id].trim() !== "")}>
                                                                            {mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] == null ? 'Transladar' : 'Resolver'}
                                                                        </button>
                                                                    )
                                                                }
                                                            </td>

                                                        </>
                                                    )}
                                                    {(mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.adjunto)[0]) && (
                                                        <td className="text-wrap" style={{ maxWidth: '1px', whiteSpace: 'pre-wrap' }}>
                                                            <div className='d-inline-flex'>
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
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="9" className=''>No hay registros disponibles</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mt-3 mb-3">
                                    {/* Selector de items por página */}
                                    <div className="d-flex align-items-center">
                                        <span className="me-3">Mostrar:</span>
                                        <select
                                            className="form-select form-select-sm w-auto"
                                            value={itemsPerPage}
                                            onChange={(e) => {
                                                setItemsPerPage(Number(e.target.value));
                                                setCurrentPage(1); // Resetear a la primera página al cambiar el tamaño
                                            }}
                                        >
                                            <option value={30}>30</option>
                                            <option value={60}>60</option>
                                            <option value={90}>90</option>
                                        </select>
                                        <span className="ms-2">registros</span>
                                    </div>

                                    {/* Navegación de páginas */}
                                    <div className="d-flex align-items-center">
                                        <button
                                            className="btn btn-sm btn-outline-primary me-3"
                                            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                            disabled={currentPage === 1}
                                        >
                                            Anterior
                                        </button>

                                        <span className="mx-2">
                                            Página {currentPage} de {Math.ceil(getSortedCases().length / itemsPerPage)}
                                        </span>

                                        <button
                                            className="btn btn-sm btn-outline-primary ms-2"
                                            onClick={() => setCurrentPage(p => Math.min(p + 1, Math.ceil(getSortedCases().length / itemsPerPage)))}
                                            disabled={currentPage === Math.ceil(getSortedCases().length / itemsPerPage)}
                                        >
                                            Siguiente
                                        </button>
                                    </div>

                                    {/* Contador total */}
                                    <div className="text-muted small">
                                        Mostrando {getPaginatedCases().length} de {getSortedCases().length} registros
                                    </div>
                                </div>
                            </>
                        )}

                        {/*Processo*/}
                        {activeTab === 1 && (
                            <>
                                <div className="table-responsive">
                                    <table className="table table-striped table-hover" style={{ overflow: 'hidden' }}>
                                        <thead className="table-light">
                                            <tr>
                                                <th onClick={handleSortByCaso} style={{ cursor: 'pointer' }}>Caso
                                                    {
                                                        orderColumn === "caso" ? (
                                                            orderDirection ?
                                                                orderDirection === "asc" ?
                                                                    <img className='clasificar' src='clasificar-abajo.png' ></img>
                                                                    :
                                                                    <img className='clasificar' src='clasificar-arriba.png'></img>
                                                                : <img className='clasificar' src='clasificar.png'></img>)
                                                            : <img className='clasificar' src='clasificar.png'></img>
                                                    }
                                                </th>
                                                {mesas.length > 0 && mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] && (
                                                    <>
                                                        <th onClick={handleSortByAdmission} style={{ cursor: 'pointer' }}>Admision
                                                            {
                                                                orderColumn === "admission" ? (
                                                                    orderDirection ?
                                                                        orderDirection === "asc" ?
                                                                            <img className='clasificar' src='clasificar-abajo.png' ></img>
                                                                            :
                                                                            <img className='clasificar' src='clasificar-arriba.png'></img>
                                                                        : <img className='clasificar' src='clasificar.png'></img>)
                                                                    : <img className='clasificar' src='clasificar.png'></img>
                                                            }
                                                        </th>
                                                        <th>Paciente</th>
                                                        <th onClick={handleSortByCedula} style={{ cursor: 'pointer' }}>Cedula
                                                            {
                                                                orderColumn === "cedula" ? (
                                                                    orderDirection ?
                                                                        orderDirection === "asc" ?
                                                                            <img className='clasificar' src='clasificar-abajo.png' ></img>
                                                                            :
                                                                            <img className='clasificar' src='clasificar-arriba.png'></img>
                                                                        : <img className='clasificar' src='clasificar.png'></img>)
                                                                    : <img className='clasificar' src='clasificar.png'></img>
                                                            }
                                                        </th>
                                                        <th onClick={handleSortByEPS} style={{ cursor: 'pointer' }}>EPS
                                                            {
                                                                orderColumn === "EPS" ? (
                                                                    orderDirection ?
                                                                        orderDirection === "asc" ?
                                                                            <img className='clasificar' src='clasificar-abajo.png' ></img>
                                                                            :
                                                                            <img className='clasificar' src='clasificar-arriba.png'></img>
                                                                        : <img className='clasificar' src='clasificar.png'></img>)
                                                                    : <img className='clasificar' src='clasificar.png'></img>
                                                            }
                                                        </th>
                                                    </>
                                                )}
                                                {mesas.length > 0 && mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] === null && (
                                                    <>
                                                        <th onClick={handleSortByAdmission} style={{ cursor: 'pointer' }}>Admision</th>
                                                        <th>Responsable</th>
                                                    </>
                                                )}
                                                <th>Descripción</th>
                                                {mesas.length > 0 && mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] === false && (
                                                    <th>Responsable</th>
                                                )}
                                                <th>Creado</th>
                                                {(mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.adjunto)[0]
                                                    ?
                                                    (mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] == true
                                                        ||
                                                        mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] == false)
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
                                                <th>Encargado</th>
                                                {(mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.adjunto)[0]
                                                    ?
                                                    (mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] == true
                                                        ||
                                                        mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] == false)
                                                        ?
                                                        false
                                                        :
                                                        true
                                                    :
                                                    true
                                                ) && (
                                                        <th>F. Pend</th>
                                                    )}
                                                {userData.accion === "ASIGNAR" && <th>Estado</th>}
                                                <th>Comentario</th>
                                                {userData.accion === "RESOLVER" && (
                                                    <>
                                                        {(mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.adjunto)[0] && mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] == false) && (
                                                            <th>Adjunto</th>
                                                        )}
                                                        <th>Estado</th>
                                                        <th>Acciones</th>
                                                    </>
                                                )}
                                                {(mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.adjunto)[0]) && (
                                                    <th>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="currentColor" className="bi bi-paperclip" viewBox="0 0 16 16">
                                                            <path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0z" />
                                                        </svg>
                                                    </th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {getPaginatedCases().length > 0 && getPaginatedCases().map((caso, index) => (
                                                <tr key={index} ref={index === getPaginatedCases().length - 1 ? lastRowRef : null}>
                                                    <td>{caso.id}</td>
                                                    {mesas.length > 0 && mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] === null && (
                                                        <>
                                                            <td>{caso.numFactura}</td>
                                                            <td>{caso.responsable}</td>
                                                        </>
                                                    )}
                                                    {mesas.length > 0 && mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] && (
                                                        <>
                                                            <td className="text-wrap" style={{ maxWidth: '150px', whiteSpace: 'pre-wrap' }}>{caso.admission}</td>
                                                            <td className="text-wrap" style={{ maxWidth: '100px', whiteSpace: 'pre-wrap' }}>{caso.patient_name}</td>
                                                            <td>{caso.patient_id}</td>
                                                            <td>{caso.EPS}</td>
                                                        </>
                                                    )}
                                                    <td className="text-wrap" style={{ maxWidth: '150px', whiteSpace: 'pre-wrap' }}>{caso.description}</td>
                                                    {mesas.length > 0 && mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] === false && (
                                                        <td>{caso.responsable}</td>
                                                    )}
                                                    <td className="text-wrap" style={{ maxWidth: '100px', whiteSpace: 'pre-wrap' }}>{
                                                        <p>{caso.user_create + " "}
                                                            {!(mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.adjunto)[0]
                                                                ?
                                                                (mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] == true
                                                                    ||
                                                                    mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] == false)
                                                                    ?
                                                                    false
                                                                    :
                                                                    true
                                                                :
                                                                true
                                                            ) && (
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
                                                                )
                                                            }
                                                        </p>
                                                    }
                                                    </td>
                                                    {(mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.adjunto)[0]
                                                        ?
                                                        (mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] == true
                                                            ||
                                                            mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] == false)
                                                            ?
                                                            false
                                                            :
                                                            true
                                                        :
                                                        true
                                                    ) && (
                                                            <td className="text-wrap" style={{ maxWidth: '100px', whiteSpace: 'pre-wrap' }}>{new Date(caso.createdAt).toLocaleString().replace(',', '')}</td>
                                                        )
                                                    }
                                                    <td className="text-wrap" style={{ maxWidth: '100px', whiteSpace: 'pre-wrap' }}>{
                                                        (mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.adjunto)[0]
                                                            ?
                                                            (mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] == true
                                                                ||
                                                                mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] == false)
                                                                ?
                                                                false
                                                                :
                                                                true
                                                            :
                                                            true
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
                                                                </div>
                                                            </>
                                                    }</td>
                                                    {(mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.adjunto)[0]
                                                        ?
                                                        (mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] == true
                                                            ||
                                                            mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] == false)
                                                            ?
                                                            false
                                                            :
                                                            true
                                                        :
                                                        true
                                                    ) && (
                                                            <td className="text-wrap" style={{ maxWidth: '100px', whiteSpace: 'pre-wrap' }}>{new Date(caso.fechaEstado).toLocaleString().replace(',', '')}</td>
                                                        )
                                                    }
                                                    {userData.accion === "ASIGNAR" && (
                                                        <td>{caso.estado ? "Finalizado" : "En Proceso"}</td>
                                                    )}
                                                    <td className="text-wrap" style={{ maxWidth: '125px' }}>
                                                        {(selectedEstados[caso.id] && selectedEstados[caso.id].trim() !== "") ?
                                                            <textarea
                                                                className="form-control auto-height-textarea"
                                                                rows={(1 + (caso.comentario?.length / 7)) || 1}
                                                                value={comentarios[caso.id] ? comentarios[caso.id] : comentarios[caso.id] = caso.comentario || ''}
                                                                onChange={(e) => handleComentarioChange(e, caso.id)} // Asegúrate de tener una función para manejar el cambio
                                                                onInput={(e) => e.target.style.height = e.target.scrollHeight + 'px'} // Para ajustar la altura del textarea
                                                            ></textarea>
                                                            :
                                                            <p>{caso.comentario}</p>
                                                        }
                                                    </td>
                                                    {((mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.adjunto)[0] && userData.accion === "RESOLVER") && mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] == false) && (
                                                        <td style={{ maxWidth: '50%', paddingRight: 0, paddingLeft: 0 }}>
                                                            <div className="input-group justify-content-center">
                                                                <button
                                                                    style={{ margin: 0 }}
                                                                    className="btn btn-outline-dark"
                                                                    onClick={() => uploadArchivo(caso.id)}
                                                                    htmlFor={`inputGroupFile${caso.id}`}
                                                                    disabled={(selectedEstados[caso.id] != "Finalizado") ? (caso.documentoPro == null || caso.documentoPro == 'null') ? false : true : false}
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-upload" viewBox="0 0 16 16">
                                                                        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" />
                                                                        <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708z" />
                                                                    </svg>
                                                                </button>
                                                                <input
                                                                    type="file"
                                                                    className="form-control"
                                                                    id={`inputGroupFile${caso.id}`}
                                                                    hidden
                                                                    onChange={handleImageChange}
                                                                    ref={fileInputRef}
                                                                />
                                                            </div>
                                                        </td>
                                                    )}
                                                    {userData.accion === "RESOLVER" && (
                                                        <>
                                                            <td className="text-wrap" style={{ maxWidth: '100px', whiteSpace: 'pre-wrap' }}>
                                                                <select
                                                                    className="form-select"
                                                                    value={selectedEstados[caso.id] || ""}
                                                                    onChange={(event) => handleEstadoChange(event, caso.id)}
                                                                >
                                                                    <option value="" disabled hidden>En proceso</option>
                                                                    <option value="Finalizado">Finalizado</option>
                                                                </select>
                                                            </td>
                                                            <td>
                                                                <button type="button" className='btn btn-success' onClick={() => handleUptCase(caso.id)} disabled={!(selectedEstados[caso.id] && selectedEstados[caso.id].trim() !== "")}>Resolver</button>
                                                            </td>
                                                        </>
                                                    )}
                                                    {(mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.adjunto)[0]) && (
                                                        <td className="text-wrap" style={{ maxWidth: '1px', paddingLeft: 0, paddingRight: 0 }}>
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                                                {/* Contenedor para los dos primeros elementos (arriba) */}
                                                                <div style={{ display: 'flex', marginBottom: '5px' }}>
                                                                    {/* Documento Creado */}
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
                                                                            ) : (
                                                                                <p style={{ marginLeft: '7px' }}>ㅤ</p>
                                                                            )}
                                                                        </div>
                                                                    </OverlayTrigger>

                                                                    {/* Documento Enviado */}
                                                                    <OverlayTrigger
                                                                        placement="top"
                                                                        overlay={
                                                                            <BootstrapTooltip id="tooltip-right">
                                                                                <p>Enviado</p>
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
                                                                            ) : (
                                                                                <p style={{ marginLeft: '7px' }}>ㅤ</p>
                                                                            )}
                                                                        </div>
                                                                    </OverlayTrigger>
                                                                </div>

                                                                {/* Documento Proceso (abajo) */}
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
                                                                        ) : (
                                                                            <p style={{ marginLeft: '7px' }}>ㅤ</p>
                                                                        )}
                                                                    </div>
                                                                </OverlayTrigger>
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mt-3 mb-3">
                                    {/* Selector de items por página */}
                                    <div className="d-flex align-items-center">
                                        <span className="me-3">Mostrar:</span>
                                        <select
                                            className="form-select form-select-sm w-auto"
                                            value={itemsPerPage}
                                            onChange={(e) => {
                                                setItemsPerPage(Number(e.target.value));
                                                setCurrentPage(1); // Resetear a la primera página al cambiar el tamaño
                                            }}
                                        >
                                            <option value={30}>30</option>
                                            <option value={60}>60</option>
                                            <option value={90}>90</option>
                                        </select>
                                        <span className="ms-2">registros</span>
                                    </div>

                                    {/* Navegación de páginas */}
                                    <div className="d-flex align-items-center">
                                        <button
                                            className="btn btn-sm btn-outline-primary me-3"
                                            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                            disabled={currentPage === 1}
                                        >
                                            Anterior
                                        </button>

                                        <span className="mx-2">
                                            Página {currentPage} de {Math.ceil(getSortedCases().length / itemsPerPage)}
                                        </span>

                                        <button
                                            className="btn btn-sm btn-outline-primary ms-2"
                                            onClick={() => setCurrentPage(p => Math.min(p + 1, Math.ceil(getSortedCases().length / itemsPerPage)))}
                                            disabled={currentPage === Math.ceil(getSortedCases().length / itemsPerPage)}
                                        >
                                            Siguiente
                                        </button>
                                    </div>

                                    {/* Contador total */}
                                    <div className="text-muted small">
                                        Mostrando {getPaginatedCases().length} de {getSortedCases().length} registros
                                    </div>
                                </div>
                            </>
                        )}

                        {/*Terminada*/}
                        {activeTab === 2 && (
                            <>
                                <div className="table-responsive">
                                    <table className="table table-striped table-hover">
                                        <thead className="table-light">
                                            <tr>
                                                <th onClick={handleSortByCaso} style={{ cursor: 'pointer', maxWidth: mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] ? '80px' : '15px ' }}>
                                                    {mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] ? "# Comunicado" : "Caso"}
                                                    {
                                                        orderColumn === "caso" ? (
                                                            orderDirection ?
                                                                orderDirection === "asc" ?
                                                                    <img className='clasificar' src='clasificar-abajo.png' ></img>
                                                                    :
                                                                    <img className='clasificar' src='clasificar-arriba.png'></img>
                                                                : <img className='clasificar' src='clasificar.png'></img>)
                                                            : <img className='clasificar' src='clasificar.png'></img>
                                                    }
                                                </th>
                                                {mesas.length > 0 && mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] && (
                                                    <>
                                                        <th onClick={handleSortByAdmission}
                                                            style={mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] != null ? { cursor: 'pointer' } : {}}
                                                        >
                                                            {mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] != null ? 'Admision' : 'Origen Paciente'}
                                                            {mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] != null && (
                                                                orderColumn === "admission" ? (
                                                                    orderDirection ?
                                                                        orderDirection === "asc" ?
                                                                            <img className='clasificar' src='clasificar-abajo.png' ></img>
                                                                            :
                                                                            <img className='clasificar' src='clasificar-arriba.png'></img>
                                                                        : <img className='clasificar' src='clasificar.png'></img>)
                                                                    : <img className='clasificar' src='clasificar.png'></img>
                                                            )}
                                                        </th>
                                                        {mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] == null && (
                                                            <th>Destino Paciente</th>
                                                        )}
                                                        <th>Paciente</th>
                                                        <th onClick={handleSortByCedula} style={{ cursor: 'pointer' }}>Cedula
                                                            {
                                                                orderColumn === "cedula" ? (
                                                                    orderDirection ?
                                                                        orderDirection === "asc" ?
                                                                            <img className='clasificar' src='clasificar-abajo.png' ></img>
                                                                            :
                                                                            <img className='clasificar' src='clasificar-arriba.png'></img>
                                                                        : <img className='clasificar' src='clasificar.png'></img>)
                                                                    : <img className='clasificar' src='clasificar.png'></img>
                                                            }
                                                        </th>
                                                        <th onClick={handleSortByEPS} style={{ cursor: 'pointer' }}>EPS
                                                            {
                                                                orderColumn === "EPS" ? (
                                                                    orderDirection ?
                                                                        orderDirection === "asc" ?
                                                                            <img className='clasificar' src='clasificar-abajo.png' ></img>
                                                                            :
                                                                            <img className='clasificar' src='clasificar-arriba.png'></img>
                                                                        : <img className='clasificar' src='clasificar.png'></img>)
                                                                    : <img className='clasificar' src='clasificar.png'></img>
                                                            }
                                                        </th>
                                                    </>
                                                )}
                                                {mesas.length > 0 && mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] === null && (
                                                    <>
                                                        <th>Admision</th>
                                                        <th>Responsable</th>
                                                    </>
                                                )}
                                                <th>{mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] != null ? 'Descripcion' : 'Indicaciones'}</th>
                                                {mesas.length > 0 && mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] === false && (
                                                    <>
                                                        <th>{mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] ? "Respuestas" : "Responsable"}</th>
                                                    </>
                                                )}
                                                <th>Creado</th>
                                                {(mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.adjunto)[0]
                                                    ?
                                                    (mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] == true
                                                        ||
                                                        mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] == false)
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
                                                {!mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] && (
                                                    <>
                                                        <th>Encargado</th>
                                                        {(mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.adjunto)[0]
                                                            ?
                                                            ((mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] == true
                                                                ||
                                                                mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] == false)
                                                            )
                                                                ?
                                                                false
                                                                :
                                                                true
                                                            :
                                                            true
                                                        )
                                                            &&
                                                            (mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] != null) && (
                                                                <th>F. Pend</th>
                                                            )
                                                        }
                                                        {mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] != null && (
                                                            <th>Comentario</th>
                                                        )}
                                                        <th>Estado</th>
                                                        {(mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.adjunto)[0]
                                                            ?
                                                            (mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] == true
                                                                ||
                                                                mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] == false)
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
                                                {(mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.adjunto)[0]) && (
                                                    <th>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" fill="currentColor" className="bi bi-paperclip" viewBox="0 0 16 16">
                                                            <path d="M4.5 3a2.5 2.5 0 0 1 5 0v9a1.5 1.5 0 0 1-3 0V5a.5.5 0 0 1 1 0v7a.5.5 0 0 0 1 0V3a1.5 1.5 0 1 0-3 0v9a2.5 2.5 0 0 0 5 0V5a.5.5 0 0 1 1 0v7a3.5 3.5 0 1 1-7 0z" />
                                                        </svg>
                                                    </th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {!mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] ? (
                                                getPaginatedCases().length > 0 && getPaginatedCases().map((caso, index) => (
                                                    <tr key={index} ref={index === casosRes.length - 1 ? lastRowRef : null}>
                                                        <td>{caso.id}</td>
                                                        {mesas.length > 0 && mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] === null && (
                                                            <>
                                                                <td>{caso.numFactura}</td>
                                                                <td>{caso.responsable}</td>
                                                            </>
                                                        )}

                                                        {mesas.length > 0 && mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] && (
                                                            <>
                                                                <td>{caso.admission}</td>
                                                                {mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] == null && (
                                                                    <td>{caso.destinoPaciente}</td>
                                                                )}
                                                                <td className="text-wrap" style={{ maxWidth: '100px', whiteSpace: 'pre-wrap' }}>{caso.patient_name}</td>
                                                                <td>{caso.patient_id}</td>
                                                                <td>{caso.EPS}</td>
                                                            </>
                                                        )}
                                                        <td className="text-wrap" style={{ maxWidth: '150px', whiteSpace: 'pre-wrap' }}>{caso.description}</td>
                                                        {mesas.length > 0 && mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] === false && (
                                                            <td>{caso.responsable}</td>
                                                        )}
                                                        <td className="text-wrap" style={{ maxWidth: '100px', whiteSpace: 'pre-wrap' }}>{
                                                            (mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.adjunto)[0]
                                                                ?
                                                                (mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] == true
                                                                    ||
                                                                    mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] == false)
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
                                                        {(!mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.adjunto)[0]) && (
                                                            <td className="text-wrap" style={{ maxWidth: '30px', whiteSpace: 'pre-wrap' }}>{new Date(caso.createdAt).toLocaleString().replace(',', '')}</td>
                                                        )}
                                                        <td className="text-wrap" style={{ maxWidth: '100px', whiteSpace: 'pre-wrap' }}>{
                                                            (!mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.adjunto)[0]
                                                                ?
                                                                (mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] == null)
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
                                                                            </p>)}
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
                                                                            </p>)}
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
                                                        {(mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.adjunto)[0]
                                                            ?
                                                            (mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] == true
                                                                ||
                                                                mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] == false)
                                                                ?
                                                                false
                                                                :
                                                                true
                                                            :
                                                            true
                                                        ) &&
                                                            (mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] != null) && (
                                                                <td className="text-wrap" style={{ maxWidth: '30px', whiteSpace: 'pre-wrap' }}>{new Date(caso.fechaEstado).toLocaleString().replace(',', '')}</td>
                                                            )}
                                                        {mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.asistencia)[0] != null && (
                                                            <td className="text-wrap" style={{ maxWidth: '100px', whiteSpace: 'pre-wrap' }}>{caso.comentario}</td>
                                                        )}
                                                        <td>{caso.estado ? "Finalizado" : "En Proceso"}</td>
                                                        {(mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.adjunto)[0]
                                                            ?
                                                            (mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] == true
                                                                ||
                                                                mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] == false)
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
                                                        {((caso?.documento || caso?.documentoRes) && mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.adjunto)[0]) && (
                                                            <td className="text-wrap" style={{ maxWidth: '50px', whiteSpace: 'pre-wrap', paddingLeft: 0, paddingRight: 0 }}>
                                                                <div className='d-inline-flex'
                                                                    style={mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] == true ? { marginLeft: '-15px' } : {}}
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
                                                    filteredCases.length > 0 && filteredCases.map((caso, index) => (
                                                        <tr key={index} ref={index === casosRes.length - 1 ? lastRowRef : null}>
                                                            <td>{caso.id}</td>
                                                            <td className="text-justify" style={{ maxWidth: '250px', whiteSpace: 'pre-wrap' }}>{caso.description}</td>
                                                            <td className="text-justify" style={{ whiteSpace: 'pre-wrap' }}>
                                                                {asistenciasAll
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
                                                                (mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.adjunto)[0]
                                                                    ?
                                                                    (mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] == true
                                                                        ||
                                                                        mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.patientEnable)[0] == false)
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
                                                            {!mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.adjunto)[0] && (
                                                                <td className="text-wrap" style={{ maxWidth: '30px', whiteSpace: 'pre-wrap' }}>{new Date(caso.createdAt).toLocaleString().replace(',', '')}</td>
                                                            )}
                                                            {((caso?.documento || caso?.documentoRes) && mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.adjunto)[0]) && (
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
                                                            {((caso?.documentoCreate) && mesas.filter(mesa => mesa.id === userData.mesa).map(mesa => mesa.adjunto)[0]) && (
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
                                <div className="d-flex justify-content-between align-items-center mt-3 mb-3">
                                    {/* Selector de items por página */}
                                    <div className="d-flex align-items-center">
                                        <span className="me-3">Mostrar:</span>
                                        <select
                                            className="form-select form-select-sm w-auto"
                                            value={itemsPerPage}
                                            onChange={(e) => {
                                                setItemsPerPage(Number(e.target.value));
                                                setCurrentPage(1); // Resetear a la primera página al cambiar el tamaño
                                            }}
                                        >
                                            <option value={30}>30</option>
                                            <option value={60}>60</option>
                                            <option value={90}>90</option>
                                        </select>
                                        <span className="ms-2">registros</span>
                                    </div>

                                    {/* Navegación de páginas */}
                                    <div className="d-flex align-items-center">
                                        <button
                                            className="btn btn-sm btn-outline-primary me-3"
                                            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                            disabled={currentPage === 1}
                                        >
                                            Anterior
                                        </button>

                                        <span className="mx-2">
                                            Página {currentPage} de {Math.ceil(getSortedCases().length / itemsPerPage)}
                                        </span>

                                        <button
                                            className="btn btn-sm btn-outline-primary ms-2"
                                            onClick={() => setCurrentPage(p => Math.min(p + 1, Math.ceil(getSortedCases().length / itemsPerPage)))}
                                            disabled={currentPage === Math.ceil(getSortedCases().length / itemsPerPage)}
                                        >
                                            Siguiente
                                        </button>
                                    </div>

                                    {/* Contador total */}
                                    <div className="text-muted small">
                                        Mostrando {getPaginatedCases().length} de {getSortedCases().length} registros
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div >
            </div >
        </>
    );
};

export default Cases;
