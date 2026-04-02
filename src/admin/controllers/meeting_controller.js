import { MeetingModel } from "../../admin/models/meeting_model.js";
import { EmployeeModel } from "../../admin/models/employee_model.js";
import { Op } from "sequelize";
import {
    ApiErrorResponse,
    ApiSuccessResponse,
    SuccessResponse,
} from "../../utils/response.js";

export const getAllMeetings = async (req, res, next) => {
    try {
        const { employeeid, month } = req.body;
        let whereCondition = {};

        if (employeeid) {
            whereCondition.employeeid = employeeid;
        }

        const now = new Date();
        let start, end;

        if (month) {
            // month is expected as "YYYY-MM"
            start = new Date(`${month}-01`);
            end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
        } else {
            // Default: current month
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        }

        whereCondition.date = {
            [Op.between]: [start, end],
        };

        const meetings = await MeetingModel.findAll({
            where: whereCondition,
            include: [
                {
                    model: EmployeeModel,
                    attributes: ["employeeid", "employeename"],
                },
            ],
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
