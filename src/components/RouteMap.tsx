'use client'
import React, { useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMap, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons - only run on client
const createIcons = () => {
    if (typeof window === 'undefined') return { pickupIcon: null, dropIcon: null, driverIcon: null };
    
    return {
        pickupIcon: L.divIcon({
            className: 'custom-marker',
            html: `<div style="width: 12px; height: 12px; background: black; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(0,0,0,0.2);"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6]
        }),
        dropIcon: L.divIcon({
            className: 'custom-marker',
            html: `<div style="width: 12px; height: 12px; background: black; border-radius: 2px; border: 3px solid white; box-shadow: 0 0 15px rgba(0,0,0,0.2); transform: rotate(45deg);"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6]
        }),
        driverIcon: L.divIcon({
            className: 'custom-marker',
            html: `<div style="background: black; padding: 8px; border-radius: 12px; border: 2px solid white; box-shadow: 0 10px 20px rgba(0,0,0,0.2); animation: pulse 2s infinite;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1-3-4-3-4 3-4 3H3c-1.1 0-2 .9-2 2v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg></div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18]
        })
    }
}

// Component to fix Leaflet size issues and handle bounds
function MapController({ bounds, center }: { bounds: L.LatLngBoundsExpression, center: [number, number] }) {
    const map = useMap()
    
    useEffect(() => {
        if (!map) return;
        
        const timer = setTimeout(() => {
            try {
                if (map && map.getContainer()) {
                    map.invalidateSize()
                    if (bounds && (bounds as any).length > 0) {
                        map.fitBounds(bounds, { padding: [50, 50], animate: true })
                    } else if (center) {
                        map.setView(center, 13)
                    }
                }
            } catch (e) {
                console.warn("Map interaction warning:", e)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [map, bounds, center])

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
    const [mounted, setMounted] = useState(false)
    const [route, setRoute] = useState<[number, number][]>([])
    const [fullTripRoute, setFullTripRoute] = useState<[number, number][]>([])
    const icons = useMemo(() => createIcons(), [])

    useEffect(() => {
        setMounted(true)
    }, [])

    const isLocValid = (loc?: [number, number] | null) => 
        loc && !isNaN(loc[0]) && !isNaN(loc[1]) && loc[0] !== 0 && loc[1] !== 0;

    // Effect for the "Preview/Full" route (Pickup to Drop)
    useEffect(() => {
        if (!mounted) return;
        
        if (stage === 'IDLE' || !isLocValid(pickup) || !isLocValid(drop)) {
            setFullTripRoute([]);
            return;
        }

        const fetchFullRoute = async () => {
            try {
                const fmt = (c: [number, number]) => `${c[1].toFixed(6)},${c[0].toFixed(6)}`;
                const url = `/api/location/proxy?type=route&path=${fmt(pickup)};${fmt(drop)}`
                
                const response = await fetch(url)
                const data = await response.json()
                if (data?.routes?.[0]?.geometry) {
                    const coords = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]])
                    setFullTripRoute(coords)
                } else {
                    setFullTripRoute([pickup, drop])
                }
            } catch (err) {
                setFullTripRoute([pickup, drop])
            }
        }
        fetchFullRoute()
    }, [mounted, pickup, drop, stage])

    // Effect for the "Active" route (Driver to Pickup or Driver to Drop)
    useEffect(() => {
        if (!mounted) return;

        if (stage === 'IDLE' || stage === 'COMPLETED' || !isLocValid(pickup) || !isLocValid(drop)) {
            setRoute([]);
            return;
        }

        const fetchActiveRoute = async () => {
            try {
                let start = pickup;
                let end = drop;

                if (stage === 'SEARCHING') {
                    start = pickup;
                    end = drop;
                } else if ((stage === 'ARRIVING' || stage === 'OTP' || stage === 'ARRIVED' || stage === 'EN_ROUTE') && isLocValid(driver)) {
                    start = driver!;
                    end = pickup;
                } else if (stage === 'ON_TRIP' && isLocValid(driver)) {
                    start = driver!;
                    end = drop;
                }

                if (!isLocValid(start) || !isLocValid(end)) return;
                
                if (Math.abs(start![0] - end![0]) < 0.0001 && Math.abs(start![1] - end![1]) < 0.0001) {
                    setRoute([start!, end!]);
                    return;
                }

                const fmt = (c: [number, number]) => `${c[1].toFixed(6)},${c[0].toFixed(6)}`;
                const url = `/api/location/proxy?type=route&path=${fmt(start!)};${fmt(end!)}`
                
                const response = await fetch(url)
                const data = await response.json()
                
                if (data?.routes?.[0]?.geometry) {
                    const coords = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]])
                    setRoute(coords)
                } else {
                    setRoute([start!, end!])
                }
            } catch (err) {
                setRoute([pickup, drop])
            }
        }

        fetchActiveRoute()
    }, [mounted, pickup, drop, driver, stage])

    const safePickup: [number, number] = useMemo(() => 
        (pickup && !isNaN(pickup[0])) ? pickup : [28.6139, 77.2090], 
    [pickup])

    const safeDrop: [number, number] = useMemo(() => 
        (drop && !isNaN(drop[0])) ? drop : [28.6139, 77.2090], 
    [drop])
    
    const relevantPoints: [number, number][] = useMemo(() => {
        let points: [number, number][] = [safePickup, safeDrop]
        if ((stage === 'ARRIVING' || stage === 'OTP' || stage === 'EN_ROUTE') && isLocValid(driver)) {
            points = [driver!, safePickup, safeDrop]
        } else if (stage === 'ON_TRIP') {
            points = [safePickup, safeDrop]
            if (isLocValid(driver)) points.push(driver!)
        } else if (stage === 'COMPLETED') {
            points = [safeDrop]
        }
        return points
    }, [safePickup, safeDrop, driver, stage])

    if (!mounted) return <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[10px] uppercase font-black text-gray-400 tracking-widest">Initializing Map...</div>

    return (
        <div className="w-full h-full relative overflow-hidden" style={{ minHeight: '400px' }}>
            <MapContainer 
                center={safePickup} 
                zoom={13} 
                className="w-full h-full z-0"
                zoomControl={false}
                attributionControl={false}
            >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                
                <MapController bounds={relevantPoints} center={safePickup} />
                
                {fullTripRoute.length > 1 && stage !== 'IDLE' && stage !== 'COMPLETED' && (
                    <Polyline positions={fullTripRoute} color="rgba(0,0,0,0.08)" weight={8} dashArray="10, 10" />
                )}

                {route.length > 1 && (
                    <>
                        <Polyline positions={route} color="rgba(0,0,0,0.1)" weight={10} />
                        <Polyline positions={route} color="black" weight={4} opacity={1} lineCap="round" lineJoin="round" />
                    </>
                )}
                
                {(stage !== 'IDLE' && stage !== 'ON_TRIP' && stage !== 'COMPLETED') && (
                    <Marker position={safePickup} icon={icons.pickupIcon!}>
                        <Tooltip permanent direction="top" offset={[0, -10]} className="custom-tooltip">
                            <div className="px-3 py-1 bg-black text-white text-[10px] font-black rounded-lg shadow-xl uppercase tracking-widest">Pickup</div>
                        </Tooltip>
                    </Marker>
                )}
                
                {(stage !== 'IDLE' && (stage === 'SEARCHING' || stage === 'ON_TRIP' || stage === 'COMPLETED')) && (
                    <Marker position={safeDrop} icon={icons.dropIcon!}>
                        <Tooltip permanent direction="top" offset={[0, -10]} className="custom-tooltip">
                            <div className="px-3 py-1 bg-black text-white text-[10px] font-black rounded-lg shadow-xl uppercase tracking-widest">
                                {stage === 'COMPLETED' ? 'Completed' : 'Drop'}
                            </div>
                        </Tooltip>
                    </Marker>
                )}
                
                {isLocValid(driver) && stage !== 'IDLE' && stage !== 'COMPLETED' && (
                    <Marker position={driver!} icon={icons.driverIcon!}>
                        <Tooltip permanent direction="top" offset={[0, -20]} className="custom-tooltip">
                            <div className={`px-3 py-1 text-white text-[9px] font-black rounded-lg shadow-xl uppercase tracking-widest ${stage === 'ARRIVED' || stage === 'OTP' || stage === 'EN_ROUTE' ? 'bg-emerald-500 animate-bounce' : 'bg-black opacity-80'}`}>
                                {stage === 'ARRIVED' || stage === 'OTP' ? 'Arrived' : stage === 'EN_ROUTE' ? 'En Route' : 'Driver'}
                            </div>
                        </Tooltip>
                    </Marker>
                )}

                {isLocValid(driver) && stage === 'IDLE' && (
                    <Marker position={driver!} icon={icons.driverIcon!}>
                        <Tooltip permanent direction="top" offset={[0, -20]} className="custom-tooltip">
                            <div className="px-3 py-1 bg-black text-white border border-white/20 text-[9px] font-black rounded-lg shadow-2xl uppercase tracking-widest animate-pulse">
                                You are here
                            </div>
                        </Tooltip>
                    </Marker>
                )}
            </MapContainer>

            <style jsx global>{`
                .leaflet-container { background: #f8f9fa !important; }
                .custom-tooltip { background: transparent !important; box-shadow: none !important; border: none !important; padding: 0 !important; cursor: default !important; }
                .custom-tooltip::before { display: none !important; }
                .leaflet-marker-icon { border: none !important; background: none !important; }
            `}</style>
        </div>
    )
}
