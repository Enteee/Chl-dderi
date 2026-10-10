import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { makeStore, mountedShowcase, renderApp } from "../../test/harness";

import { CragList } from "./CragList";

describe("the crag list", () => {
    it("shows the crags of the loaded pack", () => {
        const data = mountedShowcase();
        renderApp(<CragList />);
        for (const crag of data.crags) {
            expect(screen.getByText(crag.name)).toBeInTheDocument();
        }
    });

    it("narrows to what the search text matches", () => {
        const data = mountedShowcase();
        const first = data.crags[0]!;
        const other = data.crags.find((c) => c.name !== first.name)!;
        renderApp(<CragList />);

        fireEvent.change(screen.getByPlaceholderText(/./), { target: { value: first.name } });

        expect(screen.getByText(first.name)).toBeInTheDocument();
        expect(screen.queryByText(other.name)).not.toBeInTheDocument();
    });

    it("says so when nothing matches", () => {
        renderApp(<CragList />);
        fireEvent.change(screen.getByPlaceholderText(/./), { target: { value: "zzzqqq" } });
        const data = mountedShowcase();
        for (const crag of data.crags) {
            expect(screen.queryByText(crag.name)).not.toBeInTheDocument();
        }
    });

    it("makes a crag a favourite and keeps it in the store", () => {
        const store = makeStore();
        const data = mountedShowcase();
        const first = data.crags[0]!;
        renderApp(<CragList />, { store });

        const card = screen.getByText(first.name).closest(".MuiCard-root") as HTMLElement;
        fireEvent.click(within(card).getByRole("button", { name: /favourites/i }));

        expect(store.getState().favourites.crags).toContain(first.id);
    });

    it("reverses the order when the direction is flipped", () => {
        const store = makeStore();
        renderApp(<CragList />, { store });
        expect(store.getState().filters.dir).toBe(1);
        fireEvent.click(screen.getByRole("button", { name: /reverse order/i }));
        expect(store.getState().filters.dir).toBe(-1);
    });
});
