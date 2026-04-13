import { ClientModel } from "../admin/models/client_model.js";
import { EmployeeModel } from "../admin/models/employee_model.js";
import {
  AssignProjectModel,
  ProjectModel,
  ProjectModule,
} from "../admin/models/project_model.js";
import {
  ReportModel,
  AdditionalHoursReportModel,
} from "../admin/models/report_model.js";

import { LeaveModel } from "../admin/models/leave_model.js";
import { TaskModel } from "../admin/models/task_model.js";
import { AttendanceModel } from "../admin/models/attendance_model.js";
import { MeetingModel } from "../admin/models/meeting_model.js";
import { ProjectTaskModel } from "../admin/models/project_task_model.js";

AssignProjectModel.belongsTo(EmployeeModel, {
  foreignKey: "employeeid",
});

LeaveModel.belongsTo(EmployeeModel, {
  foreignKey: "employeeid",
});

AssignProjectModel.belongsTo(ProjectModel, {
  foreignKey: "projectid",
});

AssignProjectModel.belongsTo(ProjectModule, {
  foreignKey: "moduleid",
});

AssignProjectModel.belongsTo(ProjectTaskModel, {
  foreignKey: "projecttaskid",
});

ProjectModule.belongsTo(ProjectModel, {
  foreignKey: "projectid",
});

ReportModel.belongsTo(ProjectModel, {
  foreignKey: "projectid",
});

ReportModel.belongsTo(ProjectModule, {
  foreignKey: "moduleid",
});

ReportModel.belongsTo(ProjectTaskModel, {
  foreignKey: "projecttaskid",
});

ReportModel.belongsTo(EmployeeModel, {
  foreignKey: "employeeid",
});

ProjectModel.belongsTo(ClientModel, {
  foreignKey: "clientid",
});

TaskModel.belongsTo(EmployeeModel, {
  foreignKey: "employeeid",
});

AttendanceModel.belongsTo(EmployeeModel, {
  foreignKey: "employeeid",
});

AdditionalHoursReportModel.belongsTo(EmployeeModel, {
  foreignKey: "employeeid",
});

AdditionalHoursReportModel.belongsTo(ProjectModel, {
  foreignKey: "projectid",
});

MeetingModel.belongsTo(EmployeeModel, {
  foreignKey: "employeeid",
});

ProjectTaskModel.belongsTo(ProjectModel, {
  foreignKey: "projectid",
});

ProjectTaskModel.belongsTo(ProjectModule, {
  foreignKey: "moduleid",
});
