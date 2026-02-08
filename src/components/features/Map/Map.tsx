'use client';

import { MapContainer, TileLayer, Marker, Popup, LayersControl, Circle, LayerGroup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import L from 'leaflet';
import { Resource } from '@/types';
import Link from 'next/link';

// --- Icon Factory ---
const createIcon = (color: string, emoji: string) => {
    return new L.DivIcon({
        className: 'custom-icon',
        html: `
            <div style="
                background-color: ${color}; 
                width: 30px; height: 30px; 
                border-radius: 50%; 
                border: 2px solid white; 
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                display: flex; align-items: center; justify-content: center;
                font-size: 16px;
                position: relative;
            ">
                ${emoji}
            </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15],
    });
};

const ICONS: Record<string, L.DivIcon> = {
    BLOOD: createIcon('#ef4444', '🩸'),
    OXYGEN: createIcon('#3b82f6', '🫁'),
    AMBULANCE: createIcon('#f59e0b', '🚑'),
    HOSPITAL: createIcon('#ef4444', '🏥'),
    DOCTOR: createIcon('#3b82f6', '👨‍⚕️'),
    SPECIALIST: createIcon('#8b5cf6', '🩺'),
    MEDICINE: createIcon('#10b981', '💊'),
    BLOOD_BANK: createIcon('#dc2626', '🏦'),
    PATHOLOGY: createIcon('#6366f1', '🔬'),
    EQUIPMENT: createIcon('#f97316', '🩼'),
    SHELTER: createIcon('#10b981', '⛺'),
    POLICE: createIcon('#1f2937', '👮'),
    FIRE: createIcon('#ef4444', '🚒'),
    CLINIC: createIcon('#14b8a6', '🏥'),
    DIALYSIS: createIcon('#0ea5e9', '🩺'),
    PLASMA: createIcon('#fbbf24', '🧬'),
    NURSE: createIcon('#ec4899', '👩‍⚕️'),
    // Fallback
    MEDICAL_CAMP: createIcon('#8b5cf6', '🏕️'),
};

interface MapProps {
    resources: Resource[];
    center?: [number, number];
    zoom?: number;
    className?: string;
    height?: string;
    userLat?: number;
    userLng?: number;
}

import { useEffect } from 'react';

function MapResizer() {
    const map = useMap();
    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => {
            map.invalidateSize();
        });
        resizeObserver.observe(map.getContainer());
        return () => resizeObserver.disconnect();
    }, [map]);
    return null;
}

export default function Map({ resources, center = [28.6139, 77.2090], zoom = 12, className, height = "100%", userLat, userLng }: MapProps) {
    return (
        <div className={className} style={{ height, width: '100%', position: 'relative', zIndex: 0 }}>
            <MapContainer
                key="vita-map-container"
                center={center}
                zoom={zoom}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User Location Pulse */}
                {userLat && userLng && (
                    <Circle
                        center={[userLat, userLng]}
                        radius={2000}
                        pathOptions={{ color: '#2563EB', dashArray: '5,5', fillColor: '#2563EB', fillOpacity: 0.1 }}
                    />
                )}

                <LayersControl position="topright">
                    {/* We can group markers by type for toggling */}
                    <LayersControl.Overlay checked name="Hospitals & Doctors">
                        <LayerGroup>
                            {resources.filter(r => ['HOSPITAL', 'DOCTOR', 'SPECIALIST', 'CLINIC'].includes(r.type)).map(r => (
                                <ResourceMarker key={r.id} resource={r} />
                            ))}
                        </LayerGroup>
                    </LayersControl.Overlay>

                    <LayersControl.Overlay checked name="Emergency (Amb/Police/Fire)">
                        <LayerGroup>
                            {resources.filter(r => ['AMBULANCE', 'POLICE', 'FIRE'].includes(r.type)).map(r => (
                                <ResourceMarker key={r.id} resource={r} />
                            ))}
                        </LayerGroup>
                    </LayersControl.Overlay>

                    <LayersControl.Overlay checked name="Supplies (Meds/Blood/O2)">
                        <LayerGroup>
                            {resources.filter(r => ['MEDICINE', 'BLOOD', 'OXYGEN', 'BLOOD_BANK', 'EQUIPMENT'].includes(r.type)).map(r => (
                                <ResourceMarker key={r.id} resource={r} />
                            ))}
                        </LayerGroup>
                    </LayersControl.Overlay>

                    <LayersControl.Overlay checked name="Others">
                        <LayerGroup>
                            {resources.filter(r => !['HOSPITAL', 'DOCTOR', 'SPECIALIST', 'CLINIC', 'AMBULANCE', 'POLICE', 'FIRE', 'MEDICINE', 'BLOOD', 'OXYGEN', 'BLOOD_BANK', 'EQUIPMENT'].includes(r.type)).map(r => (
                                <ResourceMarker key={r.id} resource={r} />
                            ))}
                        </LayerGroup>
                    </LayersControl.Overlay>
                </LayersControl>
                <MapResizer />
            </MapContainer>
        </div>
    );
}

function ResourceMarker({ resource }: { resource: Resource }) {
    return (
        <Marker
            position={[resource.location.lat, resource.location.lng]}
            icon={ICONS[resource.type] || ICONS.HOSPITAL}
        >
            <Popup>
                <div className="min-w-[220px]">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{(ICONS[resource.type]?.options as any).html?.match(/<div.*?>(.*?)<\/div>/)?.[1] || '📍'}</span>
                        <h3 className="font-bold text-base leading-tight">{resource.title}</h3>
                    </div>

                    <p className="text-xs text-gray-600 font-bold uppercase mb-1">{resource.type}</p>

                    <div className="bg-gray-50 p-2 rounded text-xs mb-2 border border-gray-100">
                        {resource.metadata?.hospital && (
                            <div>
                                🛏️ Beds: <b>{resource.metadata.hospital.beds.general + resource.metadata.hospital.beds.icu}</b> | ICU: <b className="text-red-600">{resource.metadata.hospital.beds.icu}</b>
                            </div>
                        )}
                        {resource.metadata?.doctor && (
                            <div>
                                👨‍⚕️ {resource.metadata.doctor.specialty}<br />
                                {resource.metadata.doctor.availableToday ? <span className="text-green-600">● Available</span> : <span className="text-red-600">● Unavailable</span>}
                            </div>
                        )}
                        {/* Fallback address if no specific metadata */}
                        {!resource.metadata?.hospital && !resource.metadata?.doctor && (
                            <div>📍 {resource.location.address}</div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <a href={`tel:${resource.contact.phone}`} className="btn btn-primary text-xs py-1 text-center">📞 Call</a>
                        <Link href={`/resource/${resource.id}`} className="btn btn-outline text-xs py-1 text-center">Details</Link>
                    </div>
                </div>
            </Popup>
        </Marker>
    );
}
