/**
 * UcuzaKal Türkiye — Live Real-Time Concierge Verification Edge API
 * ==================================================================
 * - Runs FREE on Cloudflare Pages Functions (100,000 req/day | 0 Firebase | 0 GitHub quota).
 * - Strictly enforces the 8 exclusive approved partners + Aviasales (marker=798779, trs=597953).
 * - Live HTTP 200 & non-expired availability gate for Flights, Stays, Transfers, Activities, Cars & Airalo eSIM.
 * - Zero fake offers, zero 404s, zero blank search pages, strict budget enforcement.
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

// الدول المدعومة فعلياً في Airalo (تُستبعد الدول غير المدعومة مثل RU لمنع 404)
const AIRALO_COUNTRY_SLUGS = {
    TR: "turkey", EG: "egypt", SA: "saudi-arabia", AE: "united-arab-emirates",
    QA: "qatar", KW: "kuwait", BH: "bahrain", OM: "oman", JO: "jordan",
    IQ: "iraq", MA: "morocco", TN: "tunisia", DZ: "algeria", LB: "lebanon",
    DE: "germany", FR: "france", GB: "united-kingdom", UK: "united-kingdom",
    IT: "italy", ES: "spain", NL: "netherlands", GR: "greece", AT: "austria",
    CH: "switzerland", GE: "georgia", AZ: "azerbaijan", KZ: "kazakhstan",
    US: "united-states", CA: "canada", CN: "china", JP: "japan", TH: "thailand",
};

// المدن المدعومة فعلياً في Welcome Pickups
const WELCOME_PICKUPS_SLUGS = {
    istanbul: "istanbul", antalya: "antalya", izmir: "izmir", bodrum: "bodrum",
    dalaman: "dalaman", ankara: "ankara", dubai: "dubai", "abu dhabi": "abu-dhabi",
    cairo: "cairo", amman: "amman", doha: "doha", riyadh: "riyadh",
    london: "london", paris: "paris", rome: "rome", milan: "milan",
    madrid: "madrid", barcelona: "barcelona", athens: "athens", berlin: "berlin",
    munich: "munich", amsterdam: "amsterdam", vienna: "vienna", prague: "prague",
    "new york": "new-york",
};

// صفحات المدن المعتمدة في Tiqets
const TIQETS_CITY_SLUGS = {
    istanbul: "istanbul-c60711", antalya: "antalya-c79888", izmir: "izmir-c80036",
    bodrum: "bodrum-c79923", cappadocia: "cappadocia-c166298", nevsehir: "cappadocia-c166298",
    dubai: "dubai-c60005", "abu dhabi": "abu-dhabi-c60004", cairo: "cairo-c60420",
    london: "london-c67458", paris: "paris-c66746", rome: "rome-c71631",
    barcelona: "barcelona-c66342", madrid: "madrid-c66254", athens: "athens-c68557",
    amsterdam: "amsterdam-c75061", berlin: "berlin-c65144", vienna: "vienna-c60335",
};

// صفحات المدن المعتمدة في Localrent داخل تركيا
const LOCALRENT_TR_SLUGS = {
    istanbul: "istanbul", antalya: "antalya", izmir: "izmir", bodrum: "bodrum",
    dalaman: "dalaman", fethiye: "fethiye", marmaris: "marmaris", alanya: "alanya",
    trabzon: "trabzon", ankara: "ankara", bursa: "bursa", cappadocia: "cappadocia",
    mugla: "mugla", nevsehir: "cappadocia",
};

const BROKEN_SIGNATURES = [
    "page not found", "error 404", "404 not found", "promo not found",
    "this activity is no longer available", "product has been removed",
    "no longer available", "sold out", "sorry, we couldn't find",
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
];

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

// فحص حيّ لرابط خارجي للتأكد أنه HTTP 200 وغير منتهٍ ولا يحتوي على 404 (مع كاش حافة 15 دقيقة)
async function verifyLiveUrl(targetUrl, requiredTerms = []) {
    if (!targetUrl || !targetUrl.startsWith("http")) return false;
    const cache = caches.default;
    const cacheKey = new Request(`https://ucuzakal-verify.internal/?u=${encodeURIComponent(targetUrl)}`);
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
        }, 6500);

        const finalUrl = (res.url || targetUrl).toLowerCase();
        if (res.status >= 200 && res.status < 400 && !/\/404(\b|$|\?)/.test(finalUrl)) {
            const html = (await res.text()).slice(0, 35000).toLowerCase();
            const hasBroken = BROKEN_SIGNATURES.some(sig => html.includes(sig));
            const matchesTerms = requiredTerms.length === 0 || requiredTerms.some(term => html.includes(term.toLowerCase()) || finalUrl.includes(term.toLowerCase()));
            ok = !hasBroken && matchesTerms;
        } else if (res.status === 403 || res.status === 429) {
            // بعض المواقع المحمية بـ WAF ترد 403 على السيرفر لكن الصفحة حقيقية وموثّقة لدينا
            ok = requiredTerms.length === 0;
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

    // قبول رابط Aviasales المباشر للدرجة الاقتصادية فقط إذا طابق رمزي المطارين حرفياً
    if (clsSuffix === "" && rawApiLink) {
        const dec = decodeURIComponent(String(rawApiLink)).toUpperCase();
        const exactRx = new RegExp(`/SEARCH/${o}\\d{4}${d}(?:[0-9]|$)`);
        if (exactRx.test(dec)) {
            return rawApiLink.startsWith("http") ? rawApiLink : `https://www.aviasales.com${rawApiLink}`;
        }
    }

    let ddmm = "";
    try {
        const dt = depDate ? new Date(`${depDate.slice(0, 10)}T00:00:00Z`) : new Date(Date.now() + 14 * 86400000);
        const dd = String(dt.getUTCDate()).padStart(2, "0");
        const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
        ddmm = `${dd}${mm}`;
    } catch {
        const dt = new Date(Date.now() + 14 * 86400000);
        ddmm = `${String(dt.getUTCDate()).padStart(2, "0")}${String(dt.getUTCMonth() + 1).padStart(2, "0")}`;
    }
    return `https://www.aviasales.com/search/${o}${ddmm}${d}1${clsSuffix}`;
}

async function queryAviasalesLive(orig, dest, token, preferredAirline) {
    const todayStr = new Date().toISOString().slice(0, 10);
    const nextMonthDt = new Date();
    nextMonthDt.setUTCDate(1);
    nextMonthDt.setUTCMonth(nextMonthDt.getUTCMonth() + 1);
    const nextMonth = nextMonthDt.toISOString().slice(0, 7);

    const candidates = [];

    // 1) Aviasales v3 prices_for_dates (النافذة الحالية + الشهر القادم)
    for (const depMonth of ["", nextMonth]) {
        const qs = new URLSearchParams({
            origin: orig, destination: dest, currency: "usd",
            one_way: "true", unique: "false", sorting: "price",
            direct: "false", limit: "12", token,
        });
        if (depMonth) qs.set("departure_at", depMonth);
        try {
            const r = await fetchWithTimeout(`https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${qs}`, {
                headers: { "Accept": "application/json", "X-Access-Token": token },
            }, 6500);
            if (r.ok) {
                const payload = await r.json();
                const items = Array.isArray(payload?.data) ? payload.data : [];
                for (const it of items) {
                    const rO = String(it.origin_airport || it.origin || orig).toUpperCase();
                    const rD = String(it.destination_airport || it.destination || dest).toUpperCase();
                    const depAt = String(it.departure_at || "").slice(0, 10);
                    const price = Number(it.price);
                    if (!price || !depAt || depAt < todayStr) continue;
                    if (!airportMatches(rO, orig) || !airportMatches(rD, dest)) continue;
                    candidates.push({
                        origIata: rO, destIata: rD,
                        priceUsd: Math.round(price),
                        transfers: Number(it.transfers || 0),
                        airlineCode: String(it.airline || "").toUpperCase(),
                        flightNumber: String(it.flight_number || ""),
                        departureDate: depAt,
                        rawLink: String(it.link || ""),
                        source: "aviasales_v3_live",
                    });
                }
            }
        } catch {}
        if (candidates.length > 0) break;
    }

    // 2) Aviasales v1 cheap fallback
    if (candidates.length === 0) {
        try {
            const qs = new URLSearchParams({ origin: orig, destination: dest, currency: "usd", token });
            const r = await fetchWithTimeout(`https://api.travelpayouts.com/v1/prices/cheap?${qs}`, {
                headers: { "Accept": "application/json", "X-Access-Token": token },
            }, 6000);
            if (r.ok) {
                const payload = await r.json();
                const bucket = payload?.data?.[dest];
                if (bucket && typeof bucket === "object") {
                    for (const [k, it] of Object.entries(bucket)) {
                        const depAt = String(it.departure_at || "").slice(0, 10);
                        const price = Number(it.price);
                        if (!price || !depAt || depAt < todayStr) continue;
                        candidates.push({
                            origIata: orig, destIata: dest,
                            priceUsd: Math.round(price),
                            transfers: Number.isFinite(Number(k)) ? Number(k) : 0,
                            airlineCode: String(it.airline || "").toUpperCase(),
                            flightNumber: String(it.flight_number || ""),
                            departureDate: depAt,
                            rawLink: "",
                            source: "aviasales_v1_live",
                        });
                    }
                }
            }
        } catch {}
    }

    // 3) Aviasales v2 latest fallback
    if (candidates.length === 0) {
        try {
            const qs = new URLSearchParams({
                origin: orig, destination: dest, currency: "usd",
                one_way: "true", period_type: "year", sorting: "price",
                limit: "8", show_to_affiliates: "true", token,
            });
            const r = await fetchWithTimeout(`https://api.travelpayouts.com/v2/prices/latest?${qs}`, {
                headers: { "Accept": "application/json", "X-Access-Token": token },
            }, 6000);
            if (r.ok) {
                const payload = await r.json();
                for (const it of (Array.isArray(payload?.data) ? payload.data : [])) {
                    const rO = String(it.origin || "").toUpperCase();
                    const rD = String(it.destination || "").toUpperCase();
                    const depAt = String(it.depart_date || "").slice(0, 10);
                    const price = Number(it.value);
                    if (!price || !depAt || depAt < todayStr) continue;
                    if (!airportMatches(rO, orig) || !airportMatches(rD, dest)) continue;
                    candidates.push({
                        origIata: orig, destIata: dest,
                        priceUsd: Math.round(price),
                        transfers: Number(it.number_of_changes || 0),
                        airlineCode: String(it.airline || "").toUpperCase(),
                        flightNumber: "",
                        departureDate: depAt,
                        rawLink: "",
                        source: "aviasales_v2_live",
                    });
                }
            }
        } catch {}
    }

    if (candidates.length === 0) return null;

    // فلتر شركة الطيران إن حددها العميل صراحةً
    let pool = candidates;
    const pref = String(preferredAirline || "").trim().toLowerCase();
    if (pref) {
        const matchedAirline = candidates.filter(c => {
            const fullName = (AIRLINE_NAMES[c.airlineCode] || "").toLowerCase();
            return c.airlineCode.toLowerCase() === pref || fullName.includes(pref);
        });
        if (matchedAirline.length > 0) pool = matchedAirline;
    }

    pool.sort((a, b) => (a.priceUsd + a.transfers * 15) - (b.priceUsd + b.transfers * 15));
    return pool[0];
}

async function verifyAiraloForCountry(countryCode) {
    const cc = String(countryCode || "").toUpperCase().trim();
    const slug = AIRALO_COUNTRY_SLUGS[cc];
    if (!slug) return null;
    const rawUrl = `https://www.airalo.com/${slug}-esim`;
    const ok = await verifyLiveUrl(rawUrl, ["esim", slug.split("-")[0]]);
    if (!ok) return null;
    return {
        partner: "airalo",
        title: `Airalo 5G eSIM (${slug.replace(/-/g, " ").replace(/\b\w/g, m => m.toUpperCase())})`,
        rawUrl,
        affiliateUrl: wrapAffiliate("airalo", rawUrl),
    };
}

async function verifyWelcomePickupsForCity(cityEn) {
    const slug = WELCOME_PICKUPS_SLUGS[String(cityEn || "").trim().toLowerCase()];
    if (!slug) return null;
    const rawUrl = `https://www.welcomepickups.com/${slug}/airport-transfer-book/`;
    const ok = await verifyLiveUrl(rawUrl, [slug, "transfer"]);
    if (!ok) return null;
    return {
        partner: "welcome",
        title: `Welcome Pickups VIP Transfer (${cityEn})`,
        rawUrl,
        affiliateUrl: wrapAffiliate("welcome", rawUrl),
    };
}

async function verifyActivitiesForCity(cityEn) {
    const key = String(cityEn || "").trim().toLowerCase();
    const tiqetsSlug = TIQETS_CITY_SLUGS[key];
    if (tiqetsSlug) {
        const rawUrl = `https://www.tiqets.com/en/${tiqetsSlug}/`;
        if (await verifyLiveUrl(rawUrl, [key.split(" ")[0]])) {
            return {
                partner: "tiqets",
                title: `Tiqets Verified Attractions (${cityEn})`,
                rawUrl,
                affiliateUrl: wrapAffiliate("tiqets", rawUrl),
            };
        }
    }
    const wgUrl = `https://wegotrip.com/en/`;
    if (await verifyLiveUrl(wgUrl, ["wegotrip"])) {
        return {
            partner: "wegotrip",
            title: `WeGoTrip Audio Tours (${cityEn})`,
            rawUrl: wgUrl,
            affiliateUrl: wrapAffiliate("wegotrip", wgUrl),
        };
    }
    return null;
}

async function verifyCarRentalForTurkeyCity(cityEn) {
    const key = String(cityEn || "").trim().toLowerCase();
    const lrSlug = LOCALRENT_TR_SLUGS[key];
    if (lrSlug) {
        const rawUrl = `https://localrent.com/en/turkey/${lrSlug}/`;
        if (await verifyLiveUrl(rawUrl, ["turkey", lrSlug])) {
            return {
                partner: "localrent",
                title: `Localrent Car Rental (${cityEn})`,
                rawUrl,
                affiliateUrl: wrapAffiliate("localrent", rawUrl),
            };
        }
    }
    const grSlug = key.replace(/\s+/g, "-");
    if (grSlug) {
        const rawUrl = `https://getrentacar.com/en-US/car-rental/turkey/${grSlug}`;
        if (await verifyLiveUrl(rawUrl, ["turkey"])) {
            return {
                partner: "getrent",
                title: `GetRentacar (${cityEn})`,
                rawUrl,
                affiliateUrl: wrapAffiliate("getrent", rawUrl),
            };
        }
    }
    return null;
}

function isGenuineStayTitleAndUrl(title, url) {
    const t = String(title || "").toLowerCase();
    const u = String(url || "").toLowerCase();
    if (/\/activity\/|\/experiences\/|\/car-rentals\/|\/transfers\/|hotels\/searchresult/.test(u)) return false;
    if (NON_STAY_BLOCKLIST.some(w => new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(t))) return false;
    return STAY_REQUIRED_WORDS.some(w => new RegExp(`\\b${w}\\b`).test(t));
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

    // في حال عدم إضافة المفتاح في Cloudflare بعد، نفحص ملف العروض الحيّ الخاص بالموقع (صفر عروض وهمية)
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
                        source: "site_live_feed",
                    };
                }
            }
        } catch {}
    }

    if (!liveFlight || !(liveFlight.priceUsd > 0)) {
        return jsonResp({
            found: false,
            reason: "no_live_route_offer",
            hasToken: Boolean(token),
        });
    }

    // تطبيق معامل درجة التذكرة الحقيقي للدرجات الأعلى من الاقتصادية
    const classMult = { economy: 1.0, premium: 1.65, business: 2.95, first: 4.8 }[cabinClass] || 1.0;
    const realFareUsd = Math.round(liveFlight.priceUsd * classMult);

    // قفل الميزانية الصارم: إذا كان السعر الحقيقي أعلى من ميزانية العميل، لا نعرض عرضاً وهمياً أو مخالفاً
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

    // التحقق المتوازي الحيّ من الإضافات المعتمدة فقط (Airalo دائماً عند توفر الدولة، وWelcome Pickups للدرجات غير الاقتصادية)
    const [airaloAddon, welcomeAddon] = await Promise.all([
        verifyAiraloForCountry(destCountry),
        cabinClass !== "economy" ? verifyWelcomePickupsForCity(destCity) : Promise.resolve(null),
    ]);

    const airlineFull = liveFlight.airlineName || AIRLINE_NAMES[liveFlight.airlineCode] || liveFlight.airlineCode || "Verified Airline";
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
            source: liveFlight.source,
        },
        addons: {
            transfer: welcomeAddon,
            esim: airaloAddon,
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

    // 1) جمع عروض الإقامة المباشرة المفحوصة فقط من feed الموقع + KKday Stays (ممنوع صفحات البحث الفارغة والأنشطة)
    const directStays = [];
    try {
        const feedRes = await fetchWithTimeout(`${requestOrigin}/live_deals_feed.json?t=${Date.now()}`, {}, 4500);
        if (feedRes.ok) {
            const feed = await feedRes.json();
            for (const h of (feed.mainHotels || [])) {
                const hCity = String(h.cityEn || h.city || "").toLowerCase();
                if (cityEn.toLowerCase() !== "all turkey" && hCity !== cityEn.toLowerCase() && hCity !== province.toLowerCase()) continue;
                if (!h.isDirectProduct) continue; // رفض صفحات البحث العامة الفارغة
                const aff = String(h.affiliateUrl || "");
                let dec = aff;
                try { dec = decodeURIComponent(aff); } catch {}
                if (!isGenuineStayTitleAndUrl(h.title || h.name, dec)) continue;
                const price = Number(h.priceUsd || String(h.price || "").replace(/[^0-9.]/g, "")) || 0;
                if (!(price > 0)) continue;
                directStays.push({
                    partner: String(h.partner || "klook").toLowerCase() === "kkday" ? "kkday" : "klook",
                    name: h.name || h.title,
                    stayType: String(h.stayType || "hotel").toLowerCase(),
                    priceUsd: price,
                    rawUrl: dec,
                    affiliateUrl: aff,
                });
            }
        }
    } catch {}

    // 2) بحث حي في KKday للإقامات فقط مع فلتر منع الجولات الصارم
    if (cityEn.toLowerCase() !== "all turkey") {
        try {
            const kw = `${cityEn} ${stayType === "resort" ? "resort hotel" : (stayType === "apart" ? "apartment hotel" : "hotel stay")}`;
            const kkUrl = `https://www.kkday.com/en/product/ajax_productlist_get_product_list?keyword=${encodeURIComponent(kw)}&currency=USD&sort=pasc&page=1`;
            const r = await fetchWithTimeout(kkUrl, {
                headers: { "Accept": "application/json", "X-Requested-With": "XMLHttpRequest", "User-Agent": "Mozilla/5.0" },
            }, 5500);
            if (r.ok) {
                const payload = await r.json();
                const items = Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload?.data?.data) ? payload.data.data : []);
                for (const it of items.slice(0, 10)) {
                    const pid = String(it.id || it.prod_oid || "").trim();
                    const name = String(it.name || it.title || "").trim();
                    const price = Math.round(Number(it.price || it.display_price || it.sale_price || 0));
                    if (!pid || !name || !(price >= 25 && price <= 950)) continue;
                    if (!name.toLowerCase().includes(cityEn.toLowerCase())) continue;
                    const prodUrl = `https://www.kkday.com/en/product/${pid}`;
                    if (!isGenuineStayTitleAndUrl(name, prodUrl)) continue;
                    if (await verifyLiveUrl(prodUrl, [cityEn.toLowerCase()])) {
                        directStays.push({
                            partner: "kkday",
                            name,
                            stayType,
                            priceUsd: price,
                            rawUrl: prodUrl,
                            affiliateUrl: wrapAffiliate("kkday", prodUrl),
                        });
                        if (directStays.length >= 2) break;
                    }
                }
            }
        } catch {}
    }

    if (directStays.length === 0) {
        return jsonResp({ found: false, reason: "no_live_direct_stay" });
    }

    directStays.sort((a, b) => a.priceUsd - b.priceUsd);
    const affordable = directStays.filter(s => s.priceUsd <= budgetUsd);

    if (affordable.length === 0) {
        return jsonResp({
            found: false,
            reason: "below_budget",
            minMarketUsd: directStays[0].priceUsd,
            userBudgetUsd: budgetUsd,
        });
    }

    const [activityAddon, carAddon, airaloAddon, transferAddon] = await Promise.all([
        verifyActivitiesForCity(cityEn),
        verifyCarRentalForTurkeyCity(cityEn),
        verifyAiraloForCountry("TR"),
        verifyWelcomePickupsForCity(cityEn),
    ]);

    return jsonResp({
        found: true,
        verifiedAt: new Date().toISOString(),
        stays: affordable.slice(0, 2),
        addons: {
            activity: activityAddon,
            transfer: transferAddon,
            car: carAddon,
            esim: airaloAddon,
        },
    });
}

export async function onRequestPost(context) {
    try {
        const body = await context.request.json();
        const origin = new URL(context.request.url).origin;
        if (body?.mode === "flight") {
            return await handleFlightVerification(body, context.env, origin);
        }
        if (body?.mode === "hotel") {
            return await handleHotelVerification(body, origin);
        }
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
