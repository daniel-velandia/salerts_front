import { useState, useEffect, useMemo } from 'react';
import { useApi } from '@/hooks/common/useApi';
import { useAppDispatch } from '@/infraestructure/store/hooks';
import { setLoading, setError } from '@/infraestructure/store/uiSlice';
import type { Group } from '@/domain/models/Group';
import { getAllGroups, type GetGroupsParams } from '@/infraestructure/services/groupApi';
import type { GroupFilterParams } from '@/domain/models/groups/GroupFilterParams';

export function useGroupManagement() {
  const dispatch = useAppDispatch();
  const [filters, setFilters] = useState<GroupFilterParams>({
    search: '',
    periodId: '',
    subjectId: '',
    teacherId: ''
  });

  // Fetch groups with filters
  const {
    data: groups,
    loading: loadingGroups,
    error: errorGroups,
    call: fetchGroups
  } = useApi<Group[], GetGroupsParams>(getAllGroups);

  // Fetch groups whenever filters change (excluding search which is client-side for now, or server-side? existing code mixed them)
  // Existing code: search was client side. period/subject/teacher were server params.
  // I should keep search client side if strictly following previous behavior, OR move it to server if API supports it.
  // The user prompt said "modifica el filtro... para usar AppForm".
  // StaffPage sends search to server. GroupsPage `getAllGroups` might not support search?
  // Let's check `GetGroupsParams` imported from `groupApi`.
  // ListDir showed `groupApi.ts`? No, I need to check `groupApi.ts`.
  // Assuming `GetGroupsParams` supports what `getAllGroups` accepts.
  // Existing code:
  // const params: GetGroupsParams = {};
  // if (filterPeriod) params.periodId = filterPeriod;
  // ...
  // fetchGroups(params);
  // Search was used in `filteredGroups` memo.
  // I will keep search client-side for now to avoid breaking if API doesn't support it, unless I check.
  // Wait, `StaffPage` uses server search.
  // I will assume for `GroupPage` search is still client side as per previous implementation, but I will put it in `filters` object.
  
  useEffect(() => {
    const params: GetGroupsParams = {};
    if (filters.periodId && filters.periodId !== 'ALL') params.periodId = filters.periodId;
    if (filters.subjectId && filters.subjectId !== 'ALL') params.subjectId = filters.subjectId;
    if (filters.teacherId && filters.teacherId !== 'ALL') params.teacherId = filters.teacherId;
    
    fetchGroups(params);
  }, [filters.periodId, filters.subjectId, filters.teacherId, fetchGroups]);

  // Sync Global State
  useEffect(() => {
    dispatch(setLoading(loadingGroups));
    
    if (errorGroups && errorGroups.status !== 499) {
      dispatch(setError(errorGroups, true));
    }
  }, [loadingGroups, errorGroups, dispatch]);

  const applyFilters = (newFilters: GroupFilterParams) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  // Client-side search filtering
  const filteredGroups = useMemo(() => {
    const search = filters.search || '';
    return (groups || []).filter(group => {
      if (!search) return true;
      const matchesSearch = 
        group.groupName.toLowerCase().includes(search.toLowerCase()) ||
        group.subjectName.toLowerCase().includes(search.toLowerCase()) ||
        group.teacherName.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [groups, filters.search]);

  // Statistics
  const statistics = useMemo(() => {
    const allGroups = groups || [];
    return {
      totalGroups: allGroups.length,
      uniqueSubjects: new Set(allGroups.map(g => g.subjectName)).size,
      uniqueTeachers: new Set(allGroups.map(g => g.teacherName)).size,
      totalSchedules: allGroups.reduce((acc, g) => acc + g.schedules.length, 0)
    };
  }, [groups]);

  return {
    groups: groups || [],
    filteredGroups,
    loading: loadingGroups,
    filters,
    applyFilters,
    statistics,
    refresh: () => {
      const params: GetGroupsParams = {};
      if (filters.periodId && filters.periodId !== 'ALL') params.periodId = filters.periodId;
      if (filters.subjectId && filters.subjectId !== 'ALL') params.subjectId = filters.subjectId;
      if (filters.teacherId && filters.teacherId !== 'ALL') params.teacherId = filters.teacherId;
      fetchGroups(params);
    }
  };
}
