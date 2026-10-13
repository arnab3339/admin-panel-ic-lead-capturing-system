import { apiClient } from '@/lib/apiClient';
import { ApiSuccessResponse } from '@/types/response';
import { SubmissionDetail, SubmissionFilters, SubmissionsListResponse, VslManualCallState } from '@/types/submission';

// The backend treats a missing filter as "all"/empty, so only the filters the user actually set are sent.
// It also ignores a search shorter than 2 characters, so those are not sent either.
function buildListParams(filters: SubmissionFilters): Record<string, string | number> {
    const params: Record<string, string | number> = {
        page: filters.page,
        pageSize: filters.pageSize,
        range: filters.range,
    };

    if (filters.status !== 'all') params.status = filters.status;
    if (filters.temperature !== 'all') params.temperature = filters.temperature;
    if (filters.formSlug !== 'all') params.formSlug = filters.formSlug;
    if (filters.source !== 'all') params.source = filters.source;

    const search = filters.search.trim();
    if (search.length >= 2) params.search = search;

    return params;
}

// GET /admin/submissions (S1): list rows, summary cards, tab counts and the source dropdown in one response.
export async function getSubmissionsApi(filters: SubmissionFilters): Promise<SubmissionsListResponse> {
    const response = await apiClient.get<ApiSuccessResponse<SubmissionsListResponse>>('/admin/submissions', {
        params: buildListParams(filters),
    });

    return response.data.data;
}

// GET /admin/submissions/:publicId (S2): everything for the detail page. Answers already carry option labels, not stored values.
export async function getSubmissionDetailApi(submissionId: string): Promise<SubmissionDetail> {
    const response = await apiClient.get<ApiSuccessResponse<SubmissionDetail>>(
        `/admin/submissions/${encodeURIComponent(submissionId)}`,
    );

    return response.data.data;
}

// GET /admin/submissions/:publicId/vsl/manual-call
// Fetches the current VSL manual-call window state.
export async function getVslManualCallStateApi(
    submissionId: string,
): Promise<VslManualCallState> {
    const response = await apiClient.get<ApiSuccessResponse<VslManualCallState>>(
        `/admin/submissions/${encodeURIComponent(submissionId)}/vsl/manual-call`,
    );

    return response.data.data;
}

// POST /admin/submissions/:publicId/vsl/mark-call-done
// Marks the manual call as done and stops the VSL sequence.
export async function markVslCallDoneApi(
    submissionId: string,
): Promise<VslManualCallState> {
    const response = await apiClient.post<ApiSuccessResponse<VslManualCallState>>(
        `/admin/submissions/${encodeURIComponent(submissionId)}/vsl/mark-call-done`,
    );

    return response.data.data;
}