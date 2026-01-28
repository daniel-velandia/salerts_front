import { useState, useEffect } from "react";
import { useApi } from "@/hooks/common/useApi";
import { getAllStaff } from "@/infraestructure/services/staffApi";
import { getAllPrograms } from "@/infraestructure/services/programApi";
import { setError, setLoading } from "@/infraestructure/store/uiSlice";
import { useAppDispatch } from "@/infraestructure/store/hooks";
import type { Program } from "@/domain/models/program/Program";
import type { StaffFilterParams } from "@/domain/models/staff/StaffFilterParams";
import type { StaffResponse } from "@/domain/models/staff/StaffResponse";
import type { Option } from "@/domain/models/Option";

interface Result {
  staffList: StaffResponse[];
  programOptions: Option[];
  roleOptions: Option[];
  applyFilters: (newFilters: StaffFilterParams) => void;
}

export const useStaffManagement = (): Result => {
  const dispatch = useAppDispatch();
  const [filters, setFilters] = useState<StaffFilterParams>({});

  const {
    data: staffList,
    loading: staffLoading,
    error: staffError,
  } = useApi<StaffResponse[], StaffFilterParams>(getAllStaff, {
    autoFetch: true,
    params: filters,
  });

  const {
    data: programs,
    loading: programsLoading,
    error: programsError,
  } = useApi<Program[], void>(getAllPrograms, {
    autoFetch: true,
    params: undefined,
  });

  useEffect(() => {
    dispatch(setLoading(staffLoading || programsLoading));
    const error = staffError || programsError;
    if (error && error.status !== 499)
      dispatch(setError(error));
  }, [staffLoading, programsLoading, staffError, programsError, dispatch]);

  const applyFilters = (newFilters: StaffFilterParams) => {
    const paramsToSend: StaffFilterParams = {
      ...newFilters,
      programId: newFilters.programId === "ALL" ? undefined : newFilters.programId,
      role: newFilters.role === "ALL" ? undefined : newFilters.role,
      search: newFilters.search || undefined,
    };
    setFilters(paramsToSend);
  };

  const programOptions: Option[] = [
    { id: "ALL", label: "Todos los programas" },
    ...(programs || []).map((p) => ({ id: p.id, label: p.name })),
  ];

  const roleOptions: Option[] = [
    { id: "ALL", label: "Todos los roles" },
    { id: "TEACHER", label: "Profesor" },
    { id: "COORDINATOR", label: "Coordinador" },
  ];

  return {
    staffList: staffList || [],
    programOptions,
    roleOptions,
    applyFilters,
  };
};
