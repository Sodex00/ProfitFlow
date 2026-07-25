<div align="center">

# ProfitFlow

### Персональная аналитика криптовалютных сделок

Отслеживайте входы, фиксируйте результаты и превращайте каждую сделку в данные для следующего решения.

[Открыть приложение](https://sodex00.github.io/ProfitFlow/) · [Сообщить об ошибке](https://github.com/Sodex00/ProfitFlow/issues)

![React](https://img.shields.io/badge/React-19-151815?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-151815?style=flat-square&logo=typescript&logoColor=3178C6)
![Vite](https://img.shields.io/badge/Vite-8-151815?style=flat-square&logo=vite&logoColor=BD87FF)
![Storage](https://img.shields.io/badge/Storage-Local--first-b8ff4a?style=flat-square)

</div>

---

## Возможности

- Создание Long и Short сделок с ценой входа, объёмом, датой и временем.
- Уровни Take Profit и Stop Loss для каждой позиции.
- Отметки открытых входов непосредственно на графике выбранного актива.
- Закрытие позиции по введённой или актуальной рыночной цене.
- Автоматический расчёт P&L, процента доходности и винрейта.
- Аналитика доходов и расходов за день, неделю, месяц и год.
- Журнал со статусами, фильтрацией и удалением сделок.
- Получение текущей цены через открытый API Binance с безопасным демо-режимом.
- Сохранение данных в `localStorage` — без регистрации и передачи журнала на сервер.
- Адаптивный тёмный интерфейс и WebGL-анимация запуска.

## Быстрый запуск

```bash
git clone https://github.com/Sodex00/ProfitFlow.git
cd ProfitFlow
npm install
npm run dev
```

Приложение будет доступно по адресу, который Vite покажет в терминале.

## Команды

| Команда | Назначение |
| --- | --- |
| `npm run dev` | Запуск режима разработки |
| `npm run build` | Проверка типов и production-сборка |
| `npm run lint` | Проверка качества кода |
| `npm run preview` | Локальный просмотр production-сборки |
| `npm run deploy` | Ручная публикация в GitHub Pages |

## Структура

```text
src/
├── components/       # Модальные окна, графики и WebGL-загрузка
├── App.tsx           # Основная панель и бизнес-логика
├── data.ts           # Стартовые демонстрационные данные
├── hooks.ts          # Локальное хранение и рыночная цена
├── lib.ts            # Расчёт P&L и форматирование
├── styles.css        # Дизайн-система и адаптивность
└── types.ts          # TypeScript-модели
```

## Хранение и приватность

Журнал сделок хранится только в браузере текущего устройства. Очистка данных сайта в браузере также удалит журнал. Для важных данных рекомендуется отдельно хранить резервную копию.

> ProfitFlow — аналитический инструмент и не является финансовой рекомендацией.

## Технологии

React, TypeScript, Vite, Three.js / React Three Fiber, Recharts, Lucide Icons и GitHub Pages.

---

<div align="center">Сделано для дисциплины, прозрачности и роста.</div>
