import { useContext, useState } from "react";
import { AsistenciaContext } from "./AsistenciaContext.jsx";
import { CrearAsistenciaRequest, DeleteAsistenciaRequest, GetAsistenciaRequest, GetAsistenciasCasoRequest, GetAsistenciasRequest, UpdateAsistenciaRequest } from "../model/asistencia.api.js";

export const useAsistencia = () => {
    const contexto = useContext(AsistenciaContext);
    if (!contexto) throw new Error('useAsistencia debe ser usado dentro del provider')
    return contexto
}

export const AsistenciaContextProvider = ({ children }) => {
    const [asistencias, setAsistencia] = useState([]);

    async function crearAsistencia(values) {
        try {
            await CrearAsistenciaRequest(values);
        } catch (error) {
            console.error(error)
        }
    }

    async function obtenerAsistencias() {
        try {
            const response = await GetAsistenciasRequest()
            setAsistencia(response.data)
            return response.data
        } catch (error) {
            console.error(error)
        }
    }

    async function obtenerAsistencia(cedula, id) {
        try {
            const response = await GetAsistenciaRequest(cedula, id)
            return response.data
        } catch (error) {
            console.error(error)
        }
    }

    async function obtenerAsistenciasCaso(caso) {
        try {
            const response = await GetAsistenciasCasoRequest(caso)
            return response.data
        } catch (error) {
            console.error(error)
        }
    }

    async function actualizarAsistencia(id, nuevosCampos) {
        try {
            const response = await UpdateAsistenciaRequest(id, nuevosCampos)
            return response.data
        } catch (error) {
            console.error(error)
            return error.response.data
        }
    }

    const eliminarAsistencia = async (id) => {
        try {
            await DeleteAsistenciaRequest(id)
            setAsistencia(asistencias.filter(asistencia => asistencia.id !== id))
        } catch (error) {
            if (error.response.status == '500') {
                return "No se pudo eliminar al usuario, ya que tiene mensajes"
            }
        }
    }

    return (
        <AsistenciaContext.Provider value={{ asistencias, crearAsistencia, obtenerAsistencias, obtenerAsistenciasCaso, obtenerAsistencia, actualizarAsistencia, eliminarAsistencia }}>
            {children}
        </AsistenciaContext.Provider>
    )
}