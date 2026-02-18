import { useContext, useState } from "react";
import { CrearMesaRequest, GetMesasRequest, GetMesaRequest, DeleteMesaRequest, UpdateMesaRequest } from "../model/workTable.api.js";
import { MesasContext } from "./MesasContext.jsx";

export const useMesas=()=>{
    const contexto=useContext(MesasContext);
    if(!contexto) throw new Error('useMesas debe ser usado dentro del provider')
    return contexto
}

export const MesasContextProvider = ({children})=>{
    const [mesas, setMesas] = useState([]);

    const crearMesa = async(values)=>{
        try {
            await CrearMesaRequest(values);
        } catch (error) {
            console.error(error)
        }
    }

    const obtenerMesas = async()=>{
        try {
          const response = await GetMesasRequest()
          setMesas(response.data)
          return response.data
        } catch (error) {
          console.error(error)
        }
    }

    const obtenerMesa = async(id)=>{
        try {
            const response = await GetMesaRequest(id)
            return response.data
        } catch (error) {
            console.error(error)
        }
    }

    const actualizarMesa = async(id,nuevosCampos)=>{
        try {
            const response = await UpdateMesaRequest(id, nuevosCampos)
            return response.data
        } catch (error) {
            console.error(error)
            return error.response.data
        }
    }

    const deleteMesa = async(id)=>{
        try {
            await DeleteMesaRequest(id)
        } catch (error) {
            console.error(error)
            return error.response.data
        }
    }

    return (
        <MesasContext.Provider value={{ mesas, crearMesa, obtenerMesas, obtenerMesa, actualizarMesa, deleteMesa }}>
            {children}
        </MesasContext.Provider>
    )
}