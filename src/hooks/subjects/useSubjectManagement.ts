import { useState, useEffect } from "react";
import { useApi } from "@/hooks/common/useApi";
import { useAppDispatch } from "@/infraestructure/store/hooks";
import { setError, setLoading } from "@/infraestructure/store/uiSlice";
import { getAllSubjects } from "@/infraestructure/services/subjectApi";
import { getAllPrograms } from "@/infraestructure/services/programApi";
import type { Program } from "@/domain/models/program/Program";
import type { Subject } from "@/domain/models/subject/Subject";
import { emptySubjectFilterFormValues, type SubjectFilterFormValues } from "@/domain/schemas/subjectFilterSchema";
import type { Option } from "@/domain/models/Option";
import type { SubjectFilterParams } from "@/domain/models/subject/SubjectFilterParams";

interface Result {
  subjects: Subject[];
  programOptions: Option[];
  filters: SubjectFilterFormValues;
  applyFilters: (newFilters: SubjectFilterFormValues) => void;
}

export const useSubjectManagement = (): Result => {
  const dispatch = useAppDispatch();
  const [filters, setFilters] = useState<SubjectFilterFormValues>(emptySubjectFilterFormValues);

  const {
    data: subjects,
    loading: loadingSubjects,
    error: errorSubjects,
    call: fetchSubjects,
  } = useApi<Subject[], SubjectFilterParams>(getAllSubjects);

  const { 
    data: programs, 
    loading: loadingPrograms,
    error: errorPrograms,
  } = useApi<Program[], void>(getAllPrograms, {
    autoFetch: true,
    params: undefined,
  });

  useEffect(() => {
    const isLoading = loadingSubjects || loadingPrograms;
    const error = errorSubjects || errorPrograms;

    dispatch(setLoading(isLoading));
    if (error && error.status !== 499)
      dispatch(setError(error));
  }, [
    loadingSubjects,
    loadingPrograms,
    errorSubjects,
    errorPrograms,
    dispatch
  ]);

  useEffect(() => {
    const paramsToSend: SubjectFilterParams = {
      programId: filters.programId === "ALL" ? undefined : filters.programId,
      search: filters.search === "" ? undefined : filters.search
    };
    fetchSubjects(paramsToSend);
  }, [filters, fetchSubjects]);

  const applyFilters = (newFilters: SubjectFilterParams) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const programOptions: Option[] = [
    { id: "ALL", label: "Todos los programas" },
    ...(programs || []).map((p) => ({ id: p.id, label: p.name })),
  ];

  return {
    subjects: subjects || [],
    programOptions,
    filters,
    applyFilters,
  };
};
