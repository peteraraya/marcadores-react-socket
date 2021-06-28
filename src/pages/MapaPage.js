import React, { useContext, useEffect } from 'react';
import { SocketContext } from '../context/SocketContext';
import { useMapbox } from '../hooks/useMapbox';


// Posición inicial
const puntoInicial = {
  lng: -71.2647,
  lat: -32.8874,
  zoom: 10
}

export const MapaPage = () => {
  
  const { coords, setRef, nuevoMarcador$, movimientoMarcador$, agregarMarcador, actualizarPosicion } = useMapbox(puntoInicial);
  const { socket } = useContext( SocketContext );

  // Escuchar los marcadores existentes
  useEffect(() => {
    socket.on('marcadores-activos',  (marcadores) => {

      for (const key of Object.keys(marcadores)) {
          agregarMarcador(marcadores[key], key);
      }

      //agregarMarcador(marcador)
    });
  }, [agregarMarcador, socket]);


  // Subscribirse con useEffect - Nuevo marcador
  useEffect(() => {
   
    nuevoMarcador$.subscribe( marcador =>{
      // nuevo marcador emitir
      socket.emit('marcador-nuevo', marcador)
    });

  }, [nuevoMarcador$, socket])


  // Movimiento del marcador
  useEffect(() => {
    
    movimientoMarcador$.subscribe( marcador =>{
      socket.emit('marcador-actualizado', marcador)
    });

  }, [movimientoMarcador$, socket]);


  // Mover marcador mediante sockets
  useEffect(() => {
    
    socket.on('marcador-actualizado', (marcador) =>{
      actualizarPosicion( marcador );

    });

  }, [actualizarPosicion, socket])




  // Escuchar nuevos marcadores - que vienen del brodcast del backend
  useEffect(() => {
  
    socket.on('marcador-nuevo', (marcador) => {
      agregarMarcador( marcador, marcador.id)
    });

  }, [socket, agregarMarcador])


  return (
    <>
      <div className="info">
        Lng: { coords.lng } | lat: { coords.lat } | zoom { coords.zoom }
      </div>

      <div
        ref={ setRef }
        className="mapContainer"
      >
      </div>


    </>
  )
}


// cuando no necesito ejecutar muchas veces algo se recomienda useRef que un state