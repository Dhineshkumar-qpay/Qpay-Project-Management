import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../connection.js";

class AttendanceModel extends Model { }

AttendanceModel.init(
  {
    attendanceid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    employeeid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    checkin: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    checkout: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Present", "Absent", "Not Marked"),
      defaultValue: "Not Marked",
    },
    workinghours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
  },
  {
    sequelize: sequelize,
    tableName: "attendance",
    modelName: "AttendanceModel",
    timestamps: true,
  },
);

class HolidayModel extends Model { }

HolidayModel.init(
  {
    holidayid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize: sequelize,
    tableName: "holiday",
    modelName: "HolidayModel",
    timestamps: true,
  },
);

export { AttendanceModel, HolidayModel };
