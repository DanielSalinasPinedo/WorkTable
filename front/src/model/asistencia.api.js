import axios from "axios";

const URL = "https://10.20.2.170:3030"

export const CrearAsistenciaRequest = async (asistencia) => await axios.post(`${URL}/asistencia`, asistencia)
export const GetAsistenciasRequest = async () => await axios.get(`${URL}/asistencias`)
export const GetAsistenciasCasoRequest = async (caso) => await axios.get(`${URL}/asistencias/caso/${caso}`)
export const GetAsistenciaRequest = async (id, caso) => await axios.get(`${URL}/asistencia/${id}`,
    {
        params: {
            caso
        }
    }
)
export const UpdateAsistenciaRequest = async (id, nuevosCampos) => await axios.patch(`${URL}/asistencia/${id}`, nuevosCampos)
export const DeleteAsistenciaRequest = async (id) => await axios.delete(`${URL}/asistencia/${id}`)