import { useCallback, useEffect, useState } from "react";
import { useApi } from "@/hooks/common/useApi";
import { getAllStudents, getStudentFilterOptions } from "@/infraestructure/services/studentApi";
import { useAppDispatch } from "@/infraestructure/store/hooks";
import { setError, setLoading } from "@/infraestructure/store/uiSlice";
import type { FullStudentData } from "@/domain/models/students/FullStudentData";
import type { StudentFilterParams } from "@/domain/models/students/StudentFilterParams";
import type { StudentFilterOptions } from "@/domain/models/students/StudentFilterOptions";
import type { Option } from "@/domain/models/Option";
import type { StudentFilterFormValues } from "@/domain/schemas/studentFilterSchema";

export interface Result {
  students: FullStudentData[];
  selectedStudent: FullStudentData | null;
  programs: Option[];
  subjects: Option[];
  teachers: Option[];
  filterStudents: (params: StudentFilterFormValues) => void;
  selectStudent: (student: FullStudentData) => void;
}

export const useStudents = (): Result => {
  const dispatch = useAppDispatch();

  const [filterParams, setQueryParams] = useState<StudentFilterParams>({});
  const [selectedStudent, setSelectedStudent] =
    useState<FullStudentData | null>(null);

  const {
    loading: loadingStudents,
    data: students,
    error: errorStudents,
  } = useApi<FullStudentData[], StudentFilterParams>(getAllStudents, {
    autoFetch: true,
    params: filterParams,
  });

  const {
    loading: loadingOptions,
    data: options,
    error: errorOptions,
  } = useApi<StudentFilterOptions, void>(getStudentFilterOptions, {
    autoFetch: true,
    params: undefined,
  });

  useEffect(() => {
    dispatch(setLoading(loadingStudents || loadingOptions));
    const error = errorStudents || errorOptions;
    if (error && error.status !== 499) dispatch(setError(error));
  }, [loadingStudents, loadingOptions, errorStudents, errorOptions, dispatch]);

  const filterStudents = useCallback((filters: StudentFilterFormValues) => {
    const newFilters: StudentFilterParams = {
      search: filters.search || undefined,
      programId: filters.programId === "ALL" ? undefined : filters.programId || undefined,
      scheduleId: filters.scheduleId === "ALL" ? undefined : filters.scheduleId || undefined,
      teacherId: filters.teacherId === "ALL" ? undefined : filters.teacherId || undefined,
    }
    setQueryParams((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const selectStudent = useCallback((student: FullStudentData) => {
    setSelectedStudent(student);
  }, []);

  const programs: Option[] = options?.programs.map((p) => ({ id: p.id, label: p.name })) ?? [];

  const subjects: Option[] =
    options?.subjects
      .filter(
        (s) =>
          !filterParams.programId ||
          s.programIds.includes(filterParams.programId),
      )
      .flatMap((s) => s.groups)
      .map((g) => ({ id: g.id, label: g.label })) ?? [];

  const teachers: Option[] =
    options?.teachers
      .filter(
        (t) =>
          !filterParams.programId ||
          t.programIds.includes(filterParams.programId),
      )
      .map((t) => ({ id: t.id, label: t.name })) ?? [];

  return {
    students: students ?? [],
    selectedStudent,
    programs,
    subjects,
    teachers,
    filterStudents,
    selectStudent,
  };
};
