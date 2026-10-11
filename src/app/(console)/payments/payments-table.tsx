import Link from "next/link";
import { PaymentStatusBadge } from "@/components/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { BillingPayment, PaymentMethod } from "@/lib/api/types";
import { formatDateTime, formatDay, formatPrice } from "@/lib/format";
import { PaymentActions } from "./payment-actions";

const METHOD: Record<PaymentMethod, string> = { BANK_TRANSFER: "Bank transfer", CASH: "Cash", OTHER: "Other" };

/** Payments with their receipt and review actions; on a store's page without the store column. */
export function PaymentsTable({ payments, showStore = true }: { payments: BillingPayment[]; showStore?: boolean }) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {showStore && <TableHead>Store</TableHead>}
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Sent</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              {showStore && (
                <TableCell>
                  <Link href={`/tenants/${payment.tenant.id}`} className="font-medium hover:underline">
                    {payment.tenant.name}
                  </Link>
                  <p className="font-mono text-xs text-muted-foreground">{payment.tenant.slug}</p>
                </TableCell>
              )}
              <TableCell className="text-right tabular-nums">
                {formatPrice(payment.amount)}
                {payment.status === "SUBMITTED" && payment.expectedAmount !== null && payment.expectedAmount !== payment.amount && (
                  <p className="text-xs text-muted-foreground">price {formatPrice(payment.expectedAmount)}</p>
                )}
              </TableCell>
              <TableCell className="max-w-xs whitespace-normal">
                <p>
                  {METHOD[payment.method]}
                  {payment.reference && <span className="font-mono text-xs text-muted-foreground"> · {payment.reference}</span>}
                </p>
                {payment.note && <p className="text-xs text-muted-foreground">“{payment.note}”</p>}
                {payment.source === "PLATFORM" && <p className="text-xs text-muted-foreground">Recorded in the console</p>}
              </TableCell>
              <TableCell className="tabular-nums">{formatDateTime(payment.submittedAt)}</TableCell>
              <TableCell className="max-w-xs whitespace-normal">
                <PaymentStatusBadge status={payment.status} />
                {payment.status === "CONFIRMED" && payment.periodStart && payment.periodEnd && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDay(payment.periodStart)} – {formatDay(payment.periodEnd)}
                  </p>
                )}
                {payment.reviewNote && <p className="mt-1 text-xs text-muted-foreground">{payment.reviewNote}</p>}
                {payment.reviewedBy && <p className="text-xs text-muted-foreground">by {payment.reviewedBy.name}</p>}
              </TableCell>
              <TableCell>
                <PaymentActions payment={payment} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
