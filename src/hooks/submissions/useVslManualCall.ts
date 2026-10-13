import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

import {
    getVslManualCallStateApi,
    markVslCallDoneApi,
} from '@/services/submissionsApi';
import { ApiErrorResponse } from '@/types/response';
import { VslManualCallState } from '@/types/submission';

function getErrorMessage(
    error: AxiosError<ApiErrorResponse>,
): string {
    return (
        error.response?.data?.message ??
        'Could not update the manual call status. Please try again.'
    );
}

export function useVslManualCall(submissionId: string) {
    const queryClient = useQueryClient();

    const callStateQuery = useQuery<
        VslManualCallState,
        AxiosError<ApiErrorResponse>
    >({
        queryKey: ['vsl-manual-call', submissionId],
        queryFn: () => getVslManualCallStateApi(submissionId),
        enabled: Boolean(submissionId),

        // Refresh while waiting for Day 4 or while the call window is open.
        refetchInterval: (query) => {
            const status = query.state.data?.status;

            return status === 'upcoming' || status === 'open'
                ? 30_000
                : false;
        },

        // Avoid polling when the admin has moved to another browser tab.
        refetchIntervalInBackground: false,

        // Recheck the latest server state when the admin returns to this tab.
        refetchOnWindowFocus: true,

        retry: (failureCount, error) =>
            error.response?.status !== 404 && failureCount < 1,
    });

    const markCallDoneMutation = useMutation<
        VslManualCallState,
        AxiosError<ApiErrorResponse>,
        void
    >({
        mutationFn: () => markVslCallDoneApi(submissionId),

        onSuccess: async (state) => {
            queryClient.setQueryData(
                ['vsl-manual-call', submissionId],
                state,
            );

            toast.success('Call marked as done. VSL sequence stopped.');

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['vsl-manual-call', submissionId],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['submission', submissionId],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['submissions'],
                }),
            ]);
        },

        onError: async (error) => {
            toast.error(getErrorMessage(error));

            // Refresh the state because the backend may have rejected
            // this action after the call window or run state changed.
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['vsl-manual-call', submissionId],
                }),
                queryClient.invalidateQueries({
                    queryKey: ['submission', submissionId],
                }),
            ]);
        },
    });

    return {
        callState: callStateQuery.data,
        isLoadingCallState: callStateQuery.isPending,
        isCallStateError: callStateQuery.isError,
        callStateError: callStateQuery.error,
        refetchCallState: callStateQuery.refetch,

        markCallDone: markCallDoneMutation.mutate,
        isMarkingCallDone: markCallDoneMutation.isPending,
    };
}