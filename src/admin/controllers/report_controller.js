import { AdditionalHoursReportModel, ReportModel } from "../models/report_model.js";
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
import { ClientModel } from "../models/client_model.js";
import { LeaveModel } from "../models/leave_model.js";
import { TaskModel } from "../models/task_model.js";
import { ProjectTaskModel } from "../models/project_task_model.js";
import "../../middleware/associations.js";
import { sequelize } from "../../../connection.js";
import { Op } from "sequelize";

export const getTotalCounts = async (req, res, next) => {
  try {
    const [
      employees,
      projects,
      assignments,
      reports,
      clients,
      pendingLeaves,
      approvedLeaves,
      activeProjects,
      pendingTasks,
    ] = await Promise.all([
      EmployeeModel.count(),
      ProjectModel.count(),
      AssignProjectModel.count(),
      ReportModel.count(),
      ClientModel.count(),
      LeaveModel.count({ where: { status: "Pending" } }),
      LeaveModel.count({ where: { status: "Approved" } }),
      ProjectModel.count({ where: { status: "Active" } }),
      TaskModel.count({ where: { status: "Pending" } }),
    ]);

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
          clients: clients,
          pendingLeaves: pendingLeaves,
          approvedLeaves: approvedLeaves,
          activeProjects: activeProjects,
          pendingTasks: pendingTasks,
        },
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const getAllReports = async (req, res, next) => {
  const { employeeid, projectid, workdate, month, year } = req.body;

  try {
    const whereCondition = {};

    if (employeeid) {
      whereCondition.employeeid = employeeid;
    }

    if (projectid) {
      whereCondition.projectid = projectid;
    }

    let startDate, endDate;

    if (month) {
      const selectedYear = year || new Date().getFullYear();

      startDate = new Date(selectedYear, month - 1, 1);
      endDate = new Date(selectedYear, month, 0);
    } else if (workdate) {
      whereCondition.workdate = workdate;
    } else {
      const currentDate = new Date();
      startDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
      );
      endDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0,
      );
    }
    if (startDate && endDate) {
      whereCondition.workdate = {
        [Op.between]: [startDate, endDate],
      };
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
        {
          model: ProjectTaskModel,
          attributes: ["projecttaskid", "taskname"],
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

      projecttaskid: item["ProjectTaskModel.projecttaskid"] || null,
      projecttaskname: item["ProjectTaskModel.taskname"] || null,
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

    const summaryMap = {};

    reports.forEach((report) => {
      // 👉 workdate format: YYYY-MM-DD
      const dateParts = report.workdate.split("-");
      if (dateParts.length !== 3) return;

      const rYear = parseInt(dateParts[0], 10);
      const rMonth = parseInt(dateParts[1], 10); // 👉 1–12

      // 👉 Filter using month number & year
      if ((!month || rMonth === month) && (!year || rYear === year)) {
        const key = `${report.employeeid}-${report.projectid}-${rMonth}-${rYear}`;

        if (!summaryMap[key]) {
          summaryMap[key] = {
            employeeName: report.EmployeeModel?.employeename,
            projectName: report.ProjectModel?.projectname,
            month: rMonth, // ✅ store number
            year: rYear,
            totalDaysSet: new Set(),
            totalMinutes: 0,
          };
        }

        summaryMap[key].totalDaysSet.add(report.workdate);

        const val = parseFloat(report.workinghours) || 0;
        const hPart = Math.floor(val);
        const mPart = Math.round((val - hPart) * 100);

        summaryMap[key].totalMinutes += hPart * 60 + mPart;
      }
    });

    const result = Object.values(summaryMap).map((item, index) => ({
      sno: index + 1,
      employeeName: item.employeeName,
      projectName: item.projectName,
      month: item.month, // ✅ returns 1–12
      year: item.year,
      totalDays: item.totalDaysSet.size,
      totalHours: Number(
        (
          Math.floor(item.totalMinutes / 60) +
          (item.totalMinutes % 60) / 100
        ).toFixed(2)
      ),
    }));

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        data: result,
      })
    );
  } catch (error) {
    next(error);
  }
};


export const getAllAdditionalHoursReports = async (req, res, next) => {
  try {
    const { employeeid, projectid, month, year } = req.body;
    let start, end;

    if (month) {
      const selectedYear = year || new Date().getFullYear();
      start = new Date(selectedYear, month - 1, 1);
      end = new Date(selectedYear, month, 0);
    } else {
      const now = new Date();
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    let whereCondition = {
      workdate: {
        [Op.between]: [start, end],
      },
    };

    if (employeeid && employeeid !== 0) {
      whereCondition.employeeid = employeeid;
    }

    if (projectid && projectid !== 0) {
      whereCondition.projectid = projectid;
    }

    const reports = await AdditionalHoursReportModel.findAll({
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
      order: [["workdate", "DESC"]],
    });

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        data: reports,
      })
    );
  } catch (error) {
    next(error);
  }
};
