// components/ProductFilters.jsx - NOVA KOMPONENTA
import React, { useState, useEffect } from 'react';
import { makeRequest } from '../services/api';

const ProductFilters = ({ onFilterChange }) => {
    const [artisans, setArtisans] = useState([]);
    const [selectedArtisan, setSelectedArtisan] = useState('all');

    useEffect(() => {
        fetchArtisans();
    }, []);

    const fetchArtisans = async () => {
        try {
            // Trebaće ti endpoint za sve artifane
            const artisansData = await makeRequest('/api/v1/artisans');
            setArtisans(artisansData);
        } catch (error) {
            console.error('Error fetching artisans:', error);
        }
    };

    const handleArtisanChange = (e) => {
        const artisanId = e.target.value;
        setSelectedArtisan(artisanId);
        onFilterChange({ artisan: artisanId });
    };

    return (
        <div className="product-filters">
            <select
                value={selectedArtisan}
                onChange={handleArtisanChange}
                className="filter-select"
            >
                <option value="all">All Artisans</option>
                {artisans.map(artisan => (
                    <option key={artisan.id} value={artisan.id}>
                        {artisan.full_name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default ProductFilters;