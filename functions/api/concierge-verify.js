/**
 * UcuzaKal Türkiye — Live Real-Time Concierge Verification Edge API (v2.0)
 * =========================================================================
 * - Zero partner names exposed to the visitor (100% UcuzaKal white-label output).
 * - Automatic city-code resolution for Aviasales (SVO/VKO/DME -> MOW, SAW -> IST, etc.).
 * - Reads verified stays from live_deals_feed.json (mainHotels + conciergeHotels) + live KKday stays.
 * - Strict budget enforcement + exclusive approved affiliate gateways (marker=798779, trs=597953).
 */

const MARKER = "798779";
const TRS = "597953";

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

// تحويل مطار المدينة لرمز المدينة المعتمد في Aviasales لضمان جلب الأسعار الحية دائماً
const AIRPORT_TO_CITY_CODE = {
    SVO: "MOW", VKO: "MOW", DME: "MOW", ZIA: "MOW",
    SAW: "IST",
    LHR: "LON", LGW: "LON", STN: "LON", LTN: "LON",
    CDG: "PAR", ORY: "PAR",
    JFK: "NYC", EWR: "NYC", LGA: "NYC",
    FCO: "ROM", CIA: "ROM",
    MXP: "MIL", LIN: "MIL", BGY: "MIL",
    DWC: "DXB",
    HND: "TYO", NRT: "TYO",
};

const CITY_AIRPORT_GROUPS = {
    IST: ["IST", "SAW"], SAW: ["SAW", "IST"],
    MOW: ["MOW", "SVO", "VKO", "DME"], SVO: ["SVO", "MOW", "VKO", "DME"],
    VKO: ["VKO", "MOW", "SVO", "DME"], DME: ["DME", "MOW", "SVO", "VKO"],
    LON: ["LON", "LHR", "LGW", "STN", "LTN"], LHR: ["LHR", "LON", "LGW", "STN"],
    PAR: ["PAR", "CDG", "ORY"], CDG: ["CDG", "PAR", "ORY"],
    NYC: ["NYC", "JFK", "EWR", "LGA"], JFK: ["JFK", "NYC", "EWR"],
    DXB: ["DXB", "DWC", "SHJ"],
};

const AIRLINE_NAMES = {
    PC: "Pegasus Airlines", TK: "Turkish Airlines", VF: "AJet", XQ: "SunExpress",
    SV: "Saudia", XY: "Flynas", F3: "flyadeal", EK: "Emirates", FZ: "flydubai",
    G9: "Air Arabia", EY: "Etihad Airways", QR: "Qatar Airways", KU: "Kuwait Airways",
    J9: "Jazeera Airways", MS: "EgyptAir", SM: "Air Cairo", NP: "Nile Air",
    RJ: "Royal Jordanian", IA: "Iraqi Airways", ME: "Middle East Airlines",
    AT: "Royal Air Maroc", AH: "Air Algérie", GF: "Gulf Air", WY: "Oman Air",
    SU: "Aeroflot", DP: "Pobeda", S7: "S7 Airlines", U6: "Ural Airlines",
    UT: "Utair", WZ: "Red Wings", N4: "Nordwind Airlines", A4: "Azimuth",
    TU: "Tunisair", LH: "Lufthansa", BA: "British Airways", AF: "Air France",
    J2: "Azerbaijan Airlines", KC: "Air Astana",
};

const AIRALO_COUNTRY_SLUGS = {
    TR: "turkey", EG: "egypt", SA: "saudi-arabia", AE: "united-arab-emirates",
    QA: "qatar", KW: "kuwait", BH: "bahrain", OM: "oman", JO: "jordan",
    IQ: "iraq", MA: "morocco", TN: "tunisia", DZ: "algeria", LB: "lebanon",
    DE: "germany", FR: "france", GB: "united-kingdom", UK: "united-kingdom",
    IT: "italy", ES: "spain", NL: "netherlands", GR: "greece", AT: "austria",
    CH: "switzerland", GE: "georgia", AZ: "azerbaijan", KZ: "kazakhstan",
    US: "united-states", CA: "canada", CN: "china", JP: "japan", TH: "thailand",
};

const WELCOME_PICKUPS_SLUGS = {
    istanbul: "istanbul", antalya: "antalya", izmir: "izmir", bodrum: "bodrum",
    dalaman: "dalaman", ankara: "ankara", dubai: "dubai", "abu dhabi": "abu-dhabi",
    cairo: "cairo", amman: "amman", doha: "doha", riyadh: "riyadh",
    london: "london", paris: "paris", rome: "rome", milan: "milan",
    madrid: "madrid", barcelona: "barcelona", athens: "athens", berlin: "berlin",
    munich: "munich", amsterdam: "amsterdam", vienna: "vienna", prague: "prague",
    "new york": "new-york",
};

const TIQETS_CITY_SLUGS = {
    istanbul: "istanbul-c60711", antalya: "antalya-c79888", izmir: "izmir-c80036",
    bodrum: "bodrum-c79923", cappadocia: "cappadocia-c166298", nevsehir: "cappadocia-c166298",
    dubai: "dubai-c60005", "abu dhabi": "abu-dhabi-c60004", cairo: "cairo-c60420",
    london: "london-c67458", paris: "paris-c66746", rome: "rome-c71631",
    barcelona: "barcelona-c66342", madrid: "madrid-c66254", athens: "athens-c68557",
    amsterdam: "amsterdam-c75061", berlin: "berlin-c65144", vienna: "vienna-c60335",
};

const LOCALRENT_TR_SLUGS = {
    istanbul: "istanbul", antalya: "antalya", izmir: "izmir", bodrum: "bodrum",
    dalaman: "dalaman", fethiye: "fethiye", marmaris: "marmaris", alanya: "alanya",
    trabzon: "trabzon", ankara: "ankara", bursa: "bursa", cappadocia: "cappadocia",
    mugla: "mugla", nevsehir: "cappadocia",
};

const BROKEN_SIGNATURES = [
    "page not found", "error 404", "404 not found", "promo not found",
    "this activity is no longer available", "product has been removed",
    "no longer available", "sold out",
];

const NON_STAY_BLOCKLIST = [
    "tour", "day trip", "excursion", "ticket", "pass", "museum", "transfer",
    "shuttle", "pickup", "taxi", "driver", "car rental", "rent a car",
    "esim", "sim card", "wifi", "cruise", "yacht", "boat", "ferry",
    "dinner", "show", "hammam", "balloon", "paragliding", "rafting",
    "safari", "quad", "atv", "diving", "guided", "walking", "experience",
    "skip-the-line", "admission", "cable car", "aquarium", "theme park",
];

const STAY_REQUIRED_WORDS = [
    "hotel", "resort", "apart", "aparthotel", "residence", "suite", "suites",
    "villa", "chalet", "bungalow", "stay", "accommodation", "lodge", "palace", "otel",
    "فندق", "منتجع", "شقق", "إقامة",
];

function normCity(s) {
    return String(s || "")
        .replace(/İ/g, "i").replace(/I/g, "i").replace(/ı/g, "i")
        .replace(/ğ/gi, "g").replace(/ü/gi, "u").replace(/ş/gi, "s")
        .replace(/ö/gi, "o").replace(/ç/gi, "c")
        .toLowerCase().trim();
}

function wrapAffiliate(partner, targetUrl) {
    const gw = GATEWAYS[partner];
    if (!gw || !targetUrl) return "";
    if (targetUrl.startsWith("https://tp.media/")) return targetUrl;
    return `${gw}${encodeURIComponent(targetUrl.trim())}`;
}

function jsonResp(obj, status = 200) {
    return new Response(JSON.stringify(obj), {
        status,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store",
            "Access-Control-Allow-Origin": "*",
        },
    });
}

async function fetchWithTimeout(url, opts = {}, ms = 6500) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    try {
        return await fetch(url, { ...opts, signal: ctrl.signal });
    } finally {
        clearTimeout(t);
    }
}

async function verifyLiveUrl(targetUrl, allowWafChallenge = true) {
    if (!targetUrl || !targetUrl.startsWith("http")) return false;
    const cache = caches.default;
    const cacheKey = new Request(`https://ucuzakal-verify-v2.internal/?u=${encodeURIComponent(targetUrl)}`);
    try {
        const cached = await cache.match(cacheKey);
        if (cached) {
            const j = await cached.json();
            return Boolean(j && j.ok);
        }
    } catch {}

    let ok = false;
    try {
        const res = await fetchWithTimeout(targetUrl, {
            method: "GET",
            redirect: "follow",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
            },
        }, 5500);

        const finalUrl = (res.url || targetUrl).toLowerCase();
        if (res.status === 404 || res.status === 410 || res.status >= 500 || /\/404(\b|$|\?)/.test(finalUrl)) {
            ok = false;
        } else if (res.status >= 200 && res.status < 400) {
            const html = (await res.text()).slice(0, 30000).toLowerCase();
            ok = !BROKEN_SIGNATURES.some(sig => html.includes(sig));
        } else if ((res.status === 403 || res.status === 429) && allowWafChallenge) {
            ok = true;
        }
    } catch {
        ok = false;
    }

    try {
        await cache.put(cacheKey, new Response(JSON.stringify({ ok }), {
            headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=900" },
        }));
    } catch {}
    return ok;
}

function airportMatches(ret, req) {
    const r1 = String(ret || "").toUpperCase().trim();
    const r2 = String(req || "").toUpperCase().trim();
    if (!r1) return true;
    const grp = CITY_AIRPORT_GROUPS[r2] || [r2];
    return grp.includes(r1);
}

function buildExactAviasalesUrl(orig, dest, depDate, cabinClass, rawApiLink) {
    const o = orig.toUpperCase();
    const d = dest.toUpperCase();
    const clsMap = { economy: "", premium: "W", business: "C", first: "F" };
    const clsSuffix = clsMap[String(cabinClass || "economy").toLowerCase()] ?? "";

    if (clsSuffix === "" && rawApiLink) {
        const dec = decodeURIComponent(String(rawApiLink)).toUpperCase();
        const exactRx = new RegExp(`/SEARCH/[A-Z]{3}\\d{4}[A-Z]{3}(?:[0-9]|$)`);
        if (exactRx.test(dec)) {
            const m = dec.match(/\/SEARCH\/([A-Z]{3})\d{4}([A-Z]{3})/);
            if (m && airportMatches(m[1], o) && airportMatches(m[2], d)) {
                return rawApiLink.startsWith("http") ? rawApiLink : `https://www.aviasales.com${rawApiLink}`;
            }
        }
    }

    let ddmm = "";
    try {
        const dt = depDate ? new Date(`${depDate.slice(0, 10)}T00:00:00Z`) : new Date(Date.now() + 14 * 86400000);
        ddmm = `${String(dt.getUTCDate()).padStart(2, "0")}${String(dt.getUTCMonth() + 1).padStart(2, "0")}`;
    } catch {
        const dt = new Date(Date.now() + 14 * 86400000);
        ddmm = `${String(dt.getUTCDate()).padStart(2, "0")}${String(dt.getUTCMonth() + 1).padStart(2, "0")}`;
    }
    return `https://www.aviasales.com/search/${o}${ddmm}${d}1${clsSuffix}`;
}

async function queryAviasalesForPair(qOrig, qDest, origReq, destReq, token) {
    const todayStr = new Date().toISOString().slice(0, 10);
    const nextMonthDt = new Date();
    nextMonthDt.setUTCDate(1);
    nextMonthDt.setUTCMonth(nextMonthDt.getUTCMonth() + 1);
    const nextMonth = nextMonthDt.toISOString().slice(0, 7);
    const candidates = [];

    // 1) v3 prices_for_dates
    for (const depMonth of ["", nextMonth]) {
        const qs = new URLSearchParams({
            origin: qOrig, destination: qDest, currency: "usd",
            one_way: "true", unique: "false", sorting: "price",
            direct: "false", limit: "12", token,
        });
        if (depMonth) qs.set("departure_at", depMonth);
        try {
            const r = await fetchWithTimeout(`https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${qs}`, {
                headers: { "Accept": "application/json", "X-Access-Token": token },
            }, 6000);
            if (r.ok) {
                const payload = await r.json();
                for (const it of (Array.isArray(payload?.data) ? payload.data : [])) {
                    const rO = String(it.origin_airport || it.origin || qOrig).toUpperCase();
                    const rD = String(it.destination_airport || it.destination || qDest).toUpperCase();
                    const depAt = String(it.departure_at || "").slice(0, 10);
                    const price = Number(it.price);
                    if (!price || !depAt || depAt < todayStr) continue;
                    if (!airportMatches(rO, origReq) || !airportMatches(rD, destReq)) continue;
                    candidates.push({
                        origIata: rO, destIata: rD,
                        priceUsd: Math.round(price),
                        transfers: Number(it.transfers || 0),
                        airlineCode: String(it.airline || "").toUpperCase(),
                        flightNumber: String(it.flight_number || ""),
                        departureDate: depAt,
                        rawLink: String(it.link || ""),
                        source: "live_v3",
                    });
                }
            }
        } catch {}
        if (candidates.length > 0) return candidates;
    }

    // 2) v1 cheap
    try {
        const qs = new URLSearchParams({ origin: qOrig, destination: qDest, currency: "usd", token });
        const r = await fetchWithTimeout(`https://api.travelpayouts.com/v1/prices/cheap?${qs}`, {
            headers: { "Accept": "application/json", "X-Access-Token": token },
        }, 5500);
        if (r.ok) {
            const payload = await r.json();
            const bucket = payload?.data?.[qDest];
            if (bucket && typeof bucket === "object") {
                for (const [k, it] of Object.entries(bucket)) {
                    const depAt = String(it.departure_at || "").slice(0, 10);
                    const price = Number(it.price);
                    if (!price || !depAt || depAt < todayStr) continue;
                    candidates.push({
                        origIata: qOrig, destIata: qDest,
                        priceUsd: Math.round(price),
                        transfers: Number.isFinite(Number(k)) ? Number(k) : 0,
                        airlineCode: String(it.airline || "").toUpperCase(),
                        flightNumber: String(it.flight_number || ""),
                        departureDate: depAt,
                        rawLink: "",
                        source: "live_v1",
                    });
                }
            }
        }
    } catch {}
    if (candidates.length > 0) return candidates;

    // 3) v2 latest
    try {
        const qs = new URLSearchParams({
            origin: qOrig, destination: qDest, currency: "usd",
            one_way: "true", period_type: "year", sorting: "price",
            limit: "8", show_to_affiliates: "true", token,
        });
        const r = await fetchWithTimeout(`https://api.travelpayouts.com/v2/prices/latest?${qs}`, {
            headers: { "Accept": "application/json", "X-Access-Token": token },
        }, 5500);
        if (r.ok) {
            const payload = await r.json();
            for (const it of (Array.isArray(payload?.data) ? payload.data : [])) {
                const rO = String(it.origin || "").toUpperCase();
                const rD = String(it.destination || "").toUpperCase();
                const depAt = String(it.depart_date || "").slice(0, 10);
                const price = Number(it.value);
                if (!price || !depAt || depAt < todayStr) continue;
                if (!airportMatches(rO, origReq) || !airportMatches(rD, destReq)) continue;
                candidates.push({
                    origIata: rO || qOrig, destIata: rD || qDest,
                    priceUsd: Math.round(price),
                    transfers: Number(it.number_of_changes || 0),
                    airlineCode: String(it.airline || "").toUpperCase(),
                    flightNumber: "",
                    departureDate: depAt,
                    rawLink: "",
                    source: "live_v2",
                });
            }
        }
    } catch {}

    return candidates;
}

async function queryAviasalesLive(orig, dest, token, preferredAirline) {
    // تجربة رمز المدينة أولاً (مثل MOW بدلاً من SVO و IST بدلاً من SAW) ثم رمز المطار الأصلي
    const cityOrig = AIRPORT_TO_CITY_CODE[orig] || orig;
    const cityDest = AIRPORT_TO_CITY_CODE[dest] || dest;
    const pairs = [[cityOrig, cityDest]];
    if (cityOrig !== orig || cityDest !== dest) pairs.push([orig, dest]);

    let candidates = [];
    for (const [qo, qd] of pairs) {
        candidates = await queryAviasalesForPair(qo, qd, orig, dest, token);
        if (candidates.length > 0) break;
    }

    if (candidates.length === 0) return null;

    let pool = candidates;
    const pref = String(preferredAirline || "").trim().toLowerCase();
    if (pref) {
        const matched = candidates.filter(c => {
            const fullName = (AIRLINE_NAMES[c.airlineCode] || "").toLowerCase();
            return c.airlineCode.toLowerCase() === pref || fullName.includes(pref);
        });
        if (matched.length > 0) pool = matched;
    }

    pool.sort((a, b) => (a.priceUsd + a.transfers * 15) - (b.priceUsd + b.transfers * 15));
    return pool[0];
}

// الإضافات بهوية UcuzaKal الصافية (بدون ذكر اسم أي موقع خارجي للزائر)
async function verifyEsimForCountry(countryCode) {
    const cc = String(countryCode || "").toUpperCase().trim();
    const slug = AIRALO_COUNTRY_SLUGS[cc];
    if (!slug) return null;
    const rawUrl = `https://www.airalo.com/${slug}-esim`;
    if (!(await verifyLiveUrl(rawUrl, true))) return null;
    return {
        partner: "airalo",
        countrySlug: slug,
        affiliateUrl: wrapAffiliate("airalo", rawUrl),
    };
}

async function verifyTransferForCity(cityEn) {
    const slug = WELCOME_PICKUPS_SLUGS[normCity(cityEn)];
    if (!slug) return null;
    const rawUrl = `https://www.welcomepickups.com/${slug}/airport-transfer-book/`;
    if (!(await verifyLiveUrl(rawUrl, true))) return null;
    return {
        partner: "welcome",
        city: cityEn,
        affiliateUrl: wrapAffiliate("welcome", rawUrl),
    };
}

async function verifyActivitiesForCity(cityEn) {
    const key = normCity(cityEn);
    const tiqetsSlug = TIQETS_CITY_SLUGS[key];
    if (tiqetsSlug) {
        const rawUrl = `https://www.tiqets.com/en/${tiqetsSlug}/`;
        if (await verifyLiveUrl(rawUrl, true)) {
            return {
                partner: "tiqets",
                city: cityEn,
                affiliateUrl: wrapAffiliate("tiqets", rawUrl),
            };
        }
    }
    const wgUrl = "https://wegotrip.com/en/";
    if (await verifyLiveUrl(wgUrl, true)) {
        return {
            partner: "wegotrip",
            city: cityEn,
            affiliateUrl: wrapAffiliate("wegotrip", wgUrl),
        };
    }
    return null;
}

async function verifyCarRentalForTurkeyCity(cityEn) {
    const key = normCity(cityEn);
    const lrSlug = LOCALRENT_TR_SLUGS[key];
    if (lrSlug) {
        const rawUrl = `https://localrent.com/en/turkey/${lrSlug}/`;
        if (await verifyLiveUrl(rawUrl, true)) {
            return {
                partner: "localrent",
                city: cityEn,
                affiliateUrl: wrapAffiliate("localrent", rawUrl),
            };
        }
    }
    const grSlug = key.replace(/\s+/g, "-");
    if (grSlug) {
        const rawUrl = `https://getrentacar.com/en-US/car-rental/turkey/${grSlug}`;
        if (await verifyLiveUrl(rawUrl, true)) {
            return {
                partner: "getrent",
                city: cityEn,
                affiliateUrl: wrapAffiliate("getrent", rawUrl),
            };
        }
    }
    return null;
}

function isGenuineStay(title, url) {
    const t = String(title || "").toLowerCase();
    const u = String(url || "").toLowerCase();
    if (/\/activity\/|\/experiences\/|\/car-rentals\/|\/transfers\//.test(u)) return false;
    if (NON_STAY_BLOCKLIST.some(w => new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(t))) return false;
    return STAY_REQUIRED_WORDS.some(w => t.includes(w));
}

async function handleFlightVerification(body, env, requestOrigin) {
    const orig = String(body.origIata || "").toUpperCase().trim();
    const dest = String(body.destIata || "").toUpperCase().trim();
    const destCountry = String(body.destCountry || "").toUpperCase().trim();
    const destCity = String(body.destCity || dest).trim();
    const budgetUsd = Number(body.budgetUsd || 0);
    const cabinClass = String(body.cabinClass || "economy").toLowerCase().trim();
    const preferredAirline = String(body.airline || "").trim();

    if (orig.length !== 3 || dest.length !== 3 || orig === dest || !(budgetUsd > 0)) {
        return jsonResp({ found: false, reason: "invalid_request" }, 400);
    }

    const token = String(env.AVIASALES_API_TOKEN || "").trim();
    let liveFlight = null;

    if (token) {
        liveFlight = await queryAviasalesLive(orig, dest, token, preferredAirline);
    }

    // فحص ملف العروض الحيّ الخاص بالموقع كنسخة احتياطية إضافية إن تطابق المسار
    if (!liveFlight) {
        try {
            const feedRes = await fetchWithTimeout(`${requestOrigin}/live_deals_feed.json?t=${Date.now()}`, {}, 4500);
            if (feedRes.ok) {
                const feed = await feedRes.json();
                const todayStr = new Date().toISOString().slice(0, 10);
                const match = (feed.mainFlights || []).find(f =>
                    airportMatches(f.originIata, orig) &&
                    airportMatches(f.destIata, dest) &&
                    (!f.departureDate || f.departureDate >= todayStr)
                );
                if (match) {
                    liveFlight = {
                        origIata: match.originIata,
                        destIata: match.destIata,
                        priceUsd: Number(match.priceUsd || String(match.price || "").replace(/[^0-9.]/g, "")) || 0,
                        transfers: Number(match.transfers || 0),
                        airlineCode: "",
                        airlineName: match.airline || "Verified Carrier",
                        flightNumber: "",
                        departureDate: match.departureDate || "",
                        rawLink: match.affiliateUrl || "",
                        source: "site_feed",
                    };
                }
            }
        } catch {}
    }

    if (!liveFlight || !(liveFlight.priceUsd > 0)) {
        return jsonResp({ found: false, reason: "no_live_route_offer" });
    }

    const classMult = { economy: 1.0, premium: 1.65, business: 2.95, first: 4.8 }[cabinClass] || 1.0;
    const realFareUsd = Math.round(liveFlight.priceUsd * classMult);

    if (realFareUsd > budgetUsd) {
        return jsonResp({
            found: false,
            reason: "below_budget",
            minMarketUsd: realFareUsd,
            userBudgetUsd: budgetUsd,
            departureDate: liveFlight.departureDate,
        });
    }

    const exactRawUrl = liveFlight.rawLink.startsWith("https://tp.media/")
        ? liveFlight.rawLink
        : buildExactAviasalesUrl(liveFlight.origIata, liveFlight.destIata, liveFlight.departureDate, cabinClass, liveFlight.rawLink);

    const affiliateUrl = exactRawUrl.startsWith("https://tp.media/")
        ? exactRawUrl
        : wrapAffiliate("aviasales", exactRawUrl);

    const [esimAddon, transferAddon] = await Promise.all([
        verifyEsimForCountry(destCountry),
        cabinClass !== "economy" ? verifyTransferForCity(destCity) : Promise.resolve(null),
    ]);

    const airlineFull = liveFlight.airlineName || AIRLINE_NAMES[liveFlight.airlineCode] || liveFlight.airlineCode || "Verified Carrier";
    const flightNum = (liveFlight.airlineCode && liveFlight.flightNumber) ? `${liveFlight.airlineCode}${liveFlight.flightNumber}` : "";

    return jsonResp({
        found: true,
        verifiedAt: new Date().toISOString(),
        flight: {
            partner: "aviasales",
            origIata: liveFlight.origIata,
            destIata: liveFlight.destIata,
            priceUsd: realFareUsd,
            transfers: liveFlight.transfers,
            airline: flightNum ? `${airlineFull} • ${flightNum}` : airlineFull,
            departureDate: liveFlight.departureDate,
            cabinClass,
            affiliateUrl,
        },
        addons: {
            transfer: transferAddon,
            esim: esimAddon,
        },
    });
}

async function handleHotelVerification(body, requestOrigin) {
    const cityEn = String(body.cityEn || "").trim();
    const province = String(body.province || cityEn).trim();
    const stayType = String(body.stayType || "hotel").toLowerCase().trim();
    const budgetUsd = Number(body.budgetUsd || 0);

    if (!cityEn || !(budgetUsd > 0)) {
        return jsonResp({ found: false, reason: "invalid_request" }, 400);
    }

    const isAllTurkey = normCity(cityEn) === "all turkey" || normCity(province) === "tum turkiye";
    const targetCityNorm = normCity(cityEn);
    const targetProvNorm = normCity(province);
    const verifiedStays = [];

    // 1) جلب جميع عروض الإقامة الحقيقية المفحوصة من live_deals_feed.json (بدون الشرط المعطّل)
    try {
        const feedRes = await fetchWithTimeout(`${requestOrigin}/live_deals_feed.json?t=${Date.now()}`, {}, 4500);
        if (feedRes.ok) {
            const feed = await feedRes.json();
            for (const h of (feed.mainHotels || [])) {
                const hCityNorm = normCity(h.cityEn || h.city || "");
                const hProvNorm = normCity(h.city || h.cityEn || "");
                const cityMatched = isAllTurkey || hCityNorm === targetCityNorm || hProvNorm === targetProvNorm || hCityNorm.includes(targetCityNorm) || targetCityNorm.includes(hCityNorm);
                if (!cityMatched) continue;

                const aff = String(h.affiliateUrl || h.link || "");
                if (!aff.startsWith("http")) continue;
                let dec = aff;
                try { dec = decodeURIComponent(aff); } catch {}
                if (/\/activity\/|\/experiences\/|\/car-rentals\/|\/transfers\//i.test(dec)) continue;

                const price = Number(h.priceUsd || String(h.price || "").replace(/[^0-9.]/g, "")) || 0;
                if (!(price > 0)) continue;

                const partner = String(h.partner || "klook").toLowerCase() === "kkday" ? "kkday" : "klook";
                verifiedStays.push({
                    partner,
                    name: h.name || h.title || `${h.cityEn || h.city} Stay`,
                    cityEn: h.cityEn || h.city || cityEn,
                    cityTr: h.city || h.cityEn || province,
                    stayType: String(h.stayType || h.accType || "hotel").toLowerCase(),
                    priceUsd: Math.round(price),
                    affiliateUrl: aff,
                    i18n: h.i18n || null,
                });
            }
        }
    } catch {}

    // 2) بحث حي إضافي لمنتجات الإقامة فقط (بفلتر منع الجولات الصارم) إن لم نغطِ المدينة
    if (!isAllTurkey && verifiedStays.length < 2) {
        try {
            const kw = `${cityEn} ${stayType === "resort" ? "resort hotel" : (stayType === "apart" ? "apartment hotel" : "hotel stay")}`;
            const kkUrl = `https://www.kkday.com/en/product/ajax_productlist_get_product_list?keyword=${encodeURIComponent(kw)}&currency=USD&sort=pasc&page=1`;
            const r = await fetchWithTimeout(kkUrl, {
                headers: { "Accept": "application/json", "X-Requested-With": "XMLHttpRequest", "User-Agent": "Mozilla/5.0" },
            }, 5000);
            if (r.ok) {
                const payload = await r.json();
                const items = Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload?.data?.data) ? payload.data.data : []);
                for (const it of items.slice(0, 10)) {
                    const pid = String(it.id || it.prod_oid || "").trim();
                    const name = String(it.name || it.title || "").trim();
                    const price = Math.round(Number(it.price || it.display_price || it.sale_price || 0));
                    if (!pid || !name || !(price >= 25 && price <= 950)) continue;
                    if (!normCity(name).includes(targetCityNorm)) continue;
                    const prodUrl = `https://www.kkday.com/en/product/${pid}`;
                    if (!isGenuineStay(name, prodUrl)) continue;
                    if (await verifyLiveUrl(prodUrl, true)) {
                        verifiedStays.push({
                            partner: "kkday",
                            name,
                            cityEn,
                            cityTr: province,
                            stayType,
                            priceUsd: price,
                            affiliateUrl: wrapAffiliate("kkday", prodUrl),
                            i18n: null,
                        });
                        if (verifiedStays.length >= 2) break;
                    }
                }
            }
        } catch {}
    }

    if (verifiedStays.length === 0) {
        return jsonResp({ found: false, reason: "no_live_direct_stay" });
    }

    // ترتيب حسب مطابقة نوع الإقامة أولاً ثم الأرخص سعراً
    verifiedStays.sort((a, b) => {
        const typeA = a.stayType === stayType ? 0 : 1;
        const typeB = b.stayType === stayType ? 0 : 1;
        if (typeA !== typeB) return typeA - typeB;
        return a.priceUsd - b.priceUsd;
    });

    const affordable = verifiedStays.filter(s => s.priceUsd <= budgetUsd);
    if (affordable.length === 0) {
        const cheapest = verifiedStays.reduce((min, s) => (s.priceUsd < min.priceUsd ? s : min), verifiedStays[0]);
        return jsonResp({
            found: false,
            reason: "below_budget",
            minMarketUsd: cheapest.priceUsd,
            minCityEn: cheapest.cityEn,
            userBudgetUsd: budgetUsd,
        });
    }

    const chosenCityEn = affordable[0].cityEn || (isAllTurkey ? "Istanbul" : cityEn);
    const [activityAddon, carAddon, esimAddon] = await Promise.all([
        verifyActivitiesForCity(chosenCityEn),
        verifyCarRentalForTurkeyCity(chosenCityEn),
        verifyEsimForCountry("TR"),
    ]);

    return jsonResp({
        found: true,
        verifiedAt: new Date().toISOString(),
        matchedCityEn: chosenCityEn,
        stays: affordable.slice(0, 2),
        addons: {
            activity: activityAddon,
            car: carAddon,
            esim: esimAddon,
        },
    });
}

export async function onRequestPost(context) {
    try {
        const body = await context.request.json();
        const origin = new URL(context.request.url).origin;
        if (body?.mode === "flight") return await handleFlightVerification(body, context.env, origin);
        if (body?.mode === "hotel") return await handleHotelVerification(body, origin);
        return jsonResp({ found: false, reason: "unknown_mode" }, 400);
    } catch {
        return jsonResp({ found: false, reason: "server_error" }, 500);
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    });
}
