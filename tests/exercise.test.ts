import {
  MenuItem,
  itemTotal,
  regularPrice,
  happyHourPrice,
  printPrice,
  FoodItem,
  Merch,
  itemPrice,
  readQuantity,
  HotDrink,
  isBaristaNeeded,
  processingOrder,
  DrinkItem,
  OrderItem,
  GiftDelivery,
  isDrink,
  describeOrder,
  Order,
  contactLine,
  addToOrder,
  isOrderItem,
  GiftCardItem,
} from "../exercise";

const latte: MenuItem = { id: "D1", name: "Latte", price: 4.25 };

const iceTea: MenuItem = {
  id: "D2",
  name: "Ice tea",
  price: 3.1,
  extras: ["soyMilk", "whippingCream"],
};

const omelete: FoodItem = {
  kind: "food",
  name: "omelete",
  price: 5,
  heated: true,
};

const tshirt: Merch = {
  kind: "merch",
  price: 12.5,
};

const espresso: HotDrink = {
  id: "D1",
  name: "Espresso",
  price: 3.0,
  size: "small",
  hasMilk: false,
};

const orangeJuice: DrinkItem = {
  kind: "drink",
  name: "orange juice",
  size: "medium",
};

const orders: OrderItem[] = [omelete, orangeJuice, tshirt];

const order001: GiftDelivery = {
  id: "001",
  items: orders,
  status: "preparing",
  address: "Granville St, 978",
  deliveryFee: 2.5,
  wrapped: true,
};

const order2: Order = {
  id: "002",
  items: orders,
  status: "preparing",
};

const order3: Order = {
  id: "002",
  items: orders,
  status: "preparing",
  customer: { name: "Ana", contact: { email: "ana@email.com" } },
};

const strawberryMilk: DrinkItem = {
  kind: "drink",
  name: "strawberry milk",
  size: "large",
  extras: ["whippingCream"],
};

const text = '{"kind":"drink","name":"Mocha"}'; // size is missing
const fromWebsite: unknown = JSON.parse(text);
const item = fromWebsite as DrinkItem;

const switchCard: GiftCardItem = {
  kind: "giftCard",
  amount: 100,
};

describe("Step 0", () => {
  test("Return price for 2 latte without discount", () => {
    expect(itemTotal(latte, 2)).toBe(8.5);
  });

  test("Return price for 2 latte with discount", () => {
    expect(itemTotal(latte, 2, 0.2)).toBe(6.800000000000001);
  });

  test("Print latte regular price", () => {
    expect(printPrice(latte, regularPrice)).toBe(4.25);
  });

  test("Print latte happy hour price", () => {
    expect(printPrice(latte, happyHourPrice)).toBe(3.25);
  });

  test("Return price for 1 ice tea with extras and without discount", () => {
    expect(itemTotal(iceTea, 1)).toBe(7.199999999999999);
  });

  test("Return price for 1 omelete", () => {
    expect(itemPrice(omelete)).toBe(5);
  });

  test("Return price for 1 t-shirt", () => {
    expect(itemPrice(tshirt)).toBe(12.5);
  });

  test("Return a numeric quantity when input is a number", () => {
    expect(readQuantity(3)).toBe(3);
  });

  test("Return a numeric quantity when input is a string", () => {
    expect(readQuantity("4")).toBe(4);
  });

  test("Return NaN when input is a invalid string", () => {
    expect(readQuantity("ola")).toBe(NaN);
  });

  test("Return false when barist is not needed", () => {
    expect(isBaristaNeeded(iceTea)).toBe(false);
  });

  test("Return true when barist is needed", () => {
    expect(isBaristaNeeded(espresso)).toBe(true);
  });

  test("Return error when id is invalid", () => {
    expect(() => {
      processingOrder("");
    }).toThrow("Invalid id");
  });

  test("Return only DrinkItem from orders", () => {
    expect(orders.filter((order) => isDrink(order))).toEqual([
      { kind: "drink", name: "orange juice", size: "medium" },
    ]);
  });

  test("Describe order", () => {
    expect(describeOrder(order001)).toEqual(
      "Order 001: 3 items to be delivered to Granville St, 978",
    );
  });

  test("Return no contact info when there is no email or phone", () => {
    expect(contactLine(order2)).toBe("no contact saved");
  });

  test("Return contact info when there email and/or phone", () => {
    expect(contactLine(order3)).toBe("ana@email.com");
  });

  test("Return extras from drink item", () => {
    expect(strawberryMilk.extras?.[0]).toBe("whippingCream");
  });

  test("Return order list with one order", () => {
    expect(addToOrder(omelete)).toEqual({
      lineId: "LINE-1",
      item: { kind: "food", name: "omelete", price: 5, heated: true },
      price: 5,
    });
  });

  test("Return order list with more than one order", () => {
    expect(addToOrder([orangeJuice, tshirt])).toEqual([
      {
        lineId: "LINE-2",
        item: { kind: "drink", name: "orange juice", size: "medium" },
        price: 3,
      },
      {
        lineId: "LINE-3",
        item: { kind: "merch", price: 12.5 },
        price: 12.5,
      },
    ]);
  });

  test("Return false from website item when it is null", () => {
    expect(isOrderItem(null)).toBe(false);
  });

  test("Return false from website item when it is empty", () => {
    expect(isOrderItem("")).toBe(false);
  });

  test("Return false from website item when it is undefined", () => {
    expect(isOrderItem(undefined)).toBe(false);
  });

  test("Return false from website item when it is string", () => {
    expect(isOrderItem("hello")).toBe(false);
  });

  test("Return false from website item when it is number", () => {
    expect(isOrderItem(123)).toBe(false);
  });

  test("Return false from website item when it is boolean", () => {
    expect(isOrderItem(true)).toBe(false);
  });

  test("Return true from website item when it has kind = drink", () => {
    expect(isOrderItem(item)).toEqual(true);
  });

  test("Return true from website item when it has kind = food", () => {
    expect(isOrderItem(omelete)).toEqual(true);
  });

  test("Return true from website item when it has kind = giftCard", () => {
    expect(isOrderItem(switchCard)).toEqual(true);
  });

  test("Return true from website item when it has kind = merch", () => {
    expect(isOrderItem(tshirt)).toEqual(true);
  });
});
