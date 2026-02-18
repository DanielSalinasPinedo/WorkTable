import { useMesas } from '../context/MesasProvider.jsx';
import { useState } from 'react';

const useMesaController = () => {
  const { crearMesa, obtenerMesas, obtenerMesa, actualizarMesa, deleteMesa } = useMesas();

  const [mesas, setMesas] = useState([]);

  const sendMesa = (values) => {
    if (values) {
      const valores = {
        ...values,
        nombre: values.nombre,
        owner: String(values.owner),
        patientEnable: values.patientEnable
      }
      console.log(valores)
      crearMesa(valores);
      return valores;
    }

    return null;
  };

  const getMesas = async () => {
    try {
      const mesas = await obtenerMesas();

      if (mesas && mesas.length > 0) {
        setMesas(mesas)
      }
      return mesas
    } catch (error) {
      console.error('Error al obtener las mesas:', error);
    }
  }

  const getMesa = async (id) => {
    try {
      const mesa = await obtenerMesa(id);

      // Si 'a' es verdadero, vuelve a llamar a la función
      if (mesa) {
        return mesa
      } else {
        console.log("no hay mesa")
        return false
      }
    } catch (error) {
      console.error('Error al obtener la mesa:', error);
    }
  }

  const uptMesa = async (id, mesa) => {
    try {
      const updatedMesa = mesas.filter(ms =>
        ms.id === id
      ).map(ms => ({
        ...ms,
        nombre: mesa.nombre,
        patientEnable: mesa.patientEnable,
        estado: mesa.estado,
        asistencia: mesa.asistencia,
        adjunto: mesa.adjunto,
        adjuntoRes: mesa.adjuntoRes
      }));

      const info = await actualizarMesa(id, updatedMesa[0])

      if (info) {
        return info
      }

    } catch (error) {

    }
  }

  const delMesa = async (id) => {
    try {
      if (id) {
        const info = await deleteMesa(id)

        if (info) {
          return info
        }
      } else {
        console.log("no existe esa mesa")
      }
    } catch (error) {
      console.error('Error en la mesa:', error);
    }
  }

  // Retorna las funciones disponibles
  return {
    sendMesa,
    getMesas,
    getMesa,
    uptMesa,
    delMesa
  };
};

export default useMesaController;