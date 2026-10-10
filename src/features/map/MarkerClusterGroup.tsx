/**
 * react-leaflet has no wrapper for Leaflet.markercluster, so this is it: a layer component that
 * keeps a `MarkerClusterGroup` on the map and re-fills it when the markers change.
 *
 * Clustering is not cosmetic here -- 400 crags in one view is unreadable and slow without it.
 */

import L from "leaflet";
import "leaflet.markercluster";
import { useEffect, useMemo } from "react";
import { useMap } from "react-leaflet";

export interface ClusterMarker {
    readonly id: string;
    readonly lat: number;
    readonly lon: number;
    readonly colour: string;
    readonly selected: boolean;
    readonly favourite: boolean;
    readonly title: string;
}

export const MarkerClusterGroup = ({
    markers,
    onSelect,
}: {
    markers: readonly ClusterMarker[];
    onSelect: (id: string) => void;
}) => {
    const map = useMap();
    const group = useMemo(
        () =>
            L.markerClusterGroup({
                showCoverageOnHover: false,
                maxClusterRadius: 48,
                // Past this zoom the viewer wants the single crags, not a bubble.
                disableClusteringAtZoom: 15,
                spiderfyOnMaxZoom: true,
            }),
        [],
    );

    useEffect(() => {
        map.addLayer(group);
        return () => {
            map.removeLayer(group);
        };
    }, [map, group]);

    useEffect(() => {
        group.clearLayers();
        const layers = markers.map((m) => {
            const size = m.selected ? 18 : 14;
            const icon = L.divIcon({
                className: "",
                iconSize: [size, size],
                iconAnchor: [size / 2, size / 2],
                html: `<div class="kat-marker${m.selected ? " kat-marker-selected" : ""}" style="width:${size}px;height:${size}px;background:${m.colour}"></div>`,
            });
            const marker = L.marker([m.lat, m.lon], { icon, title: m.title, alt: m.title });
            marker.on("click", () => onSelect(m.id));
            return marker;
        });
        group.addLayers(layers);
    }, [group, markers, onSelect]);

    return null;
};
