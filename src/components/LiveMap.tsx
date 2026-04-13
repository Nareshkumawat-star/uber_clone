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
  isPartnerWaitingForOTP?: boolean
}

export default function LiveMap({ currentLocation, destinationLocation, driverLocation, driverIconUrl, rideRequestLocation, isPartnerWaitingForOTP }: LiveMapProps) {
  const [mounted, setMounted] = useState(false)
  const [routeData, setRouteData] = useState<[number, number][]>([])
  const [driverToRiderRoute, setDriverToRiderRoute] = useState<[number, number][]>([])

  useEffect(() => { setMounted(true) }, [])

  const icons = useMemo(() => ({
    blueDot: createBlueDotIcon(),
    departure: createDepartureIcon(),
    destSquare: createDestinationSquareIcon(),
    request: createRequestIcon(),
    driver: createDriverIcon(driverIconUrl || null)
  }), [driverIconUrl])

  // Route calculation utility
  const fetchRoute = async (start: any, end: any, setter: any) => {
    if (!start || !end) { setter([]); return; }
    try {
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`)
        const data = await res.json()
        if (data.routes?.[0]) {
            setter(data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]))
        }
    } catch (err) {}
  }

  useEffect(() => { fetchRoute(currentLocation, destinationLocation, setRouteData) }, [currentLocation?.lat, destinationLocation?.lat])
  useEffect(() => { fetchRoute(driverLocation, currentLocation, setDriverToRiderRoute) }, [driverLocation?.lat, currentLocation?.lat])

  if (!mounted) return <div className="w-full h-full bg-gray-50 flex items-center justify-center animate-pulse rounded-3xl" />

  const mapCenter: [number, number] = currentLocation ? [currentLocation.lat, currentLocation.lng] : [28.6139, 77.2090]
  const destCoords: [number, number] | null = destinationLocation ? [destinationLocation.lat, destinationLocation.lng] : null
  const driverCoords: [number, number] | null = driverLocation ? [driverLocation.lat, driverLocation.lng] : null
  const requestCoords: [number, number] | null = rideRequestLocation ? [rideRequestLocation.lat, rideRequestLocation.lng] : null

  return (
    <div className="w-full h-full relative z-0 shadow-inner rounded-3xl overflow-hidden border border-gray-200">
      <MapContainer center={mapCenter} zoom={14} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        
        {currentLocation && <Marker position={[currentLocation.lat, currentLocation.lng]} icon={icons.blueDot} />}
        {rideRequestLocation && <Marker position={[rideRequestLocation.lat, rideRequestLocation.lng]} icon={isPartnerWaitingForOTP ? icons.departure : icons.request} />}
        {destinationLocation && !isPartnerWaitingForOTP && <Marker position={[destinationLocation.lat, destinationLocation.lng]} icon={icons.destSquare} />}
        {driverLocation && <Marker position={[driverLocation.lat, driverLocation.lng]} icon={icons.driver} />}

        {routeData.length > 0 && <Polyline positions={routeData} pathOptions={{ color: '#3B82F6', weight: 5, opacity: 0.8 }} />}
        {driverToRiderRoute.length > 0 && <Polyline positions={driverToRiderRoute} pathOptions={{ color: '#000000', weight: 3, opacity: 0.4, dashArray: '10, 10' }} />}

        <MapController center={mapCenter} destination={destCoords} driver={driverCoords} request={requestCoords} />
      </MapContainer>
      <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-black/5 to-transparent pointer-events-none" />
    </div>
  )
}
