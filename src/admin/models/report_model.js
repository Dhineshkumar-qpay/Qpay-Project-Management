import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../connection.js";

class ReportModel extends Model { }

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
      allowNull: true,
      defaultValue: 0,
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
      allowNull: true,
    },
    projecttaskid: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
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

class AdditionalHoursReportModel extends Model { }

AdditionalHoursReportModel.init(
  {
    additionalhourid: {
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
    workdate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    starttime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    endtime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    totalhours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize: sequelize,
    tableName: "additionalhoursreport",
    modelName: "AdditionalHoursReportModel",
    timestamps: true,
  },
);

export { ReportModel, AdditionalHoursReportModel };
