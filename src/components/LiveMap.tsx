'use client'

import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useMemo } from 'react'

// Fix for default Leaflet icons safely
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  })
}

// Custom Uber-like dark theme marker
const customIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/5717/5717498.png', 
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
})

const driverIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png', 
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
})

function MapController({ center, destination, driver }: { 
    center: [number, number], 
    destination?: [number, number] | null,
    driver?: [number, number] | null
}) {
  const map = useMap()
  useEffect(() => {
    const points: [number, number][] = [center]
    if (destination) points.push(destination)
    if (driver) points.push(driver)
    
    if (points.length > 1) {
      const bounds = L.latLngBounds(points)
      map.fitBounds(bounds, { padding: [80, 80] })
    } else {
      map.setView(center, 15)
    }
  }, [center, destination, driver, map])
  return null
}

interface LiveMapProps {
  currentLocation: { lat: number; lng: number } | null
  destinationLocation?: { lat: number; lng: number } | null
  driverLocation?: { lat: number; lng: number } | null
  driverIconUrl?: string | null
}

export default function LiveMap({ currentLocation, destinationLocation, driverLocation, driverIconUrl }: LiveMapProps) {
  const [mounted, setMounted] = useState(false);
  const [routeData, setRouteData] = useState<[number, number][]>([])
  const [driverToRiderRoute, setDriverToRiderRoute] = useState<[number, number][]>([])

  const memoizedDriverIcon = useMemo(() => new L.Icon({
    iconUrl: driverIconUrl || 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png', 
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
  }), [driverIconUrl]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch route between pickup and destination
  useEffect(() => {
    if (!currentLocation || !destinationLocation) {
        setRouteData([]);
        return;
    }

    const fetchRoute = async () => {
        try {
            const url = `https://router.project-osrm.org/route/v1/driving/${currentLocation.lng},${currentLocation.lat};${destinationLocation.lng},${destinationLocation.lat}?overview=full&geometries=geojson`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.routes && data.routes[0]) {
                const coords = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
                setRouteData(coords);
            }
        } catch (err) {
            console.error("Routing error:", err);
        }
    };

    fetchRoute();
  }, [currentLocation?.lat, currentLocation?.lng, destinationLocation?.lat, destinationLocation?.lng]);

  // Fetch route between Driver and Pickup
  useEffect(() => {
    if (!driverLocation || !currentLocation) {
        setDriverToRiderRoute([]);
        return;
    }

    const fetchDriverRoute = async () => {
        try {
            const url = `https://router.project-osrm.org/route/v1/driving/${driverLocation.lng},${driverLocation.lat};${currentLocation.lng},${currentLocation.lat}?overview=full&geometries=geojson`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.routes && data.routes[0]) {
                const coords = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
                setDriverToRiderRoute(coords);
            }
        } catch (err) {
            console.error("Driver Routing error:", err);
        }
    };

    fetchDriverRoute();
  }, [driverLocation?.lat, driverLocation?.lng, currentLocation?.lat, currentLocation?.lng]);

  // Default fallback to center of Delhi, India if no location
  const defaultCenter: [number, number] = [28.6139, 77.2090]
  
  const mapCenter: [number, number] = currentLocation 
    ? [currentLocation.lat, currentLocation.lng] 
    : defaultCenter

  const destCoords: [number, number] | null = destinationLocation
    ? [destinationLocation.lat, destinationLocation.lng]
    : null

  const driverCoords: [number, number] | null = driverLocation
    ? [driverLocation.lat, driverLocation.lng]
    : null

  if (!mounted) {
    return (
      <div className="w-full h-full relative z-0 shadow-inner rounded-3xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-black animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-full relative z-0 shadow-inner rounded-3xl overflow-hidden border border-gray-200">
      <MapContainer 
        center={mapCenter} 
        zoom={14} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" // Modern clear map tiles
        />
        
        {currentLocation && (
          <Marker position={[currentLocation.lat, currentLocation.lng]} icon={customIcon}>
            <Popup>
              <div className="font-bold text-center">Your Current Location</div>
            </Popup>
          </Marker>
        )}

        {destinationLocation && (
          <Marker position={[destinationLocation.lat, destinationLocation.lng]}>
             <Popup>
              <div className="font-bold text-center text-black">Destination</div>
            </Popup>
          </Marker>
        )}

        {/* Main Trip Path (Pickup -> Destination) */}
        {routeData.length > 0 && (
            <Polyline 
                positions={routeData} 
                pathOptions={{ 
                    color: '#3B82F6', 
                    weight: 5, 
                    opacity: 0.8,
                    lineJoin: 'round'
                }} 
            />
        )}

        {/* Driver Approach Path (Driver -> Pickup) */}
        {driverToRiderRoute.length > 0 && (
            <Polyline 
                positions={driverToRiderRoute} 
                pathOptions={{ 
                    color: '#000000', 
                    weight: 3, 
                    opacity: 0.4,
                    dashArray: '10, 10',
                    lineJoin: 'round'
                }} 
            />
        )}

        {driverLocation && (
          <Marker 
            position={[driverLocation.lat, driverLocation.lng]} 
            icon={memoizedDriverIcon}
          >
             <Popup>
              <div className="font-bold text-center text-black">Your Partner</div>
            </Popup>
          </Marker>
        )}

        <MapController center={mapCenter} destination={destCoords} driver={driverCoords} />
      </MapContainer>

      {/* Overlay gradient to mimic Uber map fade */}
      <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white/40 to-transparent pointer-events-none z-[1000]" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white/40 to-transparent pointer-events-none z-[1000]" />
    </div>
  )
}
