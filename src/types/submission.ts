import type { BookingStatus, NotificationItem } from '@/types/booking';

export type SubmissionStatus =
    | 'submission_pending'
    | 'booking_pending'
    | 'booked'
    | 'converted'
    | 'cancelled';

export type LeadTemperature = 'hot' | 'warm' | 'cold';

export type DateRange = 'today' | '7d' | '30d' | 'all';

export type SubmissionFilters = {
    status: SubmissionStatus | 'all';
    temperature: LeadTemperature | 'all';
    formSlug: string;
    source: string;
    range: DateRange;
    search: string;
    page: number;
    pageSize: number;
};

export type SubmissionListItem = {
    publicId: string;
    candidate: {
        fullName: string;
        email: string;
        phone: string;
    };
    formSlug: string;
    formName: string;
    status: SubmissionStatus;
    leadScore: number | null;
    leadTemperature: LeadTemperature | null;
    source: string | null;
    utmCampaign: string | null;
    reminderCount: number;
    createdAt: string;
    submittedAt: string | null;
    booking: {
        slotStartAt: string;
        status: BookingStatus;
    } | null;
};

export type SubmissionsSummary = {
    total: number;
    hot: number;
    completedForms: number;
    bookedOrConverted: number;
    hotNotBooked: number;
    statusCounts: Record<SubmissionStatus | 'all', number>;
};

export type SubmissionsListResponse = {
    items: SubmissionListItem[];
    page: number;
    pageSize: number;
    totalItems: number;
    summary: SubmissionsSummary;
    availableSources: string[];
    // Set when part of the page could not be filled in, e.g. ['booking-service unavailable'].
    warnings?: string[];
};

export type SubmissionAnswer = {
    questionKey: string;
    questionText: string;
    answerText: string | null;
    // Score of the selected option; null when the question is not part of lead scoring.
    optionScore: number | null;
};

export type SubmissionStep = {
    stepNo: number;
    title: string;
    answers: SubmissionAnswer[];
};

export type TimelineEvent = {
    key: string;
    label: string;
    at: string | null;
    // Decided by the server, not the clock: the counselling call is done only after the admin marks it.
    done: boolean;
};

export type SubmissionDetail = SubmissionListItem & {
    candidateFirstSeenAt: string;
    attribution: {
        source: string | null;
        medium: string | null;
        campaign: string | null;
        content: string | null;
        term: string | null;
        landingPage: string | null;
        referrerUrl: string | null;
    };
    steps: SubmissionStep[];
    scoredQuestionCount: number;
    timeline: TimelineEvent[];
    bookingDetails: {
        bookingId: string;
        slotStartAt: string;
        status: BookingStatus;
        completedAt: string | null;
    } | null;
    notifications: NotificationItem[];
    // Set when part of the page could not be filled in, e.g. ['booking-service unavailable'].
    warnings?: string[];
};


export const VslManualCallStatus = {
    NOT_ENROLLED: 'not_enrolled',
    UPCOMING: 'upcoming',
    OPEN: 'open',
    EXPIRED: 'expired',
    CALL_DONE: 'call_done',
    COMPLETED: 'completed',
    STOPPED: 'stopped',
    INELIGIBLE: 'ineligible',
} as const;

export type VslManualCallStatus =
    (typeof VslManualCallStatus)[keyof typeof VslManualCallStatus];


export type VslManualCallState = {
  status: VslManualCallStatus;
  runStatus: 'active' | 'completed' | 'stopped' | null;
  callWindowStartsAt: string | null;
  callWindowEndsAt: string | null;
  callMarkedDoneAt: string | null;
  stopReason: string | null;
  canMarkCallDone: boolean;
};
