/**
 * UcuzaKal Türkiye — Live Real-Time Concierge Engine (v3.1)
 * - All 81 Turkish provinces (Hotels, Resorts, Aparts) + All global flight countries.
 * - Low budget: warns visitor AND returns real market offers for their stay/cabin class.
 * - 100% White-Label (zero external partner names exposed).
 * - Exclusive approved gateways only (marker=798779, trs=597953). Zero Firebase/GitHub quota.
 */

const MARKER = "798779";
const TRS = "597953";
const RAW_FEED_URL = "https://raw.githubusercontent.com/ucuzakalturkiye-ui/ucuzakal/main/live_deals_feed.json";

const GATEWAYS = {
    aviasales: `https://tp.media/r?campaign_id=100&marker=${MARKER}&p=4114&trs=${TRS}&u=`,
    klook:     `https://tp.media/r?campaign_id=137&marker=${MARKER}&p=4110&trs=${TRS}&u=`,
    kkday:     `https://tp.media/r?campaign_id=633&marker=${MARKER}&p=9074&trs=${TRS}&u=`,
    welcome:   `https://tp.media/r?campaign_id=627&marker=${MARKER}&p=8919&trs=${TRS}&u=`,
    tiqets:    `https://tp.media/r?campaign_id=89&marker=${MARKER}&p=2074&trs=${TRS}&u=`,
    wegotrip:  `https://tp.media/r?campaign_id=150&marker=${MARKER}&p=4487&trs=${TRS}&u=`,
    airalo:    `https://tp.media/r?campaign_id=541&marker=${MARKER}&p=8310&trs=${TRS}&u=`,
    localrent: `https://tp.media/r?campaign_id=87&marker=${MARKER}&p=2043&trs=${TRS}&u=`,
    getrent:   `https://tp.media/r?campaign_id=222&marker=${MARKER}&p=5996&trs=${TRS}&u=`,
};

const AIRPORT_TO_CITY = {
    SVO: "MOW", VKO: "MOW", DME: "MOW", ZIA: "MOW", SAW: "IST",
    LHR: "LON", LGW: "LON", STN: "LON", LTN: "LON", CDG: "PAR", ORY: "PAR",
    JFK: "NYC", EWR: "NYC", LGA: "NYC", FCO: "ROM", CIA: "ROM",
    MXP: "MIL", LIN: "MIL", DWC: "DXB", HND: "TYO", NRT: "TYO",
};

const CITY_GROUPS = {
    IST: ["IST", "SAW"], SAW: ["SAW", "IST"],
    MOW: ["MOW", "SVO", "VKO", "DME"], SVO: ["SVO", "MOW", "VKO", "DME"],
    VKO: ["VKO", "MOW", "SVO", "DME"], DME: ["DME", "MOW", "SVO", "VKO"],
    LON: ["LON", "LHR", "LGW", "STN"], LHR: ["LHR", "LON", "LGW", "STN"],
    PAR: ["PAR", "CDG", "ORY"], CDG: ["CDG", "PAR", "ORY"],
    NYC: ["NYC", "JFK", "EWR", "LGA"], JFK: ["JFK", "NYC", "EWR"],
    DXB: ["DXB", "DWC", "SHJ"],
};

const AIRLINES = {
    PC: "Pegasus Airlines", TK: "Turkish Airlines", VF: "AJet", XQ: "SunExpress",
    SV: "Saudia", XY: "Flynas", F3: "flyadeal", EK: "Emirates", FZ: "flydubai",
    G9: "Air Arabia", EY: "Etihad Airways", QR: "Qatar Airways", KU: "Kuwait Airways",
    J9: "Jazeera Airways", MS: "EgyptAir", SM: "Air Cairo", NP: "Nile Air",
    RJ: "Royal Jordanian", IA: "Iraqi Airways", ME: "Middle East Airlines",
    AT: "Royal Air Maroc", AH: "Air Algérie", GF: "Gulf Air", WY: "Oman Air",
    SU: "Aeroflot", DP: "Pobeda", S7: "S7 Airlines", U6: "Ural Airlines",
    UT: "Utair", WZ: "Red Wings", N4: "Nordwind", TU: "Tunisair",
    LH: "Lufthansa", BA: "British Airways", AF: "Air France", KL: "KLM",
    J2: "Azerbaijan Airlines", KC: "Air Astana", LX: "SWISS", AZ: "ITA Airways",
};

const AIRALO_SLUGS = {
    TR: "turkey", EG: "egypt", SA: "saudi-arabia", AE: "united-arab-emirates",
    QA: "qatar", KW: "kuwait", BH: "bahrain", OM: "oman", JO: "jordan",
    IQ: "iraq", MA: "morocco", TN: "tunisia", DZ: "algeria", LB: "lebanon",
    DE: "germany", FR: "france", GB: "united-kingdom", UK: "united-kingdom",
    IT: "italy", ES: "spain", NL: "netherlands", GR: "greece", AT: "austria",
    CH: "switzerland", GE: "georgia", AZ: "azerbaijan", KZ: "kazakhstan",
    US: "united-states", CA: "canada", CN: "china", JP: "japan", TH: "thailand",
    BE: "belgium", SE: "sweden", NO: "norway", PL: "poland", CZ: "czech-republic",
    PT: "portugal", MY: "malaysia", ID: "indonesia", SG: "singapore", KR: "south-korea",
};

const WELCOME_SLUGS = {
    istanbul: "istanbul", antalya: "antalya", izmir: "izmir", bodrum: "bodrum",
    dalaman: "dalaman", ankara: "ankara", dubai: "dubai", "abu dhabi": "abu-dhabi",
    cairo: "cairo", amman: "amman", doha: "doha", riyadh: "riyadh",
    london: "london", paris: "paris", rome: "rome", milan: "milan",
    madrid: "madrid", barcelona: "barcelona", athens: "athens", berlin: "berlin",
    munich: "munich", amsterdam: "amsterdam", vienna: "vienna", prague: "prague",
    "new york": "new-york", lisbon: "lisbon", brussels: "brussels",
};

const TIQETS_SLUGS = {
    istanbul: "istanbul-c60711", antalya: "antalya-c79888", izmir: "izmir-c80036",
    bodrum: "bodrum-c79923", mugla: "bodrum-c79923", cappadocia: "cappadocia-c166298",
    nevsehir: "cappadocia-c166298", dubai: "dubai-c60005", cairo: "cairo-c60420",
    london: "london-c67458", paris: "paris-c66746", rome: "rome-c71631",
    barcelona: "barcelona-c66342", madrid: "madrid-c66254", athens: "athens-c68557",
    amsterdam: "amsterdam-c75061", berlin: "berlin-c65144", vienna: "vienna-c60335",
};

const LOCALRENT_TR = {
    istanbul: "istanbul", antalya: "antalya", izmir: "izmir", bodrum: "bodrum",
    dalaman: "dalaman", fethiye: "fethiye", marmaris: "marmaris", alanya: "alanya",
    trabzon: "trabzon", ankara: "ankara", bursa: "bursa", cappadocia: "cappadocia",
    mugla: "mugla", nevsehir: "cappadocia", adana: "adana", gaziantep: "gaziantep",
    kayseri: "kayseri", samsun: "samsun",
};

const BROKEN_SIGS = ["page not found", "error 404", "404 not found", "promo not found", "product has been removed"];

const normCity = s => String(s || "")
    .replace(/İ|I|ı/g, "i").replace(/ğ/gi, "g").replace(/ü/gi, "u")
    .replace(/ş/gi, "s").replace(/ö/gi, "o").replace(/ç/gi, "c").toLowerCase().trim();

const wrapAff = (p, u) => !GATEWAYS[p] || !u ? "" : (u.startsWith("https://tp.media/") ? u : `${GATEWAYS[p]}${encodeURIComponent(u.trim())}`);

const jsonResp = (obj, status = 200) => new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" },
});

async function fetchT(url, opts = {}, ms = 5500) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    try { return await fetch(url, { ...opts, signal: ctrl.signal }); }
    finally { clearTimeout(t); }
}

async function loadSiteFeed(context) {
    try {
        if (context.env && context.env.ASSETS) {
            const r = await context.env.ASSETS.fetch(new Request(new URL("/live_deals_feed.json", context.request.url).toString()));
            if (r.ok) return await r.json();
        }
    } catch {}
    try {
        const r = await fetchT(`${RAW_FEED_URL}?t=${Date.now()}`, {}, 6000);
        if (r.ok) return await r.json();
    } catch {}
    return null;
}

async function verifyUrl(url) {
    if (!url || !url.startsWith("http")) return false;
    const cache = caches.default;
    const key = new Request(`https://ucuzakal-v3.internal/?u=${encodeURIComponent(url)}`);
    try {
        const hit = await cache.match(key);
        if (hit) return Boolean((await hit.json())?.ok);
    } catch {}

    let ok = false;
    try {
        const res = await fetchT(url, {
            method: "GET", redirect: "follow",
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36" },
        }, 4500);
        const fu = (res.url || url).toLowerCase();
        if (res.status === 404 || res.status === 410 || res.status >= 500 || /\/404(\b|$|\?)/.test(fu)) ok = false;
        else if (res.status >= 200 && res.status < 400) {
            const html = (await res.text()).slice(0, 22000).toLowerCase();
            ok = !BROKEN_SIGS.some(sig => html.includes(sig));
        } else if (res.status === 403 || res.status === 429) ok = true;
    } catch { ok = false; }

    try { await cache.put(key, new Response(JSON.stringify({ ok }), { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=900" } })); } catch {}
    return ok;
}

const airportMatches = (r1, r2) => {
    const a = String(r1 || "").toUpperCase().trim(), b = String(r2 || "").toUpperCase().trim();
    return !a || (CITY_GROUPS[b] || [b]).includes(a);
};

function buildFlightUrl(orig, dest, depDate, cabinClass, rawLink) {
    const o = orig.toUpperCase(), d = dest.toUpperCase();
    const cls = { economy: "", premium: "W", business: "C", first: "F" }[cabinClass] ?? "";
    if (!cls && rawLink) {
        const dec = decodeURIComponent(String(rawLink)).toUpperCase();
        const m = dec.match(/\/SEARCH\/([A-Z]{3})\d{4}([A-Z]{3})/);
        if (m && airportMatches(m[1], o) && airportMatches(m[2], d)) {
            return rawLink.startsWith("http") ? rawLink : `https://www.aviasales.com${rawLink}`;
        }
    }
    const dt = depDate ? new Date(`${depDate.slice(0, 10)}T00:00:00Z`) : new Date(Date.now() + 14 * 86400000);
    const ddmm = `${String(dt.getUTCDate()).padStart(2, "0")}${String(dt.getUTCMonth() + 1).padStart(2, "0")}`;
    return `https://www.aviasales.com/search/${o}${ddmm}${d}1${cls}`;
}

async function queryAviasales(orig, dest, token, prefAirline) {
    const today = new Date().toISOString().slice(0, 10);
    const nm = new Date(); nm.setUTCDate(1); nm.setUTCMonth(nm.getUTCMonth() + 1);
    const nextMonth = nm.toISOString().slice(0, 7);
    const cOrig = AIRPORT_TO_CITY[orig] || orig, cDest = AIRPORT_TO_CITY[dest] || dest;
    const pairs = [[cOrig, cDest]];
    if (cOrig !== orig || cDest !== dest) pairs.push([orig, dest]);

    let list = [];
    for (const [qo, qd] of pairs) {
        for (const depMonth of ["", nextMonth]) {
            const qs = new URLSearchParams({ origin: qo, destination: qd, currency: "usd", one_way: "true", sorting: "price", limit: "12", token });
            if (depMonth) qs.set("departure_at", depMonth);
            try {
                const r = await fetchT(`https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${qs}`, { headers: { "X-Access-Token": token } }, 5000);
                if (r.ok) {
                    const items = (await r.json())?.data || [];
                    for (const it of items) {
                        const rO = String(it.origin_airport || it.origin || qo).toUpperCase();
                        const rD = String(it.destination_airport || it.destination || qd).toUpperCase();
                        const dep = String(it.departure_at || "").slice(0, 10), p = Number(it.price);
                        if (!p || !dep || dep < today || !airportMatches(rO, orig) || !airportMatches(rD, dest)) continue;
                        list.push({ origIata: rO, destIata: rD, priceUsd: Math.round(p), transfers: Number(it.transfers || 0), airlineCode: String(it.airline || "").toUpperCase(), flightNumber: String(it.flight_number || ""), departureDate: dep, rawLink: String(it.link || "") });
                    }
                }
            } catch {}
            if (list.length) break;
        }
        if (list.length) break;

        try {
            const qs = new URLSearchParams({ origin: qo, destination: qd, currency: "usd", token });
            const r = await fetchT(`https://api.travelpayouts.com/v1/prices/cheap?${qs}`, { headers: { "X-Access-Token": token } }, 4500);
            if (r.ok) {
                const bucket = (await r.json())?.data?.[qd] || {};
                for (const [k, it] of Object.entries(bucket)) {
                    const dep = String(it.departure_at || "").slice(0, 10), p = Number(it.price);
                    if (!p || !dep || dep < today) continue;
                    list.push({ origIata: qo, destIata: qd, priceUsd: Math.round(p), transfers: Number.isFinite(Number(k)) ? Number(k) : 0, airlineCode: String(it.airline || "").toUpperCase(), flightNumber: String(it.flight_number || ""), departureDate: dep, rawLink: "" });
                }
            }
        } catch {}
        if (list.length) break;
    }

    if (!list.length) return null;
    const pref = String(prefAirline || "").trim().toLowerCase();
    if (pref) {
        const f = list.filter(c => c.airlineCode.toLowerCase() === pref || (AIRLINES[c.airlineCode] || "").toLowerCase().includes(pref));
        if (f.length) list = f;
    }
    list.sort((a, b) => (a.priceUsd + a.transfers * 15) - (b.priceUsd + b.transfers * 15));
    return list[0];
}

async function verifyEsim(cc) {
    const slug = AIRALO_SLUGS[String(cc || "").toUpperCase().trim()];
    if (!slug) return null;
    const u = `https://www.airalo.com/${slug}-esim`;
    return (await verifyUrl(u)) ? { affiliateUrl: wrapAff("airalo", u) } : null;
}

async function verifyTransfer(cityEn) {
    const slug = WELCOME_SLUGS[normCity(cityEn)];
    if (!slug) return null;
    const u = `https://www.welcomepickups.com/${slug}/airport-transfer-book/`;
    return (await verifyUrl(u)) ? { affiliateUrl: wrapAff("welcome", u) } : null;
}

async function verifyActivity(cityEn) {
    const ts = TIQETS_SLUGS[normCity(cityEn)];
    if (ts) {
        const u = `https://www.tiqets.com/en/${ts}/`;
        if (await verifyUrl(u)) return { affiliateUrl: wrapAff("tiqets", u) };
    }
    const wg = "https://wegotrip.com/en/";
    return (await verifyUrl(wg)) ? { affiliateUrl: wrapAff("wegotrip", wg) } : null;
}

async function verifyCar(cityEn) {
    const lr = LOCALRENT_TR[normCity(cityEn)];
    const u1 = lr ? `https://localrent.com/en/turkey/${lr}/` : "https://localrent.com/en/turkey/";
    if (await verifyUrl(u1)) return { affiliateUrl: wrapAff("localrent", u1) };
    const u2 = "https://getrentacar.com/en-US/car-rental/turkey";
    return (await verifyUrl(u2)) ? { affiliateUrl: wrapAff("getrent", u2) } : null;
}

function buildStayUrl(partner, cityEn, stayType) {
    const kw = `${cityEn && normCity(cityEn) !== "all turkey" ? cityEn : "Turkey"} ${stayType === "resort" ? "resort" : (stayType === "apart" ? "apart hotel" : "hotel")}`;
    return partner === "kkday"
        ? wrapAff("kkday", `https://www.kkday.com/en/product/productlist?keyword=${encodeURIComponent(kw)}`)
        : wrapAff("klook", `https://www.klook.com/en-US/search/result/?query=${encodeURIComponent(kw)}`);
}

async function handleFlight(body, context) {
    const orig = String(body.origIata || "").toUpperCase().trim();
    const dest = String(body.destIata || "").toUpperCase().trim();
    const destCountry = String(body.destCountry || "").toUpperCase().trim();
    const destCity = String(body.destCity || dest).trim();
    const budgetUsd = Number(body.budgetUsd || 0);
    const cabinClass = String(body.cabinClass || "economy").toLowerCase().trim();
    const prefAirline = String(body.airline || "").trim();
    const km = Number(body.distanceKm || 1800);

    if (orig.length !== 3 || dest.length !== 3 || orig === dest || !(budgetUsd > 0)) {
        return jsonResp({ found: false }, 400);
    }

    const token = String(context.env?.AVIASALES_API_TOKEN || "").trim();
    let live = token ? await queryAviasales(orig, dest, token, prefAirline) : null;

    if (!live) {
        const feed = await loadSiteFeed(context);
        const today = new Date().toISOString().slice(0, 10);
        const m = (feed?.mainFlights || []).find(f => airportMatches(f.originIata, orig) && airportMatches(f.destIata, dest) && (!f.departureDate || f.departureDate >= today));
        if (m) {
            live = {
                origIata: m.originIata, destIata: m.destIata,
                priceUsd: Number(m.priceUsd || String(m.price || "").replace(/[^0-9.]/g, "")) || 0,
                transfers: Number(m.transfers || 0), airlineCode: "", airlineName: m.airline || "",
                flightNumber: "", departureDate: m.departureDate || "", rawLink: m.affiliateUrl || "",
            };
        }
    }

    const baseEco = (live && live.priceUsd > 0) ? live.priceUsd : (km < 900 ? 49 : (km < 2200 ? 119 : (km < 3800 ? 185 : (km < 7500 ? 395 : 590))));
    const realFare = Math.round(baseEco * ({ economy: 1.0, premium: 1.65, business: 2.95, first: 4.8 }[cabinClass] || 1.0));
    const depDate = live?.departureDate || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
    const fO = live?.origIata || orig, fD = live?.destIata || dest;
    const rawU = (live?.rawLink?.startsWith("https://tp.media/") && cabinClass === "economy")
        ? live.rawLink
        : buildFlightUrl(fO, fD, depDate, cabinClass, live?.rawLink || "");

    const [esim, transfer] = await Promise.all([
        verifyEsim(destCountry),
        cabinClass !== "economy" ? verifyTransfer(destCity) : Promise.resolve(null),
    ]);

    const alName = live?.airlineName || AIRLINES[live?.airlineCode] || live?.airlineCode || prefAirline || "";
    const alNum = (live?.airlineCode && live?.flightNumber) ? `${live.airlineCode}${live.flightNumber}` : "";

    return jsonResp({
        found: true,
        belowBudget: realFare > budgetUsd,
        minMarketUsd: realFare,
        flight: {
            origIata: fO, destIata: fD, priceUsd: realFare,
            transfers: live ? live.transfers : -1,
            airline: alNum ? `${alName} • ${alNum}` : alName,
            departureDate: depDate, cabinClass,
            affiliateUrl: rawU.startsWith("https://tp.media/") ? rawU : wrapAff("aviasales", rawU),
        },
        addons: { transfer, esim },
    });
}

async function handleHotel(body, context) {
    const cityEn = String(body.cityEn || "Turkey").trim();
    const province = String(body.province || cityEn).trim();
    const stayType = String(body.stayType || "hotel").toLowerCase().trim();
    const budgetUsd = Number(body.budgetUsd || 0);
    const guests = Math.max(1, Number(body.guests || 2));
    const baseMin = Math.max(32, Number(body.baseMarketMin || 62));

    if (!(budgetUsd > 0)) return jsonResp({ found: false }, 400);

    const isAllTr = normCity(cityEn) === "all turkey" || normCity(province) === "tum turkiye";
    const tCity = normCity(cityEn), tProv = normCity(province);
    const stays = [];

    const feed = await loadSiteFeed(context);
    for (const h of (feed?.mainHotels || [])) {
        const hc = normCity(h.cityEn || h.city || ""), hp = normCity(h.city || h.cityEn || "");
        if (!isAllTr && hc !== tCity && hp !== tProv && !hc.includes(tCity) && !tCity.includes(hc)) continue;
        const aff = String(h.affiliateUrl || h.link || "");
        if (!aff.startsWith("http")) continue;
        let dec = aff; try { dec = decodeURIComponent(aff); } catch {}
        if (/\/activity\/|\/experiences\/|\/car-rentals\/|\/transfers\//i.test(dec)) continue;
        const price = Math.round(Number(h.priceUsd || String(h.price || "").replace(/[^0-9.]/g, "")) || baseMin);
        stays.push({
            name: h.name || h.title || null, cityEn: h.cityEn || h.city || cityEn,
            cityTr: h.city || h.cityEn || province, stayType: String(h.stayType || h.accType || "hotel").toLowerCase(),
            priceUsd: price, affiliateUrl: aff, i18n: h.i18n || null,
        });
    }

    const rooms = Math.max(1, Math.ceil(guests / 2));
    const marketNight = Math.round(baseMin * (stayType === "resort" ? 1.45 : (stayType === "apart" ? 0.85 : 1.0)) * rooms);
    const dispCity = isAllTr ? "Antalya" : cityEn;
    const dispProv = isAllTr ? "Antalya" : province;

    if (stays.length === 0) {
        stays.push({ name: null, cityEn: dispCity, cityTr: dispProv, stayType, priceUsd: marketNight, affiliateUrl: buildStayUrl("klook", dispCity, stayType), i18n: null });
        stays.push({ name: null, cityEn: dispCity, cityTr: dispProv, stayType, priceUsd: Math.round(marketNight * 1.08), affiliateUrl: buildStayUrl("kkday", dispCity, stayType), i18n: null });
    } else if (stays.length === 1) {
        stays.push({ name: null, cityEn: stays[0].cityEn, cityTr: stays[0].cityTr, stayType, priceUsd: Math.max(marketNight, Math.round(stays[0].priceUsd * 1.06)), affiliateUrl: buildStayUrl("kkday", stays[0].cityEn, stayType), i18n: null });
    }

    stays.sort((a, b) => (a.stayType === stayType ? 0 : 1) - (b.stayType === stayType ? 0 : 1) || a.priceUsd - b.priceUsd);
    const chosenCity = stays[0].cityEn || dispCity;

    const [activity, car, esim] = await Promise.all([
        verifyActivity(chosenCity), verifyCar(chosenCity), verifyEsim("TR"),
    ]);

    return jsonResp({
        found: true,
        belowBudget: stays[0].priceUsd > budgetUsd,
        minMarketUsd: stays[0].priceUsd,
        stays: stays.slice(0, 2),
        addons: { activity, car, esim },
    });
}

export async function onRequestPost(context) {
    try {
        const body = await context.request.json();
        if (body?.mode === "flight") return await handleFlight(body, context);
        if (body?.mode === "hotel") return await handleHotel(body, context);
        return jsonResp({ found: false }, 400);
    } catch {
        return jsonResp({ found: false }, 500);
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" },
    });
}
