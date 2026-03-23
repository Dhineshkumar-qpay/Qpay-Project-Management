import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../connection.js";

class LeaveModel extends Model { }

LeaveModel.init(
  {
    leaveid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    employeename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    employeeid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    leavetype: {
      type: DataTypes.ENUM("Sick Leave", "Casual Leave", "Loss of Pay"),
      allowNull: false,
    },
    startdate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    enddate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    totaldays: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Pending", "Approved", "Rejected"),
      defaultValue: "Pending",
    },
    applieddate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize: sequelize,
    modelName: "LeaveModel",
    tableName: "leaves",
    timestamps: true,
  },
);

export { LeaveModel };
