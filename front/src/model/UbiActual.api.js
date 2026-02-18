import axios from "axios";

const URL = "https://localhost:3030"

export const CrearUbiActualRequest = async (ubiActual) => await axios.post(`${URL}/ubiActual`, ubiActual)
export const GetUbisActualRequest = async () => await axios.get(`${URL}/ubisActual`)
export const GetUbiActualRequest = async (id) => await axios.get(`${URL}/ubiActual/${id}`)
export const UpdateUbiActualRequest = async (id, nuevosCampos) => await axios.patch(`${URL}/ubiActual/${id}`, nuevosCampos)
export const DeleteUbiActualRequest = async (id) => await axios.delete(`${URL}/ubiActual/${id}`)