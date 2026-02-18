import { useCases } from '../context/CasesProvider.jsx';
import { useState } from 'react';

const useCaseController = () => {
  const { crearCases, obtenerCase, obtenerCaseWorkTable, obtenerCasesAll, obtenerCasesPen, obtenerCasesPro, obtenerCasesRes, obtenerCasesFecha, obtenerCasesPenFecha, deleteCase, actualizarCase, actualizarProCase, actualizarPenCase, actualizarResCase } = useCases();

  const [casesPen, setCasesPen] = useState([]);
  const [casesPro, setCasesPro] = useState([]);
  const [casesRes, setCasesRes] = useState([]);
  const [casesMesa, setCaseMesa] = useState([]);

  const sendCase = ({
    admission,
    areaSalida,
    patient_name,
    patient_id,
    EPS,
    description,
    createdAt,
    user_create,
    resolvedAt,
    user_resolved,
    comentario,
    estado,
    fechaEstado,
    mesa,
    numFactura,
    responsable,
    valor,
    documento
  }) => {
    if (user_create && mesa > 0) {
      const formData = new FormData();
      formData.append('admission', admission);
      formData.append('areaSalida', areaSalida);
      formData.append('patient_name', patient_name);
      formData.append('patient_id', patient_id);
      formData.append('EPS', EPS);
      formData.append('description', description);
      formData.append('createdAt', createdAt);
      formData.append('user_create', user_create);
      formData.append('resolvedAt', resolvedAt);
      formData.append('user_resolved', user_resolved);
      formData.append('comentario', comentario);
      formData.append('estado', estado);
      formData.append('fechaEstado', fechaEstado);
      formData.append('mesa', mesa);
      formData.append('numFactura', numFactura);
      formData.append('responsable', responsable);
      formData.append('valor', valor);
      formData.append('imgUp', documento);

      crearCases(formData);
      return formData;
    }

    return null;
  };

  const getCase = async (id) => {
    try {
      const caso = await obtenerCase(id);

      // Si 'a' es verdadero, vuelve a llamar a la función
      if (caso) {
        return caso
      } else {
        console.error("no hay caso")
        return false
      }
    } catch (error) {
      console.error('Error al obtener la caso:', error);
    }
  }

  async function getCasesMesa(mesa) {
    try {
      const caso = await obtenerCaseWorkTable(mesa);

      if (caso) {
        setCaseMesa(caso)
        return caso
      } else {
        console.error("no hay casos en la mesa" + mesa)
        return false
      }
    } catch (error) {
      console.error('Error al obtener los casos en la mesa ' + mesa + ':', error);
    }
  }

  async function getCasesAll() {
    try {
      const cases = await obtenerCasesAll();
      if (cases && cases.length > 0) {
        return cases
      }
      return false
    } catch (error) {
      console.error('Error al obtener los casos pendientes:', error);
    }
  }

  const getCasesPen = async (mesa) => {
    try {
      console.log("getCasesPen")
      casesMesa.length == 0 && getCasesMesa(mesa);
      const cases = await obtenerCasesPen(mesa);

      if (cases && cases.length > 0) {
        setCasesPen(cases)
      }
      return cases
    } catch (error) {
      console.error('Error al obtener los casos pendientes:', error);
    }
  }

  const getCasesPro = async (mesa) => {
    try {
      const cases = await obtenerCasesPro(mesa);

      if (cases && cases.length > 0) {
        setCasesPro(cases)
      }
      return cases
    } catch (error) {
      console.error('Error al obtener los casos en proceso:', error);
    }
  }

  const getCasesRes = async (mesa) => {
    try {
      const cases = await obtenerCasesRes(mesa);

      if (cases && cases.length > 0) {
        setCasesRes(cases)
      }
      return cases
    } catch (error) {
      console.error('Error al obtener los casos resueltos:', error);
    }
  }

  const getCasesFecha = async (id, startDate, endDate) => {
    try {
      const fechas = {
        mesa: id,
        FechaIn: startDate,
        FechaOut: endDate
      }
      const chat = await obtenerCasesFecha(fechas);
      return chat
    } catch (error) {
      console.error('Error al obtener los chat con fecha:', error);
    }
  }

  const getCasesPenFecha = async (id, startDate, endDate) => {
    try {
      const fechas = {
        mesa: id,
        FechaIn: startDate,
        FechaOut: endDate
      }
      const chat = await obtenerCasesPenFecha(fechas);
      return chat
    } catch (error) {
      console.error('Error al obtener los chat con fecha:', error);
    }
  }

  const uptPenCase = (cas) => {
    console.log("uptPenCase", cas)
    getCasesMesa(cas.mesa)
    setTimeout(() => {
      const caso = casesMesa.filter(cse => cse.id === cas.id);

      console.log(caso)

      const formData = new FormData();

      formData.append('id', cas.id);
      formData.append('comentario', cas.comentario || caso[0].comentario);
      formData.append('estado', cas.estado);
      formData.append('fechaEstado', cas.fechaEstado);
      formData.append('user_pend', cas.user_pend);
      formData.append('imgUp', cas.documento);

      actualizarPenCase(caso[0].id, formData);
    }, 300);
  }

  const uptProCase = (cas) => {
    console.log("uptProCase", cas)
    getCasesMesa(cas?.mesa)
    setTimeout(() => {
      const caso = casesMesa.filter(cse => cse.id === cas.id);

      const formData = new FormData();

      formData.append('id', cas.id);
      formData.append('comentario', cas.comentario || caso[0].comentario);
      formData.append('estado', cas.estado);
      formData.append('processAt', cas.processAt);
      formData.append('user_process', cas.user_process);
      formData.append('imgUp', cas.documento);

      actualizarProCase(caso[0].id, formData);
    }, 300);
  }

  const uptResCase = (cas) => {
    setTimeout(() => {
      const caso = casesMesa.filter(cse => cse.id === cas.id);

      const formData = new FormData();

      formData.append('id', cas.id);
      formData.append('comentario', cas.comentario || caso[0].comentario);
      formData.append('estado', cas.estado);
      formData.append('resolvedAt', cas.resolvedAt);
      formData.append('user_resolved', cas.user_resolved);
      formData.append('imgUp', cas.documento);

      actualizarResCase(caso[0].id, formData);
    }, 300);
  }

  const uptCase = (cas) => {
    setTimeout(() => {
      const caso = casesMesa.filter(cse => cse.id === cas.id);

      const formData = new FormData();

      formData.append('id', cas.id);
      formData.append('comentario', cas.comentario || caso[0].comentario);
      formData.append('estado', cas.estado);
      formData.append('fechaEstado', cas.fechaEstado);
      formData.append('resolvedAt', cas.resolvedAt);
      formData.append('user_resolved', cas.user_resolved);
      formData.append('imgUp', cas.documento);

      actualizarCase(caso[0].id, formData);
    }, 300);
  }

  const delCase = (id) => {
    try {
      if (id) {
        deleteCase(id)
      } else {
        console.error("no existe ese el caso")
      }
    } catch (error) {
      console.error('Error al obtener el caso:', error);
    }
  }

  // Retorna las funciones disponibles
  return {
    casesMesa,
    sendCase,
    getCase,
    getCasesAll,
    getCasesMesa,
    getCasesPen,
    getCasesPro,
    getCasesRes,
    getCasesFecha,
    getCasesPenFecha,
    uptCase,
    uptProCase,
    uptPenCase,
    uptResCase,
    delCase
  };
};

export default useCaseController;