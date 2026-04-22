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

// Component to fix Leaflet size issues
function MapInvalidator() {
    const map = useMap()
    useEffect(() => {
        setTimeout(() => {
            map.invalidateSize()
        }, 100)
    }, [map])
    return null
}

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
    stage?: string
    pickupName?: string
    dropName?: string
}

export default function RouteMap({ pickup, drop, driver, stage, pickupName, dropName }: RouteMapProps) {
    const [route, setRoute] = useState<[number, number][]>([])

    useEffect(() => {
        if (!pickup || !drop) return

        const fetchRoute = async () => {
            try {
                let start = pickup;
                let end = drop;

                if (stage === 'ARRIVING' && driver) {
                    start = driver;
                    end = pickup;
                } else if (stage === 'ON_TRIP') {
                    start = pickup;
                    end = drop;
                }

                // Prevent zero-length route requests
                if (start[0] === end[0] && start[1] === end[1]) return

                // Truncate to avoid URI issues and rate limit sensitivity
                const pLat = parseFloat(start[0].toFixed(6))
                const pLon = parseFloat(start[1].toFixed(6))
                const dLat = parseFloat(end[0].toFixed(6))
                const dLon = parseFloat(end[1].toFixed(6))

                // Fetch route through local proxy
                const url = `/api/location/proxy?type=route&path=${pLon},${pLat};${dLon},${dLat}`
                await new Promise(resolve => setTimeout(resolve, 300));
                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'application/json',
                        'Accept-Language': 'en-US,en;q=0.9',
                    },
                });
                const data = await response.json()
                
                if (data && data.routes && data.routes[0] && data.routes[0].geometry) {
                    const coords = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]])
                    if (coords.length > 0) {
                        setRoute(coords)
                        return
                    }
                }
                
                // Final fallback only if no data
                setRoute([pickup, drop])
            } catch (err) {
                console.error("Routing error:", err)
                setRoute([pickup, drop])
            }
        }

        fetchRoute()
    }, [pickup, drop])

    const safePickup: [number, number] = (pickup && !isNaN(pickup[0]) && !isNaN(pickup[1])) ? pickup : [28.6139, 77.2090]
    const safeDrop: [number, number] = (drop && !isNaN(drop[0]) && !isNaN(drop[1])) ? drop : [28.6139, 77.2090]
    
    // Dynamic bounds based on stage
    let relevantPoints: [number, number][] = [safePickup]
    if (stage === 'ARRIVING' && driver) {
        relevantPoints = [driver, safePickup]
    } else if (stage === 'ON_TRIP') {
        relevantPoints = [safePickup, safeDrop]
        if (driver) relevantPoints.push(driver)
    } else {
        // Fallback for searching or other states
        if (driver) relevantPoints.push(driver)
        relevantPoints.push(safeDrop)
    }

    const bounds: L.LatLngBoundsExpression = relevantPoints

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
                
                <MapInvalidator />
                
                {route.length > 1 && (
                    <>
                        {/* Outer Glow/Border for the route */}
                        <Polyline 
                            positions={route} 
                            color="rgba(0,0,0,0.1)" 
                            weight={10} 
                        />
                        {/* Main Premium Route Line */}
                        <Polyline 
                            positions={route} 
                            color="black" 
                            weight={4} 
                            opacity={1}
                            lineCap="round"
                            lineJoin="round"
                        />
                    </>
                )}
                
                <Marker position={safePickup} icon={pickupIcon}>
                    {pickupName && (
                        <Popup closeButton={false} autoClose={false} closeOnClick={false} className="custom-popup">
                            <div className="px-3 py-1 bg-black text-white text-[10px] font-black rounded-lg whitespace-nowrap">{pickupName}</div>
                        </Popup>
                    )}
                </Marker>
                
                {/* Only show destination label/marker when actually on trip */}
                {stage === 'ON_TRIP' && (
                    <Marker position={safeDrop} icon={dropIcon}>
                        {dropName && (
                            <Popup closeButton={false} autoClose={false} closeOnClick={false} className="custom-popup">
                                <div className="px-3 py-1 bg-black text-white text-[10px] font-black rounded-lg whitespace-nowrap">{dropName}</div>
                            </Popup>
                        )}
                    </Marker>
                )}
                
                {/* Show driver when they are en route or on trip */}
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
                .custom-popup .leaflet-popup-content-wrapper {
                    background: transparent;
                    box-shadow: none;
                    border: none;
                    padding: 0;
                }
                .custom-popup .leaflet-popup-tip {
                    display: none;
                }
                .custom-popup .leaflet-popup-content {
                    margin: 0;
                    transform: translateY(-40px);
                }
            `}</style>
        </div>
    )
}
