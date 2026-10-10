import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DownloadIcon from "@mui/icons-material/Download";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LayersIcon from "@mui/icons-material/Layers";
import MapIcon from "@mui/icons-material/Map";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import TranslateIcon from "@mui/icons-material/Translate";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { useData } from "@app/dataContext";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { prefsActions } from "@app/slices/prefsSlice";
import { uiActions } from "@app/slices/uiSlice";
import { useLang, useRegion } from "@app/useAppData";
import { LANGS } from "@core/lang";
import { i18 } from "@core/text";
import { formatDate } from "@i18n/index";

import { APP_VERSION } from "../../version";

export const MorePage = () => {
    const { t } = useTranslation();
    const { i18n } = useTranslation();
    const lang = useLang();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const prefs = useAppSelector((s) => s.prefs);
    const region = useRegion();
    const { onlyShowcase } = useData();

    const pages = region?.text.pages ?? [];

    return (
        <Box sx={{ height: "100%", overflowY: "auto", pb: 4 }}>
            <Box sx={{ p: 2, pb: 0 }}>
                <Typography variant="h2">{t("tab.more")}</Typography>
            </Box>

            <List subheader={<ListSubheader>{t("m.data")}</ListSubheader>}>
                <ListItemButton onClick={() => dispatch(uiActions.setPacksOpen(true))}>
                    <ListItemIcon>
                        <DownloadIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary={t("pk.title")}
                        secondary={
                            onlyShowcase
                                ? t("pk.taste")
                                : prefs.packs
                                      .map((p) => (p.name ? i18(p.name, lang) : p.id))
                                      .join(", ")
                        }
                    />
                    <ChevronRightIcon color="action" />
                </ListItemButton>

                <ListItemButton onClick={() => void navigate("/know")}>
                    <ListItemIcon>
                        <MenuBookIcon />
                    </ListItemIcon>
                    <ListItemText primary={t("kn.title")} />
                    <ChevronRightIcon color="action" />
                </ListItemButton>

                {pages.map((page) => (
                    <ListItemButton key={page.id} onClick={() => void navigate(`/page/${page.id}`)}>
                        <ListItemIcon>
                            <InfoOutlinedIcon />
                        </ListItemIcon>
                        <ListItemText
                            primary={i18(page.title, lang)}
                            secondary={region ? i18(region.name, lang) : undefined}
                        />
                        <ChevronRightIcon color="action" />
                    </ListItemButton>
                ))}
            </List>

            <Divider />
            <List subheader={<ListSubheader>{t("m.settings")}</ListSubheader>}>
                <Box sx={{ px: 2, py: 1 }}>
                    <Stack spacing={2}>
                        <TextField
                            select
                            size="small"
                            fullWidth
                            label={t("m.lang")}
                            value={lang}
                            onChange={(e) => {
                                const next = e.target.value as (typeof LANGS)[number];
                                dispatch(prefsActions.setLang(next));
                                void i18n.changeLanguage(next);
                                document.documentElement.lang = next;
                            }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <TranslateIcon fontSize="small" sx={{ mr: 1 }} />
                                    ),
                                },
                            }}
                        >
                            <MenuItem value="de">Deutsch</MenuItem>
                            <MenuItem value="en">English</MenuItem>
                        </TextField>

                        <TextField
                            select
                            size="small"
                            fullWidth
                            label={t("m.theme")}
                            value={prefs.theme}
                            onChange={(e) => {
                                const next = e.target.value as typeof prefs.theme;
                                dispatch(prefsActions.setTheme(next));
                                if (next === "auto")
                                    document.documentElement.removeAttribute("data-theme");
                                else document.documentElement.setAttribute("data-theme", next);
                            }}
                        >
                            <MenuItem value="auto">{t("m.theme.auto")}</MenuItem>
                            <MenuItem value="light">{t("m.theme.light")}</MenuItem>
                            <MenuItem value="dark">{t("m.theme.dark")}</MenuItem>
                        </TextField>

                        {region?.ch ? (
                            <TextField
                                select
                                size="small"
                                fullWidth
                                label={t("map.base")}
                                value={prefs.baseCH}
                                onChange={(e) =>
                                    dispatch(
                                        prefsActions.setBaseCh(
                                            e.target.value as typeof prefs.baseCH,
                                        ),
                                    )
                                }
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <LayersIcon fontSize="small" sx={{ mr: 1 }} />
                                        ),
                                    },
                                }}
                            >
                                <MenuItem value="ch">swisstopo</MenuItem>
                                <MenuItem value="chsat">swisstopo Luftbild</MenuItem>
                                <MenuItem value="topo">OpenTopoMap</MenuItem>
                            </TextField>
                        ) : (
                            <TextField
                                select
                                size="small"
                                fullWidth
                                label={t("map.base")}
                                value={prefs.base}
                                onChange={(e) =>
                                    dispatch(
                                        prefsActions.setBase(e.target.value as typeof prefs.base),
                                    )
                                }
                                slotProps={{
                                    input: {
                                        startAdornment: <MapIcon fontSize="small" sx={{ mr: 1 }} />,
                                    },
                                }}
                            >
                                <MenuItem value="topo">OpenTopoMap</MenuItem>
                                <MenuItem value="osm">OpenStreetMap</MenuItem>
                                <MenuItem value="sat">Satellit</MenuItem>
                            </TextField>
                        )}

                        {region?.ch && (
                            <>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            size="small"
                                            checked={prefs.chTrails}
                                            onChange={(e) =>
                                                dispatch(
                                                    prefsActions.setFlag({
                                                        key: "chTrails",
                                                        value: e.target.checked,
                                                    }),
                                                )
                                            }
                                        />
                                    }
                                    label={t("m.chTrails")}
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            size="small"
                                            checked={prefs.chWrz}
                                            onChange={(e) =>
                                                dispatch(
                                                    prefsActions.setFlag({
                                                        key: "chWrz",
                                                        value: e.target.checked,
                                                    }),
                                                )
                                            }
                                        />
                                    }
                                    label={t("m.chWrz")}
                                />
                            </>
                        )}
                    </Stack>
                </Box>
            </List>

            <Divider />
            <Box sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    {t("m.version.app")}: <span className="num">{APP_VERSION.version}</span>
                </Typography>
                {APP_VERSION.built && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                        {formatDate(APP_VERSION.built.slice(0, 10), lang)}
                    </Typography>
                )}
                {region && (
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mt: 1 }}
                    >
                        {t("m.dataDate")}:{" "}
                        {formatDate(region.updated ?? region.accessed ?? "", lang)} ·{" "}
                        {region.version}
                    </Typography>
                )}
            </Box>
        </Box>
    );
};
