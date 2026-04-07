import {
  AssignProjectModel,
  ProjectModel,
  ProjectModule,
} from "../../admin/models/project_model.js";
import { ReportModel, AdditionalHoursReportModel } from "../../admin/models/report_model.js";
import { sequelize } from "../../../connection.js";
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  SuccessResponse,
} from "../../utils/response.js";
import "../../middleware/associations.js";

export const addProject = async (req, res, next) => {
  try {
    const requiredFields = [
      "projectname",
      "description",
      "startdate",
    ];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        throw new ApiErrorResponse(`${field} is required`, 400);
      }
    }

    const project = await ProjectModel.create({
      ...req.body,
      clientid: req.body.clientid || 1,
      createdby: req.user.employeeid || req.user.userid,
    });
    if (project) {
      return SuccessResponse(
        res,
        new ApiSuccessResponse({
          statusCode: 200,
          message: "Project created successfully",
        }),
      );
    }
    throw new ApiErrorResponse(`Failed to create project`, 400);
  } catch (error) {
    next(error);
  }
};

export const addModule = async (req, res, next) => {
  try {
    const { modulename, projectid, description } = req.body;
    if (!modulename) throw new ApiErrorResponse("Module name is required", 400);
    if (!projectid) throw new ApiErrorResponse("projectid is required", 400);

    const project = await ProjectModel.findByPk(projectid);
    if (!project) throw new ApiErrorResponse("Project not found", 404);

    const module = await ProjectModule.create({
      modulename,
      description,
      projectid,
      createdby: req.user.employeeid || req.user.userid,
    });
    if (module) {
      await AssignProjectModel.create({
        employeeid: req.body.employeeid || req.user.employeeid,
        projectid: projectid,
        moduleid: module.moduleid,
        assigneddate: new Date(),
        deadlinedate: project.enddate,
        priority: req.body.priority || "medium",
        createdby: req.user.employeeid || req.user.userid,
      });

      return SuccessResponse(
        res,
        new ApiSuccessResponse({
          statusCode: 200,
          message: "Module created and assigned successfully",
        }),
      );
    }
    throw new ApiErrorResponse("Failed to created module", 400);
  } catch (error) {
    next(error);
  }
};

export const employeeProjects = async (req, res, next) => {
  try {
    const employeeid = req.user.employeeid || req.user.userid;
    if (!employeeid) {
      throw new ApiErrorResponse("Unauthorized", 401);
    }

    const projects = await ProjectModel.findAll({
      where: {
        createdby: employeeid,
      },
      attributes: ["projectid", "projectname", "description", "startdate", "enddate"],
    });

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        data: projects || [],
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const assignedEmployeeProjects = async (req, res, next) => {
  try {
    const employeeid = req.user.employeeid || req.user.userid;

    if (!employeeid) {
      throw new ApiErrorResponse("Unauthorized", 401);
    }

    const projects = await AssignProjectModel.findAll({
      where: {
        employeeid: employeeid,
      },
      include: [
        {
          model: ProjectModel,
          attributes: ["projectid", "projectname", "description"],
        },
        {
          model: ProjectModule,
          attributes: ["moduleid", "modulename", "description", "createdby", "projectid"],
        },
      ],
    });

    const groupedData = projects.reduce((acc, current) => {
      const projectid = current.ProjectModel?.projectid;
      if (!projectid) return acc;

      if (!acc[projectid]) {
        acc[projectid] = {
          projectid: projectid,
          projectname: current.ProjectModel?.projectname,
          description: current.ProjectModel?.description,
          modules: [],
        };
      }

      acc[projectid].modules.push({
        assignmentid: current.assignmentid,
        projectid: projectid,
        employeeid: current.employeeid,
        moduleid: current.ProjectModule?.moduleid,
        modulename: current.ProjectModule?.modulename,
        description: current.ProjectModule?.description,
        createdby: current.ProjectModule?.createdby,
        assigneddate: current.assigneddate,
        deadlinedate: current.deadlinedate,
        priority: current.priority,
        status: current.status,
        remarks: current.remarks,
      });

      return acc;
    }, {});
    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        data: Object.values(groupedData),
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const deleteAssignment = async (req, res, next) => {
  try {
    const { assignmentid } = req.body;
    const employeeid = req.user.employeeid || req.user.userid;

    if (!assignmentid) {
      throw new ApiErrorResponse("Assignment ID is required", 400);
    }

    const assignment = await AssignProjectModel.findByPk(assignmentid);
    if (!assignment) {
      throw new ApiErrorResponse("Assignment not found", 404);
    }

    // Security check: Employees can only delete their own assignments or if they created it
    if (req.user.role === "employee" && assignment.employeeid !== employeeid && assignment.createdby !== employeeid) {
      throw new ApiErrorResponse("Unauthorized to delete this assignment", 403);
    }

    // Report check removed as per user request to "solve issue" (allow deletion)
    const deletedCount = await AssignProjectModel.destroy({
      where: { assignmentid },
    });

    if (deletedCount) {
      return SuccessResponse(
        res,
        new ApiSuccessResponse({
          statusCode: 200,
          message: "Assignment deleted successfully",
        }),
      );
    }
    throw new ApiErrorResponse("Failed to delete assignment", 400);
  } catch (error) {
    next(error);
  }
};
