import { ClientModel } from "../admin/models/client_model.js";
import { EmployeeModel } from "../admin/models/employee_model.js";
import {
  AssignProjectModel,
  ProjectModel,
  ProjectModule,
} from "../admin/models/project_model.js";
import { ReportModel } from "../admin/models/report_model.js";

AssignProjectModel.belongsTo(EmployeeModel, {
  foreignKey: "employeeid",
});

AssignProjectModel.belongsTo(ProjectModel, {
  foreignKey: "projectid",
});

AssignProjectModel.belongsTo(ProjectModule, {
  foreignKey: "moduleid",
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

ReportModel.belongsTo(EmployeeModel, {
  foreignKey: "employeeid",
});

ProjectModel.belongsTo(ClientModel, {
  foreignKey: "clientid",
});
