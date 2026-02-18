// chatController.jsx
import { useUsuarios } from '../context/UserProvider.jsx';
import React, { useState } from 'react';

const useUsuariosController = () => {
  const { getUsuarios, getUsuario, actualizarUsuario, delUsuario } = useUsuarios();
  const [users, setUser] = useState([]);

  const getUsers = async () => {
    try {
      const users = await getUsuarios();

      // Si 'a' es verdadero, vuelve a llamar a la función
      if (users && users.length > 0) {
        setUser(users)
        return users
      } else {
        console.log("no hay usuarios")
      }
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
    }
  }

  const getUser = async (id) => {
    try {
      const users = await getUsuario(id);

      // Si 'a' es verdadero, vuelve a llamar a la función
      if (users) {
        return users
      } else {
        console.log("no hay usuario")
        return false
      }
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
    }
  }

  const uptUser = (id, user) => {
    const updatedUser = users.filter(usr =>
      usr.id_usuario === id
    ).map(usr => ({
      ...usr,
      id_usuario: user.id_usuario,
      nombre: user.nombre,
      role: user.role
    }));
    actualizarUsuario(id, updatedUser[0])
  }

  const delUser = (id) => {
    try {
      if (id) {
        delUsuario(id)
      } else {
        console.log("no existe ese chat")
      }
    } catch (error) {
      console.error('Error al obtener el chat:', error);
    }
  }

  return {
    users,
    getUsers,
    getUser,
    uptUser,
    delUser
  };
}

export default useUsuariosController;