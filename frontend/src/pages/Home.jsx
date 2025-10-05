// pages/Home.jsx
import React from 'react';
import ProductCard from '../components/ProductCard';
import './Home.css';

const Home = () => {
    // Testni podaci - kasnije ćeš dohvatiti sa backend-a
    const featuredProducts = [
        {
            id: 1,
            name: "Oak Dining Table",
            description: "Handcrafted solid oak dining table with elegant finish",
            price: 899.99,
            stock: 5,
            image_url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop"
        },
        {
            id: 2,
            name: "Walnut Bookshelf",
            description: "Premium walnut bookshelf with adjustable shelves",
            price: 450.00,
            stock: 3,
            image_url: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=300&fit=crop"
        },
        {
            id: 3,
            name: "Beech Wood Chair",
            description: "Comfortable beech wood chair with upholstered seat",
            price: 199.99,
            stock: 8,
            image_url: "https://images.unsplash.com/photo-1503602642458-232111445657?w=400&h=300&fit=crop"
        }
    ];

    const categories = [
        {
            name: "Living Room",
            image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
            count: "24 Products"
        },
        {
            name: "Dining Room",
            image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop",
            count: "18 Products"
        },
        {
            name: "Bedroom",
            image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=300&fit=crop",
            count: "15 Products"
        },
        {
            name: "Office",
            image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&h=300&fit=crop",
            count: "12 Products"
        }
    ];

    const testimonials = [
        {
            name: "Sarah Johnson",
            role: "Homeowner",
            content: "The quality of the oak dining table exceeded my expectations. It's the centerpiece of our home!",
            rating: 5
        },
        {
            name: "Michael Chen",
            role: "Interior Designer",
            content: "I regularly recommend Luxury Wood Furniture to my clients. The craftsmanship is exceptional.",
            rating: 5
        },
        {
            name: "Emma Rodriguez",
            role: "Restaurant Owner",
            content: "We furnished our entire restaurant with their custom pieces. Absolutely stunning work!",
            rating: 5
        }
    ];

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1>Premium Wood Furniture</h1>
                    <p>Handcrafted luxury furniture made from the finest materials</p>
                    <button className="cta-button">Shop Collection</button>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <h2>Why Choose Luxury Wood Furniture?</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">🪵</div>
                            <h3>Premium Materials</h3>
                            <p>Only the finest oak, walnut, and beech wood sourced from sustainable forests</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🔧</div>
                            <h3>Handcrafted Excellence</h3>
                            <p>Each piece meticulously crafted by skilled artisans with decades of experience</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🚚</div>
                            <h3>Free Shipping</h3>
                            <p>Free delivery on all orders over $500 with white-glove installation service</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="categories-section">
                <div className="container">
                    <h2>Shop by Category</h2>
                    <p>Discover furniture for every room in your home</p>
                    <div className="categories-grid">
                        {categories.map((category, index) => (
                            <div key={index} className="category-card">
                                <img src={category.image} alt={category.name} />
                                <div className="category-overlay">
                                    <h3>{category.name}</h3>
                                    <span>{category.count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="featured-products">
                <div className="container">
                    <h2>Featured Collection</h2>
                    <p>Our most popular handcrafted pieces</p>
                    <div className="products-grid">
                        {featuredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials-section">
                <div className="container">
                    <h2>What Our Customers Say</h2>
                    <div className="testimonials-grid">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="testimonial-card">
                                <div className="stars">
                                    {'★'.repeat(testimonial.rating)}
                                </div>
                                <p className="testimonial-content">"{testimonial.content}"</p>
                                <div className="testimonial-author">
                                    <strong>{testimonial.name}</strong>
                                    <span>{testimonial.role}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            {/* Artisan CTA Section */}
            <section className="artisan-cta-section">
                <div className="container">
                    <div className="artisan-content">
                        <div className="artisan-text">
                            <h2>Are You an Artisan?</h2>
                            <p>Join our community of master craftsmen and showcase your unique furniture creations to discerning customers worldwide.</p>
                            <div className="artisan-benefits">
                                <div className="benefit">
                                    <span className="benefit-icon">🛠️</span>
                                    <span>Reach global customers</span>
                                </div>
                                <div className="benefit">
                                    <span className="benefit-icon">💼</span>
                                    <span>Manage your business easily</span>
                                </div>
                                <div className="benefit">
                                    <span className="benefit-icon">💰</span>
                                    <span>Keep 85% of every sale</span>
                                </div>
                            </div>
                            <div className="artisan-buttons">
                                <button
                                    className="cta-button primary"
                                    onClick={() => window.location.href = '/register?type=artisan'}
                                >
                                    Join as Artisan
                                </button>
                                <button className="cta-button secondary">
                                    Learn More
                                </button>
                            </div>
                        </div>
                        <div className="artisan-image">
                            <img
                                src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d8?w=500&h=400&fit=crop"
                                alt="Woodworking artisan"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <h2>Need Something Custom?</h2>
                    <p>Our master craftsmen can create bespoke furniture tailored to your exact specifications and space</p>
                    <div className="cta-buttons">
                        <button className="cta-button primary">Request Custom Quote</button>
                        <button className="cta-button secondary">View Gallery</button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;