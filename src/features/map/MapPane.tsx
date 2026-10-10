import MyLocationIcon from "@mui/icons-material/MyLocation";
import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import { useTheme } from "@mui/material/styles";
import L from "leaflet";
import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@app/hooks";
import { uiActions } from "@app/slices/uiSlice";
import { useRegion, useShownCrags } from "@app/useAppData";
import { bboxOf } from "@core/geo";

import { BASE_LAYERS, CH_LAYERS, CH_OVERLAYS } from "./layers";
import { MarkerClusterGroup, type ClusterMarker } from "./MarkerClusterGroup";

/** Fit the map to whatever is on screen when the region or the filters change. */
const FitToShown = ({ bounds }: { bounds: L.LatLngBoundsExpression | null }) => {
    const map = useMap();
    useEffect(() => {
        if (bounds) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }, [map, bounds]);
    return null;
};

export const MapPane = () => {
    const { t } = useTranslation();
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const shown = useShownCrags();
    const region = useRegion();
    const selectedId = useAppSelector((s) => s.ui.selectedId);
    const favCrags = useAppSelector((s) => s.favourites.crags);
    const prefs = useAppSelector((s) => s.prefs);
    const me = useAppSelector((s) => s.ui.me);

    const inSwitzerland = region?.ch === true;
    const base = inSwitzerland
        ? (CH_LAYERS[prefs.baseCH] ?? CH_LAYERS.ch!)
        : (BASE_LAYERS[prefs.base] ?? BASE_LAYERS.topo!);

    const markers = useMemo<ClusterMarker[]>(
        () =>
            shown
                .filter((m) => m.crag.lat != null && m.crag.lon != null)
                .map(({ crag }) => ({
                    id: crag.id,
                    lat: crag.lat!,
                    lon: crag.lon!,
                    colour:
                        crag.cls === "unk"
                            ? theme.palette.grade.unknown
                            : theme.palette.grade[crag.cls],
                    selected: crag.id === selectedId,
                    favourite: favCrags.includes(crag.id),
                    title: crag.name,
                })),
        [shown, selectedId, favCrags, theme.palette.grade],
    );

    const bounds = useMemo<L.LatLngBoundsExpression | null>(() => {
        const box = bboxOf(
            markers.map((m) => [m.lat, m.lon] as const),
            0.01,
        );
        return box
            ? ([
                  [box[0], box[1]],
                  [box[2], box[3]],
              ] as L.LatLngBoundsExpression)
            : null;
    }, [markers]);

    const onSelect = useCallback(
        (id: string) => {
            dispatch(uiActions.select(id));
            void navigate(`/crag/${id}`);
        },
        [dispatch, navigate],
    );

    const locate = () => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            (pos) =>
                dispatch(
                    uiActions.setMe({
                        lat: pos.coords.latitude,
                        lon: pos.coords.longitude,
                        acc: pos.coords.accuracy,
                    }),
                ),
            () => dispatch(uiActions.toast({ message: t("loc.nofix"), severity: "warning" })),
            { enableHighAccuracy: true, timeout: 10000 },
        );
    };

    const centre = region?.view?.center ?? [44.17, 8.34];
    const zoom = region?.view?.zoom ?? 12;

    return (
        <Box sx={{ position: "relative", height: "100%", width: "100%" }}>
            <MapContainer
                center={[centre[0], centre[1]]}
                zoom={zoom}
                style={{ height: "100%", width: "100%" }}
                zoomControl={false}
                attributionControl
            >
                <TileLayer
                    url={base.url}
                    attribution={base.attribution}
                    maxZoom={base.maxZoom}
                    {...(base.subdomains ? { subdomains: base.subdomains } : {})}
                />
                {inSwitzerland && prefs.chTrails && (
                    <TileLayer
                        url={CH_OVERLAYS.trails.url}
                        attribution={CH_OVERLAYS.trails.attribution}
                        maxZoom={CH_OVERLAYS.trails.maxZoom}
                        opacity={0.9}
                    />
                )}
                {inSwitzerland && prefs.chWrz && (
                    <TileLayer
                        url={CH_OVERLAYS.wrz.url}
                        attribution={CH_OVERLAYS.wrz.attribution}
                        maxZoom={CH_OVERLAYS.wrz.maxZoom}
                        opacity={0.6}
                    />
                )}
                <MarkerClusterGroup markers={markers} onSelect={onSelect} />
                {me && (
                    <Marker
                        position={[me.lat, me.lon]}
                        title={t("loc.you")}
                        icon={L.divIcon({
                            className: "",
                            iconSize: [16, 16],
                            iconAnchor: [8, 8],
                            html: `<div class="kat-marker" style="width:16px;height:16px;background:${theme.palette.marker.me}"></div>`,
                        })}
                    />
                )}
                <FitToShown bounds={bounds} />
            </MapContainer>

            <Fab
                size="small"
                color="default"
                onClick={locate}
                aria-label={t("loc.show")}
                sx={{ position: "absolute", right: 12, bottom: 12, zIndex: 1000 }}
            >
                <MyLocationIcon fontSize="small" />
            </Fab>
        </Box>
    );
};
