<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductChartController extends Controller
{
    public function profitReport(Request $request)
    {
         
        $startDate = $request->query('from_date');
        $endDate   = $request->query('to_date');

        $data = DB::table('invoice_records as i')
            ->join('product_master as p', 'p.product_name', '=','i.item')
            ->select(
                DB::raw('DATE(i.date) as date'),
                DB::raw('SUM(i.bill_amount) as revenue'),
                DB::raw('SUM(i.qty * p.price) as cost')
            )
            ->whereBetween('i.date', [$startDate, $endDate])
            ->groupBy(DB::raw('DATE(i.date)'))
            ->orderBy('date')
            ->get();

        $result = $data->map(function ($row) {
            $profit = $row->revenue - $row->cost;
            $profitRate = $row->revenue > 0 ? ($profit / $row->revenue) * 100 : 0;
            return [
                'date'        => $row->date,
                'revenue'     => round($row->revenue, 2),
                'cost'        => round($row->cost, 2),
                'profit'      => round($profit, 2),
                'profit_rate' => round($profitRate, 2).'',

            ];
        });

        return response()->json($result);
    }

}
