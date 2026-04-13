import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../connection.js";

class TaskModel extends Model { }

TaskModel.init(
  {
    taskid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    taskname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    employeeid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    deadlinedate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    priority: {
      type: DataTypes.ENUM("high", "medium", "low"),
      defaultValue: "medium",
    },
    status: {
      type: DataTypes.ENUM("Pending", "In Progress", "Completed"),
      defaultValue: "pending",
    },
    createdby: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize: sequelize,
    tableName: "tasks",
    modelName: "TaskModel",
    timestamps: true,
  },
);

export { TaskModel };
