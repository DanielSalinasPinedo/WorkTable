import axios from "axios";

const URL = "https://10.20.2.170:3030"

export const CrearMesaRequest=async(workTable)=>await axios.post(`${URL}/workTable`, workTable)
export const GetMesasRequest=async()=>await axios.get(`${URL}/workTables`)
export const GetMesaRequest=async(id)=>await axios.get(`${URL}/workTable/${id}`)
export const DeleteMesaRequest=async(id)=>await axios.delete(`${URL}/workTable/${id}`)  
export const UpdateMesaRequest=async(id, nuevosCampos) => await axios.patch(`${URL}/workTable/${id}`,nuevosCampos)