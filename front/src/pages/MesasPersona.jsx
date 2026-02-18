import React, { useCallback, useEffect, useState, useRef } from 'react';
import Swal from 'sweetalert2';
import * as Yup from 'yup';
import 'bootstrap/dist/css/bootstrap.min.css'; // Asegúrate de importar Bootstrap
import useMesaController from '../controller/MesaController';
import { ErrorMessage, Form, Formik, Field } from 'formik';
import useUsuariosController from '../controller/userController';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import useCaseController from '../controller/CasesController';
import { parse } from "date-fns";

const MesasPersona = () => {
    const navigate = useNavigate();
    const { getMesas, getMesa, sendMesa, uptMesa, delMesa } = useMesaController();
    const { sendCase } = useCaseController();

    const [mesas, setMesas] = useState([])
    const [usuarios, setUsuarios] = useState([])
    const [userData, setUserData] = useState([]);

    const [paciente, setPaciente] = useState(false)
    const [facturador, setFacturador] = useState(false)
    const [asistencia, setAsistencia] = useState(false)
    const [adjunto, setAdjunto] = useState(false)
    const [mesaId, setMesaId] = useState(0)

    const fileInputRef = useRef(null);

    const { getUsers } = useUsuariosController();

    const fetchMesas = useCallback(async () => {
        const workTable = await getMesas();
        if (workTable && workTable.length > 0 && Array.isArray(workTable)) {
            if (JSON.stringify(workTable) !== JSON.stringify(mesas)) {
                workTable.filter(mesa => mesa.owner === userData.id_usuario)
                setMesas(workTable);
            }
        }
    })

    useEffect(() => {
        const storedUserData = sessionStorage.getItem('userData');
        if (!storedUserData) {
            navigate('/');
        } else {
            setUserData(JSON.parse(storedUserData));
        }
    }, [navigate, setUserData]);

    useEffect(() => {
        const ActualizarMesas = () => {
            if (!Swal.isVisible()) {
                fetchMesas()
                fetchUsers()
            }
        }

        const intervalo = setInterval(ActualizarMesas, 500);

        // Limpieza: elimina el intervalo cuando el componente se desmonta
        return () => clearInterval(intervalo);
    }, [fetchMesas]);

    const fetchUsers = useCallback(async () => {
        try {
            const users = await getUsers();
            if (users.length > 0 && Array.isArray(users)) {
                if (JSON.stringify(users) !== JSON.stringify(usuarios)) {
                    setUsuarios(users);
                }
            } else {
                console.warn("No se encontraron usuarios o los datos no son una matriz.");
            }
        } catch (error) {
            console.error('Error al obtener los usuarios', error);
        }
    }, [getUsers])

    const validationSchema = Yup.object().shape({
        nombre: Yup.string().required('Campo requerido')
    });

    const handleAddMesa = (values) => {
        const valor = {
            ...values,
            owner: userData.id_usuario,
            patientEnable: paciente,
            asistencia: asistencia
        }
        sendMesa(valor)
    };

    const handleCheckboxChangeAsistencia = (event) => {

        setAsistencia(event.target.checked);
        setFacturador(false)
    };

    const handleCheckboxChangePaciente = (event) => {

        setPaciente(event.target.checked);
        setFacturador(false)
        setAsistencia(false)
    };

    const handleCheckboxChangeFacturador = (event) => {

        setFacturador(event.target.checked);
        setPaciente(false)
        setAsistencia(false)
    };

    const handleCheckboxChangeAdjunto = (event) => {
        setAdjunto(event.target.checked);
    };

    const showUploadDialog = (mesa) => {
        Swal.fire({
            title: 'Modificar Usuario',
            didOpen: () => {
                const nombreInput = document.getElementById('nombre2');
                if (nombreInput) {
                    nombreInput.focus();
                    nombreInput.setSelectionRange(nombreInput.value.length, nombreInput.value.length); // Coloca el cursor al final
                }

                const checkPaciente = document.getElementById('flexSwitchCheckChecked3');
                const checkFactura = document.getElementById('flexSwitchCheckChecked4');
                const warningMessage = document.getElementById('warning-message');

                const updateWarningMessage = () => {
                    // Mostrar el mensaje si ambos checkboxes están desmarcados
                    if (!checkPaciente.checked && !checkFactura.checked) {
                        warningMessage.style.display = 'block';
                    } else {
                        warningMessage.style.display = 'none';
                    }
                };

                const toggleExclusiveCheckbox = (source, target) => {
                    if (source.checked) {
                        target.checked = false; // Desmarcar el otro checkbox
                    }
                    updateWarningMessage();
                };

                // Agregar eventos de cambio a los checkboxes
                checkPaciente.addEventListener('change', () => toggleExclusiveCheckbox(checkPaciente, checkFactura));
                checkFactura.addEventListener('change', () => toggleExclusiveCheckbox(checkFactura, checkPaciente));

                // Ejecutar una vez para verificar el estado inicial
                updateWarningMessage();
            },
            html: `
                <form id="modify-user-form">
                    <div class="form-group mb-3" style="text-align: left;">
                        <label for="nombre" class="form-label">Nombre</label>
                        <input type="text" id="nombre2" name="nombre2" class="form-control" placeholder="Nombre" value="${mesa.nombre}"/>
                        <div id="nombre-error" class="text-danger mt-1" style="display: none;">Este campo es requerido.</div>
                    </div>
                    <div class="form-check form-switch mb-3" style="text-align: left;">
                        <input class="form-check-input" type="checkbox" id="flexSwitchCheckChecked3" ${mesa.patientEnable ? "checked" : ""}/>
                        <label class="form-check-label ms-2" for="flexSwitchCheckChecked3">¿Quiere que incluya datos de paciente?</label>
                    </div>
                    <div class="form-check form-switch mb-3" style="text-align: left;">
                        <input class="form-check-input" type="checkbox" id="flexSwitchCheckChecked4" ${mesa.patientEnable === null ? "checked" : ""}/>
                        <label class="form-check-label ms-2" for="flexSwitchCheckChecked4">¿Quiere que incluya datos de factura?</label>
                    </div>
                    <div class="form-check form-switch mb-3" style="text-align: left;">
                        <input class="form-check-input" type="checkbox" id="flexSwitchCheckChecked5" ${mesa.estado ? "checked" : ""}/>
                        <label class="form-check-label ms-2" for="flexSwitchCheckChecked5">Estado</label>
                    </div>
                    <div class="form-check form-switch mb-3" style="text-align: left;">
                        <input class="form-check-input" type="checkbox" id="flexSwitchCheckChecked6" ${mesa.asistencia ? "checked" : ""}/>
                        <label class="form-check-label ms-2" for="flexSwitchCheckChecked6">Asistencia</label>
                    </div>
                    <div class="form-check form-switch mb-3" style="text-align: left;">
                        <input class="form-check-input" type="checkbox" id="flexSwitchCheckChecked7" ${mesa.adjunto ? "checked" : ""}/>
                        <label class="form-check-label ms-2" for="flexSwitchCheckChecked7">Adjunto</label>
                    </div>
                    <p id="warning-message" class="text-danger" style="display: none;">Si no selecciona ninguno de los 2, las tareas serán básicas. Ejemplo: 1 actividad por asignar.</p>
                </form>
            `,
            focusConfirm: false,
            preConfirm: () => {
                const nombre = document.getElementById('nombre2').value;
                const input = document.getElementById("flexSwitchCheckChecked3").checked; // Paciente
                const input2 = document.getElementById("flexSwitchCheckChecked4").checked; // Factura
                const input3 = document.getElementById("flexSwitchCheckChecked5").checked; // Estado
                const input4 = document.getElementById("flexSwitchCheckChecked6").checked; // Asistencia
                const input5 = document.getElementById("flexSwitchCheckChecked7").checked; // Adjunto

                if (!nombre || (input && input2) && ((input || input2) && input4)) {
                    Swal.showValidationMessage('Por favor, complete todos los campos o seleccionelos de manera correcta');
                } else {
                    return { nombre, input, input2, input3, input4, input5 };
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const { nombre, input, input2, input3, input4, input5 } = result.value;

                const upt = {
                    nombre: nombre,
                    patientEnable: (input && input2 === false) ? input : (input === false && input2 === false) ? input : null,
                    estado: input3,
                    asistencia: input4,
                    adjunto: input5
                };

                const info = uptMesa(mesa.id, upt);

                info.then(response => {
                    if (response.msg) {
                        Swal.fire({
                            title: 'ERROR',
                            text: response.msg,
                            icon: 'error',
                            confirmButtonText: 'Aceptar'
                        });
                    }
                }).catch(error => {
                    console.error("Error:", error);
                });

                setTimeout(() => {
                    fetchMesas();
                }, 300);
            }
        });
    };

    const showDeleteDialog = (id) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás deshacer esta acción",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                const info = delMesa(id)

                info.then(response => {
                    if (response.msg) {
                        Swal.fire({
                            title: 'ERROR',
                            text: response.msg,
                            icon: 'error',
                            confirmButtonText: 'Aceptar'
                        });
                    }
                })
                    .catch(error => {
                        console.error("Error:", error);
                    })

                setTimeout(() => {
                    fetchMesas();
                }, 300);
            }
        });
    }

    const filteredMesas = () => {
        const filteredWorkTable = mesas.filter(mesa => mesa.owner === userData.id_usuario)
        return filteredWorkTable
    }

    // Función para crear y descargar el archivo de ejemplo
    const descargarEjemplo = (tipoMesa) => {
        let ejemploData
        if (tipoMesa) {
            ejemploData = [
                {
                    Admision: "",
                    Paciente: "",
                    Cedula: "",
                    EPS: "",
                    Descripcion: "",
                    Creado: "",
                    "F. Creacion": "0"
                },
                {
                    Admision: "",
                    Paciente: "",
                    Cedula: "",
                    EPS: "",
                    Descripcion: "",
                    Creado: "",
                    "F. Creacion": "",
                    Encargado: "",
                    "F. Pend": "",
                    Estado: "",
                    Comentario: ""
                },
                {
                    Admision: "",
                    Paciente: "",
                    Cedula: "",
                    EPS: "",
                    Descripcion: "",
                    Creado: "",
                    "F. Creacion": "",
                    Encargado: "",
                    "F. Pend": "",
                    Estado: "",
                    Comentario: "",
                    "F. Resuelto": ""
                }
            ];
        }
        else if (tipoMesa === null) {
            ejemploData = [
                {
                    Admision: "",
                    responsable: "",
                    Descripcion: "",
                    Creado: "",
                    "F. Creacion": ""
                },
                {
                    Admision: "",
                    responsable: "",
                    Descripcion: "",
                    Creado: "",
                    "F. Creacion": "",
                    Encargado: "",
                    "F. Pend": "",
                    Estado: "",
                    Comentario: ""
                },
                {
                    Admision: "",
                    responsable: "",
                    Descripcion: "",
                    Creado: "",
                    "F. Creacion": "",
                    Encargado: "",
                    "F. Pend": "",
                    Estado: "",
                    Comentario: "",
                    "F. Resuelto": ""
                }
            ];
        }
        else {
            ejemploData = [
                {
                    Descripcion: "",
                    Creado: "",
                    "F. Creacion": ""
                },
                {
                    Descripcion: "",
                    Creado: "",
                    "F. Creacion": "",
                    Encargado: "",
                    "F. Pend": "",
                    Estado: "",
                    Comentario: ""
                },
                {
                    Descripcion: "",
                    Creado: "",
                    "F. Creacion": "",
                    Encargado: "",
                    "F. Pend": "",
                    Estado: "",
                    Comentario: "",
                    "F. Resuelto": ""
                }
            ];
        }

        // Crear un nuevo libro de trabajo
        const workbook = XLSX.utils.book_new();

        // Crear hojas individuales y agregarlas al libro de trabajo
        const hojaCasosPendientes = XLSX.utils.json_to_sheet([ejemploData[0]]);
        XLSX.utils.book_append_sheet(workbook, hojaCasosPendientes, "Casos Pendientes");

        const hojaCasosEnProceso = XLSX.utils.json_to_sheet([ejemploData[1]]);
        XLSX.utils.book_append_sheet(workbook, hojaCasosEnProceso, "Casos en Proceso");

        const hojaCasosResueltos = XLSX.utils.json_to_sheet([ejemploData[2]]);
        XLSX.utils.book_append_sheet(workbook, hojaCasosResueltos, "Casos Resueltos");

        // Guardar el archivo como "Formato_Casos.xlsx"
        XLSX.writeFile(workbook, "Formato_Casos.xlsx");
    };

    function isValidDate(dateString) {
        if (!dateString) return false;
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    }

    const importFromExcel = async (event) => {
        try {
            const file = event.target.files[0]; // Obtiene el archivo cargado
            if (!file) return;

            const mesa = mesas.find(mesa => mesa.id === mesaId)

            const reader = new FileReader();
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // Verifica si las hojas existen
                if (!workbook.Sheets["Casos Pendientes"] || !workbook.Sheets["Casos en Proceso"] || !workbook.Sheets["Casos Resueltos"]) {
                    fileInputRef.current.value = "";
                    Swal.fire({
                        icon: 'error',
                        title: 'Formato Incorrecto',
                        text: 'Faltan hojas en el archivo. Asegúrate de que todas las hojas necesarias estén presentes.',
                        showCancelButton: true,
                        confirmButtonText: 'Descargar Ejemplo',
                        cancelButtonText: 'Cerrar'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            descargarEjemplo(mesa.patientEnable);
                        }
                    });
                    return;
                }

                // Lee cada hoja del archivo
                // Crear un array con los tres conjuntos de datos
                const casosArray = [
                    { nombre: "Casos Pendientes", datos: XLSX.utils.sheet_to_json(workbook.Sheets["Casos Pendientes"]) },
                    { nombre: "Casos en Proceso", datos: XLSX.utils.sheet_to_json(workbook.Sheets["Casos en Proceso"]) },
                    { nombre: "Casos Resueltos", datos: XLSX.utils.sheet_to_json(workbook.Sheets["Casos Resueltos"]) }
                ];

                // Orden esperado
                const ordenEsperadoFac = ["Creado", "Descripcion", "F. Creacion", "Admision", "responsable"];
                const ordenEsperadoPac = ["Admision", "Cedula", "Creado", "Descripcion", "F. Creacion", "Paciente",];
                const ordenEsperadoGen = ["Caso", "Creado", "Descripcion", "F. Creacion"];

                //mesa.patientEnable === null ? "Facturacion" : mesa.patientEnable ? "Paciente" : "General"
                for (let i = 0; i < 3; i++) {
                    if (!casosArray[i].datos || casosArray[i].datos.length > 0) {
                        // Verifica el orden de las claves en el primer caso
                        const clavesCaso = Object.keys(casosArray[i].datos[0]);
                        const claveEsperada = mesa.patientEnable === null ? ordenEsperadoFac : mesa.patientEnable ? ordenEsperadoPac : ordenEsperadoGen;
                        const contieneTodas = claveEsperada.every(clave => clavesCaso.includes(clave));

                        if (!contieneTodas) {
                            fileInputRef.current.value = "";
                            Swal.fire({
                                icon: 'error',
                                title: 'Formato Incorrecto',
                                text: 'Descarga el archivo de ejemplo con el formato correcto.',
                                showCancelButton: true,
                                confirmButtonText: 'Descargar Ejemplo',
                                cancelButtonText: 'Cerrar',
                                allowOutsideClick: false,  // Evita el cierre al hacer clic fuera
                                allowEscapeKey: false,     // Evita el cierre con la tecla "Esc"
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    descargarEjemplo(mesa.patientEnable);
                                }
                            });
                            return;
                        }

                        const casosFecha = casosArray[i].datos.map(caso => {
                            // Inicializa el objeto con la fecha de "F. Creacion"
                            const fecha = isValidDate(caso["F. Creacion"]) ? parse(caso["F. Creacion"], "dd/M/yyyy H:mm:ss", new Date()) : new Date();
                            var fechaCaso = {
                                ...caso,
                                "F. Creacion": fecha,
                            };

                            // Condiciones según el índice 'i'
                            if (i >= 1) {
                                // Para "Casos en Proceso"
                                fechaCaso["F. Pend"] = new Date(caso["F. Pend"]);
                                i === 2 && (fechaCaso["F. Resuelto"] = new Date(caso["F. Resuelto"]));
                            }

                            return fechaCaso;
                        });

                        // Procesa los datos importados
                        for (let j = 0; j < casosFecha.length; j++) {
                            const keyMap = {
                                "Admision": "admission",
                                "Paciente": "patient_name",
                                "Cedula": "patient_id",
                                "responsable": "responsable",
                                "Descripcion": "description",
                                "Creado": "user_create",
                                "F. Creacion": "createdAt",
                                "Encargado": "user_resolved",
                                "F. Pend": "fechaEstado",
                                "Comentario": "comentario",
                                "Estado": "estado",
                                "F. Resuelto": "resolvedAt"
                            };

                            const cas = Object.keys(casosFecha[j]).reduce((acc, key) => {
                                const newKey = keyMap[key] || key;
                                acc[newKey] = casosFecha[j][key];
                                return acc;
                            }, {})

                            const temp = {
                                ...cas,
                                mesa: mesaId,
                                estado: (cas.estado === "En Proceso" ? 0 : cas.estado === "Finalizado" ? 1 : null) || null
                            };

                            sendCase(temp)
                        }

                        fileInputRef.current.value = "";
                        Swal.fire({
                            title: "Exitoso",
                            text: "Los datos han sido cargados exitosamente",
                            icon: "success"
                        });
                    }
                }
            };
            reader.readAsArrayBuffer(file);
        } catch (error) {
            fileInputRef.current.value = "";
            Swal.fire({
                icon: 'error',
                title: 'Formato Incorrecto',
                text: 'El formato es incorrecto. Descarga el archivo de ejemplo con el formato correcto.',
                showCancelButton: true,
                confirmButtonText: 'Descargar Ejemplo',
                cancelButtonText: 'Cerrar'
            }).then((result) => {
                if (result.isConfirmed) {
                    descargarEjemplo();
                }
            });
        }
    };

    const handleButtonClick = (id) => {
        setMesaId(id)
        fileInputRef.current.click();
    };

    return (
        <div className='container'>
            <div className="card p-4 shadow-sm mb-5">
                <Formik
                    initialValues={{
                        nombre: '',
                        owner: userData.id_usuario,
                        patientEnable: paciente,
                        asistencia: asistencia,
                        adjunto: adjunto
                    }}
                    validationSchema={validationSchema}
                    onSubmit={(values, { resetForm }) => {
                        handleAddMesa(values); // Llama a tu función de envío
                        resetForm(); // Resetea el formulario
                    }}
                >
                    <Form>
                        <div className="form-group mb-2">
                            <label htmlFor="nombre" className="form-label">Nombre</label>
                            <Field type="text" id="nombre" name="nombre" className="form-control" placeholder="Nombre" rows="3" />
                            <ErrorMessage name="nombre" component="div" className="text-danger" />
                        </div>
                        {paciente !== null && paciente !== true && facturador !== true && (
                            <div className="form-check form-switch mb-3">
                                <input className="form-check-input" type="checkbox" id="flexSwitchCheckChecked3" checked={asistencia} onChange={handleCheckboxChangeAsistencia} />
                                <label className="form-check-label" htmlFor="flexSwitchCheckChecked3">¿Quieres que la mesa sea tomada como asistancia/comunicado?</label>
                            </div>
                        )}
                        <div className="form-check form-switch mb-3">
                            <input className="form-check-input" type="checkbox" id="flexSwitchCheckChecked" checked={paciente} onChange={handleCheckboxChangePaciente} />
                            <label className="form-check-label" htmlFor="flexSwitchCheckChecked">¿Quiere que includa datos de paciente?</label>
                        </div>
                        <div className="form-check form-switch mb-3">
                            <input className="form-check-input" type="checkbox" id="flexSwitchCheckChecked2" checked={facturador} onChange={handleCheckboxChangeFacturador} />
                            <label className="form-check-label" htmlFor="flexSwitchCheckChecked2">¿Quiere que includa datos de factura?</label>
                        </div>
                        <div className="form-check form-switch mb-3">
                            <input className="form-check-input" type="checkbox" id="flexSwitchCheckChecked8" checked={adjunto} onChange={handleCheckboxChangeAdjunto} />
                            <label className="form-check-label" htmlFor="flexSwitchCheckChecked8">Adjunto</label>
                        </div>
                        {((paciente !== null && paciente !== true) && facturador !== true) && (
                            <p className='text-danger'>Si no selecciona ninguna de las 2 tareas entonces, seran basicas. Ejemplo 1 actividad por asignar</p>
                        )}
                        {!adjunto && (
                            <p className='text-danger'>Si selecciona adjunto, podra adjunta archivos</p>
                        )}
                        <button type="submit" className="btn btn-primary w-100 mb-2">Enviar</button>
                    </Form>
                </Formik>
            </div>

            <div className='mt-5'>
                <table className="table table-striped table-hover">
                    <thead className="table-light">
                        <tr>
                            <th style={{ cursor: 'pointer' }}>Num Mesa</th>
                            <th>Nombre</th>
                            <th>Creado</th>
                            <th>Tipo de Mesa</th>
                            <th>Dueño</th>
                            <th>Estado</th>
                            <th>Asistencia</th>
                            <th>Adjunto</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMesas().length > 0 ? (
                            filteredMesas().map((mesa, index) => {
                                const usuario = usuarios.find((user) => user.id_usuario === mesa.owner);

                                return (
                                    <tr key={index}>
                                        <td>{mesa.id}</td>
                                        <td>{mesa.nombre}</td>
                                        <td>{new Date(mesa.fecha).toLocaleString().replace(',', '')}</td>
                                        <td>{mesa.patientEnable === null ? "FACTURACION" : mesa.patientEnable ? "PACIENTE" : "GENERAL"}</td>
                                        <td>{usuario ? usuario.nombre : "N/A"}</td>
                                        <td>{mesa.estado ? "Activo" : "Inactivo"}</td>
                                        <td>{mesa.asistencia ? "HABILITADA" : "DESHABILITADA"}</td>
                                        <td>{mesa.adjunto ? "HABILITADA" : "DESHABILITADA"}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-warning me-2"
                                                onClick={() => showUploadDialog(mesa)}
                                            >
                                                Modificar
                                            </button>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => showDeleteDialog(mesa.id)}
                                            >
                                                Eliminar
                                            </button>
                                            <button className='btn btn-sm btn-success ms-4' onClick={() => handleButtonClick(mesa.id)}>Importar
                                                <img src="excel.png" alt="excel" style={{ height: '30px' }} />
                                            </button>
                                            <input
                                                type="file"
                                                accept=".xlsx, .xls"
                                                ref={fileInputRef}
                                                style={{ display: "none" }}
                                                onChange={importFromExcel}
                                            />
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="8" className="text-center">
                                    No hay mesas disponibles
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
};

export default MesasPersona;