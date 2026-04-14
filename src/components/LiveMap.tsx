'use client'
import React, { useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { createBlueDotIcon, createDepartureIcon, createDestinationSquareIcon, createRequestIcon, createDriverIcon } from './MapIcons'

if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  })
}

function MapController({ center, destination, driver, request }: any) {
  const map = useMap()
  useEffect(() => {
    const points: [number, number][] = [center]
    if (destination) points.push(destination)
    if (driver) points.push(driver)
    if (request) points.push(request)
    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [80, 80] })
    } else {
      map.setView(center, 15)
    }
  }, [center, destination, driver, request, map])
  return null
}

interface LiveMapProps {
  currentLocation: { lat: number; lng: number } | null
  destinationLocation?: { lat: number; lng: number } | null
  driverLocation?: { lat: number; lng: number } | null
  driverIconUrl?: string | null
  rideRequestLocation?: { lat: number; lng: number } | null
  hideDestinationInfo?: boolean
}

export default function LiveMap({ currentLocation, destinationLocation, driverLocation, driverIconUrl, rideRequestLocation, hideDestinationInfo }: LiveMapProps) {
  const [mounted, setMounted] = useState(false)
  const [hasLayout, setHasLayout] = useState(false)
  const [routeData, setRouteData] = useState<[number, number][]>([])
  const [driverToRiderRoute, setDriverToRiderRoute] = useState<[number, number][]>([])

  useEffect(() => { 
    setMounted(true);
    const timer = setTimeout(() => setHasLayout(true), 200);
    return () => clearTimeout(timer);
  }, [])

  const icons = useMemo(() => ({
    blueDot: createBlueDotIcon(),
    departure: createDepartureIcon(),
    destSquare: createDestinationSquareIcon(),
    request: createRequestIcon(),
    driver: createDriverIcon(driverIconUrl || null)
  }), [driverIconUrl])

  // Route calculation utility
  const fetchRoute = async (start: any, end: any, setter: any) => {
    if (!start?.lat || !end?.lat) { setter([]); return; }
    try {
        // Using a more stable mirror (OpenStreetMap.de) instead of the OSRM demo server
        const mirrorUrl = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
        const res = await fetch(mirrorUrl);
        const data = await res.json();
        
        if (data.routes?.[0]) {
            setter(data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]))
        } else {
            // Secondary fallback mirror if the first one fails
            const backupUrl = `https://router.project-osrm.org/osrm/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
            const backupRes = await fetch(backupUrl);
            const backupData = await backupRes.json();
            if (backupData.routes?.[0]) {
                setter(backupData.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]))
            } else {
                setter([]);
            }
        }
    } catch (err) {
        console.error("Routing error:", err);
        setter([]);
    }
  }

  // Effect for Trip Route (Pickup to Destination)
  useEffect(() => { 
    if (rideRequestLocation && destinationLocation) {
        fetchRoute(rideRequestLocation, destinationLocation, setRouteData);
    } else if (currentLocation && destinationLocation) {
        fetchRoute(currentLocation, destinationLocation, setRouteData);
    } else {
        setRouteData([]);
    }
  }, [currentLocation?.lat, currentLocation?.lng, destinationLocation?.lat, destinationLocation?.lng, rideRequestLocation?.lat, rideRequestLocation?.lng])

  // Effect for Driver Route (Driver to Pickup/Rider)
  useEffect(() => { 
    if (driverLocation) {
        const nextTarget = rideRequestLocation || currentLocation;
        fetchRoute(driverLocation, nextTarget, setDriverToRiderRoute);
    } else {
        setDriverToRiderRoute([]);
    }
  }, [driverLocation?.lat, driverLocation?.lng, currentLocation?.lat, currentLocation?.lng, rideRequestLocation?.lat, rideRequestLocation?.lng])

  if (!mounted || !hasLayout) return (
    <div className="w-full h-full bg-white/5 flex items-center justify-center animate-pulse rounded-[3rem] border border-white/5">
        <div className="w-8 h-8 rounded-full border-4 border-white/10 border-t-white/30 animate-spin" />
    </div>
  );

  const mapCenter: [number, number] = currentLocation ? [currentLocation.lat, currentLocation.lng] : [28.6139, 77.2090]
  const destCoords: [number, number] | null = destinationLocation ? [destinationLocation.lat, destinationLocation.lng] : null
  const driverCoords: [number, number] | null = driverLocation ? [driverLocation.lat, driverLocation.lng] : null
  const requestCoords: [number, number] | null = rideRequestLocation ? [rideRequestLocation.lat, rideRequestLocation.lng] : null

  return (
    <div className="w-full h-full relative z-0 shadow-inner rounded-[3rem] overflow-hidden">
      <MapContainer 
        key={mounted ? 'map-active' : 'map-idle'}
        center={mapCenter} 
        zoom={14} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        
        {currentLocation && <Marker position={[currentLocation.lat, currentLocation.lng]} icon={icons.blueDot} />}
        {rideRequestLocation && <Marker position={[rideRequestLocation.lat, rideRequestLocation.lng]} icon={hideDestinationInfo ? icons.departure : icons.request} />}
        {destinationLocation && !hideDestinationInfo && <Marker position={[destinationLocation.lat, destinationLocation.lng]} icon={icons.destSquare} />}
        {driverLocation && <Marker position={[driverLocation.lat, driverLocation.lng]} icon={icons.driver} />}

        {/* Primary Trip Path (Blue) - Hidden if hideDestinationInfo is true */}
        {!hideDestinationInfo && (
          routeData.length > 0 ? (
            <Polyline positions={routeData} pathOptions={{ color: '#3B82F6', weight: 6, opacity: 0.8 }} />
          ) : (
            destinationLocation && (rideRequestLocation || currentLocation) && (
              <Polyline 
                positions={[
                  [rideRequestLocation?.lat || currentLocation!.lat, rideRequestLocation?.lng || currentLocation!.lng],
                  [destinationLocation.lat, destinationLocation.lng]
                ]} 
                pathOptions={{ color: '#3B82F6', weight: 4, opacity: 0.4, dashArray: '10, 10' }} 
              />
            )
          )
        )}

        {/* Secondary Driver Path (Black) */}
        {driverToRiderRoute.length > 0 ? (
          <Polyline positions={driverToRiderRoute} pathOptions={{ color: '#000000', weight: 4, opacity: 0.4, dashArray: '10, 10' }} />
        ) : (
          driverLocation && (rideRequestLocation || currentLocation) && (
            <Polyline 
              positions={[
                [driverLocation.lat, driverLocation.lng],
                [rideRequestLocation?.lat || currentLocation!.lat, rideRequestLocation?.lng || currentLocation!.lng]
              ]} 
              pathOptions={{ color: '#000000', weight: 2, opacity: 0.2, dashArray: '5, 5' }} 
            />
          )
        )}

        <MapController center={mapCenter} destination={hideDestinationInfo ? null : destCoords} driver={driverCoords} request={requestCoords} />
      </MapContainer>
      <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-black/5 to-transparent pointer-events-none" />
    </div>
  )
}
