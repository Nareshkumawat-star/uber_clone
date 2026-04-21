'use client'
import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'

// Fix for default marker icons in Leaflet with Next.js
const pickupIcon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="background: black; color: white; padding: 4px 10px; border-radius: 10px; font-size: 8px; font-weight: 900; white-space: nowrap; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); position: relative; bottom: 25px; left: -50%;">PICKUP<div style="position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid black;"></div></div><div style="width: 8px; height: 8px; background: black; border-radius: 50%; border: 2px solid white;"></div>`,
    iconSize: [0, 0],
})

const dropIcon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="background: black; color: white; padding: 4px 10px; border-radius: 10px; font-size: 8px; font-weight: 900; white-space: nowrap; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); position: relative; bottom: 25px; left: -50%;">DROP<div style="position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid black;"></div></div><div style="width: 8px; height: 8px; background: black; border-radius: 50%; border: 2px solid white; transform: rotate(45deg);"></div>`,
    iconSize: [0, 0],
})

const driverIcon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="background: black; padding: 8px; border-radius: 12px; border: 2px solid white; box-shadow: 0 10px 20px rgba(0,0,0,0.2); animation: pulse 2s infinite;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1-3-4-3-4 3-4 3H3c-1.1 0-2 .9-2 2v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg></div>`,
    iconSize: [0, 0],
})

// Component to auto-fit map bounds
function ChangeView({ bounds }: { bounds: L.LatLngBoundsExpression }) {
    const map = useMap()
    useEffect(() => {
        if (bounds) map.fitBounds(bounds, { padding: [50, 50] })
    }, [bounds, map])
    return null
}

interface RouteMapProps {
    pickup: [number, number]
    drop: [number, number]
    driver?: [number, number] | null
}

export default function RouteMap({ pickup, drop, driver }: RouteMapProps) {
    const [route, setRoute] = useState<[number, number][]>([])

    useEffect(() => {
        if (!pickup || !drop) return

        const fetchRoute = async () => {
            try {
                // Fetch route from OSRM
                const url = `https://router.project-osrm.org/route/v1/driving/${pickup[1]},${pickup[0]};${drop[1]},${drop[0]}?overview=full&geometries=geojson`
                const response = await fetch(url)
                const data = await response.json()
                
                if (data.routes && data.routes[0]) {
                    const coords = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]])
                    setRoute(coords)
                } else {
                    // Fallback to straight line
                    setRoute([pickup, drop])
                }
            } catch (err) {
                console.error("Routing error:", err)
                setRoute([pickup, drop])
            }
        }

        fetchRoute()
    }, [pickup, drop])

    const safePickup: [number, number] = (pickup && !isNaN(pickup[0]) && !isNaN(pickup[1])) ? pickup : [28.6139, 77.2090]
    const safeDrop: [number, number] = (drop && !isNaN(drop[0]) && !isNaN(drop[1])) ? drop : [28.6139, 77.2090]
    
    // Include driver in bounds if exists
    const bounds: L.LatLngBoundsExpression = driver ? [safePickup, safeDrop, driver] : [safePickup, safeDrop]

    return (
        <div className="w-full h-full relative" style={{ minHeight: '300px' }}>
            <MapContainer 
                center={safePickup} 
                zoom={13} 
                style={{ height: '100%', width: '100%', background: '#f5f5f5' }}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />
                
                {route.length > 1 && (
                    <Polyline 
                        positions={route} 
                        color="black" 
                        weight={3} 
                        opacity={0.8}
                    />
                )}
                
                <Marker position={safePickup} icon={pickupIcon} />
                <Marker position={safeDrop} icon={dropIcon} />
                {driver && <Marker position={driver} icon={driverIcon} />}
                
                <ChangeView bounds={bounds} />
            </MapContainer>

            {/* Custom Marker styles */}
            <style jsx global>{`
                .custom-marker {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000 !important;
                }
            `}</style>
        </div>
    )
}
