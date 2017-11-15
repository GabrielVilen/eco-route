/**
 * Created by gabriel on 2017-10-19.
 */
/*
 Heatmap code below
 */
let initData = [], tempPoints = [], humPoints = [];
let map;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: {lat: 52.006504, lng: 4.362238},
        mapTypeId: 'terrain'
    });
    mapPoints = new google.maps.MVCArray(initData);

    tempLayer  = new google.maps.visualization.HeatmapLayer({
        radius: 5,
        data: tempPoints,
        opacity: 0.8,
        isToggled: false
    });
    lowLayer  = createHeatmap(['rgba(0, 255, 0, 0)', 'rgba(0, 255, 0, 1)']);
    middleLayer  = createHeatmap(['rgba(255, 255, 0, 0)', 'rgba(255, 255, 0, 1)']);
    highLayer  = createHeatmap(['rgba(255, 0, 0, 0)', 'rgba(255, 0, 0, 1)']);

    humLayer = new google.maps.visualization.HeatmapLayer({
        data: humPoints,
        radius: 10,
        isToggled: false
    });
    humidityObj = {
        "low": [],
        "middle": [],
        "high": []
    };
    temp = {
        "low": [],
        "middle": [],
        "high": []
    };
    carbonObj = {
        "low": [],
        "middle": [],
        "high": []
    };
}

function createHeatmap(gradients) {
    return new google.maps.visualization.HeatmapLayer({
        opacity: 0.5,
        radius: 20,
        gradient: gradients,
        isToggled: false
    });
}

function addToMap(payload) {
    var latLng = new google.maps.LatLng(payload.long, payload.lat);
    addTemp(payload);
    addToArray(latLng, payload.carbon, carbonObj, 100, 125);
    addToArray(latLng, payload.humidity, humidityObj, 30, 45);
}

function addTemp(payload) {
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

function addToArray(latLng, value, array, maxGreen, maxYellow) {
    if (value < maxGreen) {
        array.low.push(latLng);
    } else if  (value < maxYellow) {
        array.middle.push(latLng);
    }  else {
        array.high.push(latLng);
    }
}

function toggleTemperature() {
    tempPoints.forEach(function(p) {
        p.setVisible(!p.visible);
    });
}

function toggleMap(obj) {
    lowLayer.isToggled = !lowLayer.isToggled;

    lowLayer.setData(obj.low);
    middleLayer.setData(obj.middle);
    highLayer.setData(obj.high);
    lowLayer.setMap(map);
    middleLayer.setMap(map);
    highLayer.setMap(map);
}

function toggleHumidity() {
    toggleMap(humidityObj);
}

function toggleCarbon() {
    toggleMap(carbonObj);
}

