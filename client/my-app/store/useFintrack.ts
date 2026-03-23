    "use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface FintrackState {
	activeFintrackId: string | null;
	setActiveFintrack: (id: string | null) => void;
	reset: () => void;
}

const initialState = {
	activeFintrackId: null,
};

export const useFintrackStore = create<FintrackState>()(
	persist(
		(set) => ({
			...initialState,
			setActiveFintrack: (id) =>
				set((state) =>
					state.activeFintrackId === id ? state : { activeFintrackId: id }
				),
			reset: () => set(initialState),
		}),
		{
			name: "fintrack-storage",
			storage: createJSONStorage(() => localStorage),
		}
	)
);
