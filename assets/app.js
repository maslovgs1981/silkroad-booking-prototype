/* Silk Road Holiday Homes, booking prototype.
 * EXAMPLE DATA ONLY: apartments, prices, fees and booked dates below are placeholders
 * for the prototype. In production they come from the PMS / channel manager
 * (availability synced with Airbnb and Booking.com). */

var SITE = {
  phone: "+971-55-929-50-22",
  phoneRaw: "971559295022",
  cleaningNote: "one-time",
  // EXAMPLE: Dubai Tourism Dirham fee for holiday homes, charged per bedroom per night
  // (a studio counts as one bedroom). Set the real rate for the property class in the admin.
  tourismDirhamPerBedroomNight: 15
};

// EXAMPLE apartments. Photos are placeholders: the live site has no property photos yet.
var APARTMENTS = [
  {
    id: "marina-1br", area: "Dubai Marina", title: "Marina View 1 Bedroom with Balcony",
    bedrooms: 1, bathrooms: 1, beds: 2, guests: 3, size: 78, price: 650, cleaning: 150,
    lat: 25.0805, lon: 55.1403, booked: [[3, 6], [15, 19], [33, 37], [48, 50]]
  },
  {
    id: "jbr-2br", area: "JBR", title: "Beachfront 2 Bedroom Apartment at JBR",
    bedrooms: 2, bathrooms: 2, beds: 3, guests: 5, size: 120, price: 1100, cleaning: 220,
    lat: 25.0781, lon: 55.1331, booked: [[1, 4], [10, 14], [26, 30], [41, 45]]
  },
  {
    id: "palm-studio", area: "Palm Jumeirah", title: "Cozy Studio on Palm Jumeirah",
    bedrooms: 0, bathrooms: 1, beds: 1, guests: 2, size: 45, price: 520, cleaning: 120,
    lat: 25.1124, lon: 55.1390, booked: [[5, 9], [20, 22], [35, 40]]
  },
  {
    id: "beachfront-2br", area: "Emaar Beachfront", title: "Sea View 2 Bedroom, Emaar Beachfront",
    bedrooms: 2, bathrooms: 2, beds: 2, guests: 4, size: 110, price: 1250, cleaning: 220,
    lat: 25.0952, lon: 55.1412, booked: [[2, 5], [12, 16], [29, 33], [52, 56]]
  },
  {
    id: "bluewaters-1br", area: "Bluewaters Island", title: "Bluewaters 1 Bedroom near the Beach",
    bedrooms: 1, bathrooms: 1, beds: 1, guests: 3, size: 82, price: 890, cleaning: 150,
    lat: 25.0802, lon: 55.1212, booked: [[4, 8], [18, 23], [38, 42]]
  },
  {
    id: "marina-3br", area: "Dubai Marina", title: "Family 3 Bedroom with Marina View",
    bedrooms: 3, bathrooms: 3, beds: 4, guests: 7, size: 165, price: 1650, cleaning: 280,
    lat: 25.0772, lon: 55.1375, booked: [[7, 11], [24, 27], [44, 49]]
  }
];

var AMENITIES = ["Free Wi-Fi", "Air conditioning", "Fully equipped kitchen", "Washing machine",
  "Swimming pool", "Gym", "Free parking", "Smart TV", "Fresh linen and towels",
  "Self check-in", "Beach access nearby", "Workspace"];

var RULES = [
  ["Check-in", "from 15:00, self check-in"],
  ["Check-out", "until 11:00"],
  ["Guests", "passport or Emirates ID of every guest before arrival"],
  ["Smoking", "not allowed inside the apartment"],
  ["Parties", "no parties or events"],
  ["Pets", "not allowed"],
  ["Quiet hours", "22:00 to 08:00"]
];

/* ---------- helpers ---------- */
var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var MON3 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function today() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
function iso(d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
function parseIso(s) { if (!s) return null; var p = s.split("-"); if (p.length !== 3) return null; var d = new Date(+p[0], +p[1] - 1, +p[2]); return isNaN(d) ? null : d; }
function nightsBetween(a, b) { return Math.round((b - a) / 86400000); }
function nice(d) { return d ? d.getDate() + " " + MON3[d.getMonth()] + " " + d.getFullYear() : "Add date"; }
function aed(n) { return "AED " + Math.round(n).toLocaleString("en-US"); }
function qs(name) { return new URLSearchParams(location.search).get(name); }
function findApt(id) { for (var i = 0; i < APARTMENTS.length; i++) if (APARTMENTS[i].id === id) return APARTMENTS[i]; return APARTMENTS[0]; }
function bedLabel(a) { return a.bedrooms === 0 ? "Studio" : a.bedrooms + (a.bedrooms === 1 ? " bedroom" : " bedrooms"); }
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

// Booked dates are stored as day offsets from today so the demo always looks current.
function bookedSet(a) {
  var s = {}, t = today();
  a.booked.forEach(function (r) { for (var i = r[0]; i < r[1]; i++) s[iso(addDays(t, i))] = true; });
  return s;
}
function rangeFree(a, from, to) {
  var s = bookedSet(a);
  for (var d = new Date(from); d < to; d = addDays(d, 1)) if (s[iso(d)]) return false;
  return true;
}
function quote(a, from, to) {
  var n = nightsBetween(from, to);
  var stay = n * a.price;
  var tdf = n * Math.max(1, a.bedrooms) * SITE.tourismDirhamPerBedroomNight;
  return { nights: n, stay: stay, cleaning: a.cleaning, tdf: tdf, total: stay + a.cleaning + tdf };
}
function waLink(text) { return "https://wa.me/" + SITE.phoneRaw + "?text=" + encodeURIComponent(text); }

var ICON_WA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#25d366" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Z"/><path fill="#fff" d="M17.3 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1l-.9 1.1c-.2.2-.3.2-.6.1a7.6 7.6 0 0 1-3.8-3.3c-.3-.5.3-.5.8-1.6.1-.2 0-.4 0-.5l-.9-2.1c-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3 1.8.8 2.5.8 3.4.7.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.5-.3Z"/></svg>';
var ICON_GLOBE = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#141414" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3Z"/></svg>';

/* ---------- shared header / footer ---------- */
function renderChrome(active) {
  var pages = [["index.html", "Catalog"], ["apartment.html", "Apartment page"], ["booking.html", "Booking step"]];
  var demo = '<div class="demo-note">Prototype for Silk Road Holiday Homes, sample data. Screens:' +
    pages.map(function (p, i) { return '<a href="' + p[0] + '" class="' + (i === active ? "on" : "") + '">' + p[1] + "</a>"; }).join("") + "</div>";
  var header = '<header class="header">' + demo + '<div class="container">' +
    '<nav class="nav"><a href="#">About us</a><a href="index.html" class="active">Catalog</a><a href="#">Cooperation with us</a></nav>' +
    '<a class="logo" href="index.html"><img src="assets/img/logo.svg" alt="Silk Road Holiday Homes" width="100" height="56"></a>' +
    '<div class="header-actions"><a class="btn-outline" href="tel:+' + SITE.phoneRaw + '">' + SITE.phone + '</a>' +
    '<button class="btn-outline dark" aria-label="Language" style="padding:0 16px">' + ICON_GLOBE + '</button>' +
    '<button class="burger" aria-label="Menu"><span></span></button></div></div></header>';
  var footer = '<footer class="footer"><div class="container">' +
    '<div class="script-title">Stay in touch<br>with us</div>' +
    '<div class="socials">' +
    '<a href="https://www.instagram.com/dubai_apartment_" aria-label="Instagram"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#141414" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="#141414"/></svg></a>' +
    '<a href="https://wa.me/' + SITE.phoneRaw + '" aria-label="WhatsApp"><svg width="26" height="26" viewBox="0 0 24 24"><path fill="#141414" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Z"/><path fill="#fff" d="M17.3 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1l-.9 1.1c-.2.2-.3.2-.6.1a7.6 7.6 0 0 1-3.8-3.3c-.3-.5.3-.5.8-1.6.1-.2 0-.4 0-.5l-.9-2.1c-.2-.5-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3 1.8.8 2.5.8 3.4.7.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.5-.3Z"/></svg></a>' +
    '<a href="https://www.facebook.com/share/15TpghRd7U/" aria-label="Facebook"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#141414" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M13.5 21v-7h2.3l.4-2.7h-2.7V9.6c0-.8.3-1.3 1.4-1.3h1.4V5.9a17 17 0 0 0-2-.1c-2 0-3.4 1.2-3.4 3.5v2H8.6V14h2.3v7"/></svg></a>' +
    "</div>" +
    '<nav><a href="#">About us</a><a href="index.html">Catalog</a><a href="#">Cooperation with us</a></nav>' +
    '<div class="header-actions"><a class="btn-outline dark" href="tel:+' + SITE.phoneRaw + '">' + SITE.phone + "</a></div>" +
    "</div></footer>" +
    '<a class="wa-float" href="https://wa.me/' + SITE.phoneRaw + '" aria-label="Chat on WhatsApp">' + ICON_WA + "</a>";
  document.getElementById("site-header").outerHTML = header;
  document.getElementById("site-footer").outerHTML = footer;
  // Header is taller by the demo strip
  var h = document.querySelector(".header");
  function pad() { document.body.style.paddingTop = h.offsetHeight + "px"; }
  pad(); window.addEventListener("resize", pad);
}

function photoPh(label) { return '<div class="ph"><span>' + (label || "photo") + "</span></div>"; }

/* ---------- screen 1: catalog ---------- */
function initCatalog() {
  renderChrome(0);
  var areaSel = document.getElementById("f-area");
  var areas = [];
  APARTMENTS.forEach(function (a) { if (areas.indexOf(a.area) < 0) areas.push(a.area); });
  areas.forEach(function (a) { var o = document.createElement("option"); o.value = a; o.textContent = a; areaSel.appendChild(o); });

  var fIn = document.getElementById("f-in"), fOut = document.getElementById("f-out"), fG = document.getElementById("f-guests");
  fIn.min = iso(today()); fOut.min = iso(addDays(today(), 1));
  fIn.addEventListener("change", function () {
    var d = parseIso(fIn.value); if (!d) return;
    fOut.min = iso(addDays(d, 1));
    if (!parseIso(fOut.value) || parseIso(fOut.value) <= d) fOut.value = iso(addDays(d, 3));
  });

  var bedFilter = "any";
  document.querySelectorAll("[data-bed]").forEach(function (c) {
    c.addEventListener("click", function () {
      document.querySelectorAll("[data-bed]").forEach(function (x) { x.classList.remove("on"); });
      c.classList.add("on"); bedFilter = c.getAttribute("data-bed"); draw();
    });
  });

  function draw() {
    var area = areaSel.value, g = +fG.value || 1, from = parseIso(fIn.value), to = parseIso(fOut.value);
    var datesOk = from && to && to > from;
    var list = APARTMENTS.filter(function (a) {
      if (area && a.area !== area) return false;
      if (a.guests < g) return false;
      if (bedFilter !== "any") { var b = +bedFilter; if (b === 3 ? a.bedrooms < 3 : a.bedrooms !== b) return false; }
      if (datesOk && !rangeFree(a, from, to)) return false;
      return true;
    });
    var params = "&guests=" + g + (datesOk ? "&from=" + iso(from) + "&to=" + iso(to) : "");
    document.getElementById("count").textContent = list.length + (list.length === 1 ? " apartment" : " apartments") +
      (datesOk ? " available " + nice(from) + " to " + nice(to) : " in Dubai");
    var html = list.map(function (a) {
      var url = "apartment.html?id=" + a.id + params;
      var tot = datesOk ? '<div class="muted">' + aed(quote(a, from, to).total) + " for " + nightsBetween(from, to) + " nights</div>" : "";
      return '<a class="card" href="' + url + '">' +
        '<div class="card-photo"><span class="badge-host"><i></i>Superhost</span>' + photoPh() + "</div>" +
        '<div class="card-body">' +
        '<div class="card-area"><img src="assets/img/geo.svg" alt="">' + esc(a.area) + "</div>" +
        "<h3>" + esc(a.title) + "</h3>" +
        '<div class="specs"><span>' + bedLabel(a) + "</span><span>up to " + a.guests + " guests</span><span>" + a.size + " m²</span></div>" +
        '<div class="card-foot"><div><div class="price">' + aed(a.price) + " <small>/ night</small></div>" + tot + "</div>" +
        '<span class="link">View <img src="assets/img/arrow.svg" alt="" width="16"></span></div>' +
        "</div></a>";
    }).join("");
    document.getElementById("grid").innerHTML = html ||
      '<div class="empty">No apartments match these filters. Try other dates or <a href="https://wa.me/' + SITE.phoneRaw + '" style="color:var(--orange)">ask us on WhatsApp</a>.</div>';
  }
  document.getElementById("filter").addEventListener("submit", function (e) { e.preventDefault(); draw(); });
  [areaSel, fG, fIn, fOut].forEach(function (el) { el.addEventListener("change", draw); });
  draw();
}

/* ---------- screen 2: apartment ---------- */
function initApartment() {
  renderChrome(1);
  var a = findApt(qs("id") || "jbr-2br");
  var booked = bookedSet(a);
  var t = today();
  var from = parseIso(qs("from")), to = parseIso(qs("to"));
  if (!(from && to && to > from && from >= t && rangeFree(a, from, to))) { from = null; to = null; }
  var guests = Math.min(a.guests, Math.max(1, +qs("guests") || 2));

  document.title = a.title + " | Silk Road Holiday Homes";
  document.getElementById("apt-title").textContent = a.title;
  document.getElementById("apt-crumb").textContent = a.title;
  document.getElementById("apt-area").innerHTML = '<img src="assets/img/geo.svg" alt="">' + esc(a.area) + ", Dubai";
  document.getElementById("gallery").innerHTML = [1, 2, 3, 4, 5].map(function () { return photoPh(); }).join("");
  document.getElementById("facts").innerHTML =
    '<div class="fact"><b>' + bedLabel(a) + "</b></div>" +
    '<div class="fact"><b>' + a.beds + "</b> beds</div>" +
    '<div class="fact"><b>' + a.bathrooms + "</b> bathroom" + (a.bathrooms > 1 ? "s" : "") + "</div>" +
    '<div class="fact">up to <b>' + a.guests + "</b> guests</div>" +
    '<div class="fact"><b>' + a.size + "</b> m²</div>";
  document.getElementById("desc").innerHTML =
    "<p>Bright " + bedLabel(a).toLowerCase() + " apartment in " + esc(a.area) + ", a short walk from the free public beach. " +
    "Fresh linen and towels, a fully equipped kitchen and fast Wi-Fi are ready for your arrival. " +
    "Self check-in lets you drop in at any time, and our team answers on WhatsApp around the clock.</p>" +
    '<p class="muted" style="margin-top:10px">Sample description for the prototype. Each apartment gets its own text from the admin panel.</p>';
  document.getElementById("amen").innerHTML = AMENITIES.map(function (x) { return "<li>" + x + "</li>"; }).join("");
  document.getElementById("rules").innerHTML = RULES.map(function (r) { return "<li><b>" + r[0] + "</b><span>" + r[1] + "</span></li>"; }).join("");
  var d = 0.012;
  document.getElementById("map").src = "https://www.openstreetmap.org/export/embed.html?bbox=" +
    (a.lon - d * 1.6) + "%2C" + (a.lat - d) + "%2C" + (a.lon + d * 1.6) + "%2C" + (a.lat + d) + "&layer=mapnik&marker=" + a.lat + "%2C" + a.lon;
  document.getElementById("map-area").textContent = a.area;
  document.querySelectorAll(".js-price").forEach(function (el) { el.innerHTML = aed(a.price) + " <small>/ night</small>"; });

  var msg = document.getElementById("cal-msg");
  var month0 = new Date(t.getFullYear(), t.getMonth(), 1);

  function drawCal() {
    var out = "";
    for (var m = 0; m < 2; m++) {
      var first = new Date(month0.getFullYear(), month0.getMonth() + m, 1);
      var dim = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
      var lead = (first.getDay() + 6) % 7; // Monday first
      out += '<div class="cal-month"><h3>' + MONTHS[first.getMonth()] + " " + first.getFullYear() + '</h3><div class="cal-grid">';
      ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].forEach(function (w) { out += '<div class="cal-dow">' + w + "</div>"; });
      for (var i = 0; i < lead; i++) out += '<div class="day blank"></div>';
      for (var dd = 1; dd <= dim; dd++) {
        var day = new Date(first.getFullYear(), first.getMonth(), dd), k = iso(day), cls = "day";
        if (day < t) cls += " past";
        else if (booked[k]) cls += " booked";
        if (from && iso(from) === k) cls += " start";
        if (to && iso(to) === k) cls += " end";
        if (from && to && day > from && day < to) cls += " in-range";
        if (from && !to && iso(from) === k) cls += " end";
        out += '<button type="button" class="' + cls + '" data-d="' + k + '"' + (cls.indexOf("past") > -1 || cls.indexOf("booked") > -1 ? " disabled" : "") + ">" + dd + "</button>";
      }
      out += "</div></div>";
    }
    document.getElementById("cal").innerHTML = out;
    document.querySelectorAll("#cal .day[data-d]").forEach(function (b) {
      b.addEventListener("click", function () { pick(parseIso(b.getAttribute("data-d"))); });
    });
    drawQuote();
  }

  function pick(day) {
    msg.textContent = "";
    if (!from || (from && to) || day <= from) { from = day; to = null; }
    else {
      if (!rangeFree(a, from, day)) { msg.textContent = "Some nights in this range are already booked. Please choose other dates."; from = day; to = null; }
      else to = day;
    }
    drawCal();
  }

  function drawQuote() {
    document.getElementById("bb-in").textContent = nice(from);
    document.getElementById("bb-out").textContent = to ? nice(to) : "Add date";
    document.getElementById("bb-g").textContent = guests;
    var lines = document.getElementById("lines"), book = document.getElementById("book-now"), mb = document.getElementById("mb-total");
    if (from && to) {
      var q = quote(a, from, to);
      lines.innerHTML =
        "<li><span>" + aed(a.price) + " × " + q.nights + " night" + (q.nights > 1 ? "s" : "") + "</span><span>" + aed(q.stay) + "</span></li>" +
        "<li><span>Cleaning fee</span><span>" + aed(q.cleaning) + "</span></li>" +
        "<li><span>Tourism Dirham fee (" + Math.max(1, a.bedrooms) + " × AED " + SITE.tourismDirhamPerBedroomNight + " × " + q.nights + ")</span><span>" + aed(q.tdf) + "</span></li>" +
        '<li class="total"><span>Total</span><span>' + aed(q.total) + "</span></li>";
      book.disabled = false;
      book.textContent = "Book now";
      mb.innerHTML = aed(q.total) + "<small>" + q.nights + " nights, " + nice(from).slice(0, -5) + " to " + nice(to).slice(0, -5) + "</small>";
    } else {
      lines.innerHTML = '<li><span class="muted">' + (from ? "Now choose the check-out date in the calendar" : "Choose check-in and check-out dates in the calendar") + "</span></li>";
      book.disabled = true;
      book.textContent = "Select dates";
      mb.innerHTML = aed(a.price) + "<small>per night</small>";
    }
    var txt = "Hello! I'm interested in " + a.title + (from && to ? ", " + nice(from) + " to " + nice(to) : "") + ", " + guests + " guests.";
    document.querySelectorAll(".js-wa").forEach(function (el) { el.href = waLink(txt); });
  }

  function goBook() {
    if (!(from && to)) { document.getElementById("availability").scrollIntoView({ behavior: "smooth" }); return; }
    location.href = "booking.html?id=" + a.id + "&from=" + iso(from) + "&to=" + iso(to) + "&guests=" + guests;
  }
  document.getElementById("book-now").addEventListener("click", goBook);
  document.getElementById("mb-book").addEventListener("click", goBook);
  document.getElementById("g-minus").addEventListener("click", function () { guests = Math.max(1, guests - 1); drawQuote(); });
  document.getElementById("g-plus").addEventListener("click", function () { guests = Math.min(a.guests, guests + 1); drawQuote(); });
  document.getElementById("g-max").textContent = "max " + a.guests;
  document.body.classList.add("has-bar");
  drawCal();
}

/* ---------- screen 3: booking step ---------- */
function initBooking() {
  renderChrome(2);
  var a = findApt(qs("id") || "jbr-2br");
  var t = today();
  var from = parseIso(qs("from")), to = parseIso(qs("to"));
  if (!(from && to && to > from && rangeFree(a, from, to))) {
    // EXAMPLE default stay for opening the screen directly: first free 4 nights
    for (var i = 1; i < 60; i++) { var f = addDays(t, i); if (rangeFree(a, f, addDays(f, 4))) { from = f; to = addDays(f, 4); break; } }
  }
  var guests = Math.min(a.guests, Math.max(1, +qs("guests") || 2));
  var q = quote(a, from, to);

  var gSel = document.getElementById("guests");
  for (var g = 1; g <= a.guests; g++) { var o = document.createElement("option"); o.value = g; o.textContent = g + (g === 1 ? " guest" : " guests"); if (g === guests) o.selected = true; gSel.appendChild(o); }

  document.getElementById("s-title").textContent = a.title;
  document.getElementById("s-area").textContent = a.area + ", Dubai";
  document.getElementById("back").href = "apartment.html?id=" + a.id + "&from=" + iso(from) + "&to=" + iso(to) + "&guests=" + guests;
  function drawSum() {
    document.getElementById("s-rows").innerHTML =
      "<li><span>Check-in</span><span>" + nice(from) + ", from 15:00</span></li>" +
      "<li><span>Check-out</span><span>" + nice(to) + ", until 11:00</span></li>" +
      "<li><span>Guests</span><span>" + gSel.value + "</span></li>";
  }
  document.getElementById("s-lines").innerHTML =
    "<li><span>" + aed(a.price) + " × " + q.nights + " nights</span><span>" + aed(q.stay) + "</span></li>" +
    "<li><span>Cleaning fee</span><span>" + aed(q.cleaning) + "</span></li>" +
    "<li><span>Tourism Dirham fee</span><span>" + aed(q.tdf) + "</span></li>" +
    '<li class="total"><span>Total to pay</span><span>' + aed(q.total) + "</span></li>";
  document.getElementById("pay").textContent = "Pay " + aed(q.total);
  gSel.addEventListener("change", drawSum);
  drawSum();

  document.getElementById("book-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    ["name", "phone", "email"].forEach(function (id) {
      var el = document.getElementById(id), v = el.value.trim(), good = v.length > 1;
      if (id === "email") good = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
      if (id === "phone") good = v.replace(/\D/g, "").length >= 7;
      el.parentNode.classList.toggle("err", !good);
      if (!good) ok = false;
    });
    if (!document.getElementById("agree").checked) { ok = false; document.getElementById("agree").focus(); }
    if (!ok) return;
    document.getElementById("m-sum").textContent = aed(q.total) + " for " + a.title + ", " + nice(from) + " to " + nice(to) + ".";
    document.getElementById("modal").hidden = false;
  });
  document.getElementById("m-close").addEventListener("click", function () { document.getElementById("modal").hidden = true; });
}
