import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { App } from "./App";
import { makeStore, mountedShowcase, renderApp } from "./test/harness";

/**
 * The whole app, screen by screen.
 *
 * react-leaflet is mocked: Leaflet measures its container and jsdom reports every element as 0×0,
 * so a real MapContainer here would tell us nothing. The map is checked in a browser instead; what
 * this verifies is the wiring -- routes, state, and that every screen renders with real pack data.
 */
vi.mock("react-leaflet", () => ({
    MapContainer: ({ children }: { children?: React.ReactNode }) => (
        <div data-testid="map">{children}</div>
    ),
    TileLayer: () => null,
    Marker: () => null,
    useMap: () => ({ fitBounds: vi.fn(), addLayer: vi.fn(), removeLayer: vi.fn() }),
}));
vi.mock("./features/map/MarkerClusterGroup", () => ({
    MarkerClusterGroup: () => null,
}));

describe("the app", () => {
    it("opens on the map with the loaded region named", async () => {
        const data = mountedShowcase();
        renderApp(<App />);
        await waitFor(() => expect(screen.getByTestId("map")).toBeInTheDocument());
        // The showcase is a part of Finale, and the bar says which region is shown.
        expect(screen.getByText(data.regions[0]!.name.en)).toBeInTheDocument();
    });

    it("has the four places of the bottom navigation", async () => {
        renderApp(<App />);
        for (const label of ["Map", "Favourites", "Logbook", "More"]) {
            expect(await screen.findByRole("button", { name: label })).toBeInTheDocument();
        }
    });

    it("opens a crag and lists its routes", async () => {
        const data = mountedShowcase();
        const crag = data.crags.find((c) => c.routes.length > 3)!;
        renderApp(<App />, { route: `/crag/${crag.id}` });

        expect(await screen.findByRole("heading", { name: crag.name })).toBeInTheDocument();
        for (const route of crag.routes.slice(0, 5)) {
            expect(screen.getByText(route.name)).toBeInTheDocument();
        }
    });

    it("answers the old #<crag-id> deep link", async () => {
        const data = mountedShowcase();
        const crag = data.crags[0]!;
        renderApp(<App />, { route: `/${crag.id}` });
        expect(await screen.findByRole("heading", { name: crag.name })).toBeInTheDocument();
    });

    it("shows the favourites page, empty and then with a crag", async () => {
        const data = mountedShowcase();
        const crag = data.crags[0]!;
        const store = makeStore();
        const { unmount } = renderApp(<App />, { route: "/fav", store });
        expect(await screen.findByText(/Nothing saved yet/i)).toBeInTheDocument();
        unmount();

        store.dispatch({ type: "favourites/toggleCrag", payload: crag.id });
        renderApp(<App />, { route: "/fav", store });
        expect(await screen.findByText(crag.name)).toBeInTheDocument();
    });

    it("shows the logbook, empty and then with an entry", async () => {
        const data = mountedShowcase();
        const crag = data.crags[0]!;
        const store = makeStore();
        const { unmount } = renderApp(<App />, { route: "/log", store });
        expect(await screen.findByText(/No ascent entered yet/i)).toBeInTheDocument();
        unmount();

        store.dispatch({
            type: "logbook/upsert",
            payload: {
                id: "t1",
                k: crag.routes[0]?.key ?? null,
                s: crag.id,
                n: "Testroute",
                g: "6a",
                d: "2026-10-01",
                st: "rp",
                r: 4,
                t: 1,
            },
        });
        renderApp(<App />, { route: "/log", store });
        expect(await screen.findByText("Testroute")).toBeInTheDocument();
    });

    it("shows «Worth knowing» with the grade converter", async () => {
        renderApp(<App />, { route: "/know" });
        expect(await screen.findByText(/Grade converter/i)).toBeInTheDocument();
        // The table converts French to UIAA by default.
        expect(await screen.findByText("6a")).toBeInTheDocument();
    });

    it("lists the pack's own pages under More and opens one", async () => {
        const data = mountedShowcase();
        const pages = data.regions[0]!.text.pages ?? [];
        renderApp(<App />, { route: "/more" });
        expect(await screen.findByText(/Mappacks/i)).toBeInTheDocument();

        if (!pages.length) return; // the showcase carries no pages: nothing more to check
        const page = pages[0]!;
        fireEvent.click(await screen.findByText(page.title.en));
        expect(await screen.findByRole("heading", { name: page.title.en })).toBeInTheDocument();
    });

    it("opens the filter drawer and narrows the list", async () => {
        const store = makeStore();
        renderApp(<App />, { store });
        fireEvent.click(await screen.findByRole("button", { name: /Filters/i }));
        const drawer = await screen.findByRole("presentation");
        // Hiding the closures is a switch in the drawer.
        fireEvent.click(within(drawer).getByLabelText(/Hide crags with a closure/i));
        expect(store.getState().filters.flags.hideClosure).toBe(true);
    });

    it("switches language and keeps it in the settings", async () => {
        const store = makeStore();
        renderApp(<App />, { route: "/more", store });
        const select = await screen.findByLabelText("Language");
        fireEvent.mouseDown(select);
        fireEvent.click(await screen.findByRole("option", { name: "Deutsch" }));
        expect(store.getState().prefs.lang).toBe("de");
    });
});
