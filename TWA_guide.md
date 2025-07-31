TMA design guidelines
info
Starting with version 6.10, Telegram updated the Mini App color palette by fixing some old colors and adding new ones.

For context, let's look back at the update history.

Changelog
bg_color and secondary_bg_color have been updated.


Reasons for these changes
• These colors were originally intended for page backgrounds, not UI controls.

• To maintain consistency, they have been updated.

• section_bg_color was introduced to color the backgrounds of different sections and cards.

To enhance your app’s appearance, adjust how you use color variables.

The example above clearly shows what will change on iOS. There should be no changes on Android.

New colors. Many new colors have been added with most being noticeable on Android. The examples focus on Android but apply to all platforms.


Telegram header colors has become available for Mini Apps.


accent_text_color is now available for highlighting accent elements in your apps. Previously, everyone used the less suitable dark link_color.


For all secondary cell labels, use subtitle_text_color to create more contrast and improve the accessibility.


A new token section_header_text_color is now available for section headers of cards.


For cells that trigger a destructive action, use destructive_text_color instead of custom color.



A reasonable question arises: how should link_color and hint_color be used now?
Use hint_color for hint sections under different sections. For backgrounds like secondary_bg_color, use link_color.

Telegram Mini App. Как создать Web App с нуля
Сложный
13 мин
159K
Блог компании Amvera
Веб-разработка
*
Python
*
JavaScript
*
Программирование
*
Туториал
Mini Apps (или же Web Apps) - это относительно новый и удобный способ добавления веб приложения прямо в интерфейсе Telegram. Используя JavaScript, становится возможным создавать бесконечное множество интерфейсов, которые смогут заменить полноценный веб-сайт.

Особенность Mini Apps заключается в том, что они поддерживают авторизацию, платежи одной кнопкой и возможность работать с данными пользователя, открывшего мини-приложение.

И сегодня мы попробуем создать приложение, взаимодействующее с данными пользователя, и развернем бота вместе с сайтом в облаке.

В этой статье мы
Инициализируем БД;

Напишем простой веб-сайт со взаимодействием с API Telegram, которое подключим в коде;

Стилизуем страницу под тему приложения Telegram с помощью API;

Научимся получать и обрабатывать данные со страницы;

Задеплоим сайт и бота в облако.

Так как это обучающий материал, мы не будем использовать различные фреймворки для фронта - сейчас это просто не нужно.

Создание бота, базовые настройки и деплой Web App сайта
Не думаю, что все нуждаются в объяснении процесса создания бота через @BotFather, поэтому сразу перейдем к включению Mini Apps.

Для этого используем команду /mybots и выбираем нового бота.


Нажимаем кнопку Bot Settings, далее Configure Mini App

В сообщении видим, что Mini App отключен для бота. Исправляем ситуацию, нажав на кнопку “Enable Mini App”


Бот попросит отправить ссылку на MiniApp, который будет открываться по кнопке “Открыть” в боте.

Тут самое интересное: для безопасности требуется развернуть сайт с безопасным протоколом https. В этом нам поможет Amvera Cloud, где предоставляется возможность получить бесплатный сертификат Let’s Encrypt при развертывании веб приложения. Помимо этого, есть и другие преимущества при использовании Amvera:

Удобная доставка обновлений кода через git. Обновление проекта на проде делается всего тремя командами в вашей IDE. Это проще, чем настройка VPS.

Вам не нужно делать никаких доп. настроек, сайт можно развернуть буквально за 5 минут. Задаете пару полей в конфигурации, загружаете файлы проекта и все само настраивается и запускается.

Бесплатный баланс при регистрации 111 рублей.

Деньги никуда не улетят, даже если вы не будете некоторое время пользоваться сервисом: вы платите только за работающее приложение.

Но довольно рекламы, перейдем к деплою пока пустого сайта.

Подготовка к деплою mini app
Важно: Чтобы получить ссылку на сайт (webApp), понадобится развернуть его отдельно от бота вторым проектом.

Создадим index.html с базовой структурой и текстом:

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <div class="Main">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Earum, temporibus ad mollitia hic vel repudiandae sit labore quaerat voluptatum id quisquam deleniti officia dicta harum sapiente, praesentium recusandae quas et?
    </div>
</body>
</html>
Рекомендуется следовать инструкциям нашей недавней статьи, где будут все исходники и файл конфигурации для деплоя.

Вкратце, в папке с index.html нужно создать файл main.py с кодом, который позволит опубликовать сайт и открыть к нему доступ по ссылке.

Содержимое main.py:

from flask import Flask, render_template  
  
app = Flask(__name__, template_folder='.')  
  
@app.route("/")  
def web():  
    return render_template('index.html')  
  
if __name__ == "__main__":  
    app.run(debug=True, host="0.0.0.0", port='80')  
В объявлении app, параметром template_folder является путь к папке, где лежит template (index.html). В нашем случае нужно прописать точку, так как оба файла находятся в одной директории.

Чтобы получить ссылку на работающий сайт, вам нужно будет активировать дефолтное доменное имя во вкладке "Настройки" проекта с webApp (который вы развернете по инструкции), поставив переключатель в положение "Включено", после чего скопировать ссылку на сайт c протоколом https, предварительно проверив его работоспособность.

Ссылка будет выглядеть в следующем формате:
https://названиепроекта-имяпользователя.amvera.io.
Но также можно добавить свое доменное имя.

Для связи самого бота и фронта нужно указать ссылку на webapp при объявлении webAppInfo. О чем будет более подробно ниже.

Завершение настройки Web App
Теперь, когда есть ссылка на работающее приложение, вам остается лишь отправить ссылку бота и получить подтверждение, что все прошло успешно.

Проверим: кнопка “открыть приложение” отображается в боте!

Проверка работоспособности mini app
Проверка работоспособности mini app
Работа с Telegram API внутри Mini App
Стилизация страницы под установленную тему клиента Telegram
Давайте добавим немного контента в index.html и подключим скрипт для работы с Telegram:

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            color: var(--tg-theme-text-color);
            background: var(--tg-theme-bg-color);
        }

        .Main {
            width: 100%;
            padding: 25px;
            text-align: center;

        }

        h1 {
            margin-top: 40px;
            margin-bottom: 10px;
        }

        img {
            width: 70px;
            margin: 30px auto;
        }

        .btn {
            border: 0;
            border-radius: 5px;
            margin-top: 50px;
            height: 60px;
            width: 200px;
            font-style: 20px;
            font-weight: 500;
            cursor: pointer;
            color: var(--tg-theme-button-text-color);
            background: var(--tg-theme-button-color);
        }
        
    </style>
</head>
<body>
    <div class="Main">
        <h1>Тестовое приложение</h1>
        <img src="{{ url_for('static', filename='bot.png') }}" alt="123">
        <p></p>
        <button class="btn">Кнопка</button>
    </div>

    <script src="https://telegram.org/js/telegram-web-app.js"></script>
</body>
</html>
Разберем самое интересное из кода:

У блока btn и body появились стили color и background со значениями из переменных. Именно так выглядит подключение стилизации цветов под тему клиента Telegram. Например, если в приложении включена темная тема, то и в WebApp будет темная тема. Полный список подобных переменных вы можете посмотреть в официальной документации Telegram.

Добавлено подключение требуемого скрипта.

Стилизированы элементы и добавлено изображение по пути static/bot.png.

Вот так Mini App выглядит, если открыть его в темной и светлой теме:

Темная тема
Темная тема
Светлая тема
Светлая тема
Часть из доступных переменных:

color-scheme: var(--tg-color-scheme) - Устанавливает цветовую схему

var(--tg-viewport-height) - Текущая высота видимой области мини-приложения

var(--tg-viewport-stable-height) - Высота видимой области Mini App в его последнем стабильном состоянии

background: var(--tg-theme-bg-color) - Цвет заднего фона под тему Telegram

color: var(--tg-theme-text-color) - Цвет текста под тему Telegram

var(--tg-theme-link-color) - Цвет ссылки под тему Telegram

и другие

Все переменные можно без проблем добавить и использовать в CSS.

Функционирование Web App мини-приложения
Добавим новую форму, которая будет открываться после нажатия на кнопку. В этой форме мы чуть позже добавим метод доставки данных, записанных в поля input. Сейчас займемся функционированием кнопки и стилизацией формы.

По задумке мы сможем через MiniApp создавать мини-статьи с заголовком, описанием и основным текстом

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            color: var(--tg-theme-text-color);
            background: var(--tg-theme-bg-color);
        }

        .Main {
            width: 100%;
            padding: 25px;
            text-align: center;

        }

        h1 {
            margin-top: 40px;
            margin-bottom: 10px;
        }

        img {
            width: 70px;
            margin: 30px auto;
        }

        .btn {
            border: 0;
            border-radius: 5px;
            margin-top: 50px;
            height: 60px;
            width: 200px;
            font-style: 20px;
            font-weight: 500;
            cursor: pointer;
            color: var(--tg-theme-button-text-color);
            background: var(--tg-theme-button-color);
        }

        form {
            display: none;
            text-align: center;
        }
        
        input {
            outline: none;
            border-radius: 5px;
            border: 2px solid #535353;
            padding: 15px 10px;
            margin: 10px 0 0;
            background: var(--tg-theme-section-separator-color);
            color: var(--tg-theme-text-color);
            transition: all .2s;
        }
        
        input:focus {
            border-color: var(--tg-theme-secondary-bg-color)
        }
        
    </style>
</head>
<body>
    <div class="Main">
        <h1>Тестовое приложение</h1>
        <img src="{{ url_for('static', filename='bot.png') }}" alt="">
        <p></p>
        <button class="btn f-btn">Тест отправки данных</button>
    </div>
    <form class="test-form">    
        <input type="text" placeholder="Введите заголовок" class="title-inp">
        <input type="text" placeholder="Введите описание" class="desc-inp">
        <input type="text" placeholder="Введите текст" class="text-inp">
        <button class="btn s-btn">Отправить</button>
    </form>

    <script src="https://telegram.org/js/telegram-web-app.js"></script>

    <script>
        let tg = window.Telegram.WebApp;

        let fBtn = document.getElementsByClassName("f-btn")[0]
        let sBtn = document.getElementsByClassName("s-btn")[0]

        fBtn.addEventListener("click", () => {
            document.getElementsByClassName("Main")[0].style.display = "none";
            document.getElementsByClassName("test-form")[0].style.display = "block";
        });

        sBtn.addEventListener("click", () => {
            tg.close();
        });
    </script>
</body>
</html>
Так, помимо новых стилей я добавил небольшой код в java script в котором самое главное - объявление переменной tg. Именно объект window.Telegram.WebApp позволяет нам получать данные от пользователя, инициализировать userdata, добавлять кнопки и многое другое, что может помочь нам работать с Mini App.

Здесь описаны все методы объекта.

Вот примеры как получать данные пользователя с помощью объекта tg:

tg.initDataUnsafe.user.username - получение username

tg.initDataUnsafe.user.first_name - получение first_name юзера

Описание основных параметров:

tg.initData - получение данных от пользователя как строку 
tg.initDataUnsafe - получение данных от пользователя как объект
tg.isExpanded - проверяет открыто ли мини-приложение полностью по высоте (true/false)
tg.sendData(data) - отправка данных из приложения (в нашем случае из полей input)
tg.expand() - растянет окно во всю высоту
tg.close() - закрытие приложения
Важно отметить, что такие параметры как initData и initDataUnsafe работают, только если их запустить из меню команд бота, а sendData - только если через keyboard button. Под это приходится адаптироваться.

Доработаем обработчик нажатия на кнопку sBtn:

sBtn.addEventListener("click", () => {
            let title = document.getElementsByClassName("title-inp")[0];
            let description = document.getElementsByClassName("desc-inp")[0];
            let text = document.getElementsByClassName("text-inp")[0];

            
            let data = {
                title: title.value,
                desc: description.value,    
                text: text.value
            }

            tg.sendData(JSON.stringify(data));
        });
Здесь я занес для удобства все данные внутри полей в переменные, добавил их словарь data и отправил форматированные данные в JSON.

Теперь, если нажать на кнопку, приложение закроется, а в диалоге появится системное сообщение, что мы успешно передали данные боту.


Обработка данных ботом
Теперь все готово к написанию бота, который сможет преобразовать все данные в мини-статью.

Для начала создадим файл bot.py и напишем бота, который по команде /start отправит ReplyKeyboard, по которому мы и будем открыть web app.

Содержимое bot.py на данный момент

import asyncio
import logging
import os

from aiogram import Bot, Dispatcher, types
from aiogram.utils.keyboard import ReplyKeyboardBuilder

logging.basicConfig(level=logging.INFO)

bot = Bot(os.getenv("TOKEN"))
dp = Dispatcher()

@dp.message()
async def start(message: types.Message):
    webAppInfo = types.WebAppInfo(url="your-webapp-url")
    builder = ReplyKeyboardBuilder()
    builder.add(types.KeyboardButton(text='Отправить данные', web_app=webAppInfo))
    
    await message.answer(text='Привет!', reply_markup=builder.as_markup())

async def main():
    await bot.delete_webhook(drop_pending_updates=True)
    await dp.start_polling(bot)
    
if __name__ == "__main__":
    asyncio.run(main())
Это самая стандартная структура асинхронного бота на aiogram 3 с добавленным методом отправки сообщения с ReplyKeyboard. Не забываем указать ссылку на webapp при объявлении webAppInfo.

Также в этом коде мы используем переменные окружения для безопасного хранения токена. Если вы будете использовать файл .env как хранилище переменных, вам нужно будет добавить следующие импорты и вызов функции (предварительно установив модуль python-dotenv):

from dotenv import find_dotenv, load_dotenv

load_dotenv(find_dotenv())
Добавим логику обработки и получения данных из Web App
Добавим новый хендлер, который будет обрабатывать data только из webApp

@dp.message(F.content_type == ContentType.WEB_APP_DATA)
async def parse_data(message: types.Message):
    data = json.loads(message.web_app_data.data)
    await message.answer(f'<b>{data["title"]}</b>\n\n<code>{data["desc"]}</code>\n\n{data["text"]}', parse_mode=ParseMode.HTML)
В этом коде мы схватываем данные из полученного json и отправляем в ответ сообщение с полученными данными.

Все! Теперь все готово, остается лишь запустить бота и проверить работоспособность


Все работает! Теперь можно переходить к заключающему этапу - деплою бота.

Перед этим хотел бы сказать, что то, что мы сделали в этой статье - лишь малая часть возможного. Также мы сегодня не рассмотрели mainButton - одна из главных частей MiniApps. Все это с полученными сегодня знаниями вы сможете изучить самостоятельно в документации или почитать другие статьи.

Весь код
Здесь я собрал код чтобы вы могли быстро скопировать его и перейти к деплою

Web App
index.html:

<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            color: var(--tg-theme-text-color);
            background: var(--tg-theme-bg-color);
        }

        .Main {
            width: 100%;
            padding: 25px;
            text-align: center;

        }

        h1 {
            margin-top: 40px;
            margin-bottom: 10px;
        }

        img {
            width: 70px;
            margin: 30px auto;
        }

        .btn {
            border: 0;
            border-radius: 5px;
            margin-top: 50px;
            height: 60px;
            width: 200px;
            font-style: 20px;
            font-weight: 500;
            cursor: pointer;
            color: var(--tg-theme-button-text-color);
            background: var(--tg-theme-button-color);
        }

        form {
            display: none;
            text-align: center;
        }
        
        input {
            outline: none;
            border-radius: 5px;
            border: 2px solid #535353;
            padding: 15px 10px;
            margin: 10px 0 0;
            background: var(--tg-theme-section-separator-color);
            color: var(--tg-theme-text-color);
            transition: all .2s;
        }
        
        input:focus {
            border-color: var(--tg-theme-secondary-bg-color)
        }
        
    </style>
</head>
<body>
    <div class="Main">
        <h1>Тестовое приложение</h1>
        <img src="{{ url_for('static', filename='bot.png') }}" alt="">
        <p></p>
        <button class="btn f-btn">Тест отправки данных</button>
    </div>
    <form class="test-form">    
        <input type="text" placeholder="Введите заголовок" class="title-inp">
        <input type="text" placeholder="Введите описание" class="desc-inp">
        <input type="text" placeholder="Введите текст" class="text-inp">
        <button class="btn s-btn">Отправить</button>
    </form>

    <script src="https://telegram.org/js/telegram-web-app.js"></script>

    <script>
        let tg = window.Telegram.WebApp;

        let fBtn = document.getElementsByClassName("f-btn")[0]
        let sBtn = document.getElementsByClassName("s-btn")[0]

        fBtn.addEventListener("click", () => {
            document.getElementsByClassName("Main")[0].style.display = "none";
            document.getElementsByClassName("test-form")[0].style.display = "block";
        });

        sBtn.addEventListener("click", () => {
            let title = document.getElementsByClassName("title-inp")[0];
            let description = document.getElementsByClassName("desc-inp")[0];
            let text = document.getElementsByClassName("text-inp")[0];

            
            let data = {
                title: title.value,
                desc: description.value,    
                text: text.value
            }

            tg.sendData(JSON.stringify(data));
        });
    </script>
</body>
</html>
app.py

from flask import Flask, render_template  
  
app = Flask(__name__, template_folder='.')  
  
@app.route("/")  
def web():  
    return render_template('index.html')  
  
if __name__ == "__main__":  
    app.run(debug=True, host="0.0.0.0", port='80')  
Картинка bot.png в папке static

Бот
bot.py

import asyncio
import logging
import json
import os

from aiogram import Bot, Dispatcher, types, F
from aiogram.utils.keyboard import ReplyKeyboardBuilder
from aiogram.enums.content_type import ContentType
from aiogram.filters import CommandStart
from aiogram.enums.parse_mode import ParseMode

logging.basicConfig(level=logging.INFO)

bot = Bot(os.getenv("TOKEN"))
dp = Dispatcher()

@dp.message(CommandStart())
async def start(message: types.Message):
    webAppInfo = types.WebAppInfo(url="your-webapp-url")
    builder = ReplyKeyboardBuilder()
    builder.add(types.KeyboardButton(text='Отправить данные', web_app=webAppInfo))
    
    await message.answer(text='Привет!', reply_markup=builder.as_markup())

@dp.message(F.content_type == ContentType.WEB_APP_DATA)
async def parse_data(message: types.Message):
    data = json.loads(message.web_app_data.data)
    await message.answer(f'<b>{data["title"]}</b>\n\n<code>{data["desc"]}</code>\n\n{data["text"]}', parse_mode=ParseMode.HTML)

async def main():
    await bot.delete_webhook(drop_pending_updates=True)
    await dp.start_polling(bot)
    
if __name__ == "__main__":
    asyncio.run(main())
Деплой бота в облако Amvera
Регистрация в Amvera
Переходим по ссылке, нажимаем "регистрация" и вводим требуемые данные, подтверждаем email и номер телефона.

После подтверждения всех данных, мы получаем бесплатный баланс в размере 111 рублей, этого более чем достаточно для тестирования и деплоя нашего небольшого проекта!

Подготовка кода к деплою
Чтобы загрузить требуемые библиотеки в облако, нам нужно создать специальный файл зависимостей (requirements.txt), где будут перечислены все зависимости и их версии:

aiogram==3.10.0
В нашем проекте требуется установить только aiogram, все остальные библиотеки либо установятся вместе с aiogram, либо уже под капотом в Python.

Также понадобится создать файл конфигурации amvera.yml
Лучше всего воспользоваться графическим инструментом генерации amvera.yml.

Итого для деплоя бота нам понадобятся следующие файлы:

bot.py

amvera.yml

requirements.txt

Создание проекта
Если все готово - идем в личный кабинет, чтобы открыть личный кабинет со всеми проектами.

В правом верхнем углу нажимаем кнопку “Создать” для начала процесса создания проекта.

Выбираем название проекта, его тариф.


В следующем окне можно загрузить данные через интерфейс или инициализировать git. Пока можно пропустить. Также пропускаем создание конфигурации.

Настройка проекта и отправка кода в репозиторий Amvera
Когда проект создастся, нам нужно открыть его и перейти во вкладку “Переменные”, где мы зададим секрет - TOKEN.

Создание секрета
Создание секрета
Это все, что нужно было настроить. Можно отправлять код!

Настройка git и подключение к удаленному репозиторию Amvera
Как говорилось в начале статьи, Amvera использует git для доставки кода. Это удобно тем, что мы можем доставить правки буквально за 3 команды в терминале, даже не переходя на сайт.

К делу:

Инициализируйте локальный git репозиторий в корне проекта

git init

Привяжите локальный репозиторий к удаленному, по ссылке, которую вы сможете получить во вкладке “Репозиторий” проекта

git remote add amvera https://git.amvera.ru/ваш_юзернейм/ваш_проект

Добавляем файлы и делаем первый commit

git add .
git commit -m "Коммит"
Отправляем код в Amvera

git push amvera master
Если вы добавляли конфигурацию через сайт, то, возможно, понадобится прописать команду git pull amvera master

Заключение
Если вы все сделали правильно, ваш проект в скором времени соберется и запустится! За этот небольшой урок мы рассмотрели основы Mini Apps в Telegram и показали на практике один из проектов для обучения.

Если что-то не получилось или произошла ошибка, вы всегда можете установить причину во вкладке “Лог приложения” или “Лог сборки” в зависимости от того, на каком этапе произошла ошибка.

Готово, мы написали и развернули Mini App в Telegram!