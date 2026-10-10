import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "@app/hooks";
import { uiActions } from "@app/slices/uiSlice";

import { checkForUpdate, loadVersion } from "../../version";

/** Checked at start and whenever the app comes back to the foreground, at most every 30 minutes. */
const EVERY = 30 * 60 * 1000;

/**
 * «A new version is ready.» Asks before reloading, as the old app did -- someone standing at the
 * wall with a route list open does not want the page to change under them.
 */
export const UpdateBanner = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const ready = useAppSelector((s) => s.ui.updateReady);

    useEffect(() => {
        let last = 0;
        const check = async (): Promise<void> => {
            if (Date.now() - last < EVERY) return;
            last = Date.now();
            const newer = await checkForUpdate();
            if (newer) dispatch(uiActions.setUpdateReady(true));
        };

        void loadVersion().then(check);

        const onVisible = (): void => {
            if (document.visibilityState === "visible") void check();
        };
        document.addEventListener("visibilitychange", onVisible);
        return () => document.removeEventListener("visibilitychange", onVisible);
    }, [dispatch]);

    return (
        <Snackbar
            open={ready}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            sx={{ mb: "calc(64px + var(--sab))" }}
        >
            <Alert
                severity="info"
                variant="filled"
                action={
                    <Button color="inherit" size="small" onClick={() => location.reload()}>
                        {t("m.reload")}
                    </Button>
                }
            >
                {t("m.update")}
            </Alert>
        </Snackbar>
    );
};
