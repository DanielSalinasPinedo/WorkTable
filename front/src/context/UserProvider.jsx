import { useContext, useState } from "react";
import { CrearUsuarioRequest, DeleteUsuarioRequest, GetUsuariosRequest, GetUsuarioRequest, UpdateUsuarioRequest } from "../model/User.api.js";
import { UserContext } from "./UserContext.jsx";
import { LoginRequest } from "../model/auth.js";


export const useUsuarios = () => {
    const contexto = useContext(UserContext);
    if (!contexto) throw new Error('useUsuarios debe ser usado dentro del provider')
    return contexto
}

export const UsuarioContextProvider = ({ children }) => {
    const [usuarios, setUsuarios] = useState([])

    const getUsuarios = async () => {
        try {
            const response = await GetUsuariosRequest()
            setUsuarios(response.data)
            return response.data
        } catch (error) {
            console.error(error)
        }
    }

    const delUsuario = async (id) => {
        try {
            const response = await DeleteUsuarioRequest(id)
            setUsuarios(usuarios.filter(usuario => usuario.codigo !== id))
        } catch (error) {
            if (error.response.status == '500') {
                return "No se pudo eliminar al usuario, ya que tiene mensajes"
            }
        }
    }

    const createUser = async (values) => {
        try {
            await CrearUsuarioRequest(values);
        } catch (error) {
            if (error.response.status == '409') {
                return "El usuario ya se encuentra registrado"
            }
        }
    }

    const getUsuario = async (id) => {
        try {
            const response = await GetUsuarioRequest(id)
            return response.data
        } catch (error) {
            console.error(error)
        }
    }

    const actualizarUsuario = async (id, nuevosCampos) => {
        try {
            const response = await UpdateUsuarioRequest(id, nuevosCampos)
            return response.data
        } catch (error) {
            console.error(error)
        }
    }

    const login = async (values) => {
        try {
            setTimeout(() => {
                console.log("")
            }, 100);
            const response = (await LoginRequest(values)).data
            if (response.exists) {
                const usuarioFiltrado = await GetUsuarioRequest(values.id_usuario)
                console.log(usuarioFiltrado)

                if (usuarioFiltrado?.data?.id_usuario) {//hay cuenta, logear.
                    return usuarioFiltrado?.data
                }
                else {//no hay cuenta, por favor ingrese los datos correctamente
                    return false
                }
            }
        } catch (error) {
            console.log(error)
            if (error.response.status == '401') {
                if (values.nombre.trim()) {
                    createUser(values) //Si el usuario no existe, es creado y logeado
                    localStorage.setItem('userData', JSON.stringify(values));
                    return 'null'
                }
            }
        }
    }

    return (
        <UserContext.Provider value={{ usuarios, setUsuarios, getUsuarios, delUsuario, createUser, getUsuario, actualizarUsuario, login }}>
            {children}
        </UserContext.Provider>
    )
}