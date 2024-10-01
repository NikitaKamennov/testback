Тестовое задание для Backend Node.js разработчика

Инструкция по запуску

1. Откройте консоли в bet-platform и provider-service и подтяните пакеты (npm i )
2. В bet-platform настройте в файле .env (в дирректории имеется .envexample) переменную окружения DATABASE_URL
   Создайте бд или укажите имя уже существующей в переменной DATABASE_URL
3. npx prisma migrate dev --name init создается база данных если её нет, накатываем миграции
4. npm start в консоли provider-service запустит сервер на 3000 порту. Аналогично с bet-platform команда npm start запустит сервер на 3001 порту

Описание API

API сервиса provider-service

1. POST http://localhost:3000/events создать событие

   пример тела запроса

   ```
   {
   "coefficient": 1.27,
   "deadline": 1900003333000
   }
   ```
   
   ВНИМАНИЕ дедлайн сравнивается с текущей датой. Задайте не ниже приведенного в примере значения, иначе нельзя будет сделать ставку на просроченное событие.

   Пример ответа
   ``` 
   {
   "coefficient": 1.27,
   "deadline": 1900003333000,
   "id": "1727749845060",
   "status": "pending"
   }
   ```



2. GET http://localhost:3000/events Возвращает список всех событий с полной информацией.
   Пример ответа

   ```
   {
   "coefficient": 1.27,
   "deadline": 1900003333000,
   "id": "1727749845060",
   "status": "pending"
   },
   {
   "coefficient": 1.55,
   "deadline": 1900003333000,
   "id": "1727749854777",
   "status": "pending"
   }
   ```



3. PUT http://localhost:3000/events/:id Обновляет статус существующего события.

тело запроса

```
{
"status": "first_team_won"
}
```

пример ответа

```
{
"coefficient": 1.27,
"deadline": 1900003333000,
"id": "1727758615287",
"status": "first_team_won"
}
```

API сервиса bet-platform:

1. GET http://localhost:3001/events Возвращает список событий, на которые можно совершить ставку (события, для которых не наступил дедлайн и не сделана ставка).

пример ответа

```
{
"id": "1727749737436",
"coefficient": 1.22,
"deadline": 1900003333000,
"status": "pending"
},
{
"id": "1727758612757",
"coefficient": 1.27,
"deadline": 1900003333000,
"status": "pending"
}
```

2. POST http://localhost:3001/bets сделать ставку на событие

пример запроса

```
{"eventId": "1727749845060",
"amount": 100.33 }
```

пример ответа

```
{
"id": "cm1pz90aw000111wx2tflx7nf",
"eventId": "1727759244846",
"amount": 100.33,
"potentialWin": 127.4191,
"status": "pending"
}
```

3. GET http://localhost:3001/bets возвращает историю всех сделанных ставок и их статусы на данный момент

Пример ответа

```
{
"id": "cm1p5cips0001zf7d8910esqi",
"eventId": "1727708976159",
"amount": 111,
"potentialWin": 159.84,
"status": "won"
},
{
"id": "cm1p5plbz0001xpzvyotfex94",
"eventId": "1727709008835",
"amount": 123,
"potentialWin": 177.12,
"status": "pending"
}
```



