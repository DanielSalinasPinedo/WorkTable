import React from 'react';

const NotFound = () => {
  const backgroundImage = 'url(https://cdn.computerhoy.com/sites/navi.axelspringer.es/public/media/image/2018/09/viaje-tiempo.jpg?tf=3840x)';
  const textStyle = {
    textShadow: '2px 2px 4px rgba(0, 0, 0, 1)', // Ajusta los valores según tus preferencias
  };

  return (
    <div className='py-5' style={{ background: backgroundImage, backgroundSize: 'cover', margin: 0, padding: 0, height: '100vh' }}>
      <div className='py-5 container justify-content-center text-white col-12 col-md-8 col-lg-6 col-xl-5' style={textStyle}>
        <h2>No se encontró la página</h2>
        <p>
          Parece que has llegado a un punto en el tiempo donde esta página aún no existe.
        </p>
        <p>
          ¿Quizás te desplazaste demasiado lejos hacia el pasado o el futuro?
        </p>
        <p>
          ¡Regresa al presente y prueba con otra página!
        </p>
      </div>
    </div>
  );
};

export default NotFound;