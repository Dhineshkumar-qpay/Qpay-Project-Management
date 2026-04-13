import {
  AssignProjectModel,
  ProjectModel,
  ProjectModule,
} from "../../admin/models/project_model.js";
import {
  ReportModel,
  AdditionalHoursReportModel,
} from "../../admin/models/report_model.js";
import { ProjectTaskModel } from "../../admin/models/project_task_model.js";
import { sequelize } from "../../../connection.js";
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  SuccessResponse,
} from "../../utils/response.js";
import "../../middleware/associations.js";

export const addProject = async (req, res, next) => {
  try {
    const requiredFields = ["projectname", "description", "startdate"];

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
      return SuccessResponse(
        res,
        new ApiSuccessResponse({
          statusCode: 200,
          message: "Module created successfully",
        }),
      );
    }
    throw new ApiErrorResponse("Failed to created module", 400);
  } catch (error) {
    next(error);
  }
};

export const addTask = async (req, res, next) => {
  try {
    const { taskname, moduleid, projectid, description, deadlinedate } =
      req.body;
    if (!taskname) throw new ApiErrorResponse("Task name is required", 400);
    if (!moduleid) throw new ApiErrorResponse("moduleid is required", 400);
    if (!projectid) throw new ApiErrorResponse("projectid is required", 400);

    const task = await ProjectTaskModel.create({
      taskname,
      description,
      moduleid,
      projectid,
      createdby: req.user.employeeid || req.user.userid,
    });

    if (task) {
      const employeeid = req.body.employeeid || req.user.employeeid;

      await AssignProjectModel.create({
        employeeid,
        projectid,
        moduleid,
        projecttaskid: task.projecttaskid,
        assigneddate: new Date(),
        deadlinedate: deadlinedate || new Date(),
        priority: req.body.priority || "medium",
        createdby: req.user.employeeid || req.user.userid,
      });

      return SuccessResponse(
        res,
        new ApiSuccessResponse({
          statusCode: 200,
          message: "Task created and assigned successfully",
        }),
      );
    }
    throw new ApiErrorResponse("Failed to create task", 400);
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
      attributes: [
        "projectid",
        "projectname",
        "description",
        "startdate",
        "enddate",
      ],
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
          attributes: [
            "moduleid",
            "modulename",
            "description",
            "createdby",
            "projectid",
          ],
        },
        {
          model: ProjectTaskModel,
          attributes: ["projecttaskid", "taskname", "description"],
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
          modulesMap: {},
        };
      }

      const moduleid = current.ProjectModule?.moduleid;
      if (moduleid) {
        if (!acc[projectid].modulesMap[moduleid]) {
          acc[projectid].modulesMap[moduleid] = {
            moduleid: moduleid,
            modulename: current.ProjectModule?.modulename,
            description: current.ProjectModule?.description,
            tasks: [],
          };
        }

        const taskInfo = {
          assignmentid: current.assignmentid,
          projecttaskid: current.ProjectTaskModel?.projecttaskid,
          taskname: current.ProjectTaskModel?.taskname || "General Task",
          taskdescription: current.ProjectTaskModel?.description || "",
          assigneddate: current.assigneddate,
          deadlinedate: current.deadlinedate,
          priority: current.priority,
          status: current.status,
          remarks: current.remarks,
        };

        acc[projectid].modulesMap[moduleid].tasks.push(taskInfo);
      }

      return acc;
    }, {});

    // Final formatting to convert maps to arrays
    const finalData = Object.values(groupedData).map((project) => ({
      projectid: project.projectid,
      projectname: project.projectname,
      description: project.description,
      modules: Object.values(project.modulesMap),
    }));

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        data: finalData,
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
    if (
      req.user.role === "employee" &&
      assignment.employeeid !== employeeid &&
      assignment.createdby !== employeeid
    ) {
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
