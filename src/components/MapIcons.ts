import L from 'leaflet'

// Helper to create DivIcons safely
export const createBlueDotIcon = () => new L.DivIcon({
    className: 'custom-blue-dot',
    html: `
      <div style="width: 20px; height: 20px; background: #2563EB; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
});

export const createDepartureIcon = () => new L.DivIcon({
    className: 'departure-icon',
    html: `
      <div style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: #10B981; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">
          <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
});

export const createDestinationSquareIcon = () => new L.DivIcon({
    className: 'destination-square-icon',
    html: `
      <div style="display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; background: #000000; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">
          <div style="width: 10px; height: 10px; background: white;"></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
});

export const createRequestIcon = () => new L.DivIcon({
    className: 'custom-div-icon',
    html: `
      <div style="position: relative; width: 44px; height: 44px;">
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #3B82F6; border-radius: 50%; animation: ripple 1.5s infinite; opacity: 0.6;"></div>
        <div style="position: absolute; top: 10px; left: 10px; width: 24px; height: 24px; background: #3B82F6; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
          <svg viewBox="0 0 24 24" width="12" height="12" stroke="white" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
});

export const createDriverIcon = (url: string | null) => new L.DivIcon({
    className: 'custom-driver-icon',
    html: `
      <div style="width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; background: white; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 2px solid white;">
          <img src="${url || 'https://cdn-icons-png.flaticon.com/512/3202/3202926.png'}" style="width: 28px; height: 28px; object-fit: contain;" alt="Driver" />
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
});
