// Admin 영역의 mutation helper.
// mocks/fixtures/products.ts 의 mockProductSummaries / mockProductDetails /
// mockCategories array 를 직접 수정한다 (모두 mutable).

import type {
  AddSkuRequest,
  AdjustStockRequest,
  Category,
  CategoryCreateRequest,
  CategoryUpdateRequest,
  ProductCreateRequest,
  ProductDetail,
  ProductUpdateRequest,
  Sku,
} from '@/types/api';

import {
  mockCategories,
  mockProductDetails,
  mockProductSummaries,
} from './products';

const SKU_ID_STEP = 1;
const PRODUCT_ID_STEP = 1;

const findCategoryById = (id: number) => mockCategories.find((c) => c.id === id);

const recomputeStock = (product: ProductDetail) => {
  product.totalStock = product.skus.reduce((sum, s) => sum + s.stock, 0);
  product.inStock = product.totalStock > 0;
  product.status =
    product.status === 'DISCONTINUED'
      ? 'DISCONTINUED'
      : product.totalStock > 0
        ? 'ACTIVE'
        : 'SOLD_OUT';
};

const syncSummary = (product: ProductDetail) => {
  const summary = mockProductSummaries.find((p) => p.id === product.id);
  if (!summary) return;
  summary.name = product.name;
  summary.price = product.price;
  summary.currency = product.currency;
  summary.mainImageUrl = product.mainImageUrl;
  summary.categoryName = product.category.name;
  summary.status = product.status;
  summary.inStock = product.inStock;
  summary.totalStock = product.totalStock;
};

// ─────────────────────────────────────────────────────────────
// Product
// ─────────────────────────────────────────────────────────────

export function createProduct(input: ProductCreateRequest): ProductDetail {
  const category = findCategoryById(input.categoryId) ?? mockCategories[0];
  const id =
    mockProductDetails.reduce((max, p) => Math.max(max, p.id), 0) + PRODUCT_ID_STEP;

  const product: ProductDetail = {
    id,
    name: input.name,
    price: input.price,
    currency: input.currency,
    description: input.description,
    mainImageUrl: input.mainImageUrl,
    category,
    status: 'SOLD_OUT',
    inStock: false,
    totalStock: 0,
    skus: [],
    createdAt: new Date().toISOString(),
  };
  mockProductDetails.push(product);
  mockProductSummaries.push({
    id: product.id,
    name: product.name,
    price: product.price,
    currency: product.currency,
    mainImageUrl: product.mainImageUrl,
    categoryName: category.name,
    status: product.status,
    inStock: product.inStock,
    totalStock: product.totalStock,
  });
  return product;
}

export function updateProduct(id: number, input: ProductUpdateRequest) {
  const product = mockProductDetails.find((p) => p.id === id);
  if (!product) return undefined;
  if (input.name !== undefined) product.name = input.name;
  if (input.price !== undefined) product.price = input.price;
  if (input.currency !== undefined) product.currency = input.currency;
  if (input.description !== undefined) product.description = input.description;
  if (input.mainImageUrl !== undefined) product.mainImageUrl = input.mainImageUrl;
  if (input.categoryId !== undefined) {
    const c = findCategoryById(input.categoryId);
    if (c) product.category = c;
  }
  syncSummary(product);
  return product;
}

export function discontinueProduct(id: number): boolean {
  const product = mockProductDetails.find((p) => p.id === id);
  if (!product) return false;
  product.status = 'DISCONTINUED';
  product.inStock = false;
  syncSummary(product);
  return true;
}

// ─────────────────────────────────────────────────────────────
// SKU
// ─────────────────────────────────────────────────────────────

export function addSku(productId: number, input: AddSkuRequest): Sku | undefined {
  const product = mockProductDetails.find((p) => p.id === productId);
  if (!product) return undefined;
  const skuId =
    product.skus.reduce((max, s) => Math.max(max, s.skuId), productId * 100) +
    SKU_ID_STEP;
  const valuePart = input.options.map((o) => o.value).join('-');
  const sku: Sku = {
    skuId,
    skuCode: `SKU-${product.id}-${valuePart || 'DEFAULT'}`,
    options: input.options,
    stock: input.initialStock,
    inStock: input.initialStock > 0,
  };
  product.skus.push(sku);
  recomputeStock(product);
  syncSummary(product);
  return sku;
}

export function removeSku(productId: number, skuId: number): boolean {
  const product = mockProductDetails.find((p) => p.id === productId);
  if (!product) return false;
  const before = product.skus.length;
  product.skus = product.skus.filter((s) => s.skuId !== skuId);
  if (product.skus.length === before) return false;
  recomputeStock(product);
  syncSummary(product);
  return true;
}

type AdjustResult = { product: ProductDetail; sku: Sku } | undefined;

const adjust = (
  productId: number,
  skuId: number,
  delta: number,
): AdjustResult => {
  const product = mockProductDetails.find((p) => p.id === productId);
  if (!product) return undefined;
  const sku = product.skus.find((s) => s.skuId === skuId);
  if (!sku) return undefined;
  sku.stock = Math.max(0, sku.stock + delta);
  sku.inStock = sku.stock > 0;
  recomputeStock(product);
  syncSummary(product);
  return { product, sku };
};

export function increaseSkuStock(
  productId: number,
  skuId: number,
  input: AdjustStockRequest,
): AdjustResult {
  return adjust(productId, skuId, input.quantity);
}

export function decreaseSkuStock(
  productId: number,
  skuId: number,
  input: AdjustStockRequest,
): AdjustResult {
  return adjust(productId, skuId, -input.quantity);
}

// ─────────────────────────────────────────────────────────────
// Category
// ─────────────────────────────────────────────────────────────

export function createCategory(input: CategoryCreateRequest): Category {
  const id = mockCategories.reduce((max, c) => Math.max(max, c.id), 0) + 1;
  const category: Category = { id, name: input.name, slug: input.slug };
  mockCategories.push(category);
  return category;
}

export function updateCategory(id: number, input: CategoryUpdateRequest) {
  const category = mockCategories.find((c) => c.id === id);
  if (!category) return undefined;
  if (input.name !== undefined) category.name = input.name;
  if (input.slug !== undefined) category.slug = input.slug;
  return category;
}
