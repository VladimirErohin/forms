const {Schema,model,ObjectId}=require('mongoose'); //импортируем Schema  и module из mongoose

const User = new Schema({                          //создаем схему(Schema) о полях сущности(user)
                                                   //mongoose по умолчанию создает id, так что начинаем с email
    email:{type:String, required:true, unique:true},
    name:{type:String, required:true, unique:true},
    password:{type:String, required:true},
    diskSpace:{type:Number,default:1024**3*10},
    usedSpace:{type:Number,default:0},
    avatar:{type:String},
    file:[{type:ObjectId, ref:'File'}] //связываем сущность User c File
});

module.exports = model('User', User); // модель созданна осталось ее экспортировать