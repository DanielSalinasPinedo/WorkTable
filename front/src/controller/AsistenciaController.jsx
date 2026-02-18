import { useAsistencia } from '../context/AsistenciaProvider.jsx';
import { useState, useCallback } from 'react';

const useAsistenciaController = () => {
  const { crearAsistencia, obtenerAsistencias, obtenerAsistencia, obtenerAsistenciasCaso, actualizarAsistencia, eliminarAsistencia } = useAsistencia();
  const [asistencias, setAsistencia] = useState([]);

  // Función para enviar una asistencia
  const sendAsistencia = useCallback((values) => {
    if (values) {
      crearAsistencia(values);
      return values;
    }
    return null;
  }, [crearAsistencia]);

  // Función para obtener todas las asistencias
  const getAsistencias = useCallback(async () => {
    try {
      const asis = await obtenerAsistencias();
      if (asis?.length > 0) {
        setAsistencia(asis);
      }
      return asis;
    } catch (error) {
      console.error('Error al obtener las asistencias:', error);
      return null;
    }
  }, [obtenerAsistencias]);

  // Función para obtener una asistencia específica por cédula e ID
  const getAsistencia = useCallback(async (cedula, id) => {
    try {
      const asistencia = await obtenerAsistencia(cedula, id);
      return asistencia || false;
    } catch (error) {
      console.error('Error al obtener la asistencia:', error);
      return false;
    }
  }, [obtenerAsistencia]);

  // Función para obtener asistencias por caso
  const getAsistenciasCaso = useCallback(async (caso) => {
    try {
      const asistencias = await obtenerAsistenciasCaso(caso);
      return asistencias || false;
    } catch (error) {
      console.error('Error al obtener las asistencias del caso:', error);
      return false;
    }
  }, [obtenerAsistenciasCaso]);

  // Función para actualizar una asistencia
  const uptAsistencia = useCallback(async (id, asis) => {
    try {
      const updatedAsistencia = asistencias
        .filter(as => as.id === id)
        .map(as => ({
          ...as,
          caso: asis.caso,
          cedula: asis.cedula,
          comentario: asis.comentario,
        }));

      if (updatedAsistencia.length > 0) {
        const info = await actualizarAsistencia(id, updatedAsistencia[0]);
        return info || null;
      }
      return null;
    } catch (error) {
      console.error('Error al actualizar la asistencia:', error);
      return null;
    }
  }, [asistencias, actualizarAsistencia]);

  // Función para eliminar una asistencia
  const delAsistencia = useCallback(async (id) => {
    try {
      if (id) {
        await eliminarAsistencia(id);
      } else {
        console.log("No existe la asistencia con el id:", id);
      }
    } catch (error) {
      console.error('Error al eliminar la asistencia:', error);
    }
  }, [eliminarAsistencia]);

  // Retorna las funciones disponibles
  return {
    sendAsistencia,
    getAsistencias,
    getAsistenciasCaso,
    getAsistencia,
    uptAsistencia,
    delAsistencia,
  };
};

export default useAsistenciaController;