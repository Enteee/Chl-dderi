import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import { Navigate, useParams } from "react-router-dom";

import { useLang, useRegion } from "@app/useAppData";
import { i18 } from "@core/text";

import { PackBlocks } from "../packs/PackText";

/**
 * A page of running text that came with a mappack: the region's research notes, its topo overview,
 * whatever else it brought. The app knows none of these -- it only renders what the pack carries.
 */
export const PackPage = () => {
    const { pageId } = useParams<{ pageId: string }>();
    const { t } = useTranslation();
    const lang = useLang();
    const region = useRegion();

    const page = region?.text.pages?.find((p) => p.id === pageId);
    if (!page) return <Navigate to="/more" replace />;

    return (
        <Box sx={{ height: "100%", overflowY: "auto", p: 2, pb: 4 }}>
            <Typography variant="h2" gutterBottom>
                {i18(page.title, lang)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
                {region ? t("pg.from", { 0: i18(region.name, lang) }) : ""}
            </Typography>
            <PackBlocks blocks={page.blocks} />
        </Box>
    );
};
