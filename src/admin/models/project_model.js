import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../connection.js";

class ProjectModel extends Model { }

ProjectModel.init(
  {
    projectid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    clientid: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    projectname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    clientname: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    startdate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    enddate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    createdby: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("Active", "Inactive"),
      defaultValue: "Active",
    },
  },
  {
    sequelize: sequelize,
    tableName: "projects",
    modelName: "ProjectModel",
    timestamps: true,
  },
);

class ProjectModule extends Model { }

ProjectModule.init(
  {
    moduleid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    projectid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    modulename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdby: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize: sequelize,
    tableName: "projectmodule",
    modelName: "ProjectModule",
    timestamps: true,
  },
);

class AssignProjectModel extends Model { }

AssignProjectModel.init(
  {
    assignmentid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
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
    projecttaskid: {
      type: DataTypes.INTEGER,
      defaultValue:0
    },

    assigneddate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    deadlinedate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    remarks: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    createdby: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    priority: {
      type: DataTypes.ENUM("high", "medium", "low"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(["progress", "completed"]),
      defaultValue: "progress",
    },
  },
  {
    sequelize: sequelize,
    tableName: "assignments",
    modelName: "AssignProjectModel",
    timestamps: true,
  },
);

export { ProjectModel, ProjectModule, AssignProjectModel };
