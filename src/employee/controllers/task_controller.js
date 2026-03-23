import { TaskModel } from "../../admin/models/task_model.js";
import {
  ApiErrorResponse,
  ApiSuccessResponse,
  SuccessResponse,
} from "../../utils/response.js";

export const updateTaskStatus = async (req, res, next) => {
  try {
    const { taskid, status } = req.body;
    if (!taskid) {
      throw new ApiErrorResponse("Task Id required", 400);
    }
    if (!status) {
      throw new ApiErrorResponse("Status required", 400);
    }
    const task = await TaskModel.findOne({
      where: {
        taskid,
        employeeid: req.user.employeeid,
      },
    });

    if (!task) {
      throw new ApiErrorResponse("Task not found or unauthorized", 404);
    }

    await task.update({
      status,
    });

    return SuccessResponse(
      res,
      new ApiSuccessResponse({
        statusCode: 200,
        message: "Task status updated successfully",
        data: task,
      }),
    );
  } catch (error) {
    next(error);
  }
};

export const getEmployeeTask = async (req, res, next) => {
  try {
    const employeeid = req.user.employeeid;
    if (!employeeid) {
      throw new ApiErrorResponse("User not found", 404);
    }

    const tasks = await TaskModel.findAll({
      where: {
        employeeid,
      },
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

export const getEmployeePendingTasks = async (req, res, next) => {
  try {
    const employeeid = req.user.employeeid;
    if (!employeeid) {
      throw new ApiErrorResponse("User not found", 404);
    }

    const tasks = await TaskModel.findAll({
      where: {
        employeeid,
        status: "Pending",
      },
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
