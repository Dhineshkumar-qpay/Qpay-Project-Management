import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../connection.js";

class MeetingModel extends Model { }

MeetingModel.init(
    {
        meetingid: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        employeeid: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        employeename: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        startTime: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        endTime: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        createdby: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        sequelize: sequelize,
        modelName: "MeetingModel",
        tableName: "meetings",
        timestamps: true,
    },
);

export { MeetingModel };
