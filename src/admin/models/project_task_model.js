import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../connection.js";

class ProjectTaskModel extends Model {}

ProjectTaskModel.init(
  {
    projecttaskid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    projectid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    moduleid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    taskname: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdby: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize: sequelize,
    tableName: "project_tasks",
    modelName: "ProjectTaskModel",
    timestamps: true,
  },
);

export { ProjectTaskModel };
