import type { FormDefinition } from "@mrdn/app-common";

const definitionReport: FormDefinition = {
  version: "1.0",
  formId: "report-view",
  layout: {
    type: "tabs",
    tabs: [
      {
        id: "main",
        label: "Основное",
        fields: ["summary"],
      },
    ],
  },
  zodSchema: "",
  fields: [
    {
      id: "id",
      name: "id",
      component: "input",
      label: "ID",
    },
    {
      id: "documentNumber",
      name: "documentNumber",
      component: "input",
      label: "Номер документа",
    },
    {
      id: "documentType",
      name: "documentType",
      component: "input",
      label: "Тип документа",
    },
    {
      id: "createdAt",
      name: "createdAt",
      component: "input",
      label: "Дата создания",
    },
    {
      id: "modifiedAt",
      name: "modifiedAt",
      component: "input",
      label: "Дата изменения",
    },
    {
      id: "processedAt",
      name: "processedAt",
      component: "input",
      label: "Дата обработки",
    },
    {
      id: "errorMessage",
      name: "errorMessage",
      component: "input",
      label: "Сообщение об ошибке",
    },
    {
      id: "isCompleted",
      name: "isCompleted",
      component: "input",
      label: "Завершён",
    },
    {
      id: "isSuccess",
      name: "isSuccess",
      component: "input",
      label: "Успешно",
    },
    {
      id: "targetSystem",
      name: "targetSystem",
      component: "input",
      label: "Целевая система",
    },

    /* SUMMARY */
    {
      id: "summary",
      name: "summary",
      component: "summary",
      template: [
        { label: "ID", field: "id" },
        { label: "Номер документа", field: "documentNumber" },
        { label: "Тип документа", field: "documentType" },
        { label: "Дата создания", field: "createdAt" },
        { label: "Дата изменения", field: "modifiedAt" },
        { label: "Дата обработки", field: "processedAt" },
        { label: "Ошибка", field: "errorMessage" },
        { label: "Завершён", field: "isCompleted" },
        { label: "Успешно", field: "isSuccess" },
        { label: "Целевая система", field: "targetSystem" },
      ],
    },
  ],
} as const;

export default definitionReport;
