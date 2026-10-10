import CloseIcon from "@mui/icons-material/Close";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "@app/hooks";
import { filtersActions } from "@app/slices/filtersSlice";
import { uiActions } from "@app/slices/uiSlice";
import { useLang, useRegion, useRegionCrags, useShownCrags } from "@app/useAppData";
import { orientLabel } from "@core/dataText";
import {
    FILTER_VALUES,
    type FilterFlag,
    type FilterKey,
    GRADE_PRESETS,
    MIN_IN_CHOICES,
    ORIENTS,
} from "@core/filters";
import { GRADE_HI, GRADE_LO, GRADES, gradeIdx } from "@core/grades";

import { optionLabel } from "./filterLabels";

/** One of the pick-one filters, as a select. */
const OneOf = ({ filterKey, label }: { filterKey: FilterKey; label: string }) => {
    const { t } = useTranslation();
    const value = useAppSelector((s) => s.filters.one[filterKey]);
    const dispatch = useAppDispatch();
    return (
        <TextField
            select
            size="small"
            fullWidth
            label={label}
            value={value}
            onChange={(e) =>
                dispatch(filtersActions.setOne({ key: filterKey, value: e.target.value }))
            }
        >
            {FILTER_VALUES[filterKey].map((option) => (
                <MenuItem key={option} value={option}>
                    {optionLabel(t, filterKey, option)}
                </MenuItem>
            ))}
        </TextField>
    );
};

const Flag = ({ flagKey, label }: { flagKey: FilterFlag; label: string }) => {
    const value = useAppSelector((s) => s.filters.flags[flagKey]);
    const dispatch = useAppDispatch();
    return (
        <FormControlLabel
            control={
                <Switch
                    size="small"
                    checked={value}
                    onChange={(e) =>
                        dispatch(filtersActions.setFlag({ key: flagKey, value: e.target.checked }))
                    }
                />
            }
            label={label}
        />
    );
};

export const FiltersDrawer = () => {
    const { t } = useTranslation();
    const lang = useLang();
    const dispatch = useAppDispatch();
    const open = useAppSelector((s) => s.ui.filtersOpen);
    const { gmin, gmax, minIn, orient, area, muni } = useAppSelector((s) => s.filters);
    const shown = useShownCrags();
    const crags = useRegionCrags();
    const region = useRegion();

    const areas = region?.areas.map((a) => a.name) ?? [];
    const munis = [
        ...new Set(crags.map((c) => c.municipality).filter((m): m is string => !!m)),
    ].sort();
    const close = () => dispatch(uiActions.setFiltersOpen(false));

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={close}
            slotProps={{ paper: { sx: { width: { xs: "100%", sm: 400 } } } }}
        >
            <Toolbar sx={{ gap: 1 }}>
                <Typography variant="h3" sx={{ flex: 1 }}>
                    {t("filters")}
                </Typography>
                <Button
                    size="small"
                    startIcon={<RestartAltIcon />}
                    onClick={() => dispatch(filtersActions.reset())}
                >
                    {t("f.reset")}
                </Button>
                <IconButton onClick={close} aria-label={t("close")}>
                    <CloseIcon />
                </IconButton>
            </Toolbar>
            <Divider />

            <Box sx={{ p: 2, overflowY: "auto", flex: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                    {t("f.grade")}
                </Typography>
                <Stack direction="row" spacing={0.5} useFlexGap sx={{ mb: 1, flexWrap: "wrap" }}>
                    {GRADE_PRESETS.map(([from, to, label]) => {
                        const a = gradeIdx(from)!;
                        const b = gradeIdx(to)!;
                        return (
                            <Chip
                                key={label}
                                label={label}
                                size="small"
                                color={gmin === a && gmax === b ? "primary" : "default"}
                                onClick={() =>
                                    dispatch(filtersActions.setGrades({ gmin: a, gmax: b }))
                                }
                            />
                        );
                    })}
                    <Chip
                        label={t("any")}
                        size="small"
                        color={gmin === GRADE_LO && gmax === GRADE_HI ? "primary" : "default"}
                        onClick={() =>
                            dispatch(filtersActions.setGrades({ gmin: GRADE_LO, gmax: GRADE_HI }))
                        }
                    />
                </Stack>
                <Box sx={{ px: 1 }}>
                    <Slider
                        value={[gmin, gmax]}
                        min={GRADE_LO}
                        max={GRADE_HI}
                        step={1}
                        marks
                        valueLabelDisplay="auto"
                        valueLabelFormat={(v: number) => GRADES[v] ?? ""}
                        onChange={(_e, value) => {
                            const [a, b] = value as number[];
                            dispatch(filtersActions.setGrades({ gmin: a!, gmax: b! }));
                        }}
                        aria-label={t("f.grade")}
                    />
                </Box>

                <TextField
                    select
                    size="small"
                    fullWidth
                    label={t("f.minIn1")}
                    value={minIn}
                    onChange={(e) => dispatch(filtersActions.setMinIn(Number(e.target.value)))}
                    sx={{ mt: 1, mb: 2 }}
                >
                    {MIN_IN_CHOICES.map((n) => (
                        <MenuItem key={n} value={n}>
                            {n}
                        </MenuItem>
                    ))}
                </TextField>

                <Typography variant="subtitle2" gutterBottom>
                    {t("f.orient")}
                </Typography>
                <Stack direction="row" spacing={0.5} useFlexGap sx={{ mb: 2, flexWrap: "wrap" }}>
                    {[...ORIENTS, "mixed", "unknown"].map((o) => (
                        <Chip
                            key={o}
                            size="small"
                            label={
                                o === "mixed"
                                    ? t("all.aspects")
                                    : o === "unknown"
                                      ? t("unknown")
                                      : orientLabel(o, lang)
                            }
                            color={orient.includes(o) ? "primary" : "default"}
                            onClick={() => dispatch(filtersActions.toggleOrient(o))}
                        />
                    ))}
                </Stack>

                <Stack spacing={1.5}>
                    <OneOf filterKey="star" label={t("f.star")} />
                    <OneOf filterKey="fav" label={t("f.fav")} />
                    <OneOf filterKey="log" label={t("f.log")} />
                    <OneOf filterKey="walk" label={t("f.walk")} />
                    <OneOf filterKey="count" label={t("f.count")} />
                    <OneOf filterKey="len" label={t("f.len")} />
                    <OneOf filterKey="style" label={t("f.style")} />
                    <OneOf filterKey="pic" label={t("f.pic")} />
                    <OneOf filterKey="rain" label={t("f.rain")} />
                    <OneOf filterKey="dry" label={t("f.dry")} />
                    <OneOf filterKey="bolt" label={t("f.bolt")} />
                    <OneOf filterKey="boltC" label={t("f.bolt.c")} />

                    {areas.length > 1 && (
                        <TextField
                            select
                            size="small"
                            fullWidth
                            label={t("f.area")}
                            value={area}
                            onChange={(e) => dispatch(filtersActions.setArea(e.target.value))}
                        >
                            <MenuItem value="">{t("any")}</MenuItem>
                            {areas.map((name) => (
                                <MenuItem key={name} value={name}>
                                    {name}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}

                    {munis.length > 1 && (
                        <TextField
                            select
                            size="small"
                            fullWidth
                            label={t("f.muni")}
                            value={muni}
                            onChange={(e) => dispatch(filtersActions.setMuni(e.target.value))}
                        >
                            <MenuItem value="">{t("any")}</MenuItem>
                            {munis.map((name) => (
                                <MenuItem key={name} value={name}>
                                    {name}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}
                </Stack>

                <Divider sx={{ my: 2 }} />
                <Stack>
                    <Flag flagKey="hideClosure" label={t("f.hideClosure")} />
                    <Flag flagKey="hideCaution" label={t("f.hideCaution")} />
                    <Flag flagKey="hideNoFamily" label={t("f.hideNoFamily")} />
                    <Flag flagKey="onlyMapped" label={t("f.onlyMapped")} />
                </Stack>
            </Box>

            <Divider />
            <Box sx={{ p: 2, pb: "calc(16px + var(--sab))" }}>
                <Button fullWidth variant="contained" onClick={close}>
                    {t("f.show", { 0: `${shown.length}` })}
                </Button>
            </Box>
        </Drawer>
    );
};
