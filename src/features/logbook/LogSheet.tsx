import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import MenuItem from "@mui/material/MenuItem";
import Rating from "@mui/material/Rating";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "@app/hooks";
import { logbookActions } from "@app/slices/logbookSlice";
import { prefsActions } from "@app/slices/prefsSlice";
import { uiActions } from "@app/slices/uiSlice";
import { GRADES, GRADE_LO } from "@core/grades";
import { LOG_STYLES, type LogEntry, type LogStyle, newLogId, todayIso } from "@core/logbook";
import type { Crag, Route } from "@domain/model";

/**
 * Entering an ascent. A bottom sheet, as it was before: date, style, own stars -- and for a route
 * the atlas does not have, its name and grade too.
 */
export const LogSheet = ({
    crag,
    route,
    entry,
    open,
    onClose,
}: {
    crag: Crag | null;
    route?: Route | null;
    entry?: LogEntry | null;
    open: boolean;
    onClose: () => void;
}) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const lastStyle = useAppSelector((s) => s.prefs.logStyle);

    const [name, setName] = useState("");
    const [grade, setGrade] = useState("6a");
    const [date, setDate] = useState(todayIso());
    const [style, setStyle] = useState<LogStyle>(lastStyle);
    const [stars, setStars] = useState(0);

    // Fill the sheet when it opens, from the entry being edited or from the route being logged.
    useEffect(() => {
        if (!open) return;
        if (entry) {
            setName(entry.n);
            setGrade(entry.g);
            setDate(entry.d);
            setStyle(entry.st);
            setStars(entry.r);
        } else {
            setName(route?.name ?? "");
            setGrade(route?.grade ?? "6a");
            setDate(todayIso());
            setStyle(lastStyle);
            setStars(0);
        }
    }, [open, entry, route, lastStyle]);

    const custom = !route && !entry?.k;

    const save = () => {
        if (!name.trim()) {
            dispatch(uiActions.toast({ message: t("lb.name.req"), severity: "warning" }));
            return;
        }
        const record: LogEntry = {
            id: entry?.id ?? newLogId(),
            k: entry?.k ?? route?.key ?? null,
            s: entry?.s ?? crag?.id ?? "",
            n: name.trim(),
            g: grade,
            d: date,
            st: style,
            r: stars,
            t: entry?.t ?? Date.now(),
            ...(custom ? { custom: true } : {}),
        };
        dispatch(logbookActions.upsert(record));
        dispatch(prefsActions.setLogStyle(style));
        dispatch(uiActions.toast({ message: t("lb.saved"), severity: "success" }));
        onClose();
    };

    return (
        <Drawer
            anchor="bottom"
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: {
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                        pb: "calc(16px + var(--sab))",
                    },
                },
            }}
        >
            <Box sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">
                    {t(entry ? "lb.edit" : "lb.new")}
                    {crag ? ` · ${crag.name}` : ""}
                </Typography>
                <Typography variant="h3" gutterBottom>
                    {custom ? t("lb.custom.t") : `${name} ${grade}`}
                </Typography>

                <Stack spacing={2} sx={{ mt: 1 }}>
                    {custom && (
                        <Stack direction="row" spacing={1}>
                            <TextField
                                size="small"
                                fullWidth
                                label={t("lb.name")}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                slotProps={{ htmlInput: { maxLength: 120 } }}
                            />
                            <TextField
                                select
                                size="small"
                                label={t("lb.grade")}
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                                sx={{ minWidth: 100 }}
                            >
                                {GRADES.slice(GRADE_LO).map((g) => (
                                    <MenuItem key={g} value={g}>
                                        {g}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Stack>
                    )}

                    <TextField
                        size="small"
                        type="date"
                        label={t("lb.date")}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        slotProps={{ htmlInput: { max: todayIso() }, inputLabel: { shrink: true } }}
                    />

                    <Box>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mb: 0.5 }}
                        >
                            {t("lb.style")}
                        </Typography>
                        <ToggleButtonGroup
                            exclusive
                            size="small"
                            value={style}
                            onChange={(_e, value: LogStyle | null) => value && setStyle(value)}
                        >
                            {LOG_STYLES.map((key) => (
                                <ToggleButton key={key} value={key}>
                                    {t(`st.${key}`)}
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </Box>

                    <Box>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mb: 0.5 }}
                        >
                            {t("lb.stars")}
                        </Typography>
                        <Rating
                            value={stars}
                            onChange={(_e, value) => setStars(value ?? 0)}
                            sx={{ color: "marker.rate" }}
                        />
                    </Box>

                    <Stack direction="row" spacing={1}>
                        <Button variant="contained" onClick={save} sx={{ flex: 1 }}>
                            {t(entry ? "lb.save.edit" : "lb.save")}
                        </Button>
                        {entry && (
                            <Button
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => {
                                    dispatch(logbookActions.remove(entry.id));
                                    onClose();
                                }}
                            >
                                {t("lb.del")}
                            </Button>
                        )}
                    </Stack>
                </Stack>
            </Box>
        </Drawer>
    );
};
