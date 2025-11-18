import {
  Product,
  Category,
  Review,
  ProductFilters,
  ProductSort,
  RatingDistribution,
} from '@repo/shared';
import { v4 as uuidv4 } from 'uuid';

class ProductStore {
  private categories: Map<string, Category> = new Map();
  private products: Map<string, Product> = new Map();
  private reviews: Map<string, Review> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    const now = new Date().toISOString();

    // Seed categories
    const electronics: Category = {
      id: 'cat-1',
      name: 'Electronics',
      slug: 'electronics',
      description: 'Latest electronic gadgets and devices',
      parentId: null,
      imageUrl: '/categories/electronics.jpg',
      createdAt: now,
      updatedAt: now,
    };

    const computers: Category = {
      id: 'cat-2',
      name: 'Computers',
      slug: 'computers',
      description: 'Laptops, desktops, and accessories',
      parentId: 'cat-1',
      imageUrl: '/categories/computers.jpg',
      createdAt: now,
      updatedAt: now,
    };

    const fashion: Category = {
      id: 'cat-3',
      name: 'Fashion',
      slug: 'fashion',
      description: 'Clothing and accessories',
      parentId: null,
      imageUrl: '/categories/fashion.jpg',
      createdAt: now,
      updatedAt: now,
    };

    const home: Category = {
      id: 'cat-4',
      name: 'Home & Garden',
      slug: 'home-garden',
      description: 'Everything for your home',
      parentId: null,
      imageUrl: '/categories/home.jpg',
      createdAt: now,
      updatedAt: now,
    };

    this.categories.set(electronics.id, electronics);
    this.categories.set(computers.id, computers);
    this.categories.set(fashion.id, fashion);
    this.categories.set(home.id, home);

    // Seed products
    const products: Omit<Product, 'category'>[] = [
      {
        id: 'prod-1',
        name: 'Premium Wireless Headphones',
        slug: 'premium-wireless-headphones',
        description:
          'High-quality wireless headphones with active noise cancellation, 30-hour battery life, and premium sound quality. Perfect for music lovers and professionals.',
        price: 299.99,
        compareAtPrice: 399.99,
        categoryId: 'cat-1',
        images: [
          '/products/headphones-1.jpg',
          '/products/headphones-2.jpg',
          '/products/headphones-3.jpg',
        ],
        stock: 45,
        sku: 'HEAD-001',
        rating: 4.5,
        reviewCount: 128,
        tags: ['audio', 'wireless', 'premium'],
        isFeatured: true,
        isTrending: true,
        shippingInfo: 'Free shipping on orders over $50',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prod-2',
        name: 'Ultra-Wide Gaming Monitor',
        slug: 'ultra-wide-gaming-monitor',
        description:
          '34-inch curved ultra-wide gaming monitor with 144Hz refresh rate, 1ms response time, and stunning QHD resolution.',
        price: 599.99,
        categoryId: 'cat-2',
        images: [
          '/products/monitor-1.jpg',
          '/products/monitor-2.jpg',
          '/products/monitor-3.jpg',
        ],
        stock: 23,
        sku: 'MON-001',
        rating: 4.8,
        reviewCount: 89,
        tags: ['gaming', 'monitor', 'electronics'],
        isFeatured: true,
        isTrending: true,
        shippingInfo: 'Free shipping on orders over $50',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prod-3',
        name: 'Mechanical Gaming Keyboard',
        slug: 'mechanical-gaming-keyboard',
        description:
          'RGB mechanical keyboard with Cherry MX switches, programmable keys, and durable construction.',
        price: 149.99,
        compareAtPrice: 199.99,
        categoryId: 'cat-2',
        images: [
          '/products/keyboard-1.jpg',
          '/products/keyboard-2.jpg',
          '/products/keyboard-3.jpg',
        ],
        stock: 67,
        sku: 'KEY-001',
        rating: 4.6,
        reviewCount: 203,
        tags: ['gaming', 'keyboard', 'rgb'],
        isTrending: true,
        shippingInfo: 'Free shipping on orders over $50',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prod-4',
        name: 'Wireless Gaming Mouse',
        slug: 'wireless-gaming-mouse',
        description:
          'High-precision wireless gaming mouse with adjustable DPI, RGB lighting, and ergonomic design.',
        price: 79.99,
        categoryId: 'cat-2',
        images: [
          '/products/mouse-1.jpg',
          '/products/mouse-2.jpg',
          '/products/mouse-3.jpg',
        ],
        stock: 92,
        sku: 'MOUSE-001',
        rating: 4.4,
        reviewCount: 156,
        tags: ['gaming', 'mouse', 'wireless'],
        isTrending: true,
        shippingInfo: 'Free shipping on orders over $50',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prod-5',
        name: 'Smart Watch Pro',
        slug: 'smart-watch-pro',
        description:
          'Advanced smartwatch with fitness tracking, heart rate monitor, GPS, and 7-day battery life.',
        price: 399.99,
        compareAtPrice: 499.99,
        categoryId: 'cat-1',
        images: [
          '/products/watch-1.jpg',
          '/products/watch-2.jpg',
          '/products/watch-3.jpg',
        ],
        stock: 34,
        sku: 'WATCH-001',
        rating: 4.7,
        reviewCount: 312,
        tags: ['smartwatch', 'fitness', 'wearable'],
        isFeatured: true,
        shippingInfo: 'Free shipping on orders over $50',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prod-6',
        name: 'Premium Cotton T-Shirt',
        slug: 'premium-cotton-tshirt',
        description:
          'High-quality 100% organic cotton t-shirt with comfortable fit and modern design.',
        price: 29.99,
        categoryId: 'cat-3',
        images: [
          '/products/tshirt-1.jpg',
          '/products/tshirt-2.jpg',
          '/products/tshirt-3.jpg',
        ],
        stock: 150,
        sku: 'SHIRT-001',
        rating: 4.3,
        reviewCount: 87,
        tags: ['clothing', 'fashion', 'cotton'],
        shippingInfo: 'Free shipping on orders over $50',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prod-7',
        name: 'Designer Sunglasses',
        slug: 'designer-sunglasses',
        description:
          'Stylish designer sunglasses with UV protection and premium materials.',
        price: 159.99,
        compareAtPrice: 249.99,
        categoryId: 'cat-3',
        images: [
          '/products/sunglasses-1.jpg',
          '/products/sunglasses-2.jpg',
          '/products/sunglasses-3.jpg',
        ],
        stock: 42,
        sku: 'SUN-001',
        rating: 4.6,
        reviewCount: 64,
        tags: ['fashion', 'sunglasses', 'accessories'],
        isFeatured: true,
        shippingInfo: 'Free shipping on orders over $50',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prod-8',
        name: 'Smart Home Hub',
        slug: 'smart-home-hub',
        description:
          'Central control hub for all your smart home devices with voice control support.',
        price: 129.99,
        categoryId: 'cat-4',
        images: [
          '/products/hub-1.jpg',
          '/products/hub-2.jpg',
          '/products/hub-3.jpg',
        ],
        stock: 56,
        sku: 'HUB-001',
        rating: 4.5,
        reviewCount: 178,
        tags: ['smart home', 'hub', 'automation'],
        isTrending: true,
        shippingInfo: 'Free shipping on orders over $50',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prod-9',
        name: 'Robot Vacuum Cleaner',
        slug: 'robot-vacuum-cleaner',
        description:
          'Intelligent robot vacuum with mapping technology, automatic charging, and app control.',
        price: 449.99,
        compareAtPrice: 599.99,
        categoryId: 'cat-4',
        images: [
          '/products/vacuum-1.jpg',
          '/products/vacuum-2.jpg',
          '/products/vacuum-3.jpg',
        ],
        stock: 18,
        sku: 'VAC-001',
        rating: 4.7,
        reviewCount: 234,
        tags: ['smart home', 'cleaning', 'robot'],
        isFeatured: true,
        shippingInfo: 'Free shipping on orders over $50',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prod-10',
        name: 'Portable Bluetooth Speaker',
        slug: 'portable-bluetooth-speaker',
        description:
          'Waterproof portable speaker with 360-degree sound, 12-hour battery, and deep bass.',
        price: 89.99,
        categoryId: 'cat-1',
        images: [
          '/products/speaker-1.jpg',
          '/products/speaker-2.jpg',
          '/products/speaker-3.jpg',
        ],
        stock: 73,
        sku: 'SPEAK-001',
        rating: 4.4,
        reviewCount: 145,
        tags: ['audio', 'bluetooth', 'portable'],
        shippingInfo: 'Free shipping on orders over $50',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prod-11',
        name: 'USB-C Laptop Charger',
        slug: 'usb-c-laptop-charger',
        description:
          'Universal 65W USB-C charger compatible with most laptops and devices.',
        price: 39.99,
        categoryId: 'cat-2',
        images: [
          '/products/charger-1.jpg',
          '/products/charger-2.jpg',
          '/products/charger-3.jpg',
        ],
        stock: 120,
        sku: 'CHRG-001',
        rating: 4.2,
        reviewCount: 98,
        tags: ['charger', 'usb-c', 'accessories'],
        shippingInfo: 'Free shipping on orders over $50',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prod-12',
        name: 'Leather Wallet',
        slug: 'leather-wallet',
        description:
          'Genuine leather wallet with RFID protection and multiple card slots.',
        price: 49.99,
        categoryId: 'cat-3',
        images: [
          '/products/wallet-1.jpg',
          '/products/wallet-2.jpg',
          '/products/wallet-3.jpg',
        ],
        stock: 85,
        sku: 'WALL-001',
        rating: 4.5,
        reviewCount: 76,
        tags: ['fashion', 'leather', 'wallet'],
        shippingInfo: 'Free shipping on orders over $50',
        createdAt: now,
        updatedAt: now,
      },
    ];

    products.forEach((product) => {
      const category = this.categories.get(product.categoryId);
      this.products.set(product.id, { ...product, category });
    });

    // Seed some reviews
    const reviews: Review[] = [
      {
        id: 'rev-1',
        productId: 'prod-1',
        userId: 'user-1',
        userName: 'John Doe',
        rating: 5,
        title: 'Excellent sound quality!',
        comment:
          'These headphones are amazing. The noise cancellation works perfectly and the battery life is incredible.',
        verified: true,
        helpful: 23,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'rev-2',
        productId: 'prod-1',
        userId: 'user-2',
        userName: 'Jane Smith',
        rating: 4,
        title: 'Great but a bit pricey',
        comment:
          'Love the sound quality and comfort, but I think the price is a bit high for what you get.',
        verified: true,
        helpful: 15,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'rev-3',
        productId: 'prod-2',
        userId: 'user-3',
        userName: 'Mike Johnson',
        rating: 5,
        title: 'Perfect for gaming!',
        comment:
          'The ultra-wide screen is a game changer. Colors are vibrant and the refresh rate is smooth.',
        verified: true,
        helpful: 34,
        createdAt: now,
        updatedAt: now,
      },
    ];

    reviews.forEach((review) => this.reviews.set(review.id, review));
  }

  // Categories
  getAllCategories(): Category[] {
    return Array.from(this.categories.values());
  }

  getCategoryById(id: string): Category | undefined {
    return this.categories.get(id);
  }

  getCategoryBySlug(slug: string): Category | undefined {
    return Array.from(this.categories.values()).find(
      (cat) => cat.slug === slug
    );
  }

  // Products
  getAllProducts(
    filters?: ProductFilters,
    sort?: ProductSort,
    page = 1,
    limit = 12
  ): { products: Product[]; total: number } {
    let products = Array.from(this.products.values());

    // Apply filters
    if (filters) {
      if (filters.categoryId) {
        products = products.filter((p) => {
          // Check direct category match or parent category match
          if (p.categoryId === filters.categoryId) return true;
          const category = this.categories.get(p.categoryId);
          return category?.parentId === filters.categoryId;
        });
      }

      if (filters.minPrice !== undefined) {
        products = products.filter((p) => p.price >= filters.minPrice!);
      }

      if (filters.maxPrice !== undefined) {
        products = products.filter((p) => p.price <= filters.maxPrice!);
      }

      if (filters.minRating !== undefined) {
        products = products.filter((p) => p.rating >= filters.minRating!);
      }

      if (filters.tags && filters.tags.length > 0) {
        products = products.filter((p) =>
          filters.tags!.some((tag) => p.tags?.includes(tag))
        );
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        products = products.filter(
          (p) =>
            p.name.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower)
        );
      }
    }

    // Apply sorting
    if (sort) {
      products.sort((a, b) => {
        const aValue = a[sort.field];
        const bValue = b[sort.field];
        const comparison =
          typeof aValue === 'string'
            ? aValue.localeCompare(bValue as string)
            : (aValue as number) - (bValue as number);
        return sort.order === 'asc' ? comparison : -comparison;
      });
    }

    const total = products.length;
    const start = (page - 1) * limit;
    const paginatedProducts = products.slice(start, start + limit);

    return { products: paginatedProducts, total };
  }

  getProductById(id: string): Product | undefined {
    return this.products.get(id);
  }

  getProductBySlug(slug: string): Product | undefined {
    return Array.from(this.products.values()).find((p) => p.slug === slug);
  }

  getFeaturedProducts(limit = 6): Product[] {
    return Array.from(this.products.values())
      .filter((p) => p.isFeatured)
      .slice(0, limit);
  }

  getTrendingProducts(limit = 6): Product[] {
    return Array.from(this.products.values())
      .filter((p) => p.isTrending)
      .slice(0, limit);
  }

  getRelatedProducts(productId: string, limit = 4): Product[] {
    const product = this.products.get(productId);
    if (!product) return [];

    return Array.from(this.products.values())
      .filter((p) => p.id !== productId && p.categoryId === product.categoryId)
      .slice(0, limit);
  }

  // Reviews
  getProductReviews(
    productId: string,
    page = 1,
    limit = 10
  ): { reviews: Review[]; total: number } {
    const reviews = Array.from(this.reviews.values())
      .filter((r) => r.productId === productId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    const total = reviews.length;
    const start = (page - 1) * limit;
    const paginatedReviews = reviews.slice(start, start + limit);

    return { reviews: paginatedReviews, total };
  }

  getRatingDistribution(productId: string): RatingDistribution {
    const reviews = Array.from(this.reviews.values()).filter(
      (r) => r.productId === productId
    );

    const distribution: RatingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((review) => {
      distribution[review.rating as keyof RatingDistribution]++;
    });

    return distribution;
  }

  createReview(
    productId: string,
    userId: string,
    userName: string,
    rating: number,
    title: string,
    comment: string
  ): Review {
    const now = new Date().toISOString();
    const review: Review = {
      id: uuidv4(),
      productId,
      userId,
      userName,
      rating,
      title,
      comment,
      verified: false,
      helpful: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.reviews.set(review.id, review);

    // Update product rating and review count
    const product = this.products.get(productId);
    if (product) {
      const allReviews = Array.from(this.reviews.values()).filter(
        (r) => r.productId === productId
      );
      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      product.rating = totalRating / allReviews.length;
      product.reviewCount = allReviews.length;
    }

    return review;
  }
}

export const productStore = new ProductStore();
