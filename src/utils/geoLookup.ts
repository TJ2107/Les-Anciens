import { Alumnus } from '../types';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface AlumniLocationCluster {
  key: string;
  cityLabel: string;
  countryLabel: string;
  position: GeoPoint;
  members: Alumnus[];
}

function normalizeGeoKey(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

const CITY_COORDINATES: Record<string, GeoPoint> = {
  // Sénégal
  dakar: { lat: 14.7167, lng: -17.4677 },
  thies: { lat: 14.791, lng: -16.9359 },
  'saint-louis': { lat: 16.0179, lng: -16.4896 },
  ziguinchor: { lat: 12.568, lng: -16.2719 },
  touba: { lat: 14.85, lng: -15.8833 },

  // Cameroun
  yaounde: { lat: 3.848, lng: 11.5021 },
  douala: { lat: 4.0511, lng: 9.7679 },
  bafoussam: { lat: 5.4778, lng: 10.4176 },
  garoua: { lat: 9.3014, lng: 13.3977 },
  bamenda: { lat: 5.9597, lng: 10.146 },
  maroua: { lat: 10.591, lng: 14.3159 },
  limbe: { lat: 4.0242, lng: 9.205 },
  kribi: { lat: 2.9373, lng: 9.9077 },

  // Côte d'Ivoire
  abidjan: { lat: 5.36, lng: -4.0083 },
  yamoussoukro: { lat: 6.8276, lng: -5.2893 },
  bouake: { lat: 7.6939, lng: -5.0303 },
  'san-pedro': { lat: 4.7485, lng: -6.6363 },
  korhogo: { lat: 9.458, lng: -5.6296 },

  // Congo (République du Congo)
  brazzaville: { lat: -4.2634, lng: 15.2429 },
  'pointe-noire': { lat: -4.7761, lng: 11.8636 },
  'pointe noire': { lat: -4.7761, lng: 11.8636 },
  dolisie: { lat: -4.1983, lng: 12.6664 },
  nkayi: { lat: -4.1819, lng: 13.2844 },
  owando: { lat: -0.4819, lng: 15.8999 },

  // RD Congo
  kinshasa: { lat: -4.4419, lng: 15.2663 },
  lubumbashi: { lat: -11.6609, lng: 27.4794 },
  goma: { lat: -1.6585, lng: 29.2205 },
  kisangani: { lat: 0.5153, lng: 25.191 },
  bukavu: { lat: -2.5083, lng: 28.8608 },
  matadi: { lat: -5.8167, lng: 13.45 },

  // Burkina Faso
  ouagadougou: { lat: 12.3714, lng: -1.5197 },
  'bobo-dioulasso': { lat: 11.1771, lng: -4.2979 },
  koudougou: { lat: 12.2526, lng: -2.3627 },

  // Mali
  bamako: { lat: 12.6392, lng: -8.0029 },
  sikasso: { lat: 11.3176, lng: -5.6665 },
  segou: { lat: 13.4317, lng: -6.2157 },

  // Gabon
  libreville: { lat: 0.4162, lng: 9.4673 },
  'port-gentil': { lat: -0.7193, lng: 8.7815 },
  franceville: { lat: -1.6333, lng: 13.5833 },

  // Guinée
  conakry: { lat: 9.6412, lng: -13.5784 },
  kankan: { lat: 10.3854, lng: -9.3057 },
  labe: { lat: 11.3182, lng: -12.2833 },

  // Togo & Bénin
  lome: { lat: 6.1375, lng: 1.2123 },
  kara: { lat: 9.5511, lng: 1.1861 },
  cotonou: { lat: 6.3703, lng: 2.3912 },
  'porto-novo': { lat: 6.4969, lng: 2.6289 },
  parakou: { lat: 9.3372, lng: 2.6303 },

  // Autres capitales africaines
  niamey: { lat: 13.5116, lng: 2.1254 },
  ndjamena: { lat: 12.1348, lng: 15.0557 },
  bangui: { lat: 4.3947, lng: 18.5582 },
  accra: { lat: 5.6037, lng: -0.187 },
  lagos: { lat: 6.5244, lng: 3.3792 },
  abuja: { lat: 9.0765, lng: 7.3986 },
  casablanca: { lat: 33.5731, lng: -7.5898 },
  rabat: { lat: 34.0209, lng: -6.8416 },
  marrakech: { lat: 31.6295, lng: -7.9811 },
  tunis: { lat: 36.8065, lng: 10.1815 },
  alger: { lat: 36.7538, lng: 3.0588 },
  kigali: { lat: -1.9441, lng: 30.0619 },
  nairobi: { lat: -1.2921, lng: 36.8219 },
  johannesburg: { lat: -26.2041, lng: 28.0473 },

  // France
  paris: { lat: 48.8566, lng: 2.3522 },
  lyon: { lat: 45.764, lng: 4.8357 },
  marseille: { lat: 43.2965, lng: 5.3698 },
  toulouse: { lat: 43.6047, lng: 1.4442 },
  bordeaux: { lat: 44.8378, lng: -0.5792 },
  lille: { lat: 50.6292, lng: 3.0573 },
  nantes: { lat: 47.2184, lng: -1.5536 },
  strasbourg: { lat: 48.5734, lng: 7.7521 },
  montpellier: { lat: 43.6108, lng: 3.8767 },
  rennes: { lat: 48.1173, lng: -1.6778 },
  grenoble: { lat: 45.1885, lng: 5.7245 },

  // Canada
  montreal: { lat: 45.5017, lng: -73.5673 },
  quebec: { lat: 46.8139, lng: -71.208 },
  ottawa: { lat: 45.4215, lng: -75.6972 },
  toronto: { lat: 43.6532, lng: -79.3832 },
  sherbrooke: { lat: 45.4042, lng: -71.8929 },
  vancouver: { lat: 49.2827, lng: -123.1207 },

  // Belgique & Europe & Amérique
  bruxelles: { lat: 50.8503, lng: 4.3517 },
  brussels: { lat: 50.8503, lng: 4.3517 },
  liege: { lat: 50.6326, lng: 5.5797 },
  louvain: { lat: 50.8798, lng: 4.7005 },
  anvers: { lat: 51.2194, lng: 4.4025 },
  geneve: { lat: 46.2044, lng: 6.1432 },
  lausanne: { lat: 46.5197, lng: 6.6323 },
  londres: { lat: 51.5074, lng: -0.1278 },
  london: { lat: 51.5074, lng: -0.1278 },
  berlin: { lat: 52.52, lng: 13.405 },
  madrid: { lat: 40.4168, lng: -3.7038 },
  'new york': { lat: 40.7128, lng: -74.006 },
  washington: { lat: 38.9072, lng: -77.0369 },
  boston: { lat: 42.3601, lng: -71.0589 },
};

const COUNTRY_COORDINATES: Record<string, GeoPoint> = {
  cameroun: { lat: 7.3697, lng: 12.3547 },
  senegal: { lat: 14.4974, lng: -14.4524 },
  'cote divoire': { lat: 7.54, lng: -5.5471 },
  'cote d ivoire': { lat: 7.54, lng: -5.5471 },
  'rd congo': { lat: -4.0383, lng: 21.7587 },
  congo: { lat: -0.228, lng: 15.8277 },
  'burkina faso': { lat: 12.2383, lng: -1.5616 },
  mali: { lat: 17.5707, lng: -3.9962 },
  gabon: { lat: -0.8037, lng: 11.6094 },
  guinee: { lat: 9.9456, lng: -9.6966 },
  togo: { lat: 8.6195, lng: 0.8248 },
  benin: { lat: 9.3077, lng: 2.3158 },
  france: { lat: 46.2276, lng: 2.2137 },
  canada: { lat: 56.1304, lng: -106.3468 },
  belgique: { lat: 50.5039, lng: 4.4699 },
  maroc: { lat: 31.7917, lng: -7.0926 },
  tunisie: { lat: 33.8869, lng: 9.5375 },
  suisse: { lat: 46.8182, lng: 8.2275 },
  'etats-unis': { lat: 37.0902, lng: -95.7129 },
  'royaume-uni': { lat: 55.3781, lng: -3.436 },
};

export function resolveAlumnusGeoPoint(city: string, country: string): GeoPoint | null {
  const normCity = normalizeGeoKey(city);
  if (normCity && normCity !== '—' && CITY_COORDINATES[normCity]) {
    return CITY_COORDINATES[normCity];
  }

  // Partial city match (e.g. "Dakar Plateau")
  if (normCity && normCity !== '—') {
    for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
      if (normCity.includes(key) || key.includes(normCity)) {
        return coords;
      }
    }
  }

  const normCountry = normalizeGeoKey(country);
  if (normCountry && COUNTRY_COORDINATES[normCountry]) {
    return COUNTRY_COORDINATES[normCountry];
  }

  for (const [key, coords] of Object.entries(COUNTRY_COORDINATES)) {
    if (normCountry.includes(key)) {
      return coords;
    }
  }

  return null;
}

export function groupAlumniByLocation(alumni: Alumnus[]): AlumniLocationCluster[] {
  const buckets: Record<string, AlumniLocationCluster> = {};
  const fallbackSeedCount: Record<string, number> = {};

  for (const member of alumni) {
    const baseCoords = resolveAlumnusGeoPoint(member.city, member.country);
    if (!baseCoords) continue;

    const cleanCity = member.city && member.city !== '—' ? member.city.trim() : '';
    const cleanCountry = member.country.trim();
    const cityDisplay = cleanCity || cleanCountry.replace(/^[^\p{L}]+\s*/u, '');
    const bucketKey = `${normalizeGeoKey(cityDisplay)}|${normalizeGeoKey(cleanCountry)}`;

    if (!buckets[bucketKey]) {
      // Slight deterministic offset if multiple distinct unknown cities fall onto the same country centroid
      const coordKey = `${baseCoords.lat.toFixed(3)},${baseCoords.lng.toFixed(3)}`;
      const seenCount = fallbackSeedCount[coordKey] || 0;
      fallbackSeedCount[coordKey] = seenCount + 1;
      const offsetLat = seenCount === 0 ? 0 : ((seenCount % 3) - 1) * 0.14;
      const offsetLng = seenCount === 0 ? 0 : Math.floor(seenCount / 3) * 0.16;

      buckets[bucketKey] = {
        key: bucketKey,
        cityLabel: cityDisplay,
        countryLabel: cleanCountry,
        position: {
          lat: baseCoords.lat + offsetLat,
          lng: baseCoords.lng + offsetLng,
        },
        members: [],
      };
    }
    buckets[bucketKey].members.push(member);
  }

  return Object.values(buckets).sort((a, b) => b.members.length - a.members.length);
}
