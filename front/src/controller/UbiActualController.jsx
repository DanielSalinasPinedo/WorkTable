import Swal from 'sweetalert2';
import { useUbiActual } from '../context/UbiActualProvider.jsx';
import { useState } from 'react';

const useUbiActualController = () => {
  const { crearUbiActual, obtenerUbisActual, obtenerUbiActual, actualizarUbiActual, eliminarUbiActual } = useUbiActual();
  const [ubiActual, setUbiActual] = useState([]);

  function sendUbiActual(ubi) {
    try {
      if (ubi.Nombre.trim()) {
        crearUbiActual(ubi)
      }
      else {
        Swal.fire('Error al crear la Ubicacion Actual', 'El nombre de la ubicacion esta vacio', 'error')
      }
    } catch (error) {
      console.error(error)
    }
  };

  async function getUbisActual() {
    try {
      const ubi = await obtenerUbisActual();

      // Si 'a' es verdadero, vuelve a llamar a la función
      if (ubi) {
        setUbiActual(ubi)
        return ubi
      } else {
        console.warn("no hay UbiActual")
      }
    } catch (error) {
      console.error('Error al obtener los UbiActual:', error);
    }
  }

  async function getUbiActual(id) {
    try {
      const conf = await obtenerUbiActual(id);
      return conf
    } catch (error) {
      console.error('Error al obtener los UbiActual con el id del mensaje:', error);
    }
  }

  function uptUbiActual(id, ubiA) {
    if (ubiA.Nombre.trim()) {
      actualizarUbiActual(id, ubiA)
    }
    else {
      Swal.fire('Error al actualizar la Ubicacion', 'El nombre de la ubicacion esta vacio', 'error')
    }
  }

  async function delUbiActual(id) {
    if (id) {
      const validar = await eliminarUbiActual(id)
      return validar
    }
    else {
      Swal.fire('Error al eliminar la Ubicacion', 'El id de la ubicacion esta vacio', 'error')
    }
    return false
  }

  return {
    ubiActual,
    sendUbiActual,
    getUbisActual,
    getUbiActual,
    uptUbiActual,
    delUbiActual
  };
}

export default useUbiActualController;