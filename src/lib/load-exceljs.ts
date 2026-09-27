import type ExcelJS from 'exceljs';

let excelJsPromise: Promise<typeof ExcelJS> | undefined;

export function loadExcelJS() {
  excelJsPromise ??= import('exceljs').then((mod) => mod.default ?? mod);
  return excelJsPromise;
}

export function preloadExcelJS() {
  void loadExcelJS();
}
