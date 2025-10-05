import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { productAPI, makeRequest } from '../services/api';
import './Products.css';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [artisans, setArtisans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        category: '',
        material: '',
        minPrice: '',
        maxPrice: '',
        search: '',
        artisan: '' // 🔥 NOVI ARTISAN FILTER
    });

    useEffect(() => {
        fetchProducts();
        fetchArtisans();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const productsData = await productAPI.getProducts();
            setProducts(productsData);
            setError(null);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Failed to load products. Please try again later.');

            // Fallback na testne podatke ako API ne radi
            const testProducts = [
                {
                    id: 1,
                    name: "Oak Dining Table",
                    description: "Handcrafted solid oak dining table with elegant finish",
                    price: 899.99,
                    stock: 5,
                    category: "dining",
                    material: "oak",
                    dimensions: "180x90x75 cm",
                    image_url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop",
                    artisan_id: 25, // 🔥 DODAJ ARTISAN ID
                    artisan: { full_name: "Marko Woodcraft" } // 🔥 DODAJ ARTISAN INFO
                },
                {
                    id: 2,
                    name: "Walnut Modern Closet",
                    description: "Contemporary walnut closet with smart storage",
                    price: 1299.99,
                    stock: 3,
                    category: "bedroom",
                    material: "walnut",
                    dimensions: "200x60x220 cm",
                    image_url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
                    artisan_id: 26,
                    artisan: { full_name: "Ana Furniture" }
                },
                {
                    id: 3,
                    name: "Royal Beech Bed",
                    description: "Luxurious beech wood bed with carved details",
                    price: 1599.99,
                    stock: 7,
                    category: "bedroom",
                    material: "beech",
                    dimensions: "160x200x110 cm",
                    image_url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=300&fit=crop",
                    artisan_id: 25,
                    artisan: { full_name: "Marko Woodcraft" }
                }
            ];
            setProducts(testProducts);
        } finally {
            setLoading(false);
        }
    };

    const fetchArtisans = async () => {
        try {
            const artisansData = await makeRequest('/api/v1/artisan/public');
            setArtisans(artisansData);
        } catch (error) {
            console.error('Error fetching artisans:', error);
            // Fallback artisans
            setArtisans([
                { id: 25, full_name: "Marko Woodcraft" },
                { id: 26, full_name: "Ana Furniture" }
            ]);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            category: '',
            material: '',
            minPrice: '',
            maxPrice: '',
            search: '',
            artisan: '' // 🔥 RESETUJ I ARTISAN
        });
    };

    const filteredProducts = products.filter(product => {
        const matchesCategory = !filters.category || product.category === filters.category;
        const matchesMaterial = !filters.material || product.material === filters.material;
        const matchesMinPrice = !filters.minPrice || product.price >= parseFloat(filters.minPrice);
        const matchesMaxPrice = !filters.maxPrice || product.price <= parseFloat(filters.maxPrice);
        const matchesSearch = !filters.search ||
            product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(filters.search.toLowerCase()));
        // 🔥 NOVI ARTISAN FILTER
        const matchesArtisan = !filters.artisan || product.artisan_id === parseInt(filters.artisan);

        return matchesCategory && matchesMaterial && matchesMinPrice && matchesMaxPrice && matchesSearch && matchesArtisan;
    });

    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    const materials = [...new Set(products.map(p => p.material).filter(Boolean))];

    if (loading) {
        return (
            <div className="products-page">
                <div className="loading">
                    <h2>Loading products...</h2>
                    <p>Please wait while we load our collection</p>
                </div>
            </div>
        );
    }

    if (error && products.length === 0) {
        return (
            <div className="products-page">
                <div className="error">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button onClick={fetchProducts} className="cta-button">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="products-page">
            <div className="products-header">
                <h1>Our Furniture Collection</h1>
                <p>Discover handcrafted luxury furniture made from premium materials</p>
                {error && (
                    <div className="api-warning">
                        ⚠️ Using demo data - API connection issue
                    </div>
                )}
            </div>

            <div className="products-container">
                {/* Filters Sidebar */}
                <div className="filters-sidebar">
                    <div className="filters-header">
                        <h3>Filters</h3>
                        <button onClick={clearFilters} className="clear-filters-btn">
                            Clear All
                        </button>
                    </div>

                    {/* Search */}
                    <div className="filter-group">
                        <label>Search</label>
                        <input
                            type="text"
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                            placeholder="Search products..."
                            className="search-input"
                        />
                    </div>

                    {/* 🔥 ARTISAN FILTER */}
                    <div className="filter-group">
                        <label>Artisan</label>
                        <select
                            name="artisan"
                            value={filters.artisan}
                            onChange={handleFilterChange}
                            className="filter-select"
                        >
                            <option value="">All Artisans</option>
                            {artisans.map(artisan => (
                                <option key={artisan.id} value={artisan.id}>
                                    {artisan.full_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Category Filter */}
                    <div className="filter-group">
                        <label>Category</label>
                        <select
                            name="category"
                            value={filters.category}
                            onChange={handleFilterChange}
                            className="filter-select"
                        >
                            <option value="">All Categories</option>
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Material Filter */}
                    <div className="filter-group">
                        <label>Material</label>
                        <select
                            name="material"
                            value={filters.material}
                            onChange={handleFilterChange}
                            className="filter-select"
                        >
                            <option value="">All Materials</option>
                            {materials.map(material => (
                                <option key={material} value={material}>
                                    {material.charAt(0).toUpperCase() + material.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Price Range */}
                    <div className="filter-group">
                        <label>Price Range</label>
                        <div className="price-inputs">
                            <input
                                type="number"
                                name="minPrice"
                                value={filters.minPrice}
                                onChange={handleFilterChange}
                                placeholder="Min"
                                className="price-input"
                            />
                            <span>to</span>
                            <input
                                type="number"
                                name="maxPrice"
                                value={filters.maxPrice}
                                onChange={handleFilterChange}
                                placeholder="Max"
                                className="price-input"
                            />
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="products-content">
                    <div className="products-info">
                        <p>Showing {filteredProducts.length} of {products.length} products</p>
                        {filters.artisan && (
                            <p className="filter-active">
                                Filtered by: {artisans.find(a => a.id === parseInt(filters.artisan))?.full_name}
                            </p>
                        )}
                        {products.length === 0 && (
                            <p className="no-products-warning">
                                No products available. Please check back later.
                            </p>
                        )}
                    </div>

                    {filteredProducts.length === 0 ? (
                        <div className="no-products">
                            <h3>No products found</h3>
                            <p>Try adjusting your filters or search terms</p>
                            <button onClick={clearFilters} className="cta-button">
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <div className="products-grid">
                            {filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Products;