import { TaskModel } from "../models/task_model.js";
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  SuccessResponse,
} from "../../utils/response.js";
import "../../middleware/associations.js";
import { EmployeeModel } from "../models/employee_model.js";

export const assignTask = async (req, res, next) => {
  try {
    const userid = req.user?.userid;

    const { taskname, description, employeeid, deadlinedate, priority } =
      req.body;

    if (!userid) {
      throw new ApiErrorResponse("User not found", 404);
    }

    if (
      !taskname ||
      !description ||
      !employeeid ||
      !deadlinedate ||
      !priority
    ) {
      throw new ApiErrorResponse("All fields are required", 400);
    }

    const task = await TaskModel.create({
      taskname,
      description,
      employeeid,
      deadlinedate,
      priority,
      createdby: userid,
    });

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 201,
        message: "Task assigned successfully",
        data: task,
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const getAllTasks = async (req, res, next) => {
  try {
    const userid = req.user?.userid;

    if (!userid) {
      throw new ApiErrorResponse("User not found", 404);
    }

    const tasks = await TaskModel.findAll({
      include: [
        {
          model: EmployeeModel,
          attributes: ["employeename"],
        },
      ],
    });

    const updatedTaskList = tasks.map((task) => {
      return {
        taskid: task.taskid,
        taskname: task.taskname,
        description: task.description,
        employeeid: task.employeeid,
        deadlinedate: task.deadlinedate,
        priority: task.priority,
        status: task.status,
        createdby: task.createdby,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        employeename: task.EmployeeModel.employeename || "",
      };
    });

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        data: updatedTaskList || [],
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const userid = req.user?.userid;

    const { taskid } = req.body;

    if (!taskid) {
      throw new ApiErrorResponse("Task Id required", 400);
    }

    const task = await TaskModel.findOne({
      where: {
        taskid,
        createdby: userid,
      },
    });

    if (!task) {
      throw new ApiErrorResponse("Task not found or unauthorized", 404);
    }

    await task.destroy();

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        message: "Task deleted successfully",
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const userid = req.user?.userid;

    const {
      taskid,
      taskname,
      description,
      employeeid,
      deadlinedate,
      priority,
    } = req.body;

    if (!userid) {
      throw new ApiErrorResponse("User not found", 404);
    }

    if (!taskid) {
      throw new ApiErrorResponse("Task Id required", 400);
    }

    const task = await TaskModel.findOne({
      where: {
        taskid,
        createdby: userid,
      },
    });

    if (!task) {
      throw new ApiErrorResponse("Task not found or unauthorized", 404);
    }

    await task.update({
      taskname,
      description,
      employeeid,
      deadlinedate,
      priority,
    });

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        message: "Task updated successfully",
      }),
    );
  } catch (error) {
    next(error);
  }
}; export const getPendingTaskCount = async (req, res, next) => {
  try {
    const pendingCount = await TaskModel.count({
      where: {
        status: "Pending",
      },
    });

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        data: pendingCount || 0,
      }),
    );
  } catch (error) {
    next(error);
  }
};
