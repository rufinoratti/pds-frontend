import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const LEVELS = ['Principiante', 'Intermedio', 'Avanzado'];

export const useMatchFilters = (initialFilters = {}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [filters, setFilters] = useState(initialFilters);
  const [allMatches, setAllMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);

  // Initialize filters from URL and apply them
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const sportParam = queryParams.get('sport');
    const locationParam = queryParams.get('location');
    const levelParam = queryParams.get('level');

    const newFilters = {
      ...initialFilters,
      sport: sportParam || initialFilters.sport,
      location: locationParam || initialFilters.location,
      requiredLevel: levelParam ? LEVELS[parseInt(levelParam) - 1] : initialFilters.requiredLevel,
    };

    setFilters(newFilters);
  }, [location.search]);

  // Apply filters whenever filters or allMatches change
  useEffect(() => {
    if (allMatches.length > 0) {
      let filtered = [...allMatches];

      // Filter by sport
      if (filters.sport && filters.sport !== 'Todos') {
        filtered = filtered.filter(match => {
          return match.deporte?.id === filters.sport;
        });
      }

      // Filter by location
      if (filters.location) {
        const searchTerm = filters.location.toLowerCase();
        filtered = filtered.filter(match => {
          const direccion = match.direccion?.toLowerCase() || '';
          const zona = match.zona?.nombre?.toLowerCase() || '';
          return direccion.includes(searchTerm) || zona.includes(searchTerm);
        });
      }

      // Filter by level
      if (filters.requiredLevel && filters.requiredLevel !== 'Cualquier nivel') {
        const levelIndex = LEVELS.indexOf(filters.requiredLevel);
        if (levelIndex !== -1) {
          filtered = filtered.filter(match => {
            return match.nivelMinimo === levelIndex + 1;
          });
        }
      }

      setFilteredMatches(filtered);
    }
  }, [filters, allMatches]);

  // Update URL when filters change
  const updateFilters = (newFilters) => {
    const queryParams = new URLSearchParams();
    
    if (newFilters.sport && newFilters.sport !== 'Todos') {
      queryParams.set('sport', newFilters.sport);
    }
    
    if (newFilters.location) {
      queryParams.set('location', newFilters.location);
    }

    if (newFilters.requiredLevel && newFilters.requiredLevel !== 'Cualquier nivel') {
      const levelIndex = LEVELS.indexOf(newFilters.requiredLevel);
      if (levelIndex !== -1) {
        queryParams.set('level', (levelIndex + 1).toString());
      }
    }

    const newUrl = queryParams.toString() 
      ? `${location.pathname}?${queryParams.toString()}`
      : location.pathname;

    navigate(newUrl, { replace: true });
    setFilters(newFilters);
  };

  return {
    filters,
    updateFilters,
    filteredMatches,
    allMatches,
    setAllMatches
  };
}; 