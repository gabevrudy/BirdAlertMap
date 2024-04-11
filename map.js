// MAP CONTENT AND FUNCTIONALITY

var myMap = L.map('map').setView([35.347065,-120.4553325], 9);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
     attribution: 'Map data © OpenStreetMap contributors'
     }).addTo(myMap);

var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
     attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
     }).addTo(myMap);

var slo_county = L.esri.featureLayer({
    url: 'https://services1.arcgis.com/jUJYIo9tSA7EHvfZ/arcgis/rest/services/California_County_Boundaries/FeatureServer/0',
    where: "COUNTY_NAME = 'San Luis Obispo'",
    style: function() {
        return {
            color: '#333',
            weight: 2
        }
    }
    }).addTo(myMap);

var wmsLayer = L.tileLayer.wms("https://www.mrlc.gov/geoserver/mrlc_display/NLCD_2021_Land_Cover_L48/wms", {
    layers: 'NLCD_2021_Land_Cover_L48', 
    format: 'image/png',
    opacity: 0.5,
    transparent: true,
    attribution: "NLCD 2021 Land Cover data provided by the Multi-Resolution Land Characteristics (MRLC) Consortium"
    }).addTo(myMap);

// POPUP CONTENT AND FORMATTING

// function to make each propertyName be proper cased and replace _ with spaces
function prettifyPropertyName(propertyName) {
    var prettyName = propertyName.replace(/_/g, ' ');
    return prettyName.charAt(0).toUpperCase() + prettyName.slice(1);
}

// function to prettify the map_url propertyName so it's a clickable link
function prettifyMapURL(propertyName, propertyValue) {
    var prettyName = prettifyPropertyName(propertyName);
    formatted = "<b>" + prettyName + "</b>" + ": <a href='" + propertyValue + "' target='_blank'>" + "Google Maps Link" + "</a>";
    return formatted
}

// function to generate the popup content for each feature
function generatePopupContent(feature) {
    var popupContent = "<p>";
    if (feature.properties) {
        for (var propertyName in feature.properties) {
            if (propertyName === 'map_url') {
                popupContent += prettifyMapURL(propertyName, feature.properties[propertyName]) + "<br>";
            } 
            else if (propertyName === 'checklist') {
                popupContent += "<b>" + prettifyPropertyName(propertyName) + "</b>" + ": " + "<a href='" + feature.properties[propertyName] + "' target='_blank'>" + feature.properties[propertyName] + "</a>" + "<br>";
            }
            else {    
            popupContent += "<b>" + prettifyPropertyName(propertyName) + "</b>" + ": " + feature.properties[propertyName] + "<br>";
        }
    }}
    popupContent += "</p>";
    return popupContent;
}

// Load in Test Data
var mostRecentFile = '/data/test.geojson';

// Load GeoJSON 
fetch(mostRecentFile)
.then(function(response) {return response.json();})
.then(function(data) {L.geoJSON(data, {
        pointToLayer: function(feature, latlng) {
            return L.marker(latlng);
        },
        onEachFeature: function(feature, layer) {
            var popupContent = generatePopupContent(feature);
            layer.bindPopup(popupContent);
        }
}).addTo(myMap);
});
