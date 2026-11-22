/* Carte « Se loger » : lieux du mariage + hébergements (Leaflet + OpenStreetMap). */
(function () {
  var el = document.getElementById("map");
  if (!el || !window.L) return;

  var PLACES = {
    hotel:   { lat: 47.076786, lng: 3.1009317, cls: "p-hotel", title: "Hôtel des Sources", text: "132 rue de la Mignarderie" },
    camping: { lat: 47.085208, lng: 3.0931506, cls: "p-camping", title: "Camping des Chanternes", text: "Avenue de Paris" }
  };
  // Adresses localisées à l'affichage via le service public de géocodage (IGN / Base Adresse Nationale)
  var LOOKUPS = {
    fete:   { q: "105 rue de Bourgneuf 58320 Pougues-les-Eaux", cls: "p-fete", title: "Chez Laure & Gaspard", text: "Cérémonie laïque, cocktail, dîner et brunch · 105 rue de Bourgneuf" },
    mairie: { q: "rue du Docteur Faucher 58320 Pougues-les-Eaux", cls: "p-mairie", title: "Mairie de Pougues-les-Eaux", text: "Cérémonie civile · samedi 15h" }
  };

  var map = L.map(el, { scrollWheelZoom: false, tap: true, maxZoom: 20, zoomControl: true }).setView([47.0795, 3.098], 14);

  // Vue satellite : photos aériennes IGN (on voit les maisons) ; Plan : OpenStreetMap
  var satellite = L.tileLayer(
    "https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ORTHOIMAGERY.ORTHOPHOTOS&STYLE=normal&TILEMATRIXSET=PM&FORMAT=image/jpeg&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}",
    { maxZoom: 20, maxNativeZoom: 19, attribution: '&copy; <a href="https://www.ign.fr/">IGN</a>' }
  );
  var noms = L.tileLayer(
    "https://data.geopf.fr/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALNAMES.NAMES&STYLE=normal&TILEMATRIXSET=PM&FORMAT=image/png&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}",
    { maxZoom: 20, maxNativeZoom: 18, attribution: "" }
  );
  var plan = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 20, maxNativeZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  });
  var vueSat = L.layerGroup([satellite, noms]).addTo(map);
  L.control.layers({ "Vue satellite": vueSat, "Plan": plan }, null, { position: "topright", collapsed: false }).addTo(map);
  L.control.scale({ imperial: false, position: "bottomleft" }).addTo(map);

  // La molette zoome la carte seulement après un clic dessus (pour ne pas bloquer le défilement de la page)
  map.on("click focus", function () { map.scrollWheelZoom.enable(); });
  el.addEventListener("mouseleave", function () { map.scrollWheelZoom.disable(); });

  function icon(cls) {
    return L.divIcon({ className: "map-pin " + cls, html: "<span></span>", iconSize: [26, 26], iconAnchor: [13, 26], popupAnchor: [0, -24] });
  }
  function add(p) {
    var m = L.marker([p.lat, p.lng], { icon: icon(p.cls), title: p.title, keyboard: true })
      .addTo(map)
      .bindPopup("<strong>" + p.title + "</strong><br>" + p.text + '<br><a href="#" class="zoom-here">Zoomer ici</a>');
    m.on("popupopen", function (e) {
      var a = e.popup.getElement().querySelector(".zoom-here");
      if (a) a.onclick = function (ev) { ev.preventDefault(); map.flyTo([p.lat, p.lng], 19); };
    });
    p.marker = m;
    return m;
  }
  // Boutons « Voir sur la carte » des fiches hébergement
  document.querySelectorAll("[data-map-focus]").forEach(function (b) {
    b.addEventListener("click", function () {
      var p = PLACES[b.getAttribute("data-map-focus")];
      if (!p) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      map.flyTo([p.lat, p.lng], 19);
      if (p.marker) p.marker.openPopup();
    });
  });
  var bounds = [];
  Object.keys(PLACES).forEach(function (k) { add(PLACES[k]); bounds.push([PLACES[k].lat, PLACES[k].lng]); });
  map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });

  function km(a, b) {
    var R = 6371, toR = Math.PI / 180;
    var dLat = (b.lat - a.lat) * toR, dLng = (b.lng - a.lng) * toR;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a.lat * toR) * Math.cos(b.lat * toR) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  function fmt(d) { return d < 1 ? Math.round(d * 10) * 100 + " m" : (Math.round(d * 10) / 10).toString().replace(".", ",") + " km"; }

  Object.keys(LOOKUPS).forEach(function (k) {
    var p = LOOKUPS[k];
    fetch("https://data.geopf.fr/geocodage/search?limit=1&q=" + encodeURIComponent(p.q))
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        var f = j && j.features && j.features[0];
        if (!f || (f.properties && f.properties.score < 0.5)) return;
        p.lng = f.geometry.coordinates[0]; p.lat = f.geometry.coordinates[1];
        add(p);
        bounds.push([p.lat, p.lng]);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
        if (k === "fete") {
          document.querySelectorAll("[data-dist-from]").forEach(function (n) {
            var from = PLACES[n.getAttribute("data-dist-from")];
            if (!from) return;
            n.textContent = "À " + fmt(km(from, p)) + " à vol d'oiseau du lieu de la fête";
            n.hidden = false;
          });
        }
      })
      .catch(function () {});
  });
})();
