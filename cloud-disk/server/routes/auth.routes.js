const Router = require('express');  //export Router from express
const User = require('../modules/User'); // export model User from '../modules/User"
const router = new Router(); //создадим обьект route
const bcrypt = require("bcryptjs"); // import bcrypt from bcryptjs для hash-ния паролей до этого его нужно "npm i bcryptjs"
const {check, validationResult} = require("express-validator")// для валидации форм для этого его нужно "npm i express-validator"
const jwt = require("jsonwebtoken");//библиотека для token
const config = require("config");// для  config.get("secretKey")


router.post('/registration',
    [
        check('email', "Uncorrect email").isEmail(), // вызываем ф-цию check()- первым параметрам в неё вставляем поле 'email' которое будем валидировать а вторым сообщение с ошибкой'Uncorrect email', далее укажем что поле нужно провалидировать как .isEmail()
        check('password', 'Password must be longer than 3 and short than 12').isLength({min: 3, max: 12}) // делаем тоже что  и с 'email', но password валидируем по .isLength()-по длинне
    ],
    async (req, res) => {   //первыый метод c двумя параметрами-(1) post запрос по url('/registration') и (2) ф-цию с параметрами(req,res)
        try {

            console.log(req.body)

            const errors = validationResult(req) //теперь при помощи ф-ции validatorResult() получим результат валидации
            if (!errors.isEmpty()) { //если валидация содержит ошибки тогда "return res.status(400).json({message: 'Uncorrect request', errors})"
                return res.status(400).json({message: 'Uncorrect request', errors})
            }


            const {name,email, password} = req.body     //получим email/password из тела запросса

            const candidate = await User.findOne({email})  // провери есть ли такой пользователь с таким  email в БД
            if (candidate) {
                return res.status(400).json({message: `User with email ${email} already exist`}) //если есть такой email, тогда так
            }
            const hashPassword = await bcrypt.hash(password, 8); //вызываем ф-цию hash() и передадим в неё пароль пароль hash(password) '8'-это степень хэширования пароля

            const user = new User({name,email, password: hashPassword}) // если нет такого email, тогда создаем нового User. После hash-ия пароля передаем его user (password:hashPassword)

            await user.save(); //сохраняем user, это заключительный этап

            return res.json({message: "User was create"}) // здесь получим ответ с server в виде message "User was create"

        } catch (e) {
            console.log(e)
            res.send({message: "server error"}) //если отловим ошибку то будем отправлять пользователю сооб."server error"
        }
    });

router.post('/login',

    async (req, res) => {   //первыый метод c двумя параметрами-(1) post запрос по url('/login') и (2) ф-цию с параметрами(req,res)
        try {
            const {email, password} = req.body;//получим email/password из тела запросса
            const user = await User.findOne({email}); //попробуем найти user по этому email

            if(!user){
                return  res.status(404).json({message:"User not found"}) //если user по email не найден, то возвр. ошибку "{message:"User not found"}"
            }

            const isPassValid =bcrypt.compareSync(password, user.password) // если user найден сравниваем password(по запросу на сервер и с pass. в BD)

            if(!isPassValid){
                return  res.status(400).json({message:"Invalid password"})//если невалидный отправим сообщ. "message:"Unvalid password"" !!! нужно усновить "npm i jsonwebtoken"
            }

            const token = jwt.sign({id: user.id}, config.get("secretKey"), {expiresIn:"1h"})//создания token
                                                                                            //{id: user.id}обьект с данными которые мы хотим передать в token, секретный ключ, время котрое token будет существовать

            return res.json({           //после создания token его необходима вернуть обратно на client c данными о user(кроме password)
                token,
                user:{
                  id:user.id,
                    email:user.email,
                    diskSpace:user.diskSpace,
                    usedSpace:user.usedSpace,
                    avatar:user.avatar,
                }
            })
        } catch (e) {
            console.log(e)
            res.send({message: "server error"}) //если отловим ошибку то будем отправлять пользователю сооб."server error"
        }
    });

module.exports = router;
