# TravelWise — mobile prototype

**Compare. Choose. Go.** An Expo + TypeScript app that compares public transport, cab, two-wheeler and carpool for trips in Pune, side by side, so you can weigh time against cost and choose for yourself. There is no backend or sign-in; search state, saved commutes and the profile live in memory.

## About

Getting around Pune usually means juggling several apps: one for the bus, one for the metro, one or two for cabs and bike taxis. Each shows only its own option, so comparing them means switching back and forth and guessing.

TravelWise puts every way to make a trip on one screen. Enter where you're starting and where you're going, pick when you want to leave (now, later today or any future date) and it lays out four options:

- **Public transport**: PMPML buses and the Pune Metro, with each step of the journey: where to walk, which bus to catch, which metro line and how many stops.
- **Cab**: door-to-door, with a fare range that reflects traffic and peak hours.
- **Two-wheeler**: own vehicle or bike taxi, usually the fastest through traffic.
- **Carpool**: a shared ride with verified commuters, for less than a cab.

Each option shows an estimated travel time and an honest fare *range* rather than a single number that will be wrong. Labels such as *Fastest*, *Cheapest*, *Most predictable* and *Comfortable* point out the trade-offs. TravelWise never decides for you; it makes the choice clear.

It also fits your own habits: set your preferred modes, budget and maximum travel time, and results gently flag options that don't fit, without hiding any. Save the commutes you make every day and load them with one tap.

### How it works

- Places are looked up on **OpenStreetMap** (via Photon), biased towards Pune.
- Road distance and traffic come from **TomTom** when a key is set; otherwise TravelWise estimates them.
- The metro is planned on the **real Pune Metro network**: the Aqua Line (Vanaz–Ramwadi) and the Purple Line (PCMC–Swargate), with a change at District Court. It's suggested only when a station is within reach of both ends and it's faster than a direct bus. No more "take the metro" for trips the metro doesn't serve.
- Fares follow simple, editable rules in one file (`constants/pricing.ts`), so they're easy to tune as real prices change.

### Status

TravelWise is a working prototype: there are no accounts and no booking, and fares are estimates. It runs in Expo Go, in the browser and as an installable Android app.

## Features

- **Place search** with suggestions, biased to Pune ([Photon](https://photon.komoot.io), OpenStreetMap — free, no key).
- **Use my location** fills in the starting point (`expo-location`, foreground permission only).
- **Any departure time** — *Leave now*, or any future date and time from the platform's calendar and clock pickers.
- **Road distance and traffic** from the [TomTom Routing API](https://developer.tomtom.com) when a key is set; otherwise a straight-line estimate.
- **Metro only where it serves the trip** — journeys are planned on the real Pune Metro network (Aqua and Purple Lines, change at District Court; station data from OpenStreetMap). The metro is suggested only when a station is within reach of both ends and it beats a direct bus.
- **Estimated fare ranges** for every mode (`constants/pricing.ts`), with soft notes when an option exceeds your budget or time limit.
- **Route map** — Google/Apple Maps in Expo Go and on iOS, OpenStreetMap on the web.

## Run

```bash
cd mobile
npm install
npx expo start          # scan the QR code with Expo Go on your phone
```

`npx expo start --web` runs it in a browser. Check the code with `npx tsc --noEmit` and `npx expo lint`.

### Live traffic (optional)

Copy `.env.example` to `.env.local` and add a free TomTom Routing API key:

```bash
EXPO_PUBLIC_TOMTOM_API_KEY=your-key
```

Without it, distances and times are estimated and the route is drawn as a dashed straight line.

## Build an Android app (APK)

Builds run in the cloud with [EAS Build](https://docs.expo.dev/build/introduction/) — no Android Studio needed. You need a free Expo account.

```bash
npx eas-cli@latest login
npx eas-cli@latest build -p android --profile preview
```

When the build finishes, open the link on an Android phone, download the `.apk` and install it. The `preview` profile in `eas.json` produces an installable APK; `production` produces a Play Store bundle.

> **Map in installed Android builds:** Google Maps on Android needs an API key outside Expo Go. Until one is added (`androidGoogleMapsApiKey` in the `react-native-maps` config plugin), installed Android builds show a route sketch instead of a map — see `components/RouteMap.tsx`.

## Structure

```
app/                  Expo Router routes
  _layout.tsx         Root stack + providers
  (tabs)/             Home · Explore · Saved · Profile (custom BottomNavigation)
  option/[mode].tsx   Option details
components/           Reusable UI (TravelInput, DepartureTimeField, TravelOptionCard, RouteMap, …)
context/              TravelContext — search form, results, saved commutes, profile
data/                 Pune Metro lines, offline demo routes, saved commutes, profile, trade-off copy
types/                Domain types
constants/            Theme tokens, travel-mode metadata, fare rules
utils/                travelService (the backend seam), geocoding, routing, metro planning,
                      route generation, current location, formatting
```

## Demo tips

- Leave From/To empty and tap **Search Travel** to see validation.
- Try *Pune Railway Station* → *Vanaz* (Aqua Line metro) and *Hadapsar* → *Kharadi* (bus only — no station nearby).
- Tap the heart on results to save a route. Tap a saved commute to load it into the search form.
- **Profile → Prototype demo** switches the next search to the *No options* or *Failure* state.
- Offline (places can't be looked up), *Hadapsar* to *Vanaz*, *Kharadi* or *FC Road* falls back to hand-written routes, and any other pair gets generated estimates — the same pair always gives the same result.
