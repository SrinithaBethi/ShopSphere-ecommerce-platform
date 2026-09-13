import { Link } from 'react-router-dom';
import { Star, ImageOff } from 'lucide-react';
import { useState } from 'react';

export default function ProductCard({ product }) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      to={`/products/${product.id}`}
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col"
    >
      <div className="aspect-square bg-slate-100 overflow-hidden relative">
        {!imgError ? (
          <img
            src={product.image_url}
            alt={product.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <ImageOff className="w-10 h-10" />
          </div>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
            Only {product.stock} left
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute top-2 left-2 bg-slate-700 text-white text-[10px] font-bold px-2 py-1 rounded-full">
            Out of stock
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <span className="text-[11px] font-semibold text-brand-600 uppercase tracking-wide">
          {product.category_name || 'General'}
        </span>
        <h3 className="font-semibold text-slate-800 line-clamp-2 leading-snug">{product.name}</h3>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          {product.avg_rating ? `${product.avg_rating} (${product.review_count})` : 'No reviews yet'}
        </div>
        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="text-lg font-extrabold text-slate-900">₹{product.price.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </Link>
  );
}
