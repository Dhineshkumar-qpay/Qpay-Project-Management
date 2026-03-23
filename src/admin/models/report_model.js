import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../connection.js";

class ReportModel extends Model {}

ReportModel.init(
  {
    reportid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    employeeid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    projectid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    moduleid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    starttime: {
      type: DataTypes.STRING,
      defaultValue: 0.0,
    },
    endtime: {
      type: DataTypes.STRING,
      defaultValue: 0.0,
    },
    workdate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    workinghours: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0.0,
    },
    taskname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdby: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize: sequelize,
    modelName: "ReportModel",
    tableName: "reports",
    timestamps: true,
  },
);

export { ReportModel };
