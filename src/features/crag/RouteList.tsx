import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import StarIcon from "@mui/icons-material/Star";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "@app/hooks";
import { favouritesActions } from "@app/slices/favouritesSlice";
import { useLogIndex } from "@app/useAppData";
import { bestEntry, isSend } from "@core/logbook";
import type { Crag, Route } from "@domain/model";

/**
 * The routes of a crag. Numbered: where the order on the wall is known the number is the place on
 * the wall from left to right, otherwise the place in the list -- and either way the number stays
 * with the route when the list is sorted, because it comes from `ord`.
 */
const RouteRow = ({ route, onLog }: { route: Route; onLog: (route: Route) => void }) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const log = useLogIndex();
    const isFav = useAppSelector((s) => s.favourites.routes.includes(route.key));
    const entries = log.byRoute[route.key] ?? [];
    const best = bestEntry(entries);
    const done = entries.some(isSend);

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                py: 0.6,
                borderBottom: 1,
                borderColor: "divider",
            }}
        >
            <Typography
                variant="body2"
                color="text.secondary"
                className="num"
                sx={{ width: 26, textAlign: "right" }}
            >
                {route.ord + 1}
            </Typography>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" className="kat-ellipsis">
                    {route.name}
                </Typography>
                {route.stars && (
                    <Stack direction="row" sx={{ alignItems: "center", gap: 0.25 }}>
                        <StarIcon sx={{ fontSize: 12, color: "marker.rate" }} />
                        <Typography variant="caption" color="text.secondary" className="num">
                            {route.stars[0].toFixed(1)} ({route.stars[1]})
                        </Typography>
                    </Stack>
                )}
            </Box>
            {route.length != null && (
                <Typography variant="caption" color="text.secondary" className="num">
                    {route.length} m
                </Typography>
            )}
            {route.pitches != null && route.pitches > 1 && (
                <Typography variant="caption" color="text.secondary" className="num">
                    {route.pitches} SL
                </Typography>
            )}
            <Typography
                variant="body2"
                className="num"
                sx={{ width: 42, textAlign: "right", fontWeight: 600 }}
            >
                {route.grade ?? "–"}
            </Typography>
            <IconButton
                size="small"
                aria-label={t(isFav ? "fav.t.rm" : "fav.t.add")}
                onClick={() => dispatch(favouritesActions.toggleRoute(route.key))}
            >
                {isFav ? (
                    <FavoriteIcon sx={{ fontSize: 16, color: "marker.fav" }} />
                ) : (
                    <FavoriteBorderIcon sx={{ fontSize: 16 }} />
                )}
            </IconButton>
            <IconButton size="small" aria-label={t("lb.new")} onClick={() => onLog(route)}>
                {done ? (
                    <CheckCircleIcon sx={{ fontSize: 18, color: "success.main" }} />
                ) : best ? (
                    <AddCircleOutlineIcon sx={{ fontSize: 18, color: "warning.main" }} />
                ) : (
                    <AddCircleOutlineIcon sx={{ fontSize: 18 }} />
                )}
            </IconButton>
        </Box>
    );
};

export const RouteList = ({ crag, onLog }: { crag: Crag; onLog: (route: Route) => void }) => {
    const { t } = useTranslation();
    if (!crag.routes.length) {
        return (
            <Typography variant="body2" color="text.secondary">
                {t("r.none")}
            </Typography>
        );
    }
    return (
        <Box>
            {crag.routes.map((route) => (
                <RouteRow key={route.key} route={route} onLog={onLog} />
            ))}
        </Box>
    );
};
