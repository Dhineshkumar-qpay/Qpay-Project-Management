import { Op } from "sequelize";
import {
  ProjectModel,
  ProjectModule,
} from "../../admin/models/project_model.js";
import { ReportModel } from "../../admin/models/report_model.js";
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  SuccessResponse,
} from "../../utils/response.js";

export const addEmployeereport = async (req, res, next) => {
  try {
    const {
      projectid,
      moduleid,
      workdate,
      starttime,
      endtime,
      workinghours,
      taskname,
    } = req.body;

    const employeeid = req.user.employeeid;

    if (
      !employeeid ||
      !projectid ||
      !moduleid ||
      !workdate ||
      !starttime ||
      !endtime ||
      !workinghours ||
      !taskname?.trim()
    ) {
      throw new ApiErrorResponse("All fields are required", 400);
    }

    if (endtime <= starttime)
      throw new ApiErrorResponse(
        "End time must be greater than start time",
        400,
      );

    if (isNaN(workinghours) || workinghours <= 0)
      throw new ApiErrorResponse(
        "Working hours must be a valid positive number",
        400,
      );

    const report = await ReportModel.create({
      employeeid,
      projectid,
      moduleid,
      workdate,
      starttime,
      endtime,
      workinghours,
      taskname: taskname.trim(),
      createdby: employeeid,
    });

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 201,
        message: "Report added successfully",
      }),
    );
  } catch (error) {
    next(error);
  }
};

// export const getAllReports = async (req, res, next) => {
//   try {
//     const employeeReports = await ReportModel.findAll({
//       where: { employeeid: req.user.employeeid },
//       include: [
//         {
//           model: ProjectModel,
//           attributes: ["projectname"],
//         },
//         {
//           model: ProjectModule,
//           attributes: ["modulename"],
//         },
//       ],
//       order: [["workdate", "DESC"]],
//     });

//     if (employeeReports) {
//       const formattedReports = employeeReports.map((report) => ({
//         ...report.toJSON(),
//         projectname: report.ProjectModel?.projectname || "Unknown Project",
//         modulename: report.ProjectModule?.modulename || "Unknown Module",
//       }));

//       return SuccessResponse(
//         res,
//         new ApiSuccessResponse({
//           statusCode: 200,
//           data: formattedReports,
//         }),
//       );
//     }
//     throw new ApiErrorResponse("Failed to fetch reports", 400);
//   } catch (error) {
//     next(error);
//   }
// };

export const getAllReports = async (req, res, next) => {
  try {
    const { startDate, endDate, projectid } = req.body;

    const now = new Date();
    let start, end;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    let whereCondition = {
      employeeid: req.user.employeeid,
      workdate: {
        [Op.between]: [start, end],
      },
    };

    if (projectid && projectid !== 0) {
      whereCondition.projectid = projectid;
    }

    const employeeReports = await ReportModel.findAll({
      where: whereCondition,
      include: [
        {
          model: ProjectModel,
          attributes: ["projectname"],
        },
        {
          model: ProjectModule,
          attributes: ["modulename"],
        },
      ],
      order: [["workdate", "DESC"]],
    });

    const formattedReports = employeeReports.map((report) => ({
      reportid: report.reportid,
      employeeid: report.employeeid,
      projectid: report.projectid,
      moduleid: report.moduleid,
      starttime: report.starttime,
      endtime: report.endtime,
      workdate: report.workdate,
      workinghours: report.workinghours,
      taskname: report.taskname,
      createdby: report.createdby,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      projectname: report.ProjectModel?.projectname || "Unknown Project",
      modulename: report.ProjectModule?.modulename || "Unknown Module",
    }));

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        data: formattedReports,
      }),
    );
  } catch (error) {
    next(error);
  }
};
