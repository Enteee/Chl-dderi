import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AppBar from "@mui/material/AppBar";
import IconButton from "@mui/material/IconButton";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

import { useData } from "@app/dataContext";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { prefsActions } from "@app/slices/prefsSlice";
import { uiActions } from "@app/slices/uiSlice";
import { useLang } from "@app/useAppData";
import { i18 } from "@core/text";

/**
 * The bar: the region tabs when more than one pack is loaded, a back arrow on the pages that are
 * one level down, and the «+» that opens the pack dialog.
 */
export const TopBar = () => {
    const { t } = useTranslation();
    const lang = useLang();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const { regions, onlyShowcase } = useData();
    const region = useAppSelector((s) => s.prefs.region);

    const deep = pathname !== "/";
    const current = regions.some((r) => r.key === region) ? region : (regions[0]?.key ?? false);

    return (
        <AppBar position="static" color="default" elevation={0} sx={{ pt: "var(--sat)" }}>
            <Toolbar variant="dense" sx={{ gap: 1, minHeight: 48 }}>
                {deep && (
                    <IconButton
                        edge="start"
                        onClick={() => void navigate(-1)}
                        aria-label={t("back")}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                )}

                {regions.length > 1 ? (
                    <Tabs
                        value={current}
                        onChange={(_e, value: string) => {
                            dispatch(prefsActions.setRegion(value));
                            dispatch(uiActions.select(null));
                        }}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{ flex: 1, minHeight: 48 }}
                    >
                        {regions.map((r) => (
                            <Tab key={r.key} value={r.key} label={i18(r.name, lang)} />
                        ))}
                    </Tabs>
                ) : (
                    <Typography variant="h3" sx={{ flex: 1 }} className="kat-ellipsis">
                        {regions[0] ? i18(regions[0].name, lang) : t("app.name")}
                        {onlyShowcase && (
                            <Typography
                                component="span"
                                variant="caption"
                                color="text.secondary"
                                sx={{ ml: 1 }}
                            >
                                {t("pk.taste")}
                            </Typography>
                        )}
                    </Typography>
                )}

                <IconButton
                    onClick={() => dispatch(uiActions.setPacksOpen(true))}
                    aria-label={t("pk.title")}
                >
                    <AddIcon />
                </IconButton>
            </Toolbar>
        </AppBar>
    );
};
