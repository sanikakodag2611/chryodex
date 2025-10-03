<?php

namespace App\Http\Controllers;

use App\Models\CreditNote;
use Illuminate\Http\Request;
use App\Imports\CreditNoteImport;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;

class CreditNoteController extends Controller
{
    public function index()
    {
        $invoices = CreditNote::all();
        return response()->json($invoices);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls',
        ]);

        $import = new CreditNoteImport();

        Excel::import($import, $request->file('file'));

        $skippedRows = $import->skippedRows;

        // Extract duplicate 'invoice_no' values
        $duplicateInvoiceNos = array_unique(array_column($skippedRows, 'invoice_no'));

        // Fetch matching existing invoices
        $existingDuplicates = CreditNote::whereIn('invoice_no', $duplicateInvoiceNos)->get()->toArray();

        return response()->json([
            'status' => count($skippedRows) > 0 ? 'warning' : 'success',
            'message' => count($skippedRows) > 0 
                ? 'File imported with some duplicates skipped.'
                : 'File imported successfully for Credit Note.',
            'skipped' => $skippedRows,
            'existingDuplicates' => $existingDuplicates,
        ]);
    }

    public function updateDuplicates(Request $request)
    {
        $rows = $request->input('rows', []);

        foreach ($rows as $row) {
            try {
                // Convert known date fields if numeric Excel serial date
                $dateFields = ['date'];
                foreach ($dateFields as $field) {
                    if (isset($row[$field]) && is_numeric($row[$field])) {
                        $row[$field] = $this->excelDateToDateString($row[$field]);
                    }
                }

                \App\Models\CreditNote::updateOrCreate(
                    ['invoice_no' => $row['no']],  
                    $row
                );
            } catch (\Exception $e) {
                \Log::error('Invoice update failed for row: ' . json_encode($row));
                \Log::error('Error: ' . $e->getMessage());
                return response()->json([
                    'message' => 'Error updating invoice',
                    'error' => $e->getMessage(),
                ], 500);
            }
        }

        return response()->json(['message' => 'Duplicates updated successfully']);
    }

    private function excelDateToDateString($excelDate)
    {
        $unixTimestamp = ($excelDate - 25569) * 86400;
        return gmdate("Y-m-d", $unixTimestamp);
    }

}
