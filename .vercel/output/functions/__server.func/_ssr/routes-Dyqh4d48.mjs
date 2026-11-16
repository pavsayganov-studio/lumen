import { i as __toESM } from "../_runtime.mjs";
import { Vt as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as ArrowLeftRight, C as ChevronRight, D as Car, E as ChartLine, O as CalendarDays, S as Coffee, T as ChartPie, _ as Plus, b as House, c as Target, d as SlidersHorizontal, f as ShoppingBag, g as Repeat, h as Settings, i as Utensils, k as Briefcase, l as Sprout, m as Share, n as Wifi, o as Trash2, p as Shield, r as Wallet, s as TrainFront, t as X, u as Smartphone, v as PiggyBank, w as ChevronLeft, x as Fuel, y as List } from "../_libs/lucide-react.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { n as persist, r as create, t as createJSONStorage } from "../_libs/zustand.mjs";
import { a as XAxis, c as CartesianGrid, d as Bar, f as ResponsiveContainer, i as YAxis, l as ReferenceDot, n as AreaChart, o as Area, p as Tooltip, r as BarChart, s as Line, t as ComposedChart, u as ReferenceLine } from "../_libs/recharts+[...].mjs";
// node_modules/.nitro/vite/services/ssr/assets/routes-Dyqh4d48.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CATEGORIES = [
	{
		id: "housing",
		name: "Housing",
		color: "#2EE6C7"
	},
	{
		id: "savings",
		name: "Savings",
		color: "#FF8A3D"
	},
	{
		id: "transport",
		name: "Transportation",
		color: "#4C8DFF"
	},
	{
		id: "food",
		name: "Food & Drink",
		color: "#E15CF0"
	},
	{
		id: "shopping",
		name: "Shopping",
		color: "#8B7CFF"
	},
	{
		id: "fun",
		name: "Entertainment",
		color: "#F6C445"
	},
	{
		id: "health",
		name: "Health",
		color: "#34D399"
	}
];
var MONTH_CENTS = {
	1: 29e4,
	2: 25e4,
	3: 325e3,
	4: 26e4,
	5: 305e3,
	6: 275e3,
	7: 330750,
	8: 255e3,
	9: 32e4,
	10: 259650
};
/** Day-1..6 spend (cents) tuned so November is +19% vs this 3-month average. */
var EARLY_CENTS = {
	8: 168527,
	9: 211484,
	10: 171586
};
var WEIGHTS = {
	1: [
		42,
		14,
		12,
		10,
		12,
		6,
		4
	],
	2: [
		36,
		18,
		10,
		14,
		10,
		8,
		4
	],
	3: [
		40,
		12,
		14,
		8,
		14,
		7,
		5
	],
	4: [
		34,
		20,
		11,
		12,
		11,
		7,
		5
	],
	5: [
		44,
		15,
		10,
		9,
		10,
		8,
		4
	],
	6: [
		38,
		16,
		13,
		11,
		12,
		6,
		4
	],
	7: [
		41,
		13,
		12,
		8,
		15,
		7,
		4
	],
	8: [
		35,
		19,
		11,
		13,
		10,
		8,
		4
	],
	9: [
		43,
		14,
		12,
		10,
		9,
		8,
		4
	],
	10: [
		37,
		17,
		14,
		9,
		13,
		6,
		4
	]
};
var CAT_IDS = CATEGORIES.map((c) => c.id);
var TITLES = {
	housing: ["Rent", "Utilities"],
	savings: ["Retirement Savings", "Savings Account"],
	transport: ["Transit", "Fuel"],
	food: ["Groceries", "Dining Out"],
	shopping: ["Shopping", "Household"],
	fun: ["Going out", "Subscriptions"],
	health: ["Pharmacy", "Wellness"]
};
function monthKey(year, month) {
	return `${year}-${String(month).padStart(2, "0")}`;
}
function parseMonth(key) {
	const [y, m] = key.split("-").map(Number);
	return {
		year: y,
		month: m
	};
}
function daysInMonth(year, month) {
	return new Date(year, month, 0).getDate();
}
/** The screens were captured on this day. Keep the demo clock here so the month story stays intact. */
var DEMO_TODAY = new Date(2026, 10, 6, 12, 0, 0);
function todayISO(now = DEMO_TODAY) {
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
function currentMonthKey(now = /* @__PURE__ */ new Date()) {
	return monthKey(now.getFullYear(), now.getMonth() + 1);
}
function shiftMonth(key, delta) {
	const { year, month } = parseMonth(key);
	const d = new Date(year, month - 1 + delta, 1);
	return monthKey(d.getFullYear(), d.getMonth() + 1);
}
function cents(n) {
	return Math.round(n * 100);
}
function euros(c) {
	return Math.round(c) / 100;
}
function formatMoney(value, digits = "auto") {
	const neg = value < -.001;
	const abs = Math.abs(value);
	const whole = Math.abs(abs - Math.round(abs)) < .001;
	const d = digits === "auto" ? whole ? 0 : 2 : digits;
	const [int, frac] = abs.toFixed(d).split(".");
	const withDots = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
	const num = d === 0 ? withDots : `${withDots},${frac}`;
	return `${neg ? "−" : ""}${num} €`;
}
function formatPct(n, signed = true) {
	const r = Math.round(n);
	if (!signed) return `${r}%`;
	if (r > 0) return `+${r}%`;
	return `${r}%`;
}
var MONTH_SHORT = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec"
];
function categoryById(id) {
	return CATEGORIES.find((c) => c.id === id);
}
function splitWeighted(total, weights) {
	const sum = weights.reduce((a, b) => a + b, 0);
	const parts = weights.map((w) => Math.floor(total * w / sum));
	const used = parts.reduce((a, b) => a + b, 0);
	parts[0] += total - used;
	return parts;
}
function iso(year, month, day) {
	return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
var AS_OF = "2026-11-06";
function buildSeed() {
	const transactions = [];
	let n = 1;
	const nextId = () => `seed-${n++}`;
	const push = (tx) => {
		transactions.push({
			...tx,
			id: nextId()
		});
	};
	for (let month = 1; month <= 10; month++) {
		const total = MONTH_CENTS[month];
		const parts = splitWeighted(total, WEIGHTS[month]);
		const earlyBudget = EARLY_CENTS[month] ?? Math.round(total * .48);
		let earlyAssigned = 0;
		parts.forEach((catCents, idx) => {
			const cat = CAT_IDS[idx];
			let early = idx === parts.length - 1 ? earlyBudget - earlyAssigned : Math.round(catCents * earlyBudget / total);
			early = Math.max(0, Math.min(catCents, early));
			earlyAssigned += early;
			const late = catCents - early;
			if (cat === "savings") {
				const transfer = Math.min(catCents, Math.round(total * .14));
				const expense = catCents - transfer;
				if (transfer > 0) push({
					title: "Savings Account",
					flow: "Savings Account",
					amount: euros(transfer),
					kind: "transfer",
					date: iso(2026, month, 4),
					categoryId: "savings",
					accountId: "main",
					toAccountId: "saving"
				});
				if (expense > 0) push({
					title: "Retirement Savings",
					flow: "Retirement Savings",
					amount: euros(expense),
					kind: "expense",
					date: iso(2026, month, 4),
					categoryId: "savings",
					accountId: "main"
				});
				return;
			}
			if (early > 0) push({
				title: TITLES[cat][0],
				flow: TITLES[cat][0],
				amount: euros(early),
				kind: "expense",
				date: iso(2026, month, 3),
				categoryId: cat,
				accountId: "main"
			});
			if (late > 0) push({
				title: TITLES[cat][1],
				flow: TITLES[cat][1],
				amount: euros(late),
				kind: "expense",
				date: iso(2026, month, 18),
				categoryId: cat,
				accountId: "main"
			});
		});
	}
	[
		{
			title: "Coffee",
			flow: "Coffee Shops",
			amount: 9,
			kind: "expense",
			date: "2026-11-01",
			categoryId: "food",
			accountId: "main"
		},
		{
			title: "Lunch",
			flow: "Lunch",
			amount: 12,
			kind: "expense",
			date: "2026-11-01",
			categoryId: "food",
			accountId: "main"
		},
		{
			title: "Dinner out",
			flow: "Dining Out",
			amount: 22.5,
			kind: "expense",
			date: "2026-11-02",
			categoryId: "food",
			accountId: "main"
		},
		{
			title: "Gas",
			flow: "Gas",
			amount: 30,
			kind: "expense",
			date: "2026-11-02",
			categoryId: "transport",
			accountId: "main"
		},
		{
			title: "Rent",
			flow: "Rent",
			amount: 900,
			kind: "expense",
			date: "2026-11-03",
			categoryId: "housing",
			accountId: "main"
		},
		{
			title: "Utilities",
			flow: "Utilities",
			amount: 100,
			kind: "expense",
			date: "2026-11-03",
			categoryId: "housing",
			accountId: "main"
		},
		{
			title: "Internet",
			flow: "Internet",
			amount: 50,
			kind: "expense",
			date: "2026-11-04",
			categoryId: "housing",
			accountId: "main"
		},
		{
			title: "Retirement Savings",
			flow: "Retirement Savings",
			amount: 350,
			kind: "expense",
			date: "2026-11-04",
			categoryId: "savings",
			accountId: "main"
		},
		{
			title: "Savings Account",
			flow: "Savings Account",
			amount: 300,
			kind: "transfer",
			date: "2026-11-04",
			categoryId: "savings",
			accountId: "main",
			toAccountId: "saving"
		},
		{
			title: "Phone Bill",
			flow: "Phone Bill",
			amount: 50,
			kind: "expense",
			date: "2026-11-05",
			categoryId: "housing",
			accountId: "main"
		},
		{
			title: "Investments",
			flow: "Investments",
			amount: 110,
			kind: "expense",
			date: "2026-11-05",
			categoryId: "savings",
			accountId: "main"
		},
		{
			title: "Car Loan",
			flow: "Car Loan",
			amount: 250,
			kind: "expense",
			date: "2026-11-05",
			categoryId: "transport",
			accountId: "main"
		},
		{
			title: "Cappuccino",
			flow: "Coffee Shops",
			amount: 4.5,
			kind: "expense",
			date: "2026-11-05",
			categoryId: "food",
			accountId: "main"
		},
		{
			title: "Car insurance",
			amount: 90,
			kind: "expense",
			date: "2026-11-08",
			categoryId: "transport",
			accountId: "main",
			recurring: true
		},
		{
			title: "Monthly transit pass",
			amount: 60,
			kind: "expense",
			date: "2026-11-10",
			categoryId: "transport",
			accountId: "main",
			recurring: true
		},
		{
			title: "Streaming",
			amount: 17,
			kind: "expense",
			date: "2026-11-23",
			categoryId: "fun",
			accountId: "main",
			recurring: true
		},
		{
			title: "Gym",
			amount: 39,
			kind: "expense",
			date: "2026-11-26",
			categoryId: "health",
			accountId: "main",
			recurring: true
		},
		{
			title: "Groceries",
			amount: 48,
			kind: "expense",
			date: "2026-11-27",
			categoryId: "food",
			accountId: "main"
		},
		{
			title: "Cloud storage",
			amount: 18,
			kind: "expense",
			date: "2026-11-28",
			categoryId: "shopping",
			accountId: "main",
			recurring: true
		},
		{
			title: "Dinner reservation",
			amount: 25,
			kind: "expense",
			date: "2026-11-29",
			categoryId: "food",
			accountId: "main"
		}
	].forEach(push);
	const incomeNeeded = 1663950 + transactions.filter((t) => t.kind === "expense" && t.date <= AS_OF).reduce((s, t) => s + cents(t.amount), 0);
	const novIncome = 396e3;
	const histIncome = incomeNeeded - novIncome;
	const histBase = Math.floor(histIncome / 10);
	let histAssigned = 0;
	for (let month = 1; month <= 10; month++) {
		const amt = month === 10 ? histIncome - histAssigned : histBase;
		histAssigned += amt;
		push({
			title: "Salary",
			amount: euros(amt),
			kind: "income",
			date: iso(2026, month, 1),
			accountId: "main"
		});
	}
	push({
		title: "Salary",
		amount: euros(novIncome),
		kind: "income",
		date: "2026-11-01",
		accountId: "main"
	});
	const accounts = [
		{
			id: "main",
			name: "Main",
			kind: "spending",
			color: "#4C8DFF",
			isDefault: true,
			opening: 0
		},
		{
			id: "cbc",
			name: "CBC Banque SA",
			kind: "spending",
			color: "#3AD7FF",
			opening: 0
		},
		{
			id: "bdb",
			name: "Banco do Brasil",
			kind: "spending",
			color: "#34D399",
			opening: 0
		},
		{
			id: "saving",
			name: "Saving",
			kind: "saving",
			color: "#3DDC97",
			isDefault: true,
			opening: 0
		}
	];
	const targets = {
		main: 8807.5,
		cbc: 55,
		bdb: 0,
		saving: 7832
	};
	for (const account of accounts) {
		const deltaCents = transactions.filter((t) => t.date <= AS_OF).reduce((s, tx) => s + cents(effectOn(tx, account.id)), 0);
		account.opening = euros(cents(targets[account.id]) - deltaCents);
	}
	const budgets = {};
	const allocations = {};
	for (let month = 1; month <= 12; month++) {
		const key = monthKey(2026, month);
		budgets[key] = 3900;
	}
	allocations["2026-11"] = {
		housing: 1300,
		savings: 760,
		transport: 360,
		food: 148
	};
	for (let month = 1; month <= 10; month++) {
		const key = monthKey(2026, month);
		allocations[key] = spentByCategory(transactions.filter((t) => t.date.startsWith(key) && t.date <= `${key}-31`));
	}
	return {
		accounts,
		transactions,
		budgets,
		allocations,
		projects: seedProjects()
	};
}
function seedProjects() {
	return [{
		id: "seed-home",
		name: "Apartment",
		kind: "home",
		target: 42e3,
		saved: 18500,
		monthlySave: 800,
		installment: false,
		downPayment: 0,
		months: 12,
		apr: 0,
		start: "2026-12-01"
	}, {
		id: "seed-car",
		name: "City car",
		kind: "car",
		target: 18e3,
		saved: 4200,
		monthlySave: 0,
		installment: true,
		downPayment: 5e3,
		months: 36,
		apr: 4.9,
		start: "2026-12-05"
	}];
}
function monthlyPayment(principal, aprPercent, months) {
	const n = Math.max(1, Math.round(months));
	const p = Math.max(0, principal);
	if (p === 0) return 0;
	const r = aprPercent / 100 / 12;
	if (r < 1e-8) return euros(Math.round(p / n * 100));
	const pow = (1 + r) ** n;
	return euros(Math.round(p * r * pow / (pow - 1) * 100));
}
function remainingPrincipal(principal, aprPercent, months, paid) {
	const n = Math.max(1, Math.round(months));
	const k = Math.max(0, Math.min(n, paid));
	const p = Math.max(0, principal);
	if (k >= n) return 0;
	const r = aprPercent / 100 / 12;
	if (r < 1e-8) return euros(Math.max(0, cents(p) - cents(monthlyPayment(p, 0, n)) * k));
	const pow = (1 + r) ** k;
	const pmt = monthlyPayment(p, aprPercent, n);
	const bal = p * pow - pmt * (pow - 1) / r;
	return euros(Math.max(0, Math.round(bal * 100)));
}
function addMonthsISO(iso, delta) {
	const [y, m, d] = iso.split("-").map(Number);
	const dt = new Date(y, m - 1 + delta, 1);
	const ny = dt.getFullYear();
	const nm = dt.getMonth() + 1;
	const nd = Math.min(d, daysInMonth(ny, nm));
	return `${ny}-${String(nm).padStart(2, "0")}-${String(nd).padStart(2, "0")}`;
}
function projectPlan(p, today = todayISO()) {
	const price = Math.max(0, p.target);
	const saved = Math.max(0, p.saved);
	if (!p.installment) {
		const left = Math.max(0, price - saved);
		const monthly = Math.max(0, p.monthlySave);
		return {
			mode: "save",
			price,
			saved,
			left,
			progress: price > 0 ? Math.min(1, saved / price) : 0,
			monthly,
			monthsLeft: monthly > 0 && left > 0 ? Math.ceil(left / monthly) : left === 0 ? 0 : null,
			nextDate: null,
			paidCount: 0,
			months: 0,
			down: 0,
			financed: 0,
			downGap: left,
			owed: 0
		};
	}
	const down = Math.min(price, Math.max(0, p.downPayment));
	const financed = Math.max(0, euros(cents(price) - cents(down)));
	const months = Math.max(1, Math.round(p.months || 1));
	const monthly = monthlyPayment(financed, p.apr, months);
	let paidCount = 0;
	let nextDate = null;
	const start = p.start || today;
	for (let i = 0; i < months; i++) {
		const date = addMonthsISO(start, i);
		if (date <= today) paidCount += 1;
		else if (!nextDate) nextDate = date;
	}
	const owed = remainingPrincipal(financed, p.apr, months, paidCount);
	const downGap = Math.max(0, euros(cents(down) - cents(saved)));
	const covered = Math.min(price, euros(cents(Math.min(saved, down)) + cents(financed) - cents(owed)));
	return {
		mode: "installment",
		price,
		saved,
		left: Math.max(0, euros(cents(price) - cents(covered))),
		progress: price > 0 ? covered / price : 0,
		monthly,
		monthsLeft: months - paidCount,
		nextDate,
		paidCount,
		months,
		down,
		financed,
		downGap,
		owed
	};
}
/** Future installment rows for one month. They are not stored transactions. */
function planBills(projects, month, today) {
	const out = [];
	for (const project of projects) {
		if (!project.installment) continue;
		const plan = projectPlan(project, today);
		const start = project.start || today;
		for (let i = 0; i < plan.months; i++) {
			const date = addMonthsISO(start, i);
			if (!date.startsWith(month) || date <= today) continue;
			const categoryId = project.kind === "home" ? "housing" : project.kind === "car" ? "transport" : "shopping";
			out.push({
				id: `plan:${project.id}:${date}`,
				title: project.name,
				amount: plan.monthly,
				kind: "expense",
				date,
				categoryId,
				accountId: "main",
				recurring: true
			});
		}
	}
	return out.sort((a, b) => a.date.localeCompare(b.date));
}
function effectOn(tx, accountId) {
	if (tx.kind === "income" && tx.accountId === accountId) return tx.amount;
	if (tx.kind === "expense" && tx.accountId === accountId) return -tx.amount;
	if (tx.kind === "transfer") {
		if (tx.accountId === accountId) return -tx.amount;
		if (tx.toAccountId === accountId) return tx.amount;
	}
	return 0;
}
function isSpend(tx) {
	return tx.kind === "expense" || tx.kind === "transfer" && !!tx.categoryId;
}
function inMonth(tx, key) {
	return tx.date.startsWith(key);
}
function spentByCategory(txns) {
	const out = {};
	for (const tx of txns) {
		if (!isSpend(tx) || !tx.categoryId) continue;
		out[tx.categoryId] = (out[tx.categoryId] ?? 0) + tx.amount;
	}
	for (const k of Object.keys(out)) out[k] = euros(cents(out[k]));
	return out;
}
function sumSpend(txns) {
	return euros(txns.filter(isSpend).reduce((s, t) => s + cents(t.amount), 0));
}
function postedSpend(txns, key, today) {
	return txns.filter((t) => inMonth(t, key) && isSpend(t) && t.date <= today);
}
function upcomingSpend(txns, key, today) {
	return txns.filter((t) => inMonth(t, key) && isSpend(t) && t.date > today).sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}
function budgetOf(budgets, key) {
	return budgets[key] ?? 3900;
}
function allocationMap(allocations, key) {
	return allocations[key] ?? {};
}
function allocatedTotal(map) {
	return euros(Object.values(map).reduce((s, n) => s + cents(n ?? 0), 0));
}
function daysRemaining(key, today = todayISO()) {
	const { year, month } = parseMonth(key);
	const dim = daysInMonth(year, month);
	const current = currentMonthKey();
	if (key < current) return {
		tone: "past",
		days: 0
	};
	if (key > current) return {
		tone: "future",
		days: 0
	};
	return {
		tone: "now",
		days: dim - Number(today.slice(8, 10)) + 1
	};
}
function moneyFlow(txns) {
	const groups = /* @__PURE__ */ new Map();
	for (const tx of txns) {
		if (!isSpend(tx) || !tx.categoryId) continue;
		const name = tx.flow || tx.title;
		if (!groups.has(tx.categoryId)) groups.set(tx.categoryId, /* @__PURE__ */ new Map());
		const g = groups.get(tx.categoryId);
		g.set(name, (g.get(name) ?? 0) + tx.amount);
	}
	const links = [];
	for (const cat of CATEGORIES) {
		const g = groups.get(cat.id);
		if (!g) continue;
		for (const [name, value] of g) if (value > 0) links.push({
			source: cat.name,
			categoryId: cat.id,
			target: name,
			value: euros(cents(value)),
			color: cat.color
		});
	}
	return links.sort((a, b) => b.value - a.value);
}
function trendModel(txns, key, today) {
	const { year, month } = parseMonth(key);
	const dim = daysInMonth(year, month);
	const currentKey = today.slice(0, 7);
	const cutoff = key < currentKey ? dim : key > currentKey ? 0 : Math.min(dim, Number(today.slice(8, 10)));
	const byDay = new Array(dim + 1).fill(0);
	for (const tx of txns) {
		if (!inMonth(tx, key) || !isSpend(tx)) continue;
		const day = Number(tx.date.slice(8, 10));
		if (day <= cutoff) byDay[day] += tx.amount;
	}
	let run = 0;
	const current = [];
	for (let d = 1; d <= dim; d++) {
		if (d <= cutoff) run += byDay[d];
		current.push(euros(cents(run)));
	}
	const prevKeys = [
		1,
		2,
		3
	].map((n) => shiftMonth(key, -n));
	const averages = [];
	for (let d = 1; d <= dim; d++) {
		let sum = 0;
		let count = 0;
		for (const pk of prevKeys) {
			const synthetic = syntheticCumulative(txns, pk, d);
			if (synthetic == null) continue;
			sum += synthetic;
			count++;
		}
		averages.push(count ? Math.round(sum / count * 100) / 100 : 0);
	}
	const idx = Math.max(0, (cutoff || 1) - 1);
	const nowValue = current[idx] ?? 0;
	const avgValue = averages[idx] ?? 0;
	return {
		days: dim,
		current,
		averages,
		cutoff,
		nowValue,
		avgValue,
		pct: avgValue > 0 ? (nowValue - avgValue) / avgValue * 100 : 0
	};
}
function syntheticCumulative(txns, key, day) {
	const { year, month } = parseMonth(key);
	if (year !== 2026 || month < 1 || month > 10) {
		const total = sumSpend(txns.filter((t) => inMonth(t, key) && isSpend(t)));
		if (!txns.some((t) => inMonth(t, key))) return null;
		const dim = daysInMonth(year, month);
		return total * (Math.min(day, dim) / dim);
	}
	const total = MONTH_CENTS[month];
	const early = EARLY_CENTS[month] ?? Math.round(total * .48);
	const dim = daysInMonth(year, month);
	const d = Math.min(day, dim);
	if (d <= 6) return early * d / 6 / 100;
	return (early + (total - early) * (d - 6) / (dim - 6)) / 100;
}
function yearModel(txns, year, throughMonth) {
	const rows = [];
	for (let m = 1; m <= 12; m++) {
		if (m > throughMonth && year >= (/* @__PURE__ */ new Date()).getFullYear()) break;
		const key = monthKey(year, m);
		const mine = txns.filter((t) => inMonth(t, key) && isSpend(t) && t.date <= todayISO());
		if (year === 2026 && m > 11) break;
		const parts = {};
		for (const c of CAT_IDS) parts[c] = 0;
		for (const tx of mine) {
			if (!tx.categoryId) continue;
			parts[tx.categoryId] += tx.amount;
		}
		for (const c of CAT_IDS) parts[c] = euros(cents(parts[c]));
		const total = euros(CAT_IDS.reduce((s, c) => s + cents(parts[c]), 0));
		if (year === 2026 && m > 11) continue;
		rows.push({
			month: m,
			label: MONTH_SHORT[m - 1],
			total,
			parts
		});
	}
	const visible = rows.filter((r) => r.month <= (year === 2026 ? 11 : 12));
	const total = euros(visible.reduce((s, r) => s + cents(r.total), 0));
	const avg = visible.length ? total / visible.length : 0;
	const peak = visible.reduce((best, r) => r.total > best.total ? r : best, visible[0] ?? {
		total: 0,
		label: "—",
		month: 1,
		parts: {}
	});
	const last = visible.slice(-3).map((r) => r.total);
	let direction = "Steady";
	if (last.length >= 2 && last[0] > 0) {
		const delta = (last[last.length - 1] - last[0]) / last[0];
		if (delta > .03) direction = "Increasing";
		else if (delta < -.03) direction = "Decreasing";
	}
	return {
		rows: visible,
		total,
		avg,
		peak,
		direction
	};
}
function accountBalance(account, txns, until) {
	let delta = 0;
	for (const tx of txns) {
		if (until && tx.date > until) continue;
		delta += cents(effectOn(tx, account.id));
	}
	return euros(cents(account.opening) + delta);
}
function totalBalance(accounts, txns, until) {
	return euros(accounts.reduce((s, a) => s + cents(accountBalance(a, txns, until)), 0));
}
function rangeStart(range, today = todayISO()) {
	const [y, m, d] = today.split("-").map(Number);
	const dt = new Date(y, m - 1, d);
	if (range === "1W") dt.setDate(dt.getDate() - 7);
	else if (range === "1M") dt.setMonth(dt.getMonth() - 1);
	else if (range === "3M") dt.setMonth(dt.getMonth() - 3);
	else if (range === "6M") dt.setMonth(dt.getMonth() - 6);
	else if (range === "1Y") dt.setFullYear(dt.getFullYear() - 1);
	else return "2025-12-31";
	const isoDay = todayISO(dt);
	if (isoDay < "2026-01-01") return "2025-12-31";
	return isoDay;
}
function balanceSeries(accounts, txns, range, today = todayISO()) {
	const start = range === "All" ? "2025-12-31" : rangeStart(range, today);
	const points = [];
	const cursor = /* @__PURE__ */ new Date(start + "T12:00:00");
	const end = /* @__PURE__ */ new Date(today + "T12:00:00");
	const sorted = [...txns].sort((a, b) => a.date.localeCompare(b.date));
	while (cursor <= end) {
		const isoDay = todayISO(cursor);
		let value = 0;
		for (const a of accounts) {
			let delta = 0;
			for (const tx of sorted) {
				if (tx.date > isoDay) break;
				delta += cents(effectOn(tx, a.id));
			}
			value += cents(a.opening) + delta;
		}
		points.push({
			date: isoDay,
			value: euros(value)
		});
		cursor.setDate(cursor.getDate() + (range === "All" || range === "1Y" ? 3 : 1));
	}
	const last = points[points.length - 1];
	if (!last || last.date !== today) points.push({
		date: today,
		value: totalBalance(accounts, txns, today)
	});
	return points;
}
function monthNet(accounts, txns, key, today) {
	const before = shiftDay(`${key}-01`, -1);
	const { year, month } = parseMonth(key);
	const last = `${key}-${String(daysInMonth(year, month)).padStart(2, "0")}`;
	const current = today.slice(0, 7);
	return euros(cents(totalBalance(accounts, txns, key < current ? last : key > current ? before : today)) - cents(totalBalance(accounts, txns, before)));
}
function shiftDay(isoDay, delta) {
	const [y, m, d] = isoDay.split("-").map(Number);
	const dt = new Date(y, m - 1, d);
	dt.setDate(dt.getDate() + delta);
	return todayISO(dt);
}
function savingStats(txns, key, today) {
	const saved = euros(postedSpend(txns, key, today).filter((t) => t.categoryId === "savings").reduce((s, t) => s + cents(t.amount), 0));
	const income = euros(txns.filter((t) => inMonth(t, key) && t.kind === "income" && t.date <= today).reduce((s, t) => s + cents(t.amount), 0));
	return {
		saved,
		income,
		rate: income > 0 ? saved / income * 100 : 0
	};
}
function projectRecurring(txns, untilKey) {
	const out = [...txns];
	const seen = new Set(out.map((t) => `${t.title}|${t.date}`));
	for (const tx of txns) {
		if (!tx.recurring) continue;
		let key = shiftMonth(tx.date.slice(0, 7), 1);
		let guard = 0;
		while (key <= untilKey && guard < 36) {
			const { year, month } = parseMonth(key);
			const dim = daysInMonth(year, month);
			const day = Math.min(Number(tx.date.slice(8, 10)), dim);
			const date = `${key}-${String(day).padStart(2, "0")}`;
			const marker = `${tx.title}|${date}`;
			if (!seen.has(marker)) {
				out.push({
					...tx,
					id: `proj-${tx.id}-${key}`,
					date
				});
				seen.add(marker);
			}
			key = shiftMonth(key, 1);
			guard += 1;
		}
	}
	return out;
}
function formatSigned(value, digits = "auto") {
	if (value > .001) return `+${formatMoney(value, digits)}`;
	return formatMoney(value, digits);
}
var INSIGHT_ORDER = [
	"trend",
	"top",
	"upcoming",
	"saving",
	"flow",
	"accounts",
	"projects"
];
function bumpAllocations(allocations, transactions, month) {
	const spent = spentByCategory(postedSpend(transactions, month, todayISO()));
	const map = { ...allocations[month] ?? {} };
	let changed = false;
	for (const [cat, value] of Object.entries(spent)) if (value > (map[cat] ?? 0) + .001) {
		map[cat] = value;
		changed = true;
	}
	if (!changed) return allocations;
	return {
		...allocations,
		[month]: map
	};
}
function fresh() {
	return {
		...buildSeed(),
		month: currentMonthKey(),
		insightOrder: [...INSIGHT_ORDER],
		hiddenInsights: [],
		localeMode: "auto"
	};
}
var memory = {
	getItem: () => null,
	setItem: () => {},
	removeItem: () => {}
};
var useFinance = create()(persist((set, get) => ({
	...fresh(),
	setMonth: (month) => set({ month }),
	setLocaleMode: (mode) => set({ localeMode: mode }),
	toggleInsight: (id) => set((s) => ({ hiddenInsights: s.hiddenInsights.includes(id) ? s.hiddenInsights.filter((x) => x !== id) : [...s.hiddenInsights, id] })),
	moveInsight: (id, dir) => set((s) => {
		const order = [...s.insightOrder];
		const i = order.indexOf(id);
		const j = i + dir;
		if (i < 0 || j < 0 || j >= order.length) return s;
		[order[i], order[j]] = [order[j], order[i]];
		return { insightOrder: order };
	}),
	setBudget: (month, amount) => set((s) => ({ budgets: {
		...s.budgets,
		[month]: Math.max(0, euros(cents(amount)))
	} })),
	setAllocation: (month, categoryId, amount) => set((s) => ({ allocations: {
		...s.allocations,
		[month]: {
			...s.allocations[month],
			[categoryId]: Math.max(0, euros(cents(amount)))
		}
	} })),
	addTransaction: (input) => set((s) => {
		const tx = {
			...input,
			id: `tx-${Date.now()}-${Math.floor(Math.random() * 999)}`
		};
		const transactions = [...s.transactions, tx];
		return {
			transactions,
			allocations: bumpAllocations(s.allocations, transactions, tx.date.slice(0, 7))
		};
	}),
	updateTransaction: (id, input) => set((s) => {
		const transactions = s.transactions.map((t) => t.id === id ? {
			...input,
			id
		} : t);
		const month = input.date.slice(0, 7);
		return {
			transactions,
			allocations: bumpAllocations(s.allocations, transactions, month)
		};
	}),
	deleteTransaction: (id) => set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id && !t.id.startsWith(`proj-${id}-`)) })),
	addAccount: (input) => set((s) => ({ accounts: [...s.accounts, {
		id: `acc-${Date.now()}`,
		name: input.name,
		kind: input.kind,
		color: input.color,
		isDefault: false,
		opening: input.balance
	}] })),
	renameAccount: (id, name) => set((s) => ({ accounts: s.accounts.map((a) => a.id === id ? {
		...a,
		name
	} : a) })),
	deleteAccount: (id) => {
		const s = get();
		if (s.transactions.some((t) => t.accountId === id || t.toAccountId === id)) return false;
		if (s.accounts.filter((a) => a.kind === s.accounts.find((x) => x.id === id)?.kind).length <= 1) return false;
		set({ accounts: s.accounts.filter((a) => a.id !== id) });
		return true;
	},
	saveProject: (input) => set((s) => ({ projects: s.projects.some((p) => p.id === input.id) ? s.projects.map((p) => p.id === input.id ? input : p) : [...s.projects, input] })),
	deleteProject: (id) => set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),
	restoreSnapshot: (snapshot) => set({
		accounts: snapshot.accounts,
		transactions: snapshot.transactions,
		budgets: snapshot.budgets,
		allocations: snapshot.allocations,
		projects: snapshot.projects ?? [],
		month: snapshot.month,
		insightOrder: snapshot.insightOrder?.length ? snapshot.insightOrder : [...INSIGHT_ORDER],
		hiddenInsights: snapshot.hiddenInsights ?? []
	}),
	reset: () => set(fresh())
}), {
	name: "lumen-budget-v1",
	storage: createJSONStorage(() => typeof window === "undefined" ? memory : localStorage),
	skipHydration: true,
	merge: (persisted, current) => {
		const saved = persisted ?? {};
		const order = [...saved.insightOrder ?? current.insightOrder];
		for (const id of INSIGHT_ORDER) if (!order.includes(id)) order.push(id);
		return {
			...current,
			...saved,
			insightOrder: order,
			projects: saved.projects ?? current.projects,
			localeMode: saved.localeMode ?? "auto",
			hiddenInsights: saved.hiddenInsights ?? []
		};
	},
	partialize: (s) => ({
		accounts: s.accounts,
		transactions: s.transactions,
		budgets: s.budgets,
		allocations: s.allocations,
		projects: s.projects,
		month: s.month,
		insightOrder: s.insightOrder,
		hiddenInsights: s.hiddenInsights,
		localeMode: s.localeMode
	})
}));
var en = {
	close: "Close",
	save: "Save",
	edit: "Edit",
	delete: "Delete",
	add: "Add +",
	search: "Search",
	name: "Name",
	amount: "Amount",
	date: "Date",
	account: "Account",
	to: "To",
	on: "On",
	off: "Off",
	spent: "Spent",
	income: "Income",
	transfer: "Transfer",
	expense: "Expense",
	month: "Month",
	year: "Year",
	today: "Today",
	settings: "Settings",
	insights: "Insights",
	budget: "Budget",
	allocated: "Allocated",
	available: "Available",
	leftToSpend: "left to spend",
	daysLeft: "{n} days remaining",
	dayLeft: "1 day remaining",
	monthClosed: "Month closed",
	notStarted: "Not started yet",
	trend: "Trend",
	top: "Top Spending",
	upcoming: "Upcoming",
	saving: "Saving Rate",
	flow: "Money Flow",
	accounts: "Accounts",
	balance: "Balance",
	goals: "Goals",
	increasing: "Increasing",
	decreasing: "Decreasing",
	steady: "Steady",
	strong: "Strong",
	building: "Building",
	low: "Low",
	noSpending: "No spending",
	expenses: "{n} expenses",
	expenseOne: "1 expense",
	spentPct: "{n}% spent",
	recent: "Recent Transactions",
	noTransactions: "No transactions.",
	editBudget: "Edit budget",
	previous: "Previous insight",
	next: "Next insight",
	share: "Share money flow",
	filter: "Filter categories",
	addAccount: "Add account",
	previousYear: "Previous year",
	nextYear: "Next year",
	jump: "Jump anywhere",
	monthlyBudget: "Monthly budget",
	allocatedLine: "Allocated {allocated} · Available {available}",
	budgetHelp: "Left to spend is money you have not given a job yet. A category only shrinks after it runs out.",
	settingsBlurb: "Your money stays on this phone. We never upload it.",
	language: "Language",
	languageHelp: "Russian if your phone is in Russian. English otherwise.",
	langAuto: "This phone",
	langEn: "English",
	langRu: "Русский",
	backup: "Backup code",
	backupHelp: "Copy a code onto your new phone. It never goes to us. A passphrase locks the code, so a screenshot of it stays unreadable.",
	passphrase: "Passphrase, optional",
	passphraseHint: "Use the same words when you restore.",
	copyCode: "Copy code",
	copied: "Code copied",
	copyFailed: "Could not copy. Select the code instead.",
	pasteCode: "Paste a code",
	restore: "Restore",
	restoreAsk: "Replace what's on this phone?",
	restored: "Backup restored",
	backupReady: "Code ready. Keep it somewhere only you can open.",
	needsPhrase: "This code is locked. Type the passphrase.",
	badCode: "That code looks damaged. Try copying it again.",
	reset: "Reset demo data",
	resetDone: "Demo data restored",
	showHide: "Show, hide, reorder",
	shown: "Shown on home",
	hidden: "Hidden",
	moveUp: "Move up",
	moveDown: "Move down",
	hiddenAll: "All insights are hidden. Tap Edit to bring them back.",
	newTx: "New transaction",
	editTx: "Edit",
	enterAmount: "Enter an amount",
	addName: "Add a name",
	txUpdated: "Transaction updated",
	txAdded: "Transaction added",
	txDeleted: "Transaction deleted",
	repeats: "Repeats monthly",
	transactions: "Transactions",
	spending: "Spending",
	savingKind: "Saving",
	removeAccount: "Remove account",
	accountRemoved: "Account removed",
	accountBusy: "This account still has transactions",
	newAccount: "New account",
	accountName: "Account name",
	opening: "Opening balance",
	nameBalance: "Name and balance required",
	default: "Default",
	allAccounts: "All Accounts",
	spendingTrend: "Spending Trend",
	average: "Average",
	whatTrend: "What is Spending Trend?",
	trendBody: "See this month next to your usual pace from the last 3 months.",
	trendBody2: "The solid line is this month. The dashed line is your usual pace. Right now spending is {word} ({pct} versus that pace).",
	moneyFlow: "Money Flow",
	whatFlow: "What is Money Flow?",
	flowBody: "Follow the money from each group to the places it went. A thicker band means more money.",
	summaryCopied: "Summary copied",
	breakdown: "Spending Breakdown",
	totalSpending: "Total spending",
	nothingSpent: "Nothing spent yet.",
	monthlyAvg: "Monthly avg.",
	peak: "Peak month",
	categories: "Categories",
	shownWord: "Shown",
	hiddenWord: "Hidden",
	ofIncome: "of income set aside",
	saved: "Saved",
	otherSpending: "Other spending",
	whatSaving: "What is Saving Rate?",
	savingBody: "The share of this month's income that went to savings. 15% or more feels strong.",
	upcomingTx: "Upcoming Transactions",
	upcomingExpenses: "Upcoming expenses",
	nothingScheduled: "Nothing scheduled.",
	monthly: "Monthly",
	whatGoals: "Goals",
	goalsHelp: "A home, a car, or anything big. Save toward it, or pay in parts.",
	newGoal: "New goal",
	editGoal: "Edit goal",
	noGoals: "No goals yet",
	addGoal: "Start a goal",
	saveUp: "Saving up",
	inParts: "Paying in parts",
	price: "Price",
	alreadySaved: "Already saved",
	setAside: "Set aside each month",
	down: "Down payment",
	months: "Months",
	rate: "Yearly rate",
	rateHelp: "0% keeps every payment the same. A rate adds a little interest.",
	eachMonth: "Each month",
	paidSoFar: "Payments made",
	stillToPay: "Still to pay",
	nextPayment: "Next payment",
	downGap: "Still {n} before the first payment",
	monthsLeft: "About {n} months to go",
	goalReached: "You made it",
	ofPrice: "{saved} of {price}",
	kindHome: "Home",
	kindCar: "Car",
	kindOther: "Other",
	removeGoal: "Remove goal",
	goalSaved: "Goal saved",
	needPrice: "Add a price",
	addsBills: "Adds {n} to upcoming bills",
	goalProgress: "{n}% there",
	catHousing: "Housing",
	catSavings: "Savings",
	catTransport: "Transportation",
	catFood: "Food & Drink",
	catShopping: "Shopping",
	catFun: "Entertainment",
	catHealth: "Health",
	shareText: "Money flow",
	allocationFor: "{name} allocation"
};
var ru = {
	close: "Закрыть",
	save: "Сохранить",
	edit: "Изменить",
	delete: "Удалить",
	add: "Добавить",
	search: "Поиск",
	name: "Название",
	amount: "Сумма",
	date: "Дата",
	account: "Счёт",
	to: "Куда",
	on: "Да",
	off: "Нет",
	spent: "Потрачено",
	income: "Доход",
	transfer: "Перевод",
	expense: "Расход",
	month: "Месяц",
	year: "Год",
	today: "Сегодня",
	settings: "Настройки",
	insights: "Обзор",
	budget: "Бюджет",
	allocated: "По плану",
	available: "Свободно",
	leftToSpend: "можно потратить",
	daysLeft: "ещё {n} дней",
	dayLeft: "ещё 1 день",
	monthClosed: "Месяц закрыт",
	notStarted: "Ещё не начался",
	trend: "Динамика",
	top: "Больше всего",
	upcoming: "Скоро",
	saving: "Сбережения",
	flow: "Куда ушли",
	accounts: "Счета",
	balance: "Баланс",
	goals: "Цели",
	increasing: "Растёт",
	decreasing: "Снижается",
	steady: "Ровно",
	strong: "Хорошо",
	building: "Набираем",
	low: "Мало",
	noSpending: "Пока пусто",
	expenses: "{n} платежей",
	expenseOne: "1 платёж",
	spentPct: "потрачено {n}%",
	recent: "Недавние",
	noTransactions: "Пока нет операций.",
	editBudget: "Изменить бюджет",
	previous: "Предыдущий обзор",
	next: "Следующий обзор",
	share: "Поделиться потоком",
	filter: "Фильтр категорий",
	addAccount: "Добавить счёт",
	previousYear: "Прошлый год",
	nextYear: "Следующий год",
	jump: "Любой месяц",
	monthlyBudget: "Бюджет на месяц",
	allocatedLine: "По плану {allocated} · Свободно {available}",
	budgetHelp: "«Можно потратить» — деньги без задачи. Категория уменьшается, только когда она закончилась.",
	settingsBlurb: "Деньги остаются на этом телефоне. Мы их никуда не отправляем.",
	language: "Язык",
	languageHelp: "Русский, если телефон на русском. Иначе английский.",
	langAuto: "Телефон",
	langEn: "English",
	langRu: "Русский",
	backup: "Код копии",
	backupHelp: "Перенесите код на новый телефон. Он не уходит к нам. Фраза-ключ запирает код: снимок экрана ничего не скажет.",
	passphrase: "Фраза-ключ, необязательно",
	passphraseHint: "При восстановлении нужны те же слова.",
	copyCode: "Скопировать код",
	copied: "Код скопирован",
	copyFailed: "Не вышло скопировать. Выделите код вручную.",
	pasteCode: "Вставьте код",
	restore: "Восстановить",
	restoreAsk: "Заменить данные на этом телефоне?",
	restored: "Копия восстановлена",
	backupReady: "Код готов. Храните его только у себя.",
	needsPhrase: "Код закрыт. Введите фразу-ключ.",
	badCode: "Код повреждён. Скопируйте его ещё раз.",
	reset: "Вернуть демо-данные",
	resetDone: "Демо-данные на месте",
	showHide: "Показать, скрыть, порядок",
	shown: "На главной",
	hidden: "Скрыто",
	moveUp: "Выше",
	moveDown: "Ниже",
	hiddenAll: "Все карточки скрыты. Нажмите «Изменить», чтобы вернуть.",
	newTx: "Новая операция",
	editTx: "Правка",
	enterAmount: "Введите сумму",
	addName: "Добавьте название",
	txUpdated: "Операция обновлена",
	txAdded: "Операция добавлена",
	txDeleted: "Операция удалена",
	repeats: "Каждый месяц",
	transactions: "Операции",
	spending: "Траты",
	savingKind: "Накопления",
	removeAccount: "Удалить счёт",
	accountRemoved: "Счёт удалён",
	accountBusy: "На счёте ещё есть операции",
	newAccount: "Новый счёт",
	accountName: "Название счёта",
	opening: "Начальный остаток",
	nameBalance: "Нужны название и остаток",
	default: "Основной",
	allAccounts: "Все счета",
	spendingTrend: "Динамика трат",
	average: "Обычно",
	whatTrend: "Что такое динамика?",
	trendBody: "Этот месяц рядом с вашим обычным темпом за 3 месяца.",
	trendBody2: "Сплошная линия — этот месяц. Пунктир — обычный темп. Сейчас траты {word} ({pct} к этому темпу).",
	moneyFlow: "Куда ушли деньги",
	whatFlow: "Что это?",
	flowBody: "Деньги идут от группы к местам, куда вы их отдали. Чем толще лента, тем больше сумма.",
	summaryCopied: "Сводка скопирована",
	breakdown: "Разбивка трат",
	totalSpending: "Всего потрачено",
	nothingSpent: "Пока ничего.",
	monthlyAvg: "В среднем",
	peak: "Самый большой",
	categories: "Категории",
	shownWord: "Видно",
	hiddenWord: "Скрыто",
	ofIncome: "дохода отложено",
	saved: "Отложено",
	otherSpending: "Остальные траты",
	whatSaving: "Что такое норма сбережений?",
	savingBody: "Доля дохода этого месяца, которая ушла в накопления. От 15% — уже хорошо.",
	upcomingTx: "Предстоящие",
	upcomingExpenses: "Ещё впереди",
	nothingScheduled: "Ничего не запланировано.",
	monthly: "Каждый месяц",
	whatGoals: "Цели",
	goalsHelp: "Жильё, машина или любая большая покупка. Копите или платите частями.",
	newGoal: "Новая цель",
	editGoal: "Правка цели",
	noGoals: "Целей пока нет",
	addGoal: "Начать цель",
	saveUp: "Копим",
	inParts: "В рассрочку",
	price: "Цена",
	alreadySaved: "Уже есть",
	setAside: "Откладывать в месяц",
	down: "Первый взнос",
	months: "Месяцев",
	rate: "Ставка в год",
	rateHelp: "При 0% платёж каждый месяц одинаковый. Ставка добавляет немного процентов.",
	eachMonth: "Платёж",
	paidSoFar: "Уже платежей",
	stillToPay: "Осталось выплатить",
	nextPayment: "Следующий платёж",
	downGap: "Ещё {n} до первого платежа",
	monthsLeft: "Ещё около {n} мес.",
	goalReached: "Цель достигнута",
	ofPrice: "{saved} из {price}",
	kindHome: "Жильё",
	kindCar: "Машина",
	kindOther: "Другое",
	removeGoal: "Удалить цель",
	goalSaved: "Цель сохранена",
	needPrice: "Укажите цену",
	addsBills: "Плюс {n} к будущим платежам",
	goalProgress: "готово на {n}%",
	catHousing: "Жильё",
	catSavings: "Накопления",
	catTransport: "Транспорт",
	catFood: "Еда и кафе",
	catShopping: "Покупки",
	catFun: "Досуг",
	catHealth: "Здоровье",
	shareText: "Куда ушли деньги",
	allocationFor: "Сумма для «{name}»"
};
var MONTHS = {
	en: [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December"
	],
	ru: [
		"Январь",
		"Февраль",
		"Март",
		"Апрель",
		"Май",
		"Июнь",
		"Июль",
		"Август",
		"Сентябрь",
		"Октябрь",
		"Ноябрь",
		"Декабрь"
	]
};
var MONTHS_SHORT = {
	en: [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	],
	ru: [
		"янв",
		"фев",
		"мар",
		"апр",
		"мая",
		"июн",
		"июл",
		"авг",
		"сен",
		"окт",
		"ноя",
		"дек"
	]
};
var WEEKDAYS = {
	en: [
		"Sun",
		"Mon",
		"Tue",
		"Wed",
		"Thu",
		"Fri",
		"Sat"
	],
	ru: [
		"вс",
		"пн",
		"вт",
		"ср",
		"чт",
		"пт",
		"сб"
	]
};
var WEEK_HEAD = {
	en: [
		"MON",
		"TUE",
		"WED",
		"THU",
		"FRI",
		"SAT",
		"SUN"
	],
	ru: [
		"ПН",
		"ВТ",
		"СР",
		"ЧТ",
		"ПТ",
		"СБ",
		"ВС"
	]
};
var CAT = {
	housing: "catHousing",
	savings: "catSavings",
	transport: "catTransport",
	food: "catFood",
	shopping: "catShopping",
	fun: "catFun",
	health: "catHealth"
};
function deviceLocale() {
	if (typeof navigator === "undefined") return "en";
	return navigator.language.toLowerCase().startsWith("ru") ? "ru" : "en";
}
function resolveLocale(mode, device) {
	return mode === "auto" ? device : mode;
}
function translate(locale, key, vars) {
	let text = (locale === "ru" ? ru[key] : en[key]) ?? en[key] ?? key;
	if (vars) for (const [name, value] of Object.entries(vars)) text = text.replaceAll(`{${name}}`, String(value));
	return text;
}
function monthLabel(locale, key) {
	const month = Number(key.slice(5, 7));
	const year = key.slice(0, 4);
	return `${MONTHS[locale][month - 1] ?? ""} ${year}`;
}
function monthShortLabel(locale, month) {
	return MONTHS_SHORT[locale][month - 1] ?? "";
}
function daysLeftLabel(locale, n) {
	if (locale === "en") return n === 1 ? translate(locale, "dayLeft") : translate(locale, "daysLeft", { n });
	const mod10 = n % 10;
	const mod100 = n % 100;
	if (mod10 === 1 && mod100 !== 11) return `ещё ${n} день`;
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `ещё ${n} дня`;
	return `ещё ${n} дней`;
}
function weekHead(locale) {
	return WEEK_HEAD[locale];
}
function fullDate(locale, iso) {
	const [y, m, d] = iso.split("-").map(Number);
	const dt = new Date(y, m - 1, d);
	const w = WEEKDAYS[locale][dt.getDay()];
	if (locale === "ru") return `${w}, ${d} ${MONTHS_SHORT.ru[m - 1]} ${y}`;
	return `${w}, ${d} ${MONTHS_SHORT.en[m - 1]} ${y}`;
}
function trendStamp(locale, iso) {
	const m = Number(iso.slice(5, 7));
	const d = Number(iso.slice(8, 10));
	if (locale === "ru") return `${d} ${MONTHS_SHORT.ru[m - 1]}`;
	return `${MONTHS_SHORT.en[m - 1]} ${d}`;
}
function dayHeading(locale, iso, today) {
	if (iso === today) return translate(locale, "today");
	const [y, m, d] = today.split("-").map(Number);
	const prev = new Date(y, m - 1, d - 1);
	if (iso === `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}-${String(prev.getDate()).padStart(2, "0")}`) return locale === "ru" ? "Вчера" : "Yesterday";
	return fullDate(locale, iso);
}
function catLabel(locale, id) {
	return translate(locale, CAT[id]);
}
function accountTitle(locale, account) {
	if (account.id === "main" && account.name === "Main") return locale === "ru" ? "Основной" : "Main";
	if (account.id === "saving" && account.name === "Saving") return locale === "ru" ? "Накопления" : "Saving";
	return account.name;
}
function projectTitle(locale, project) {
	if (project.id === "seed-home" && project.name === "Apartment") return locale === "ru" ? "Квартира" : "Apartment";
	if (project.id === "seed-car" && project.name === "City car") return locale === "ru" ? "Городская машина" : "City car";
	return project.name;
}
function directionLabel(locale, pct) {
	if (pct > 3) return translate(locale, "increasing");
	if (pct < -3) return translate(locale, "decreasing");
	return translate(locale, "steady");
}
function savingWord(locale, rate) {
	if (rate >= 15) return translate(locale, "strong");
	if (rate >= 8) return translate(locale, "building");
	return translate(locale, "low");
}
function useI18n() {
	const mode = useFinance((s) => s.localeMode);
	const [device, setDevice] = (0, import_react.useState)("en");
	(0, import_react.useEffect)(() => {
		setDevice(deviceLocale());
	}, []);
	const locale = resolveLocale(mode, device);
	const t = (key, vars) => translate(locale, key, vars);
	return {
		locale,
		t,
		mode
	};
}
function ClientOnly({ children, className }) {
	const [on, setOn] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setOn(true), []);
	if (!on) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className,
		children
	});
}
function BudgetRing({ fraction, amount, negative, onClick }) {
	const gid = (0, import_react.useId)().replace(/:/g, "");
	const { t } = useI18n();
	const size = 280;
	const stroke = 22;
	const r = 112;
	const c = 2 * Math.PI * r;
	const dash = round1(c * Math.max(0, Math.min(1, fraction)));
	const gap = round1(c - dash);
	const dots = 46;
	const dotR = 78;
	const n = (v) => round1(v);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: "relative mx-auto block",
		"aria-label": t("editBudget"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
			width: size,
			height: size,
			viewBox: `0 0 ${size} ${size}`,
			"aria-hidden": true,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
					id: gid,
					x1: "0",
					y1: "1",
					x2: "1",
					y2: "0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "0%",
							stopColor: "#7af0ff"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "42%",
							stopColor: "#3ad7ff"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "100%",
							stopColor: "#1aa4ff"
						})
					]
				}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
					transform: `rotate(248 ${size / 2} ${size / 2})`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: size / 2,
						cy: size / 2,
						r,
						fill: "none",
						stroke: "rgba(56, 120, 170, 0.28)",
						strokeWidth: 16
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: size / 2,
						cy: size / 2,
						r,
						fill: "none",
						stroke: `url(#${gid})`,
						strokeWidth: stroke,
						strokeLinecap: "round",
						strokeDasharray: `${dash} ${gap}`,
						style: { filter: "drop-shadow(0 0 10px rgba(58,215,255,0.65))" }
					})]
				}),
				Array.from({ length: dots }).map((_, i) => {
					const a = i / dots * Math.PI * 2 - Math.PI / 2;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
						cx: n(size / 2 + Math.cos(a) * dotR),
						cy: n(size / 2 + Math.sin(a) * dotR),
						r: 2.1,
						fill: "rgba(90, 170, 220, 0.72)"
					}, i);
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "absolute inset-0 flex flex-col items-center justify-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: `text-hero font-semibold tracking-tight ${negative ? "text-danger" : ""}`,
				children: amount
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-1 max-w-[9.2rem] text-center text-sm leading-tight text-muted",
				children: t("leftToSpend")
			})]
		})]
	});
}
function round1(n) {
	return Math.round(n * 10) / 10;
}
function Spark({ values, color = "var(--color-cyan)" }) {
	const clean = values.filter((v) => Number.isFinite(v));
	if (clean.length < 2) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-12" });
	const w = 150;
	const h = 52;
	const pad = 4;
	const min = Math.min(...clean);
	const span = Math.max(...clean) - min || 1;
	const pts = clean.map((v, i) => {
		return [pad + i / (clean.length - 1) * 142, 48 - (v - min) / span * 44];
	});
	const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
	const last = pts[pts.length - 1];
	const fill = `${d} L${last[0].toFixed(1)},${h} L${pts[0][0].toFixed(1)},${h} Z`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: `0 0 ${w} ${h}`,
		className: "mt-1 h-12 w-full",
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: fill,
				fill: color,
				opacity: .16
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d,
				fill: "none",
				stroke: color,
				strokeWidth: 2.4,
				strokeLinecap: "round",
				strokeLinejoin: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: last[0],
				cy: last[1],
				r: 3.3,
				fill: color
			})
		]
	});
}
function MiniDonut({ slices }) {
	const total = slices.reduce((s, x) => s + x.value, 0) || 1;
	const r = 28;
	const c = 2 * Math.PI * r;
	let offset = 0;
	const gap = slices.length > 1 ? 3 : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 80 80",
		className: "mx-auto h-[4.6rem] w-[4.6rem]",
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
			transform: "rotate(-90 40 40)",
			children: slices.map((slice, i) => {
				const len = Math.max(0, slice.value / total * c - gap);
				const el = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "40",
					cy: "40",
					r,
					fill: "none",
					stroke: slice.color,
					strokeWidth: "11",
					strokeDasharray: `${len} ${c - len}`,
					strokeDashoffset: -offset,
					strokeLinecap: "butt"
				}, i);
				offset += slice.value / total * c;
				return el;
			})
		})
	});
}
function Gauge({ pct }) {
	const gid = (0, import_react.useId)().replace(/:/g, "");
	const visual = Math.max(0, Math.min(1, pct / 40));
	const r = 46;
	const len = Math.PI * r;
	const a = Math.PI * (1 - visual);
	const cx = round1(60 + r * Math.cos(a));
	const cy = round1(60 - r * Math.sin(a));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 120 72",
		className: "h-16 w-full",
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
				id: gid,
				x1: "0",
				y1: "0",
				x2: "1",
				y2: "0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "0%",
						stopColor: "#3ddc97"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "48%",
						stopColor: "#3ad7ff"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
						offset: "100%",
						stopColor: "#4c8dff"
					})
				]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M14 60 A46 46 0 0 1 106 60",
				fill: "none",
				stroke: "rgba(255,255,255,0.08)",
				strokeWidth: "9",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M14 60 A46 46 0 0 1 106 60",
				fill: "none",
				stroke: `url(#${gid})`,
				strokeWidth: "9",
				strokeLinecap: "round",
				strokeDasharray: `${round1(len * visual)} ${round1(len)}`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx,
				cy,
				r: "7",
				fill: "#071018",
				stroke: "#d9f7ff",
				strokeWidth: "3",
				style: { filter: "drop-shadow(0 0 6px rgba(58,215,255,0.9))" }
			})
		]
	});
}
function UpcomingBars({ items }) {
	const max = Math.max(1, ...items.map((i) => i.amount));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative mt-2 h-16",
		children: [items.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "absolute bottom-4 w-1.5 rounded-sm bg-savings",
			style: {
				left: `${(item.day - 1) / 30 * 100}%`,
				height: `${Math.max(12, item.amount / max * 70)}%`
			}
		}, `${item.day}-${i}`)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "absolute inset-x-0 bottom-0 flex justify-between text-micro text-faint",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "1" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "7" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "13" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "19" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "25" })
			]
		})]
	});
}
function FlowBars({ parts, ratio }) {
	const total = parts.reduce((s, p) => s + p.value, 0) || 1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3 space-y-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-micro text-faint",
				children: "↓"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2.5 flex-1 rounded-full bg-cyan" })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-micro text-faint",
				children: "↑"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex h-2.5 overflow-hidden rounded-full",
				style: { width: `${Math.max(12, Math.min(100, ratio * 100))}%` },
				children: parts.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: {
					width: `${p.value / total * 100}%`,
					background: p.color
				} }, i))
			})]
		})]
	});
}
function ChartTip({ active, payload, label }) {
	if (!active || !payload?.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-bg/95 px-3 py-2 text-micro shadow-lg ring-1 ring-white/10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-1 text-muted",
			children: label
		}), payload.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "size-2 rounded-full",
					style: { background: p.color }
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-muted",
					children: p.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-medium",
					children: formatMoney(Number(p.value) || 0)
				})
			]
		}, String(p.name)))]
	});
}
function TrendChart({ current, average, cutoff, currentName = "This month", averageName = "Average" }) {
	const data = current.map((value, i) => ({
		day: i + 1,
		current: i < cutoff ? value : null,
		average: average[i] ?? 0
	}));
	const peak = Math.max(1, ...data.map((d) => Math.max(d.current ?? 0, d.average)));
	const last = data[Math.max(0, cutoff - 1)] ?? data[data.length - 1];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientOnly, {
		className: "h-64 w-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ComposedChart, {
				data,
				margin: {
					top: 16,
					right: 12,
					left: 0,
					bottom: 0
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
						id: "spendFill",
						x1: "0",
						y1: "0",
						x2: "0",
						y2: "1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "0%",
							stopColor: "var(--color-cyan)",
							stopOpacity: .35
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "100%",
							stopColor: "var(--color-cyan)",
							stopOpacity: 0
						})]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, { stroke: "rgba(255,255,255,0.06)" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
						dataKey: "day",
						ticks: [
							5,
							10,
							15,
							20,
							25,
							30
						].filter((d) => d <= data.length),
						tick: {
							fill: "var(--color-faint)",
							fontSize: 11
						},
						axisLine: false,
						tickLine: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
						orientation: "right",
						domain: [0, Math.ceil(peak / 200) * 200],
						tick: {
							fill: "var(--color-faint)",
							fontSize: 11
						},
						axisLine: false,
						tickLine: false,
						width: 52,
						tickFormatter: (v) => v >= 1e3 ? `€${(v / 1e3).toFixed(1)}K` : v === 0 ? "0,00 €" : formatMoney(v, 0)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartTip, {}) }),
					cutoff > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceLine, {
						x: cutoff,
						stroke: "rgba(255,255,255,0.45)",
						strokeDasharray: "3 4"
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
						type: "monotone",
						dataKey: "current",
						name: currentName,
						stroke: "var(--color-cyan)",
						strokeWidth: 3,
						fill: "url(#spendFill)",
						dot: false,
						isAnimationActive: false,
						connectNulls: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
						type: "monotone",
						dataKey: "average",
						name: averageName,
						stroke: "#e7edf6",
						strokeWidth: 2.4,
						strokeDasharray: "5 5",
						dot: false,
						isAnimationActive: false
					}),
					last && last.current != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReferenceDot, {
						x: last.day,
						y: last.current,
						r: 5,
						fill: "var(--color-cyan)",
						stroke: "none"
					}) : null
				]
			})
		})
	});
}
function StackedMonths({ rows, keys }) {
	const data = rows.map((r) => ({
		label: r.label,
		...r.parts
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientOnly, {
		className: "h-56 w-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
				data,
				margin: {
					top: 8,
					right: 0,
					left: 0,
					bottom: 0
				},
				barCategoryGap: "28%",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
						dataKey: "label",
						tick: {
							fill: "var(--color-faint)",
							fontSize: 11
						},
						axisLine: false,
						tickLine: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
						content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartTip, {}),
						cursor: { fill: "rgba(255,255,255,0.04)" }
					}),
					keys.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
						dataKey: k.id,
						name: k.label ?? k.id,
						stackId: "s",
						fill: k.color
					}, k.id))
				]
			})
		})
	});
}
function BalanceChart({ points, seriesName = "Balance" }) {
	const ticks = points.filter((_, i) => i % Math.ceil(points.length / 4) === 0).map((p) => p.date);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClientOnly, {
		className: "h-52 w-full",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
			width: "100%",
			height: "100%",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
				data: points,
				margin: {
					top: 16,
					right: 8,
					left: 8,
					bottom: 0
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
						id: "balFill",
						x1: "0",
						y1: "0",
						x2: "0",
						y2: "1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "0%",
							stopColor: "var(--color-good)",
							stopOpacity: .28
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
							offset: "100%",
							stopColor: "var(--color-good)",
							stopOpacity: 0
						})]
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
						stroke: "rgba(255,255,255,0.05)",
						vertical: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
						dataKey: "date",
						ticks,
						tickFormatter: (d) => d.slice(5, 7).replace(/^0/, ""),
						tick: {
							fill: "var(--color-faint)",
							fontSize: 11
						},
						axisLine: false,
						tickLine: false
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartTip, {}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
						type: "monotone",
						dataKey: "value",
						name: seriesName,
						stroke: "var(--color-good)",
						strokeWidth: 2.5,
						fill: "url(#balFill)",
						dot: false
					})
				]
			})
		})
	});
}
function Sankey({ links, mode }) {
	const { t } = useI18n();
	if (!links.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "py-16 text-center text-muted",
		children: t("nothingSpent")
	});
	const total = links.reduce((s, l) => s + l.value, 0) || 1;
	const label = (value) => mode === "pct" ? `${Math.round(value / total * 1e3) / 10}%` : formatMoney(value, 2);
	const right = [...links].sort((a, b) => b.value - a.value || a.target.localeCompare(b.target));
	const groups = [];
	for (const link of links) {
		const found = groups.find((g) => g.name === link.source);
		if (found) found.value += link.value;
		else groups.push({
			name: link.source,
			color: link.color,
			value: link.value
		});
	}
	groups.sort((a, b) => b.value - a.value);
	const slot = 22;
	const height = 16 + right.length * slot;
	const rightNodes = right.map((link, i) => {
		const thick = Math.max(3.5, Math.min(14, link.value / (right[0]?.value || 1) * 16));
		const top = 10 + i * slot;
		return {
			y: top + (slot - thick) / 2,
			h: thick,
			labelY: top + slot / 2 + 1
		};
	});
	const leftNodes = layout(groups.map((g) => g.value), height - 20, 10);
	const xCat = 126;
	const xMerch = 200;
	const ribbons = right.map((link, i) => {
		const gi = groups.findIndex((g) => g.name === link.source);
		const g = groups[gi];
		const siblings = right.filter((l) => l.source === link.source);
		const before = siblings.slice(0, siblings.indexOf(link)).reduce((s, l) => s + l.value, 0);
		const top = leftNodes[gi].y + before / g.value * leftNodes[gi].h;
		const bot = top + link.value / g.value * leftNodes[gi].h;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: ribbon(129, top, bot, xMerch, rightNodes[i].y, rightNodes[i].y + rightNodes[i].h),
			fill: link.color,
			opacity: .62
		}, `${link.source}-${link.target}`);
	});
	const inflow = groups.map((g, i) => {
		const node = leftNodes[i];
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: ribbon(36, node.y + 4, node.y + node.h - 4, xCat, node.y, node.y + node.h),
			fill: g.color,
			opacity: .38
		}, g.name);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: `0 0 390 ${height}`,
		className: "w-full",
		role: "img",
		"aria-label": "Money flow",
		children: [
			inflow,
			ribbons,
			groups.map((g, i) => {
				const node = leftNodes[i];
				const mid = node.y + node.h / 2;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: 18,
						y: round1(mid - 16),
						width: 100,
						height: 32,
						rx: 8,
						fill: "rgba(6, 16, 16, 0.72)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
						x: xCat,
						y: round1(node.y),
						width: 3,
						height: round1(node.h),
						rx: 1.5,
						fill: g.color
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						x: 112,
						y: round1(mid - 2),
						textAnchor: "end",
						fill: "#f5f7fb",
						fontSize: "11",
						fontWeight: 600,
						fontFamily: "Outfit, sans-serif",
						children: g.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
						x: 112,
						y: round1(mid + 12),
						textAnchor: "end",
						fill: "#c5d0e0",
						fontSize: "10",
						fontFamily: "Outfit, sans-serif",
						children: label(g.value)
					})
				] }, g.name);
			}),
			right.map((n, i) => {
				const node = rightNodes[i];
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
					x: xMerch,
					y: round1(node.y),
					width: 3,
					height: round1(Math.max(6, node.h)),
					rx: 1.5,
					fill: n.color
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("text", {
					x: 208,
					y: round1(node.labelY),
					fill: "#f5f7fb",
					fontSize: "11",
					fontFamily: "Outfit, sans-serif",
					children: [
						n.target,
						" ",
						label(n.value)
					]
				})] }, n.target);
			})
		]
	});
}
function layout(values, span, origin) {
	const total = values.reduce((s, v) => s + v, 0) || 1;
	const gap = 4;
	const usable = span - gap * Math.max(0, values.length - 1);
	const min = 36;
	const raw = values.map((v) => Math.max(min, v / total * usable));
	const scale = usable / raw.reduce((s, v) => s + v, 0);
	let y = origin;
	return raw.map((h) => {
		const node = {
			y,
			h: h * scale
		};
		y += node.h + gap;
		return node;
	});
}
function ribbon(x1, y1a, y1b, x2, y2a, y2b) {
	const c = (x2 - x1) * .55;
	return `M ${x1} ${y1a} C ${x1 + c} ${y1a}, ${x2 - c} ${y2a}, ${x2} ${y2a} L ${x2} ${y2b} C ${x2 - c} ${y2b}, ${x1 + c} ${y1b}, ${x1} ${y1b} Z`;
}
var ICONS = [
	[/coffee|cappuccino/i, Coffee],
	[/insurance|shield/i, Shield],
	[/transit|train|pass/i, TrainFront],
	[/rent|housing/i, House],
	[/salary|paycheck/i, Briefcase],
	[/fuel|gas/i, Fuel],
	[/car|loan/i, Car],
	[/dining|dinner|lunch|grocer/i, Utensils],
	[/internet|wifi/i, Wifi],
	[/phone/i, Smartphone],
	[/saving|invest|retirement/i, PiggyBank],
	[/shop|cloud|storage/i, ShoppingBag],
	[/gym|wellness|pharmacy/i, Repeat]
];
function iconFor(title) {
	return ICONS.find(([re]) => re.test(title))?.[1] ?? Wallet;
}
function TxnAvatar({ title, color }) {
	const Icon = iconFor(title);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "grid size-11 shrink-0 place-items-center rounded-full",
		style: {
			background: `${color}22`,
			color
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { size: 18 })
	});
}
function ScreenHeader({ title, subtitle, onClose, right }) {
	const { t } = useI18n();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid grid-cols-[44px_1fr_44px] items-center gap-2 px-4 pt-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "icon-btn",
				onClick: onClose,
				"aria-label": t("close"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 18 })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-base font-semibold",
					children: title
				}), subtitle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm text-muted",
					children: subtitle
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "justify-self-end",
				children: right
			})
		]
	});
}
function TrendScreen({ txns, month, today, onClose }) {
	const model = trendModel(txns, month, today);
	const { t, locale } = useI18n();
	const word = directionLabel(locale, model.pct);
	const stamp = today.startsWith(month) ? today : `${month}-01`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pb-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
			title: t("spendingTrend"),
			subtitle: monthLabel(locale, month),
			onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 text-sm text-muted",
					children: trendStamp(locale, stamp)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-1 flex items-end gap-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-4xl font-semibold tracking-tight",
						children: formatMoney(model.nowValue)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: `mt-2 inline-flex items-center gap-1 text-sm ${model.pct >= 0 ? "text-cyan" : "text-good"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-5 place-items-center rounded-full bg-white/10 text-micro",
						children: model.pct >= 0 ? "↑" : "↓"
					}), formatPct(Math.abs(model.pct), false)]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 rounded-3xl bg-black/20 p-2 ring-1 ring-white/5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendChart, {
						current: model.current,
						average: model.averages,
						cutoff: model.cutoff,
						currentName: monthLabel(locale, month),
						averageName: t("average")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-4 px-3 pb-2 text-sm text-muted",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-full bg-cyan" }),
								" ",
								monthLabel(locale, month)
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-full bg-white/50" }),
								" ",
								t("average")
							]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-8 text-lg font-semibold",
					children: t("whatTrend")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-muted",
					children: t("trendBody")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm leading-relaxed text-muted",
					children: t("trendBody2", {
						word: word.toLowerCase(),
						pct: formatPct(model.pct)
					})
				})
			]
		})]
	});
}
function FlowScreen({ txns, month, today, onClose }) {
	const [mode, setMode] = (0, import_react.useState)("eur");
	const { t, locale } = useI18n();
	const links = moneyFlow(txns.filter((t) => t.date.startsWith(month) && t.date <= today)).map((link) => ({
		...link,
		source: catLabel(locale, link.categoryId)
	}));
	const share = async () => {
		const lines = links.map((l) => `${l.source} → ${l.target}: ${formatMoney(l.value, 2)}`);
		const text = `${t("shareText")} · ${monthLabel(locale, month)}\n${lines.join("\n")}`;
		try {
			if (navigator.share) await navigator.share({
				title: t("shareText"),
				text
			});
			else {
				await navigator.clipboard.writeText(text);
				toast(t("summaryCopied"));
			}
		} catch {}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pb-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
			title: t("moneyFlow"),
			subtitle: monthLabel(locale, month),
			onClose,
			right: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "icon-btn",
				onClick: share,
				"aria-label": t("share"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share, { size: 16 })
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative mt-4 rounded-3xl bg-black/15 p-3 ring-1 ring-white/10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-2 flex justify-end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "segmented text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"data-on": mode === "eur",
								onClick: () => setMode("eur"),
								children: "€"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"data-on": mode === "pct",
								onClick: () => setMode("pct"),
								children: "%"
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sankey, {
						links,
						mode
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-6 px-1 text-lg font-semibold",
					children: t("whatFlow")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 px-1 text-sm leading-relaxed text-muted",
					children: t("flowBody")
				})
			]
		})]
	});
}
function BreakdownScreen({ txns, month, today, scope, onClose, onCategory }) {
	const [hidden, setHidden] = (0, import_react.useState)([]);
	const [filtering, setFiltering] = (0, import_react.useState)(false);
	const { t, locale } = useI18n();
	const year = Number(month.slice(0, 4));
	const through = Number(month.slice(5, 7));
	const posted = txns.filter((t) => t.date.startsWith(month) && t.date <= today && !hidden.includes(t.categoryId));
	const model = yearModel(txns.filter((t) => !hidden.includes(t.categoryId)), year, through);
	const monthParts = CATEGORIES.map((c) => ({
		...c,
		value: posted.filter((t) => t.categoryId === c.id).reduce((s, t) => s + t.amount, 0)
	})).filter((c) => c.value > 0);
	const monthTotal = monthParts.reduce((s, c) => s + c.value, 0);
	const yearParts = CATEGORIES.map((c) => ({
		...c,
		value: model.rows.reduce((s, r) => s + (r.parts[c.id] ?? 0), 0)
	})).filter((c) => c.value > .5).sort((a, b) => b.value - a.value);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pb-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
			title: t("breakdown"),
			subtitle: scope === "year" ? String(year) : monthLabel(locale, month),
			onClose,
			right: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "icon-btn",
				"aria-label": t("filter"),
				onClick: () => setFiltering(true),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { size: 16 })
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-5",
			children: [scope === "month" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto mt-4 grid h-64 w-64 place-items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DonutLarge, { slices: monthParts }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-3xl font-semibold tracking-tight",
						children: formatMoney(monthTotal, 2)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm text-muted",
						children: t("totalSpending")
					})]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "sheet-card mt-2 divide-y divide-white/5",
				children: [monthParts.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "flex w-full items-center gap-3 px-4 py-3.5 text-left",
					onClick: () => onCategory(c.id),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "size-2.5 rounded-full",
							style: { background: c.color }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex-1 font-medium",
							children: catLabel(locale, c.id)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatMoney(c.value, 2) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
							size: 16,
							className: "text-muted"
						})
					]
				}) }, c.id)), monthParts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "px-4 py-8 text-center text-muted",
					children: t("nothingSpent")
				}) : null]
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 text-4xl font-semibold tracking-tight",
					children: formatMoney(model.total)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: t("totalSpending")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StackedMonths, {
						rows: model.rows.map((row) => ({
							...row,
							label: monthShortLabel(locale, row.month)
						})),
						keys: CATEGORIES.filter((c) => !hidden.includes(c.id)).map((c) => ({
							id: c.id,
							color: c.color,
							label: catLabel(locale, c.id)
						}))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "sheet-card p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: t("monthlyAvg")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xl font-semibold",
								children: formatMoney(model.avg, 2)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: directionLabel(locale, model.direction === "Increasing" ? 10 : model.direction === "Decreasing" ? -10 : 0)
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "sheet-card p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: t("peak")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xl font-semibold",
								children: formatMoney(model.peak?.total ?? 0, 2)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: model.peak ? monthShortLabel(locale, model.peak.month) : "—"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4",
					children: yearParts.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "flex w-full items-center gap-3 py-3 text-left",
						onClick: () => onCategory(c.id),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "size-2.5 rounded-full",
								style: { background: c.color }
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex-1",
								children: catLabel(locale, c.id)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatMoney(c.value, 2) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
								size: 16,
								className: "text-muted"
							})
						]
					}) }, c.id))
				})
			] }), filtering ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-20 grid place-items-end bg-black/50 p-4",
				onClick: () => setFiltering(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "sheet-card w-full max-w-sm bg-bg p-4",
					onClick: (e) => e.stopPropagation(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 font-semibold",
						children: t("categories")
					}), CATEGORIES.map((c) => {
						const on = !hidden.includes(c.id);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "flex w-full items-center gap-3 py-2 text-left",
							onClick: () => setHidden((h) => on ? [...h, c.id] : h.filter((x) => x !== c.id)),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "size-2.5 rounded-full",
									style: { background: c.color }
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex-1",
									children: catLabel(locale, c.id)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm text-muted",
									children: on ? t("shownWord") : t("hiddenWord")
								})
							]
						}, c.id);
					})]
				})
			}) : null]
		})]
	});
}
function DonutLarge({ slices }) {
	const total = slices.reduce((s, x) => s + x.value, 0) || 1;
	const r = 92;
	const c = 2 * Math.PI * r;
	let offset = 0;
	const gap = slices.length > 1 ? 6 : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 240 240",
		className: "h-64 w-64",
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("g", {
			transform: "rotate(-40 120 120)",
			children: slices.map((slice, i) => {
				const len = Math.max(0, slice.value / total * c - gap);
				const el = /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
					cx: "120",
					cy: "120",
					r,
					fill: "none",
					stroke: slice.color,
					strokeWidth: "26",
					strokeLinecap: "round",
					strokeDasharray: `${len} ${c - len}`,
					strokeDashoffset: -offset
				}, i);
				offset += slice.value / total * c;
				return el;
			})
		})
	});
}
function SavingScreen({ txns, month, today, onClose }) {
	const stats = savingStats(txns, month, today);
	const { t, locale } = useI18n();
	const spent = txns.filter((t) => t.date.startsWith(month) && t.date <= today && t.kind === "expense" && t.categoryId !== "savings").reduce((s, t) => s + t.amount, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pb-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
			title: t("saving"),
			subtitle: monthLabel(locale, month),
			onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-8 text-center text-5xl font-semibold tracking-tight",
					children: formatPct(stats.rate)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-center text-muted",
					children: t("ofIncome")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto mt-4 max-w-xs",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GaugeBig, { pct: stats.rate })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-center font-medium text-cyan",
					children: savingWord(locale, stats.rate)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "sheet-card mt-6 divide-y divide-white/5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: t("income"),
							v: formatMoney(stats.income, 2)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: t("saved"),
							v: formatMoney(stats.saved, 2)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							k: t("otherSpending"),
							v: formatMoney(spent, 2)
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-8 text-lg font-semibold",
					children: t("whatSaving")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-muted",
					children: t("savingBody")
				})
			]
		})]
	});
}
function Row({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-medium",
			children: v
		})]
	});
}
function GaugeBig({ pct }) {
	const p = Math.max(0, Math.min(100, pct)) / 100;
	const r = 90;
	const len = Math.PI * r;
	const a = Math.PI * (1 - p);
	const cx = 120 + r * Math.cos(a);
	const cy = 120 - r * Math.sin(a);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 240 140",
		className: "w-full",
		"aria-hidden": true,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M24 120 A96 96 0 0 1 216 120",
				fill: "none",
				stroke: "rgba(255,255,255,0.1)",
				strokeWidth: "14",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M24 120 A96 96 0 0 1 216 120",
				fill: "none",
				stroke: "var(--color-cyan)",
				strokeWidth: "14",
				strokeLinecap: "round",
				strokeDasharray: `${len * p} ${len}`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx,
				cy,
				r: "9",
				fill: "var(--color-bg)",
				stroke: "var(--color-cyan)",
				strokeWidth: "4"
			})
		]
	});
}
function useUpcomingGroups(txns, month, today) {
	return (0, import_react.useMemo)(() => {
		const items = txns.filter((t) => t.date.startsWith(month) && t.date > today && (t.kind === "expense" || t.categoryId)).sort((a, b) => a.date.localeCompare(b.date));
		const groups = [];
		for (const tx of items) {
			const last = groups[groups.length - 1];
			if (!last || last.date !== tx.date) groups.push({
				date: tx.date,
				items: [tx]
			});
			else last.items.push(tx);
		}
		return {
			items,
			groups,
			total: items.reduce((s, t) => s + t.amount, 0)
		};
	}, [
		txns,
		month,
		today
	]);
}
function UpcomingScreen({ txns, month, today, onOpen, onClose }) {
	const { groups, total } = useUpcomingGroups(txns, month, today);
	const { t, locale } = useI18n();
	const projects = useFinance((s) => s.projects);
	const byDay = /* @__PURE__ */ new Map();
	for (const g of groups) byDay.set(Number(g.date.slice(8, 10)), g.items.reduce((s, t) => s + t.amount, 0));
	const { year, month: m } = {
		year: Number(month.slice(0, 4)),
		month: Number(month.slice(5, 7))
	};
	const mondayIndex = (new Date(year, m - 1, 1).getDay() + 6) % 7;
	const dim = new Date(year, m, 0).getDate();
	const cells = [...Array(mondayIndex).fill(null), ...Array.from({ length: dim }, (_, i) => i + 1)];
	const todayDay = today.startsWith(month) ? Number(today.slice(8, 10)) : -1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pb-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
			title: t("upcomingTx"),
			subtitle: monthLabel(locale, month),
			onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 text-4xl font-semibold",
					children: formatMoney(total)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: t("upcomingExpenses")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "cal mt-4",
					children: [weekHead(locale).map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pb-2 text-center text-micro tracking-wide text-faint",
						children: d
					}, d)), cells.map((day, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex min-h-12 flex-col items-center py-1",
						children: day ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `grid size-8 place-items-center rounded-full text-sm ${day === todayDay ? "bg-transport font-semibold" : ""}`,
							children: day
						}), byDay.has(day) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-micro text-cyan",
							children: [Math.round(byDay.get(day)), " €"]
						}) : null] }) : null
					}, i))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 space-y-4",
					children: [groups.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mb-2 text-sm font-semibold",
						children: fullDate(locale, g.date)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2",
						children: g.items.map((tx) => {
							const cat = tx.categoryId ? categoryById(tx.categoryId) : null;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "txn w-full text-left",
								onClick: () => onOpen(tx),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TxnAvatar, {
										title: tx.title,
										color: cat?.color ?? "var(--color-muted)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block truncate font-medium",
											children: tx.id.startsWith("plan:") ? projectTitle(locale, projects.find((p) => p.id === tx.id.split(":")[1]) ?? {
												id: tx.id,
												name: tx.title
											}) : tx.title
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex min-w-0 items-center gap-1 truncate text-sm text-muted",
											children: [tx.recurring ? t("monthly") : cat ? catLabel(locale, cat.id) : "", tx.recurring ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Repeat, { size: 12 }) : null]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "shrink-0 font-medium",
										children: formatSigned(-tx.amount, 2)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
										size: 16,
										className: "text-muted"
									})
								]
							}, tx.id);
						})
					})] }, g.date)), groups.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "py-8 text-center text-muted",
						children: t("nothingScheduled")
					}) : null]
				})
			]
		})]
	});
}
var BackupError = class extends Error {
	code;
	constructor(code) {
		super(code);
		this.code = code;
	}
};
var TEXT = new TextEncoder();
var TEXT_DEC = new TextDecoder();
function bytesToB64url(bytes) {
	let raw = "";
	const step = 32768;
	for (let i = 0; i < bytes.length; i += step) raw += String.fromCharCode(...bytes.subarray(i, i + step));
	return btoa(raw).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function b64urlToBytes(value) {
	const pad = value.length % 4 === 0 ? "" : "=".repeat(4 - value.length % 4);
	const bin = atob(value.replace(/-/g, "+").replace(/_/g, "/") + pad);
	const out = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
	return out;
}
function copyBytes(bytes) {
	const copy = new Uint8Array(bytes.byteLength);
	copy.set(bytes);
	return copy;
}
async function gzip(text) {
	const stream = new Blob([copyBytes(TEXT.encode(text))]).stream().pipeThrough(new CompressionStream("gzip"));
	return new Uint8Array(await new Response(stream).arrayBuffer());
}
async function gunzip(bytes) {
	const stream = new Blob([copyBytes(bytes)]).stream().pipeThrough(new DecompressionStream("gzip"));
	return TEXT_DEC.decode(await new Response(stream).arrayBuffer());
}
async function sha16(bytes) {
	return [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)).slice(0, 8)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function keyFrom(passphrase, salt) {
	const base = await crypto.subtle.importKey("raw", TEXT.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
	return crypto.subtle.deriveKey({
		name: "PBKDF2",
		salt,
		iterations: 12e4,
		hash: "SHA-256"
	}, base, {
		name: "AES-GCM",
		length: 256
	}, false, ["encrypt", "decrypt"]);
}
async function exportBackup(snapshot, passphrase = "") {
	const packed = await gzip(JSON.stringify(snapshot));
	const phrase = passphrase.trim();
	if (!phrase) {
		const body = JSON.stringify({
			v: 1,
			sum: await sha16(packed),
			d: bytesToB64url(packed)
		});
		return `LUMEN1.${bytesToB64url(TEXT.encode(body))}`;
	}
	const salt = crypto.getRandomValues(/* @__PURE__ */ new Uint8Array(16));
	const iv = crypto.getRandomValues(/* @__PURE__ */ new Uint8Array(12));
	const key = await keyFrom(phrase, salt);
	const ct = new Uint8Array(await crypto.subtle.encrypt({
		name: "AES-GCM",
		iv
	}, key, packed));
	const body = JSON.stringify({
		v: 1,
		salt: bytesToB64url(salt),
		iv: bytesToB64url(iv),
		ct: bytesToB64url(ct)
	});
	return `LUMEN1P.${bytesToB64url(TEXT.encode(body))}`;
}
async function importBackup(code, passphrase = "") {
	const trimmed = code.trim().replace(/\s+/g, "");
	const locked = trimmed.startsWith("LUMEN1P.");
	const open = trimmed.startsWith("LUMEN1.");
	if (!locked && !open) throw new BackupError("format");
	let envelope;
	try {
		const raw = TEXT_DEC.decode(b64urlToBytes(trimmed.slice(trimmed.indexOf(".") + 1)));
		envelope = JSON.parse(raw);
	} catch {
		throw new BackupError("format");
	}
	try {
		let packed;
		if (locked) {
			if (!passphrase.trim()) throw new BackupError("passphrase");
			if (!envelope.salt || !envelope.iv || !envelope.ct) throw new BackupError("format");
			const salt = b64urlToBytes(envelope.salt);
			const iv = b64urlToBytes(envelope.iv);
			const key = await keyFrom(passphrase.trim(), salt);
			packed = new Uint8Array(await crypto.subtle.decrypt({
				name: "AES-GCM",
				iv
			}, key, b64urlToBytes(envelope.ct)));
		} else {
			if (!envelope.d || !envelope.sum) throw new BackupError("format");
			packed = b64urlToBytes(envelope.d);
			if (await sha16(packed) !== envelope.sum) throw new BackupError("damaged");
		}
		const parsed = JSON.parse(await gunzip(packed));
		if (parsed.v !== 1 || !Array.isArray(parsed.transactions) || !Array.isArray(parsed.accounts)) throw new BackupError("damaged");
		parsed.projects ??= [];
		return parsed;
	} catch (error) {
		if (error instanceof BackupError) throw error;
		if (locked) throw new BackupError("passphrase");
		throw new BackupError("damaged");
	}
}
function TxnList({ txns, onOpen }) {
	const { t, locale } = useI18n();
	const today = todayISO();
	if (!txns.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "py-8 text-center text-sm text-muted",
		children: t("noTransactions")
	});
	const groups = [];
	for (const tx of txns) {
		const last = groups[groups.length - 1];
		if (!last || last.date !== tx.date) groups.push({
			date: tx.date,
			items: [tx]
		});
		else last.items.push(tx);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-4",
		children: groups.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "mb-2 text-sm text-muted",
			children: dayHeading(locale, g.date, today)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-2",
			children: g.items.map((tx) => {
				const cat = tx.categoryId ? categoryById(tx.categoryId) : null;
				const signed = tx.kind === "income" ? tx.amount : tx.kind === "transfer" && !tx.categoryId ? 0 : -tx.amount;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "txn w-full text-left",
					onClick: () => onOpen(tx.id),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TxnAvatar, {
							title: tx.title,
							color: cat?.color ?? "var(--color-cyan)"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate font-medium",
								children: tx.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block truncate text-sm text-muted",
								children: cat ? catLabel(locale, cat.id) : tx.kind === "income" ? t("income") : t("transfer")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `shrink-0 ${signed > 0 ? "text-good" : ""}`,
							children: tx.kind === "transfer" && !tx.categoryId ? formatSigned(0, 2) : formatSigned(signed, 2)
						})
					]
				}, tx.id);
			})
		})] }, g.date))
	});
}
function parseMoney(raw) {
	let s = raw.trim().replace(/[€\s]/g, "");
	if (!s) return NaN;
	if (s.includes(",") && s.includes(".")) s = s.replace(/\./g, "").replace(",", ".");
	else if (s.includes(",")) s = s.replace(",", ".");
	const n = Number(s);
	return Number.isFinite(n) ? n : NaN;
}
function MonthPicker({ month, onClose }) {
	const setMonth = useFinance((s) => s.setMonth);
	const { t, locale } = useI18n();
	const year = Number(month.slice(0, 4));
	const [y, setY] = (0, import_react.useState)(year);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "screen-plain absolute inset-0 z-10 flex flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
				title: t("month"),
				subtitle: t("jump"),
				onClose
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between px-6 pt-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "icon-btn",
						onClick: () => setY((v) => v - 1),
						"aria-label": t("previousYear"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { size: 18 })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xl font-semibold",
						children: y
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "icon-btn",
						onClick: () => setY((v) => v + 1),
						"aria-label": t("nextYear"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { size: 18 })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-3 gap-3 px-5 pt-6",
				children: Array.from({ length: 12 }, (_, i) => {
					const key = `${y}-${String(i + 1).padStart(2, "0")}`;
					const on = key === month;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"data-on": on,
						className: `rounded-2xl py-4 text-sm font-semibold ${on ? "bg-cyan text-bg" : "bg-white/5"}`,
						onClick: () => {
							setMonth(key);
							onClose();
						},
						children: monthShortLabel(locale, i + 1)
					}, key);
				})
			})
		]
	});
}
function BudgetScreen({ onClose }) {
	const month = useFinance((s) => s.month);
	const budget = useFinance((s) => s.budgets[month] ?? 3900);
	const allocation = useFinance((s) => s.allocations[month] ?? {});
	const setBudget = useFinance((s) => s.setBudget);
	const setAllocation = useFinance((s) => s.setAllocation);
	const { t, locale } = useI18n();
	const allocated = Object.values(allocation).reduce((s, n) => s + (n ?? 0), 0);
	const available = budget - allocated;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "screen-plain absolute inset-0 z-10 flex flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
			title: t("budget"),
			subtitle: monthLabel(locale, month),
			onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "phone-scroll px-5 pb-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "mt-6 block text-sm text-muted",
					htmlFor: "budget-total",
					children: t("monthlyBudget")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: "budget-total",
					className: "field mt-2 text-2xl font-semibold",
					inputMode: "decimal",
					defaultValue: String(budget).replace(".", ","),
					onBlur: (e) => {
						const n = parseMoney(e.target.value);
						if (Number.isFinite(n)) setBudget(month, n);
					}
				}, month + budget),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: `mt-3 text-sm ${available < 0 ? "text-danger" : "text-muted"}`,
					children: t("allocatedLine", {
						allocated: formatMoney(allocated),
						available: formatMoney(available)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-relaxed text-muted",
					children: t("budgetHelp")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6 space-y-3",
					children: CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "sheet-card flex items-center gap-3 px-3 py-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "size-2.5 rounded-full",
								style: { background: c.color }
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex-1 text-sm",
								children: catLabel(locale, c.id)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "field w-28 py-2 text-right",
								inputMode: "decimal",
								defaultValue: String(allocation[c.id] ?? 0).replace(".", ","),
								"aria-label": t("allocationFor", { name: catLabel(locale, c.id) }),
								onBlur: (e) => {
									const n = parseMoney(e.target.value);
									if (Number.isFinite(n)) setAllocation(month, c.id, n);
								}
							}, `${month}-${c.id}-${allocation[c.id] ?? 0}`)
						]
					}, c.id))
				})
			]
		})]
	});
}
function SettingsScreen({ onClose }) {
	const reset = useFinance((s) => s.reset);
	const restoreSnapshot = useFinance((s) => s.restoreSnapshot);
	const mode = useFinance((s) => s.localeMode);
	const setLocaleMode = useFinance((s) => s.setLocaleMode);
	const { t } = useI18n();
	const [phrase, setPhrase] = (0, import_react.useState)("");
	const [code, setCode] = (0, import_react.useState)("");
	const [paste, setPaste] = (0, import_react.useState)("");
	const [armed, setArmed] = (0, import_react.useState)(false);
	const copy = async () => {
		const state = useFinance.getState();
		const text = await exportBackup({
			v: 1,
			accounts: state.accounts,
			transactions: state.transactions,
			budgets: state.budgets,
			allocations: state.allocations,
			projects: state.projects,
			month: state.month,
			insightOrder: state.insightOrder,
			hiddenInsights: state.hiddenInsights
		}, phrase);
		setCode(text);
		try {
			await navigator.clipboard.writeText(text);
			toast(t("copied"));
		} catch {
			toast(t("copyFailed"));
		}
	};
	const restore = async () => {
		if (!armed) {
			setArmed(true);
			return;
		}
		try {
			restoreSnapshot(await importBackup(paste, phrase));
			toast(t("restored"));
			onClose();
		} catch (error) {
			setArmed(false);
			toast(error instanceof BackupError && error.code === "passphrase" ? t("needsPhrase") : t("badCode"));
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "screen-plain absolute inset-0 z-10 flex flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
			title: t("settings"),
			subtitle: "Lumen",
			onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "phone-scroll space-y-4 px-5 pb-12 pt-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm leading-relaxed text-muted",
					children: t("settingsBlurb")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold",
						children: t("language")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: t("languageHelp")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 grid grid-cols-3 gap-2 text-sm",
						children: [
							"auto",
							"en",
							"ru"
						].map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"data-on": mode === id,
							className: `rounded-2xl px-2 py-3 font-semibold ${mode === id ? "bg-cyan text-bg" : "bg-white/5"}`,
							onClick: () => setLocaleMode(id),
							children: t(id === "auto" ? "langAuto" : id === "en" ? "langEn" : "langRu")
						}, id))
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "sheet-card space-y-3 p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-semibold",
							children: t("backup")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm leading-relaxed text-muted",
							children: t("backupHelp")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "field",
							type: "password",
							autoComplete: "off",
							placeholder: t("passphrase"),
							"aria-label": t("passphrase"),
							value: phrase,
							onChange: (e) => setPhrase(e.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: t("passphraseHint")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "w-full rounded-2xl bg-white/10 py-3 font-semibold",
							onClick: () => void copy(),
							children: t("copyCode")
						}),
						code ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							className: "field min-h-28 text-xs",
							readOnly: true,
							value: code,
							"aria-label": t("backup")
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							className: "field min-h-28 text-xs",
							placeholder: t("pasteCode"),
							"aria-label": t("pasteCode"),
							value: paste,
							onChange: (e) => {
								setPaste(e.target.value);
								setArmed(false);
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "w-full rounded-2xl bg-cyan py-3 font-semibold text-bg",
							onClick: () => void restore(),
							disabled: !paste.trim(),
							children: armed ? t("restoreAsk") : t("restore")
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "w-full rounded-2xl bg-white/10 py-4 font-semibold",
					onClick: () => {
						reset();
						toast(t("resetDone"));
						onClose();
					},
					children: t("reset")
				})
			]
		})]
	});
}
function InsightsEditor({ onClose }) {
	const order = useFinance((s) => s.insightOrder);
	const hidden = useFinance((s) => s.hiddenInsights);
	const toggle = useFinance((s) => s.toggleInsight);
	const move = useFinance((s) => s.moveInsight);
	const { t } = useI18n();
	const label = {
		trend: t("trend"),
		top: t("top"),
		upcoming: t("upcoming"),
		saving: t("saving"),
		flow: t("flow"),
		accounts: t("accounts"),
		projects: t("goals")
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "screen-plain absolute inset-0 z-10 flex flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
			title: t("insights"),
			subtitle: t("showHide"),
			onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-2 px-5 pt-4",
			children: order.map((id) => {
				const on = !hidden.includes(id);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "sheet-card flex items-center gap-2 px-3 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "flex-1 text-left font-medium",
							onClick: () => toggle(id),
							children: [label[id], /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-0.5 block text-sm text-muted",
								children: on ? t("shown") : t("hidden")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "icon-btn",
							"aria-label": t("moveUp"),
							onClick: () => move(id, -1),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
								className: "rotate-90",
								size: 16
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "icon-btn",
							"aria-label": t("moveDown"),
							onClick: () => move(id, 1),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
								className: "rotate-90",
								size: 16
							})
						})
					]
				}, id);
			})
		})]
	});
}
function TransactionEditor({ id, date, seed, onClose }) {
	const accounts = useFinance((s) => s.accounts);
	const stored = useFinance((s) => id && !id.startsWith("proj-") ? s.transactions.find((t) => t.id === id) : void 0);
	const existing = stored ?? seed;
	const add = useFinance((s) => s.addTransaction);
	const update = useFinance((s) => s.updateTransaction);
	const remove = useFinance((s) => s.deleteTransaction);
	const { t, locale } = useI18n();
	const projected = !stored;
	const [kind, setKind] = (0, import_react.useState)(existing?.kind ?? "expense");
	const [amount, setAmount] = (0, import_react.useState)(existing ? String(existing.amount).replace(".", ",") : "");
	const [title, setTitle] = (0, import_react.useState)(existing?.title ?? "");
	const [categoryId, setCategoryId] = (0, import_react.useState)(existing?.categoryId ?? "food");
	const [accountId, setAccountId] = (0, import_react.useState)(existing?.accountId ?? accounts.find((a) => a.isDefault && a.kind === "spending")?.id ?? accounts[0]?.id);
	const [toAccountId, setToAccountId] = (0, import_react.useState)(existing?.toAccountId ?? accounts.find((a) => a.kind === "saving")?.id ?? "");
	const [when, setWhen] = (0, import_react.useState)(existing?.date ?? date ?? todayISO());
	const [recurring, setRecurring] = (0, import_react.useState)(!!existing?.recurring);
	const save = () => {
		const value = parseMoney(amount);
		if (!Number.isFinite(value) || value <= 0) {
			toast(t("enterAmount"));
			return;
		}
		if (!title.trim()) {
			toast(t("addName"));
			return;
		}
		const payload = {
			title: title.trim(),
			amount: value,
			kind,
			date: when,
			accountId,
			categoryId: kind === "income" ? void 0 : categoryId || void 0,
			toAccountId: kind === "transfer" ? toAccountId : void 0,
			recurring: kind === "expense" ? recurring : void 0,
			flow: existing?.flow
		};
		if (existing && !projected) update(existing.id, payload);
		else add(payload);
		toast(existing && !projected ? t("txUpdated") : t("txAdded"));
		onClose();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "screen-plain absolute inset-0 z-10 flex flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
			title: existing && !projected ? t("editTx") : t("newTx"),
			onClose,
			right: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "text-sm font-semibold text-cyan",
				onClick: save,
				children: t("save")
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "phone-scroll space-y-4 px-5 pb-16 pt-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "segmented",
					children: [
						"expense",
						"income",
						"transfer"
					].map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"data-on": kind === k,
						className: "flex-1",
						onClick: () => setKind(k),
						children: t(k)
					}, k))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "field text-3xl font-semibold",
					inputMode: "decimal",
					placeholder: "0,00",
					value: amount,
					onChange: (e) => setAmount(e.target.value),
					"aria-label": t("amount")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "field",
					placeholder: t("name"),
					value: title,
					onChange: (e) => setTitle(e.target.value),
					"aria-label": t("name")
				}),
				kind !== "income" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-2 gap-2",
					children: CATEGORIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setCategoryId(c.id),
						className: `rounded-2xl px-3 py-3 text-left text-sm ${categoryId === c.id ? "bg-white/15 ring-1 ring-white/30" : "bg-white/5"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mr-2 inline-block size-2 rounded-full",
							style: { background: c.color }
						}), catLabel(locale, c.id)]
					}, c.id))
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-sm text-muted",
					children: [t("account"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						className: "field mt-1",
						value: accountId,
						onChange: (e) => setAccountId(e.target.value),
						children: accounts.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: a.id,
							children: accountTitle(locale, a)
						}, a.id))
					})]
				}),
				kind === "transfer" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-sm text-muted",
					children: [t("to"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						className: "field mt-1",
						value: toAccountId,
						onChange: (e) => setToAccountId(e.target.value),
						children: accounts.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: a.id,
							children: accountTitle(locale, a)
						}, a.id))
					})]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-sm text-muted",
					children: [t("date"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "field mt-1",
						type: "date",
						value: when,
						onChange: (e) => setWhen(e.target.value)
					})]
				}),
				kind === "expense" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "sheet-card flex w-full items-center justify-between px-4 py-3",
					onClick: () => setRecurring((v) => !v),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("repeats") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `text-sm font-semibold ${recurring ? "text-cyan" : "text-muted"}`,
						children: recurring ? t("on") : t("off")
					})]
				}) : null,
				existing && !projected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "flex w-full items-center justify-center gap-2 py-3 text-danger",
					onClick: () => {
						remove(existing.id);
						toast(t("txDeleted"));
						onClose();
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { size: 16 }),
						" ",
						t("delete")
					]
				}) : null
			]
		})]
	});
}
function TransactionsScreen({ txns, onOpen, onClose }) {
	const [q, setQ] = (0, import_react.useState)("");
	const { t } = useI18n();
	const today = todayISO();
	const filtered = txns.filter((t) => t.date <= today).filter((t) => !q || t.title.toLowerCase().includes(q.toLowerCase())).sort((a, b) => b.date.localeCompare(a.date) || a.amount - b.amount);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "screen-plain absolute inset-0 z-10 flex flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
				title: t("transactions"),
				onClose
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "px-5 pt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "field",
					placeholder: t("search"),
					value: q,
					onChange: (e) => setQ(e.target.value),
					"aria-label": t("search")
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "phone-scroll px-5 pb-10 pt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TxnList, {
					txns: filtered,
					onOpen
				})
			})
		]
	});
}
function CategoryScreen({ id, scope, txns, onOpen, onClose }) {
	const month = useFinance((s) => s.month);
	const { t, locale } = useI18n();
	const today = todayISO();
	const mine = txns.filter((tx) => {
		if (tx.categoryId !== id) return false;
		if (tx.date > today) return false;
		if (scope === "month") return tx.date.startsWith(month);
		return tx.date.startsWith(month.slice(0, 4));
	});
	const total = mine.reduce((s, t) => s + t.amount, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "screen-break absolute inset-0 z-10 flex flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
				title: catLabel(locale, id),
				subtitle: scope === "year" ? month.slice(0, 4) : monthLabel(locale, month),
				onClose
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-5 pt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-3xl font-semibold",
					children: formatMoney(total, 2)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: t("spent")
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "phone-scroll px-5 pb-8 pt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TxnList, {
					txns: [...mine].sort((a, b) => b.date.localeCompare(a.date)),
					onOpen
				})
			})
		]
	});
}
function AccountScreen({ id, txns, onOpen, onClose }) {
	const account = useFinance((s) => s.accounts.find((a) => a.id === id));
	const rename = useFinance((s) => s.renameAccount);
	const remove = useFinance((s) => s.deleteAccount);
	const { t, locale } = useI18n();
	const [name, setName] = (0, import_react.useState)(account?.name ?? "");
	if (!account) return null;
	const mine = txns.filter((t) => t.accountId === id || t.toAccountId === id).sort((a, b) => b.date.localeCompare(a.date));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "screen-accounts absolute inset-0 z-10 flex flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
			title: accountTitle(locale, account),
			subtitle: account.kind === "saving" ? t("savingKind") : t("spending"),
			onClose
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "phone-scroll px-5 pb-10 pt-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "text-sm text-muted",
					htmlFor: "acc-name",
					children: t("name")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					id: "acc-name",
					className: "field mt-1",
					value: name,
					onChange: (e) => setName(e.target.value),
					onBlur: () => name.trim() && rename(id, name.trim())
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TxnList, {
						txns: mine,
						onOpen
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "mt-6 text-sm text-danger",
					onClick: () => {
						const ok = remove(id);
						toast(ok ? t("accountRemoved") : t("accountBusy"));
						if (ok) onClose();
					},
					children: t("removeAccount")
				})
			]
		})]
	});
}
function AddAccountScreen({ onClose }) {
	const add = useFinance((s) => s.addAccount);
	const { t } = useI18n();
	const [name, setName] = (0, import_react.useState)("");
	const [kind, setKind] = (0, import_react.useState)("spending");
	const [balance, setBalance] = (0, import_react.useState)("0");
	const colors = [
		"#4C8DFF",
		"#3AD7FF",
		"#34D399",
		"#FF8A3D",
		"#E15CF0"
	];
	const [color, setColor] = (0, import_react.useState)(colors[0]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "screen-accounts absolute inset-0 z-10 flex flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
			title: t("newAccount"),
			onClose,
			right: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "text-sm font-semibold text-good",
				onClick: () => {
					const n = parseMoney(balance);
					if (!name.trim() || !Number.isFinite(n)) {
						toast(t("nameBalance"));
						return;
					}
					add({
						name: name.trim(),
						kind,
						color,
						balance: n
					});
					onClose();
				},
				children: t("save")
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4 px-5 pt-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "field",
					placeholder: t("accountName"),
					value: name,
					onChange: (e) => setName(e.target.value),
					"aria-label": t("accountName")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "segmented",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"data-on": kind === "spending",
						onClick: () => setKind("spending"),
						children: t("spending")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"data-on": kind === "saving",
						onClick: () => setKind("saving"),
						children: t("savingKind")
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "field",
					inputMode: "decimal",
					placeholder: t("opening"),
					value: balance,
					onChange: (e) => setBalance(e.target.value),
					"aria-label": t("opening")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-3",
					children: colors.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": c,
						className: "size-9 rounded-full ring-2 ring-offset-2 ring-offset-bg",
						style: {
							background: c,
							boxShadow: color === c ? `0 0 0 2px ${c}` : void 0
						},
						onClick: () => setColor(c)
					}, c))
				})
			]
		})]
	});
}
function GoalsScreen({ onOpen, onClose }) {
	const { t, locale } = useI18n();
	const projects = useFinance((s) => s.projects);
	const today = todayISO();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pb-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
			title: t("goals"),
			onClose,
			right: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "icon-btn",
				"aria-label": t("newGoal"),
				onClick: () => onOpen(void 0),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 18 })
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm leading-relaxed text-muted",
				children: t("goalsHelp")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 space-y-3",
				children: [projects.map((project) => {
					const plan = projectPlan(project, today);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "sheet-card w-full p-4 text-left",
						onClick: () => onOpen(project.id),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-2 text-sm text-muted",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KindIcon, { kind: project.kind }),
									t(project.kind === "home" ? "kindHome" : project.kind === "car" ? "kindCar" : "kindOther"),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ml-auto",
										children: project.installment ? t("inParts") : t("saveUp")
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-1 block truncate text-lg font-semibold",
								children: projectTitle(locale, project)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-3 block h-2 overflow-hidden rounded-full bg-white/10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block h-full rounded-full bg-[#f6c445]",
									style: { width: `${Math.round(plan.progress * 100)}%` }
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "mt-2 flex justify-between text-sm text-muted",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("ofPrice", {
									saved: formatMoney(plan.saved),
									price: formatMoney(plan.price)
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [Math.round(plan.progress * 100), "%"] })]
							})
						]
					}, project.id);
				}), projects.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "sheet-card w-full px-4 py-8 text-center text-muted",
					onClick: () => onOpen(void 0),
					children: t("addGoal")
				}) : null]
			})]
		})]
	});
}
function KindIcon({ kind }) {
	if (kind === "home") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { size: 14 });
	if (kind === "car") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Car, { size: 14 });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, { size: 14 });
}
function ProjectEditor({ id, onClose }) {
	const { t, locale } = useI18n();
	const existing = useFinance((s) => s.projects.find((p) => p.id === id));
	const saveProject = useFinance((s) => s.saveProject);
	const deleteProject = useFinance((s) => s.deleteProject);
	const [name, setName] = (0, import_react.useState)(existing ? projectTitle(locale, existing) : "");
	const [kind, setKind] = (0, import_react.useState)(existing?.kind ?? "home");
	const [installment, setInstallment] = (0, import_react.useState)(existing?.installment ?? false);
	const [target, setTarget] = (0, import_react.useState)(existing ? money(existing.target) : "");
	const [saved, setSaved] = (0, import_react.useState)(existing ? money(existing.saved) : "");
	const [monthlySave, setMonthlySave] = (0, import_react.useState)(existing ? money(existing.monthlySave) : "");
	const [down, setDown] = (0, import_react.useState)(existing ? money(existing.downPayment) : "");
	const [months, setMonths] = (0, import_react.useState)(String(existing?.months ?? 36));
	const [apr, setApr] = (0, import_react.useState)(String(existing?.apr ?? 0).replace(".", ","));
	const [start, setStart] = (0, import_react.useState)(existing?.start ?? todayISO());
	const draft = {
		id: existing?.id ?? "draft",
		name: name.trim() || t("newGoal"),
		kind,
		target: num(target),
		saved: num(saved),
		monthlySave: num(monthlySave),
		installment,
		downPayment: num(down),
		months: Math.max(1, Math.round(num(months) || 1)),
		apr: num(apr),
		start
	};
	const plan = projectPlan(draft);
	const save = () => {
		if (!(draft.target > 0)) {
			toast(t("needPrice"));
			return;
		}
		if (!name.trim()) {
			toast(t("addName"));
			return;
		}
		saveProject({
			...draft,
			id: existing?.id ?? `goal-${Date.now()}`,
			name: name.trim()
		});
		toast(t("goalSaved"));
		onClose();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "screen-projects absolute inset-0 z-10 flex flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScreenHeader, {
			title: existing ? t("editGoal") : t("newGoal"),
			onClose,
			right: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "text-sm font-semibold text-cyan",
				onClick: save,
				children: t("save")
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "phone-scroll space-y-4 px-5 pb-16 pt-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "field",
					placeholder: t("name"),
					"aria-label": t("name"),
					value: name,
					onChange: (e) => setName(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "segmented text-sm",
					children: [
						"home",
						"car",
						"other"
					].map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"data-on": kind === k,
						className: "flex-1",
						onClick: () => setKind(k),
						children: t(k === "home" ? "kindHome" : k === "car" ? "kindCar" : "kindOther")
					}, k))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "segmented text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"data-on": !installment,
						className: "flex-1",
						onClick: () => setInstallment(false),
						children: t("saveUp")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"data-on": installment,
						className: "flex-1",
						onClick: () => setInstallment(true),
						children: t("inParts")
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: t("price"),
					value: target,
					onChange: setTarget
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: t("alreadySaved"),
					value: saved,
					onChange: setSaved
				}),
				installment ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: t("down"),
						value: down,
						onChange: setDown
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: t("months"),
						value: months,
						onChange: setMonths
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: t("rate"),
						value: apr,
						onChange: setApr
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: t("rateHelp")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "block text-sm text-muted",
						children: [t("nextPayment"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "field mt-1",
							type: "date",
							value: start,
							onChange: (e) => setStart(e.target.value)
						})]
					})
				] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: t("setAside"),
					value: monthlySave,
					onChange: setMonthlySave
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "sheet-card space-y-2 p-4 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-2 overflow-hidden rounded-full bg-white/10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-full rounded-full bg-[#f6c445]",
								style: { width: `${Math.round(plan.progress * 100)}%` }
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("ofPrice", {
							saved: formatMoney(Math.min(plan.saved, plan.price)),
							price: formatMoney(plan.price)
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-muted",
							children: [
								t("stillToPay"),
								" · ",
								formatMoney(plan.left)
							]
						}),
						plan.monthly > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-muted",
							children: [
								t("eachMonth"),
								" · ",
								formatMoney(plan.monthly)
							]
						}) : null,
						plan.mode === "save" && plan.monthsLeft != null && plan.left > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted",
							children: t("monthsLeft", { n: plan.monthsLeft })
						}) : null,
						plan.left === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-good",
							children: t("goalReached")
						}) : null,
						plan.mode === "installment" && plan.downGap > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("downGap", { n: formatMoney(plan.downGap) }) }) : null,
						plan.mode === "installment" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-muted",
							children: [
								t("paidSoFar"),
								" · ",
								plan.paidCount,
								"/",
								plan.months,
								plan.nextDate ? ` · ${fullDate(locale, plan.nextDate)}` : ""
							]
						}) : null,
						plan.mode === "installment" && plan.monthly > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-muted",
							children: t("addsBills", { n: formatMoney(plan.monthly) })
						}) : null
					]
				}),
				existing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "flex w-full items-center justify-center gap-2 py-3 text-danger",
					onClick: () => {
						deleteProject(existing.id);
						onClose();
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { size: 16 }),
						" ",
						t("removeGoal")
					]
				}) : null
			]
		})]
	});
}
function Field({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block text-sm text-muted",
		children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			className: "field mt-1",
			inputMode: "decimal",
			"aria-label": label,
			value,
			onChange: (e) => onChange(e.target.value)
		})]
	});
}
function money(n) {
	return String(n).replace(".", ",");
}
function num(raw) {
	const n = parseMoney(raw);
	return Number.isFinite(n) ? Math.max(0, n) : 0;
}
var RANGES = [
	"1W",
	"1M",
	"3M",
	"6M",
	"1Y",
	"All"
];
var CARD = {
	trend: "card-trend",
	top: "card-top",
	upcoming: "card-upcoming",
	saving: "card-saving",
	flow: "card-flow",
	accounts: "card-accounts",
	projects: "card-projects"
};
function App() {
	const [route, setRoute] = (0, import_react.useState)({ name: "home" });
	const [scope, setScope] = (0, import_react.useState)("month");
	const [range, setRange] = (0, import_react.useState)("1Y");
	(0, import_react.useEffect)(() => {
		useFinance.persist.rehydrate();
	}, []);
	const month = useFinance((s) => s.month);
	const raw = useFinance((s) => s.transactions);
	const accounts = useFinance((s) => s.accounts);
	const budgets = useFinance((s) => s.budgets);
	const allocations = useFinance((s) => s.allocations);
	const order = useFinance((s) => s.insightOrder);
	const hidden = useFinance((s) => s.hiddenInsights);
	const today = todayISO();
	const horizon = month > today.slice(0, 7) ? month : today.slice(0, 7);
	const txns = (0, import_react.useMemo)(() => projectRecurring(raw, horizon), [raw, horizon]);
	const visible = order.filter((id) => !hidden.includes(id));
	const { t, locale } = useI18n();
	(0, import_react.useEffect)(() => {
		const onKey = (e) => {
			if (e.key === "Escape") setRoute({ name: "home" });
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	const goInsight = (dir) => {
		if (route.name !== "insight") return;
		const i = visible.indexOf(route.id);
		const next = visible[(i + dir + visible.length) % visible.length];
		if (next) setRoute({
			name: "insight",
			id: next
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "studio",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "phone",
			children: [
				route.name === "home" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "phone-scroll home-bg",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Home$2, {
						txns,
						today,
						accounts,
						visible,
						go: setRoute
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "add-pill",
					onClick: () => setRoute({ name: "edit" }),
					children: t("add")
				})] }) : null,
				route.name === "insight" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsightPager, {
					id: route.id,
					index: Math.max(0, visible.indexOf(route.id)),
					count: visible.length,
					scope,
					setScope,
					range,
					setRange,
					txns,
					today,
					accounts,
					onClose: () => setRoute({ name: "home" }),
					onPrev: () => goInsight(-1),
					onNext: () => goInsight(1),
					go: setRoute
				}) : null,
				route.name === "months" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonthPicker, {
					month,
					onClose: () => setRoute({ name: "home" })
				}) : null,
				route.name === "budget" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BudgetScreen, { onClose: () => setRoute({ name: "home" }) }) : null,
				route.name === "settings" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsScreen, { onClose: () => setRoute({ name: "home" }) }) : null,
				route.name === "insights" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InsightsEditor, { onClose: () => setRoute({ name: "home" }) }) : null,
				route.name === "edit" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TransactionEditor, {
					id: route.id,
					date: route.date,
					seed: txns.find((t) => t.id === route.id),
					onClose: () => setRoute({ name: "home" })
				}, route.id ?? "new") : null,
				route.name === "transactions" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TransactionsScreen, {
					txns,
					onClose: () => setRoute({ name: "home" }),
					onOpen: (id) => setRoute({
						name: "edit",
						id
					})
				}) : null,
				route.name === "category" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryScreen, {
					id: route.id,
					scope: route.scope,
					txns,
					onClose: () => setRoute({
						name: "insight",
						id: "top"
					}),
					onOpen: (id) => setRoute({
						name: "edit",
						id
					})
				}) : null,
				route.name === "account" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountScreen, {
					id: route.id,
					txns,
					onClose: () => setRoute({
						name: "insight",
						id: "accounts"
					}),
					onOpen: (id) => setRoute({
						name: "edit",
						id
					})
				}) : null,
				route.name === "add-account" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddAccountScreen, { onClose: () => setRoute({
					name: "insight",
					id: "accounts"
				}) }) : null,
				route.name === "project" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProjectEditor, {
					id: route.id,
					onClose: () => setRoute({
						name: "insight",
						id: "projects"
					})
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "sr-only",
					children: [
						monthLabel(locale, month),
						" ",
						formatMoney(budgetOf(budgets, month)),
						" ",
						formatMoney(allocatedTotal(allocationMap(allocations, month)))
					]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
			theme: "dark",
			position: "top-center"
		})]
	});
}
function Home$2({ txns, today, accounts, visible, go }) {
	const month = useFinance((s) => s.month);
	const budgets = useFinance((s) => s.budgets);
	const allocations = useFinance((s) => s.allocations);
	const budget = budgetOf(budgets, month);
	const allocated = allocatedTotal(allocationMap(allocations, month));
	const available = budget - allocated;
	const remain = daysRemaining(month, today);
	const posted = postedSpend(txns, month, today);
	const spent = sumSpend(posted);
	const byCat = spentByCategory(posted);
	const slices = CATEGORIES.map((c) => ({
		...c,
		value: byCat[c.id] ?? 0
	})).filter((c) => c.value > 0);
	const top = [...slices].sort((a, b) => b.value - a.value)[0];
	const upcoming = upcomingSpend(txns, month, today);
	const trend = trendModel(txns, month, today);
	const save = savingStats(txns, month, today);
	const projects = useFinance((s) => s.projects);
	const { t, locale } = useI18n();
	const bills = planBills(projects, month, today);
	const upcomingAll = [...upcoming, ...bills].sort((a, b) => a.date.localeCompare(b.date) || a.amount - b.amount);
	const upcomingTotalAll = upcomingAll.reduce((s, t) => s + t.amount, 0);
	const lead = [...projects].sort((a, b) => projectPlan(b, today).progress - projectPlan(a, today).progress)[0];
	const leadPlan = lead ? projectPlan(lead, today) : null;
	const total = totalBalance(accounts, txns, today);
	const net = monthNet(accounts, txns, month, today);
	const series = balanceSeries(accounts, txns, "6M", today).map((p) => p.value);
	const recent = txns.filter((t) => t.date <= today && t.kind !== "transfer").sort((a, b) => b.date.localeCompare(a.date) || a.amount - b.amount).slice(0, 4);
	const open = (id) => go({
		name: "insight",
		id
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 pb-28 pt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "month-pill",
					onClick: () => go({ name: "months" }),
					children: monthLabel(locale, month)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 pl-2 text-sm text-muted",
					children: remain.tone === "now" ? daysLeftLabel(locale, remain.days) : remain.tone === "past" ? t("monthClosed") : t("notStarted")
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "icon-btn",
					"aria-label": t("settings"),
					onClick: () => go({ name: "settings" }),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { size: 18 })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BudgetRing, {
					fraction: budget > 0 ? allocated / budget : 0,
					amount: formatMoney(available),
					negative: available < -.001,
					onClick: () => go({ name: "budget" })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 grid grid-cols-3 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "min-w-0",
						onClick: () => go({ name: "budget" }),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "block truncate text-sm text-muted",
							children: [t("budget"), " ›"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block text-lg font-semibold",
							children: formatMoney(budget)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "min-w-0",
						onClick: () => open("top"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "block truncate text-sm text-muted",
							children: [t("allocated"), " ›"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mt-1 block text-lg font-semibold",
							children: formatMoney(allocated)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate text-sm text-muted",
							children: t("available")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `mt-1 block text-lg font-semibold ${available < 0 ? "text-danger" : ""}`,
							children: formatMoney(available)
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 mb-3 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xl font-semibold",
					children: t("insights")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "text-sm text-muted",
					onClick: () => go({ name: "insights" }),
					children: t("edit")
				})]
			}),
			visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-3xl bg-white/5 px-4 py-8 text-center text-sm text-muted",
				children: t("hiddenAll")
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-3",
				children: visible.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: `insight ${CARD[id]}`,
					onClick: () => open(id),
					children: [
						id === "trend" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardLabel, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartLine, { size: 15 }),
								label: t("trend")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-3xl font-semibold tracking-tight",
								children: formatPct(trend.pct)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spark, { values: trend.current }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, { label: directionLabel(locale, trend.pct) })
						] }) : null,
						id === "top" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardLabel, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartPie, { size: 15 }),
								label: t("top")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-3xl font-semibold tracking-tight",
								children: top ? formatMoney(top.value) : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniDonut, { slices: slices.length ? slices : [{
								value: 1,
								color: "rgba(255,255,255,0.08)"
							}] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {
								dot: top?.color,
								label: top ? catLabel(locale, top.id) : t("noSpending")
							})
						] }) : null,
						id === "upcoming" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardLabel, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { size: 15 }),
								label: t("upcoming")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-3xl font-semibold tracking-tight",
								children: formatMoney(upcomingTotalAll)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UpcomingBars, { items: upcomingAll.map((item) => ({
								day: Number(item.date.slice(8, 10)),
								amount: item.amount
							})) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted",
								children: upcomingAll.length === 1 ? t("expenseOne") : t("expenses", { n: upcomingAll.length })
							})
						] }) : null,
						id === "saving" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardLabel, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sprout, { size: 15 }),
								label: t("saving")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-3xl font-semibold tracking-tight",
								children: formatPct(save.rate)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Gauge, { pct: save.rate }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {
								dot: "var(--color-transport)",
								label: savingWord(locale, save.rate)
							})
						] }) : null,
						id === "flow" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardLabel, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeftRight, { size: 15 }),
								label: t("flow")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-3xl font-semibold tracking-tight",
								children: formatMoney(budget)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlowBars, {
								parts: slices,
								ratio: budget > 0 ? spent / budget : 0
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-muted",
								children: t("spentPct", { n: Math.round(budget > 0 ? spent / budget * 100 : 0) })
							})
						] }) : null,
						id === "accounts" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardLabel, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { size: 15 }),
								label: t("accounts")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-3xl font-semibold tracking-tight",
								children: formatMoney(Math.round(total), 0)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spark, {
								values: series,
								color: "var(--color-good)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, { label: formatMoney(Math.abs(net)) })
						] }) : null,
						id === "projects" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardLabel, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, { size: 15 }),
								label: t("goals")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-3xl font-semibold tracking-tight",
								children: leadPlan ? `${Math.round(leadPlan.progress * 100)}%` : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-3 block h-2 overflow-hidden rounded-full bg-white/10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block h-full rounded-full bg-[#f6c445]",
									style: { width: `${Math.round((leadPlan?.progress ?? 0) * 100)}%` }
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, { label: lead ? projectTitle(locale, lead) : t("addGoal") })
						] }) : null
					]
				}, id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "mt-8 mb-3 flex items-center gap-1 text-xl font-semibold",
				onClick: () => go({ name: "transactions" }),
				children: [
					t("recent"),
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { size: 18 })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TxnList, {
				txns: recent,
				onOpen: (id) => go({
					name: "edit",
					id
				})
			})
		]
	});
}
function CardLabel({ icon, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "flex min-w-0 items-center gap-2 text-sm font-medium text-white/80",
		children: [icon, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "truncate",
			children: label
		})]
	});
}
function Footer({ label, dot }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "mt-auto flex min-w-0 items-center gap-2 pt-2 text-sm text-muted",
		children: [dot ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "size-2 shrink-0 rounded-full",
			style: { background: dot }
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "grid size-5 shrink-0 place-items-center rounded-full bg-white/10 text-micro",
			children: "↑"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "truncate",
			children: label
		})]
	});
}
function InsightPager(props) {
	const touch = (0, import_react.useRef)(null);
	const klass = props.id === "trend" ? "screen-trend" : props.id === "flow" ? "screen-flow" : props.id === "top" ? "screen-break" : props.id === "accounts" ? "screen-accounts" : props.id === "upcoming" ? "screen-upcoming" : props.id === "projects" ? "screen-projects" : "screen-saving";
	const month = useFinance((s) => s.month);
	const projects = useFinance((s) => s.projects);
	const { t } = useI18n();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `absolute inset-0 flex flex-col ${klass}`,
		onTouchStart: (e) => {
			touch.current = {
				x: e.touches[0].clientX,
				y: e.touches[0].clientY
			};
		},
		onTouchEnd: (e) => {
			if (!touch.current) return;
			const dx = e.changedTouches[0].clientX - touch.current.x;
			const dy = e.changedTouches[0].clientY - touch.current.y;
			if (Math.abs(dx) > 64 && Math.abs(dx) > Math.abs(dy) * 1.3) {
				if (dx < 0) props.onNext();
				else props.onPrev();
			}
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-h-0 flex-1 overflow-y-auto",
			children: [
				props.id === "trend" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendScreen, {
					txns: props.txns,
					month,
					today: props.today,
					onClose: props.onClose
				}) : null,
				props.id === "top" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BreakdownScreen, {
					txns: props.txns,
					month,
					today: props.today,
					scope: props.scope,
					onClose: props.onClose,
					onCategory: (id) => props.go({
						name: "category",
						id,
						scope: props.scope
					})
				}) : null,
				props.id === "upcoming" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UpcomingScreen, {
					txns: [...props.txns, ...planBills(projects, month, props.today)],
					month,
					today: props.today,
					onClose: props.onClose,
					onOpen: (tx) => {
						if (tx.id.startsWith("plan:")) props.go({
							name: "project",
							id: tx.id.split(":")[1]
						});
						else props.go({
							name: "edit",
							id: tx.id
						});
					}
				}) : null,
				props.id === "saving" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SavingScreen, {
					txns: props.txns,
					month,
					today: props.today,
					onClose: props.onClose
				}) : null,
				props.id === "flow" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FlowScreen, {
					txns: props.txns,
					month,
					today: props.today,
					onClose: props.onClose
				}) : null,
				props.id === "accounts" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountsScreen, {
					accounts: props.accounts,
					txns: props.txns,
					today: props.today,
					range: props.range,
					setRange: props.setRange,
					onClose: props.onClose,
					onAccount: (id) => props.go({
						name: "account",
						id
					}),
					onAdd: () => props.go({ name: "add-account" })
				}) : null,
				props.id === "projects" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoalsScreen, {
					onClose: props.onClose,
					onOpen: (id) => props.go({
						name: "project",
						id
					})
				}) : null
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-end justify-between px-5 pb-4 pt-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "icon-btn",
					"aria-label": t("previous"),
					onClick: props.onPrev,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { size: 18 })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-1.5",
						"aria-hidden": true,
						children: Array.from({ length: props.count }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `size-1.5 rounded-full ${i === props.index ? "bg-white" : "bg-white/30"}` }, i))
					}), props.id === "top" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "segmented text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"data-on": props.scope === "month",
							onClick: () => props.setScope("month"),
							children: t("month")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"data-on": props.scope === "year",
							onClick: () => props.setScope("year"),
							children: t("year")
						})]
					}) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "icon-btn",
					"aria-label": t("next"),
					onClick: props.onNext,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { size: 18 })
				})
			]
		})]
	});
}
function AccountsScreen({ accounts, txns, today, range, setRange, onClose, onAccount, onAdd }) {
	const { t, locale } = useI18n();
	const points = balanceSeries(accounts, txns, range, today);
	const total = points[points.length - 1]?.value ?? totalBalance(accounts, txns, today);
	const gain = points.length > 1 ? points[points.length - 1].value - points[0].value : 0;
	const spending = accounts.filter((a) => a.kind === "spending");
	const saving = accounts.filter((a) => a.kind === "saving");
	const sum = (list) => list.reduce((s, a) => s + accountBalance(a, txns, today), 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pb-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-[44px_1fr_auto] items-center gap-2 px-4 pt-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "icon-btn",
					onClick: onClose,
					"aria-label": t("close"),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { size: 18 })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-semibold",
						children: t("accounts")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm text-muted",
						children: t("allAccounts")
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "icon-btn",
						"aria-hidden": true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, { size: 16 })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "icon-btn",
						"aria-label": t("addAccount"),
						onClick: onAdd,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { size: 18 })
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-5 pt-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: t("today")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-4xl font-semibold tracking-tight",
					children: formatMoney(total, 2)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: `mt-1 inline-flex items-center gap-1 text-sm ${gain >= 0 ? "text-good" : "text-danger"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-5 place-items-center rounded-full bg-white/10 text-micro",
						children: gain >= 0 ? "↑" : "↓"
					}), formatMoney(Math.abs(gain), 2)]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-4 flex justify-between text-sm",
					children: RANGES.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: `rounded-full px-2.5 py-1 ${range === r ? "bg-white/15 font-semibold" : "text-muted"}`,
						onClick: () => setRange(r),
						children: r
					}, r))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BalanceChart, {
					points,
					seriesName: t("balance")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountGroup, {
					title: t("spending"),
					total: sum(spending),
					accounts: spending,
					txns,
					today,
					onAccount
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccountGroup, {
					title: t("savingKind"),
					total: sum(saving),
					accounts: saving,
					txns,
					today,
					onAccount
				})
			]
		})]
	});
}
function AccountGroup({ title, total, accounts, txns, today, onAccount }) {
	const { t, locale } = useI18n();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-2 flex items-center justify-between text-sm text-muted",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatMoney(total, 2) })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "sheet-card divide-y divide-white/5",
			children: accounts.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "flex w-full items-center gap-3 px-3 py-3 text-left",
				onClick: () => onAccount(a.id),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-8 place-items-center rounded-lg text-micro font-bold text-bg",
						style: { background: a.color },
						children: a.name.slice(0, 1)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium",
							children: accountTitle(locale, a)
						}), a.isDefault ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-2 rounded-full bg-white/10 px-2 py-0.5 text-micro text-muted",
							children: t("default")
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatMoney(accountBalance(a, txns, today), 2) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
						size: 16,
						className: "text-muted"
					})
				]
			}, a.id))
		})]
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(App, {});
}
export { Home as component };
