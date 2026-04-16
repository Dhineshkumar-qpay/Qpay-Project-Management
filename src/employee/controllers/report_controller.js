import { Op } from "sequelize";
import {
  ProjectModel,
  ProjectModule,
} from "../../admin/models/project_model.js";
import {
  AdditionalHoursReportModel,
  ReportModel,
} from "../../admin/models/report_model.js";
import { ProjectTaskModel } from "../../admin/models/project_task_model.js";
import "../../middleware/associations.js";
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
      projecttaskid,
      workdate,
      starttime,
      endtime,
      workinghours,
      taskname,
    } = req.body;

    const employeeid = req.user.employeeid || req.user.userid;

    if (
      !employeeid ||
      !projectid ||
      !workdate ||
      !starttime ||
      !endtime ||
      !workinghours
    ) {
      throw new ApiErrorResponse("Required fields are missing", 400);
    }

    const report = await ReportModel.create({
      employeeid,
      projectid,
      moduleid: moduleid || 0,
      workdate,
      starttime,
      endtime,
      workinghours,
      taskname: taskname?.trim(),
      projecttaskid: projecttaskid || 0,
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
      employeeid: req.user.employeeid || req.user.userid,
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
        {
          model: ProjectTaskModel,
          attributes: ["taskname"],
        },
      ],
      order: [["workdate", "DESC"]],
    });

    const formattedReports = employeeReports.map((report) => ({
      reportid: report.reportid,
      employeeid: report.employeeid,
      projectid: report.projectid,
      moduleid: report.moduleid,
      projecttaskid: report.projecttaskid,
      projecttaskname: report.ProjectTaskModel?.taskname || "",
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

export const addAdditionalHoursReport = async (req, res, next) => {
  try {
    const employeeid = req.user.employeeid || req.user.userid;
    const { projectid, workdate, starttime, endtime, totalhours, description } =
      req.body;

    if (!projectid || !starttime || !endtime || !totalhours || !description) {
      throw new ApiErrorResponse(
        "Missing required fields (projectid, starttime, endtime, totalhours, description)",
        400,
      );
    }

    const reportData = {
      employeeid: employeeid,
      projectid,
      starttime,
      endtime,
      totalhours,
      description,
    };

    if (workdate) {
      reportData.workdate = workdate;
    }

    const report = await AdditionalHoursReportModel.create(reportData);

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 201,
        message: "Additional hours report submitted successfully",
        data: report,
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const getMyAdditionalHoursReports = async (req, res, next) => {
  try {
    const employeeid = req.user.employeeid || req.user.userid;
    const reports = await AdditionalHoursReportModel.findAll({
      where: { employeeid },
      include: [
        {
          model: ProjectModel,
          attributes: ["projectname"],
        },
      ],
      order: [["workdate", "DESC"]],
    });

    const formattedReports = reports.map((report) => ({
      additionalhourid: report.additionalhourid,
      employeeid: report.employeeid,
      projectid: report.projectid,
      projectname: report.ProjectModel?.projectname || "Unknown Project",
      workdate: report.workdate,
      starttime: report.starttime,
      endtime: report.endtime,
      totalhours: report.totalhours,
      description: report.description,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
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
