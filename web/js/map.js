/**
 * Created by gabriel on 2017-10-19.
 */
/*
 Heatmap code below
 */
const initData = [], carbonPoints = [], tempPoints = [], humPoints = [];
let map, tempLayer, carbonLayer, humLayer;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: {lat: 52.006504, lng: 4.362238},
        mapTypeId: 'terrain'
    });
    mapPoints = new google.maps.MVCArray(initData);

    tempLayer  = new google.maps.visualization.HeatmapLayer({
        data: tempPoints,
        opacity: 0.8,
        isToggled: false
    });
    carbonLayer  = new google.maps.visualization.HeatmapLayer({
        data: carbonPoints,
        opacity: 0.8,
        radius: 20,
        isToggled: false
    });
    humLayer = new google.maps.visualization.HeatmapLayer({
        data: humPoints,
        radius: 10,
        isToggled: false
    });
}
function addToMap(payload) {
    addTemp(payload);
    addCarbon(payload);
    addHumidity(payload);
}

function addTemp(payload) {
    console.log(payload);
    const tempColor = 'rgb(' + payload.temp * 10 + ', 0, 255)';
    const tempCircle = new google.maps.Circle({
        strokeColor: tempColor,
        strokeOpacity: 0.5,
        strokeWeight: 0,
        fillColor: tempColor,
        fillOpacity: 0.5,
        map: map,
        center: {lat: payload.long, lng: payload.lat},
        radius: 20,
    });
    tempPoints.push(tempCircle);
}

function addCarbon(payload) {
    const carbonThreshold = 100;
    if(payload.carbon > carbonThreshold) {
        carbonPoints.push(new google.maps.LatLng(payload.long, payload.lat, Math.round(payload.carbon/100)));
    }
}

function addHumidity(payload) {
    // TODO
}

function toggleTemperature() {
    // TODO not toggeling
    tempPoints.forEach(function(p) {
        p.visible = !p.visible;
    });
    /* tempLayer.setMap(tempLayer.getMap() ? null : map); tempLayer is a heatmap
    tempLayer.setMap( ? null : map); // TODO: untoggle
    tempLayer.isToggled = !tempLayer.isToggled;
    console.log(tempLayer.isToggled);*/
}

function toggleHumidity() {
    // TODO
}

function toggleCarbon() {
    carbonLayer.setMap(carbonLayer.isToggled ? null : map);
    carbonLayer.isToggled = !carbonLayer.isToggled;
}

