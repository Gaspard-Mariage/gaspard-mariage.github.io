/* Hortensias dessinés dans le navigateur (style du faire-part). Remplit chaque élément [data-fleur="coin-a|coin-b|brin|fleur"]. */
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
    out += `<path d="${d}" transform="rotate(${i * 90 + R(-8, 8)}) scale(${f(R(0.9, 1.08))})" fill="${fill}" stroke="${pal.line}" stroke-width="0.6" stroke-linejoin="round"/>`;
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
    var a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()) * 0.93;
    var x = cx + Math.cos(a) * r * d, y = cy + Math.sin(a) * ry * d;
    if (pts.every((p) => Math.hypot(p[0] - x, p[1] - y) > minD)) pts.push([x, y]);
  }
  pts.sort((a, b) => a[1] - b[1]);
  for (var [x, y] of pts) {
    var ny = (y - cy) / ry; // -1 haut, +1 bas
    var nx = (x - cx) / r;
    var edge = Math.min(1, Math.hypot(nx, ny));
    var base = pal.tints[Math.floor(rnd() * pal.tints.length)];
    var fill = mix(base, pal.base, Math.max(0, ny * 0.45 + edge * 0.25));
    var s = r * R(0.2, 0.25) * (1 - edge * 0.18);
    out +=floret(x, y, s, R(0, 90), fill, pal);
  }
  return out + "</g>";
}

// Feuille ovale pointue, bord finement denté, nervure claire
function leaf(x, y, len, angle, tone = "dark") {
  var wMax = len * 0.36;
  var top = [], bot = [];
  var steps = 44;
  for (var i = 0; i <= steps; i++) {
    var t = i / steps;
    var prof = Math.pow(Math.sin(Math.PI * Math.pow(t, 0.72)), 1.15) * wMax;
    var tooth = i % 2 === 0 ? 1 : 0.965;
    top.push([t * len, -prof * tooth]);
    bot.push([t * len, prof * (i % 2 === 1 ? 1 : 0.965)]);
  }
  var d = `M0 0 `;
  top.forEach((p) => (d += `L${f(p[0])} ${f(p[1])} `));
  bot.reverse().forEach((p) => (d += `L${f(p[0])} ${f(p[1])} `));
  d += "Z";
  var half = `M0 0 ` + top.map((p) => `L${f(p[0])} ${f(p[1])}`).join(" ") + ` L${f(len)} 0 Z`;
  var fill = LEAF[tone];
  var veins = "";
  for (var i = 1; i <= 5; i++) {
    var t = i / 6.2;
    var vx = t * len, w = Math.sin(Math.PI * t) * wMax * 0.75;
    veins += `M${f(vx)} 0 Q${f(vx + len * 0.06)} ${f(-w * 0.5)} ${f(vx + len * 0.12)} ${f(-w)} `;
    veins += `M${f(vx)} 0 Q${f(vx + len * 0.06)} ${f(w * 0.5)} ${f(vx + len * 0.12)} ${f(w)} `;
  }
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(angle)})">` +
    `<path d="${d}" fill="${fill}"/>` +
    `<path d="${half}" fill="${LEAF.mid}" opacity="0.55"/>` +
    `<path d="${veins}" stroke="${LEAF.vein}" stroke-width="0.9" fill="none" opacity="0.6"/>` +
    `<path d="M0 0 L${f(len * 0.97)} 0" stroke="${LEAF.vein}" stroke-width="1.4" fill="none"/>` +
    `</g>`;
}

function stem(x1, y1, x2, y2) {
  var mx = (x1 + x2) / 2 + R(-10, 10), my = (y1 + y2) / 2 + R(-10, 10);
  return `<path d="M${f(x1)} ${f(y1)} Q${f(mx)} ${f(my)} ${f(x2)} ${f(y2)}" stroke="${LEAF.mid}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
}

function svg(w, h, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" aria-hidden="true" focusable="false">${body}</svg>\n`;
}


var BUILD = {
  "coin-a": function () { seed = 71;
  var b = "";
  b += leaf(150, 210, 150, 75); b += leaf(230, 120, 140, 20); b += leaf(90, 250, 120, 120, "mid");
  b += leaf(300, 60, 110, -10, "mid"); b += leaf(60, 160, 130, 150);
  b += head(70, 70, 95, "lav");
  b += head(215, 40, 78, "blush");
  b += head(120, 185, 70, "blush");
  b += leaf(250, 150, 100, 45);
  b += head(285, 115, 48, "lav");
  return svg(400, 340, b); },
  "coin-b": function () { seed = 2027;
  var b = "";
  b += leaf(170, 170, 145, 40); b += leaf(80, 240, 140, 95, "mid"); b += leaf(270, 80, 120, 5);
  b += leaf(40, 300, 110, 115);
  b += head(95, 80, 100, "blush");
  b += head(240, 55, 62, "lav");
  b += head(55, 225, 66, "lav");
  b += leaf(190, 210, 95, 60, "mid");
  b += head(170, 175, 50, "blush");
  return svg(400, 360, b); },
  "brin": function () { seed = 1707;
  var b = "";
  b += stem(0, 160, 70, 120);
  b += leaf(30, 150, 110, 30); b += leaf(20, 120, 100, -40, "mid"); b += leaf(60, 190, 90, 70);
  b += head(70, 100, 62, "blush");
  b += head(30, 200, 48, "lav");
  return svg(200, 270, b); },
  "fleur": function () { seed = 30;
  var b = "";
  b += stem(100, 120, 100, 190);
  b += leaf(100, 165, 70, 200); b += leaf(100, 165, 70, -20);
  b += head(100, 85, 58, "blush");
  return svg(200, 200, b); }
};
var cache = {};
function draw() {
  document.querySelectorAll("[data-fleur]").forEach(function (el) {
    var k = el.getAttribute("data-fleur");
    if (!BUILD[k]) return;
    if (!cache[k]) cache[k] = BUILD[k]();
    el.innerHTML = cache[k];
  });
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", draw); else draw();
})();
