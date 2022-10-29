const express = require('express')
const dotenv = require('dotenv')
const bcrypt = require('bcryptjs')
const path = require('path')
const mongoose = require('mongoose')
const User= require('./models/User')


const app = express();

app.listen(5000,()=>{
    console.log("server started on port 5000")
})

dotenv.config({path: './.env'})
var dburi = "mongodb://"+ process.env.DATABASE_HOST+":"+process.env.DATABASE_PORT+"/"+process.env.DATABASE
console.log(dburi)
mongoose.connect(dburi)
.then(()=>{
    console.log("Connected")
}).catch(()=>{
    console.log("Connection Failed")
})

const styleDir  = path.join(__dirname, './styles')

app.use(express.static(styleDir))
app.use(express.urlencoded({extended: 'false'}))
app.use(express.json())

// app.set('views', './views')
app.set('view engine', 'hbs')

app.get("/", (req,res)=>{
    res.render("index")
})
app.get("/register", (req,res)=>{
    res.render("register")
})

app.get("/login", (req,res)=>{
    res.render("login")
})


app.post("/auth/register", async(req,res)=>{
    console.log("TESTTTT")
    const user = req.body
    const isUserExist = await getUser(user.email)
    if(isUserExist){
        return res.render('register',{
            message: 'This email is already in use'
        })
      
    }
    else if(user.password!==user.password_confirm){
        return res.render('register',{
            message: 'Password does not match'
        })
    }

    let hashedPassword = await bcrypt.hash(user.password,8)
    user.password = hashedPassword
    const result = await new User(user).save()
    res.send(result)
})

const getUser = async(useremail)=>{
    const user = await User.exists({email:useremail})
    return user
}

app.post("/auth/login", async(req,res)=>{
    console.log("TESTTTT")
    const user = req.body
    const isUserExist = await getUserName(user.name)
    if(isUserExist!==null){
        bcrypt.compare(user.password,isUserExist, function(err, result) {
            if (err) { throw (err); }
            else if (result) {
                return res.send("Logged in")
            } else {
              return res.send("Doesnt match")
            }
          });
    }
})

const getUserName = async(username)=>{
    const user = await User.findOne({name:username})
    if(user!==null){
        return user.password
    }
    
}



