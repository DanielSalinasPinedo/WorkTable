import React, { useEffect, useState, useCallback } from 'react';
import { useFormik } from 'formik';
import 'bootstrap/dist/css/bootstrap.min.css';
import useLoginController from '../controller/loginController.jsx';
import useUsuariosController from '../controller/userController.jsx';
import Swal from 'sweetalert2';

const LoginForm = () => {
  const { loginRecursivo, validaciones } = useLoginController();
  const { users, getUsers } = useUsuariosController();
  const [error, setError] = useState(null);

  // Obtener usuarios al montar el componente
  useEffect(() => {
    if (users.length === 0) {
      getUsers();
    }
  }, [users, getUsers]);

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
    const errors = await loginRecursivo(user);
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
      mesa: 51,
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

  return (
    <>
      <div className="container mt-5">
        <form onSubmit={formik.handleSubmit} className="bg-light p-4 border rounded">
          <div className="mb-3">
            <label htmlFor="id_usuario" className="form-label">Cédula</label>
            <input
              id="id_usuario"
              name="id_usuario"
              type="text"
              className="form-control"
              onChange={formik.handleChange}
              value={formik.values.id_usuario}
            />
            {formik.errors.id_usuario && <div className="text-danger">{formik.errors.id_usuario}</div>}
          </div>
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
              <option value="RESOLVER">Aux Clinico</option>
              <option value="ASIGNAR">Asignar</option>
            </select>
            {formik.errors.accion && <div className="text-danger">{formik.errors.accion}</div>}
            <div className="text-danger text-center mt-3 fs-5">
              Solo debe ingresar su cédula y la acción a realizar si está registrado en control GS. En caso contrario, regístrese en control GS.
            </div>
            {error && <div className="text-danger">{error}</div>}
          </div>
          <button type="submit" className="btn btn-primary">Login</button>
        </form>
      </div>
      <div className='d-flex flex-row-reverse' style={{ marginRight: "305px" }}>
        <footer className='p-2'>
          <a style={{ cursor: "pointer" }} onClick={() => mostrarModalPassword()} className='admin'>Admin</a>
        </footer>
      </div>
    </>
  );
};

export default LoginForm;