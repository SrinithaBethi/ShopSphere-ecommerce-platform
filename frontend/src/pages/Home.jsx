import { useEffect, useState, useCallback } from 'react';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    sort: 'newest',
    page: 1,
  });

  useEffect(() => {
    api.get('/products/categories/list').then((res) => setCategories(res.data.categories));
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, limit: 12 };
      const res = await api.get('/products', { params });
      setProducts(res.data.products);
      setTotalPages(res.data.totalPages || 1);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function updateFilter(key, value) {
    setFilters((f) => ({ ...f, [key]: value, page: key === 'page' ? value : 1 }));
  }

  return (
    <div>
      <section className="bg-gradient-to-r from-brand-700 to-brand-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 flex flex-col items-center text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Everything you need, all in one place</h1>
          <p className="text-brand-100 max-w-xl mb-6">
            Discover top-rated electronics, fashion, home essentials, and more — with fast checkout and real-time inventory.
          </p>
          <div className="w-full max-w-xl relative">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
            <input
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Search for products..."
              className="w-full pl-12 pr-4 py-3 rounded-xl text-slate-800 outline-none shadow-lg focus:ring-4 focus:ring-brand-400/40"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <select
            value={filters.category}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-400"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
          <select
            value={filters.sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-400"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name">Name (A-Z)</option>
          </select>
          {(filters.category || filters.search) && (
            <button
              onClick={() => setFilters({ search: '', category: '', sort: 'newest', page: 1 })}
              className="text-sm text-brand-600 font-medium hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-slate-400">No products found. Try a different search or filter.</div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <button
                  disabled={filters.page <= 1}
                  onClick={() => updateFilter('page', filters.page - 1)}
                  className="p-2 rounded-lg border border-slate-300 disabled:opacity-40 hover:bg-slate-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-slate-600 font-medium">
                  Page {filters.page} of {totalPages}
                </span>
                <button
                  disabled={filters.page >= totalPages}
                  onClick={() => updateFilter('page', filters.page + 1)}
                  className="p-2 rounded-lg border border-slate-300 disabled:opacity-40 hover:bg-slate-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
