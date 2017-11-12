/**
 * Created by gabriel on 2017-10-19.
 */
/*
 Heatmap code below
 */
var map, heatmap, mapPoints     ;
var initData = [];

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: {lat: 52.006504, lng: 4.362238},
        mapTypeId: 'terrain'
    });
    mapPoints = new google.maps.MVCArray(initData);

    index = new google.maps.visualization.HeatmapLayer({
        data: mapPoints,
        map: map
    });
}

function toggleHeatmap() {
    index.setMap(index.getMap() ? null : map);
}



function changeGradient() {
    var gradient = [
        'rgba(0, 255, 255, 50)',
        'rgba(0, 255, 255, 1)',
        'rgba(0, 191, 255, 1)',
        'rgba(0, 127, 255, 1)',
        'rgba(0, 63, 255, 1)',
        'rgba(0, 0, 255, 1)',
        'rgba(0, 0, 223, 1)',
        'rgba(0, 0, 191, 1)',
        'rgba(0, 0, 159, 1)',
        'rgba(0, 0, 127, 1)',
        'rgba(63, 0, 91, 1)',
        'rgba(127, 0, 63, 1)',
        'rgba(191, 0, 31, 1)',
        'rgba(255, 0, 0, 1)'
    ]
    index.set('gradient', index.get('gradient') ? null : gradient);
}

function changeRadius() {
    index.set('radius', index.get('radius') ? null : 20);
}

function changeOpacity() {
    index.set('opacity', index.get('opacity') ? null : 0.2);
}

