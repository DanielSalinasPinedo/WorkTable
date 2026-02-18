import axios from "axios";

const URL = "https://10.20.2.170:3030"

export const CrearUsuarioRequest=async(usuario)=>await axios.post(`${URL}/users`, usuario)
export const GetUsuariosRequest=async()=>await axios.get(`${URL}/users`)
export const DeleteUsuarioRequest=async(id)=>await axios.delete(`${URL}/users/${id}`)
export const GetUsuarioRequest=async(id)=>await axios.get(`${URL}/users/${id}`)
export const UpdateUsuarioRequest=async(id,nuevosCampos) => await axios.patch(`${URL}/users/${id}`,nuevosCampos)