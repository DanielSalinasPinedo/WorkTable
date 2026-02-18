import { useConfigs } from '../context/ConfigProvider.jsx';
import { useState } from 'react';

const useStateController = () => {
  const { crearConfig, obtenerConfigs, obtenerConfig, actualizarConfig } = useConfigs();
  const [configs, setConfigs] = useState([]);

  function sendConfig(conf) {
    try {
      if (conf.nombre.trim()) {
        crearConfig(conf)
        return conf
      }

      return null
    } catch (error) {
      console.error(error)
    }
  };

  async function getConfigs() {
    try {
      const conf = await obtenerConfigs();

      // Si 'a' es verdadero, vuelve a llamar a la función
      if (conf) {
        setConfigs(conf)
        return conf
      } else {
        console.warn("no hay Configs")
      }
    } catch (error) {
      console.error('Error al obtener los Config:', error);
    }
  }

  async function getConfig(id) {
    try {
      const conf = await obtenerConfig(id);
      return conf
    } catch (error) {
      console.error('Error al obtener los Config con el id del mensaje:', error);
    }
  }

  function uptConfig(id, conf) {
    const updatedConfig = configs.filter(cnf =>
      cnf.id === id
    ).map(cnf => ({
      ...cnf,
      estado: conf.estado
    }));
    actualizarConfig(id, updatedConfig[0])
  }

  return {
    configs,
    sendConfig,
    getConfigs,
    getConfig,
    uptConfig
  };
}

export default useStateController;