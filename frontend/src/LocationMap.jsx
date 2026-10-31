import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  useMapEvents,
  CircleMarker,
  Popup,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = [26.8467, 80.9462]; // Lucknow

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(event) {
      const { lat, lng } = event.latlng;

      onSelect({
        lat: Number(lat.toFixed(6)),
        lng: Number(lng.toFixed(6)),
      });
    },
  });

  return null;
}

export default function LocationMap({ onLocationSelect }) {
  const [selectedLocation, setSelectedLocation] = useState(null);

  function handleSelect(coordinates) {
    setSelectedLocation(coordinates);
    onLocationSelect(coordinates);
  }

  return (
    <section className="location-map-panel">
      <div className="location-map-heading">
        <div>
          <span className="eyebrow">PINPOINT THE PROBLEM</span>
          <h2>Select issue location</h2>
          <p>Click the map to mark where the civic issue occurred.</p>
        </div>

        <span className="map-pin-icon" aria-hidden="true">
          ⌖
        </span>
      </div>

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={12}
        scrollWheelZoom
        className="location-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler onSelect={handleSelect} />

        {selectedLocation && (
          <CircleMarker
            center={[
              selectedLocation.lat,
              selectedLocation.lng,
            ]}
            radius={9}
            pathOptions={{
              color: "#087f5b",
              fillColor: "#20c997",
              fillOpacity: 0.9,
            }}
          >
            <Popup>Selected issue location</Popup>
          </CircleMarker>
        )}
      </MapContainer>

      {selectedLocation ? (
        <div className="selected-location">
          <span className="selected-location-check">✓</span>

          <div>
            <strong>Location selected</strong>
            <p>
              {selectedLocation.lat}, {selectedLocation.lng}
            </p>
          </div>

          <button
            type="button"
            className="text-button"
            onClick={() => handleSelect(null)}
          >
            Clear
          </button>
        </div>
      ) : (
        <p className="map-hint">
          <span>ⓘ</span> Zoom in and click the exact location.
        </p>
      )}
    </section>
  );
}