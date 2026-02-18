import axios from "axios";

const URL = "https://10.20.2.170:3030"

export const CrearConfigRequest=async(config)=>await axios.post(`${URL}/config`, config)
export const GetConfigsRequest=async()=>await axios.get(`${URL}/configs`)
export const GetConfigRequest=async(id)=>await axios.get(`${URL}/config/${id}`)
export const UpdateConfigRequest=async(id,nuevosCampos) => await axios.patch(`${URL}/config/${id}`,nuevosCampos)
export const DeleteConfigsRequest=async(id)=>await axios.delete(`${URL}/config/${id}`)