import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const q = searchParams.get('q');
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    const path = searchParams.get('path'); // lon1,lat1;lon2,lat2

    let url = '';
    if (type === 'reverse' && lat && lon) {
        url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
    } else if (type === 'search' && q) {
        url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=5`;
    } else if (type === 'route' && path) {
        url = `https://router.project-osrm.org/route/v1/driving/${path}?overview=full&geometries=geojson`;
    } else {
        return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
            },
        });

        if (!response.ok) {
            // If Nominatim blocks us, return a fallback response
            if (type === 'reverse' && lat && lon) {
                return NextResponse.json({
                    display_name: `Location (${parseFloat(lat).toFixed(4)}°N, ${parseFloat(lon).toFixed(4)}°E)`,
                    address: {
                        road: 'Current Location',
                        city: '',
                        state: '',
                    }
                });
            }
            return NextResponse.json([]);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Location API Proxy Error:', error);
        // Graceful fallback instead of error
        if (type === 'reverse') {
            return NextResponse.json({
                display_name: `Location (${lat}, ${lon})`,
                address: { road: 'Current Location' }
            });
        }
        return NextResponse.json([]);
    }
}
