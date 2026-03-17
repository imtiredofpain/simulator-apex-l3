import { setAxiosInn } from '@shared/api/httpInn';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface OrganizationStore {
  selectedInn: string | null;
  setSelectedInn: (inn: string | null) => void;
  clearSelectedInn: () => void;
}

export const useOrganizationsStore = create<OrganizationStore>()(
  persist(
    (set) => ({
      selectedInn: null,
      setSelectedInn: (inn) => {
        set({ selectedInn: inn });
        // Синхронизируем с axios
        setAxiosInn(inn);
      },
      clearSelectedInn: () => {
        set({ selectedInn: null });
        setAxiosInn(null);
      },
    }),
    {
      name: 'organization-storage', // ключ в localStorage
      storage: createJSONStorage(() => localStorage),
      // После гидрации синхронизируем INN с axios
      onRehydrateStorage: () => (state) => {
        if (state?.selectedInn) {
          setAxiosInn(state.selectedInn);
        }
      },
    }
  )
);

export const useSelectedInn = () =>
  useOrganizationsStore((state) => state.selectedInn);
export const useSetSelectedInn = () =>
  useOrganizationsStore((state) => state.setSelectedInn);
