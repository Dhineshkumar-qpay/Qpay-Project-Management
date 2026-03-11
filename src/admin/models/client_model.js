import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../connection.js";

class ClientModel extends Model {}

ClientModel.init(
  {
    clientid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    companyname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contactperson: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Active", "Inactive"),
      defaultValue: "Active",
    },
    createdby: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize: sequelize,
    tableName: "clients",
    modelName: "ClientModel",
    timestamps: true,
  },
);

export { ClientModel };
