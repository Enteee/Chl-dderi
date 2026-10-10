/**
 * The shell: a bar with the region tabs on top, a bottom navigation on a phone, and the routes in
 * between.
 *
 * Routing is a hash router on purpose. The old app addressed a crag with `#<crag-id>` and its pages
 * with `#/fav`, `#/more`, `#/log`, and those links are in people's bookmarks and shared messages --
 * so `LegacyTokens` below answers the bare `#<crag-id>` form too.
 */

import FavoriteIcon from "@mui/icons-material/Favorite";
import MapIcon from "@mui/icons-material/Map";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";

import { useData } from "@app/dataContext";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { Persistence } from "@app/Persistence";
import { uiActions } from "@app/slices/uiSlice";

import { CragPage } from "./features/crag/CragPage";
import { FavouritesPage } from "./features/favourites/FavouritesPage";
import { KnowPage } from "./features/know/KnowPage";
import { CragList } from "./features/list/CragList";
import { FiltersDrawer } from "./features/list/FiltersDrawer";
import { LogbookPage } from "./features/logbook/LogbookPage";
import { MapPane } from "./features/map/MapPane";
import { MorePage } from "./features/more/MorePage";
import { PackPage } from "./features/more/PackPage";
import { PacksDialog } from "./features/packs/PacksDialog";
import { Toasts } from "./features/shell/Toasts";
import { TopBar } from "./features/shell/TopBar";

/** `#<crag-id>`, the deep link the old app used, before react-router sees it. */
const LegacyTokens = () => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { byId } = useData();

    useEffect(() => {
        const token = pathname.replace(/^\//, "");
        if (!token || token.includes("/")) return;
        if (byId[token]) void navigate(`/crag/${token}`, { replace: true });
    }, [pathname, byId, navigate]);

    return null;
};

/** Map and list side by side on a wide screen; the list slides over the map on a phone. */
const Home = () => {
    const theme = useTheme();
    const wide = useMediaQuery(theme.breakpoints.up("md"));
    const dispatch = useAppDispatch();
    const listOpen = useAppSelector((s) => s.ui.listOpen);

    if (wide) {
        return (
            <Box sx={{ display: "flex", height: "100%", minHeight: 0 }}>
                <Box sx={{ width: 420, borderRight: 1, borderColor: "divider", minWidth: 0 }}>
                    <CragList />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <MapPane />
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ position: "relative", height: "100%" }}>
            <MapPane />
            <Paper
                elevation={8}
                sx={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 1200,
                    transform: listOpen ? "none" : "translateY(100%)",
                    transition: "transform .25s ease",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <CragList />
            </Paper>
            <Box
                sx={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 1300,
                    display: "flex",
                    justifyContent: "center",
                    pb: 1,
                    pointerEvents: "none",
                }}
            >
                <Box
                    component="button"
                    onClick={() => dispatch(uiActions.setListOpen(!listOpen))}
                    sx={{
                        pointerEvents: "auto",
                        border: 1,
                        borderColor: "divider",
                        bgcolor: "background.paper",
                        color: "text.primary",
                        px: 2,
                        py: 0.75,
                        borderRadius: 999,
                        font: "inherit",
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    <ListToggleLabel open={listOpen} />
                </Box>
            </Box>
        </Box>
    );
};

const ListToggleLabel = ({ open }: { open: boolean }) => {
    const { t } = useTranslation();
    return <>{open ? t("tab.map") : t("tab.list")}</>;
};

const BottomNav = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const current = pathname.startsWith("/fav")
        ? "/fav"
        : pathname.startsWith("/log")
          ? "/log"
          : pathname.startsWith("/more")
            ? "/more"
            : "/";

    return (
        <Paper
            square
            elevation={3}
            sx={{ borderTop: 1, borderColor: "divider", pb: "var(--sab)", zIndex: 1400 }}
        >
            <BottomNavigation
                showLabels
                value={current}
                onChange={(_e, value: string) => void navigate(value)}
            >
                <BottomNavigationAction label={t("tab.map")} value="/" icon={<MapIcon />} />
                <BottomNavigationAction label={t("tab.fav")} value="/fav" icon={<FavoriteIcon />} />
                <BottomNavigationAction label={t("tab.log")} value="/log" icon={<MenuBookIcon />} />
                <BottomNavigationAction
                    label={t("tab.more")}
                    value="/more"
                    icon={<MoreHorizIcon />}
                />
            </BottomNavigation>
        </Paper>
    );
};

export const App = () => (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
        <Persistence />
        <LegacyTokens />
        <TopBar />
        <Box component="main" sx={{ flex: 1, minHeight: 0, position: "relative" }}>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/crag/:id" element={<CragPage />} />
                <Route path="/fav" element={<FavouritesPage />} />
                <Route path="/log" element={<LogbookPage />} />
                <Route path="/more" element={<MorePage />} />
                <Route path="/know" element={<KnowPage />} />
                <Route path="/page/:pageId" element={<PackPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Box>
        <BottomNav />
        <FiltersDrawer />
        <PacksDialog />
        <Toasts />
    </Box>
);
