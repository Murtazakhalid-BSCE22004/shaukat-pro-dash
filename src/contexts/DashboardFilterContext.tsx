import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { DashboardFilters, FilterState, FilterOption } from '@/types';

interface DashboardFilterContextType {
  state: FilterState;
  updateFilters: (filters: Partial<DashboardFilters>) => void;
  resetFilters: () => void;
  setAvailableOptions: (options: FilterState['availableOptions']) => void;
  setLoading: (loading: boolean) => void;
}

const DashboardFilterContext = createContext<DashboardFilterContextType | undefined>(undefined);

// Initial state
const getInitialFilters = (): DashboardFilters => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  return {
    dateRange: {
      startDate: thirtyDaysAgo,
      endDate: now,
    },
    departments: [],
    doctors: [],
    expenseCategories: [],
    employeeDepartments: [],
    timePeriod: 'monthly',
  };
};

const initialState: FilterState = {
  filters: getInitialFilters(),
  availableOptions: {
    departments: [],
    doctors: [],
    expenseCategories: [],
    employeeDepartments: [],
  },
  isLoading: false,
};

// Action types
type FilterAction =
  | { type: 'UPDATE_FILTERS'; payload: Partial<DashboardFilters> }
  | { type: 'RESET_FILTERS' }
  | { type: 'SET_AVAILABLE_OPTIONS'; payload: FilterState['availableOptions'] }
  | { type: 'SET_LOADING'; payload: boolean };

// Reducer
const filterReducer = (state: FilterState, action: FilterAction): FilterState => {
  switch (action.type) {
    case 'UPDATE_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      };
    case 'RESET_FILTERS':
      return {
        ...state,
        filters: getInitialFilters(),
      };
    case 'SET_AVAILABLE_OPTIONS':
      return {
        ...state,
        availableOptions: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

// Provider component
interface DashboardFilterProviderProps {
  children: ReactNode;
}

export const DashboardFilterProvider: React.FC<DashboardFilterProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(filterReducer, initialState);

  const updateFilters = (filters: Partial<DashboardFilters>) => {
    dispatch({ type: 'UPDATE_FILTERS', payload: filters });
  };

  const resetFilters = () => {
    dispatch({ type: 'RESET_FILTERS' });
  };

  const setAvailableOptions = (options: FilterState['availableOptions']) => {
    dispatch({ type: 'SET_AVAILABLE_OPTIONS', payload: options });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const value: DashboardFilterContextType = {
    state,
    updateFilters,
    resetFilters,
    setAvailableOptions,
    setLoading,
  };

  return (
    <DashboardFilterContext.Provider value={value}>
      {children}
    </DashboardFilterContext.Provider>
  );
};

// Hook to use the context
export const useDashboardFilters = () => {
  const context = useContext(DashboardFilterContext);
  if (context === undefined) {
    throw new Error('useDashboardFilters must be used within a DashboardFilterProvider');
  }
  return context;
};

export default DashboardFilterContext;

