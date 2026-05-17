import React, { useState } from 'react';

export default function Agendar({ clientas, setClientas, eventos, setEventos }) {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fecha, setFecha] = useState('');

  return (
    <div>
      <h2>📅 Agendar cita</h2>
      {/* Tu formulario de agendar */}
    </div>
  );
}