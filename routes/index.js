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

router.post('/comment', async(req, res, next)=>{
    try{
        const {comment}=req.body;
    }catch(error){

    }
});

router.get('/profile', async(req, res, next)=>{
    try{
        
    } catch{

    }
});
