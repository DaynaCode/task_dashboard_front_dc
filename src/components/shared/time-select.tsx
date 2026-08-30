import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toPersianDigits } from "@/lib/jalali";

const pad2 = (n: number) => String(n).padStart(2, "0");
const HOURS = Array.from({ length: 24 }, (_, i) => pad2(i));
const MINUTES = Array.from({ length: 60 }, (_, i) => pad2(i));

interface TimeSelectProps {
  /** "HH:mm" (24h) or empty for no selection. */
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export function TimeSelect({ value, onChange, className }: TimeSelectProps) {
  const [hour = "", minute = ""] = (value ?? "").split(":");

  return (
    <div className={className} dir="ltr">
      <div className="flex items-center gap-1.5">
        <Select
          value={hour}
          onValueChange={(h) => onChange(`${h}:${minute || "00"}`)}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="ساعت" />
          </SelectTrigger>
          <SelectContent className="max-h-64">
            {HOURS.map((h) => (
              <SelectItem key={h} value={h}>
                {toPersianDigits(h)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-muted-foreground">:</span>
        <Select
          value={minute}
          onValueChange={(m) => onChange(`${hour || "00"}:${m}`)}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="دقیقه" />
          </SelectTrigger>
          <SelectContent className="max-h-64">
            {MINUTES.map((m) => (
              <SelectItem key={m} value={m}>
                {toPersianDigits(m)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
