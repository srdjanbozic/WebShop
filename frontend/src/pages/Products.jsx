import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { productAPI, makeRequest } from '../services/api';
import './Products.css';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [artisans, setArtisans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const productsPerPage = 9;

    const [filters, setFilters] = useState({
        category: '',
        material: '',
        minPrice: '',
        maxPrice: '',
        search: '',
        artisan: '',
        sortBy: 'name'
    });

    useEffect(() => {
        fetchProducts();
        fetchArtisans();
    }, [currentPage, filters]);

    const fetchProducts = async () => {
        try {
            setLoading(true);

            const params = {
                skip: (currentPage - 1) * productsPerPage,
                limit: productsPerPage,
                sort_by: filters.sortBy
            };

            if (filters.category) params.category = filters.category;
            if (filters.material) params.material = filters.material;
            if (filters.minPrice) params.min_price = parseFloat(filters.minPrice);
            if (filters.maxPrice) params.max_price = parseFloat(filters.maxPrice);
            if (filters.search) params.search = filters.search;
            if (filters.artisan) params.artisan_id = parseInt(filters.artisan);

            const response = await productAPI.getProducts(params);

            if (response && response.products) {
                setProducts(response.products);
                setTotalPages(response.total_pages || 1);
                setTotalProducts(response.total || response.products.length);
            } else {
                setProducts(response || []);
                setTotalPages(1);
                setTotalProducts(response?.length || 0);
            }

            setError(null);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Failed to load products. Please try again later.');

            const testProducts = [
                {
                    id: 1, name: "Oak Dining Table", price: 899.99, stock: 5,
                    category: "dining", material: "oak", artisan_id: 25,
                    image_url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop",
                    artisan: { full_name: "Marko Woodcraft" }
                },
                {
                    id: 2, name: "Walnut Modern Closet", price: 1299.99, stock: 3,
                    category: "bedroom", material: "walnut", artisan_id: 26,
                    image_url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
                    artisan: { full_name: "Ana Furniture" }
                },
                {
                    id: 3, name: "Royal Beech Bed", price: 1599.99, stock: 7,
                    category: "bedroom", material: "beech", artisan_id: 25,
                    image_url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=300&fit=crop",
                    artisan: { full_name: "Marko Woodcraft" }
                }
            ];
            setProducts(testProducts);
            setTotalPages(1);
            setTotalProducts(testProducts.length);
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
        setCurrentPage(1);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            setCurrentPage(1);
            fetchProducts();
        }
    };

    const clearFilters = () => {
        setFilters({
            category: '',
            material: '',
            minPrice: '',
            maxPrice: '',
            search: '',
            artisan: '',
            sortBy: 'name'
        });
        setCurrentPage(1);
    };

    const goToPage = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prev => prev - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

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
                        Using demo data - API connection issue
                    </div>
                )}
            </div>

            <div className="products-container">
                <div className="filters-sidebar">
                    <div className="filters-header">
                        <h3>Filters & Sort</h3>
                        <button onClick={clearFilters} className="clear-filters-btn">
                            Clear All
                        </button>
                    </div>

                    <div className="filter-group">
                        <label>Sort By</label>
                        <select
                            name="sortBy"
                            value={filters.sortBy}
                            onChange={handleFilterChange}
                            className="filter-select"
                        >
                            <option value="name">Name (A-Z)</option>
                            <option value="name_desc">Name (Z-A)</option>
                            <option value="price">Price (Low to High)</option>
                            <option value="price_desc">Price (High to Low)</option>
                            <option value="newest">Newest First</option>
                            <option value="stock">In Stock</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Search</label>
                        <input
                            type="text"
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                            onKeyPress={handleKeyPress}
                            placeholder="Search products..."
                            className="search-input"
                        />
                    </div>

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

                <div className="products-content">
                    <div className="products-info">
                        <p>Showing {products.length} of {totalProducts} products</p>
                        <p>Page {currentPage} of {totalPages}</p>

                        {filters.artisan && (
                            <p className="filter-active">
                                Filtered by: {artisans.find(a => a.id === parseInt(filters.artisan))?.full_name}
                            </p>
                        )}

                        {filters.search && (
                            <p className="filter-active">
                                Search: "{filters.search}"
                            </p>
                        )}

                        {products.length === 0 && (
                            <p className="no-products-warning">
                                No products available. Please check back later.
                            </p>
                        )}
                    </div>

                    {products.length === 0 ? (
                        <div className="no-products">
                            <h3>No products found</h3>
                            <p>Try adjusting your filters or search terms</p>
                            <button onClick={clearFilters} className="cta-button">
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="products-grid">
                                {products.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="pagination">
                                    <button
                                        onClick={prevPage}
                                        disabled={currentPage === 1}
                                        className="pagination-btn"
                                    >
                                        Previous
                                    </button>

                                    <div className="pagination-pages">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                onClick={() => goToPage(page)}
                                                className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={nextPage}
                                        disabled={currentPage === totalPages}
                                        className="pagination-btn"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Products;