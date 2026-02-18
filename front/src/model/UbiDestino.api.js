import axios from "axios";

const URL = "https://localhost:3030"

export const CrearUbiDestinoRequest = async (ubiActual) => await axios.post(`${URL}/ubiDestino`, ubiActual)
export const GetUbisDestinoRequest = async () => await axios.get(`${URL}/ubisDestino`)
export const GetUbiDestinoRequest = async (id) => await axios.get(`${URL}/ubiDestino/${id}`)
export const UpdateUbiDestinoRequest = async (id, nuevosCampos) => await axios.patch(`${URL}/ubiDestino/${id}`, nuevosCampos)
export const DeleteUbiDestinoRequest = async (id) => await axios.delete(`${URL}/ubiDestino/${id}`)