import React, { useEffect, useState } from 'react'
import useUbiActualController from '../controller/UbiActualController.jsx'
import Swal from 'sweetalert2'
import useUbiDestinoController from '../controller/UbiDestinoController.jsx'

const Ubicacion = () => {
    const [ubicacion, setUbicacion] = useState('')
    const [ubiActual, setUbiActual] = useState([])
    const [ubiDestino, setUbiDestino] = useState([])

    const { sendUbiActual, getUbisActual, uptUbiActual, delUbiActual } = useUbiActualController()
    const { sendUbiDestino, getUbisDestino, uptUbiDestino, delUbiDestino } = useUbiDestinoController()

    async function fetchUbicacion() {
        const ubiA = await getUbisActual()
        setUbiActual(ubiA)

        const ubiD = await getUbisDestino()
        setUbiDestino(ubiD)
    }

    useEffect(() => {
        const intervalId = setInterval(fetchUbicacion, ubiActual?.length > 0 ? 600000 : 100);

        return () => clearInterval(intervalId);
    }, [fetchUbicacion, ubiActual])

    function showUploadDialog(crear, ubi = {}) {
        Swal.fire({
            title: crear ? 'Crear Ubicacion' : 'Modificar Ubicacion',
            html: `
                <form onsubmit="return false">
                ${!crear
                    ?
                    `
                        <div class='d-flex mt-2'>
                            <p class='me-5 ms-4'>Id:</p>
                            <div class="form-check form-switch ms-5">
                                <p class="ms-5 fw-bold">${ubi?.Id || ''}</p>
                            </div>
                        </div>
                    `
                    :
                    ''
                }

                    <div>
                        <label for="nombre">Nombre:</label>
                        <input type="text" id="nombre" class="swal2-input" placeholder="Ingrese el nombre" value="${ubi?.Nombre || ''}">
                    </div>

                    <div class='d-flex mt-2'>
                        <p class='me-5 ms-4'>Estado:</p>
                        <div class="form-check form-switch ms-5">
                        <input
                            class="form-check-input ms-3"
                            id="estado"
                            type="checkbox"
                            ${(ubi?.Estado || crear) ? 'checked' : ''}
                        />
                        </div>
                    </div>
                </form>
            `,
            focusConfirm: false,
            preConfirm: () => {
                const nombre = document.getElementById('nombre').value;
                const estado = document.getElementById('estado').checked

                if (!nombre) {
                    Swal.showValidationMessage('Por favor, complete todos los campos');
                } else {
                    return { nombre, estado };
                }
            },
            didOpen: () => {
                const input = document.getElementById('nombre');
                input.focus();

                // ⚡ Capturar Enter
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault(); // Evita recargar la página
                        Swal.clickConfirm(); // Simula clic en "Confirmar"
                    }
                });
            },
        }).then((result) => {
            if (result.isConfirmed) {
                const { nombre, estado } = result.value;

                const upt = {
                    Nombre: nombre.toUpperCase(),
                    Estado: estado
                };

                if (getUbi()) {
                    if (crear) {
                        sendUbiActual({ Nombre: nombre.toUpperCase() })
                    }
                    else {
                        uptUbiActual(ubi.Id, upt)
                    }
                }
                else {
                    if (crear) {
                        sendUbiDestino({ Nombre: nombre.toUpperCase() })
                    }
                    else {
                        uptUbiDestino(ubi.Id, upt)
                    }
                }

                setTimeout(() => {
                    fetchUbicacion();
                }, 500)
            }
        });
    };

    function handleChange(e) {
        setUbicacion(e.target.value);
    };

    function getUbi() {
        return ubicacion == 'Actual' ? true : ubicacion == 'Destino' ? false : null
    }

    return (
        <div className='mx-5'>
            <div className="d-flex bd-highlight">
                <div className="me-auto p-2 bd-highlight">
                    <h1 className="mb-4">Lista de Ubicaciones</h1>
                </div>
                {getUbi() != null && (
                    <div className="p-2 bd-highlight">
                        <button type="button" className="btn btn-success me-2" onClick={() => showUploadDialog(true)}>Crear</button>
                    </div>
                )}
            </div>
            <select className="form-select mb-4" defaultValue={ubicacion} onChange={handleChange}>
                <option selected hidden value=''>Selecciona ubicación</option>
                <option value="Actual">Actual</option>
                <option value="Destino">Destino</option>
            </select>
            <table className="table table-striped table-hover" style={{ overflow: 'hidden' }}>
                <thead>
                    <tr className="table-light">
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {((getUbi() ? ubiActual : ubiDestino)?.length > 0 && getUbi() != null)
                        ?
                        (
                            (getUbi() ? ubiActual : ubiDestino)?.map(ub => (
                                <tr key={ub.Id}>
                                    <td>{ub.Id}</td>
                                    <td>{ub.Nombre}</td>
                                    <td>{ub.Estado ? 'Activo' : 'Inactivo'}</td>
                                    <td>{new Date(ub.Fecha).toLocaleString().replace(',', '')}</td>
                                    <td className="text-wrap" style={{ maxWidth: '100px', whiteSpace: 'pre-wrap' }}>
                                        <button
                                            className="btn btn-sm btn-warning me-2"
                                            onClick={() => showUploadDialog(false, ub)}
                                        >
                                            Modificar
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => getUbi() ? delUbiActual(ub.id) : delUbiDestino(ub.id)}
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )
                        :
                        (
                            <tr className='text-center'>
                                <td colSpan='5'>No hay ubicaciones disponibles</td>
                            </tr>
                        )
                    }
                </tbody>
            </table>
        </div>
    )
}

export default Ubicacion