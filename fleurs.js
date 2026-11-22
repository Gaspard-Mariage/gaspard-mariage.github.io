/* Hortensias dessinés dans le navigateur (style du faire-part). Remplit chaque élément [data-fleur="coin-a|coin-b|coin-c|coin-d|brin|fleur"]. */
(function () {
var seed = 1;
var rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
var R = (a, b) => a + rnd() * (b - a);
var f = (n) => Math.round(n * 10) / 10;

var PAL = {
  blush: { base: "#EDCBC1", shade: "#EBC6BB", tints: ["#F8E3DC", "#F4D6CD", "#FBEDE8", "#EFCBC0"], line: "#D7A497", eye: "#C98F80" },
  lav:   { base: "#B7B2DD", shade: "#B5AFDC", tints: ["#DCD9F1", "#CFCBEC", "#E7E5F7", "#C4BFE6"], line: "#A39DD0", eye: "#8981BD" },
};
var LEAF = { dark: "#22392D", mid: "#2F4A3A", light: "#3F5F4B", vein: "#5C7D66" };

function mix(a, b, t) {
  var p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  var A = p(a), B = p(b);
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("");
}

// Pétale arrondi légèrement en cœur, pointant vers le haut, base au centre
function petal(s) {
  var w = s * 0.62, h = s;
  return `M0 0 C ${f(-w * 0.9)} ${f(-h * 0.25)} ${f(-w * 1.05)} ${f(-h * 0.95)} ${f(-w * 0.35)} ${f(-h * 1.02)} ` +
    `C ${f(-w * 0.12)} ${f(-h * 1.05)} ${f(-w * 0.02)} ${f(-h * 0.92)} 0 ${f(-h * 0.88)} ` +
    `C ${f(w * 0.02)} ${f(-h * 0.92)} ${f(w * 0.12)} ${f(-h * 1.05)} ${f(w * 0.35)} ${f(-h * 1.02)} ` +
    `C ${f(w * 1.05)} ${f(-h * 0.95)} ${f(w * 0.9)} ${f(-h * 0.25)} 0 0Z`;
}

function floret(x, y, s, rot, fill, pal) {
  var out = `<g transform="translate(${f(x)} ${f(y)}) rotate(${Math.round(rot)})">`;
  var d = petal(s);
  for (var i = 0; i < 4; i++) {
    out += `<path d="${d}" transform="rotate(${i * 90 + R(-8, 8)}) scale(${f(R(0.9, 1.08))})" fill="${fill}" stroke="${pal.line}" stroke-width="0.45" stroke-opacity="0.8" stroke-linejoin="round"/>`;
  }
  out += `<circle r="${f(s * 0.13)}" fill="${pal.eye}"/>`;
  return out + "</g>";
}

// Tête d'hortensia : dôme de fleurettes, ombré vers le bas
function head(cx, cy, r, kind) {
  var pal = PAL[kind];
  var ry = r * 0.88;
  var out = `<g>`;
  // masse d'ombre irrégulière
  var blob = "M";
  var N = 22;
  for (var i = 0; i <= N; i++) {
    var a = (i / N) * Math.PI * 2, k = R(0.92, 1.04);
    blob += `${f(cx + Math.cos(a) * r * k)} ${f(cy + Math.sin(a) * ry * k)} `;
  }
  out += `<path d="${blob}Z" fill="${pal.shade}"/>`;
  // positions par échantillonnage à distance minimale
  var pts = [];
  var minD = r * 0.235;
  for (var t = 0; t < 4000 && pts.length < 80; t++) {
    var a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * 0.97;
    var x = cx + Math.cos(a) * r * d, y = cy + Math.sin(a) * ry * d;
    if (pts.every((p) => Math.hypot(p[0] - x, p[1] - y) > minD)) pts.push([x, y]);
  }
  pts.sort((a, b) => a[1] - b[1]);
  for (var [x, y] of pts) {
    var ny = (y - cy) / ry; // -1 haut, +1 bas
    var nx = (x - cx) / r;
    var edge = Math.min(1, Math.hypot(nx, ny));
    var base = pal.tints[Math.floor(rnd() * pal.tints.length)];
    var shaded = mix(base, pal.base, Math.max(0, ny * 0.45 + edge * 0.25));
    var fill = mix(shaded, "#FFFFFF", Math.max(0, (-ny * 0.5 - nx * 0.3) * 0.35));
    var s = r * R(0.19, 0.27) * (1 - edge * 0.2);
    out +=floret(x, y, s, R(0, 90), fill, pal);
  }
  return out + "</g>";
}

// Feuille d'hortensia : ovale à pointe effilée, bord finement denté, nervures toujours à l'intérieur
function leaf(x, y, len, angle, tone = "dark") {
  var wMax = len * 0.34;
  var prof = (t) => wMax * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.68)), 1.35);
  var top = [], bot = [];
  var steps = 48;
  for (var i = 0; i <= steps; i++) {
    var t = i / steps;
    var w = prof(t);
    var tooth = i % 2 === 0 ? 1 : 0.975;
    top.push([t * len, -w * tooth]);
    bot.push([t * len, w * (i % 2 === 1 ? 1 : 0.975)]);
  }
  var d = `M0 0 `;
  top.forEach((p) => (d += `L${f(p[0])} ${f(p[1])} `));
  bot.slice().reverse().forEach((p) => (d += `L${f(p[0])} ${f(p[1])} `));
  d += "Z";
  var half = `M0 0 ` + top.map((p) => `L${f(p[0])} ${f(p[1])}`).join(" ") + ` Z`;
  var fill = LEAF[tone];
  var veins = "";
  for (var i = 1; i <= 5; i++) {
    var t0 = 0.1 + i * 0.13;
    var t1 = Math.min(0.92, t0 + 0.14);
    var w = prof(t1) * 0.78;
    var x0 = t0 * len, x1 = t1 * len;
    veins += `M${f(x0)} 0 Q${f((x0 + x1) / 2)} ${f(-w * 0.35)} ${f(x1)} ${f(-w)} `;
    veins += `M${f(x0)} 0 Q${f((x0 + x1) / 2)} ${f(w * 0.35)} ${f(x1)} ${f(w)} `;
  }
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(angle)})">` +
    `<path d="${d}" fill="${fill}"/>` +
    `<path d="${half}" fill="${LEAF.light}" opacity="0.35"/>` +
    `<path d="${veins}" stroke="${LEAF.vein}" stroke-width="0.8" fill="none" opacity="0.55" stroke-linecap="round"/>` +
    `<path d="M0 0 Q${f(len * 0.5)} ${f(-len * 0.015)} ${f(len * 0.93)} 0" stroke="${LEAF.vein}" stroke-width="1.3" fill="none" stroke-linecap="round"/>` +
    `</g>`;
}

// Tige courbe de l'ancrage (bord de page) jusqu'au cœur d'une tête ; renvoie un point/angle à une position t
function curve(x1, y1, x2, y2, bend) {
  var mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  var dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
  var cx = mx - (dy / L) * bend, cy = my + (dx / L) * bend;
  return {
    d: `M${f(x1)} ${f(y1)} Q${f(cx)} ${f(cy)} ${f(x2)} ${f(y2)}`,
    at(t) {
      var u = 1 - t;
      var x = u * u * x1 + 2 * u * t * cx + t * t * x2, y = u * u * y1 + 2 * u * t * cy + t * t * y2;
      var tx = 2 * u * (cx - x1) + 2 * t * (x2 - cx), ty = 2 * u * (cy - y1) + 2 * t * (y2 - cy);
      return { x, y, a: Math.atan2(ty, tx) * 180 / Math.PI };
    }
  };
}
function stemPath(c, w) {
  return `<path d="${c.d}" stroke="${LEAF.dark}" stroke-width="${w + 1.2}" fill="none" stroke-linecap="round"/>` +
         `<path d="${c.d}" stroke="${LEAF.light}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
}
// Bouquet : chaque branche = ancrage → tête, avec des feuilles fixées sur la tige
// branches: [{hx, hy, r, kind, bend, leaves: [[t, côté(+1/-1), longueur, écart°], ...]}]
function bouquet(ax, ay, branches) {
  var stems = "", leaves = "", heads = "";
  branches.forEach((br) => {
    var c = curve(ax, ay, br.hx, br.hy, br.bend || 0);
    stems += stemPath(c, br.w || 3);
    (br.leaves || []).forEach(([t, side, len, spread, tone]) => {
      var p = c.at(t);
      leaves += leaf(p.x, p.y, len, p.a + side * spread, tone || (side > 0 ? "dark" : "mid"));
    });
    // Collerette : feuilles qui partent de sous la tête (leur base reste cachée par la fleur)
    (br.collar || []).forEach(([deg, len, tone]) => {
      var rad = deg * Math.PI / 180, k = br.r * 0.45;
      leaves += leaf(br.hx + Math.cos(rad) * k, br.hy + Math.sin(rad) * k, len, deg, tone || "dark");
    });
    heads += head(br.hx, br.hy, br.r, br.kind);
  });
  return stems + leaves + heads;
}

function svg(w, h, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" aria-hidden="true" focusable="false">${body}</svg>\n`;
}


var BUILD = {
  "coin-a": function () { seed = 71;
  var b = bouquet(-40, -40, [
    { hx: 215, hy: 48, r: 76, kind: "blush", bend: 30, collar: [[20, 150], [65, 120, "mid"]] },
    { hx: 300, hy: 122, r: 48, kind: "lav", bend: -40, w: 2.6, collar: [[-5, 105, "mid"], [70, 100]] },
    { hx: 118, hy: 192, r: 70, kind: "blush", bend: -30, collar: [[95, 135], [140, 115, "mid"], [45, 105]] },
    { hx: 72, hy: 72, r: 96, kind: "lav", bend: 0 },
  ]);
  return svg(400, 340, b); },
  "coin-b": function () { seed = 2027;
  var b = bouquet(-40, -40, [
    { hx: 245, hy: 60, r: 62, kind: "lav", bend: 35, collar: [[10, 140], [60, 110, "mid"]] },
    { hx: 172, hy: 182, r: 52, kind: "blush", bend: -10, w: 2.6, collar: [[30, 115, "mid"], [80, 105]] },
    { hx: 58, hy: 232, r: 66, kind: "lav", bend: -35, collar: [[90, 130], [130, 105, "mid"], [40, 100]] },
    { hx: 95, hy: 82, r: 100, kind: "blush", bend: 0 },
  ]);
  return svg(400, 360, b); },
  "coin-c": function () { seed = 1807;
  var b = bouquet(-40, -40, [
    { hx: 150, hy: 40, r: 60, kind: "lav", bend: 25, collar: [[-10, 135], [40, 115, "mid"]] },
    { hx: 250, hy: 92, r: 58, kind: "blush", bend: -30, collar: [[5, 125, "mid"], [60, 110]] },
    { hx: 66, hy: 205, r: 74, kind: "blush", bend: -25, collar: [[100, 140], [55, 120, "mid"], [145, 100]] },
    { hx: 80, hy: 78, r: 92, kind: "blush", bend: 0 },
  ]);
  return svg(400, 340, b); },
  "coin-d": function () { seed = 3003;
  var b = bouquet(-40, -40, [
    { hx: 285, hy: 38, r: 54, kind: "blush", bend: 30, collar: [[0, 130], [55, 105, "mid"]] },
    { hx: 188, hy: 132, r: 60, kind: "lav", bend: -15, collar: [[35, 125, "mid"], [85, 110]] },
    { hx: 40, hy: 245, r: 58, kind: "blush", bend: -40, collar: [[95, 125], [45, 100, "mid"]] },
    { hx: 92, hy: 74, r: 98, kind: "lav", bend: 0 },
  ]);
  return svg(400, 360, b); },
  "brin": function () { seed = 1707;
  var b = bouquet(-20, 150, [
    { hx: 32, hy: 212, r: 48, kind: "lav", bend: 20, w: 2.6, collar: [[75, 95, "mid"], [20, 85]] },
    { hx: 82, hy: 98, r: 62, kind: "blush", bend: -25, collar: [[-20, 105], [35, 115, "mid"], [80, 90]] },
  ]);
  return svg(200, 270, b); },
  "fleur": function () { seed = 30;
  var b = bouquet(100, 196, [
    { hx: 100, hy: 85, r: 58, kind: "blush", bend: 6, leaves: [[0.42, -1, 72, 62], [0.5, 1, 72, 62]] },
  ]);
  return svg(200, 200, b); }
};
var cache = {};
// Agrandit le cadre pour que rien ne soit coupé à droite ni en bas.
// Le coin haut-gauche (0,0) reste collé au bord de la page ; seule la fleur "fleur" est entièrement cadrée.
function fit(svgEl, key) {
  try {
    var vb = svgEl.viewBox.baseVal, bb = svgEl.getBBox(), pad = 2;
    if (!bb.width) return;
    if (key === "fleur") {
      svgEl.setAttribute("viewBox", [bb.x - pad, bb.y - pad, bb.width + pad * 2, bb.height + pad * 2].join(" "));
    } else {
      var w = Math.max(vb.width, bb.x + bb.width + pad), h = Math.max(vb.height, bb.y + bb.height + pad);
      svgEl.setAttribute("viewBox", "0 0 " + Math.ceil(w) + " " + Math.ceil(h));
    }
  } catch (e) {}
}
var fitted = {};
function draw() {
  document.querySelectorAll("[data-fleur]").forEach(function (el) {
    var k = el.getAttribute("data-fleur");
    if (!BUILD[k]) return;
    if (!cache[k]) cache[k] = BUILD[k]();
    el.innerHTML = cache[k];
    var s = el.querySelector("svg");
    if (fitted[k]) { s.setAttribute("viewBox", fitted[k]); return; }
    fit(s, k);
    fitted[k] = s.getAttribute("viewBox");
  });
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", draw); else draw();
})();
