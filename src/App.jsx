import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';

import plantillas from './plantillas.js';
import { saveData, loadData } from './database';

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}



// Nuevo componente (arriba archivo)
function QRWhatsapp({ telefono }) {
  if (!telefono) return null;
  return (
    <div className="qr-whatsapp-mini" title="Click para WhatsApp">
      <img 
        src={`https://api.qrserver.com/v1/create-qr-code/?data=https://wa.me/${telefono.replace(/\D/g,'')}&size=60x60`} 
        onClick={() => window.open(`https://wa.me/${telefono.replace(/\D/g,'')}`, '_blank')}
      />
    </div>
  );
}


const SERVICIOS = [
  'Lifting pestañas', 'Limpieza facial', 'Depilación facial', 
  'Hydrogloss', 'Masaje reductivo', 'Masaje mixto', 'Laminado de cejas'
];

function Portada() {
  return (
    <div className="portada">
      <div className="bg-rosa"></div>  {/* ← Quité "div" extra */}
      <div className="contenido">
        <img src="/logo.png" alt="Jenni Estética" className="logo" />
        <h1>Jenni Estética</h1>
        <p>Gestión Premium</p>
        <Link to="/crear-ficha" className="btn">Crear Ficha</Link>
        <Link to="/clientas" className="btn">Ver Clientas</Link>
        <Link to="/agendar" className="btn">Agendar</Link>
        <Link to="/finanzas" className="btn">Finanzas</Link>
        <Link to="/inventario" className="btn">Inventario</Link>
      </div>
    </div>
  );
}

function AppContent() {
  const [clientas, setClientas] = useState([]);
  const [eventos, setEventos] = useState([]);
const [movimientos, setMovimientos] = useState([]);
const [inventario, setInventario] = useState([]);


useEffect(() => { const cargarDatos = async () => { const clientasGuardadas = await loadData('clientas'); const eventosGuardados = await loadData('eventos'); setClientas(clientasGuardadas || []); setEventos(eventosGuardados || []); const movimientosGuardados = await loadData('movimientos'); setMovimientos(movimientosGuardados || []); const inventarioGuardado = await loadData('inventario'); setInventario(inventarioGuardado || []); };

  cargarDatos();

}, []);

   return (
    <Routes>
      <Route path="/" element={<Portada />} />
      <Route path="/crear-ficha" element={<CrearFicha clientas={clientas} setClientas={setClientas} />} />
      <Route 
  path="/clientas" 
  element={
    <VerClientas 
      clientas={clientas}
      setClientas={setClientas}
    />
  } 
/>
      <Route path="/agendar" element={<Agendar clientas={clientas} setClientas={setClientas} eventos={eventos} setEventos={setEventos} />} />
    <Route 
  path="/finanzas" 
  element={
    <Finanzas 
      eventos={eventos}
      movimientos={movimientos}
      setMovimientos={setMovimientos}
    />
  } 
/>
<Route 
  path="/inventario" 
  element={
    <Inventario 
      inventario={inventario}
      setInventario={setInventario}
    />
  } 
/>

      <Route 
  path="/ficha-completa" 
  element={<FichaCompleta clientas={clientas} setClientas={setClientas} />} 
/>
      <Route path="/ficha-tecnica" element={<FichaTecnica clientas={clientas} />} />
      <Route path="/servicios" element={<SeleccionarServicio clientas={clientas} />} />
    </Routes>
  );
}

function CrearFicha({ clientas, setClientas }) {
// ✅ NO necesitas nada - usa window.location.href directo

  
 const [formData, setFormData] = useState({ 
  nombre: '', 
  telefono: '', 
  whatsapp: '', // 👈 SOLO AGREGA ESTO
  fechaNacimiento: '',
  alergias: '', 
  enfermedades: '', 
  embarazo: false, 
  medicamentos: '', 
  observaciones: '',
});

useEffect(() => {
  const desdeAgenda = JSON.parse(localStorage.getItem('nuevaClientaAgenda') || 'null');
  if (desdeAgenda) {
    setFormData(prev => ({...prev, 
      nombre: desdeAgenda.nombre,
      telefono: desdeAgenda.telefono  // Ya viene +569 desde Agendar
    }));
    localStorage.removeItem('nuevaClientaAgenda');
  }
}, []);

  const [tieneAlergias, setTieneAlergias] = useState(false);
  const [tieneEnfermedades, setTieneEnfermedades] = useState(false);
  const [tomaMedicamentos, setTomaMedicamentos] = useState(false);

  const handleTelefonoChange = (e) => {
    const inputValue = e.target.value;
    if (inputValue.startsWith('+569')) {
      const numeros = inputValue.slice(4);
      if (numeros.length <= 8 && /^\d*$/.test(numeros)) {
        setFormData({...formData, telefono: '+569' + numeros});
      }
    } else {
      const numeros = inputValue.replace(/\D/g, '');
      if (numeros.length <= 8) {
        setFormData({...formData, telefono: numeros});
      }
    }
  };

const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();

  const nuevaClienta = { 
    id: Date.now(), 
    historial: [],
    tarjetasEntregadas: 0,
    tieneAlergias, 
    tieneEnfermedades, 
    tomaMedicamentos,
    ...formData 
  };

  const nuevasClientas = [...(clientas || []), nuevaClienta];

  await saveData('clientas', nuevasClientas);
  setClientas(nuevasClientas);

  alert(`¡Ficha ${formData.nombre} creada! ✨`);
    
    // ✅ REDIRECCION AUTOMÁTICA A AGENDAR
    
  localStorage.setItem('clientaParaServicios', JSON.stringify(nuevaClienta));
navigate('/servicios');

    
    // Reset form
    setFormData({ 
      nombre: '', fechaNacimiento: '',
      alergias: '', enfermedades: '', embarazo: false, 
      medicamentos: '', cicatrices: '', tipoPiel: '',
      tratamientosPrevios: '', lentesContacto: false, varices: false
    });
    setTieneAlergias(false);
    setTieneEnfermedades(false);
    setTomaMedicamentos(false);
  };

  return (
    <div className="seccion">
      <Link to="/" className="volver">← Volver</Link>
      <h2>📋 Ficha Clienta</h2>
      
      <form onSubmit={handleSubmit}>
        {/* BÁSICOS */}
        <h3 className="seccion-titulo">👤 Datos Básicos</h3>
        <div className="form-grid-basico">
          <input placeholder="Nombre completo *" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} required />
          <input 
            placeholder="91234567" 
            value={(formData.telefono || '').replace('+569', '')}
            onChange={handleTelefonoChange}
            type="tel"
          />
          <input placeholder="WhatsApp" value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} />
          <input type="date" value={formData.fechaNacimiento} onChange={(e) => setFormData({...formData, fechaNacimiento: e.target.value})} />
        </div>

        {/* MÉDICOS CON CONDICIONALES */}
        <h3 className="seccion-titulo">🩺 Datos Médicos</h3>
        
        {/* ALERGIAS */}
        <div className="campo-condicional">
          <label className="checkbox-medico">
            <input 
              type="checkbox" 
              checked={tieneAlergias} 
              onChange={(e) => {
                setTieneAlergias(e.target.checked);
                if (!e.target.checked) setFormData({...formData, alergias: ''});
              }}
            />
            ¿Tiene alergias médicas?
          </label>
          {tieneAlergias && (
            <textarea 
              placeholder="Especificar alergias (medicamentos, cosméticos...)" 
              value={formData.alergias} 
              onChange={(e) => setFormData({...formData, alergias: e.target.value})}
              rows="2"
            />
          )}
        </div>

        {/* ENFERMEDADES */}
        <div className="campo-condicional">
          <label className="checkbox-medico">
            <input 
              type="checkbox" 
              checked={tieneEnfermedades} 
              onChange={(e) => {
                setTieneEnfermedades(e.target.checked);
                if (!e.target.checked) setFormData({...formData, enfermedades: ''});
              }}
            />
            ¿Enfermedades crónicas?
          </label>
          {tieneEnfermedades && (
            <textarea 
              placeholder="Diabetes, tiroides, herpes, etc." 
              value={formData.enfermedades} 
              onChange={(e) => setFormData({...formData, enfermedades: e.target.value})}
              rows="2"
            />
          )}
        </div>

        {/* MEDICAMENTOS */}
        <div className="campo-condicional">
          <label className="checkbox-medico">
            <input 
              type="checkbox" 
              checked={tomaMedicamentos} 
              onChange={(e) => {
                setTomaMedicamentos(e.target.checked);
                if (!e.target.checked) setFormData({...formData, medicamentos: ''});
              }}
            />
            ¿Toma medicamentos?
          </label>
          {tomaMedicamentos && (
            <input 
              placeholder="Medicamentos actuales" 
              value={formData.medicamentos} 
              onChange={(e) => setFormData({...formData, medicamentos: e.target.value})}
            />
          )}
        </div>

        {/* CHECKBOX CRÍTICOS */}
        <div className="checkbox-grid">
          <label className="checkbox-medico critico">
            <input type="checkbox" checked={formData.embarazo} onChange={(e) => setFormData({...formData, embarazo: e.target.checked})} />
            Embarazo / Lactancia ⚠️
          </label>
        </div>

        {/* 📲 QR WHATSAPP */}
<div className="qr-section">
  <h3 className="seccion-titulo">📲 QR WhatsApp</h3>
  {formData.whatsapp && (
    <div className="qr-whatsapp">
      <img src={`https://api.qrserver.com/v1/create-qr-code/?data=https://wa.me/${formData.whatsapp.replace(/\D/g,'')}&size=200x200`} alt="QR WhatsApp" />
      <p>🖨️ Imprimir → Clienta escanea → Chat directo</p>
    </div>
  )}
</div>

<div className="campo-condicional">
  <h3 className="seccion-titulo">📝 Observaciones</h3>

  <textarea
    placeholder="Escribe aquí cualquier observación importante de la clienta..."
    value={formData.observaciones}
    onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
    rows="4"
  />
</div>


        <button type="submit" className="btn-guardar">💾 Guardar Ficha Completa</button>
      </form>
    </div>
  );
}

function VerClientas({ clientas, setClientas }) {
  const navigate = useNavigate();
const letras = [
  "A","B","C","D","E","F","G","H","I","J",
  "K","L","M","N","O","P","Q","R","S","T",
  "U","V","W","X","Y","Z"
];
  const [letra, setLetra] = useState('A');

 

  const verFichaCompleta = (clienta) => {
    localStorage.setItem('clientaSeleccionada', JSON.stringify(clienta));
    navigate('/ficha-completa');
  };

  

  return (
    <div className="seccion">
      <Link to="/" className="volver">Volver</Link>
      <h2>Clientas ({clientas.length})</h2>
      
      {/* CONTADOR TOTAL TARJETAS */}
      <div className="stats-global">
        <div className="stat-item">
          <strong>{clientas.filter(c => c.tarjetasEntregadas >= 4).length}</strong>
          <span>tarjetas completadas</span>
        </div>
        <div className="stat-item">
    <strong>{clientas.reduce((total, c) => total + c.tarjetasEntregadas, 0)}</strong>
    <span>sellos totales</span>
  </div>
</div>
    
    <div className="alfabeto">
      {letras.map(l => {
        const clientasLetra = clientas
          .filter(c => c.nombre.toUpperCase().startsWith(l))
          .sort((a, b) => a.nombre.localeCompare(b.nombre));
        
        return (
          <div key={l} className="letra-seccion">
            <button 
              className={letra === l ? 'activa' : ''} 
              onClick={() => setLetra(l)}
            >
              {l} ({clientasLetra.length})
            </button>
            
            {letra === l && clientasLetra.length > 0 && (
              <div className="lista-letra">
                {clientasLetra.map(clienta => (
                  <div 
  key={clienta.id} 
  className="clienta-card card-hover"
  onClick={() => verFichaCompleta(clienta)}
>

<div 
  className="icono-basurero" 
  onClick={async (e) => {
  e.stopPropagation();

  if (window.confirm(`🗑️ ¿Eliminar ficha de ${clienta.nombre}?`)) {

    try {

      const nuevasClientas = clientas.filter(
        c => c.id !== clienta.id
      );

      // ✅ Guarda Firebase
      await saveData('clientas', nuevasClientas);

      // ✅ Actualiza React
      setClientas(nuevasClientas);

      // ✅ Limpia localStorage
      localStorage.removeItem('clientaSeleccionada');
      localStorage.removeItem('clientaParaServicios');
      localStorage.removeItem('clientaParaAgendar');

      alert('✅ Clienta eliminada');

    } catch (error) {

      console.error(error);
      alert('❌ Error eliminando clienta');

    }
  }
}}
>
  🗑️
</div>
                  <div className="clienta-header">
  <h3>{clienta.nombre}</h3>

  <span className="status">
    {clienta.tarjetasEntregadas > 0 
      ? `⭐ ${clienta.tarjetasEntregadas}/4` 
      : 'Nueva'}
  </span>

  <div>
    📞 {clienta.telefono || clienta.whatsapp}
  </div>

  <QRWhatsapp telefono={clienta.telefono || clienta.whatsapp} />

  <p>Historial ({clienta.historial?.length || 0})</p>

  <div className="alertas-medicas">
    {clienta.embarazo && <span className="alerta roja">🤰 Embarazo</span>}
    {clienta.lentesContacto && <span className="alerta roja">👓 Lentes</span>}
    {clienta.varices && <span className="alerta roja">🚫 Varices</span>}
    {clienta.tieneAlergias && <span className="alerta amarilla">⚠️ Alergias</span>}
  </div>
</div>
</div>
                
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
);
}


function Agendar({ clientas, setClientas, eventos, setEventos }) {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [servicio, setServicio] = useState('');
  const [precio, setPrecio] = useState('');
  const [editarVisible, setEditarVisible] = useState(false);
const [idEditar, setIdEditar] = useState(null); // guardamos qué cita estamos editando


  const clientaParaAgendar = JSON.parse(localStorage.getItem('clientaParaAgendar') || 'null');
  useEffect(() => {
    if (clientaParaAgendar) {
      setNombre(clientaParaAgendar.nombre);
      localStorage.removeItem('clientaParaAgendar');
    }
  }, []);
const enviarRecordatorio = (cita) => {
  if (!cita.telefono) {
    alert('❌ Esta clienta no tiene teléfono');
    return;
  }

  const fechaFormateada = cita.fecha.split('-').reverse().join('/');

  // Aseguramos que el número quede con +569 y todos los dígitos juntos
  let telefonoLimpio = (cita.telefono || '').replace(/\D/g, '');
  if (!telefonoLimpio.startsWith('569')) {
    telefonoLimpio = '569' + telefonoLimpio.slice(-8);
  }

  const mensaje = `Hola ${cita.nombre} 

 Te recuerdo tu cita en Jenni DH 

 Fecha: ${fechaFormateada}
 Hora: ${cita.hora}
 Servicio: ${cita.servicio}

 Jenni Estética

Será un gusto atenderte 

 IMPORTANTE:
Para confirmar o cambiar tu hora, solo debes presionar uno de los enlaces y luego tocar "Enviar".

 Confirmar asistencia: 
https://wa.me/+${telefonoLimpio}?text=Confirmo%20mi%20cita%20

 Reagendar: 
https://wa.me/+${telefonoLimpio}?text=Quiero%20reagendar%20mi%20cita%20🔄

 Gracias y te espero con mucho cariño `;

  // Abrimos WhatsApp Web o App con el mensaje
  const url = `https://wa.me/+${telefonoLimpio}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

const guardarEdicion = async () => {
  if (!nombre || !telefono || !fecha || !hora || !servicio) {
    return alert('❌ Completa todos los campos');
  }

  const citasActualizadas = eventos.map(e => {
    if (e.id === idEditar) {
      return {
        ...e,
        nombre,
        telefono,
        fecha,
        hora,
        servicio,
        precio: Number(precio)
      };
    }
    return e;
  });

  await saveData('eventos', citasActualizadas);
  setEventos(citasActualizadas);

  alert('✅ Cita actualizada');

  setEditarVisible(false);
  setNombre('');
  setTelefono('');
  setFecha('');
  setHora('');
  setServicio('');
  setPrecio('');
  setIdEditar(null);
};

  

  const handleAgendar = async () => {
    if (!nombre || !telefono || !fecha || !hora || !servicio) {
      return alert('❌ Completa todos los campos');
    }
// 🚫 BLOQUEAR HORA OCUPADA
const existeCita = eventos.some(e => 
  e.fecha === fecha && e.hora === hora
  
);

if (existeCita) {
  return alert(`⛔ Ya tienes una cita a las ${hora} el ${fecha}`);
}

    const nuevoEvento = { 
  id: Date.now(), 
  nombre, 
  telefono, 
  fecha, 
  hora, 
  servicio,
  precio: Number(precio),
  confirmada: false // 👈 NUEVO
};
    const nuevosEventos = [...eventos, nuevoEvento];
    await saveData('eventos', nuevosEventos);
    setEventos(nuevosEventos);
    alert(`✅ ${nombre} agendada!\n📅 ${fecha} ${hora} - ${servicio}`);
    const fechaFormateada = fecha.split('-').reverse().join('/');

    const mensaje = `Hola ${nombre} 

 Tu hora ha sido agendada 

 Fecha: ${fechaFormateada}
 Hora: ${hora}
 Servicio: ${servicio}

 Jenni DH

 Te esperamos con mucho cariño 
¡Nos vemos pronto! `;

const numeroLimpio = (telefono || '').replace(/\D/g, '');

const url = `https://wa.me/${numeroLimpio}?text=${encodeURIComponent(mensaje)}`;

window.open(url, '_blank');

    setNombre(''); setTelefono(''); setFecha(''); setHora(''); setServicio('');setPrecio('');
  };

  const hoy = new Date().toISOString().split('T')[0];
  const citasHoy = eventos.filter(e => e.fecha === hoy);
  const totalHoy = citasHoy.reduce((acc, e) => acc + (e.precio || 0), 0);
  
  const citasFuturas = eventos.filter(e => e.fecha >= hoy);
  const citasPendientes = citasFuturas.filter(e => !e.confirmada);



  return (
    <div className="seccion agenda">
      <Link to="/" className="volver">← Volver</Link>
      <h2>📅 AGENDA HOY</h2>
      

      {citasPendientes.length > 0 && (
  <>
    <div style={{
      background: '#fff3cd',
      padding: '10px',
      borderRadius: '10px',
      marginBottom: '1rem',
      textAlign: 'center'
    }}>
      ⚠️ Tienes {citasPendientes.length} citas sin confirmar
    </div>

    <button 
      onClick={() => {
        citasPendientes.forEach(cita => enviarRecordatorio(cita));
      }}
      className="btn-agendar"
      style={{marginBottom: '1rem'}}
    >
      📲 Enviar recordatorio a todas
    </button>
  </>
)}

      <div style={{marginTop: '2rem'}}>
 

</div>

      <div className="form-agendar-completo">
        <h3>➕ Nueva Cita</h3>
        <div className="form-grid-agendar">
          <input placeholder="👤 Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <input type="tel" placeholder="📱 +5691234567" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
          <input type="time" value={hora} onChange={(e) => setHora(e.target.value)} />
          <select value={servicio} onChange={(e) => setServicio(e.target.value)}>
            <option value="">🎨 Servicio</option>
            {SERVICIOS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input 
  type="number"
  placeholder="💰 Precio"
  value={precio}
  onChange={(e) => setPrecio(e.target.value)}
/>
        </div>
        <button onClick={handleAgendar} className="btn-agendar">📅 AGENDAR</button>
      </div>

     {/* ✅ CITAS HOY CORREGIDAS */}
{citasHoy.length > 0 && (
  <div className="citas-hoy">
    <h3>🔴 HOY {citasHoy.length} CITA(S) ⚠️</h3>
    {citasHoy.map(e => {
      const clientaExiste = clientas.find(c => 
        c.nombre.toLowerCase().includes(e.nombre.toLowerCase())
      );
      return (
        <div 
          key={e.id} 
          className="evento-hoy clickable card-hover"
          style={{position: 'relative'}}
          onClick={() => {
            if (clientaExiste) {
              localStorage.setItem('clientaSeleccionada', JSON.stringify(clientaExiste));
             navigate('/ficha-completa');
            } else {
              alert(`👤 ${e.nombre} no tiene ficha. ¿Crear ficha médica?`);
                localStorage.setItem('nuevaClientaAgenda', JSON.stringify({
    nombre: e.nombre,
    telefono: e.telefono  // ← Incluye teléfono si existe
  }));
  navigate('/crear-ficha');
}
          }}
        >
          <div 
            className="icono-basurero"
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              opacity: 0,
              transition: 'opacity 0.2s'
            }}
          onClick={async (ev) => {
  ev.stopPropagation();

  if (confirm(`🗑️ ¿Cancelar cita ${e.nombre} ${e.hora}?`)) {

    const nuevasCitas = eventos.filter(
      evnt => evnt.id !== e.id
    );

    setEventos(nuevasCitas);

    await saveData('eventos', nuevasCitas);

  }
}}
          >🗑️</div>

          <strong>{e.nombre}</strong> {e.hora} - <span>{e.servicio}</span>
          {clientaExiste ? ' ✅' : ' ➕'}
        </div>
      );
    })}
  </div>
)}


            <h3>📋 Citas Futuras ({citasFuturas.length})</h3>
      <div className="lista-eventos">
        {citasFuturas.map(e => {
          const clientaExiste = clientas.find(c => 
            c.nombre.toLowerCase().includes(e.nombre.toLowerCase())
          );
          return (
            <div 
              key={e.id} 
              className="evento-item clickable card-hover relative"
              style={{
  backgroundColor: e.confirmada ? '#e8f8f0' : 'white',
  borderLeft: e.confirmada ? '5px solid green' : '5px solid #ccc'
}}
              onClick={() => {
  if (clientaExiste) {

    
                  
 
                  localStorage.setItem('clientaSeleccionada', JSON.stringify(clientaExiste));
                  navigate('/ficha-completa');
                } else {
                  alert(`👤 ${e.nombre} no tiene ficha. ¿Crear ficha?`);
                   localStorage.setItem('nuevaClientaAgenda', JSON.stringify({
    nombre: e.nombre,
    telefono: e.telefono  // ← Incluye teléfono si existe
  }));
  navigate('/crear-ficha');
}
              }}
            >
              <div 
                className="icono-basurero"
               onClick={async (ev) => {
  ev.stopPropagation();

  if (confirm(`🗑️ ¿Cancelar ${e.nombre} ${e.fecha} ${e.hora}?`)) {

    const nuevasCitas = eventos.filter(
      evnt => evnt.id !== e.id
    );

    setEventos(nuevasCitas);

    await saveData('eventos', nuevasCitas);

  }
}}
              >🗑️</div>
              <strong>{e.nombre}</strong> | {e.fecha} {e.hora} | {e.servicio}

{e.confirmada && <span style={{color: 'green', marginLeft: '10px'}}>✅ Confirmada</span>}

              <button 
  className="btn-editar"
  onClick={(ev) => {
    ev.stopPropagation();
    setNombre(e.nombre);
    setTelefono(e.telefono);
    setFecha(e.fecha);
    setHora(e.hora);
    setServicio(e.servicio);
    setPrecio(e.precio || '');
    setIdEditar(e.id);
    setEditarVisible(true);
  }}
>
  ✏️ Editar
</button>


<button 
  className="btn-confirmar"
  onClick={async (ev) => {
    ev.stopPropagation();
    const confirmar = window.confirm(`✅ ¿Confirmar asistencia de ${e.nombre} el ${e.fecha} a las ${e.hora}?`);
    if(confirmar){
      const nuevasCitas = eventos.map(c => {
        if(c.id === e.id){
          return { ...c, confirmada: true };
        }
        return c;
      });
      setEventos(nuevasCitas);
       await saveData('eventos', nuevasCitas);
    }
     }}
     >


  ✅ Confirmar asistencia
</button>

<button 
  className="btn-wsp"
  onClick={(ev) => {
    ev.stopPropagation();
    enviarRecordatorio(e); // función que abre WhatsApp
  }}
>
  📲 Recordar
</button>

<QRWhatsapp telefono={e.telefono} />
            </div>
          );
        })}
      </div>

   {editarVisible && (
  <div className="modal-editar">
    <h3>Editar Cita</h3>
    <input 
      type="text" 
      value={nombre} 
      onChange={e => setNombre(e.target.value)} 
      placeholder="Nombre"
    />
    <input 
      type="text" 
      value={telefono} 
      onChange={e => setTelefono(e.target.value)} 
      placeholder="Teléfono"
    />
    <input 
      type="date" 
      value={fecha} 
      onChange={e => setFecha(e.target.value)} 
    />
    <input 
      type="time" 
      value={hora} 
      onChange={e => setHora(e.target.value)} 
    />
    <input 
      type="text" 
      value={servicio} 
      onChange={e => setServicio(e.target.value)} 
      placeholder="Servicio"
    />
    <input 
      type="number" 
      value={precio} 
      onChange={e => setPrecio(e.target.value)} 
      placeholder="Precio"
    />

    <button onClick={guardarEdicion}>💾 Guardar</button>
    <button onClick={() => setEditarVisible(false)}>❌ Cancelar</button>
  </div>
)}



            <div style={{textAlign: 'center', marginTop: '2rem', color: '#8B7355'}}>
        ✨ Citas pasadas eliminadas automáticamente
      </div>
    </div>
  );
}



function Finanzas({ eventos, movimientos, setMovimientos }) {


const [fechaFiltro, setFechaFiltro] = useState('');
const [editandoId, setEditandoId] = useState(null);

const [nuevoGasto, setNuevoGasto] = useState({
  descripcion: '',
  monto: ''
});

const mesActual = new Date().getMonth();
const añoActual = new Date().getFullYear();
const [mesSeleccionado, setMesSeleccionado] = useState(mesActual);




  // 💰 TOTAL GENERAL
 const totalGeneral = eventos
  .filter(e => {
    if (!e.fecha) return false;

    const partes = e.fecha.split('-');

    const año = Number(partes[0]);
    const mes = Number(partes[1]) - 1;

    return (
     mes === mesSeleccionado &&
año === añoActual
    );
  })

  .reduce((acc, e) => {
    return acc + (Number(e.precio) || 0);
  }, 0);
  // 📅 TOTAL POR FECHA
  const totalPorFecha = eventos
    .filter(e => e.fecha === fechaFiltro)
    .reduce((acc, e) => acc + (Number(e.precio) || 0), 0);

  // 💅 GANANCIAS POR SERVICIO
  const gananciasPorServicio = eventos.reduce((acc, e) => {

    const servicio = e.servicio || 'Sin nombre';

    if (!acc[servicio]) {
      acc[servicio] = 0;
    }

    acc[servicio] += Number(e.precio) || 0;

    return acc;

  }, {});




const totalGastos = movimientos
  .filter(mov =>
    mov.mes === mesSeleccionado &&
mov.año === añoActual
  )
  .reduce((acc, mov) => {
    return acc + (Number(mov.monto) || 0);
  }, 0);
const gananciaFinal = totalGeneral - totalGastos;


const agregarGasto = async () => {

  if (!nuevoGasto.descripcion || !nuevoGasto.monto) return;

  // ✏️ EDITAR
  if (editandoId) {

    const nuevosMovimientos = movimientos.map((mov) =>
      mov.id === editandoId
        ? {
            ...mov,
            descripcion: nuevoGasto.descripcion,
            monto: Number(nuevoGasto.monto)
          }
        : mov
    );

    setMovimientos(nuevosMovimientos);

    await saveData('movimientos', nuevosMovimientos);

    setEditandoId(null);

  } else {

    // ➕ AGREGAR NUEVO
   const gasto = {
  id: Date.now(),
  descripcion: nuevoGasto.descripcion,
  monto: Number(nuevoGasto.monto),

  mes: new Date().getMonth(),
  año: new Date().getFullYear()
};
    const nuevosMovimientos = [...movimientos, gasto];

    setMovimientos(nuevosMovimientos);

    await saveData('movimientos', nuevosMovimientos);
  }

  setNuevoGasto({
    descripcion: '',
    monto: ''
  });
};


  return (
  <div className="seccion">

    <Link to="/" className="volver">
      ← Volver
    </Link>

    <h2>💰 Finanzas</h2>

{/* SELECTOR MES */}
<div className="card-finanzas">
  <h3>📅 Ver mes</h3>

  <select
    value={mesSeleccionado}
    onChange={(e) =>
      setMesSeleccionado(Number(e.target.value))
    }
  >
    <option value={0}>Enero</option>
    <option value={1}>Febrero</option>
    <option value={2}>Marzo</option>
    <option value={3}>Abril</option>
    <option value={4}>Mayo</option>
    <option value={5}>Junio</option>
    <option value={6}>Julio</option>
    <option value={7}>Agosto</option>
    <option value={8}>Septiembre</option>
    <option value={9}>Octubre</option>
    <option value={10}>Noviembre</option>
    <option value={11}>Diciembre</option>
  </select>
</div>

{/* AGREGAR GASTO */}
<div className="card-finanzas">
  <h3>💸 Agregar gasto</h3>

  <input
    placeholder="Ej: Compra aceite"
    value={nuevoGasto.descripcion}
    onChange={(e) =>
      setNuevoGasto({
        ...nuevoGasto,
        descripcion: e.target.value
      })
    }
  />

  <input
    type="number"
    placeholder="Monto"
    value={nuevoGasto.monto}
    onChange={(e) =>
      setNuevoGasto({
        ...nuevoGasto,
        monto: e.target.value
      })
    }
  />

  <button onClick={agregarGasto}>
    Guardar gasto
  </button>
</div>


{/* LISTA GASTOS */}
<div className="card-finanzas">
  <h3>🧾 Gastos registrados</h3>

  {movimientos.filter(mov =>
  mov.mes === mesSeleccionado &&
  mov.año === añoActual
).length === 0 ? (

    <p>No hay gastos aún</p>
  ) : (
    movimientos
  .filter(mov =>
    mov.mes === mesSeleccionado &&
    mov.año === añoActual
  )
  .map((mov) => (
      <div
        key={mov.id}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 0",
          borderBottom: "1px solid #f1dce5"
        }}
      >
        <div>
          <strong>{mov.descripcion}</strong>

          {/* BOTÓN EDITAR */}
          <div>
            <button
              onClick={() => {
                setNuevoGasto({
                  descripcion: mov.descripcion,
                  monto: mov.monto
                });

                setEditandoId(mov.id);
              }}
              style={{
                border: "none",
                background: "#f8dce6",
                borderRadius: "10px",
                padding: "4px 10px",
                cursor: "pointer",
                marginTop: "5px",
                fontSize: "12px"
              }}
            >
              ✏️ Editar
            </button>

 {/* ELIMINAR */}
  <button
    onClick={async () => {

      const confirmar = window.confirm(
        "¿Eliminar este gasto?"
      );

      if (!confirmar) return;

      const nuevosMovimientos = movimientos.filter(
        item => item.id !== mov.id
      );

      setMovimientos(nuevosMovimientos);

      await saveData(
        'movimientos',
        nuevosMovimientos
      );
    }}
    style={{
      border: "none",
      background: "#ffe3e3",
      color: "#c94b4b",
      borderRadius: "10px",
      padding: "4px 10px",
      cursor: "pointer",
      fontSize: "12px"
    }}
  >
    🗑️ Eliminar
  </button>


          </div>
        </div>

        <div style={{ color: "#d45b7a", fontWeight: "600" }}>
          - ${mov.monto}
        </div>
      </div>
    ))
  )}
</div>

{/* TOTAL */}
<div className="card-finanzas">
  <h3>💰 Resumen</h3>

  <p>🟢 Ingresos: ${totalGeneral}</p>

  <p>🔴 Gastos: {totalGastos} $</p>

  <p>
    💵 Ganancia real:
    <strong
      style={{
        color: gananciaFinal < 0 ? "red" : "green"
      }}
    >
      ${gananciaFinal}
    </strong>
  </p>

</div>

{/* TOTAL */}
<div className="card-finanzas">
  <h3>💵 Total generado</h3>
  <p>${totalGeneral}</p>
</div>

</div>

);
}

function Inventario({ inventario, setInventario }) {
  const [form, setForm] = useState({
    nombre: '',
    stock: '',
    minimo: ''
  });

  // ➕ AGREGAR PRODUCTO
  const agregar = async () => {
    if (!form.nombre) return;

    const nuevo = {
      id: Date.now(),
      nombre: form.nombre,
      stock: Number(form.stock),
      minimo: Number(form.minimo)
    };

    const nuevos = [...inventario, nuevo];
    setInventario(nuevos);
    await saveData('inventario', nuevos);

    setForm({ nombre: '', stock: '', minimo: '' });
  };

  // 🗑️ ELIMINAR
  const eliminar = async (id) => {

  const confirmar = window.confirm(
    "🗑️ ¿Seguro que quieres eliminar este producto?"
  );

  if (!confirmar) return;

  const nuevos = inventario.filter(i => i.id !== id);

  setInventario(nuevos);

  await saveData('inventario', nuevos);
};

  // ➖ DESCONTAR STOCK
  const descontar = async (id, cantidad = 1) => {
    const nuevos = inventario.map(i => {
      if (i.id === id) {
        return { ...i, stock: i.stock - cantidad };
      }
      return i;
    });

    setInventario(nuevos);
    await saveData('inventario', nuevos);
  };
const sumar = async (id, cantidad = 1) => {
  const nuevos = inventario.map(i => {
    if (i.id === id) {
      return { ...i, stock: i.stock + cantidad };
    }
    return i;
  });

  setInventario(nuevos);
  await saveData('inventario', nuevos);
};



  return (
    <div className="seccion">

      <Link to="/" className="volver">← Volver</Link>

      <h2>📦 Inventario</h2>

      {/* FORMULARIO */}
      <div className="card-finanzas">
        <h3>➕ Agregar producto</h3>

        <input
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        />

        <input
          type="number"
          placeholder="Stock"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
        />

        <input
          type="number"
          placeholder="Mínimo"
          value={form.minimo}
          onChange={(e) => setForm({ ...form, minimo: e.target.value })}
        />

        <button onClick={agregar}>
          Guardar
        </button>
      </div>

      {/* LISTA */}
      <div className="card-finanzas">
        <h3>📋 Productos</h3>

       {inventario.map(i => (
  <div
    key={i.id}
    style={{
      border: "1px solid #f1dce5",
      borderRadius: "18px",
      padding: "14px",
      marginBottom: "12px",
      background: "#fff",
      boxShadow: "0 2px 10px rgba(0,0,0,0.04)"
    }}
  >

    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px"
      }}
    >

      {/* INFO */}
      <div style={{ flex: 1 }}>
        <strong
  style={{
    fontSize: "16px",
    color: i.stock <= i.minimo ? "#d32f2f" : "#6d4c41"
  }}
>
          {i.nombre}
          {i.stock <= i.minimo && " ⚠️"}
        </strong>

        <p
  style={{
    margin: 0,
    color: i.stock <= i.minimo ? "#d32f2f" : "#c48b9f",
    fontSize: "13px",
    fontWeight: i.stock <= i.minimo ? "bold" : "normal"
  }}
>
          min {i.minimo}
        </p>
      </div>

      {/* CONTROLES */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}
      >

        {/* MENOS */}
        <button
  onClick={() => descontar(i.id)}
  style={{
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    border: "none",
    background: "#f8dce6",
    fontSize: "16px",
    cursor: "pointer",

    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }}
>
  ➖
</button>

        {/* STOCK */}
        <strong
          style={{
            fontSize: "18px",
            minWidth: "20px",
            textAlign: "center",
            color: "#6d4c41"
          }}
        >
          {i.stock}
        </strong>

       {/* MÁS */}
<button
  onClick={() => sumar(i.id)}
  style={{
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    border: "none",
    background: "#f8dce6",
    cursor: "pointer",
    fontSize: "16px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }}
>
  ➕
</button>

{/* ELIMINAR */}
<button
  onClick={() => eliminar(i.id)}
  style={{
    width: "34px",
    height: "34px",
    borderRadius: "50%",
    border: "none",
    background: "#ffe8ee",
    cursor: "pointer",
    fontSize: "15px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }}
>
  🗑️
</button>

      </div>

    </div>

  </div>
))}

      </div>
    </div>
  );
}

function FichaTecnica({ clientas }) {
  const navigate = useNavigate();
  const clienta = JSON.parse(localStorage.getItem('clientaParaServicios') || 'null');
  const servicio = localStorage.getItem('servicioSeleccionado');
  
  // ← CARGAR FICHA EXISTENTE PRIMERO
 const fichaTecnicaIndex = localStorage.getItem('fichaTecnicaIndex');

const indexNumerico = fichaTecnicaIndex !== null 
  ? Number(fichaTecnicaIndex) 
  : null;


 
   

  if (!clienta || !servicio) {
  navigate('/');
  return null;
}
 

  
  const camposServicio = plantillas[servicio] || [];

  // ✅ useState dentro del componente
 const [datosTecnica, setDatosTecnica] = useState({});

 

  // Función para actualizar inputs
  const handleInputChange = (campo, valor) => {
    setDatosTecnica({...datosTecnica, [campo]: valor});
  };

  // Función para guardar ficha
  const guardarFichaTecnica = async () => {
    const fichaTecnica = {
      id: Date.now(),
      servicio,
      fecha: new Date().toLocaleDateString('es-CL'),
      datos: datosTecnica,
      clientaId: clienta.id
    };

    // Actualizar historial clienta
    // 📌 Agregar al historial directamente (SIN fichasTecnicas)
const clientaActualizada = {
  ...clienta,
  historial: clienta.historial
    ? [...clienta.historial, {
        servicio,
        fecha: fichaTecnica?.fecha || new Date().toISOString(),
        tecnica: true,
        datos: datosTecnica
      }]
    : [{
        servicio,
        fecha: fichaTecnica?.fecha || new Date().toISOString(),
        tecnica: true,
        datos: datosTecnica
      }]
};

    const nuevasClientas = clientas.map(c => 
      c.id === clienta.id ? clientaActualizada : c
    );
    await saveData('clientas', nuevasClientas);

    alert(`✅ Ficha técnica ${servicio} guardada para ${clienta.nombre}!`);
    localStorage.setItem('clientaSeleccionada', JSON.stringify(clientaActualizada));

navigate('/ficha-completa');

  };

  return (
    <div className="seccion">
      <Link to="/ficha-completa" className="volver">← Ficha Completa</Link>
      <h2>📋 Ficha Técnica: {servicio}</h2>
      <p style={{textAlign: 'center'}}>{clienta.nombre} - {new Date().toLocaleDateString('es-CL')}</p>

      <div className="grid-campos-tecnica">
  {camposServicio.map((campo, index) => {


    // Selects específicos para Lifting
    if (servicio === 'Lifting pestañas' && campo.includes('Largo')) {
      return (
        <div key={index} className="campo-tecnico">
          <label>{campo}:</label>
          <select value={datosTecnica[campo] || ''} onChange={(e) => handleInputChange(campo, e.target.value)}>
            <option value="">Seleccionar...</option>
            <option value="Cortas">Cortas</option>
            <option value="Medias">Medias</option>
            <option value="Largas">Largas</option>
          </select>
        </div>
      );
    }
    
    // Repetir para cada campo específico...
  if (campo.includes('lentes de contacto')) {
  return (
    <div key={index} className="campo-tecnico">
      <label>{campo}:</label>
      <select
        value={datosTecnica[campo] || ''}
        onChange={(e) => handleInputChange(campo, e.target.value)}
      >
        <option value="">Seleccionar...</option>
        <option value="Sí">Sí</option>
        <option value="No">No</option>
      </select>
    </div>
  );
}

if (campo.includes('Infección ocular')) {
  return (
    <div key={index} className="campo-tecnico">
      <label>{campo}:</label>
      <select
        value={datosTecnica[campo] || ''}
        onChange={(e) => handleInputChange(campo, e.target.value)}
      >
        <option value="">Seleccionar...</option>
        <option value="Sí">Sí</option>
        <option value="No">No</option>
      </select>
    </div>
  );
}

if (campo.includes('Heridas') || campo.includes('irritación')) {
  return (
    <div key={index} className="campo-tecnico">
      <label>{campo}:</label>
      <select
        value={datosTecnica[campo] || ''}
        onChange={(e) => handleInputChange(campo, e.target.value)}
      >
        <option value="">Seleccionar...</option>
        <option value="Sí">Sí</option>
        <option value="No">No</option>
      </select>
    </div>
  );
}
if (campo.includes('sensibilidad ocular')) {
  return (
    <div key={index} className="campo-tecnico">
      <label>{campo}:</label>
      <select
        value={datosTecnica[campo] || ''}
        onChange={(e) => handleInputChange(campo, e.target.value)}
      >
        <option value="">Seleccionar...</option>
        <option value="Baja">Baja</option>
        <option value="Medio">Medio</option>
        <option value="Alta">Alta</option>
      </select>
    </div>
  );
}

    if (servicio === 'Lifting pestañas' && campo.includes('Grosor')) {
      return (
        <div key={index} className="campo-tecnico">
          <label>{campo}:</label>
          <select value={datosTecnica[campo] || ''} onChange={(e) => handleInputChange(campo, e.target.value)}>
            <option value="">Seleccionar...</option>
            <option value="Fino">Fino</option>
            <option value="Normal">Normal</option>
            <option value="Grueso">Grueso</option>
          </select>
        </div>
      );
    }
    
    // Molde
if (servicio === 'Lifting pestañas' && campo.includes('Molde utilizado')) {
  return (
    <div key={index} className="campo-tecnico">
      <label>{campo}:</label>
      <select value={datosTecnica[campo] || ''} onChange={(e) => handleInputChange(campo, e.target.value)}>
        <option value="">Seleccionar molde...</option>
        <option value="Lomansa L"> Lomansa L</option>
        <option value="Peachxd"> Peachxd</option>
        <option value="Foxy Jelly"> Foxy Jelly</option>
        <option value="Frozenxd"> Frozenxd</option>
        <option value="Fancyxd"> Fancyxd</option>
        <option value="Shelly">Shelly</option>
        <option value="Amine">Anime</option>
        <option value="Nube">Nube</option>
      </select>
    </div>
  );
}

    
    // Talla molde
    if (servicio === 'Lifting pestañas' && campo.includes('Talla molde')) {
      return (
        <div key={index} className="campo-tecnico">
          <label>{campo}:</label>
          <select value={datosTecnica[campo] || ''} onChange={(e) => handleInputChange(campo, e.target.value)}>
            <option value="">Seleccionar talla...</option>
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="S+">S+</option>
            <option value="S1">S1</option>
            <option value="M">M</option>
            <option value="M+">M+</option>
            <option value="M1">M1</option>
            <option value="L">L</option>
            <option value="LL">LL</option>
            <option value="XL">XL</option>
            <option value="XXL">XXL</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>
      );
    }
    
    // Loción Paso 1
    if (servicio === 'Lifting pestañas' && campo.includes('Paso 1 Loción')) {
      return (
        <div key={index} className="campo-tecnico">
          <label>{campo}:</label>
          <select value={datosTecnica[campo] || ''} onChange={(e) => handleInputChange(campo, e.target.value)}>
            <option value="">Seleccionar...</option>
            <option value="Maximova">Maximova</option>
            <option value="DLUX">DLUX</option>
            <option value="BEAUTYWAVE">BEAUTYWAVE</option>
          </select>
        </div>
      );
    }
    
    // Paso 2 Fix
    if (servicio === 'Lifting pestañas' && campo.includes('Paso 2 Fix')) {
      return (
        <div key={index} className="campo-tecnico">
          <label>{campo}:</label>
          <select value={datosTecnica[campo] || ''} onChange={(e) => handleInputChange(campo, e.target.value)}>
            <option value="">Seleccionar...</option>
            <option value="Maximova">Maximova</option>
            <option value="DLUX">DLUX</option>
            <option value="BEAUTYWAVE">BEAUTYWAVE</option>
          </select>
        </div>
      );
    }

        // 📐 Dirección natural ← AGREGAR AQUÍ
    if (servicio === 'Lifting pestañas' && campo.includes('Dirección natural')) {
      return (
        <div key={index} className="campo-tecnico">
          <label>{campo}:</label>
          <select value={datosTecnica[campo] || ''} onChange={(e) => handleInputChange(campo, e.target.value)}>
            <option value="">Seleccionar dirección...</option>
            <option value="Rectas">Rectas 📏</option>
            <option value="Hacia arriba">Hacia arriba 🔼</option>
            <option value="Hacia abajo">Hacia abajo 🔽</option>
            <option value="Irregulares">Irregulares ↕️</option>
          </select>
        </div>
      );
    }

    // 🔢 Cantidad pestañas ← AGREGAR AQUÍ
    if (servicio === 'Lifting pestañas' && campo.includes('Cantidad')) {
      return (
        <div key={index} className="campo-tecnico">
          <label>{campo}:</label>
          <select value={datosTecnica[campo] || ''} onChange={(e) => handleInputChange(campo, e.target.value)}>
            <option value="">Seleccionar cantidad...</option>
            <option value="Baja">Baja (pocas) 📉</option>
            <option value="Media">Media (normal) ➡️</option>
            <option value="Alta">Alta (densa) 📈</option>
          </select>
        </div>
      );
    }

    // ❤️ Estado general ← AGREGAR AQUÍ
    if (servicio === 'Lifting pestañas' && campo.includes('Estado general')) {
      return (
        <div key={index} className="campo-tecnico">
          <label>{campo}:</label>
          <select value={datosTecnica[campo] || ''} onChange={(e) => handleInputChange(campo, e.target.value)}>
            <option value="">Seleccionar estado...</option>
            <option value="Sanas">Sanas 💚</option>
            <option value="Débiles">Débiles 🟡</option>
            <option value="Quebradizas">Quebradizas 🔴</option>
          </select>
        </div>
      );
    }

    // ❄️ ¿Molde plano? ← AGREGAR AQUÍ
    if (servicio === 'Lifting pestañas' && campo.includes('¿Molde plano')) {
      return (
        <div key={index} className="campo-tecnico">
          <label>{campo}:</label>
          <select value={datosTecnica[campo] || ''} onChange={(e) => handleInputChange(campo, e.target.value)}>
            <option value="">Seleccionar...</option>
            <option value="Sí">✅ Sí</option>
            <option value="No">❌ No</option>
          </select>
        </div>
      );
    }

 
    
    // Tinte
    if (servicio === 'Lifting pestañas' && campo.includes('¿Tinte')) {
      return (
        <div key={index} className="campo-tecnico">
          <label>{campo}:</label>
          <select value={datosTecnica[campo] || ''} onChange={(e) => handleInputChange(campo, e.target.value)}>
            <option value="">Seleccionar...</option>
            <option value="Sí">Sí</option>
            <option value="No">No</option>
          </select>
        </div>
      );
    }

    // ========== LIMPIEZA FACIAL ==========
if (campo.includes('Hidratación')) {
  return (
    <div key={index} className="campo-tecnico">
      <label>{campo}:</label>
      <select
        value={datosTecnica[campo] || ''}
        onChange={(e) => handleInputChange(campo, e.target.value)}
      >
        <option value="">Seleccionar...</option>
        <option value="Sí">Sí</option>
        <option value="No">No</option>
      </select>
    </div>
  );
}

if (campo.includes('Vaporización')) {
  return (
    <div key={index} className="campo-tecnico">
      <label>{campo}:</label>
      <select
        value={datosTecnica[campo] || ''}
        onChange={(e) => handleInputChange(campo, e.target.value)}
      >
        <option value="">Seleccionar...</option>
        <option value="Sí">Sí</option>
        <option value="No">No</option>
      </select>
    </div>
  );
}

if (campo.includes('Exfoliación')) {
  return (
    <div key={index} className="campo-tecnico">
      <label>{campo}:</label>
      <select
        value={datosTecnica[campo] || ''}
        onChange={(e) => handleInputChange(campo, e.target.value)}
      >
        <option value="">Seleccionar...</option>
        <option value="Sí">Sí</option>
        <option value="No">No</option>
      </select>
    </div>
  );
}

if (campo.includes('Luminosidad')) {
  return (
    <div key={index} className="campo-tecnico">
      <label>{campo}:</label>
      <select
        value={datosTecnica[campo] || ''}
        onChange={(e) => handleInputChange(campo, e.target.value)}
      >
        <option value="">Seleccionar nivel...</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
        <option value="6">6</option>
        <option value="7">7</option>
        <option value="8">8</option>
        <option value="9">9</option>
        <option value="10">10</option>
      </select>
    </div>
  );
}

if (servicio === 'Limpieza facial' && campo.includes('Tipo de piel')) {
  return (
    <div key={index} className="campo-tecnico">
      <label>{campo}:</label>
      <select value={datosTecnica[campo] || ''} onChange={(e) => handleInputChange(campo, e.target.value)}>
        <option value="">Seleccionar tipo...</option>
        <option value="Normal">Normal ⚖️</option>
        <option value="Seca">Seca 🥶</option>
        <option value="Mixta">Mixta ⚖️+</option>
        <option value="Grasa">Grasa 🛢️</option>
        <option value="Sensible">Sensible 😣</option>
        <option value="Acneica">Acneica 🌋</option>
      </select>
    </div>
  );
}

if (servicio === 'Limpieza facial' && campo.includes('Biotipo cutáneo')) {
  return (
    <div key={index} className="campo-tecnico">
      <label>{campo}:</label>
      <select value={datosTecnica[campo] || ''} onChange={(e) => handleInputChange(campo, e.target.value)}>
        <option value="">Observaciones...</option>
        <option value="Deshidratada">Deshidratada 💧</option>
        <option value="Desvitalizada">Desvitalizada ⚫</option>
        <option value="Con rosácea">Con rosácea 🌹</option>
        <option value="Con manchas">Con manchas 🎨</option>
        <option value="Poros dilatados">Poros dilatados 🔍</option>
        <option value="Con comedones">Con comedones ⚫⚫</option>
        <option value="Pápulas/pústulas">Pápulas/pústulas 🌋</option>
      </select>
    </div>
  );
}

if (servicio === 'Limpieza facial' && campo.includes('Nivel de sensibilidad')) {
  return (
    <div key={index} className="campo-tecnico">
      <label>{campo}:</label>
      <select value={datosTecnica[campo] || ''} onChange={(e) => handleInputChange(campo, e.target.value)}>
        <option value="">Nivel sensibilidad...</option>
        <option value="Baja">Baja 🟢</option>
        <option value="Medio">Medio 🟡</option>
        <option value="Alta">Alta 🔴</option>
      </select>
    </div>
  );
}

  // ========== DEPILACIÓN FACIAL ==========

// Zona tratada checkboxes
if (campo.includes('Zona tratada')) {
  return (
    <div key={index} className="campo">
      <label>{campo}:</label>
      <div className="checkbox-group">
        <label><input type="checkbox" name="zona" value="Bozo" /> Bozo</label>
        <label><input type="checkbox" name="zona" value="Mejillas" /> Mejillas</label>
        <label><input type="checkbox" name="zona" value="Mentón" /> Mentón</label>
        <label><input type="checkbox" name="zona" value="Patillas" /> Patillas</label>
        <label><input type="checkbox" name="zona" value="Frente" /> Frente</label>
      </div>
    </div>
  );
}

// Tipo de piel Depilación
if (servicio === 'Depilación facial' && campo.includes('Tipo de piel')) {
  return (
    <div key={index} className="campo-tecnico">
      <label>{campo}:</label>
      <select value={datosTecnica[campo] || ''} onChange={(e) => handleInputChange(campo, e.target.value)}>
        <option value="">Seleccionar...</option>
        <option value="Normal">Normal ⚖️</option>
        <option value="Seca">Seca 🥶</option>
        <option value="Mixta">Mixta ➕</option>
        <option value="Grasa">Grasa 🛢️</option>
        <option value="Sensible">Sensible 😣</option>
      </select>
    </div>
  );
}

// Nivel sensibilidad Depilación
if (servicio === 'Depilación facial' && campo.includes('Nivel sensibilidad')) {
  return (
    <div key={index} className="campo-tecnico">
      <label>{campo}:</label>
      <select value={datosTecnica[campo] || ''} onChange={(e) => handleInputChange(campo, e.target.value)}>
        <option value="">Seleccionar...</option>
        <option value="Baja">Baja 🟢</option>
        <option value="Medio">Medio 🟡</option>
        <option value="Alta">Alta 🔴</option>
      </select>
    </div>
  );
}

// ==========   HYDROGLOSS ==========

// 👄 Tipo de labio
if (servicio === 'Hydrogloss' && campo === 'Tipo de labio') {
  return (
    <div key={index} className="campo-tecnico">
      <label>👄 Tipo de labio:</label>
      <select
        value={datosTecnica[campo] || ''}
        onChange={(e) => handleInputChange(campo, e.target.value)}
      >
        <option value="">Seleccionar...</option>
        <option value="Normal">Normal</option>
        <option value="Seca">Seca</option>
        <option value="Delicado">Delicado</option>
      </select>
    </div>
  );
}



// 🚨 Heridas en labios
if (servicio === 'Hydrogloss' && campo === 'Heridas en labios') {
  return (
    <div key={index} className="campo-tecnico">
      <label>🚨 Heridas en labios:</label>
      <select
        value={datosTecnica[campo] || ''}
        onChange={(e) => handleInputChange(campo, e.target.value)}
      >
        <option value="">Seleccionar...</option>
        <option value="Sí">Sí</option>
        <option value="No">No</option>
      </select>
    </div>
  );
}

// 🤒 Herpes activo
if (servicio === 'Hydrogloss' && campo === 'Herpes activo') {
  return (
    <div key={index} className="campo-tecnico">
      <label>🤒 Herpes activo:</label>
      <select
        value={datosTecnica[campo] || ''}
        onChange={(e) => handleInputChange(campo, e.target.value)}
      >
        <option value="">Seleccionar...</option>
        <option value="Sí">Sí</option>
        <option value="No">No</option>
      </select>
    </div>
  );
}

// 💉 Labios agrietados
if (servicio === 'Hydrogloss' && campo === 'Labios agrietados') {
  return (
    <div key={index} className="campo-tecnico">
      <label>💉 Labios agrietados:</label>
      <select
        value={datosTecnica[campo] || ''}
        onChange={(e) => handleInputChange(campo, e.target.value)}
      >
        <option value="">Seleccionar...</option>
        <option value="Sí">Sí</option>
        <option value="No">No</option>
      </select>
    </div>
  );
}





// Zonas masaje
if (servicio === 'Masaje reductivo' && campo.includes('Zonas')) {
  return (
    <div key={index} className="campo">
      <label>{campo}:</label>
      <div className="checkbox-group">
        <label><input type="checkbox" name="zonas" value="Abdomen" /> Abdomen</label>
        <label><input type="checkbox" name="zonas" value="Cadera" /> Cadera</label>
        <label><input type="checkbox" name="zonas" value="Muslos" /> Muslos</label>
        <label><input type="checkbox" name="zonas" value="Brazos" /> Brazos</label>
      </div>
    </div>
  );
}

if (servicio === 'Masaje reductivo' && campo.includes('Lesiones')) {
  return (
    <div key={index} className="campo-tecnico">
      <label>{campo}:</label>
      <select value={datosTecnica[campo] || ''} onChange={(e) => handleInputChange(campo, e.target.value)}>
        <option value="">Seleccionar...</option>
        <option value="Sí">Sí</option>
        <option value="No">No</option>
      </select>
    </div>
  );
}

if (servicio === 'Masaje reductivo' && campo.includes('Varices')) {
  return (
        <div key={index} className="campo-tecnico">
      <label>{campo}:</label>
      <select value={datosTecnica[campo] || ''} onChange={(e) => handleInputChange(campo, e.target.value)}>
        <option value="">Seleccionar...</option>
        <option value="Leves">Leves</option>
        <option value="Moderadas">Moderadas</option>
        <option value="Marcadas">Marcadas</option>
      </select>
    </div>
  );
}

if (servicio === 'Masaje reductivo' && campo.includes('Dolor')) {
  return (
     <div key={index} className="campo-tecnico">
      <label>{campo}:</label>
      <select value={datosTecnica[campo] || ''} onChange={(e) => handleInputChange(campo, e.target.value)}>
        <option value="">Seleccionar...</option>
        <option value="Sí">Sí</option>
        <option value="No">No</option>
      </select>
    </div>
  );
}


if (servicio === 'Masaje reductivo' && campo.includes('Estrías')) {
  return (
    <div key={index} className="campo-tecnico">
      <label>{campo}:</label>
      <select value={datosTecnica[campo] || ''} onChange={(e) => handleInputChange(campo, e.target.value)}>
        <option value="">Seleccionar...</option>
        <option value="Leves">Leves</option>
        <option value="Moderadas">Moderadas</option>
        <option value="Marcadas">Marcadas</option>
      </select>
    </div>
  );
}

if (servicio === 'Masaje reductivo' && campo.includes('Celulitis')) {
  return (
   <div key={index} className="campo-tecnico">
      <label>{campo}:</label>
      <select value={datosTecnica[campo] || ''} onChange={(e) => handleInputChange(campo, e.target.value)}>
        <option value="">Seleccionar...</option>
        <option value="Leves">Leves</option>
        <option value="Moderadas">Moderadas</option>
        <option value="Marcadas">Marcadas</option>
      </select>
    </div>
  );
}

if (servicio === 'Masaje reductivo' && campo.includes('Flacidez')) {
  return (
 <div key={index} className="campo-tecnico">
      <label>{campo}:</label>
      <select value={datosTecnica[campo] || ''} onChange={(e) => handleInputChange(campo, e.target.value)}>
        <option value="">Seleccionar...</option>
        <option value="Leves">Leves</option>
        <option value="Moderadas">Moderadas</option>
        <option value="Marcadas">Marcadas</option>
      </select>
    </div>
  );
}

if (servicio === 'Masaje reductivo' && campo.includes('Retención')) {
  return (
     <div key={index} className="campo-tecnico">
      <label>{campo}:</label>
      <select value={datosTecnica[campo] || ''} onChange={(e) => handleInputChange(campo, e.target.value)}>
        <option value="">Seleccionar...</option>
        <option value="Leves">Leves</option>
        <option value="Moderadas">Moderadas</option>
        <option value="Marcadas">Marcadas</option>
      </select>
    </div>
  );
}

// 📊 Sesiones plan (checkbox numerados)
if (servicio === 'Masaje reductivo' && campo.includes('Plan de sesiones')) {
  return (
    <div key={index} className="campo-tecnico">
      <label>{campo}:</label>
      <div className="sesiones-checkbox">
        {[1,2,3,4,5,6,7,8,10,12].map(num => (
          <label key={num} className="sesion-item">
            <input 
              type="checkbox" 
              value={num}
              onChange={(e) => {
                const sesiones = datosTecnica['sesiones'] || [];
                if (e.target.checked) {
                  handleInputChange('sesiones', [...sesiones, num]);
                } else {
                  handleInputChange('sesiones', sesiones.filter(s => s != num));
                }
              }}
            />
            Sesión {num}
          </label>
        ))}
      </div>
    </div>
  );
}

// Zonas tensas relajante
if (servicio === 'Masaje mixto' && campo.includes('Zonas tensas')) {
  return (
    <div key={index} className="campo">
      <label>{campo}:</label>
      <div className="checkbox-group">
        <label><input type="checkbox" name="zonas" value="Cuello" /> Cuello</label>
        <label><input type="checkbox" name="zonas" value="Hombros" /> Hombros</label>
        <label><input type="checkbox" name="zonas" value="Espalda" /> Espalda</label>
        <label><input type="checkbox" name="zonas" value="Piernas" /> Piernas</label>
          <label><input type="checkbox" name="zonas" value="Planta de Pie" /> Planta de Pie</label>
            <label><input type="checkbox" name="zonas" value="Abdomen" /> abdomen</label>
      </div>
    </div>
  );
}

if (servicio === 'Masaje mixto' && campo.includes('Lesiones')) {
  return (
    <div key={index} className="campo-tecnico">
      <label>{campo}:</label>
      <select value={datosTecnica[campo] || ''} onChange={(e) => handleInputChange(campo, e.target.value)}>
        <option value="">Seleccionar...</option>
        <option value="Sí">Sí</option>
        <option value="No">No</option>
      </select>
    </div>
  );
}

if (servicio === 'Masaje mixto' && campo.includes('Varices')) {
  return (
        <div key={index} className="campo-tecnico">
      <label>{campo}:</label>
      <select value={datosTecnica[campo] || ''} onChange={(e) => handleInputChange(campo, e.target.value)}>
        <option value="">Seleccionar...</option>
        <option value="Leves">Leves</option>
        <option value="Moderadas">Moderadas</option>
        <option value="Marcadas">Marcadas</option>
      </select>
    </div>
  );
}

if (servicio === 'Masaje mixto' && campo.includes('Dolor')) {
  return (
     <div key={index} className="campo-tecnico">
      <label>{campo}:</label>
      <select value={datosTecnica[campo] || ''} onChange={(e) => handleInputChange(campo, e.target.value)}>
        <option value="">Seleccionar...</option>
        <option value="Sí">Sí</option>
        <option value="No">No</option>
      </select>
    </div>
  );
}


if (servicio === 'Masaje mixto' && campo.includes('Estrías')) {
  return (
    <div key={index} className="campo-tecnico">
      <label>{campo}:</label>
      <select value={datosTecnica[campo] || ''} onChange={(e) => handleInputChange(campo, e.target.value)}>
        <option value="">Seleccionar...</option>
        <option value="Leves">Leves</option>
        <option value="Moderadas">Moderadas</option>
        <option value="Marcadas">Marcadas</option>
      </select>
    </div>
  );
}

if (servicio === 'Masaje mixto' && campo.includes('Celulitis')) {
  return (
   <div key={index} className="campo-tecnico">
      <label>{campo}:</label>
      <select value={datosTecnica[campo] || ''} onChange={(e) => handleInputChange(campo, e.target.value)}>
        <option value="">Seleccionar...</option>
        <option value="Leves">Leves</option>
        <option value="Moderadas">Moderadas</option>
        <option value="Marcadas">Marcadas</option>
      </select>
    </div>
  );
}

if (servicio === 'Masaje mixto' && campo.includes('Flacidez')) {
  return (
 <div key={index} className="campo-tecnico">
      <label>{campo}:</label>
      <select value={datosTecnica[campo] || ''} onChange={(e) => handleInputChange(campo, e.target.value)}>
        <option value="">Seleccionar...</option>
        <option value="Leves">Leves</option>
        <option value="Moderadas">Moderadas</option>
        <option value="Marcadas">Marcadas</option>
      </select>
    </div>
  );
}

if (servicio === 'Masaje mixto' && campo.includes('Retención')) {
  return (
     <div key={index} className="campo-tecnico">
      <label>{campo}:</label>
      <select value={datosTecnica[campo] || ''} onChange={(e) => handleInputChange(campo, e.target.value)}>
        <option value="">Seleccionar...</option>
        <option value="Leves">Leves</option>
        <option value="Moderadas">Moderadas</option>
        <option value="Marcadas">Marcadas</option>
      </select>
    </div>
  );
}







// 📏 Grosor cejas
if (servicio === 'Laminado de cejas' && campo.includes('Forma cejas inicial')) {
  return (
    <div key={index} className="campo-tecnico">
      <label>{campo}:</label>
      <select
        value={datosTecnica[campo] || ''}
        onChange={(e) => handleInputChange(campo, e.target.value)}
      >
        <option value="">Seleccionar...</option>
        <option value="Rectas">Rectas</option>
        <option value="Caídas">Caídas</option>
        <option value="Asimétricas">Asimétricas</option>
        <option value="Pobladas">Pobladas</option>
        <option value="Poco pobladas">Poco pobladas</option>
      </select>
    </div>
  );
}

// ⏱️ Paso 1 Loción (min)
if (servicio === 'Laminado de cejas' && campo.includes('Paso 1 Loción (min)')) {
  return (
    <div key={index} className="campo-tecnico">
      <label>{campo}:</label>

      <input
        type="number"
        placeholder="Escribir minutos"
        value={datosTecnica[campo] || ''}
        onChange={(e) => handleInputChange(campo, e.target.value)}
      />
    </div>
  );
}

// ⏱️ Paso 2 Fix (min)
if (servicio === 'Laminado de cejas' && campo.includes('Paso 2 Fix (min)')) {
  return (
    <div key={index} className="campo-tecnico">
      <label>{campo}:</label>

      <input
        type="number"
        placeholder="Escribir minutos"
        value={datosTecnica[campo] || ''}
        onChange={(e) => handleInputChange(campo, e.target.value)}
      />
    </div>
  );
}

// 🎯 Paso 1 Loción
if (servicio === 'Laminado de cejas' && campo.includes('Paso 1 Loción')) {
  return (
    <div key={index} className="campo-tecnico">
      <label>{campo}:</label>

      <select
        value={datosTecnica[campo] || ''}
        onChange={(e) => handleInputChange(campo, e.target.value)}
      >
        <option value="">Seleccionar...</option>
        <option value="Maximova">Maximova</option>
        <option value="DLUX">DLUX</option>
        <option value="BEAUTYWAVE">BEAUTYWAVE</option>
      </select>
    </div>
  );
}





// 🔒 Paso 2 Fix
if (servicio === 'Laminado de cejas' && campo.includes('Paso 2 Fix')) {
  return (
    <div key={index} className="campo-tecnico">
      <label>{campo}:</label>

      <select
        value={datosTecnica[campo] || ''}
        onChange={(e) => handleInputChange(campo, e.target.value)}
      >
        <option value="">Seleccionar...</option>
        <option value="Maximova">Maximova</option>
        <option value="DLUX">DLUX</option>
        <option value="BEAUTYWAVE">BEAUTYWAVE</option>
      </select>
    </div>
  );
}







 if (servicio === 'Laminado de cejas' && campo.includes('Estado post-tratamiento')) {
  return (
    <div key={index} className="campo-tecnico">
      <label>{campo}:</label>
      <select
        value={datosTecnica[campo] || ''}
        onChange={(e) => handleInputChange(campo, e.target.value)}
      >
        <option value="">Seleccionar...</option>
        <option value="Sano">Sano</option>
        <option value="Leve irritación">Leve irritación</option>
        <option value="Rojez">Rojez</option>
        <option value="Requiere cuidado">Requiere cuidado</option>
      </select>
    </div>
  );
}

// 🎨 Tinte usado
if (servicio === 'Laminado de cejas' && campo.includes('Tinte usado')) {
  return (
    <div key={index} className="campo-tecnico">
      <label>{campo}:</label>

      <select
        value={datosTecnica[campo] || ''}
        onChange={(e) => handleInputChange(campo, e.target.value)}
      >
        <option value="">Seleccionar...</option>
        <option value="Sí">Sí</option>
        <option value="No">No</option>
      </select>
    </div>
  );
}

// ✍️ Forma final
if (servicio === 'Laminado de cejas' && campo.includes('Forma final')) {
  return (
    <div key={index} className="campo-tecnico">
      <label>{campo}:</label>

      <input
        type="text"
        placeholder="Ej: Natural / Definida / Laminada"
        value={datosTecnica[campo] || ''}
        onChange={(e) => handleInputChange(campo, e.target.value)}
      />
    </div>
  );
}


    // INPUT DEFAULT
    return (
      <div key={index} className="campo-tecnico">
        <label>{campo}:</label>

        <input
          value={datosTecnica[campo] || ''}
          onChange={(e) => handleInputChange(campo, e.target.value)}
        />
      </div>
    );

  })}
</div>

    <button onClick={guardarFichaTecnica}>
      💾 Guardar
    </button>

  </div>
);
}


  function FichaCompleta({ clientas, setClientas }) {
  const navigate = useNavigate();
  const clienta = JSON.parse(localStorage.getItem('clientaSeleccionada') || 'null');

    const sesionesHydrogloss = clienta?.historial?.filter(
    h => h.servicio === "Hydrogloss"
  ).length || 0;

  const sesionActualHydro = sesionesHydrogloss + 1;

 useEffect(() => {
  if (!clienta) {
    navigate('/clientas');
  }
}, [clienta, navigate]);

if (!clienta) return null;

  const entregarTarjeta = async (cantidad) => {
    const clientaActualizada = {
      ...clienta,
      tarjetasEntregadas: cantidad
    };
    
    const nuevasClientas = clientas.map(c => 
      c.id === clienta.id ? clientaActualizada : c
    );
    
    await saveData('clientas', nuevasClientas);
    setClientas(nuevasClientas);
    
    alert(`✅ Timbradas ${cantidad} tarjetas a ${clienta.nombre}!`);
  };

  const resetTarjeta = async () => {
  if (confirm(`🎁 ${clienta.nombre} completó su tarjeta!\n\n¿Empezar NUEVA tarjeta?`)) {
    const clientaActualizada = {
      ...clienta,
      tarjetasEntregadas: 0
    };
    
    const nuevasClientas = clientas.map(c => 
      c.id === clienta.id ? clientaActualizada : c
    );
    
    await saveData('clientas', nuevasClientas);
    setClientas(nuevasClientas);
    
    alert(`✅ ¡Nueva tarjeta para ${clienta.nombre}! ✨`);
  }
};


  return (
    <div className="seccion">
      <Link to="/clientas" className="volver">← Ver Clientas</Link>
      <h2>📋 Ficha Completa: {clienta.nombre}</h2>

      {/* DATOS BÁSICOS */}
      <h3 className="seccion-titulo">👤 Datos Básicos</h3>
      <div className="form-grid-basico">
        <div className="info-field">
          <div className="telefono-linea">
  <strong>Teléfono:</strong> {clienta.telefono || clienta.whatsapp || 'No registrado'}
  {clienta.telefono || clienta.whatsapp ? (
    <QRWhatsapp telefono={clienta.telefono || clienta.whatsapp} />
  ) : null}
</div>

        </div>
        <div className="info-field">
          <strong>Fecha Nacimiento:</strong> {clienta.fechaNacimiento || 'No registrada'}
        </div>
      </div>

      {/* ALERTAS CRÍTICAS ROJAS */}
      <h3 className="seccion-titulo">🚨 ALERTAS MÉDICAS</h3>
      <div className="alertas-grid">
        {clienta.embarazo && <span className="alerta critica">🤰 EMBARAZO/LACTANCIA</span>}
        {clienta.lentesContacto && <span className="alerta critica">👓 LENTES CONTACTO</span>}
        {clienta.varices && <span className="alerta critica">🚫 VARICES</span>}
        {!clienta.embarazo && !clienta.lentesContacto && !clienta.varices && 
          <span className="alerta verde">✅ Sin contraindicaciones</span>}
      </div>

      {/* DETALLES MÉDICOS */}
      {clienta.tieneAlergias && (
        <div className="campo-condicional">
          <h4>⚠️ ALERGIAS:</h4>
          <p>{clienta.alergias}</p>
        </div>
      )}
      
      {clienta.tieneEnfermedades && (
        <div className="campo-condicional">
          <h4>🏥 ENFERMEDADES:</h4>
          <p>{clienta.enfermedades}</p>
        </div>
      )}
      
      {clienta.tomaMedicamentos && (
        <div className="campo-condicional">
          <h4>💊 MEDICAMENTOS:</h4>
          <p>{clienta.medicamentos}</p>
        </div>
      )}

    
{/* ⭐ TARJETA DE 4 CÍRCULOS */}
<h3 className="seccion-titulo">⭐ TARJETA DIGITAL FIDELIDAD</h3>
<div className="tarjeta-fidelidad">
  <div className="logo-tarjeta">JENNI ESTÉTICA ✨</div>
  <div className="circulos-grid">
    {[1,2,3,4].map(num => {
      const es50porciento = num === 4 && clienta.tarjetasEntregadas === 3;
      const estaTimbrada = clienta.tarjetasEntregadas >= num;
      return (
        <div 
          key={num}
          className={`circulo ${estaTimbrada ? 'timbrado' : ''} ${es50porciento ? 'mitad' : ''}`}
          onClick={() => entregarTarjeta(num)}
        >
          {es50porciento ? '50%' : 
           estaTimbrada ? '⭐' : num}
        </div>
      );
    })}
  </div>
  <div className="premio">🎁 ¡4 servicios = 1 DESCUENTO! 🎁</div>
  
  {/* ⭐ BOTÓN RESET NUEVA TARJETA */}
  {clienta.tarjetasEntregadas === 4 && (
    <button 
      className="btn-reset-tarjeta"
      onClick={() => resetTarjeta()}
    >
      🔄 Nueva Tarjeta
    </button>
  )}
</div>

{/* 👇 AQUÍ VA TU BLOQUE NUEVO */}
{clienta.historial?.some(h => h.servicio === "Hydrogloss") && (
  <div className="info-hydrogloss">
    <p>📊 Sesión actual Hydrogloss: <strong>{sesionActualHydro}</strong></p>
    <p>📈 Sesiones realizadas: <strong>{sesionesHydrogloss}</strong></p>
  </div>
)}


      
            {/* HISTORIAL SERVICIOS */}
<h3 className="seccion-titulo">📋 Historial Servicios ({clienta.historial?.length || 0})</h3>
<div className="historial-servicios">
  {clienta.historial?.length > 0 ? (
    clienta.historial.map((servicio, index) => (
      <div 
        key={index} 
        className="servicio-historial clickable card-hover"
        onClick={() => {
          localStorage.setItem('clientaParaServicios', JSON.stringify(clienta));  // ✅

          localStorage.setItem('servicioSeleccionado', servicio.servicio);
          localStorage.setItem('fichaTecnicaIndex', index);
          navigate('/ficha-tecnica');
        }}
      >
        <div 
          className="icono-basurero"
          onClick={async (e) => {
            e.stopPropagation();
            if (confirm(`🗑️ ¿Eliminar ${servicio.servicio} de historial?`)) {
              const nuevoHistorial = clienta.historial.filter((_, i) => i !== index);
              const clientaActualizada = {...clienta, historial: nuevoHistorial};
              const nuevasClientas = clientas.map(c => 
                c.id === clienta.id ? clientaActualizada : c
              );
              await saveData('clientas', nuevasClientas);
              setClientas(nuevasClientas);
            }
          }}
        >🗑️</div>
        <div>
          <strong>💅 {servicio.servicio}</strong> 
          <small style={{color: '#888', display: 'block'}}>{servicio.fecha}</small>
        </div>
        {servicio.tecnica && <span className="badge-tecnica">📋 Ver Detalles</span>}
      </div>
    ))
  ) : (
    <p style={{textAlign: 'center', color: '#8B7355'}}>✨ Sin servicios realizados aún</p>
  )}
</div>


<button 
  onClick={() => {
   localStorage.setItem('clientaParaServicios', JSON.stringify(clienta));  // ✅

    navigate('/servicios');
  }} 
  className="btn-nuevo-servicio"
  style={{maxWidth: '300px', marginBottom: '1rem'}}
>
  ➕ Nuevo Servicio para {clienta.nombre}
</button>


    {/* SEGUIR CON EL BOTÓN AGENDAR */}
<div style={{textAlign: 'center', marginTop: '2rem'}}>
  <button 
    onClick={() => {
      localStorage.setItem('clientaParaAgendar', JSON.stringify(clienta));
      navigate('/agendar');
    }} 
    className="btn-agendar" 
    style={{maxWidth: '300px'}}
  >
    📅 Agendar cita para {clienta.nombre}
  </button>
    </div>
  </div>   

);       

}        


function SeleccionarServicio({ clientas }) {
  const navigate = useNavigate();
  const [clienta, setClienta] = useState(null);

useEffect(() => {
  const data = JSON.parse(localStorage.getItem('clientaParaServicios') || 'null');

  if (!data) {
    navigate('/clientas');
    return;
  }

  setClienta(data);
}, []);

if (!clienta) {
  return <div style={{textAlign:'center'}}>Cargando servicios...</div>;
}

 const SERVICIOS = Object.keys(plantillas || {});

  return (
    <div className="seccion">
      <Link to="/ficha-completa" className="volver">← Ficha Completa</Link>
      <h2>💅 Fichas Técnicas: {clienta.nombre}</h2>

      <div className="grid-servicios-tecnica">
        {SERVICIOS.map((servicio, index) => (
          <div 
            key={index}
            className="servicio-card-tecnica"
            onClick={() => {
              localStorage.setItem('servicioSeleccionado', servicio);
              navigate('/ficha-tecnica');
            }}
          >
            <div className="servicio-icono grande">
              {plantillas[servicio]?.icon || '✨'}
            </div>
            <h3>{servicio}</h3>
            <p>{plantillas[servicio]?.length || 0} campos técnicos</p>
          </div>
        ))}
      </div>
    </div>
  );
}

