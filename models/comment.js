const Sequelize=require('sequelize');

module.exports=class Comment extends Sequelize.Model{
	static init(sequelize){
		return super.init({
			content:{
				type:Sequelize.STRING(100),
				allowNull:false,
			},
			videoid:{
				type:Sequelize.STRING(100),
				allowNull:false,
			},
			commentowner:{
				type:Sequelize.STRING(100),
				allowNull:false,
			},
		},{
			sequelize,
			timestamps:true,
			paranoid:true,
			underscored:false,
			modelName:"Comment",
			tableName:"comments",
			charset:"utf8",
			collate:"utf8_general_ci",
		});
	}
	
	static associate(db){
		db.Comment.belongsTo(db.User);
		db.Comment.belongsTo(db.Video, {foreignKey:'commenter', targetKey:'id'});
	}
};