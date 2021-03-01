const express=require('express');  // фреймворк для создания web-приложений на NODEjs
const mongoose=require('mongoose');  // библиотека предназначенач для управления БД MONGO
const config= require('config');
const app = express(); // из express создадим сам сервер
const PORT = config.get('serverPort');
const authRouter = require('./routes/auth.routes');
const corsMiddleware = require('./middleware/cors.middleware');

app.use(corsMiddleware)
app.use(express.json());//по умолчанию express  не может распарсить json-строку Потому делаем "app.use(express.json())"
app.use("/api/auth", authRouter)//первый парметр в ф-цию use() передаем url '/api/auth' по которому он будет обрабатываться, а вторым сам роутер 'authRouter'(/registration)

const start =async()=> {  // функция, которая подключается к БД и запускает сам сервер
    try{
        await mongoose.connect(config.get("dbUrl"))

        app.listen(PORT,()=>{    //первую выз. ф-цию listen(первый параметр передаем номер порта на котором будет работать сервер, а вторым ф-цию когда сервер запустился)
console.log('server started on ', PORT)
        })
    }catch (e) {

    }
};

start();
