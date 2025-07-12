import React, { useEffect, useState } from 'react';
import { Country, State, City } from 'country-state-city';

const LocationDropdown = ({ formData, setFormData }) => {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const countries = Country.getAllCountries();

  useEffect(() => {
    if (formData.country) {
      const fetchedStates = State.getStatesOfCountry(formData.country);
      setStates(fetchedStates);
      setFormData(prev => ({ ...prev, state: '', city: '' }));
    }
  }, [formData.country, setFormData]);

  useEffect(() => {
    if (formData.state) {
      const fetchedCities = City.getCitiesOfState(formData.country, formData.state);
      setCities(fetchedCities);
      setFormData(prev => ({ ...prev, city: '' }));
    }
  }, [formData.country, formData.state, setFormData]);

  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
      {/* Country Dropdown */}
      <select
        value={formData.country}
        onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
        className="border p-3 rounded-xl"
      >
        <option value="">Select Country</option>
        {countries.map(c => (
          <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
        ))}
      </select>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* State Dropdown */}
      <select
        value={formData.state}
        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
        className="border p-3 rounded-xl"
        disabled={!formData.country}
      >
        <option value="">Select State</option>
        {states.map(s => (
          <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
        ))}
      </select>

      {/* City Dropdown */}
      <select
        value={formData.city}
        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
        className="border p-3 rounded-xl"
        disabled={!formData.state}
      >
        <option value="">Select City</option>
        {cities.map(c => (
          <option key={c.name} value={c.name}>{c.name}</option>
        ))}
      </select>
    </div>
    </>
  );
};

export default LocationDropdown;