import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { DEFAULT_SEARCH, initialProfile, initialSavedCommutes } from '../data/user';
import type {
  DemoScenario,
  Place,
  SavedCommute,
  TravelResults,
  TravelSearch,
  UserProfile,
} from '../types/travel';
import { getCurrentPlace, LocationError } from '../utils/currentLocation';
import { formatClock, routeTitle } from '../utils/format';
import { nextOccurrence } from '../utils/routing';
import { fetchTravelOptions, validateSearch } from '../utils/travelService';
import type { SearchValidation } from '../utils/travelService';

export type SearchStatus = 'idle' | 'loading' | 'success' | 'error';

interface TravelState {
  form: TravelSearch;
  formErrors: SearchValidation;
  setField: (field: 'from' | 'to', value: string) => void;
  /** null = leave now. */
  setDepartAt: (departAt: Date | null) => void;
  /** Sets a From/To field from a picked search suggestion (text + coordinates). */
  setPlace: (field: 'from' | 'to', place: Place) => void;
  /** Fills From with the device's current location. Errors land in formErrors.from. */
  locateFrom: () => void;
  locating: boolean;
  swapPlaces: () => void;
  applyCommute: (commute: SavedCommute) => void;

  /** The search the current results belong to. */
  activeSearch: TravelSearch | null;
  status: SearchStatus;
  results: TravelResults | null;
  errorMessage: string | null;
  /** Validates the form and starts a search. Returns false if validation failed. */
  search: () => boolean;
  retry: () => void;

  savedCommutes: SavedCommute[];
  isSaved: (search: TravelSearch) => boolean;
  toggleSaved: (search: TravelSearch) => void;
  removeCommute: (id: string) => void;

  profile: UserProfile;
  updateProfile: (patch: Partial<UserProfile>) => void;
  scenario: DemoScenario;
  setScenario: (s: DemoScenario) => void;
}

const TravelContext = createContext<TravelState | null>(null);

const sameRoute = (a: Pick<TravelSearch, 'from' | 'to'>, b: Pick<TravelSearch, 'from' | 'to'>) =>
  a.from.trim().toLowerCase() === b.from.trim().toLowerCase() &&
  a.to.trim().toLowerCase() === b.to.trim().toLowerCase();

export function TravelProvider({ children }: { children: ReactNode }) {
  const [form, setForm] = useState<TravelSearch>(DEFAULT_SEARCH);
  const [formErrors, setFormErrors] = useState<SearchValidation>({});
  const [activeSearch, setActiveSearch] = useState<TravelSearch | null>(null);
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [results, setResults] = useState<TravelResults | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savedCommutes, setSavedCommutes] = useState(initialSavedCommutes);
  const [profile, setProfile] = useState(initialProfile);
  const [scenario, setScenario] = useState<DemoScenario>('normal');
  const [locating, setLocating] = useState(false);
  const requestId = useRef(0);
  // Bumped whenever From changes, so a slow location fix can't overwrite newer input.
  const fromEdit = useRef(0);
  const locateId = useRef(0);

  const setField = useCallback((field: 'from' | 'to', value: string) => {
    if (field === 'from') fromEdit.current++;
    // Typed text no longer matches the picked place, so drop its coordinates.
    setForm((f) => ({ ...f, [field]: value, [`${field}Place`]: undefined }));
    setFormErrors((e) => ({ ...e, [field]: undefined }));
  }, []);

  const setPlace = useCallback((field: 'from' | 'to', place: Place) => {
    if (field === 'from') fromEdit.current++;
    setForm((f) => ({ ...f, [field]: place.label, [`${field}Place`]: place }));
    setFormErrors((e) => ({ ...e, [field]: undefined }));
  }, []);

  const locateFrom = useCallback(() => {
    const edit = ++fromEdit.current;
    const id = ++locateId.current;
    setLocating(true);
    setFormErrors((e) => ({ ...e, from: undefined }));
    getCurrentPlace()
      .then((place) => {
        if (edit === fromEdit.current) setPlace('from', place);
      })
      .catch((err: unknown) => {
        if (edit !== fromEdit.current) return;
        const message =
          err instanceof LocationError
            ? err.message
            : "Couldn't find your location. Check that location is on, or type your starting point.";
        setFormErrors((e) => ({ ...e, from: message }));
      })
      .finally(() => {
        if (id === locateId.current) setLocating(false);
      });
  }, [setPlace]);

  const setDepartAt = useCallback((departAt: Date | null) => {
    setForm((f) => ({ ...f, departAt }));
    setFormErrors((e) => ({ ...e, time: undefined }));
  }, []);

  const swapPlaces = useCallback(() => {
    fromEdit.current++;
    setForm((f) => ({ ...f, from: f.to, to: f.from, fromPlace: f.toPlace, toPlace: f.fromPlace }));
    setFormErrors({});
  }, []);

  const applyCommute = useCallback((c: SavedCommute) => {
    fromEdit.current++;
    setForm({ from: c.from, to: c.to, departAt: nextOccurrence(c.time) });
    setFormErrors({});
  }, []);

  const run = useCallback(
    (query: TravelSearch) => {
      const id = ++requestId.current;
      setActiveSearch(query);
      setStatus('loading');
      setErrorMessage(null);
      fetchTravelOptions(query, scenario)
        .then((res) => {
          if (id !== requestId.current) return;
          setResults(res);
          setStatus('success');
        })
        .catch((err: Error) => {
          if (id !== requestId.current) return;
          setResults(null);
          setErrorMessage(err.message);
          setStatus('error');
        });
    },
    [scenario],
  );

  const search = useCallback(() => {
    const errors = validateSearch(form);
    setFormErrors(errors);
    if (errors.from || errors.to || errors.time) return false;
    run({ ...form, from: form.from.trim(), to: form.to.trim() });
    return true;
  }, [form, run]);

  const retry = useCallback(() => {
    if (activeSearch) run(activeSearch);
  }, [activeSearch, run]);

  const isSaved = useCallback(
    (s: TravelSearch) => savedCommutes.some((c) => sameRoute(c, s)),
    [savedCommutes],
  );

  const toggleSaved = useCallback((s: TravelSearch) => {
    setSavedCommutes((list) =>
      list.some((c) => sameRoute(c, s))
        ? list.filter((c) => !sameRoute(c, s))
        : [
            ...list,
            {
              id: `c-${Date.now()}`,
              icon: 'location',
              label: routeTitle(s.from, s.to),
              from: s.from,
              to: s.to,
              time: s.departAt ? formatClock(s.departAt) : 'Now',
            },
          ],
    );
  }, []);

  const removeCommute = useCallback((id: string) => {
    setSavedCommutes((list) => list.filter((c) => c.id !== id));
  }, []);

  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    setProfile((p) => ({ ...p, ...patch }));
  }, []);

  const value = useMemo<TravelState>(
    () => ({
      form,
      formErrors,
      setField,
      setPlace,
      locateFrom,
      locating,
      setDepartAt,
      swapPlaces,
      applyCommute,
      activeSearch,
      status,
      results,
      errorMessage,
      search,
      retry,
      savedCommutes,
      isSaved,
      toggleSaved,
      removeCommute,
      profile,
      updateProfile,
      scenario,
      setScenario,
    }),
    [
      form, formErrors, setField, setPlace, locateFrom, locating, setDepartAt, swapPlaces, applyCommute, activeSearch, status, results,
      errorMessage, search, retry, savedCommutes, isSaved, toggleSaved, removeCommute,
      profile, updateProfile, scenario,
    ],
  );

  return <TravelContext.Provider value={value}>{children}</TravelContext.Provider>;
}

export function useTravel() {
  const ctx = useContext(TravelContext);
  if (!ctx) throw new Error('useTravel must be used inside TravelProvider');
  return ctx;
}
