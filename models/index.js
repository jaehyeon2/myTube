const Sequelize=require('sequelize');
const env=process.env.NODE_ENV||'development';
const config=require("../config/config")[env];

const User=require("./user");
const Video=require("./video");
const Hashtag=require("./hashtag");
const Comment=require('./comment');

const db={};
const sequelize=new Sequelize(config.database, config.username, config.password, config,);

db.sequelize=sequelize;
db.User=User;
db.Video=Video;
db.Hashtag=Hashtag;
db.Comment=Comment;

User.init(sequelize);
Video.init(sequelize);
Hashtag.init(sequelize);
Comment.init(sequelize);

User.associate(db)
Video.associate(db);
Hashtag.associate(db);
Comment.associate(db);

module.exports=db;