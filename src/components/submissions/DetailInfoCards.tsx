import Link from 'next/link';
import { FC, ReactNode } from 'react';

import Card from '@/components/ui/Card';
import Pill from '@/components/ui/Pill';
import { BOOKING_STATUS_META } from '@/constants/adminStatus';
import { SubmissionDetail } from '@/types/submission';
import { formatDayTime, formatSlot, formatUntil } from '@/utils/helpers/dateFormat';
import { getNotificationLabel, getSendStatusMeta } from '@/utils/helpers/notifications';
import VslManualCallAction from './VslManualCallAction';

const CardTitle: FC<{ children: ReactNode }> = ({ children }) => (
  <h2 className="mb-3 text-[13px] font-black uppercase tracking-[0.4px] text-(--builder-muted)">{children}</h2>
);

const InfoList: FC<{ rows: { label: string; value: ReactNode }[] }> = ({ rows }) => (
  <dl className="grid grid-cols-[96px_1fr] gap-x-3 gap-y-2.5">
    {rows.map((row) => (
      <div key={row.label} className="contents">
        <dt className="font-bold text-(--builder-muted-light)">{row.label}</dt>
        <dd className="m-0 font-bold wrap-anywhere">{row.value}</dd>
      </div>
    ))}
  </dl>
);


export const CandidateCard: FC<{ detail: SubmissionDetail }> = ({ detail }) => (
  <Card className="p-5.5">
    <CardTitle>Candidate</CardTitle>

    <InfoList
      rows={[
        { label: 'Email', value: detail.candidate.email },
        { label: 'Phone', value: detail.candidate.phone },
        { label: 'First seen', value: formatDayTime(detail.candidateFirstSeenAt) },
      ]}
    />

    <VslManualCallAction submissionId={detail.publicId} />
  </Card>
);


export const BookingCard: FC<{ detail: SubmissionDetail }> = ({ detail }) => {
  const booking = detail.bookingDetails;
  const bookingMeta = booking ? BOOKING_STATUS_META[booking.status] : null;
  const isHotAndUnbooked = detail.leadTemperature === 'hot' && detail.status === 'booking_pending';

  return (
    <Card className="p-5.5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[13px] font-black uppercase tracking-[0.4px] text-(--builder-muted)">Counselling call</h2>
        {bookingMeta && <Pill className={bookingMeta.className}>{bookingMeta.label}</Pill>}
      </div>

      {booking ? (
        <>
          <div className="text-[22px] font-black tracking-[-0.5px]">{formatSlot(booking.slotStartAt)}</div>
          <div className="font-semibold text-(--builder-muted)">
            {booking.status === 'cancelled' ? 'Cancelled' : booking.status === 'completed' ? 'Call completed' : formatUntil(booking.slotStartAt)} · booking{' '}
            <span className="font-mono text-[13px]">#{booking.bookingId}</span>
          </div>
        </>
      ) : detail.warnings?.length ? (
        <div className="text-sm font-semibold text-(--builder-muted)">Booking details are temporarily unavailable. Try again in a moment.</div>
      ) : (
        <div className="text-sm font-semibold text-(--builder-muted)">
          {detail.status === 'submission_pending' ? 'The form was not submitted, so there is nothing to book yet.' : 'No slot booked yet.'}
          {detail.status === 'booking_pending' && ` ${detail.reminderCount} of 3 reminders sent.`}
        </div>
      )}

      {isHotAndUnbooked && (
        <div className="mt-3 rounded-2xl bg-orange-50 px-3.5 py-2.5 text-[13px] font-bold text-orange-800">
          Hot lead with no booking. Worth a personal call.
        </div>
      )}

      <div className="mt-4 border-t border-(--builder-border) pt-4">
        <div className="mb-2 font-black">Messages sent</div>
        {detail.notifications.length === 0 ? (
          <div className="text-[13px] font-medium text-(--builder-muted-light)">No messages sent yet.</div>
        ) : (
          <ul className="m-0 list-none p-0">
            {detail.notifications.map((item) => {
              const status = getSendStatusMeta(item.sendStatus);

              return (
                <li key={item.id} className="py-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-(--builder-muted)">{getNotificationLabel(item)}</span>
                    <Pill className={status.className}>{status.label}</Pill>
                  </div>
                  {item.failedReason && (
                    <div className="mt-0.5 text-xs font-semibold text-orange-800">{item.failedReason}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {booking && (
        <Link href="/bookings" className="mt-2 inline-flex min-h-11 items-center font-black text-(--builder-blue)">
          Open in Bookings →
        </Link>
      )}
    </Card>
  );
};

export const AttributionCard: FC<{ detail: SubmissionDetail }> = ({ detail }) => {
  const { attribution } = detail;
  const mono = (value: string | null) => (value ? <span className="font-mono text-[13px]">{value}</span> : '—');

  return (
    <Card className="p-5.5">
      <CardTitle>Where they came from</CardTitle>
      <InfoList
        rows={[
          { label: 'Source', value: attribution.source ?? '—' },
          { label: 'Medium', value: attribution.medium ?? '—' },
          { label: 'Campaign', value: mono(attribution.campaign) },
          { label: 'Content', value: mono(attribution.content) },
          { label: 'Term', value: mono(attribution.term) },
          { label: 'Landing page', value: attribution.landingPage ?? '—' },
          { label: 'Referrer', value: attribution.referrerUrl ?? 'Direct' },
        ]}
      />
    </Card>
  );
};
