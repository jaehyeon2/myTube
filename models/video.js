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
			owner:{
				type:Sequelize.STRING(100),
				allowNull:false,
			},
			date:{
				type:Sequelize.STRING(100),
				allowNull:false,
			},
			video:{
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
		db.Video.hasMany(db.Comment, {foreignKey:'commenter', sourceKey:'id'});
		db.Video.belongsToMany(db.Hashtag, {through:'VideoHashtag'});
	}
}