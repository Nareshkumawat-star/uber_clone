'use client'

import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

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

function MapController({ center, destination }: { center: [number, number], destination?: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (center && destination) {
      const bounds = L.latLngBounds([center, destination])
      map.fitBounds(bounds, { padding: [80, 80] })
    } else if (center) {
      map.setView(center, 15)
    }
  }, [center, destination, map])
  return null
}

interface LiveMapProps {
  currentLocation: { lat: number; lng: number } | null
  destinationLocation?: { lat: number; lng: number } | null
}

export default function LiveMap({ currentLocation, destinationLocation }: LiveMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Default fallback to center of Delhi, India if no location
  const defaultCenter: [number, number] = [28.6139, 77.2090]
  
  const mapCenter: [number, number] = currentLocation 
    ? [currentLocation.lat, currentLocation.lng] 
    : defaultCenter

  const destCoords: [number, number] | null = destinationLocation
    ? [destinationLocation.lat, destinationLocation.lng]
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

        <MapController center={mapCenter} destination={destCoords} />
      </MapContainer>

      {/* Overlay gradient to mimic Uber map fade */}
      <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white/40 to-transparent pointer-events-none z-[1000]" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white/40 to-transparent pointer-events-none z-[1000]" />
    </div>
  )
}
