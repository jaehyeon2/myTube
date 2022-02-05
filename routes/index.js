const express=require('express');
const Sequelize=require('sequelize');
const multer=require('multer');
const path=require('path');
const fs=require('fs');

const {Comment, Hashtag, User, Video}=require('../models');
const {isLoggedIn, isNotLoggedIn}=require('./middlewares');
const { runInContext } = require('vm');

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

router.get('/profile/:id', async (req, res, next)=>{
    try{
        const user=await User.findOne({where:{id:req.params.id},});
        console.log('user', user);
        console.log('nick', user.nick);
        const videos=await Video.findAll({}, {where:{UserId:req.params.id},});
        console.log('sdf');
        res.render('channel',{title:`${user.nick}-myTube`, user, videos});
        console.log('fin');
    } catch(error){
        console.error(error);
        next(error);
    }
});

router.get('/video/:id', async(req, res, next)=>{
    try{
        const video_tmp=await Video.findOne({
			where:{id:req.params.id},
		});
		await Video.update({
			views:video_tmp.views+1,
		},{
			where:{id:req.params.id},
		});

        const video=await Video.findOne({where:{id:req.params.id},});
        res.render('video',{title:`myTube-${video.title}`,
            video,
        });
    } catch(error){
        console.error(error);
        next(error);
    }
});

router.get('/delete/video/:id', isLoggedIn, async(req, res, next)=>{

})

router.get('/upload', isLoggedIn, async(req, res, next)=>{
    try{
        console.log('upload');
        res.render('upload', {title:'myTube-upload'});
    }catch(error){
        console.error(error);
        next(error);
    }
})

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
			cb(null, path.basename(file.originalname, ext)+new Date().valueOf()+ext);
		},
	}),
	limits:{fileSize:500*1024*1024},
});


router.post('/video', isLoggedIn, upload.single('video'), async(req, res, next)=>{
	try{
        console.log('video', req.body.url);
        const today = new Date();   
	    const time=today.getFullYear()+'/'+(today.getMonth()+1)+'/'+today.getDate()+' '+today.getHours()+':'+today.getMinutes()+':'+today.getSeconds();
        const video=await Video.create({
            title:req.body.title,
            content:req.body.content,
            owner:req.user.nick,
            video:req.file.filename,
            UserId:req.user.id,
            date:time,
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