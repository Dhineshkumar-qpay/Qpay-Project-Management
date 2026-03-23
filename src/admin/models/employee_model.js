import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../connection.js";

class EmployeeModel extends Model {}

EmployeeModel.init(
  {
    employeeid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    profile: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    employeename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mobilenumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: 10,
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
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
    designation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dateofbirth: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    joiningdate: {
      type: DataTypes.STRING,
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
    tableName: "employees",
    modelName: "EmployeeModel",
    timestamps: true,
  },
);

export { EmployeeModel };
