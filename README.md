# mcgl-data

Простой сервис/api для поиска по запросу. Является связкой из Express.js, MongoDB, нескольких seeder'ов для генерации из
дампов структурированных данных и упаковкой в Docker контейнер.

Подробнее о дампах и откуда они взялись [можно прочитать здесь](/DUMPS.md)

## Запуск

1. Скачайте [архив](https://github.com/exi66/mcgl-data-api/releases/download/v0.0.0/source.zip) и распакуйте его по пути
   `/app/.source/`
2. Создайте `.env` по подобию `.env-example` в корне проекта
3. Запустите докер
    ```shell
    docker compose -f .\docker-compose-local.yml up -d
    ```
4. Перейдите любым способом в контейнер с nodejs
5. Выполните миграцию
    ```shell
    npm run migrate
    ```

## Endpoints

Всего в приложении четыре эндпоинта:

1. `/post/get/:id`
2. `/comment/get/:id`
3. `/post/search`
4. `/comment/search`

### GET /post/get/:id

Позволяет получить конкретный пост из дампа [backscan2](/DUMPS.md#backscan2zip) зная его `id`

### GET /comment/get/:id

Позволяет получить конкретный комментарий из дампа [comments.txt](/DUMPS.md#commentstxt) зная его `id`

### GET /post/search

Позволяет осуществить поиск в дампе [backscan2](/DUMPS.md#backscan2zip) по содержимому.

Параметры передаются в виде **query** строки запроса. Имеются такие:

- **plaintext** - Поиск по тексту внутри поста и по прикрепленным ссылкам к нему
    - `String` или `URL`
    - Опционален
    - Пример `/post/search?plaintext=Xenogen`
- **users** - Поиск по списку `id` пользователей, указанных в посте
    - `Array<Int>`
    - Опционален
    - Пример `/post/search?user[0]=46604`
- **created** - Поиск по дате или диапазону дат
    - `Array[Date, Date]` или `Date`
    - Опционален
    - Можно использовать любой формат даты, если он будет пережёван объектом `new Date(created)`
    - Пример, комментарии, начиная с 2018-10-09 `/post/search?created[0]=2018-10-09`
    - Пример, комментарии, начиная заканчивая 2018-10-09 `/post/search?created[1]=2018-10-09`
    - Пример, комментарии, за дату 2018-10-09 `/post/search?created=2018-10-09`
    - Пример, комментарии, за диапазон с 2018-10-09 до 2019-10-09
      `post/search?created[0]=2018-10-09&created[1]=2019-10-09`
- **page**
    - `Int`
    - Опционален
    - В методе предусмотрена постраничная навигация. По умолчанию возвращает по 10 сущностей на страницу

**Пример ответа:**

```json
{
  "posts": [
    {
      "id": 185466,
      "created": "2018-08-11T13:19:52.000Z",
      "plaintext": "1. Почему в интересах администрации не разработать достойную систему защиты, а вставить как можно больше &quot;ловушек&quot; в клиент и забанить как можно больше игроков?\n2. Почему политика администрации в банах изменилась с &quot;наказать игрока&quot; на &quot;выжить неугодного игрока с проекта&quot;?\n3. Когда будет интервью с кем-нибудь, кроме  Laboratory и на вопросы будет отвечать кто-нибудь, кроме  Laboratory?\n4. Когда заберут группу Youtube у игрока  Irman, ведь снимает он откровенный шлак, в отличие от игроков, снимающих действительно качественный контент (например  ClocwerC и  Lykf)?\n5. Пару лет назад  Laboratory опубликовал несколько скриншотов с клиента для разработчиков, о том, как проходила разработка, тесты и с какими интересными моментами он сталкивался. Когда я находился в фокус-группе, я спрашивал  return о возрождении подобной рубрики, на что он ответил относительно положительно. Будет ли по факту возрождение такой рубрики?\n6. Где нынче пропадает истинный состав администрации:  admin,  gen и  acez и занимается ли он проектом вообще?\n7. Когда защитные поля (aka антизаливы) станут защищать только от заливов, а не от взрывов/ураганов/землетрясений/неба/Аллаха?",
      "usersInText": [
        328839,
        328839,
        428426,
        566333,
        115411,
        328839,
        637973,
        1,
        2,
        52109
      ],
      "linksInText": [
        "http://forum.minecraft-galaxy.ru/wiki/1113"
      ]
    },
    ...
  ],
  "totalPages": 23,
  "currentPage": 1
}
```

### GET /comment/search

Позволяет осуществить поиск в дампе [comments.txt](/DUMPS.md#commentstxt) по содержимому.

Параметры передаются в виде **query** строки запроса. Имеются такие:

- **plaintext** - Поиск по тексту комментария
    - `String`
    - Опционален
    - Пример `/comment/search?plaintext=cheatengine`
- **author** - Поиск по автору комментария, указанных в посте
    - `Int`
    - Опционален
    - Пример `/comment/search?author=46604`
- **user** - Поиск пользователю, к которому комментарий прикреплен
    - `Int`
    - Опционален
    - Пример `/comment/search?user=337307`
- **created** - Поиск по дате или диапазону дат
    - `Array[Date, Date]` или `Date`
    - Опционален
    - Можно использовать любой формат даты, если он будет пережован объектом `new Date(created)`
    - Пример, комментарии, начиная с 2018-10-09 `/post/search?created[0]=2018-10-09`
    - Пример, комментарии, начиная заканчивая 2018-10-09 `/post/search?created[1]=2018-10-09`
    - Пример, комментарии, за дату 2018-10-09 `/post/search?created=2018-10-09`
    - Пример, комментарии, за диапазон с 2018-10-09 до 2019-10-09
      `post/search?created[0]=2018-10-09&created[1]=2019-10-09`
- **page**
    - `Int`
    - Опционален
    - В методе предусмотрена постраничная навигация. По умолчанию возвращает по 50 сущностей на страницу

**Пример ответа:**

```json
{
  "comments": [
    {
      "id": 2229,
      "created": "2018-10-31T19:14:39.000Z",
      "plaintext": "[code]\n2018-10-31 18:47:59\tNano\t\t/clanmsg на 7200 ебани меня\n2018-10-31 18:47:36\tNano\t\t/clanmsg я знаю что ты клан чаты чекаешь\n2018-10-31 18:47:28\tNano\t\t/clanmsg забань меня сука\n2018-10-31 18:47:24\tNano\t\t/clanmsg админ,я с твоей пораши вывел несколько зарплат родителей школьников с этого проекта\n\n2018-10-29 11:34:46\tNano\t\t/clanmsg одмен хуй соси\n\n2018-10-28 15:20:23\tNano\t\t/srv Продам читы\n\n2018-10-27 18:39:10\tNano\t\t/msg Devil-ZiM около 10к вывел\n[/code]",
      "user": 475654,
      "author": 625349
    },
    {
      "id": 1454,
      "created": "2015-11-18T13:47:52.000Z",
      "plaintext": "2015-11-15 18:53:11\nRapidFire.exe",
      "user": 475654,
      "author": 1
    }
  ],
  "totalPages": 1,
  "currentPage": 1
}
```
