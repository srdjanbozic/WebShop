// pages/ArtisanPublicProfile.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { makeRequest } from '../services/api';
import ProductCard from '../components/ProductCard';
import './ArtisanPublicProfile.css';

const ArtisanPublicProfile = () => {
    const { artisanId } = useParams();
    const [artisan, setArtisan] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchArtisanData();
    }, [artisanId]);

    //  FUNKCIJA ZA SLIKE ARTISANA
    const getArtisanImage = (id) => {
        const artisanImages = {
            25: '/images/artisan-marko.jpg',
            26: '/images/artisan-ana.jpg',
        };
        return artisanImages[id] || '/images/default-artisan.jpg';
    };

    //  FUNKCIJA ZA ARTISAN BIO
    const getArtisanBio = (id, material) => {
        const bios = {
            25: "Master woodcraft artisan with 15+ years of experience specializing in custom oak and walnut furniture. Known for intricate carvings and durable finishes.",
            26: "Contemporary furniture designer focusing on minimalist beech wood creations. Combines traditional techniques with modern aesthetics."
        };
        return bios[id] || `Skilled artisan specializing in ${material || 'premium wood'} furniture with attention to detail and quality craftsmanship.`;
    };

    const fetchArtisanData = async () => {
        try {
            setLoading(true);
            const artisanData = await makeRequest(`/api/v1/artisan/public/${artisanId}`);
            setArtisan(artisanData);
            setProducts(artisanData.products || []);
        } catch (err) {
            console.error('Error fetching artisan:', err);
            setError('Artisan not found');

            //  FALLBACK ARTISAN DATA
            const fallbackArtisans = {
                25: {
                    artisan: {
                        id: 25,
                        full_name: "Marko Woodcraft",
                        email: "marko@luxurywood.com",
                        joined_date: "2023-01-15T00:00:00"
                    },
                    products: [],
                    total_products: 0
                },
                26: {
                    artisan: {
                        id: 26,
                        full_name: "Ana Furniture",
                        email: "ana@luxurywood.com",
                        joined_date: "2023-02-20T00:00:00"
                    },
                    products: [],
                    total_products: 0
                }
            };

            const fallbackData = fallbackArtisans[parseInt(artisanId)];
            if (fallbackData) {
                setArtisan(fallbackData);
                setProducts(fallbackData.products);
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading artisan profile...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!artisan) return <div className="error">Artisan not found</div>;

    const primaryMaterial = products[0]?.material || 'wood';
    const artisanBio = getArtisanBio(parseInt(artisanId), primaryMaterial);

    return (
        <div className="artisan-public-profile">
            {/* ARTISAN HEADER */}
            <div className="artisan-header">
                <div className="artisan-avatar">
                    <img
                        src={getArtisanImage(parseInt(artisanId))}
                        alt={artisan.artisan.full_name}
                        className="avatar-image"
                        onError={(e) => {
                            e.target.src = '/images/default-artisan.jpg';
                        }}
                    />
                </div>
                <div className="artisan-info">
                    <h1>{artisan.artisan.full_name}</h1>
                    <p className="artisan-email">{artisan.artisan.email}</p>
                    <p className="artisan-joined">
                        Member since: {new Date(artisan.artisan.joined_date).toLocaleDateString()}
                    </p>

                    {/*  ARTISAN BIO */}
                    <div className="artisan-bio">
                        <p>{artisanBio}</p>
                    </div>

                    <div className="artisan-stats">
                        <span className="stat">
                            <strong>{artisan.total_products}</strong> Products
                        </span>
                        <span className="stat">
                            <strong>⭐ 4.8</strong> Rating
                        </span>
                        <span className="stat">
                            <strong>📦 {products.filter(p => p.stock > 0).length}</strong> In Stock
                        </span>
                    </div>

                    {/*  SPECIALIZATION TAGS */}
                    <div className="artisan-specializations">
                        {products.length > 0 && (
                            <>
                                <span className="specialization-tag">{primaryMaterial} specialist</span>
                                <span className="specialization-tag">handcrafted</span>
                                <span className="specialization-tag">premium quality</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ARTISAN PRODUCTS */}
            <div className="artisan-products-section">
                <div className="section-header">
                    <h2>Products by {artisan.artisan.full_name}</h2>
                    <p>Discover unique handcrafted furniture pieces</p>
                </div>

                {products.length === 0 ? (
                    <div className="no-products">
                        <div className="no-products-icon">🔨</div>
                        <h3>No Products Available</h3>
                        <p>This artisan doesn't have any products available at the moment.</p>
                        <Link to="/products" className="btn-primary">
                            Browse All Products
                        </Link>
                    </div>
                ) : (
                    <div className="products-grid">
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>

            {/*  CONTACT INFO */}
            <div className="artisan-contact">
                <h3>Contact Artisan</h3>
                <p>Interested in custom work or have questions? Reach out to {artisan.artisan.full_name} directly.</p>
                <div className="contact-actions">
                    <a href={`mailto:${artisan.artisan.email}`} className="contact-btn">
                        ✉️ Send Email
                    </a>
                    <Link to="/products" className="contact-btn secondary">
                        🛍️ View All Products
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ArtisanPublicProfile;