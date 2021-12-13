const Sequelize=require("sequelize");

module.exports=class Video extends Sequelize.Model{
	static init(sequelize){
		return super.init({
			title:{
				type:Sequelize.STRING(200),
				allowNull:false,
			},
			content:{
				type:Sequelize.STRING(500),
				allowNull:true,
			},
			date:{
				type:Sequelize.DATE,
				allowNull:true,
				defaultValue:Sequelize.NOW,
			},
			video:{
				type:Sequelize.STRING(300),
				allowNull:false,
			},
			length:{
				type:Sequelize.STRING(10),
				allowNull:false,
			},
			thumbnail:{
				type:Sequelize.STRING(300),
				allowNull:false,
			},
			views:{
				type:Sequelize.INTEGER,
				allowNull:false,
				defaultValue:0,
			},
			hashtag:{
				type:Sequelize.STRING(500),
				allowNull:true,
			},
			category:{
				type:Sequelize.STRING(100),
				allowNull:false,
			},
		},{
			sequelize,
			timestamps:true,
			underscored:false,
			modelName:'Video',
			tableName:'videos',
			charset:'utf8mb4',
			collate:'utf8mb4_general_ci',
		});
	}
	
	static associate(db){
		db.Video.belongsTo(db.User);
		db.Video.hasMany(db.Comment);
		db.Video.belongsToMany(db.Hashtag, {through:'VideoHashtag'});
	}
}