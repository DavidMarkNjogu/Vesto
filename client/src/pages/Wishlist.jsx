import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { offlineDB } from '../utils/offlineDB';
import useCartStore from '../store/cartStore';

const Wishlist = () => {
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const items = await offlineDB.getWishlist();
      setWishlist(items);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (id) => {
    try {
      await offlineDB.removeFromWishlist(id);
      setWishlist(wishlist.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const addToCart = (product) => {
    addItem(product);
    alert('Added to cart!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg py-8">
      <div className="container mx-auto px-4">
        <button
          className="btn btn-ghost mb-4"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Shop
        </button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            My Wishlist
          </h1>
          <p className="text-gray-600">Items you've saved for later</p>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Start adding items you love!</p>
            <Link to="/" className="btn btn-primary">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <Link to={`/product/${item.id}`}>
                  <figure className="relative overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-64 object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </figure>
                </Link>
                <div className="card-body">
                  <Link to={`/product/${item.id}`}>
                    <h2 className="card-title">{item.title}</h2>
                  </Link>
                  <p className="text-2xl font-bold text-secondary">
                    KES {item.price.toLocaleString()}
                  </p>
                  <div className="card-actions justify-end mt-4">
                    <button
                      className="btn btn-primary flex-1"
                      onClick={() => addToCart(item)}
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add to Cart
                    </button>
                    <button
                      className="btn btn-error"
                      onClick={() => removeFromWishlist(item.id)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;


