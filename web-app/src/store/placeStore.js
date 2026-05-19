import { create } from 'zustand';

const usePlaceStore = create((set, get) => ({
  places: [],
  selectedPlace: null,
  filters: {
    category: '',
    privacy: '',
    radius: 50,
  },
  
  setPlaces: (places) => set({ places }),
  addPlace: (place) => set((state) => ({ 
    places: [place, ...state.places] 
  })),
  updatePlace: (id, updates) => set((state) => ({
    places: state.places.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ),
  })),
  removePlace: (id) => set((state) => ({
    places: state.places.filter(p => p.id !== id),
  })),
  setSelectedPlace: (place) => set({ selectedPlace: place }),
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
  
  getFilteredPlaces: () => {
    const { places, filters } = get();
    return places.filter(place => {
      if (filters.category && place.category !== filters.category) return false;
      if (filters.privacy && place.privacy !== filters.privacy) return false;
      return true;
    });
  },
}));

export default usePlaceStore;
