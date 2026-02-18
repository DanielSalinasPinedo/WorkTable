// chatController.jsx
import { useUsuarios } from '../context/UserProvider.jsx'
import { useNavigate } from 'react-router-dom';
import useUsuariosController from './userController.jsx';
import useMesaController from './MesaController.jsx';

const useLoginController = () => {
  const { login, getUsuarios } = useUsuarios();
  const navigate = useNavigate();
  const { getUser } = useUsuariosController();
  const { getMesa } = useMesaController();

  const loginRecursivo = async(values) => {
    // Convertir los valores a mayúsculas
    const valuesUpperCase = {
      ...values,
      id_usuario: values.id_usuario,
      nombre: values.nombre.toUpperCase()
    };

    try {
      var a = await login(valuesUpperCase);
      console.log(a)
      const mesa = await getMesa(values.mesa)

      if(mesa === false){
        return 'No existe esa mesa'
      }

      if(mesa.estado === false){
        sessionStorage.removeItem('userData')
        return false
      }

      await getUsuarios()

      // Si 'a' es verdadero, vuelve a llamar a la función
      if(a==='null'){
        loginRecursivo(valuesUpperCase)
      }
      else if (!a) {//Cuenta con id ${valuesUpperCase.id_usuario} ya creada
        return "Error al iniciar sesion, revises sus datos"
      }
      else {//Login exitoso
        const temp = {
          ...a,
          mesa: values.mesa,
          accion: values.accion
        }
        sessionStorage.setItem('userData', JSON.stringify(temp));
        navigate('/casos')
      }
    } catch (error) {
      console.error('Error al realizar el login:', error);
    }
  };

  const validaciones = (values) => {
    const errors = {};
    if (!values.id_usuario) {
      errors.id_usuario = 'La cédula es requerida';
    } else if (!/^\d+$/.test(values.id_usuario)) {
      errors.id_usuario = 'La cédula debe ser solo números';
    }

    if(!values.mesa){
      errors.mesa = 'La mesa es requerida';
    } else if (!/^\d+$/.test(values.mesa)) {
      errors.id_usuario = 'La mesa debe ser solo numeros';
    }

    if(!values.accion){
      errors.accion = 'La accion es requerida';
    }

    return errors;
  }

  // Retorna las funciones disponibles
  return {
    loginRecursivo,
    validaciones
  };
};

export default useLoginController;
