<?php
 
namespace App\Imports;

use App\Models\CreditNote;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;

class CreditNoteImport implements ToModel, WithHeadingRow
{
    public $skippedRows = [];
    protected $existingKeys = [];

    public function __construct()
    {
        $this->existingKeys = CreditNote::select('invoice_no', 'item')
            ->get()
            ->map(fn($inv) => $this->makeComboKey($inv->invoice_no, $inv->item))
            ->toArray();
    }

    public function headingRow(): int
    {
        return 4;
    }

    public function model(array $row)
    {
        $mapped = [];
        foreach ($row as $origKey => $value) {
            $mapped[$this->normalizeHeader((string)$origKey)] = $value;
        }

        $get = fn($key) => $mapped[$key] ?? null;
        $invoiceNo = trim((string)($get('no') ?? ''));
        $itemName  = trim((string)($get('item') ?? ''));

        if ($invoiceNo === '') {
            return null;
        }

        $comboKey = $this->makeComboKey($invoiceNo, $itemName);

        if (in_array($comboKey, $this->existingKeys, true)) {
            $rowLog = $mapped;
            $rowLog['reason'] = 'Duplicate invoice_no + item';
            $this->skippedRows[] = $rowLog;
            return null;
        }

        $this->existingKeys[] = $comboKey;

        // Parse and convert amounts to positive
        $bill_amount = $this->convertToPositive((float) $get('bill_amount'));
        $rate = $this->convertToPositive((float) $get('rate'));
        $amount = $this->convertToPositive((float) $get('amount'));
        $freight = $this->convertToPositive((float) $get('freight'));
        $tax_amount = $this->convertToPositive((float) $get('tax_amount'));
        $transport = $this->convertToPositive((float) ($get('transport') ?? 0));
        $commission = $this->convertToPositive((float) ($get('commission') ?? 0));

        $cgst_rate = (float) $get('cgst_rate');
        $sgst_rate = (float) $get('sgst_rate');
        $igst_rate = (float) $get('igst_rate');
        $tax_per = $cgst_rate + $sgst_rate + $igst_rate;

        $qty = is_numeric($get('qty')) ? (int) $get('qty') : null;

        return new CreditNote([
            'invoice_no'  => $invoiceNo,
            'date'        => $this->convertDate($get('date')),
            'customer'    => $get('customer'),
            'salesman'    => $get('salesman'),
            'bill_amount' => $bill_amount,
            'rate'        => $rate,
            'amount'      => $amount,
            'freight'     => $freight,
            'tax_per'     => $tax_per,
            'party_code'  => $get('party_code'),
            'item'        => $itemName,
            'unit'        => $get('unit'),
            'qty'         => $qty,
            'hsn_code'    => $get('hsn_code'),
            'destination' => $get('destination'),
            'city'        => $get('city'),
            'tax_amount'  => $tax_amount,
            'transport'   => $transport,
            'commission'  => $commission,
        ]);
    }

    private function normalizeHeader(string $header): string
    {
        $header = trim(mb_strtolower($header));
        $header = preg_replace('/[^a-z0-9]+/u', '_', $header);
        $header = trim($header, '_');

        $map = [
            'bill_amountrs'        => 'bill_amount',
            'gst_tds_tax_raters'   => 'gst_tds_tax_rate',
            'gst_tds_tax_amountrs' => 'gst_tds_tax_amount',
            'amountrs'             => 'amount',
            'cgst_amtrs'           => 'cgst_amt',
            'sgst_amtrs'           => 'sgst_amt',
            'igst_amtrs'           => 'igst_amt',
            'tax_amountrs'         => 'tax_amount',
            'round_offrs'          => 'round_off',
        ];

        return $map[$header] ?? $header;
    }

    private function convertDate($value)
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (is_numeric($value)) {
            try {
                return ExcelDate::excelToDateTimeObject($value)->format('Y-m-d');
            } catch (\Exception $e) {
                return null;
            }
        }

        $timestamp = strtotime((string)$value);
        return $timestamp ? date('Y-m-d', $timestamp) : null;
    }

    private function convertToPositive($value): float
    {
        return abs((float) $value);
    }


    private function makeComboKey($invoiceNo, $itemName): string
    {
        return trim($invoiceNo) . '||' . trim($itemName);
    }

    public function getSkippedRows(): array
    {
        return $this->skippedRows;
    }
}
