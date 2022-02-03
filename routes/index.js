const express=require('express');
const Sequelize=require('sequelize');
const multer=require('multer');
const path=require('path');
const fs=require('fs');

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
        const user=await User.findOne({where:{id:req.params.id},});
        const videos=await Video.findAll({where:{id:req.params.id},});
        console.log('sdf');
        res.render('channel',{title:`myTube-${user.nick}`,
            user,
            videos,
        });
    } catch{
        console.error(error);
        next(error);
    }
});

try{
    fs.readdirSync('uploads');
} catch(error){
    console.error('uploads folder is no exist. create upload folder');
    fs.mkdirSync('uploads');
}

const upload=multer({
    storage:multer.diskStorage({
        destination(req, file, cb){
            cb(null, 'uploads/');
        },
        filename(req, file, cb){
            const ext=path.extname(file.originalname);
            cb(null, path.basename(file.originalname, ext)+Date.now()+ext);
        },
    }),
    limits:{filSize:5*1024*1024},
});

router.post('/video', isLoggedIn, upload.single('video'), (req, res)=>{
    console.log(req.file);
    res.json({url:`/video/${req.file.filname}`});
});

const upload2=multer();
router.post('/', isLoggedIn, upload2.none(), async(req, res, next)=>{
    try{
        const video=await Video.create({
            content:req.body.content,
            video:req.body.url,
            UserId:req.user.id,
        });
        const hashtags=req.body.content.match(/#[^\s#]+/g);
        if (hashtags){
            const result=await Promise.all(
                hashtags.map(tag=>{
                    return Hashtag.findOrCreate({
                        where:{ title: tag.slice(1).toLowerCase() },
                    })
                }),
            );
            await video.addHashtags(result.map(r=>r[0]));
        }
        res.redirect('/');
    }catch(error){
        console.error(error);
        next(error);
    }
});

module.exports=router;