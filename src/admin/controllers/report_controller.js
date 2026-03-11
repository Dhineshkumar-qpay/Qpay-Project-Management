import { ReportModel, TimeSheetSummaryModel } from "../models/report_model.js";
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  SuccessResponse,
} from "../../utils/response.js";
import { EmployeeModel } from "../models/employee_model.js";
import {
  AssignProjectModel,
  ProjectModel,
  ProjectModule,
} from "../models/project_model.js";
import "../../middleware/associations.js";
import { sequelize } from "../../../connection.js";

export const getTotalCounts = async (req, res, next) => {
  try {
    const [employees, projects, assignments, reports] = await Promise.all([
      EmployeeModel.count(),
      ProjectModel.count(),
      AssignProjectModel.count(),
      ReportModel.count(),
    ]);

    // Calculate dynamic summary count: Unique combinations of employee and project from reports
    const summariesCount = await ReportModel.count({
      distinct: true,
      col: "employeeid", // This is not perfect as it only counts distinct employees.
    });

    // To be more accurate across project/employee combinations, we would use group.
    // However, let's try a simpler approach if the goal is to show something meaningful.
    // Let's use the number of unique employee + project records.
    const uniqueSummaries = await ReportModel.findAll({
      attributes: [
        [sequelize.fn("DISTINCT", sequelize.col("employeeid")), "employeeid"],
        "projectid",
      ],
      group: ["employeeid", "projectid"],
    });

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        data: {
          employees: employees,
          projects: projects,
          assignments: assignments,
          reports: reports,
          summaries: uniqueSummaries.length || 0,
        },
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const getAllReports = async (req, res, next) => {
  const { employeeid, projectid, workdate } = req.body;

  try {
    const whereCondition = {};

    if (employeeid) {
      whereCondition.employeeid = employeeid;
    }

    if (projectid) {
      whereCondition.projectid = projectid;
    }

    if (workdate) {
      whereCondition.workdate = workdate;
    }

    const reports = await ReportModel.findAll({
      where: whereCondition,
      attributes: [
        "reportid",
        "starttime",
        "endtime",
        "workdate",
        "workinghours",
        "taskname",
      ],
      include: [
        {
          model: ProjectModel,
          attributes: ["projectid", "projectname"],
        },
        {
          model: ProjectModule,
          attributes: ["moduleid", "modulename"],
        },
        {
          model: EmployeeModel,
          attributes: ["employeeid", "employeename"],
        },
      ],
      raw: true,
    });

    const formattedReports = reports.map((item) => ({
      reportid: item.reportid,
      starttime: item.starttime,
      endtime: item.endtime,
      workdate: item.workdate,
      workinghours: item.workinghours,
      taskname: item.taskname,

      employeeid: item["EmployeeModel.employeeid"] || null,
      employeename: item["EmployeeModel.employeename"] || null,

      projectid: item["ProjectModel.projectid"] || null,
      projectname: item["ProjectModel.projectname"] || null,

      moduleid: item["ProjectModule.moduleid"] || null,
      modulename: item["ProjectModule.modulename"] || null,
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

export const addEmployeeReport = async (req, res, next) => {
  try {
    const {
      employeeid,
      projectid,
      moduleid,
      workdate,
      starttime,
      endtime,
      workinghours,
      taskname,
    } = req.body;

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

    if (endtime <= starttime) {
      throw new ApiErrorResponse(
        "End time must be greater than start time",
        400,
      );
    }

    if (isNaN(workinghours) || workinghours <= 0) {
      throw new ApiErrorResponse(
        "Working hours must be a valid positive number",
        400,
      );
    }

    const report = await ReportModel.create({
      employeeid,
      projectid,
      moduleid,
      workdate,
      starttime,
      endtime,
      workinghours,
      taskname: taskname.trim(),
      createdby: req.user?.adminid || req.user?.userid || req.user?.id || 1,
    });

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 201,
        message: "Report added successfully for employee",
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const getTimeSheetSummary = async (req, res, next) => {
  const { employeeid, projectid, month, year } = req.body;

  try {
    const whereCondition = {};
    if (employeeid) whereCondition.employeeid = employeeid;
    if (projectid) whereCondition.projectid = projectid;

    const reports = await ReportModel.findAll({
      where: whereCondition,
      include: [
        {
          model: EmployeeModel,
          attributes: ["employeeid", "employeename"],
        },
        {
          model: ProjectModel,
          attributes: ["projectid", "projectname"],
        },
      ],
      raw: true,
      nest: true,
    });

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const summaryMap = {};

    reports.forEach((report) => {
      // workdate is YYYY-MM-DD
      const dateParts = report.workdate.split("-");
      if (dateParts.length !== 3) return;

      const rYear = dateParts[0];
      const rMonthIndex = parseInt(dateParts[1], 10) - 1;
      const rMonth = monthNames[rMonthIndex];

      if ((!month || rMonth === month) && (!year || rYear === year)) {
        const key = `${report.employeeid}-${report.projectid}-${rMonth}-${rYear}`;
        if (!summaryMap[key]) {
          summaryMap[key] = {
            employeeName: report.EmployeeModel?.employeename,
            projectName: report.ProjectModel?.projectname,
            month: rMonth,
            year: rYear,
            totalDaysSet: new Set(),
            totalMinutes: 0,
          };
        }
        summaryMap[key].totalDaysSet.add(report.workdate);
        // Convert to minutes to avoid floating point issues during summation
        summaryMap[key].totalMinutes += Math.round(parseFloat(report.workinghours) * 60);
      }
    });

    const result = Object.values(summaryMap).map((item, index) => ({
      sno: index + 1,
      employeeName: item.employeeName,
      projectName: item.projectName,
      month: item.month,
      year: item.year,
      totalDays: item.totalDaysSet.size,
      totalHours: Number((item.totalMinutes / 60).toFixed(2)),
    }));

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        data: result,
      }),
    );
  } catch (error) {
    next(error);
  }
};
