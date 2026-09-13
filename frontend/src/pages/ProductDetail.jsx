import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, ImageOff, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { apiErrorMessage } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [qty, setQty] = useState(1);
  const [imgError, setImgError] = useState(false);
  const [adding, setAdding] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const navigate = useNavigate();

  function load() {
    api.get(`/products/${id}`).then((res) => setData(res.data));
  }

  useEffect(() => {
    load();
    setImgError(false);
    setQty(1);
    window.scrollTo(0, 0);
  }, [id]);

  async function addToCart() {
    if (!user) return navigate('/login', { state: { from: `/products/${id}` } });
    setAdding(true);
    try {
      await api.post('/cart/items', { product_id: Number(id), quantity: qty });
      await refreshCart();
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setAdding(false);
    }
  }

  async function submitReview(e) {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await api.post(`/products/${id}/reviews`, reviewForm);
      toast.success('Review submitted!');
      setReviewForm({ rating: 5, comment: '' });
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSubmittingReview(false);
    }
  }

  if (!data) {
    return <div className="min-h-[60vh] flex items-center justify-center text-slate-400">Loading...</div>;
  }

  const { product, reviews } = data;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to shop
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="bg-slate-100 rounded-2xl aspect-square overflow-hidden flex items-center justify-center">
          {!imgError ? (
            <img src={product.image_url} alt={product.name} onError={() => setImgError(true)} className="w-full h-full object-cover" />
          ) : (
            <ImageOff className="w-16 h-16 text-slate-300" />
          )}
        </div>

        <div>
          <span className="text-xs font-semibold text-brand-600 uppercase tracking-wide">{product.category_name}</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-1">{product.name}</h1>

          <div className="flex items-center gap-1 mt-2 text-sm text-slate-500">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            {product.avg_rating ? `${product.avg_rating} · ${reviews.length} review${reviews.length !== 1 ? 's' : ''}` : 'No reviews yet'}
          </div>

          <p className="text-3xl font-extrabold text-slate-900 mt-4">₹{product.price.toLocaleString('en-IN')}</p>

          <p className="text-slate-600 mt-4 leading-relaxed">{product.description}</p>

          <div className="mt-3 text-sm">
            {product.stock > 0 ? (
              <span className="text-green-600 font-medium">In stock ({product.stock} available)</span>
            ) : (
              <span className="text-red-500 font-medium">Out of stock</span>
            )}
          </div>

          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center border border-slate-300 rounded-lg">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2 text-lg font-medium text-slate-600 hover:bg-slate-50 rounded-l-lg">−</button>
              <span className="px-4 font-semibold text-slate-800">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="px-3 py-2 text-lg font-medium text-slate-600 hover:bg-slate-50 rounded-r-lg">+</button>
            </div>

            <button
              onClick={addToCart}
              disabled={product.stock === 0 || adding}
              className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      <div className="mt-14 max-w-3xl">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Customer Reviews</h2>

        {user && (
          <form onSubmit={submitReview} className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-slate-700 mb-2">Leave a review (only for purchased items)</p>
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} onClick={() => setReviewForm((f) => ({ ...f, rating: n }))}>
                  <Star className={`w-6 h-6 ${n <= reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                </button>
              ))}
            </div>
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
              placeholder="Share your experience with this product..."
              rows={3}
              className="w-full text-sm border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-brand-400"
            />
            <button
              type="submit"
              disabled={submittingReview}
              className="mt-2 text-sm bg-slate-800 hover:bg-slate-900 text-white font-medium px-4 py-2 rounded-lg disabled:opacity-50"
            >
              Submit Review
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-slate-400 text-sm">No reviews yet. Be the first to review this product!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800 text-sm">{r.user_name}</span>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                    ))}
                  </div>
                </div>
                {r.comment && <p className="text-sm text-slate-600 mt-1">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
