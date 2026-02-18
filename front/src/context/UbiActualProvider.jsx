import { useContext, useState } from "react";
import { UbiActualContext } from "./UbiActualContext.jsx";
import { CrearUbiActualRequest, DeleteUbiActualRequest, GetUbiActualRequest, GetUbisActualRequest, UpdateUbiActualRequest } from "../model/UbiActual.api.js";

export const useUbiActual = () => {
    const contexto = useContext(UbiActualContext);
    if (!contexto) throw new Error('useUbiActual debe ser usado dentro del provider')
    return contexto
}

export const UbiActualContextProvider = ({ children }) => {
    const [ubiActual, setUbiActual] = useState([]);

    async function crearUbiActual(values) {
        try {
            await CrearUbiActualRequest(values);
        } catch (error) {
            console.error(error)
        }
    }

    async function obtenerUbisActual() {
        try {
            const response = await GetUbisActualRequest()
            setUbiActual(response.data)
            return response.data
        } catch (error) {
            console.error(error)
        }
    }

    async function obtenerUbiActual(cedula, id) {
        try {
            const response = await GetUbiActualRequest(cedula, id)
            return response.data
        } catch (error) {
            console.error(error)
        }
    }

    async function actualizarUbiActual(id, nuevosCampos) {
        try {
            console.log(nuevosCampos)
            const response = await UpdateUbiActualRequest(id, nuevosCampos)
            return response.data
        } catch (error) {
            console.error(error)
            return error.response.data
        }
    }

    const eliminarUbiActual = async (id) => {
        try {
            await DeleteUbiActualRequest(id)
            setUbiActual(ubiActual.filter(ubi => ubi.id !== id))
        } catch (error) {
            console.error('Error al eliminar ubiActual', error)
        }
    }

    return (
        <UbiActualContext.Provider value={{ ubiActual, crearUbiActual, obtenerUbisActual, obtenerUbiActual, actualizarUbiActual, eliminarUbiActual }}>
            {children}
        </UbiActualContext.Provider>
    )
}