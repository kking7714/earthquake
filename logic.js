// Earthquake data
var quakes = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// plates data
var plates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

d3.json(quakes, function(data) {
    createFeature(data.features);
});

function createFeature (earthquake_data) {
    var earthquakes = L.geoJson(earthquake_data, {
        onEachFeature: function (feature, layer){
            layer.bindPopup("<h2>" + feature.properties.place + "</h2><br><h3> Magnitude: " + 
        feature.properties.mag + "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
        },
        // create point layer based on magnitude for radius and color scale
        pointToLayer: function(feature, latlng) {
            return new L.circle(latlng,
            {radius: getRadius(feature.properties.mag),
            fillColor: getColor(feature.properties.mag),
            fillOpacity: .6,
            stroke: true,
            color: "black",
            weight: .5})
        }
    });
    // Call the createMap function defined below
    createMap(earthquakes)
}

function createMap(earthquakes) {
    // various layer maps
    var streetMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" + 
    "access_token=pk.eyJ1Ijoia2tpbmc3NzE0IiwiYSI6ImNqY3Nhbm5zaTM5eXgzNG54ZjJjczI1NHEifQ.qG2RBbSPN97QQhfcZSc5Ag");
    
    var darkMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1Ijoia2tpbmc3NzE0IiwiYSI6ImNqY3Nhbm5zaTM5eXgzNG54ZjJjczI1NHEifQ.qG2RBbSPN97QQhfcZSc5Ag");

    // var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/ruchichandra/cjakahzysbllh2rl87e2dg27b/tiles/256/{z}/{x}/{y}?" +
    // "access_token=pk.eyJ1Ijoia2tpbmc3NzE0IiwiYSI6ImNqY3Nhbm5zaTM5eXgzNG54ZjJjczI1NHEifQ.qG2RBbSPN97QQhfcZSc5Ag");
    
    // layers options
    var baseMaps = {
        // "Satellite": satelliteMap,
        "Dark": darkMap,
        "Street": streetMap
    };
    // store the tectonic data as a layer group
    var tectPlates = new L.LayerGroup();
    // setting overlays for earthquake and tectonic data
    var overlayMaps = {
        Earthquakes: earthquakes,
        "Plate Lines": tectPlates
    };
    // creating map with layers, centerpoint, and zoom level
    var myMap = L.map("map", {
        center:[37.77, -122.41],
        zoom: 4,
        layers: [streetMap, earthquakes]
    });
    // add tectonic data
    d3.json(plates, function(tectData) {
        L.geoJson(tectData, {
            color: "green",
            weight: 1.5
        })
        .addTo(tectPlates)
    });

    // add the map layers and the overlay datasets
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // place a legend at the bottom right
    var Legend = L.control({position: "bottomright"});

    // implement the legend itself
    Legend.onAdd = function(myMap) {
        var div = L.DomUtil.create("div", "info legend"),
        grades = [0,1,2,3,4,5],
        labels = [];

        for (var i = 0; i < grades.length; i++) {
            div.innerHTML += 
            '<i style="background: ' + getColor(grades[i] + 1) + '"></i> ' + grades[i] +
            (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
        return div;
    };
    Legend.addTo(myMap);
}

// scale colors based on magnitude
function getColor(d) {
    return d > 5 ? '#F30' :
    d > 4  ? '#F60' :
    d > 3  ? '#F90' :
    d > 2  ? '#FC0' :
    d > 1   ? '#FF0' :
              '#9F3';
}
// scale radius based on magnitude
function getRadius(r) {
    return r*40000
}


