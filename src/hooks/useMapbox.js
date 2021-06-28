import { useCallback, useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { v4 } from 'uuid';
import { Subject } from 'rxjs';



// TODO: Cambiar API Key
mapboxgl.accessToken = 'pk.eyJ1IjoicGV0ZXJhcmF5YSIsImEiOiJja3FiaTZ3OTgwMHNmMnVuNzV2cXgwN2l3In0.lGlFE1grWl8iWHP-WwMcMA';

export const useMapbox = (puntoInicial) => {
  // Refrencia al div del mapa
  const mapaDiv = useRef();
  const setRef  = useCallback((node)=>{
    mapaDiv.current = node;
  },[])

  // const [ mapa,setMapa] = useState();

  // Referencia los marcadores
  const marcadores = useRef({});

  // Observables de Rxjs
  const movimientoMarcador = useRef(new Subject());
  const nuevoMarcador = useRef( new Subject() );

  // Mapas y coords
  const mapa = useRef();
  const [coords, setCoords] = useState(puntoInicial);

  // console.log(coords)
  // console.log(setRef)

  // Función para agregar marcadores -  no puede ser una función tradicional ya que nos puede crear un monton de listener del mapa
  const agregarMarcador  = useCallback( (ev, id ) => {
      const { lng, lat } = ev.lngLat || ev;

      // nuevo marcador
      const marker = new mapboxgl.Marker();

      // le asignaremos un id unico al marcador para saber cual mover
      marker.id = id ?? v4(); // si el marcador no tiene id usa un uuid
      // coordernadas del marker
      marker
        .setLngLat([lng, lat])
        .addTo(mapa.current)
        .setDraggable(true);

      marcadores.current[marker.id] = marker;

      // si el marcador tiene id no emitir
      if ( !id ) {
        nuevoMarcador.current.next({
          id: marker.id,
          lng,
          lat
        });
        
      }
      // escuchar movimientos del marcador
      marker.on('drag', ({target}) =>{
          
          const { id } = target;
          const { lng, lat }= target.getLngLat();
    
         // TODO: emitir los cambios del marcador 
        movimientoMarcador.current.next({
          id,
          lng,
          lat
        });
      });

    },[]);


    // Función para actualizar la ubicación del marcador

    const actualizarPosicion = useCallback(({id, lng, lat }) => {
     
      marcadores.current[id].setLngLat([lng,lat]);

      },[])


  useEffect(() => {

    const map = new mapboxgl.Map({
      container: mapaDiv.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [puntoInicial.lng, puntoInicial.lat],
      zoom: puntoInicial.zoom
    });

    // setMapa(map);
    mapa.current = map;

  }, [puntoInicial]);

  // cuando se mueve el mapa
  useEffect(() => {

    mapa.current?.on('move', () => {

      const { lng, lat } = mapa.current.getCenter();

      setCoords({
        lng: lng.toFixed(4),
        lat: lat.toFixed(4),
        zoom: mapa.current.getZoom().toFixed(2),
      })

    });

  }, []);

  // agregar marcadores cuando hago click
  useEffect(() => {
    mapa.current?.on('click', agregarMarcador ); // le pasamos el unico argumento del evento a esta función
  }, [agregarMarcador]);


  return (
        {
          actualizarPosicion,
          agregarMarcador,
          coords,
          nuevoMarcador$     : nuevoMarcador.current,
          movimientoMarcador$: movimientoMarcador.current,
          marcadores,
          setRef
        }
  )
}
