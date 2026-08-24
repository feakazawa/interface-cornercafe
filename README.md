# Exercise

# Corner Café — Order App

The café next to campus wants an app for taking orders. Right now the staff write everything on paper, and the paper gets wet. You have been asked to build the part of the app that keeps track of orders and works out the price.

Features:

Here is a list of features that our code needs to support:

- Show the price of an item, with an optional discount
- Handle different kinds of items (drinks, food, gift cards) that are priced in different ways
- Handle extras like oat milk or an extra shot, and let the café add new extras without changing the code
- Add one item or a whole list of items to an order, using the same function
- Read customer contact details safely, even when they are missing
- Accept orders from the café website, which arrive as text and cannot be trusted

The features are the easy part. The interesting part is describing all of this in the type system, so that broken code fails to build instead of charging someone $0.00 for a gift card.

## Setup

```bash
mkdir corner-cafe && cd corner-cafe
tsc --init
touch exercise.ts
tsc --watch
```

In a separate terminal:

```bash
node exercise.js --watch
```

Open `tsconfig.json` and make sure this option is on:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noEmitOnError": true
  }
}
```

> Note: Several steps only work correctly with `strict` turned on. If the compiler never warns you about `undefined`, check this setting first.

Here is the current state of the application logic:

```ts
type MenuItem = {
  id: string;
  name: string;
  price: number;
};

function itemTotal(item: MenuItem, quantity: number): number {
  return item.price * quantity;
}

const latte: MenuItem = { id: "D1", name: "Latte", price: 4.25 };

console.log("Item:", latte);
console.log("Total for 2:", itemTotal(latte, 2).toFixed(2));
```

> Note: Read the code before you run it. You should be able to explain not only what it prints, but why TypeScript accepts it. Here is a question to think about: what happens if you delete `: MenuItem` from the `latte` line?

You should get the following output:

```bash
Item: { id: 'D1', name: 'Latte', price: 4.25 }
Total for 2: 8.50
```

## Step 1: Types vs Interfaces

`MenuItem` is a type alias. That works for now. But this app will grow, and we will want shapes that other shapes can build on. This is the usual moment when you have to choose between `type` and `interface`.

### Instructions

- Change `MenuItem` from a type alias into an `interface`.
- Create a `type` alias called `Size` that can only be `"small"`, `"medium"`, or `"large"`.
- Create a `type` alias called `OrderStatus` that can only be `"new"`, `"making"`, `"ready"`, or `"picked-up"`.
- Create an interface `HotDrink` that **extends** `MenuItem` and adds `size` (a `Size`) and `hasMilk` (a boolean).

```ts
// Add this code to test your work
const espresso: HotDrink = {
  id: "D1",
  name: "Espresso",
  price: 3.0,
  size: "small",
  hasMilk: false,
};

console.log("Drink:", espresso);
```

- Try to give `size` the value `"extra-large"`. Read the error message.

> Question: write your answer in a comment at the top of your file. Why is it **not possible** to write `Size` as an interface? And why _is_ it possible to write `MenuItem` as either one?

## Step 2: Optional Properties and Optional Parameters

Not every item has a note from the customer, and not every order has a discount. Right now our code forces us to provide everything.

### Instructions

- Add two **optional properties** to `MenuItem`: `notes` (a string) and `vegetarian` (a boolean).
- Add an **optional parameter** called `discount` to `itemTotal`.
- For now, check for the missing value the long way:

```ts
function itemTotal(
  item: MenuItem,
  quantity: number,
  discount?: number,
): number {
  const rate = discount === undefined ? 0 : discount;
  return item.price * quantity * (1 - rate);
}
```

- Show that both ways of calling it work:

```ts
console.log("No discount:", itemTotal(latte, 2).toFixed(2));
console.log("20% off:", itemTotal(latte, 2, 0.2).toFixed(2));
```

> Note: We will delete that `=== undefined` check in Step 8. Leave it there for now. You need to feel the problem before the solution is useful.

## Step 3: Interfaces as Function Types

The café keeps changing its prices. Mornings are cheaper, students get a discount, and the owner keeps inventing new deals. We do not want one fixed price function. We want our code to accept **any** function that can work out a price.

### Instructions

- Write an interface that describes the **shape of a price function**:

```ts
interface PriceRule {
  (item: OrderItem, discount?: number): number;
}
```

(You will create the `OrderItem` type in Step 5. For now you can use `MenuItem` and change it later.)

- Write a function called `regularPrice` that matches `PriceRule`.
- Write a second function called `happyHourPrice` that also matches `PriceRule` but takes $1.00 off drinks.
- Write a function `printPrice(item, rule, discount?)` that prints the result, and call it with both price functions.

> Question: TypeScript accepts `happyHourPrice` as a `PriceRule`, but you never wrote the word `implements` anywhere. What is this behaviour called, and why is it useful here?

## Step 4: Index Properties

Customers can add extras to a drink: oat milk, an extra shot, vanilla syrup. The café wants to add new extras and change their prices without asking a developer for help.

### Instructions

- Create an interface with an **index signature**:

```ts
interface ExtraPrices {
  [extraName: string]: number;
}
```

- Build an `extraPrices` object with a few extras and their prices.
- Add an optional `extras` property (a list of strings) to your drink type, and add the cost of each extra to the price.
- Now look up an extra that does not exist, such as `extraPrices["honey"]`, and see what you get.

> Tip: TypeScript will tell you that `extraPrices["honey"]` is a `number`, but at runtime it is `undefined`, and your total becomes `NaN`. Find the compiler option called `noUncheckedIndexedAccess`, turn it on, and write a comment explaining what changed. This is one of the easiest ways to get a wrong number in a real app.

## Step 5: Discriminated Unions

A café does not sell only drinks. It also sells food and gift cards, and the price is worked out differently for each one. We could use one big interface full of optional properties, but then we could build items that make no sense, such as food with a cup size and no price.

### Instructions

- Write three interfaces. Each one has a property called `kind` with a **fixed text value**:

```ts
interface DrinkItem {
  kind: "drink";
  name: string;
  size: Size;
  extras?: string[];
}

interface FoodItem {
  kind: "food";
  name: string;
  price: number;
  heated: boolean;
}

interface GiftCardItem {
  kind: "giftCard";
  amount: number;
}
```

- Join them into one type called `OrderItem`.
- Write `itemPrice(item: OrderItem): number` using a `switch` on `item.kind`. Notice that inside each `case`, TypeScript already knows exactly which interface you are holding. You do not need to cast anything.
- Add an **exhaustiveness check** in the `default` branch:

```ts
default: {
  const notPossible: never = item;
  return notPossible;
}
```

- Now add a fourth kind of item to the union (a `"merch"` item, for café t-shirts) and **do not** update `itemPrice`. Read the error message carefully, then fix it.

> Note: That `never` trick is the most useful idea in this exercise. It turns "somebody forgot to update the switch" from a bug your customers find into an error the compiler finds.

## Step 6: Type Guards

A `switch` is not always enough. Sometimes you receive a value and you have to work out for yourself what it is.

### Instructions

Write and test all four kinds of narrowing:

- **`typeof` check** — write `readQuantity(input: string | number): number` that turns the text into a number when needed.
- **`in` check** — write a function that takes a `MenuItem | HotDrink` and returns whether a barista is needed, using `"size" in item`.
- **`instanceof` check** — create `class OrderError extends Error` with an extra `orderId` property, then write a `catch` block that prints the order id only when the error is an `OrderError`.
- **Custom type guard** — write this function:

```ts
function isDrink(item: OrderItem): item is DrinkItem {
  return item.kind === "drink";
}
```

- Use `isDrink` with `filter` on a list of order items, and check that the result is typed as `DrinkItem[]` and not `OrderItem[]`.

> Question: what happens to the type of the filtered list if you change the return type of `isDrink` from `item is DrinkItem` to just `boolean`? Why is the longer version worth writing?

## Step 7: Intersection Types

Some orders are delivered. Some are gifts. Some are both. Instead of writing a new interface for every combination (`DeliveredOrder`, `GiftOrder`, `DeliveredGiftOrder`, and so on forever), we combine small pieces.

### Instructions

- Write two small types:

```ts
type Delivered = {
  address: string;
  deliveryFee: number;
};

type Gift = {
  wrapped: boolean;
  message?: string;
};
```

- Create an `Order` interface with `id`, `items` (a list of `OrderItem`), and `status`.
- Create `type GiftDelivery = Order & Delivered & Gift`.
- Build a `GiftDelivery` object and check that the compiler asks for the properties from all three types.
- Write `describeOrder(order: Order | GiftDelivery): string` that includes the address when there is one.

> Question: `Order` is an interface and `Delivered` is a type alias, but `&` joined them with no complaint. Explain what an intersection type gives you, and why it is **not** the same as `interface GiftDelivery extends Order`.

## Step 8: Optional Chaining and Nullish Coalescing

Customer records are messy. Some customers gave us a phone number, some gave us an email, and some gave us nothing. Without help, our code would be full of `&&` checks.

### Instructions

- Add this type to your app, and add an optional `customer` property to `Order`:

```ts
interface Customer {
  name: string;
  contact?: {
    email?: string;
    phone?: string;
    sendReadyMessage?: () => void;
  };
}
```

- Write `contactLine(order: Order): string` that returns the phone number, or the email if there is no phone, or `"no contact saved"` if there is neither. Use **optional chaining** and **nullish coalescing** only. Do not use `if`.
- Call the optional function safely with `order.customer?.contact?.sendReadyMessage?.()`.
- Read the first extra of a drink with `drink.extras?.[0]`.
- Go back to Step 2 and replace `discount === undefined ? 0 : discount` with `discount ?? 0`.

> Tip: now try `discount || 0` instead, and call your function with a discount of `0`. Write a comment explaining the difference between `??` and `||`. This difference causes a lot of real bugs, and it is a very common interview question.

## Step 9: Function Overloads

Staff should be able to add one item or a whole tray of items, and they should not have to think about which function to call. We could return `OrderLine | OrderLine[]`, but then everybody who calls our function has to check the result first, which is annoying.

### Instructions

- Create an `OrderLine` interface with `lineId`, `item`, and `price`.
- Write `addToOrder` with two **overload signatures** and one implementation:

```ts
function addToOrder(item: OrderItem): OrderLine;
function addToOrder(items: OrderItem[]): OrderLine[];
function addToOrder(input: OrderItem | OrderItem[]): OrderLine | OrderLine[] {
  // your code here
}
```

- Check that `addToOrder(latte)` gives you one `OrderLine` with no extra checking, and `addToOrder([latte, sandwich])` gives you an `OrderLine[]`.

> Note: the third line (the implementation) cannot be called from outside. Only the two lines above it are visible to other code. Try calling `addToOrder(latte).length` and read the error.

## Step 10: Type Casting

The café website sends us orders as text. `JSON.parse` returns `any`, which means TypeScript stops protecting you.

### Instructions

- Add this to your code:

```ts
const text = '{"kind":"drink","name":"Mocha"}'; // size is missing
const fromWebsite: unknown = JSON.parse(text);
```

- First do it the lazy way: `const item = fromWebsite as DrinkItem;`. Then use it and watch the code build perfectly and break at runtime.
- Now do it properly. Write a type guard `isOrderItem(value: unknown): value is OrderItem` that really checks the data while the program is running, and use it before you trust the item.

> Note: a cast is you telling the compiler "trust me". A type guard is you giving the compiler a reason to trust you. Choose the second one whenever you can.

## Extra Practice (optional after tomorrow's lecture)

Only after everything above builds and runs:

- Replace the `ExtraPrices` index signature with `Record<string, number>` and describe what changed.
- Make `Order` impossible to change after it is paid for by using `readonly` properties, and see what breaks.
- Write a `Result<T>` type (`{ ok: true; value: T } | { ok: false; error: string }`) and use it for an order that might fail, instead of throwing an error.

> Final note: a good rule for this whole exercise. If you find yourself writing `any`, or adding a cast to make a red line disappear, stop and ask what the compiler was trying to tell you. It is usually right.
