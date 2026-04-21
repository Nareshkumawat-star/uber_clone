import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const q = searchParams.get('q');
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    let url = '';
    if (type === 'reverse' && lat && lon) {
        url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;
    } else if (type === 'search' && q) {
        url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=5`;
    } else {
        return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'GoRideApp/1.0 (goride.booking@gmail.com)',
                'Accept': 'application/json',
                'Referer': 'https://goride.app',
                'Accept-Language': 'en',
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
