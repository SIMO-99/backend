const { DataTypes, Model } = require('sequelize');

class User extends Model { }

User.init({

    id: { primaryKey: true, type: DataTypes.INTEGER, autoIncrement: true },
    username: DataTypes.TEXT,
    password: DataTypes.TEXT,
    is_admin: DataTypes.BOOLEAN,
    token_gen: DataTypes.TEXT,

},
    { sequelize: require('../config/db'), tableName: 'users', modelName: "User", defaultScope: { attributes: { exclude: ['password'] } } }

);



module.exports = User;
