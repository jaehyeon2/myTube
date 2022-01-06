const express=require('express');
const Sequelize=require('sequelize');

const {Comment, Hashtag, User, Video}=require('../models');
const {isLoggedIn, isNotLoggedIn}=require('./middlewares');

const router=express.Router();

router.use((req, res, next)=>{
    res.locals.user=req.user;
    next();
});

router.get('/', async(req, res, next)=>{
    try{
        const videos=await Video.findAll({});
        res.render('main', {title:'myTube', videos});
    }catch(error){
        console.error(error);
        next(error);
    }
});

router.get('/join', async(req, res)=>{
    res.render('join', {title:'myTube-join'});
});

router.get('/login', async(req, res)=>{
    res.render('login', {title:'myTube-login'});
})

router.post('/comment', async(req, res, next)=>{
    try{
        const {comment}=req.body;
    }catch(error){

    }
});

router.get('/profile/:id', async(req, res, next)=>{
    try{
        const user=await User.findOne({}, {where:{UserId:req.user.id}});
        const videos=await Video.findAll({}, {where:{UserId:res.user.id}});
        console.log('nick', user.nick);
        res.render('channel',{title:myTube-`${user.nick}`});
    } catch{
        console.error(error);
        next(error);
    }
});

module.exports=router;