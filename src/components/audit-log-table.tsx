import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AuditLogEntry } from "@/lib/api/types";
import { actionLabel, detailLines } from "@/lib/audit";
import { formatDateTime } from "@/lib/format";

const SHOWN_LINES = 3;

/** Audit entries, newest first; on a store's page without the store column. */
export function AuditLogTable({ entries, showStore = true }: { entries: AuditLogEntry[]; showStore?: boolean }) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>When</TableHead>
            <TableHead>What</TableHead>
            {showStore && <TableHead>Store</TableHead>}
            <TableHead>Who</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => {
            const lines = detailLines(entry);
            return (
              <TableRow key={entry.id} className="align-top">
                <TableCell className="tabular-nums whitespace-nowrap">{formatDateTime(entry.createdAt)}</TableCell>
                <TableCell>
                  <p className="font-medium">{actionLabel(entry.action)}</p>
                  <p className="font-mono text-xs text-muted-foreground">{entry.action}</p>
                </TableCell>
                {showStore && (
                  <TableCell>
                    {entry.tenant ? (
                      <Link href={`/tenants/${entry.tenant.id}`} className="hover:underline">
                        {entry.tenant.name}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">Platform</span>
                    )}
                  </TableCell>
                )}
                <TableCell>
                  {entry.actor ? (
                    <>
                      <p>{entry.actor.name}</p>
                      <p className="text-xs text-muted-foreground">{entry.actor.email}</p>
                    </>
                  ) : (
                    <span className="text-muted-foreground">System</span>
                  )}
                </TableCell>
                <TableCell className="max-w-md whitespace-normal">
                  {lines.length === 0 ? (
                    <span className="text-muted-foreground">—</span>
                  ) : (
                    <>
                      <ul className="grid gap-0.5 text-xs text-muted-foreground">
                        {lines.slice(0, SHOWN_LINES).map((line) => (
                          <li key={line} className="break-words">
                            {line}
                          </li>
                        ))}
                      </ul>
                      {(lines.length > SHOWN_LINES || lines.some((line) => line.endsWith("…"))) && (
                        <details className="mt-1 text-xs">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">All details</summary>
                          <pre className="mt-1 max-h-64 overflow-auto rounded-md bg-muted/50 p-2 font-mono whitespace-pre-wrap break-words">
                            {JSON.stringify(entry.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
