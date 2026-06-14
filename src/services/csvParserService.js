import { parse } from 'csv-parse/sync';
import ApiError from '../utils/ApiError.js';

const EXTRA_COLUMNS_KEY = '__extraColumns';

const assertValidHeaders = (headers) => {
  if (!headers.length || headers.every((header) => header.trim() === '')) {
    throw new ApiError(400, 'CSV file must include a non-empty header row.');
  }

  const emptyHeaderIndex = headers.findIndex((header) => header.trim() === '');
  if (emptyHeaderIndex !== -1) {
    throw new ApiError(400, `CSV header at column ${emptyHeaderIndex + 1} cannot be empty.`);
  }

  const seenHeaders = new Set();
  const duplicateHeader = headers.find((header) => {
    if (seenHeaders.has(header)) {
      return true;
    }

    seenHeaders.add(header);
    return false;
  });

  if (duplicateHeader) {
    throw new ApiError(400, `CSV header "${duplicateHeader}" is duplicated.`);
  }
};

const mapRowToObject = (headers, values) => {
  const row = {};

  headers.forEach((header, index) => {
    row[header] = Object.prototype.hasOwnProperty.call(values, index) ? values[index] : null;
  });

  if (values.length > headers.length) {
    row[EXTRA_COLUMNS_KEY] = values.slice(headers.length);
  }

  return row;
};

/**
 * Parses a CSV buffer into raw JSON rows while preserving file row numbers.
 * This service deliberately keeps CSV cell values as strings and does not
 * validate expense semantics, mutate data, or reject individual data rows.
 */
export const parseCsvBuffer = (buffer) => {
  if (!buffer || buffer.length === 0) {
    throw new ApiError(400, 'CSV file cannot be empty.');
  }

  let records;

  try {
    records = parse(buffer, {
      bom: true,
      info: true,
      relax_column_count: true,
      skip_empty_lines: false
    });
  } catch (error) {
    throw new ApiError(400, `Invalid CSV file format: ${error.message}`);
  }

  if (!records.length) {
    throw new ApiError(400, 'CSV file must include a header row.');
  }

  const headers = records[0].record;
  assertValidHeaders(headers);

  return records.slice(1).map(({ record, info }) => ({
    rowNumber: info.lines,
    data: mapRowToObject(headers, record)
  }));
};

export default {
  parseCsvBuffer
};
