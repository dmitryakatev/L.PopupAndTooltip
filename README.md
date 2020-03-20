# Leaflet Tooltip and Popup

```javascript
let map = L.map('map', {
    center: [51.55, -0.1],
    zoom: 10,
    layers: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { }),
    zoomControl: false
});

let marker1 = L.marker([51.5, -0.09]);
let marker2 = L.marker([51.6, -0.1]);

L.markerPopup({
    target: marker1,
    update(popup) {
        popup.setContent('auto show popup delay 500ms!');
    }
});

var tooltip = new L.MarkerTooltip({
    target: marker2,
    update(tTip) {
        tTip.setHtml('loading...');

        setTimeout(() => {
            tTip.setHtml('tooltip data');
        }, 1000);
    }
});

marker1.addTo(map);
marker2.addTo(map);
```
