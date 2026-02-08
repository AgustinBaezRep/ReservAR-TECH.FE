export interface ComplexSearchResult {
    id: string;
    name: string;
    location: string;
    minPrice: number;
    imageUrl: string;
    logoUrl?: string;
    rating?: number;
    availableSlots: string[];
}
