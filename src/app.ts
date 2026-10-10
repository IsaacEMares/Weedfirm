import { freshGame, tick, act, GROW_TIME } from "./game";
import type { GameState } from "./game";
const $ = <T extends HTMLElement = HTMLElement>(selector: string): T =>
  document.querySelector<T>(selector)!;
const KEY = "apartment20-save-v1";
let state: GameState;
try {
  const saved = JSON.parse(localStorage.getItem(KEY) || "null");
  state =
    saved?.version === 1 &&
    Array.isArray(saved.slots) &&
    Array.isArray(saved.orders)
      ? saved
      : freshGame();
} catch {
  state = freshGame();
}
let saveWarning = false;
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    if (!saveWarning) {
      $("#notice").textContent =
        "Browser storage unavailable. Progress lasts for this session only.";
      saveWarning = true;
    }
  }
}
const rendered = new Map<string, string>();
function html(selector: string, markup: string) {
  const element = $(selector);
  if (rendered.get(selector) !== markup) {
    element.innerHTML = markup;
    rendered.set(selector, markup);
  }
}
function render() {
  const focused = document.activeElement as HTMLButtonElement | null;
  const focusAction = focused?.dataset.action;
  const focusId = focused?.dataset.id;
  html(
    "#stats",
    [
      ["BALANCE", `$${state.cash}`],
      ["SEEDS", state.seeds],
      ["INVENTORY", `${state.stock} units`],
      ["COMPLETED", state.sales],
    ]
      .map(([k, v]) => `<div><span>${k}</span><strong>${v}</strong></div>`)
      .join(""),
  );
  html(
    "#plants",
    state.slots
      .map((p, i) => {
        const progress =
          p?.wateredAt != null
            ? Math.min(
                100,
                Math.floor(((Date.now() - p.wateredAt) / GROW_TIME) * 100),
              )
            : 0;
        const action = !p
          ? "plant"
          : p.ready
            ? "harvest"
            : p.wateredAt === null
              ? "water"
              : null;
        return `<article class="plant"><div class="plant-icon ${!p ? "empty" : p.ready ? "ready" : "growing"}"><div class="stalk"><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="pot"></div></div><div><span class="eyebrow">SLOT ${i + 1}</span><h3>${!p ? "Empty pot" : p.ready ? "Ready to harvest" : p.wateredAt === null ? "Needs water" : "Growing"}</h3><p>${!p ? "One seed gets you started." : p.ready ? "Collect 3 inventory units." : p.wateredAt === null ? "Water to start the timer." : `${progress}% · ${Math.max(0, Math.ceil((GROW_TIME - (Date.now() - p.wateredAt)) / 1000))}s remaining`}</p><progress value="${progress}" max="100" aria-label="Growth progress"></progress></div><button data-action="${action || ""}" data-id="${i}" ${!action || (action === "plant" && state.seeds === 0) ? "disabled" : ""}>${action === "plant" ? "Plant seed" : action === "water" ? "Water" : action === "harvest" ? "Harvest" : "Growing…"}</button></article>`;
      })
      .join(""),
  );
  $<HTMLButtonElement>("#seed").disabled = state.cash < 8;
  $<HTMLButtonElement>("#upgrade").disabled =
    state.cash < 60 || state.slots.length > 1;
  $("#upgrade").textContent =
    state.slots.length > 1 ? "Second slot unlocked ✓" : "Second slot · $60";
  $("#goal").textContent =
    state.slots.length > 1 && state.sales >= 5
      ? "Stage 1 milestone complete! Keep building your sandbox."
      : `Stage 1 goal: complete 5 orders (${Math.min(5, state.sales)}/5) and unlock your second slot.`;
  $("#unread").textContent =
    `${state.orders.filter((o) => o.status === "pending").length} NEW`;
  html(
    "#orders",
    state.orders.length
      ? [...state.orders]
          .reverse()
          .map(
            (o) =>
              `<article class="message"><div class="sender"><strong>${o.name}</strong><span>${o.status}</span></div><div class="bubble">Hey, can I get ${o.amount} ${o.amount === 1 ? "unit" : "units"}? I’ve got $${o.amount * o.price}.</div>${o.status === "pending" ? `<div class="replies"><button data-action="accept" data-id="${o.id}">Accept</button><button class="secondary" data-action="decline" data-id="${o.id}">Decline</button></div>` : o.status === "accepted" ? `<div class="your-reply">You: Got you. I’ll message when it’s ready.</div><button data-action="sell" data-id="${o.id}" ${state.stock < o.amount ? "disabled" : ""}>${state.stock < o.amount ? "Waiting for inventory" : `Fulfill order · $${o.amount * o.price}`}</button>` : `<div class="your-reply">${o.status === "completed" ? "Order fulfilled ✓" : "You: Sorry, can’t right now."}</div>`}</article>`,
          )
          .join("")
      : '<div class="empty-inbox"><div class="inbox-art">···</div><h3>A quiet start</h3><p>Your first text will arrive shortly.<br>Get a seed planted while you wait.</p></div>',
  );
  if (focusAction)
    document
      .querySelector<HTMLButtonElement>(
        `button[data-action="${focusAction}"]${focusId ? `[data-id="${focusId}"]` : ""}`,
      )
      ?.focus({ preventScroll: true });
}
document.addEventListener("click", (event) => {
  const button = (event.target as HTMLElement).closest("button");
  if (!button) return;
  if (button.id === "reset") {
    if (!confirm("Start a new game? Your saved progress will be replaced."))
      return;
    state = freshGame();
    $("#notice").textContent = "Fresh start. Welcome back to the apartment.";
  } else if (button.dataset.action)
    $("#notice").textContent = act(
      state,
      button.dataset.action,
      Number(button.dataset.id),
    );
  document.body.dataset.effect = button.dataset.action || "reset";
  window.setTimeout(() => {
    delete document.body.dataset.effect;
  }, 800);
  save();
  render();
});
tick(state, Date.now());
render();
save();
setInterval(() => {
  tick(state, Date.now());
  render();
  save();
}, 1000);
