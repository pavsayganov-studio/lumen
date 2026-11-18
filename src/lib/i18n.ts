import { useEffect, useState } from "react";
import type { Account, CategoryId, Project } from "./finance.ts";
import { useFinance, type LocaleMode } from "./store.ts";

export type Locale = "en" | "ru";

const en: Record<string, string> = {
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
  goals: "Projects",
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
  goalsHelp: "A home, a car, a trip, anything big. Save toward it or pay in parts. Plan the costs and dates, then record each payment.",
  newGoal: "New project",
  editGoal: "Edit project",
  addGoal: "Start a project",
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
  goalReached: "Fully funded",
  ofPrice: "{saved} of {price}",
  kindHome: "Home",
  kindCar: "Car",
  kindOther: "Other",
  kindTrip: "Trip",
  deadline: "Target date",
  needMonthly: "To make it by then, set aside {n} a month",
  onTrack: "On pace for the target date",
  notes: "Notes",
  costs: "Costs and dates",
  costsHelp: "Flights, notary, insurance: anything you will pay, and when.",
  addCost: "Add a cost",
  costName: "What",
  schedule: "Schedule",
  payNow: "Pay",
  due: "Due",
  paidTag: "Paid",
  moreInstallments: "{n} more payments follow",
  statSaved: "Set aside",
  statPaid: "Paid out",
  scheduledLeft: "Planned costs left",
  setAsideNow: "Set aside",
  recordPayment: "Record a payment",
  history: "History",
  noHistory: "Nothing recorded yet.",
  projectFor: "Project",
  noProject: "No project",
  paidBefore: "Payments already made",
  sameAccount: "Pick two different accounts",
  noCategory: "No category",
  tapAgain: "Tap again to confirm",
  welcomeTitle: "Welcome to Lumen",
  welcomeBody: "A calm budget for one month at a time. Your money stays on this phone. Nothing is uploaded.",
  startOwn: "Start with my own data",
  startDemo: "Explore with sample data",
  startDemoHint: "Sample data is made up. You can erase it any time in Settings.",
  demoBanner: "Sample data. Tap to start with your own.",
  setBudgetFirst: "Set your monthly budget",
  setBudgetHint: "Then Lumen shows what is left to spend.",
  loadDemo: "Load sample data",
  eraseAll: "Erase all my data",
  erased: "All data erased",
  demoLoaded: "Sample data loaded",
  dataHeading: "Your data",
  removeGoal: "Remove project",
  goalSaved: "Project saved",
  needPrice: "Add a price",
  addsBills: "Adds {n} to upcoming bills",
  catHousing: "Housing",
  catSavings: "Savings",
  catTransport: "Transportation",
  catFood: "Food & Drink",
  catShopping: "Shopping",
  catFun: "Entertainment",
  catHealth: "Health",
  shareText: "Money flow",
  allocationFor: "{name} allocation",
};

const ru: Record<string, string> = {
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
  goals: "Проекты",
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
  goalsHelp: "Жильё, машина, поездка или любая большая цель. Копите или платите частями. Запланируйте расходы и даты, а платежи записывайте по мере оплаты.",
  newGoal: "Новый проект",
  editGoal: "Правка проекта",
  addGoal: "Начать проект",
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
  goalReached: "Всё накоплено",
  ofPrice: "{saved} из {price}",
  kindHome: "Жильё",
  kindCar: "Машина",
  kindOther: "Другое",
  kindTrip: "Поездка",
  deadline: "К какой дате",
  needMonthly: "Чтобы успеть, откладывайте {n} в месяц",
  onTrack: "Темп позволяет успеть к дате",
  notes: "Заметки",
  costs: "Расходы и даты",
  costsHelp: "Билеты, нотариус, страховка: всё, что придётся оплатить, и когда.",
  addCost: "Добавить расход",
  costName: "Что",
  schedule: "График",
  payNow: "Оплатить",
  due: "Пора платить",
  paidTag: "Оплачено",
  moreInstallments: "Ещё платежей: {n}",
  statSaved: "Отложено",
  statPaid: "Выплачено",
  scheduledLeft: "Осталось запланированного",
  setAsideNow: "Отложить",
  recordPayment: "Записать платёж",
  history: "История",
  noHistory: "Пока ничего не записано.",
  projectFor: "Проект",
  noProject: "Без проекта",
  paidBefore: "Уже внесено платежей",
  sameAccount: "Выберите два разных счёта",
  noCategory: "Без категории",
  tapAgain: "Нажмите ещё раз для подтверждения",
  welcomeTitle: "Добро пожаловать в Lumen",
  welcomeBody: "Спокойный бюджет на один месяц. Деньги остаются на этом телефоне и никуда не отправляются.",
  startOwn: "Начать с чистого листа",
  startDemo: "Посмотреть на примере",
  startDemoHint: "Пример выдуманный. Стереть его можно в любой момент в настройках.",
  demoBanner: "Это пример данных. Нажмите, чтобы начать со своих.",
  setBudgetFirst: "Задайте бюджет на месяц",
  setBudgetHint: "Тогда Lumen покажет, сколько ещё можно потратить.",
  loadDemo: "Загрузить пример данных",
  eraseAll: "Стереть все мои данные",
  erased: "Данные стёрты",
  demoLoaded: "Пример данных загружен",
  dataHeading: "Ваши данные",
  removeGoal: "Удалить проект",
  goalSaved: "Проект сохранён",
  needPrice: "Укажите цену",
  addsBills: "Плюс {n} к будущим платежам",
  catHousing: "Жильё",
  catSavings: "Накопления",
  catTransport: "Транспорт",
  catFood: "Еда и кафе",
  catShopping: "Покупки",
  catFun: "Досуг",
  catHealth: "Здоровье",
  shareText: "Куда ушли деньги",
  allocationFor: "Сумма для «{name}»",
};

const MONTHS = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  ru: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
};

const MONTHS_SHORT = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  ru: ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"],
};

const WEEKDAYS = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  ru: ["вс", "пн", "вт", "ср", "чт", "пт", "сб"],
};

const WEEK_HEAD = {
  en: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
  ru: ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"],
};

const CAT: Record<CategoryId, string> = {
  housing: "catHousing",
  savings: "catSavings",
  transport: "catTransport",
  food: "catFood",
  shopping: "catShopping",
  fun: "catFun",
  health: "catHealth",
};

export function deviceLocale(): Locale {
  if (typeof navigator === "undefined") return "en";
  return navigator.language.toLowerCase().startsWith("ru") ? "ru" : "en";
}

export function resolveLocale(mode: LocaleMode, device: Locale): Locale {
  return mode === "auto" ? device : mode;
}

export function translate(locale: Locale, key: string, vars?: Record<string, string | number>) {
  let text = (locale === "ru" ? ru[key] : en[key]) ?? en[key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) text = text.replaceAll(`{${name}}`, String(value));
  }
  return text;
}

export function monthLabel(locale: Locale, key: string) {
  const month = Number(key.slice(5, 7));
  const year = key.slice(0, 4);
  return `${MONTHS[locale][month - 1] ?? ""} ${year}`;
}

export function monthShortLabel(locale: Locale, month: number) {
  return MONTHS_SHORT[locale][month - 1] ?? "";
}

export function daysLeftLabel(locale: Locale, n: number) {
  if (locale === "en") return n === 1 ? translate(locale, "dayLeft") : translate(locale, "daysLeft", { n });
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `ещё ${n} день`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `ещё ${n} дня`;
  return `ещё ${n} дней`;
}

export function weekHead(locale: Locale) {
  return WEEK_HEAD[locale];
}

export function fullDate(locale: Locale, iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const w = WEEKDAYS[locale][dt.getDay()];
  if (locale === "ru") return `${w}, ${d} ${MONTHS_SHORT.ru[m - 1]} ${y}`;
  return `${w}, ${d} ${MONTHS_SHORT.en[m - 1]} ${y}`;
}

export function trendStamp(locale: Locale, iso: string) {
  const m = Number(iso.slice(5, 7));
  const d = Number(iso.slice(8, 10));
  if (locale === "ru") return `${d} ${MONTHS_SHORT.ru[m - 1]}`;
  return `${MONTHS_SHORT.en[m - 1]} ${d}`;
}

export function dayHeading(locale: Locale, iso: string, today: string) {
  if (iso === today) return translate(locale, "today");
  const [y, m, d] = today.split("-").map(Number);
  const prev = new Date(y, m - 1, d - 1);
  const prevIso = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}-${String(prev.getDate()).padStart(2, "0")}`;
  if (iso === prevIso) return locale === "ru" ? "Вчера" : "Yesterday";
  return fullDate(locale, iso);
}

export function catLabel(locale: Locale, id: CategoryId) {
  return translate(locale, CAT[id]);
}

export function accountTitle(locale: Locale, account: Pick<Account, "id" | "name">) {
  if (account.id === "main" && account.name === "Main") return locale === "ru" ? "Основной" : "Main";
  if (account.id === "saving" && account.name === "Saving") return locale === "ru" ? "Накопления" : "Saving";
  return account.name;
}

export function projectTitle(locale: Locale, project: Pick<Project, "id" | "name">) {
  if (project.id === "seed-home" && project.name === "Apartment") return locale === "ru" ? "Квартира" : "Apartment";
  if (project.id === "seed-car" && project.name === "City car") return locale === "ru" ? "Городская машина" : "City car";
  if (project.id === "seed-trip" && project.name === "Summer trip") return locale === "ru" ? "Летняя поездка" : "Summer trip";
  return project.name;
}

export function directionLabel(locale: Locale, pct: number) {
  if (pct > 3) return translate(locale, "increasing");
  if (pct < -3) return translate(locale, "decreasing");
  return translate(locale, "steady");
}

export function savingWord(locale: Locale, rate: number) {
  if (rate >= 15) return translate(locale, "strong");
  if (rate >= 8) return translate(locale, "building");
  return translate(locale, "low");
}

export function useI18n() {
  const mode = useFinance((s) => s.localeMode);
  const [device, setDevice] = useState<Locale>("en");
  useEffect(() => {
    setDevice(deviceLocale());
  }, []);
  const locale = resolveLocale(mode, device);
  const t = (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars);
  return { locale, t, mode };
}
