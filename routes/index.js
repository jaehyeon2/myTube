const express=require('express');
const Sequelize=require('sequelize');
const multer=require('multer');
const path=require('path');
const fs=require('fs');

const {User, Video, Comment, Hashtag}=require('../models');
const {isLoggedIn, isNotLoggedIn}=require('./middlewares');
const { runInContext } = require('vm');
const { redirect } = require('express/lib/response');

const router=express.Router();

router.use((req, res, next)=>{
    res.locals.user=req.user;
    res.locals.follwerCount=req.user?req.user.Followers.length:0;
    res.locals.followingCount=req.user?req.user.Followings.length:0;
    res.locals.followerIdList=req.user?req.user.Followings.map(f=>f.id):[];
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

router.get('/join', isNotLoggedIn, async(req, res)=>{
    res.render('join', {title:'myTube-join'});
});

router.get('/login', isNotLoggedIn, async(req, res)=>{
    res.render('login', {title:'myTube-login'});
})

//channel page

router.get('/profile/:id', async (req, res, next)=>{
    try{
        var isOwner=false;
        const owner=await User.findOne({where:{nick:req.params.id},});
        console.log('nick', req.params.id); 
        const videos=await Video.findAll({where:{owner:req.params.id},});

        if (!req.user){
            
        }
        else if (req.user.nick==owner.nick){
            isOwner=true;
            console.log('login user', req.user.nick);
        }
        res.render('channel',{title:`${owner.nick}-myTube`, owner, videos, isOwner});
        console.log('fin');
    } catch(error){
        console.error(error);
        next(error);
    }
});

router.post('/user/:id/subcribe', isLoggedIn, async(req, res, next)=>{
    try{
        const user=await User.findOne({where:{id:req.user.id}});
        console.log('user', user);
        if (user){
            await user.addFollowing(parseInt(req.params.id, 10));
            console.log('success');
            res.redirect(req.get('referer'));
        }else{
            res.status(404).send('no user');
        }
    }catch(error){
        console.error(error);
        next(error);
    }
});

//video page

router.post('/comment', isLoggedIn, async(req, res, next)=>{
    try{
        console.log('content', req.body.comment);
        console.log('videoid', req.body.videoid);
        console.log('commentowner', req.user.nick);
        const comment=await Comment.create({
            content:req.body.comment,
            videoid:req.body.videoid,
            commentowner:req.user.nick,
        });
        res.redirect(req.get('referer'));
    }catch(error){
        console.error(error);
        next(error);
    }
});


router.get('/video/:id', async(req, res, next)=>{
    try{
        const video_tmp=await Video.findOne({
			where:{id:req.params.id},
		});
        const comments=await Comment.findAll({where:{videoid:req.params.id},});
		await Video.update({
			views:video_tmp.views+1,
		},{
			where:{id:req.params.id},
		});

        const video=await Video.findOne({where:{id:req.params.id},});
        res.render('video',{title:`myTube-${video.title}`,
            video,
            comments,
        });
    } catch(error){
        console.error(error);
        next(error);
    }
});

router.get('/delete/video/:id', isLoggedIn, async(req, res, next)=>{
    try{
        await Video.destroy({
            where:{id:req.params.id},
        });
        console.log('delete');
        res.redirect('/');
    }catch(error){
        console.error(error);
        next(error);
    }
});

router.get('/delete/comment/:id', isLoggedIn, async(req, res, next)=>{
    try{
        await Comment.destroy({
            where:{id:req.params.id},
        });
        console.log('delete');
        res.redirect(req.get('referer'));
    }catch(error){
        console.error(error);
        next(error);
    }
});

//upload page

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

/*
try{
    fs.readdirSync('uploads_thumbnails');
}catch(error){
    console.error('uploads_thumbnails folder is no exist. create uploads_thumbnails folder');
    fs.mkdirSync('uploads_thumbnails');
}
*/

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

/*
const upload_thumbnail=multer({
	storage:multer.diskStorage({
		destination(req, file, cb){
			cb(null, 'uploads_thumbnails/');
		},
		filename(req, file, cb){
			const ext=path.extname(file.originalname);
			cb(null, path.basename(file.originalname, ext)+new Date().valueOf()+ext);
		},
	}),
	limits:{fileSize:500*1024*1024},
});
*/

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