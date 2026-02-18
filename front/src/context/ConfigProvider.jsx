import { useContext, useState } from "react";
import { CrearConfigRequest, GetConfigRequest, GetConfigsRequest, UpdateConfigRequest } from "../model/Config.api.js";
import { ConfigContext } from "./ConfigContext.jsx";

export const useConfigs = () => {
  const contexto = useContext(ConfigContext);
  if (!contexto) throw new Error('useConfig debe ser usado dentro del provider')
  return contexto
}

export const ConfigContextProvider = ({ children }) => {
  const [config, setConfigs] = useState([]);

  async function crearConfig(values) {
    try {
      await CrearConfigRequest(values)
    } catch (error) {
      console.error(error)
    }
  }

  async function obtenerConfigs() {
    try {
      const response = await GetConfigsRequest()
      setConfigs(response.data)
      return response.data
    } catch (error) {
      console.error(error)
    }
  }

  async function obtenerConfig(id) {
    try {
      const response = await GetConfigRequest(id)
      return response.data
    } catch (error) {
      console.error(error)
    }
  }

  async function actualizarConfig(id, nuevosCampos) {
    try {
      const response = await UpdateConfigRequest(id, nuevosCampos)
      return response.data
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <ConfigContext.Provider value={{ config, crearConfig, obtenerConfigs, obtenerConfig, actualizarConfig }}>
      {children}
    </ConfigContext.Provider>
  )
}