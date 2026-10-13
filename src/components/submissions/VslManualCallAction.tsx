
'use client';

import { FC } from 'react';

import { useVslManualCall } from '@/hooks/submissions/useVslManualCall';
import { formatDayTime } from '@/utils/helpers/dateFormat';
import { VslManualCallStatus } from '@/types/submission';

type VslManualCallActionProps = {
    submissionId: string;
};

const VslManualCallAction: FC<VslManualCallActionProps> = ({
    submissionId,
}) => {
    const {
        callState,
        isLoadingCallState,
        isCallStateError,
        callStateError,
        refetchCallState,
        markCallDone,
        isMarkingCallDone,
    } = useVslManualCall(submissionId);

    // Keep loading state from creating a separate card.
    if (isLoadingCallState) return null;

    if (isCallStateError || !callState) {
        return (
            <div role="alert" className="mt-3 text-sm">
                <p className="font-semibold text-amber-800">
                    Could not load the manual call status.
                </p>

                <p className="mt-1 text-amber-700">
                    {callStateError?.response?.data?.message ??
                        'Please check the server connection and try again.'}
                </p>

                <button
                    type="button"
                    onClick={() => void refetchCallState()}
                    className="mt-2 min-h-9 cursor-pointer rounded-xl border border-(--builder-border) px-3 text-sm font-semibold"
                >
                    Retry
                </button>
            </div>
        );
    }

    // Do not show the action for candidates without an eligible VSL run,
    // or when the sequence has already ended.
    if (
        callState.status === VslManualCallStatus.NOT_ENROLLED ||
        callState.status === VslManualCallStatus.INELIGIBLE ||
        callState.status === VslManualCallStatus.STOPPED ||
        callState.status === VslManualCallStatus.COMPLETED
    ) {
        return null;
    }

    return (
        <div className="mt-4">
            {callState.status === VslManualCallStatus.UPCOMING &&
                callState.callWindowStartsAt && (
                    <p className="mb-2 text-sm text-(--builder-muted)">
                        Available from{' '}
                        {formatDayTime(callState.callWindowStartsAt)}.
                    </p>
                )}

            {callState.status === VslManualCallStatus.EXPIRED && (
                <p className="text-sm text-(--builder-muted)">
                    The call window has expired. The existing Day 7 email
                    remains scheduled.
                </p>
            )}

            {callState.status === VslManualCallStatus.CALL_DONE && (
                <p className="text-sm font-semibold text-emerald-700">
                    Call marked as done. Remaining follow-up emails have
                    been stopped.
                </p>
            )}

            {(callState.status === VslManualCallStatus.UPCOMING ||
                callState.status === VslManualCallStatus.OPEN) && (
                <button
                    type="button"
                    onClick={() => markCallDone()}
                    disabled={!callState.canMarkCallDone || isMarkingCallDone}
                    className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-2xl bg-(--builder-blue) px-5 text-sm font-bold text-white transition hover:bg-(--builder-blue-dark) disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isMarkingCallDone
                        ? 'Marking call done...'
                        : 'Mark Call Done'}
                </button>
            )}
        </div>
    );
};

export default VslManualCallAction;
