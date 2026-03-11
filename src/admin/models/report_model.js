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
      allowNull: false,
    },
    endtime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    workdate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    workinghours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
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

class TimeSheetSummaryModel extends Model {}

TimeSheetSummaryModel.init(
  {
    summaryid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    employeename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    projectname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    modulename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    workingdate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    workingdays: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    totalhours: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize: sequelize,
    modelName: "TimeSheetSummaryModel",
    tableName: "summaries",
    timestamps: true,
  },
);

export { ReportModel, TimeSheetSummaryModel };
