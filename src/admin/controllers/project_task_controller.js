import { ProjectTaskModel } from "../models/project_task_model.js";
import { ProjectModel, ProjectModule } from "../models/project_model.js";
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  SuccessResponse,
} from "../../utils/response.js";
import "../../middleware/associations.js";

// Add Project Task
export const addProjectTask = async (req, res, next) => {
  try {
    const userid = req.user?.userid;
    const { projectid, moduleid, taskname, description } = req.body;

    if (!userid) {
      throw new ApiErrorResponse("User not found", 404);
    }

    if (!projectid || !moduleid || !taskname) {
      throw new ApiErrorResponse(
        "Project, Module, and Task Name are required",
        400,
      );
    }

    const projectTask = await ProjectTaskModel.create({
      projectid,
      moduleid,
      taskname,
      description,
      createdby: userid,
    });

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 201,
        message: "Project task created successfully",
        data: projectTask,
      }),
    );
  } catch (error) {
    next(error);
  }
};

// Get All Project Tasks
export const getProjectTasks = async (req, res, next) => {
  try {
    const projectTasks = await ProjectTaskModel.findAll({
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
    });

    const formattedTasks = projectTasks.map((task) => ({
      projecttaskid: task.projecttaskid,
      projectid: task.projectid,
      moduleid: task.moduleid,
      taskname: task.taskname,
      description: task.description,
      projectname: task.ProjectModel?.projectname || "",
      modulename: task.ProjectModule?.modulename || "",
      createdAt: task.createdAt,
    }));

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        data: formattedTasks,
      }),
    );
  } catch (error) {
    next(error);
  }
};

// Edit Project Task
export const updateProjectTask = async (req, res, next) => {
  try {
    const userid = req.user?.userid;
    const { projecttaskid, projectid, moduleid, taskname, description } =
      req.body;

    if (!projecttaskid) {
      throw new ApiErrorResponse("Project Task ID is required", 400);
    }

    const task = await ProjectTaskModel.findByPk(projecttaskid);

    if (!task) {
      throw new ApiErrorResponse("Project task not found", 404);
    }

    await task.update({
      projectid,
      moduleid,
      taskname,
      description,
    });

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        message: "Project task updated successfully",
        data: task,
      }),
    );
  } catch (error) {
    next(error);
  }
};

// Delete Project Task
export const deleteProjectTask = async (req, res, next) => {
  try {
    const { projecttaskid } = req.body;

    if (!projecttaskid) {
      throw new ApiErrorResponse("Project Task ID is required", 400);
    }

    const task = await ProjectTaskModel.findByPk(projecttaskid);

    if (!task) {
      throw new ApiErrorResponse("Project task not found", 404);
    }

    await task.destroy();

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        message: "Project task deleted successfully",
      }),
    );
  } catch (error) {
    next(error);
  }
};

// Get Tasks by Module
export const getTasksByModule = async (req, res, next) => {
  try {
    const { moduleid } = req.body;

    if (!moduleid) {
      throw new ApiErrorResponse("Module ID is required", 400);
    }

    const tasks = await ProjectTaskModel.findAll({
      where: { moduleid },
    });

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        data: tasks || [],
      }),
    );
  } catch (error) {
    next(error);
  }
};
