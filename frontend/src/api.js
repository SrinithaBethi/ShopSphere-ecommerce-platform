import axios from 'axios';

const IS_GITHUB_PAGES = window.location.hostname.includes('github.io');

const API_BASE =
  import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE,
});

const PRODUCTS = [
  {
    id: 1,
    name: 'Wireless Noise-Cancelling Headphones',
    description:
      'Over-ear Bluetooth headphones with 30-hour battery life and active noise cancellation.',
    price: 4999,
    image_url:
      'https://picsum.photos/seed/Wireless%20Noise-Cancelling%20Headphones/600/600',
    category_id: 1,
    category_name: 'Electronics',
    stock: 40,
    sku: 'ELEC-001',
    vendor_id: 2,
    is_active: 1,
    avg_rating: 4.8,
    review_count: 24,
  },
  {
    id: 2,
    name: 'Smart Fitness Watch',
    description:
      'Tracks heart rate, sleep, steps, and workouts with a 7-day battery.',
    price: 3499,
    image_url:
      'https://picsum.photos/seed/Smart%20Fitness%20Watch/600/600',
    category_id: 1,
    category_name: 'Electronics',
    stock: 55,
    sku: 'ELEC-002',
    vendor_id: 2,
    is_active: 1,
    avg_rating: 4.6,
    review_count: 18,
  },
  {
    id: 3,
    name: 'Mechanical Keyboard RGB',
    description:
      'Hot-swappable mechanical keyboard with per-key RGB lighting.',
    price: 5499,
    image_url:
      'https://picsum.photos/seed/Mechanical%20Keyboard%20RGB/600/600',
    category_id: 1,
    category_name: 'Electronics',
    stock: 25,
    sku: 'ELEC-003',
    vendor_id: 2,
    is_active: 1,
    avg_rating: 4.7,
    review_count: 32,
  },
  {
    id: 4,
    name: '4K Action Camera',
    description:
      'Waterproof action camera with image stabilization and 4K60 recording.',
    price: 8999,
    image_url:
      'https://picsum.photos/seed/4K%20Action%20Camera/600/600',
    category_id: 1,
    category_name: 'Electronics',
    stock: 15,
    sku: 'ELEC-004',
    vendor_id: 2,
    is_active: 1,
    avg_rating: 4.5,
    review_count: 15,
  },
  {
    id: 5,
    name: "Men's Casual Cotton Shirt",
    description:
      'Breathable slim-fit cotton shirt available in multiple colors.',
    price: 899,
    image_url:
      'https://picsum.photos/seed/Mens%20Casual%20Cotton%20Shirt/600/600',
    category_id: 2,
    category_name: 'Fashion',
    stock: 100,
    sku: 'FASH-001',
    vendor_id: 2,
    is_active: 1,
    avg_rating: 4.3,
    review_count: 29,
  },
  {
    id: 6,
    name: "Women's Running Shoes",
    description:
      'Lightweight cushioned running shoes for daily training.',
    price: 2299,
    image_url:
      'https://picsum.photos/seed/Womens%20Running%20Shoes/600/600',
    category_id: 2,
    category_name: 'Fashion',
    stock: 60,
    sku: 'FASH-002',
    vendor_id: 2,
    is_active: 1,
    avg_rating: 4.5,
    review_count: 21,
  },
  {
    id: 7,
    name: 'Leather Wallet',
    description:
      'Genuine leather bifold wallet with RFID protection.',
    price: 799,
    image_url:
      'https://picsum.photos/seed/Leather%20Wallet/600/600',
    category_id: 2,
    category_name: 'Fashion',
    stock: 80,
    sku: 'FASH-003',
    vendor_id: 2,
    is_active: 1,
    avg_rating: 4.4,
    review_count: 17,
  },
  {
    id: 8,
    name: 'Non-Stick Cookware Set (5-Piece)',
    description:
      'Durable non-stick cookware set suitable for all stovetops.',
    price: 3199,
    image_url:
      'https://picsum.photos/seed/Non-Stick%20Cookware%20Set/600/600',
    category_id: 3,
    category_name: 'Home & Kitchen',
    stock: 30,
    sku: 'HOME-001',
    vendor_id: 2,
    is_active: 1,
    avg_rating: 4.6,
    review_count: 26,
  },
  {
    id: 9,
    name: 'Robot Vacuum Cleaner',
    description:
      'Smart robot vacuum with app control and auto-recharge.',
    price: 12999,
    image_url:
      'https://picsum.photos/seed/Robot%20Vacuum%20Cleaner/600/600',
    category_id: 3,
    category_name: 'Home & Kitchen',
    stock: 12,
    sku: 'HOME-002',
    vendor_id: 2,
    is_active: 1,
    avg_rating: 4.7,
    review_count: 14,
  },
  {
    id: 10,
    name: 'Memory Foam Pillow (Set of 2)',
    description:
      'Ergonomic cervical support memory foam pillows.',
    price: 1199,
    image_url:
      'https://picsum.photos/seed/Memory%20Foam%20Pillow/600/600',
    category_id: 3,
    category_name: 'Home & Kitchen',
    stock: 70,
    sku: 'HOME-003',
    vendor_id: 2,
    is_active: 1,
    avg_rating: 4.5,
    review_count: 31,
  },
  {
    id: 11,
    name: 'Atomic Habits (Paperback)',
    description:
      'Bestselling book on building good habits and breaking bad ones.',
    price: 399,
    image_url:
      'https://picsum.photos/seed/Atomic%20Habits/600/600',
    category_id: 4,
    category_name: 'Books',
    stock: 150,
    sku: 'BOOK-001',
    vendor_id: 2,
    is_active: 1,
    avg_rating: 4.9,
    review_count: 48,
  },
  {
    id: 12,
    name: 'Clean Code',
    description:
      'A handbook of agile software craftsmanship by Robert C. Martin.',
    price: 899,
    image_url:
      'https://picsum.photos/seed/Clean%20Code/600/600',
    category_id: 4,
    category_name: 'Books',
    stock: 45,
    sku: 'BOOK-002',
    vendor_id: 2,
    is_active: 1,
    avg_rating: 4.8,
    review_count: 36,
  },
];

const CATEGORIES = [
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'Fashion' },
  { id: 3, name: 'Home & Kitchen' },
  { id: 4, name: 'Books' },
];

const realGet = api.get.bind(api);

api.get = async (url, config = {}) => {
  if (IS_GITHUB_PAGES) {
    if (url.includes('/products/categories/list')) {
      return {
        data: {
          categories: CATEGORIES,
        },
      };
    }

    if (url.startsWith('/products')) {
      const detailMatch = url.match(/^\/products\/(\d+)$/);

      if (detailMatch) {
        const product = PRODUCTS.find(
          (item) => item.id === Number(detailMatch[1])
        );

        return {
          data: {
            product,
          },
        };
      }

      return {
        data: {
          products: PRODUCTS,
          total: PRODUCTS.length,
          page: 1,
          limit: 12,
          totalPages: 1,
        },
      };
    }
  }

  return realGet(url, config);
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function apiErrorMessage(err) {
  if (err.response?.data?.errors?.length) {
    return err.response.data.errors
      .map((e) => e.msg)
      .join(', ');
  }

  return (
    err.response?.data?.error ||
    'Something went wrong. Please try again.'
  );
}

export default api;
