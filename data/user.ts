import type { SavedCommute, TravelSearch, UserProfile } from '../types/travel';

export const initialSavedCommutes: SavedCommute[] = [
  {
    id: 'home-office',
    icon: 'home',
    label: 'Home → Office',
    from: 'Hadapsar, Pune',
    to: 'Kharadi, Pune',
    time: '8:30 AM',
  },
  {
    id: 'home-college',
    icon: 'school',
    label: 'Home → College',
    from: 'Hadapsar, Pune',
    to: 'FC Road, Pune',
    time: '9:00 AM',
  },
];

export const initialProfile: UserProfile = {
  name: 'Tejas',
  preferredModes: ['PUBLIC_TRANSPORT', 'CARPOOL'],
  budgetMax: 300,
  maxTravelMinutes: 60,
};

export const DEFAULT_SEARCH: TravelSearch = {
  from: 'Hadapsar, Pune',
  to: 'Vanaz Metro Station',
  departAt: null,
};
