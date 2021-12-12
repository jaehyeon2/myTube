const express=require("express");
const cookieParser=require("cookie-parser");
const morgan=require('morgan');
const path=require('path');
const session=require('express-session');
const nunjucks=require('nunjucks');
const dotenv=require('dotenv');

dotenv.config();
const 

const app=express();
app.set('port', process.env.PORT||8000);
app.set('view engine', 'html');
nunjucks.configure('views', {
    express:app,
    watch:true,
});

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave:false,
    saveUninitialized:false,
    secret:process.env.COOKIE_SECRET,
    cookie:{
        httpOnly:true,
        secure:false,
    },
}));

app.use('/', router);
app.use((req, res, next)=>{
    const error=new Error(`${req.method} ${req.url} router is no exist.`);
    error.status=404;
    next(error);
});

app.use((err, req, res, next)=>{
    res.locals.message=err.message;
    res.locals.error=process.env.NODE_ENV!=='production'?err:{};
    res.status(err.status||500);
    res.render('error');
});

app.listen(app.get('port'), ()=>{
    console.log(app.get('port'), ' port waiting');
});