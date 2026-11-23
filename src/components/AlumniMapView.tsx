import React, { useCallback, useEffect, useState } from 'react';
import {
  APIProvider,
  APILoadingStatus,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
  useApiLoadingStatus,
  useMap,
} from '@vis.gl/react-google-maps';
import { Globe2, MapPin, Navigation, Users } from 'lucide-react';
import { Alumnus } from '../types';
import { AlumniLocationCluster, groupAlumniByLocation } from '../utils/geoLookup';
import { AvatarDisplay } from './AvatarDisplay';

interface AlumniMapViewProps {
  alumni: Alumnus[];
  onSelectAlumnus: (alumnus: Alumnus) => void;
}

const DEFAULT_CENTER = { lat: 14.5, lng: 4.5 };

const ClusterMarker: React.FC<{
  cluster: AlumniLocationCluster;
  isSelected: boolean;
  onSelect: (
    cluster: AlumniLocationCluster,
    marker: google.maps.marker.AdvancedMarkerElement
  ) => void;
}> = ({ cluster, isSelected, onSelect }) => {
  const [markerRef, marker] = useAdvancedMarkerRef();

  const handleClick = useCallback(() => {
    if (marker) {
      onSelect(cluster, marker);
    }
  }, [cluster, marker, onSelect]);

  return (
    <AdvancedMarker
      ref={markerRef}
      position={cluster.position}
      title={`${cluster.cityLabel} (${cluster.members.length})`}
      zIndex={isSelected ? 1000 : cluster.members.length}
      onClick={handleClick}
    >
      <Pin
        background={isSelected ? '#f0c75e' : '#d4a843'}
        borderColor="#1a1d2e"
        glyphColor="#111111"
        scale={isSelected ? 1.25 : 1.05}
      >
        <span className="text-[11px] font-extrabold font-mono tabular-nums">
          {cluster.members.length}
        </span>
      </Pin>
    </AdvancedMarker>
  );
};

const MapViewportController: React.FC<{
  clusters: AlumniLocationCluster[];
  focusedCluster: AlumniLocationCluster | null;
}> = ({ clusters, focusedCluster }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (focusedCluster) {
      map.panTo(focusedCluster.position);
      const currentZoom = map.getZoom() || 3;
      if (currentZoom < 6) {
        map.setZoom(6);
      }
      return;
    }

    if (clusters.length === 1) {
      map.setCenter(clusters[0].position);
      map.setZoom(6);
    } else if (clusters.length > 1 && typeof google !== 'undefined' && google.maps?.LatLngBounds) {
      const bounds = new google.maps.LatLngBounds();
      clusters.forEach(c => bounds.extend(c.position));
      map.fitBounds(bounds, { top: 48, right: 48, bottom: 48, left: 48 });
    }
  }, [map, clusters, focusedCluster]);

  return null;
};

const InteractiveGoogleMapInner: React.FC<{
  clusters: AlumniLocationCluster[];
  selectedCluster: AlumniLocationCluster | null;
  onSelectCluster: (cluster: AlumniLocationCluster | null) => void;
  onSelectAlumnus: (alumnus: Alumnus) => void;
}> = ({ clusters, selectedCluster, onSelectCluster, onSelectAlumnus }) => {
  const loadingStatus = useApiLoadingStatus();
  const [anchorMarker, setAnchorMarker] =
    useState<google.maps.marker.AdvancedMarkerElement | null>(null);

  const handleMarkerSelect = useCallback(
    (
      cluster: AlumniLocationCluster,
      marker: google.maps.marker.AdvancedMarkerElement
    ) => {
      setAnchorMarker(marker);
      onSelectCluster(cluster);
    },
    [onSelectCluster]
  );

  const handleCloseInfo = useCallback(() => {
    onSelectCluster(null);
  }, [onSelectCluster]);

  if (
    loadingStatus === APILoadingStatus.FAILED ||
    loadingStatus === APILoadingStatus.AUTH_FAILURE
  ) {
    return (
      <div className="h-[440px] sm:h-[520px] w-full rounded-2xl bg-[#141726] border border-accent/18 flex flex-col items-center justify-center p-6 text-center">
        <Globe2 size={34} className="text-accent mb-3" />
        <h3 className="text-sm font-bold text-white">
          Carte Google Maps indisponible pour le moment
        </h3>
        <p className="text-xs text-[#a09888] mt-1 max-w-md">
          Vérifiez votre connexion réseau ou la configuration de la clé Google Maps. Vous pouvez consulter la répartition par ville et pays dans le panneau latéral.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-[440px] sm:h-[520px] w-full rounded-2xl overflow-hidden border border-accent/20 bg-[#141726]">
      <GoogleMap
        mapId="DEMO_MAP_ID"
        defaultCenter={clusters[0]?.position || DEFAULT_CENTER}
        defaultZoom={clusters.length > 0 ? 3 : 2}
        gestureHandling="greedy"
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        style={{ width: '100%', height: '100%' }}
      >
        <MapViewportController clusters={clusters} focusedCluster={selectedCluster} />

        {clusters.map(cluster => (
          <ClusterMarker
            key={cluster.key}
            cluster={cluster}
            isSelected={selectedCluster?.key === cluster.key}
            onSelect={handleMarkerSelect}
          />
        ))}

        {selectedCluster && anchorMarker && (
          <InfoWindow
            anchor={anchorMarker}
            maxWidth={280}
            onCloseClick={handleCloseInfo}
          >
            <div className="text-[#111111] p-1 space-y-2">
              <div>
                <div className="font-bold text-sm leading-tight">
                  {selectedCluster.cityLabel}
                </div>
                <div className="text-[11px] text-neutral-600">
                  {selectedCluster.countryLabel} · {selectedCluster.members.length} membre{selectedCluster.members.length > 1 ? 's' : ''}
                </div>
              </div>
              <div className="divide-y divide-neutral-200 max-h-40 overflow-y-auto">
                {selectedCluster.members.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onSelectAlumnus(m)}
                    className="w-full text-left py-1.5 hover:bg-neutral-100 rounded px-1 flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate">{m.name}</div>
                      <div className="text-[10px] text-neutral-600 truncate">
                        {m.promo} · {m.filiere}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 shrink-0">
                      Profil →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export const AlumniMapView: React.FC<AlumniMapViewProps> = ({
  alumni,
  onSelectAlumnus,
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const clusters = groupAlumniByLocation(alumni);
  const [selectedClusterKey, setSelectedClusterKey] = useState<string | null>(null);

  const selectedCluster =
    clusters.find(c => c.key === selectedClusterKey) || null;

  const uniqueCountriesCount = new Set(
    clusters.map(c => c.countryLabel.toLowerCase())
  ).size;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
      {/* Left/Main Map Surface */}
      <div className="lg:col-span-8 space-y-3">
        {apiKey ? (
          <APIProvider apiKey={apiKey} libraries={['marker']} language="fr">
            <InteractiveGoogleMapInner
              clusters={clusters}
              selectedCluster={selectedCluster}
              onSelectCluster={c => setSelectedClusterKey(c?.key || null)}
              onSelectAlumnus={onSelectAlumnus}
            />
          </APIProvider>
        ) : (
          <div className="h-[440px] sm:h-[520px] w-full rounded-2xl bg-[#141726] border border-accent/20 flex flex-col items-center justify-center p-6 text-center">
            <MapPin size={34} className="text-accent mb-3" />
            <h3 className="text-sm font-bold text-white">
              Clé Google Maps en attente de chargement
            </h3>
            <p className="text-xs text-[#a09888] mt-1 max-w-md">
              La répartition géographique de vos anciens membres reste accessible dans la liste des implantations ci-contre.
            </p>
          </div>
        )}

        {clusters.length === 0 && (
          <div className="bg-[#1a1d2e] border border-accent/16 rounded-2xl p-4 text-xs text-[#a09888] text-center">
            Aucun membre géolocalisable pour les filtres actuels. Les membres enregistrés apparaîtront automatiquement selon leur ville et pays.
          </div>
        )}
      </div>

      {/* Right Location Directory Sidebar */}
      <aside className="lg:col-span-4 bg-[#1a1d2e] border border-accent/16 rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-accent/14">
          <div>
            <h2 className="text-sm font-bold text-accent flex items-center gap-1.5">
              <Navigation size={15} /> Villes &amp; Pays
            </h2>
            <p className="text-[11px] text-[#a09888] mt-0.5 tabular-nums">
              {clusters.length} ville{clusters.length > 1 ? 's' : ''} · {uniqueCountriesCount} pays
            </p>
          </div>
          {selectedCluster && (
            <button
              type="button"
              onClick={() => setSelectedClusterKey(null)}
              className="text-[11px] font-semibold text-accent hover:underline cursor-pointer"
            >
              Vue globale
            </button>
          )}
        </div>

        {clusters.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#a09888]">
            Aucune localisation disponible pour le moment.
          </div>
        ) : (
          <div className="space-y-2 max-h-[430px] overflow-y-auto pr-1">
            {clusters.map(cluster => {
              const isSelected = selectedCluster?.key === cluster.key;
              return (
                <div
                  key={cluster.key}
                  className={`rounded-xl border transition-colors ${
                    isSelected
                      ? 'bg-[#252840] border-accent/55'
                      : 'bg-[#252840]/50 border-accent/12 hover:border-accent/35'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedClusterKey(isSelected ? null : cluster.key)
                    }
                    className="w-full text-left p-3 flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white truncate">
                        {cluster.cityLabel}
                      </div>
                      <div className="text-[11px] text-[#a09888] truncate">
                        {cluster.countryLabel}
                      </div>
                    </div>
                    <span className="text-xs font-bold font-mono tabular-nums text-accent flex items-center gap-1 shrink-0">
                      <Users size={12} /> {cluster.members.length}
                    </span>
                  </button>

                  {isSelected && (
                    <div className="px-3 pb-3 pt-1 border-t border-accent/12 space-y-1.5">
                      {cluster.members.map(member => (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => onSelectAlumnus(member)}
                          className="w-full text-left p-2 rounded-lg bg-[#1a1d2e]/80 hover:bg-[#1a1d2e] flex items-center gap-2.5 cursor-pointer transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-[#252840] flex items-center justify-center text-sm shrink-0 overflow-hidden">
                            <AvatarDisplay avatar={member.avatar} alt={member.name} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold text-white truncate">
                              {member.name}
                            </div>
                            <div className="text-[11px] text-[#a09888] truncate">
                              {member.promo} · {member.filiere}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </aside>
    </div>
  );
};
