import DirectionsIcon from "@mui/icons-material/Directions";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import LaunchIcon from "@mui/icons-material/Launch";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useParams } from "react-router-dom";

import { useData } from "@app/dataContext";
import { useAppDispatch, useAppSelector } from "@app/hooks";
import { favouritesActions } from "@app/slices/favouritesSlice";
import { useLang, useRegionOf } from "@app/useAppData";
import { longText, orientLabel, shortText } from "@core/dataText";
import { BANDS } from "@core/grades";
import { i18 } from "@core/text";
import type { Route } from "@domain/model";

import { LogSheet } from "../logbook/LogSheet";
import { PackInline } from "../packs/PackText";

import { GradeBar } from "./GradeBar";
import { RouteList } from "./RouteList";

/** A labelled fact, the shape most of the crag page is made of. */
const Fact = ({ label, value }: { label: string; value: React.ReactNode }) =>
    value == null || value === "" ? null : (
        <Box sx={{ minWidth: 110 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                {label}
            </Typography>
            <Typography variant="body2">{value}</Typography>
        </Box>
    );

export const CragPage = () => {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const lang = useLang();
    const dispatch = useAppDispatch();
    const { byId, parks } = useData();
    const crag = id ? byId[id] : undefined;
    const region = useRegionOf(crag);
    const isFav = useAppSelector((s) => s.favourites.crags.includes(crag?.id ?? ""));
    const [logRoute, setLogRoute] = useState<Route | null>(null);

    if (!crag) return <Navigate to="/" replace />;

    const park = crag.pk ? parks[crag.pk] : null;
    const rockText = region?.text.rock
        ? i18(region.text.rock, lang)
        : (shortText(longText(crag, "rock", lang), lang, region?.de) ?? t("d.rock.none"));
    const total = crag.bands?.reduce((a, b) => a + b, 0) ?? 0;

    return (
        <Box sx={{ height: "100%", overflowY: "auto", pb: 4 }}>
            <Box sx={{ p: 2 }}>
                <Stack direction="row" sx={{ alignItems: "flex-start", gap: 1 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="h2">{crag.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {[crag.area, crag.locality, crag.municipality, crag.province]
                                .filter(Boolean)
                                .join(" · ")}
                        </Typography>
                        {crag.aka && (
                            <Typography variant="caption" color="text.secondary">
                                {t("d.aka", { 0: crag.aka })}
                            </Typography>
                        )}
                    </Box>
                    <IconButton
                        onClick={() => dispatch(favouritesActions.toggleCrag(crag.id))}
                        aria-label={t(isFav ? "fav.t.rm" : "fav.t.add")}
                    >
                        {isFav ? (
                            <FavoriteIcon sx={{ color: "marker.fav" }} />
                        ) : (
                            <FavoriteBorderIcon />
                        )}
                    </IconButton>
                </Stack>

                {crag.closure && (
                    <Alert severity="error" sx={{ mt: 1.5 }}>
                        {longText(crag, "warn", lang)}
                    </Alert>
                )}
                {!crag.closure && crag.caution && (
                    <Alert severity="warning" sx={{ mt: 1.5 }}>
                        {longText(crag, "warn", lang)}
                    </Alert>
                )}

                {crag.bands && total > 0 && (
                    <Card sx={{ mt: 2 }}>
                        <CardContent>
                            <Typography variant="subtitle2" gutterBottom>
                                {t("d.grades")}
                            </Typography>
                            <GradeBar bands={crag.bands} height={12} />
                            <Stack
                                direction="row"
                                spacing={1}
                                useFlexGap
                                sx={{ mt: 1, flexWrap: "wrap" }}
                            >
                                {crag.bands.map((n, i) =>
                                    n ? (
                                        <Chip
                                            key={i}
                                            size="small"
                                            label={`${BANDS[i]} · ${n}`}
                                            sx={{
                                                bgcolor: `band.b${i}`,
                                                color: "band.contrastText",
                                                fontWeight: 600,
                                            }}
                                        />
                                    ) : null,
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                )}

                <Card sx={{ mt: 2 }}>
                    <CardContent>
                        <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: "wrap" }}>
                            <Fact
                                label={t("d.grades")}
                                value={
                                    crag.gmin
                                        ? crag.gmin === crag.gmax
                                            ? crag.gmin
                                            : `${crag.gmin}–${crag.gmax}`
                                        : "–"
                                }
                            />
                            <Fact
                                label={t("g.routes")}
                                value={crag.nRoutes ?? crag.routes.length}
                            />
                            <Fact
                                label={t("g.orient")}
                                value={
                                    crag.orient.length === 0
                                        ? "–"
                                        : crag.orient.length >= 4
                                          ? t("all.aspects")
                                          : crag.orient.map((o) => orientLabel(o, lang)).join(" / ")
                                }
                            />
                            <Fact
                                label={t("g.len")}
                                value={
                                    crag.len
                                        ? crag.len[0] === crag.len[1]
                                            ? `${crag.len[0]} m`
                                            : `${crag.len[0]}–${crag.len[1]} m`
                                        : null
                                }
                            />
                            <Fact
                                label={t("g.walk")}
                                value={crag.walkEff != null ? `${crag.walkEff} min` : null}
                            />
                            <Fact
                                label={t("g.alt")}
                                value={crag.alt != null ? `${crag.alt} m` : null}
                            />
                            <Fact label={t("g.rock")} value={rockText} />
                            <Fact
                                label={t("g.style")}
                                value={shortText(crag.style, lang, region?.de)}
                            />
                            <Fact
                                label={t("d.season")}
                                value={shortText(longText(crag, "season", lang), lang, region?.de)}
                            />
                        </Stack>
                    </CardContent>
                </Card>

                {(crag.boltSp || crag.boltC) && (
                    <Card sx={{ mt: 2 }}>
                        <CardContent>
                            <Typography variant="subtitle2" gutterBottom>
                                {t("f.bolt")}
                            </Typography>
                            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
                                {crag.boltSp && (
                                    <Chip size="small" label={t(`tag.bolt.${crag.boltSp}`)} />
                                )}
                                {crag.boltC && (
                                    <Chip size="small" label={t(`bolt.c.${crag.boltC}`)} />
                                )}
                            </Stack>
                            {crag.bolt?.q?.map((q, i) => (
                                <Typography
                                    key={i}
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mt: 1 }}
                                >
                                    {lang === "de" ? q[2] : q[1]}
                                </Typography>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {(park || crag.walk) && (
                    <Card sx={{ mt: 2 }}>
                        <CardContent>
                            <Typography variant="subtitle2" gutterBottom>
                                {t("j.ap")}
                            </Typography>
                            {park && (
                                <Stack direction="row" sx={{ alignItems: "center", gap: 1, mb: 1 }}>
                                    <Typography variant="body2" sx={{ flex: 1 }}>
                                        {longText(park, "name", lang)}
                                    </Typography>
                                    <Button
                                        size="small"
                                        startIcon={<DirectionsIcon />}
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${park.lat},${park.lon}`}
                                        target="_blank"
                                        rel="noopener"
                                    >
                                        {t("nav.short")}
                                    </Button>
                                </Stack>
                            )}
                            {crag.walk && (
                                <Typography variant="body2" color="text.secondary">
                                    {longText(crag, "walk", lang)}
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                )}

                {longText(crag, "desc", lang) && (
                    <Card sx={{ mt: 2 }}>
                        <CardContent>
                            <Typography variant="body2">{longText(crag, "desc", lang)}</Typography>
                        </CardContent>
                    </Card>
                )}

                {region?.text.guide && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        <PackInline text={region.text.guide} />
                    </Typography>
                )}

                {crag.links?.w && crag.links.w.length > 0 && (
                    <Stack spacing={0.5} sx={{ mt: 2 }}>
                        {crag.links.w.map((link) => (
                            <Link
                                key={link.url}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
                            >
                                <LaunchIcon sx={{ fontSize: 14 }} />
                                {link.name}
                            </Link>
                        ))}
                    </Stack>
                )}

                <Divider sx={{ my: 2 }} />
                <Typography variant="h3" gutterBottom>
                    {t("d.routes")}
                </Typography>
                <RouteList crag={crag} onLog={setLogRoute} />
            </Box>

            <LogSheet
                crag={crag}
                route={logRoute}
                open={logRoute != null}
                onClose={() => setLogRoute(null)}
            />
        </Box>
    );
};
