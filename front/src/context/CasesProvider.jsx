import { useContext, useState } from "react";
import { CrearCaseRequest, GetCasesPenRequest, GetCasesProRequest, GetCasesResRequest, GetCasesFechaRequest, DeleteCaseRequest, UpdateCaseRequest, GetCaseRequest, GetCasesAllRequest, GetCasesMesaRequest, UpdateProCaseRequest, UpdatePenCaseRequest, UpdateResCaseRequest, GetCasesPenFechaRequest} from "../model/patient_cases.api.js";
import {CasesContext} from "./CasesContext.jsx";

export const useCases=()=>{
    const contexto=useContext(CasesContext);
    if(!contexto) throw new Error('useCases debe ser usado dentro del provider')
    return contexto
}

export const CasesContextProvider = ({children})=>{
    const [casesPen, setCasesPen] = useState([]);
    const [casesPro, setCasesPro] = useState([]);
    const [casesRes, setCasesRes] = useState([]);

    const obtenerCase = async(id)=>{
        try {
            const response = await GetCaseRequest(id)
            return response.data
        } catch (error) {
            console.error(error)
        }
    }

    const obtenerCaseWorkTable = async(mesa)=>{
        try {
            const response = await GetCasesMesaRequest(mesa)
            return response.data
        } catch (error) {
            console.error(error)
        }
    }

    const obtenerCasesAll = async()=>{
        try {
          const response = await GetCasesAllRequest()
          return response.data
        } catch (error) {
          console.error(error)
        }
    }

    const obtenerCasesPen = async(mesa)=>{
        try {
          const response = await GetCasesPenRequest(mesa)
          setCasesPen(response.data)
          return response.data
        } catch (error) {
          console.error(error)
        }
    }

    const obtenerCasesPro = async(mesa)=>{
        try {
          const response = await GetCasesProRequest(mesa)
          setCasesPro(response.data)
          return response.data
        } catch (error) {
          console.error(error)
        }
    }

    const obtenerCasesRes = async(mesa)=>{
        try {
          const response = await GetCasesResRequest(mesa)
          setCasesRes(response.data)
          return response.data
        } catch (error) {
          console.error(error)
        }
    }

    const obtenerCasesFecha = async(mesa)=>{
        try {
            console.log(mesa)
          const response = await GetCasesFechaRequest(mesa)
          return response.data
        } catch (error) {
          console.error(error)
        }
    }

    const obtenerCasesPenFecha = async(mesa)=>{
        try {
            console.log(mesa)
          const response = await GetCasesPenFechaRequest(mesa)
          return response.data
        } catch (error) {
          console.error(error)
        }
    }

    const crearCases = async(values)=>{
        try {
            await CrearCaseRequest(values);
        } catch (error) {
            console.error(error)
        }
    }

    const deleteCase = async(id)=>{
        try {
            await DeleteCaseRequest(id)
        } catch (error) {
            console.error(error)
        }
    }

    const actualizarCase = async(id, updatedCases)=>{
        try {
            await UpdateCaseRequest(id, updatedCases)
        } catch (error) {
            console.error(error)
        }
    }

    const actualizarProCase = async(id, updatedCases)=>{
        try {
            await UpdateProCaseRequest(id, updatedCases)
        } catch (error) {
            console.error(error)
        }
    }

    const actualizarPenCase = async(id, updatedCases)=>{
        try {
            await UpdatePenCaseRequest(id, updatedCases)
        } catch (error) {
            console.error(error)
        }
    }

    const actualizarResCase = async(id, updatedCases)=>{
        try {
            await UpdateResCaseRequest(id, updatedCases)
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <CasesContext.Provider value={{ casesPen, casesRes, casesPro, obtenerCase, obtenerCasesAll, obtenerCaseWorkTable, obtenerCasesPen, obtenerCasesPro, obtenerCasesRes, obtenerCasesFecha, obtenerCasesPenFecha, crearCases, deleteCase, actualizarCase, actualizarProCase, actualizarPenCase, actualizarResCase }}>
            {children}
        </CasesContext.Provider>
    )
}