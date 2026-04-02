import { MeetingModel } from "../../admin/models/meeting_model.js";
import { EmployeeModel } from "../../admin/models/employee_model.js";
import {
    ApiErrorResponse,
    ApiSuccessResponse,
    SuccessResponse,
} from "../../utils/response.js";

export const addMeeting = async (req, res, next) => {
    try {
        const employeeid = req.user.employeeid || req.user.userid;
        const { date, startTime, endTime, description } = req.body;

        if (!date || !startTime || !endTime || !description) {
            throw new ApiErrorResponse("All fields are required", 400);
        }

        const employee = await EmployeeModel.findByPk(employeeid);
        if (!employee) {
            throw new ApiErrorResponse("Employee not found", 404);
        }

        const meeting = await MeetingModel.create({
            employeeid,
            employeename: employee.employeename,
            date,
            startTime,
            endTime,
            description,
            createdby: employeeid,
        });

        return SuccessResponse(
            res,
            new ApiSuccessResponse({
                statusCode: 201,
                message: "Meeting added successfully",
                data: meeting,
            }),
        );
    } catch (error) {
        next(error);
    }
};

export const getEmployeeMeetings = async (req, res, next) => {
    try {
        const employeeid = req.user.employeeid || req.user.userid;

        const meetings = await MeetingModel.findAll({
            where: { employeeid },
            order: [["date", "DESC"], ["startTime", "DESC"]],
        });

        return SuccessResponse(
            res,
            new ApiSuccessResponse({
                statusCode: 200,
                data: meetings || [],
            }),
        );
    } catch (error) {
        next(error);
    }
};
