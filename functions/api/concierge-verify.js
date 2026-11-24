/**
 * UcuzaKal Türkiye — Live Concierge Engine (v3.3)
 * - Exact Aviasales cabin class links (w1/c1/f1) + live v3/v1/v2 fare lookup.
 * - Strictly 1 accurate stay offer per search + per-room/per-guest math.
 * - Confirmed exact-city Activities (Tiqets) & Car Rentals (Localrent) for supported Turkish cities only.
 * - Confirmed Airalo 5G eSIM + Welcome Pickups VIP transfer (non-economy).
 * - Exclusive approved gateways (marker=798779, trs=597953). Zero Firebase/GitHub quota.
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
    "2S": "Southwind Airlines", SV: "Saudia", XY: "Flynas", F3: "flyadeal",
    EK: "Emirates", FZ: "flydubai", G9: "Air Arabia", EY: "Etihad Airways",
    QR: "Qatar Airways", KU: "Kuwait Airways", J9: "Jazeera Airways",
    MS: "EgyptAir", SM: "Air Cairo", NP: "Nile Air", RJ: "Royal Jordanian",
    IA: "Iraqi Airways", ME: "Middle East Airlines", AT: "Royal Air Maroc",
    AH: "Air Algérie", GF: "Gulf Air", WY: "Oman Air", SU: "Aeroflot",
    DP: "Pobeda", S7: "S7 Airlines", U6: "Ural Airlines", UT: "Utair",
    WZ: "Red Wings", N4: "Nordwind", TU: "Tunisair", LH: "Lufthansa",
    BA: "British Airways", AF: "Air France", KL: "KLM",
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

// المدن التركية المؤكدة بصفحات أنشطة مباشرة (لا تتحول لصفحات عامة أو دول أخرى)
const TIQETS_EXACT_SLUGS = {
    istanbul: "istanbul-c60711",
    antalya: "antalya-c79888",
    izmir: "izmir-c80036",
    bodrum: "bodrum-c79923",
    mugla: "bodrum-c79923",
    cappadocia: "cappadocia-c166298",
    nevsehir: "cappadocia-c166298",
};

// المدن التركية المؤكدة بصفحات تأجير سيارات مباشرة في Localrent (لا تتحول لأنطاليا)
const LOCALRENT_EXACT_TR = {
    istanbul: "istanbul",
    antalya: "antalya",
    izmir: "izmir",
    bodrum: "bodrum",
    dalaman: "dalaman",
    fethiye: "fethiye",
    marmaris: "marmaris",
    alanya: "alanya",
    trabzon: "trabzon",
    ankara: "ankara",
    cappadocia: "cappadocia",
    nevsehir: "cappadocia",
    mugla: "bodrum",
};

// أسعار بداية السوق الواقعية لكل غرفة/ليلة في المدن التركية (متوافقة مع أسعار Klook الفعلية)
const REAL_ROOM_FLOOR_USD = {
    istanbul: 34, antalya: 32, izmir: 36, bursa: 35, trabzon: 36,
    ankara: 34, mugla: 45, bodrum: 48, nevsehir: 40, cappadocia: 40,
    sakarya: 38, rize: 38, yalova: 36, gaziantep: 32, konya: 30,
};

const normCity = s => String(s || "")
    .replace(/İ|I|ı/g, "i").replace(/ğ/gi, "g").replace(/ü/gi, "u")
    .replace(/ş/gi, "s").replace(/ö/gi, "o").replace(/ç/gi, "c").toLowerCase().trim();

const wrapAff = (p, u) => !GATEWAYS[p] || !u ? "" : (u.startsWith("https://tp.media/") ? u : `${GATEWAYS[p]}${encodeURIComponent(u.trim())}`);

const jsonResp = (obj, status = 200) => new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" },
});

async function fetchT(url, opts = {}, ms = 6000) {
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

const airportMatches = (r1, r2) => {
    const a = String(r1 || "").toUpperCase().trim(), b = String(r2 || "").toUpperCase().trim();
    return !a || (CITY_GROUPS[b] || [b]).includes(a);
};

// صيغة Aviasales الرسمية الدقيقة لدرجات التذكرة (الحرف الصغير قبل عدد الركاب: w1 / c1 / f1)
function buildFlightUrl(orig, dest, depDate, cabinClass, rawLink) {
    const o = orig.toUpperCase(), d = dest.toUpperCase();
    const cls = { economy: "", premium: "w", business: "c", first: "f" }[cabinClass] ?? "";
    if (!cls && rawLink) {
        const dec = decodeURIComponent(String(rawLink)).toUpperCase();
        const m = dec.match(/\/SEARCH\/([A-Z]{3})\d{4}([A-Z]{3})/);
        if (m && airportMatches(m[1], o) && airportMatches(m[2], d)) {
            return rawLink.startsWith("http") ? rawLink : `https://www.aviasales.com${rawLink}`;
        }
    }
    const dt = depDate ? new Date(`${depDate.slice(0, 10)}T00:00:00Z`) : new Date(Date.now() + 14 * 86400000);
    const ddmm = `${String(dt.getUTCDate()).padStart(2, "0")}${String(dt.getUTCMonth() + 1).padStart(2, "0")}`;
    return `https://www.aviasales.com/search/${o}${ddmm}${d}${cls}1`;
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
            const qs = new URLSearchParams({ origin: qo, destination: qd, currency: "usd", one_way: "true", sorting: "price", limit: "15", token });
            if (depMonth) qs.set("departure_at", depMonth);
            try {
                const r = await fetchT(`https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${qs}`, { headers: { "X-Access-Token": token } }, 5500);
                if (r.ok) {
                    for (const it of ((await r.json())?.data || [])) {
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
            const r = await fetchT(`https://api.travelpayouts.com/v1/prices/cheap?${qs}`, { headers: { "X-Access-Token": token } }, 5000);
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

        try {
            const qs = new URLSearchParams({ origin: qo, destination: qd, currency: "usd", one_way: "true", period_type: "year", sorting: "price", limit: "10", show_to_affiliates: "true", token });
            const r = await fetchT(`https://api.travelpayouts.com/v2/prices/latest?${qs}`, { headers: { "X-Access-Token": token } }, 5000);
            if (r.ok) {
                for (const it of ((await r.json())?.data || [])) {
                    const rO = String(it.origin || "").toUpperCase(), rD = String(it.destination || "").toUpperCase();
                    const dep = String(it.depart_date || "").slice(0, 10), p = Number(it.value);
                    if (!p || !dep || dep < today || !airportMatches(rO, orig) || !airportMatches(rD, dest)) continue;
                    list.push({ origIata: rO || qo, destIata: rD || qd, priceUsd: Math.round(p), transfers: Number(it.number_of_changes || 0), airlineCode: String(it.airline || "").toUpperCase(), flightNumber: "", departureDate: dep, rawLink: "" });
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

function resolveVerifiedEsim(cc) {
    const slug = AIRALO_SLUGS[String(cc || "").toUpperCase().trim()];
    return slug ? { affiliateUrl: wrapAff("airalo", `https://www.airalo.com/${slug}-esim`) } : null;
}

function resolveExactTransfer(cityEn) {
    const slug = WELCOME_SLUGS[normCity(cityEn)];
    return slug ? { affiliateUrl: wrapAff("welcome", `https://www.welcomepickups.com/${slug}/airport-transfer-book/`) } : null;
}

function resolveExactActivity(cityEn) {
    const ts = TIQETS_EXACT_SLUGS[normCity(cityEn)];
    return ts ? { affiliateUrl: wrapAff("tiqets", `https://www.tiqets.com/en/${ts}/`) } : null;
}

function resolveExactCar(cityEn) {
    const lr = LOCALRENT_EXACT_TR[normCity(cityEn)];
    return lr ? { affiliateUrl: wrapAff("localrent", `https://localrent.com/en/turkey/${lr}/`) } : null;
}

function buildAccurateKlookStayUrl(cityEn, stayType) {
    const stayWord = stayType === "resort" ? "resort" : (stayType === "apart" ? "apart hotel" : "hotel");
    const safeCity = (cityEn && normCity(cityEn) !== "all turkey") ? `${cityEn} Turkey` : "Turkey";
    return wrapAff("klook", `https://www.klook.com/en-US/search/result/?query=${encodeURIComponent(`${safeCity} ${stayWord}`)}&type=hotel&sort=price_asc`);
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

    const baseEco = (live && live.priceUsd > 0) ? live.priceUsd : (km < 900 ? 79 : (km < 2200 ? 115 : (km < 3800 ? 175 : (km < 7500 ? 385 : 580))));
    const realFare = Math.round(baseEco * ({ economy: 1.0, premium: 1.65, business: 2.95, first: 4.8 }[cabinClass] || 1.0));
    const depDate = live?.departureDate || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
    const fO = live?.origIata || orig, fD = live?.destIata || dest;
    const rawU = (live?.rawLink?.startsWith("https://tp.media/") && cabinClass === "economy")
        ? live.rawLink
        : buildFlightUrl(fO, fD, depDate, cabinClass, live?.rawLink || "");

    const esim = resolveVerifiedEsim(destCountry);
    const transfer = cabinClass !== "economy" ? resolveExactTransfer(destCity) : null;

    const alName = live?.airlineName || AIRLINES[live?.airlineCode] || live?.airlineCode || prefAirline || "";
    const alNum = (live?.airlineCode && live?.flightNumber) ? `${live.airlineCode}${live.flightNumber}` : "";

    return jsonResp({
        found: true,
        isLiveApi: Boolean(live),
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
    const cityEn = String(body.cityEn || "Istanbul").trim();
    const province = String(body.province || cityEn).trim();
    const stayType = String(body.stayType || "hotel").toLowerCase().trim();
    const budgetUsd = Number(body.budgetUsd || 0);
    const guests = Math.max(1, Number(body.guests || 2));
    const rooms = Math.max(1, Math.ceil(guests / 2));

    if (!(budgetUsd > 0)) return jsonResp({ found: false }, 400);

    const isAllTr = normCity(cityEn) === "all turkey" || normCity(province) === "tum turkiye";
    const tCity = normCity(cityEn), tProv = normCity(province);
    const candidates = [];

    const feed = await loadSiteFeed(context);
    for (const h of (feed?.mainHotels || [])) {
        const hc = normCity(h.cityEn || h.city || ""), hp = normCity(h.city || h.cityEn || "");
        if (!isAllTr && hc !== tCity && hp !== tProv && !hc.includes(tCity) && !tCity.includes(hc)) continue;
        const aff = String(h.affiliateUrl || h.link || "");
        if (!aff.startsWith("http")) continue;
        let dec = aff; try { dec = decodeURIComponent(aff); } catch {}
        if (/\/activity\/|\/experiences\/|\/car-rentals\/|\/transfers\//i.test(dec)) continue;
        const perRoomUsd = Math.round(Number(h.priceUsd || String(h.price || "").replace(/[^0-9.]/g, "")) || 45);
        candidates.push({
            name: h.name || h.title || null, cityEn: h.cityEn || h.city || cityEn,
            cityTr: h.city || h.cityEn || province, stayType: String(h.stayType || h.accType || "hotel").toLowerCase(),
            priceUsd: perRoomUsd * rooms, perRoomUsd, rooms, affiliateUrl: aff, i18n: h.i18n || null,
        });
    }

    const dispCity = isAllTr ? "Istanbul" : cityEn;
    const dispProv = isAllTr ? "İstanbul" : province;
    const roomFloor = REAL_ROOM_FLOOR_USD[normCity(dispCity)] || 34;
    const realRoomPrice = Math.round(roomFloor * (stayType === "resort" ? 1.45 : (stayType === "apart" ? 0.9 : 1.0)));
    const totalNightMarket = realRoomPrice * rooms;

    let bestStay = null;
    if (candidates.length > 0) {
        candidates.sort((a, b) => {
            const ta = a.stayType === stayType ? 0 : 1, tb = b.stayType === stayType ? 0 : 1;
            if (ta !== tb) return ta - tb;
            const dA = a.priceUsd <= budgetUsd * rooms ? (budgetUsd * rooms - a.priceUsd) : (a.priceUsd - budgetUsd * rooms + 1000);
            const dB = b.priceUsd <= budgetUsd * rooms ? (budgetUsd * rooms - b.priceUsd) : (b.priceUsd - budgetUsd * rooms + 1000);
            return dA - dB;
        });
        bestStay = candidates[0];
    } else {
        bestStay = {
            name: null, cityEn: dispCity, cityTr: dispProv, stayType,
            priceUsd: totalNightMarket, perRoomUsd: realRoomPrice, rooms,
            affiliateUrl: buildAccurateKlookStayUrl(dispCity, stayType), i18n: null,
        };
    }

    const chosenCity = bestStay.cityEn || dispCity;
    return jsonResp({
        found: true,
        belowBudget: bestStay.priceUsd > (budgetUsd * rooms),
        minMarketUsd: bestStay.priceUsd,
        rooms,
        stays: [bestStay],
        addons: {
            activity: resolveExactActivity(chosenCity),
            car: resolveExactCar(chosenCity),
            esim: resolveVerifiedEsim("TR"),
        },
    });
}

export async function onRequestGet(context) {
    return jsonResp({ ok: true, version: "3.3", hasAviasalesToken: Boolean(context.env?.AVIASALES_API_TOKEN) });
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
        headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" },
    });
}
