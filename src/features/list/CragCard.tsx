import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@app/hooks";
import { favouritesActions } from "@app/slices/favouritesSlice";
import { uiActions } from "@app/slices/uiSlice";
import { useLang, useLogIndex } from "@app/useAppData";
import { orientLabel } from "@core/dataText";
import type { CragMatch } from "@core/filters";
import { isSend } from "@core/logbook";
import type { Crag } from "@domain/model";

import { GradeBar } from "../crag/GradeBar";

/** The chips under a crag's name: what is worth knowing before tapping it. */
const CragTags = ({ crag, sent }: { crag: Crag; sent: number }) => {
    const { t } = useTranslation();
    const tags: { label: string; color?: "success" | "warning" | "error" | "info"; key: string }[] =
        [];

    if (sent)
        tags.push({ key: "logged", label: `✓ ${t("tag.logged", { 0: sent })}`, color: "success" });
    if (crag.rain === "yes") tags.push({ key: "rain", label: t("tag.rain"), color: "success" });
    if (crag.dry === "fast") tags.push({ key: "dry", label: t("tag.dry"), color: "warning" });
    if (crag.boltSp) tags.push({ key: "bolt", label: t(`tag.bolt.${crag.boltSp}`) });
    if (crag.closure) tags.push({ key: "closure", label: t("tag.closure"), color: "error" });
    if (crag.caution) tags.push({ key: "caution", label: t("tag.caution"), color: "warning" });
    if (!crag.coord) tags.push({ key: "nomap", label: t("tag.nomap") });
    else if (crag.anchor) tags.push({ key: "anchor", label: t("tag.anchor") });
    if (crag.topoPic || crag.topoLink)
        tags.push({ key: "topo", label: t("tag.topo"), color: "info" });

    if (!tags.length) return null;
    return (
        <Stack direction="row" spacing={0.5} useFlexGap sx={{ mt: 0.75, flexWrap: "wrap" }}>
            {tags.map((tag) => (
                <Chip
                    key={tag.key}
                    label={tag.label}
                    size="small"
                    color={tag.color}
                    variant={tag.color ? "filled" : "outlined"}
                    sx={{ height: 20, fontSize: "0.72rem" }}
                />
            ))}
        </Stack>
    );
};

export const CragCard = ({ match }: { match: CragMatch }) => {
    const { crag, inCount, routeHit } = match;
    const { t } = useTranslation();
    const lang = useLang();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const log = useLogIndex();
    const isFav = useAppSelector((s) => s.favourites.crags.includes(crag.id));

    const sent = (log.byCrag[crag.id] ?? []).filter(isSend).length;
    const grades = crag.gmin
        ? crag.gmin === crag.gmax
            ? crag.gmin
            : `${crag.gmin}–${crag.gmax}`
        : "–";
    const orient =
        crag.orient.length === 0
            ? "–"
            : crag.orient.length >= 4
              ? t("all.aspects")
              : crag.orient.map((o) => orientLabel(o, lang)).join(" / ");

    return (
        <Card sx={{ mb: 1 }}>
            <Box sx={{ display: "flex", alignItems: "stretch" }}>
                <CardActionArea
                    onClick={() => {
                        dispatch(uiActions.select(crag.id));
                        void navigate(`/crag/${crag.id}`);
                    }}
                    sx={{ p: 1.25, minWidth: 0, flex: 1 }}
                >
                    <Typography variant="h5" className="kat-ellipsis">
                        {crag.name}
                    </Typography>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        className="kat-ellipsis"
                        component="div"
                    >
                        {[crag.area, crag.locality, crag.municipality].filter(Boolean).join(" · ")}
                    </Typography>

                    <Stack direction="row" spacing={1.5} sx={{ mt: 0.75, alignItems: "baseline" }}>
                        <Typography variant="body2" className="num">
                            {grades}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {inCount != null
                                ? t("opt.in", { 0: inCount })
                                : crag.nRoutes != null
                                  ? `${crag.nRoutes} ${t("n.route", { count: crag.nRoutes })}`
                                  : ""}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {orient}
                        </Typography>
                        {crag.walkEff != null && (
                            <Typography variant="body2" color="text.secondary" className="num">
                                {crag.walkEff} min
                            </Typography>
                        )}
                    </Stack>

                    {crag.bands && <GradeBar bands={crag.bands} sx={{ mt: 1 }} />}
                    <CragTags crag={crag} sent={sent} />
                    {routeHit && (
                        <Typography
                            variant="caption"
                            color="primary"
                            sx={{ mt: 0.5, display: "block" }}
                        >
                            {t("tag.rhit")}
                        </Typography>
                    )}
                </CardActionArea>
                <IconButton
                    aria-label={t(isFav ? "fav.t.rm" : "fav.t.add")}
                    onClick={() => dispatch(favouritesActions.toggleCrag(crag.id))}
                    sx={{ alignSelf: "flex-start", m: 0.5 }}
                >
                    {isFav ? (
                        <FavoriteIcon fontSize="small" sx={{ color: "marker.fav" }} />
                    ) : (
                        <FavoriteBorderIcon fontSize="small" />
                    )}
                </IconButton>
            </Box>
        </Card>
    );
};
