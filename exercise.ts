// ----- Interfaces

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  notes?: string;
  vegetarian?: boolean;
  extras?: string[];
}

export interface HotDrink extends MenuItem {
  size: Size;
  hasMilk: boolean;
}

interface PriceRule {
  (item: MenuItem, discount?: number | null, extras?: string[]): number;
}

interface ExtraPrices {
  [extraName: string]: number;
}

export interface DrinkItem {
  kind: "drink";
  name: string;
  size: Size;
  extras?: string[];
}

export interface FoodItem {
  kind: "food";
  name: string;
  price: number;
  heated: boolean;
}

export interface GiftCardItem {
  kind: "giftCard";
  amount: number;
}

export interface Merch {
  kind: "merch";
  price: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  status: string;
  customer?: Customer;
}

interface Customer {
  name: string;
  contact?: {
    email?: string;
    phone?: string;
    sendReadyMessage?: () => void;
  };
}

interface OrderLine {
  lineId: string;
  item: OrderItem;
  price: number;
}

// ----- Types

type Size = "small" | "medium" | "large";
type OrderStatus = "new" | "making" | "ready" | "pickedUp";
export type OrderItem = DrinkItem | FoodItem | GiftCardItem | Merch;

type Delivered = {
  address: string;
  deliveryFee: number;
};

type Gift = {
  wrapped: boolean;
  message?: string;
};

export type GiftDelivery = Order & Delivered & Gift;

// ----- Functions

export const regularPrice: PriceRule = (item) => {
  return item.price;
};

export const happyHourPrice: PriceRule = (item) => {
  return item.price - 1;
};

export const printPrice = (
  item: MenuItem,
  rule: PriceRule,
  discount?: number,
): number => {
  return rule(item);
};

export function itemTotal(
  item: MenuItem,
  quantity: number,
  discount?: number,
): number {
  const rate = discount ?? 0;
  const extrasPrice = !item.extras
    ? 0
    : item.extras?.reduce((acc, extra) => {
        if (extra in extraItems) {
          return (acc += extraItems[extra]!);
        }
        return acc;
      }, 0);

  const itemWithExtras = item.price + extrasPrice;
  return itemWithExtras * quantity * (1 - rate);
}

export const itemPrice = (item: OrderItem): number => {
  switch (item.kind) {
    case "drink":
      return item.size === "small" ? 2 : item.size === "medium" ? 3 : 4;
    case "food":
      return item.price;
    case "giftCard":
      return item.amount;
    case "merch":
      return item.price;
    default: {
      const notPossible: never = item;
      return notPossible;
    }
  }
};

export const readQuantity = (input: string | number): number => {
  if (typeof input === "string") {
    return +input; // + before string: try to convert a string to a number
  }
  return input;
};

export const isBaristaNeeded = (item: MenuItem | HotDrink): boolean => {
  if ("size" in item) {
    return true;
  }

  return false;
};

export function processingOrder(id: string): string {
  if (!id) {
    throw new OrderError("Invalid id", id);
  }

  return `${id} ready`;
}

export function isDrink(item: OrderItem): item is DrinkItem {
  return item.kind === "drink";
}

export function describeOrder(order: GiftDelivery): string {
  return `Order ${order.id}: ${order.items.length} items to be delivered to ${order.address}`;
}

export const contactLine = (order: Order): string => {
  return (
    order.customer?.contact?.email ??
    order.customer?.contact?.phone ??
    "no contact saved"
  );
};

export const createOrderLine = (item: OrderItem): OrderLine => {
  const price = itemPrice(item);
  const lineId = nextLineId();
  return { lineId, item, price };
};

export const nextLineId = (() => {
  let lineCount = 0;
  return () => {
    lineCount += 1;
    return `LINE-${lineCount}`;
  };
})();

export function addToOrder(item: OrderItem): OrderLine;
export function addToOrder(items: OrderItem[]): OrderLine[];
export function addToOrder(
  input: OrderItem | OrderItem[],
): OrderLine | OrderLine[] {
  if (Array.isArray(input)) {
    return input.map(createOrderLine);
  }
  return createOrderLine(input as OrderItem);
}

export function isOrderItem(value: unknown): value is OrderItem {
  if (typeof value !== "object" || !value) {
    return false;
  }

  return (
    "kind" in value &&
    typeof (value as { kind: unknown }).kind === "string" &&
    ["drink", "food", "giftCard", "merch"].includes(
      (value as { kind: string }).kind,
    )
  );
}

// ----- Class
class OrderError extends Error {
  orderId: string;

  constructor(message: string, orderId: string) {
    super(message);
    this.orderId = orderId;
  }
}

// ----- Remaining code

const extraItems: ExtraPrices = {
  oatMilk: 2.5,
  soyMilk: 1.1,
  vanillaSyrup: 1.2,
  whippingCream: 3,
};
