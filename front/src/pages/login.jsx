import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useFormik } from 'formik';
import 'bootstrap/dist/css/bootstrap.min.css';
import useLoginController from '../controller/loginController.jsx';
import useUsuariosController from '../controller/userController.jsx';
import Swal from 'sweetalert2';
import FloatingMesaWindow from '../component/FloatingWindows.jsx';
import useConfigController from '../controller/configController.jsx';

const LoginForm = () => {
  const { loginRecursivo, validaciones } = useLoginController();
  const { configs, getConfigs } = useConfigController();
  const [error, setError] = useState(null);

  // Obtener usuarios al montar el componente
  useEffect(() => {
    if (configs.length <= 0) {
      getConfigs()
    }
  }, [configs, getConfigs]);

  // Verificar si hay datos de usuario en sessionStorage
  useEffect(() => {
    const storedUserData = sessionStorage.getItem('userData');
    if (storedUserData) {
      const userData = JSON.parse(storedUserData);
      login(userData);
    }
  }, []); // Solo se ejecuta una vez al montar el componente

  // Función para manejar el login
  const login = useCallback(async (user) => {
    const aux = {
      ...user,
      accion: (user.mesa == 29) ? "RESOLVER" : user.accion
    }
    const errors = await loginRecursivo(aux);
    if (errors === false) {
      Swal.fire({
        title: 'ERROR',
        text: 'LA MESA ESTA CERRADA',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
    } else if (errors) {
      console.error(errors);
      setError(errors);
    }
  }, [loginRecursivo]);

  // Configuración de Formik
  const formik = useFormik({
    initialValues: {
      nombre: '',
      id_usuario: '',
      mesa: '',
      accion: '',
      role: 'MESA',
    },
    onSubmit: (values) => {
      login(values);
    },
    validate: (values) => validaciones(values),
  });

  // Función para mostrar el modal de contraseña
  const mostrarModalPassword = useCallback(() => {
    const contrasenaCorrecta = process.env.REACT_APP_CLAVE_CORRECTA;

    Swal.fire({
      title: 'Ingrese la contraseña',
      input: 'password',
      inputPlaceholder: 'Ingrese su contraseña',
      confirmButtonText: 'Confirmar',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      preConfirm: (password) => {
        if (!password) {
          Swal.showValidationMessage('La contraseña no puede estar vacía');
        }
        return password;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        validarContrasena(result.value, contrasenaCorrecta);
      }
    });
  }, []);

  // Función para validar la contraseña
  const validarContrasena = useCallback((passwordIngresada, contrasenaCorrecta) => {
    if (passwordIngresada === contrasenaCorrecta) {
      mostrarOpcionesRedireccion();
    } else {
      Swal.fire({
        title: 'ERROR',
        text: 'Contraseña incorrecta',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
    }
  }, []);

  // Función para mostrar opciones de redirección
  const mostrarOpcionesRedireccion = useCallback(() => {
    Swal.fire({
      title: '¿A dónde desea ir?',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Mesa',
      cancelButtonText: 'Usuario',
      denyButtonText: 'Carros',
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        window.open('https://10.20.2.170:3010/sa/mesas', '_blank');
      } else if (result.isDismissed) {
        window.open('https://10.20.2.170:3020/sa/users', '_blank');
      } else if (result.isDenied) {
        window.open('https://10.20.2.170:3040/sa/carros', '_blank');
      }
    });
  }, []);

  // Renderizado del formulario
  return (
    <>
      <div className="container mt-5">
        <form onSubmit={formik.handleSubmit} className="bg-light p-4 border rounded">
          {configs[3]?.estado && (
            <div className="mb-3">
              <label htmlFor="nombre" className="form-label">Nombre</label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                className="form-control"
                onChange={formik.handleChange}
                value={formik.values.nombre}
              />
              {formik.errors.nombre ? <div className="text-danger">{formik.errors.nombre}</div> : null}
            </div>
          )}
          {['id_usuario', 'mesa'].map((field) => (
            <div className="mb-3" key={field}>
              <label htmlFor={field} className="form-label">
                {field === 'id_usuario' ? 'Cédula' : field === 'mesa' ? 'Mesa' : 'Nombre'}
              </label>
              <input
                id={field}
                name={field}
                type={field === 'mesa' ? 'number' : 'text'}
                className="form-control"
                onChange={formik.handleChange}
                value={formik.values[field]}
              />
              {formik.errors[field] && <div className="text-danger">{formik.errors[field]}</div>}
            </div>
          ))}
          <div className="mb-3">
            <label htmlFor="accion" className="form-label">Acciones</label>
            <select
              id="accion"
              name="accion"
              className="form-select"
              onChange={formik.handleChange}
              value={formik.values.accion}
            >
              <option value="" disabled hidden>Seleccione una opción</option>
              <option value="RESOLVER">Resolver</option>
              <option value="ASIGNAR">Asignar</option>
            </select>
            {formik.errors.accion && <div className="text-danger">{formik.errors.accion}</div>}
            <div className="text-danger text-center mt-3 fs-5">
              Si es la primera vez, ingrese sus datos completos. Si ya tiene cuenta, ingrese solo la cédula, número de la mesa y actividad a realizar.
            </div>
            {error && <div className="text-danger">{error}</div>}
          </div>
          <button type="submit" className="btn btn-primary">Login</button>
        </form>
      </div>
      <div className='d-flex flex-row-reverse' style={{ marginRight: "305px" }}>
        <footer className='p-2'>
          <a style={{ cursor: "pointer", textDecoration: 'none', color: '#000' }} href='https://10.20.2.170:3010/lider/auditoria' target="_blank" rel="noopener noreferrer">Auditoria</a>&nbsp;&nbsp;
          <a style={{ cursor: "pointer" }} onClick={mostrarModalPassword} className='admin'>Admin</a>
        </footer>
      </div>
      <FloatingMesaWindow />
    </>
  );
};

export default LoginForm;