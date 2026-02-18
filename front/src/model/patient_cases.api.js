import axios from "axios";

const URL = "https://10.20.2.170:3030"

export const CrearCaseRequest=async(cases)=>await axios.post(`${URL}/case`, cases)
export const GetCaseRequest=async(id)=>await axios.get(`${URL}/case/${id}`)
export const GetCasesAllRequest=async()=>await axios.get(`${URL}/casesAll`)
export const GetCasesPenRequest=async(mesa)=>await axios.get(`${URL}/cases/${mesa}`)
export const GetCasesMesaRequest=async(mesa)=>await axios.get(`${URL}/cases/worktable/${mesa}`)
export const GetCasesProRequest=async(mesa)=>await axios.get(`${URL}/cases/process/${mesa}`)
export const GetCasesResRequest=async(mesa)=>await axios.get(`${URL}/cases/resolved/${mesa}`)
export const GetCasesPenFechaRequest = async(fechas) => await axios.post(`${URL}/casesPen/fecha`, fechas)
export const GetCasesFechaRequest = async(fechas) => await axios.post(`${URL}/cases/fecha`, fechas)
export const DeleteCaseRequest=async(id)=>await axios.delete(`${URL}/case/${id}`)
export const UpdateCaseRequest=async(id, nuevosCampos) => await axios.patch(`${URL}/case/${id}/resolve`,nuevosCampos)
export const UpdatePenCaseRequest=async(id, nuevosCampos) => await axios.patch(`${URL}/case/${id}/pend`,nuevosCampos)
export const UpdateProCaseRequest=async(id, nuevosCampos) => await axios.patch(`${URL}/case/${id}/process`,nuevosCampos)
export const UpdateResCaseRequest=async(id, nuevosCampos) => await axios.patch(`${URL}/case/${id}/res`,nuevosCampos)