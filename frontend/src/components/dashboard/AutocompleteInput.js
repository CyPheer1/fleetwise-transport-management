/**
 * FleetWise Enterprise - Autocomplete Input Component
 * Professional autocomplete input with debouncing for city names
 */

import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import Heroicon from '../../components/ui/Heroicons';

const AutocompleteInput = ({
  id,
  name,
  value,
  onChange,
  placeholder,
  disabled,
  error,
  label,
  icon,
  style = {}
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  // Refs for managing focus and clicks
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // Debounced search function
  const debouncedSearch = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setIsLoading(true);
      const results = await api.getCitiesAutocomplete(searchTerm);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setHighlightedIndex(-1);
    } catch (error) {
      console.error('Autocomplete error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(e); // Call parent onChange immediately for form state

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for API call
    debounceTimeoutRef.current = setTimeout(() => {
      debouncedSearch(newValue);
    }, 300); // 300ms debounce delay
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    const syntheticEvent = {
      target: {
        name: name,
        value: suggestion
      }
    };
    onChange(syntheticEvent);
    setShowSuggestions(false);
    setSuggestions([]);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSuggestionSelect(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Handle input blur (with delay to allow suggestion clicks)
  const handleInputBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }, 150);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="form-group">
      {/* Label */}
      {label && (
        <label htmlFor={id} className="form-label" style={{display:'flex',alignItems:'center',gap:'8px',fontWeight:'500'}}>
          {icon && <Heroicon icon={icon} size={20} className="text-secondary" />}
          {label}
        </label>
      )}

      {/* Input Field */}
      <div className="autocomplete-wrapper" style={{ position: 'relative' }}>
        {icon && (
          <div className="autocomplete-icon">
            <Heroicon icon={icon} size={16} className="text-tertiary" />
          </div>
        )}
        <input
          ref={inputRef}
          type="text"
          id={id}
          name={name}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={`form-control autocomplete-input ${error ? 'error' : ''} ${showSuggestions ? 'has-suggestions' : ''}`}
          style={{
            paddingRight: isLoading ? '40px' : 'var(--space-4)',
            ...style
          }}
        />

        {/* Loading Spinner */}
        {isLoading && (
          <div style={{
            position: 'absolute',
            right: 'var(--space-3)',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '16px',
            height: '16px'
          }}>
            <div className="loading-spinner dark" style={{width: '100%', height: '100%'}}></div>
          </div>
        )}
        
        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="autocomplete-suggestions"
            style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              right: '0',
              zIndex: 1000,
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              boxShadow: 'var(--shadow-md)',
              marginTop: '4px',
              maxHeight: '250px',
              overflow: 'auto'
            }}
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion}
                onMouseDown={() => handleSuggestionSelect(suggestion)}
                className={`autocomplete-suggestion ${index === highlightedIndex ? 'highlighted' : ''}`}
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span className="city-icon"><Heroicon icon="map-pin" size={16} className="text-secondary" /></span>
                <span>{suggestion}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
