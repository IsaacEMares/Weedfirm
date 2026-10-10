export interface Plant {
  wateredAt: number | null;
  ready: boolean;
}
export interface Order {
  id: number;
  name: string;
  amount: number;
  price: number;
  status: "pending" | "accepted" | "declined" | "completed";
}
export interface GameState {
  version: number;
  cash: number;
  seeds: number;
  stock: number;
  sales: number;
  slots: (Plant | null)[];
  orders: Order[];
  nextOrder: number;
  serial: number;
}
export const GROW_TIME = 45000;
export const SEED_PACKS = [
  { id: 1, name: "Single seed", quantity: 1, price: 8, label: "Try it out" },
  { id: 3, name: "Starter pack", quantity: 3, price: 21, label: "Save $3" },
  { id: 5, name: "Grower pack", quantity: 5, price: 32, label: "Save $8" },
] as const;
export function freshGame(now = Date.now()): GameState {
  return {
    version: 1,
    cash: 40,
    seeds: 2,
    stock: 0,
    sales: 0,
    slots: [null],
    orders: [],
    nextOrder: now + 8000,
    serial: 0,
  };
}
export function tick(state: GameState, now: number) {
  for (const plant of state.slots) {
    if (plant && plant.wateredAt !== null && now - plant.wateredAt >= GROW_TIME)
      plant.ready = true;
  }
  if (
    now >= state.nextOrder &&
    state.orders.filter(
      (o) => o.status === "pending" || o.status === "accepted",
    ).length < 3
  ) {
    const names = ["Jay", "Sam", "Alex"];
    state.orders.push({
      id: ++state.serial,
      name: names[(state.serial - 1) % names.length],
      amount: 1 + (state.serial % 2),
      price: 18,
      status: "pending",
    });
    state.orders = state.orders.slice(-12);
    state.nextOrder = now + 25000;
  }
}
export function act(
  state: GameState,
  action: string,
  id: number = -1,
  now = Date.now(),
) {
  const plant = state.slots[id];
  if (
    action === "plant" &&
    id >= 0 &&
    id < state.slots.length &&
    !plant &&
    state.seeds > 0
  ) {
    state.seeds--;
    state.slots[id] = { wateredAt: null, ready: false };
    return "Seed planted. Give it some water.";
  }
  if (action === "water" && plant && plant.wateredAt === null) {
    plant.wateredAt = now;
    return "Watered. Your plant is growing.";
  }
  if (action === "harvest" && plant?.ready) {
    state.stock += 3;
    state.slots[id] = null;
    return "Harvested 3 units.";
  }
  if (action === "seed") {
    const pack = SEED_PACKS.find((pack) => pack.id === id);
    if (!pack) return "Choose a seed pack from the supplier.";
    if (state.cash < pack.price) return "Not enough cash for that seed pack.";
    state.cash -= pack.price;
    state.seeds += pack.quantity;
    return `Bought ${pack.quantity} ${pack.quantity === 1 ? "seed" : "seeds"} from Nora for $${pack.price}. Added to your inventory.`;
  }
  if (action === "upgrade" && state.slots.length === 1 && state.cash >= 60) {
    state.cash -= 60;
    state.slots.push(null);
    return "Second growing slot unlocked.";
  }
  const order = state.orders.find((o) => o.id === id);
  if (action === "accept" && order?.status === "pending") {
    order.status = "accepted";
    return "Order accepted. Fulfill it when your harvest is ready.";
  }
  if (action === "decline" && order?.status === "pending") {
    order.status = "declined";
    return "Order declined.";
  }
  if (
    action === "sell" &&
    order?.status === "accepted" &&
    state.stock >= order.amount
  ) {
    state.stock -= order.amount;
    state.cash += order.amount * order.price;
    state.sales++;
    order.status = "completed";
    return `Order completed. Earned $${order.amount * order.price}.`;
  }
  return "That action is unavailable right now.";
}
