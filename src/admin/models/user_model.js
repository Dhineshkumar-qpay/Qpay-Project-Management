import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../connection.js";

class UserModel extends Model {}

UserModel.init(
  {
    userid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    mobile: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("employee", "admin", "manager"),
      allowNull: false,
      defaultValue: "employee",
    },
  },
  {
    sequelize: sequelize,
    tableName: "users",
    modelName: "UserModel",
    timestamps: true,
  },
);

export { UserModel };
