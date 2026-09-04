import { BadRequestException } from '@nestjs/common';

export function parseMonthRange(bulan: string): {
  startDate: Date;
  endDate: Date;
} {
  const regex = /^\d{4}-(0[1-9]|1[0-2])$/;
  if (!regex.test(bulan)) {
    throw new BadRequestException(
      "Format bulan tidak valid. Gunakan format 'YYYY-MM' (contoh: '2026-09').",
    );
  }

  const [yearStr, monthStr] = bulan.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));

  return { startDate, endDate };
}
