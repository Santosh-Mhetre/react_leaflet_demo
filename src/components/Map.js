import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon } from "leaflet";
import veg1 from "../assets/img/veg1.png";
import veg2 from "../assets/img/veg2.png";
import nonveg1 from "../assets/img/non-veg1.png";
import nonveg2 from "../assets/img/non-veg2.png";

// Fix marker icon issues
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
});

// Location control component
function LocationControl({ onLocationUpdate }) {
  const map = useMap();
  const [isLocating, setIsLocating] = useState(false);

  const handleLocationClick = () => {
    setIsLocating(true);
    map.locate({ setView: true, maxZoom: 16 });
  };

  useEffect(() => {
    if (!map) return;

    const onLocationFound = (e) => {
      setIsLocating(false);
      map.setView(e.latlng, 16);
      onLocationUpdate([e.latlng.lat, e.latlng.lng]);
    };

    const onLocationError = (e) => {
      setIsLocating(false);
      alert(
        "Location access denied or unavailable. Please enable location services."
      );
    };

    map.on("locationfound", onLocationFound);
    map.on("locationerror", onLocationError);

    return () => {
      map.off("locationfound", onLocationFound);
      map.off("locationerror", onLocationError);
    };
  }, [map, onLocationUpdate]);

  return (
    <div className="leaflet-control-container">
      <div className="leaflet-top leaflet-right">
        <div className="leaflet-control leaflet-bar">
          <button
            className={`location-button ${isLocating ? "locating" : ""}`}
            onClick={handleLocationClick}
            title="Show my location"
          >
            <i
              className={`fas fa-location-arrow ${
                isLocating ? "rotating" : ""
              }`}
            ></i>
          </button>
        </div>
      </div>
    </div>
  );
}

function Map() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [focusedLocation, setFocusedLocation] = useState(null);

  // Handler to update user location
  const handleLocationUpdate = (newLocation) => {
    setUserLocation(newLocation);
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([
            position.coords.latitude,
            position.coords.longitude,
          ]);
        },
        (error) => {
          console.error("Error getting user location:", error);
          setUserLocation([51.505, -0.09]);
        }
      );
    } else {
      setUserLocation([51.505, -0.09]);
    }
  }, []);

  if (!userLocation) {
    return <div>Loading map...</div>;
  }

  const locations = [
    {
      position: [18.399376238216934, 73.91978675898407],
      title: "Shree Ganesh",
      description: "Vegetarian restaurant",
      category: "veg",
      image: veg1,
    },
    {
      position: [18.549586683643685, 73.77275029799425],
      title: "PK Biryani",
      description: "Non-vegetarian restaurant",
      category: "non-veg",
      image: nonveg1,
    },
    {
      position: [18.504249462631677, 73.9668214954424],
      title: "Krishna Pure Veg",
      description: "Vegetarian restaurant",
      category: "veg",
      image: veg2,
    },
    {
      position: [18.6116920251189, 73.78338702285839],
      title: "Hotel Tambda-Pandhara",
      description: "Non-vegetarian restaurant",
      category: "non-veg",
      image: nonveg2,
    },
    // Add more locations as needed
  ];

  const filteredLocations = locations.filter(
    (location) =>
      selectedCategory === "all" || location.category === selectedCategory
  );

  const vegIcon = new Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const nonVegIcon = new Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  // Add this function to filter locations based on search and category
  const getFilteredLocations = () => {
    return locations.filter((location) => {
      const matchesCategory =
        selectedCategory === "all" || location.category === selectedCategory;

      const matchesSearch =
        location.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  };

  // Create a separate component for the sidebar buttons that doesn't use useMap
  const SidebarButton = ({ location }) => (
    <button
      className="list-group-item list-group-item-action"
      onClick={() => {
        // Instead of directly manipulating the map, store the location to focus
        setFocusedLocation(location.position);
      }}
    >
      <h6 className="mb-1">{location.title}</h6>
      <p className="mb-1 small">{location.description}</p>
      <small
        className={`text-${location.category === "veg" ? "success" : "danger"}`}
      >
        {location.category === "veg" ? "Vegetarian" : "Non-Vegetarian"}
      </small>
    </button>
  );

  // Create a MapController component to handle map interactions
  const MapController = () => {
    const map = useMap();

    useEffect(() => {
      if (focusedLocation) {
        map.setView(focusedLocation, 16);
      }
    }, [focusedLocation, map]);

    return null;
  };

  return (
    <div className="container mt-4">
      <div className="row mb-3">
        <div className="col-md-6 mb-2">
          <input
            type="text"
            className="form-control"
            placeholder="Search restaurants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="col-md-6 mb-2">
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Hotels</option>
            <option value="veg">Vegetarian</option>
            <option value="non-veg">Non-Vegetarian</option>
          </select>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col">
          <p className="text-muted">
            Found {getFilteredLocations().length} restaurants
          </p>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-4">
          <div className="list-group">
            {getFilteredLocations().map((location, index) => (
              <SidebarButton key={index} location={location} />
            ))}
          </div>
        </div>
        <div className="col-md-8">
          <div className="map-container">
            <MapContainer
              center={userLocation}
              zoom={13}
              style={{
                height: "100%",
                width: "100%",
                minHeight: "400px",
              }}
            >
              <MapController />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationControl onLocationUpdate={handleLocationUpdate} />
              {getFilteredLocations().map((location, index) => (
                <Marker
                  key={index}
                  position={location.position}
                  icon={location.category === "veg" ? vegIcon : nonVegIcon}
                >
                  <Popup>
                    <div className="popup-content">
                      <h3>{location.title}</h3>
                      <p>{location.description}</p>
                      <p>
                        <strong>Category:</strong> {location.category}
                      </p>
                      {location.image && (
                        <img
                          src={location.image}
                          alt={location.title}
                          className="img-fluid mt-2"
                        />
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
              <Marker position={userLocation}>
                <Popup>Your Location</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Map;
