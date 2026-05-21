// 발주 / 입고 이력 in-memory 상태.
// 백엔드 동작을 흉내내기 위해 핸들러가 직접 이 상태를 변경.
import type {
  CreatePurchaseOrderRequest,
  PurchaseOrderListItem,
  PurchaseOrderRef,
  ReceiveHistory,
} from '@/types/api';

const todayISO = () => new Date().toISOString();
const dateOnly = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

const generateNumber = () =>
  `PO-${new Date().getFullYear()}${String(Date.now()).slice(-7)}`;

export const purchaseOrderState = {
  orders: [
    {
      purchaseOrderId: 1,
      purchaseOrderNumber: 'PO-2026000001',
      skuId: 101,
      quantity: 30,
      supplierName: '신선상사',
      expectedAt: dateOnly(3),
      status: 'REQUESTED',
      createdAt: todayISO(),
    },
    {
      purchaseOrderId: 2,
      purchaseOrderNumber: 'PO-2026000002',
      skuId: 301,
      quantity: 50,
      supplierName: '커피팩토리',
      expectedAt: dateOnly(-2),
      status: 'RECEIVED',
      createdAt: todayISO(),
    },
  ] as PurchaseOrderListItem[],
  histories: [
    {
      stockHistoryId: 1,
      skuId: 301,
      purchaseOrderId: 2,
      receivedQuantity: 50,
      stockAfter: 57,
      createdAt: todayISO(),
    },
  ] as ReceiveHistory[],
  // sku → current stock (간략 가정)
  stockBySku: new Map<number, number>([
    [101, 42],
    [201, 18],
    [301, 57],
    [401, 0],
    [501, 120],
  ]),
  nextPoId: 100,
  nextHistoryId: 100,
};

export function snapshotPurchaseOrders() {
  return [...purchaseOrderState.orders].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export function snapshotReceiveHistories() {
  return [...purchaseOrderState.histories].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export function createPurchaseOrder(
  input: CreatePurchaseOrderRequest,
): PurchaseOrderRef {
  const id = purchaseOrderState.nextPoId++;
  const item: PurchaseOrderListItem = {
    purchaseOrderId: id,
    purchaseOrderNumber: generateNumber(),
    skuId: input.skuId,
    quantity: input.quantity,
    supplierName: input.supplierName,
    expectedAt: input.expectedAt,
    status: 'REQUESTED',
    createdAt: todayISO(),
  };
  purchaseOrderState.orders.unshift(item);
  return {
    purchaseOrderId: item.purchaseOrderId,
    purchaseOrderNumber: item.purchaseOrderNumber,
  };
}

export function findPurchaseOrder(id: number) {
  return purchaseOrderState.orders.find((o) => o.purchaseOrderId === id);
}

export function findHistory(id: number) {
  return purchaseOrderState.histories.find((h) => h.stockHistoryId === id);
}

export function receiveStock(
  purchaseOrderId: number,
  receivedQuantity?: number,
) {
  const po = findPurchaseOrder(purchaseOrderId);
  if (!po) return undefined;
  const qty = receivedQuantity ?? po.quantity;
  const prevStock = purchaseOrderState.stockBySku.get(po.skuId) ?? 0;
  const newStock = prevStock + qty;
  purchaseOrderState.stockBySku.set(po.skuId, newStock);
  po.status = 'RECEIVED';

  const history: ReceiveHistory = {
    stockHistoryId: purchaseOrderState.nextHistoryId++,
    skuId: po.skuId,
    purchaseOrderId,
    receivedQuantity: qty,
    stockAfter: newStock,
    createdAt: todayISO(),
  };
  purchaseOrderState.histories.unshift(history);
  return { history, po, currentStock: newStock };
}

export function adjustReceive(
  historyId: number,
  receivedQuantity: number | undefined,
  reason: string,
) {
  const history = findHistory(historyId);
  if (!history) return undefined;
  const originalQty = history.receivedQuantity;
  const target = receivedQuantity ?? originalQty;
  const delta = target - originalQty;
  const prev = purchaseOrderState.stockBySku.get(history.skuId) ?? 0;
  const newStock = prev + delta;
  purchaseOrderState.stockBySku.set(history.skuId, newStock);
  history.receivedQuantity = target;
  history.stockAfter = newStock;
  return { history, originalQty, newStock, reason };
}

export function cancelReceive(historyId: number) {
  const history = findHistory(historyId);
  if (!history) return undefined;
  const cancelledQty = history.receivedQuantity;
  const prev = purchaseOrderState.stockBySku.get(history.skuId) ?? 0;
  const newStock = Math.max(0, prev - cancelledQty);
  purchaseOrderState.stockBySku.set(history.skuId, newStock);
  // 해당 PO 상태 원복
  const po = findPurchaseOrder(history.purchaseOrderId);
  if (po) po.status = 'CANCELLED';
  // 이력 제거
  purchaseOrderState.histories = purchaseOrderState.histories.filter(
    (h) => h.stockHistoryId !== historyId,
  );
  return { history, cancelledQty, newStock, poStatus: po?.status ?? 'CANCELLED' };
}
