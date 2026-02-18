import { useContext, useState } from "react";
import { UbiDestinoContext } from "./UbiDestinoContext.jsx";
import { CrearUbiDestinoRequest, DeleteUbiDestinoRequest, GetUbiDestinoRequest, GetUbisDestinoRequest, UpdateUbiDestinoRequest } from "../model/UbiDestino.api.js";

export const useUbiDestino = () => {
    const contexto = useContext(UbiDestinoContext);
    if (!contexto) throw new Error('UbiDestino debe ser usado dentro del provider')
    return contexto
}

export const UbiDestinoContextProvider = ({ children }) => {
    const [ubiDestino, setUbiDestino] = useState([]);

    async function crearUbiDestino(values) {
        try {
            await CrearUbiDestinoRequest(values);
        } catch (error) {
            console.error(error)
        }
    }

    async function obtenerUbisDestino() {
        try {
            const response = await GetUbisDestinoRequest()
            setUbiDestino(response.data)
            return response.data
        } catch (error) {
            console.error(error)
        }
    }

    async function obtenerUbiDestino(cedula, id) {
        try {
            const response = await GetUbiDestinoRequest(cedula, id)
            return response.data
        } catch (error) {
            console.error(error)
        }
    }

    async function actualizarUbiDestino(id, nuevosCampos) {
        try {
            console.log(nuevosCampos)
            const response = await UpdateUbiDestinoRequest(id, nuevosCampos)
            return response.data
        } catch (error) {
            console.error(error)
            return error.response.data
        }
    }

    const eliminarUbiDestino = async (id) => {
        try {
            await DeleteUbiDestinoRequest(id)
            setUbiDestino(ubiDestino.filter(ubi => ubi.id !== id))
        } catch (error) {
            console.error('Error al eliminar ubiActual', error)
        }
    }

    return (
        <UbiDestinoContext.Provider value={{ ubiDestino, crearUbiDestino, obtenerUbisDestino, obtenerUbiDestino, actualizarUbiDestino, eliminarUbiDestino }}>
            {children}
        </UbiDestinoContext.Provider>
    )
}