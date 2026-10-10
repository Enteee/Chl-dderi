import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "@app/hooks";
import { selectFilters } from "@app/selectors";
import { filtersActions } from "@app/slices/filtersSlice";
import { uiActions } from "@app/slices/uiSlice";
import { useShownCrags } from "@app/useAppData";
import { SORTS, activeCount } from "@core/filters";

import { CragCard } from "./CragCard";

/** Search, sort and the filter button -- the bar above the list. */
export const ListToolbar = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const q = useAppSelector((s) => s.filters.q);
    const sort = useAppSelector((s) => s.filters.sort);
    const dir = useAppSelector((s) => s.filters.dir);
    const filters = useAppSelector(selectFilters);
    const active = activeCount(filters);

    return (
        <Stack direction="row" spacing={1} sx={{ p: 1, alignItems: "center" }}>
            <TextField
                size="small"
                fullWidth
                placeholder={t("search.ph")}
                value={q}
                onChange={(e) => dispatch(filtersActions.setQuery(e.target.value))}
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        ),
                    },
                }}
            />
            <TextField
                select
                size="small"
                value={sort}
                onChange={(e) => dispatch(filtersActions.setSort(e.target.value as typeof sort))}
                sx={{ minWidth: 120 }}
                aria-label={t("sort")}
            >
                {SORTS.map((key) => (
                    <MenuItem key={key} value={key}>
                        {t(`sort.${key}`)}
                    </MenuItem>
                ))}
            </TextField>
            <IconButton
                onClick={() => dispatch(filtersActions.toggleDir())}
                aria-label={t("sort.dir")}
            >
                <SwapVertIcon sx={{ transform: dir < 0 ? "scaleY(-1)" : undefined }} />
            </IconButton>
            <IconButton
                onClick={() => dispatch(uiActions.setFiltersOpen(true))}
                aria-label={t("filters")}
            >
                <Badge badgeContent={active} color="primary">
                    <FilterListIcon />
                </Badge>
            </IconButton>
        </Stack>
    );
};

export const CragList = () => {
    const { t } = useTranslation();
    const shown = useShownCrags();

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
            <ListToolbar />
            <Box sx={{ overflowY: "auto", flex: 1, px: 1, pb: 2 }}>
                {shown.length === 0 ? (
                    <Typography color="text.secondary" sx={{ p: 2, textAlign: "center" }}>
                        {t("empty")}
                    </Typography>
                ) : (
                    shown.map((match) => <CragCard key={match.crag.id} match={match} />)
                )}
            </Box>
        </Box>
    );
};
