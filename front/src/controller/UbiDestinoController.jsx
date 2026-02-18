import Swal from 'sweetalert2';
import { useState } from 'react';
import { useUbiDestino } from '../context/UbiDestinoProvider.jsx';

const useUbiDestinoController = () => {
  const { crearUbiDestino, obtenerUbisDestino, obtenerUbiDestino, actualizarUbiDestino, eliminarUbiDestino } = useUbiDestino();
  const [ubiDestino, setUbiDestino] = useState([]);

  function sendUbiDestino(ubi) {
    try {
      if (ubi.Nombre.trim()) {
        crearUbiDestino(ubi)
      }
      else {
        Swal.fire('Error al crear la Ubicacion de Destino', 'El nombre de la ubicacion esta vacio', 'error')
      }
    } catch (error) {
      console.error(error)
    }
  };

  async function getUbisDestino() {
    try {
      const ubi = await obtenerUbisDestino();

      // Si 'a' es verdadero, vuelve a llamar a la función
      if (ubi) {
        setUbiDestino(ubi)
        return ubi
      } else {
        console.warn("no hay UbiDestino")
      }
    } catch (error) {
      console.error('Error al obtener los UbiDestino:', error);
    }
  }

  async function getUbiDestino(id) {
    try {
      const conf = await obtenerUbiDestino(id);
      return conf
    } catch (error) {
      console.error('Error al obtener los UbiDestino con el id del mensaje:', error);
    }
  }

  function uptUbiDestino(id, ubiA) {
    if (ubiA.Nombre.trim()) {
      actualizarUbiDestino(id, ubiA)
    }
    else {
      Swal.fire('Error al actualizar la Ubicacion', 'El nombre de la ubicacion esta vacio', 'error')
    }
  }

  async function delUbiDestino(id) {
    if (id) {
      const validar = await eliminarUbiDestino(id)
      return validar
    }
    else {
      Swal.fire('Error al eliminar la Ubicacion', 'El id de la ubicacion esta vacio', 'error')
    }
    return false
  }

  return {
    ubiDestino,
    sendUbiDestino,
    getUbisDestino,
    getUbiDestino,
    uptUbiDestino,
    delUbiDestino
  };
}

export default useUbiDestinoController;