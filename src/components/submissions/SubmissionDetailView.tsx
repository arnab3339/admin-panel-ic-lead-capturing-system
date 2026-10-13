'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FC, MouseEvent } from 'react';

import { LoadingBlock, MessageBlock } from '@/components/ui/PageState';
import Pill from '@/components/ui/Pill';
import { SUBMISSION_STATUS_META } from '@/constants/adminStatus';
import { useSubmissionDetail } from '@/hooks/submissions/useSubmissionDetail';
import { toWhatsAppLink } from '@/utils/helpers/contactLinks';
import { getInitials } from '@/utils/helpers/notifications';
import { recallSubmissionQuery } from '@/utils/helpers/submissionFilters';

import AnswersPanel from './AnswersPanel';
import { AttributionCard, BookingCard, CandidateCard } from './DetailInfoCards';
import LeadScoreCard from './LeadScoreCard';
import SubmissionTimeline from './SubmissionTimeline';

type SubmissionDetailViewProps = {
  submissionId: string;
};

const BackLink: FC = () => {
  const router = useRouter();

  // Go back to the list with the filters the user had, not the default view.
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey) return;

    event.preventDefault();
    router.push(`/submissions${recallSubmissionQuery()}`);
  };

  return (
    <Link href="/submissions" onClick={handleClick} className="inline-flex min-h-11 w-fit items-center gap-1.5 font-black text-(--builder-muted) hover:text-(--builder-blue-dark)">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M15 18l-6-6 6-6" />
      </svg>
      All submissions
    </Link>
  );
};

const SubmissionDetailView: FC<SubmissionDetailViewProps> = ({ submissionId }) => {
  const { data: detail, isPending, isError, error, refetch } = useSubmissionDetail(submissionId);

  if (isPending) {
    return (
      <>
        <BackLink />
        <LoadingBlock label="Loading submission..." />
      </>
    );
  }

  if (isError || !detail) {
    const isNotFound = error?.response?.status === 404;

    return (
      <>
        <BackLink />
        <MessageBlock
          title={isNotFound ? 'Submission not found' : 'Could not load this submission'}
          description={
            isNotFound
              ? 'It may have been deleted, or the link is wrong.'
              : 'Something went wrong, or the candidate service is not reachable. Please try again.'
          }
          action={
            <button
              type="button"
              onClick={() => refetch()}
              className="min-h-11 cursor-pointer rounded-2xl bg-(--builder-blue) px-4.5 text-sm font-bold text-white"
            >
              Try again
            </button>
          }
        />
      </>
    );
  }

  const status = SUBMISSION_STATUS_META[detail.status];

  return (
    <>
      <BackLink />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="grid size-14 place-items-center rounded-full bg-[#eff6ff] text-xl font-black text-(--builder-blue-dark)">
            {getInitials(detail.candidate.fullName)}
          </div>
          <div>
            <h1 className="text-[30px] font-black tracking-[-0.8px] text-[#020617]">{detail.candidate.fullName}</h1>
            <div className="font-semibold text-(--builder-muted)">
              {detail.formName} · <span className="font-mono text-[13px] text-(--builder-muted-light)">{detail.formSlug}</span>
            </div>
          </div>
          <Pill size="md" className={status.className}>
            {status.label}
          </Pill>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <a
            href={`mailto:${detail.candidate.email}`}
            className="inline-flex min-h-11 items-center rounded-2xl border border-slate-300 bg-white px-4.5 text-sm font-bold text-(--builder-text) transition hover:border-slate-400"
          >
            Email
          </a>
          <a
            href={toWhatsAppLink(detail.candidate.phone)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center rounded-2xl bg-(--builder-blue) px-4.5 text-sm font-bold text-white transition hover:bg-(--builder-blue-dark)"
          >
            Message on WhatsApp
          </a>
        </div>
      </div>

      <SubmissionTimeline events={detail.timeline} />
      
      <div className="flex flex-wrap items-start gap-5">
        <aside className="flex min-w-0 max-w-full flex-[1_1_340px] flex-col gap-5">
          <LeadScoreCard
            score={detail.leadScore}
            temperature={detail.leadTemperature}
            scoredQuestionCount={detail.scoredQuestionCount}
          />
          <CandidateCard detail={detail} />
          <BookingCard detail={detail} />
          <AttributionCard detail={detail} />
        </aside>

        <AnswersPanel steps={detail.steps} leadScore={detail.leadScore} />
      </div>
    </>
  );
};

export default SubmissionDetailView;
