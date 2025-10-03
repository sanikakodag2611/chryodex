<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class chartcontroller extends Controller
{
    // =========================
    // 1. Date-wise
    // =========================
    public function dateWise(Request $request)
    {
        $user = auth()->user();
        $year = DB::table('year_masters')->where('id', $user->year_id)->first();
        $yearStart = $year->opening_date;
        $yearEnd   = $year->closing_date;

        $from = $request->query('from_date');
        $to   = $request->query('to_date');

        // Check if selected dates are outside financial year
        if ($from && $to && ($from > $yearEnd || $to < $yearStart)) {
            return response()->json([
                'message' => 'No data found: selected date is outside your financial year.'
            ]);
        }

        $query = DB::table('invoice_records as s')
            ->leftJoin('product_master as p', DB::raw('TRIM(s.item)'), '=', DB::raw('TRIM(p.product_name)'))
            ->leftJoin('credit_note_records as r', DB::raw('DATE(r.date)'), '=', DB::raw('DATE(s.date)'))
            ->selectRaw("
                DATE(s.date) as date,
                SUM(s.amount - COALESCE(r.amount,0)) as sales
            ");

        // Include profit-related fields only if not Salesman
        if ($user->designation_id != 8) {
            $query->selectRaw("
                SUM(
                    (COALESCE(p.price,0)*s.qty + COALESCE(s.transport,0) + COALESCE(s.commission,0)) +
                    COALESCE((COALESCE(p.price,0)*r.qty + COALESCE(r.transport,0) + COALESCE(r.commission,0)),0)
                ) as cost,
                SUM(s.amount - COALESCE(r.amount,0)) - SUM(
                    (COALESCE(p.price,0)*s.qty + COALESCE(s.transport,0) + COALESCE(s.commission,0)) +
                    COALESCE((COALESCE(p.price,0)*r.qty + COALESCE(r.transport,0) + COALESCE(r.commission,0)),0)
                ) as profit
            ");
        }

        $query->groupBy(DB::raw('DATE(s.date)'))
              ->orderBy('date');

        // Filter dates within financial year
        if ($from && $to) {
            $from = max($from, $yearStart);
            $to   = min($to, $yearEnd);
            $query->whereBetween('s.date', [$from, $to]);
        } else {
            $query->whereBetween('s.date', [$yearStart, $yearEnd]);
        }

        if ($user->designation_id == 8) {
            $query->whereRaw('LOWER(TRIM(s.salesman)) = ?', [strtolower(trim($user->username))]);
        }

        $result = $query->get()->map(function ($row) use ($user) {
            if ($user->designation_id != 8) {
                return $this->addProfitPercent($row);
            }
            return $row; // For Salesman, return as-is without profit_percent
        });

        // Return message if no data found
        if ($result->isEmpty()) {
            return response()->json([
                'message' => 'No data found for selected range.'
            ]);
        }

        return response()->json($result);
    }

    // =========================
    // 2. City-wise
    // =========================
    public function cityWise(Request $request)
    {
        $user = auth()->user();
        $year = DB::table('year_masters')->where('id', $user->year_id)->first();
        $yearStart = $year->opening_date;
        $yearEnd   = $year->closing_date;

        $from = $request->query('from_date');
        $to   = $request->query('to_date');

        $query = DB::table('invoice_records as s')
            ->leftJoin('product_master as p', DB::raw('TRIM(s.item)'), '=', DB::raw('TRIM(p.product_name)'))
            ->leftJoin('credit_note_records as r', DB::raw('DATE(r.date)'), '=', DB::raw('DATE(s.date)'))
            ->selectRaw("
                LOWER(TRIM(s.destination)) as raw_city,
                SUM(s.amount - COALESCE(r.amount,0)) as sales
            ");

        // Include profit-related fields only if not Salesman
        if ($user->designation_id != 8) {
            $query->selectRaw("
                SUM(
                    (COALESCE(p.price,0)*s.qty + COALESCE(s.transport,0) + COALESCE(s.commission,0)) +
                    COALESCE((COALESCE(p.price,0)*r.qty + COALESCE(r.transport,0) + COALESCE(r.commission,0)),0)
                ) as cost,
                SUM(s.amount - COALESCE(r.amount,0)) - SUM(
                    (COALESCE(p.price,0)*s.qty + COALESCE(s.transport,0) + COALESCE(s.commission,0)) +
                    COALESCE((COALESCE(p.price,0)*r.qty + COALESCE(r.transport,0) + COALESCE(r.commission,0)),0)
                ) as profit
            ");
        }

        $query->groupBy(DB::raw('LOWER(TRIM(s.destination))'))
              ->orderByDesc('sales');

        if ($user->designation_id == 8) {
            $query->whereRaw('LOWER(TRIM(s.salesman)) = ?', [strtolower(trim($user->username))]);
        }

        if ($from && $to) {
            $from = max($from, $yearStart);
            $to   = min($to, $yearEnd);
            if ($from > $to) return response()->json([]);
            $query->whereBetween('s.date', [$from, $to]);
        } else {
            $query->whereBetween('s.date', [$yearStart, $yearEnd]);
        }

        $result = $query->get()->map(function ($row) use ($user) {
            $row->city = ucfirst(strtolower($row->raw_city));
            unset($row->raw_city);
            if ($user->designation_id != 8) {
                return $this->addProfitPercent($row);
            }
            return $row; // For Salesman, return as-is without profit_percent
        });

        return response()->json($result);
    }

    // =========================
    // 3. Salesman-wise
    // =========================
    public function salesmanWise(Request $request)
    {
        $user = auth()->user();
        $year = DB::table('year_masters')->where('id', $user->year_id)->first();
        $yearStart = $year->opening_date;
        $yearEnd   = $year->closing_date;

        $from = $request->query('from_date');
        $to   = $request->query('to_date');

        $query = DB::table('invoice_records as s')
            ->leftJoin('product_master as p', DB::raw('TRIM(s.item)'), '=', DB::raw('TRIM(p.product_name)'))
            ->leftJoin('credit_note_records as r', DB::raw('DATE(r.date)'), '=', DB::raw('DATE(s.date)'))
            ->selectRaw("
                LOWER(TRIM(s.salesman)) as raw_salesman,
                SUM(s.amount - COALESCE(r.amount,0)) as sales
            ");

        // Include profit-related fields only if not Salesman
        if ($user->designation_id != 8) {
            $query->selectRaw("
                SUM(
                    (COALESCE(p.price,0)*s.qty + COALESCE(s.transport,0) + COALESCE(s.commission,0)) +
                    COALESCE((COALESCE(p.price,0)*r.qty + COALESCE(r.transport,0) + COALESCE(r.commission,0)),0)
                ) as cost,
                SUM(s.amount - COALESCE(r.amount,0)) - SUM(
                    (COALESCE(p.price,0)*s.qty + COALESCE(s.transport,0) + COALESCE(s.commission,0)) +
                    COALESCE((COALESCE(p.price,0)*r.qty + COALESCE(r.transport,0) + COALESCE(r.commission,0)),0)
                ) as profit
            ");
        }

        $query->groupBy(DB::raw('LOWER(TRIM(s.salesman))'))
              ->orderByDesc('sales');

        if ($user->designation_id == 8) {
            $query->whereRaw('LOWER(TRIM(s.salesman)) = ?', [strtolower(trim($user->username))]);
        }

        if ($from && $to) {
            $from = max($from, $yearStart);
            $to   = min($to, $yearEnd);
            if ($from > $to) return response()->json([]);
            $query->whereBetween('s.date', [$from, $to]);
        } else {
            $query->whereBetween('s.date', [$yearStart, $yearEnd]);
        }

        $result = $query->get()->map(function ($row) use ($user) {
            $row->salesman = ucfirst(strtolower($row->raw_salesman));
            unset($row->raw_salesman);
            if ($user->designation_id != 8) {
                return $this->addProfitPercent($row);
            }
            return $row; // For Salesman, return as-is without profit_percent
        });

        return response()->json($result);
    }

    // =========================
    // 4. Drilldown: City → Salesmen
    // =========================
    public function salesmenInCity(Request $request)
    {
        $city = $request->query('city');
        $user = auth()->user();
        $year = DB::table('year_masters')->where('id', $user->year_id)->first();
        $yearStart = $year->opening_date;
        $yearEnd   = $year->closing_date;

        $from = $request->query('from_date');
        $to   = $request->query('to_date');

        $query = DB::table('invoice_records as s')
            ->leftJoin('product_master as p', DB::raw('TRIM(s.item)'), '=', DB::raw('TRIM(p.product_name)'))
            ->leftJoin('credit_note_records as r', DB::raw('DATE(r.date)'), '=', DB::raw('DATE(s.date)'))
            ->whereRaw('LOWER(TRIM(s.destination)) = ?', [strtolower(trim($city))])
            ->selectRaw("
                s.salesman,
                SUM(s.amount - COALESCE(r.amount,0)) as sales
            ");

        // Include profit-related fields only if not Salesman
        if ($user->designation_id != 8) {
            $query->selectRaw("
                SUM(
                    (COALESCE(p.price,0)*s.qty + COALESCE(s.transport,0) + COALESCE(s.commission,0)) +
                    COALESCE((COALESCE(p.price,0)*r.qty + COALESCE(r.transport,0) + COALESCE(r.commission,0)),0)
                ) as cost,
                SUM(s.amount - COALESCE(r.amount,0)) - SUM(
                    (COALESCE(p.price,0)*s.qty + COALESCE(s.transport,0) + COALESCE(s.commission,0)) +
                    COALESCE((COALESCE(p.price,0)*r.qty + COALESCE(r.transport,0) + COALESCE(r.commission,0)),0)
                ) as profit
            ");
        }

        $query->groupBy('s.salesman')
              ->orderByDesc('sales');

        if ($user->designation_id == 8) {
            $query->whereRaw('LOWER(TRIM(s.salesman)) = ?', [strtolower(trim($user->username))]);
        }

        if ($from && $to) {
            $from = max($from, $yearStart);
            $to   = min($to, $yearEnd);
            if ($from > $to) return response()->json([]);
            $query->whereBetween('s.date', [$from, $to]);
        } else {
            $query->whereBetween('s.date', [$yearStart, $yearEnd]);
        }

        $result = $query->get()->map(function ($row) use ($user) {
            if ($user->designation_id != 8) {
                return $this->addProfitPercent($row);
            }
            return $row; // For Salesman, return as-is without profit_percent
        });
        return response()->json($result);
    }

    // =========================
    // 5. Drilldown: City → Salesman → Date
    // =========================
    public function salesmanDates(Request $request)
    {
        $city     = $request->query('city');
        $salesman = $request->query('salesman');
        $user     = auth()->user();
        $year = DB::table('year_masters')->where('id', $user->year_id)->first();
        $yearStart = $year->opening_date;
        $yearEnd   = $year->closing_date;

        $from = $request->query('from_date');
        $to   = $request->query('to_date');

        $query = DB::table('invoice_records as s')
            ->leftJoin('product_master as p', DB::raw('TRIM(s.item)'), '=', DB::raw('TRIM(p.product_name)'))
            ->leftJoin('credit_note_records as r', DB::raw('DATE(r.date)'), '=', DB::raw('DATE(s.date)'))
            ->whereRaw('LOWER(TRIM(s.destination)) = ?', [strtolower(trim($city))])
            ->whereRaw('LOWER(TRIM(s.salesman)) = ?', [strtolower(trim($salesman))])
            ->selectRaw("
                DATE(s.date) as date,
                SUM(s.amount - COALESCE(r.amount,0)) as sales
            ");

        // Include profit-related fields only if not Salesman
        if ($user->designation_id != 8) {
            $query->selectRaw("
                SUM(
                    (COALESCE(p.price,0)*s.qty + COALESCE(s.transport,0) + COALESCE(s.commission,0)) +
                    COALESCE((COALESCE(p.price,0)*r.qty + COALESCE(r.transport,0) + COALESCE(r.commission,0)),0)
                ) as cost,
                SUM(s.amount - COALESCE(r.amount,0)) - SUM(
                    (COALESCE(p.price,0)*s.qty + COALESCE(s.transport,0) + COALESCE(s.commission,0)) +
                    COALESCE((COALESCE(p.price,0)*r.qty + COALESCE(r.transport,0) + COALESCE(r.commission,0)),0)
                ) as profit
            ");
        }

        $query->groupBy(DB::raw('DATE(s.date)'))
              ->orderBy('date');

        if ($user->designation_id == 8) {
            $query->whereRaw('LOWER(TRIM(s.salesman)) = ?', [strtolower(trim($user->username))]);
        }

        if ($from && $to) {
            $from = max($from, $yearStart);
            $to   = min($to, $yearEnd);
            if ($from > $to) return response()->json([]);
            $query->whereBetween('s.date', [$from, $to]);
        } else {
            $query->whereBetween('s.date', [$yearStart, $yearEnd]);
        }

        $result = $query->get()->map(function ($row) use ($user) {
            if ($user->designation_id != 8) {
                return $this->addProfitPercent($row);
            }
            return $row; // For Salesman, return as-is without profit_percent
        });
        return response()->json($result);
    }

    // =========================
    // 6. Drilldown: Salesman → Cities
    // =========================
    public function salesmanInCities(Request $request)
    {
        $salesman = $request->query('salesman');
        $user     = auth()->user();
        $year = DB::table('year_masters')->where('id', $user->year_id)->first();
        $yearStart = $year->opening_date;
        $yearEnd   = $year->closing_date;

        $from = $request->query('from_date');
        $to   = $request->query('to_date');

        $query = DB::table('invoice_records as s')
            ->leftJoin('product_master as p', DB::raw('TRIM(s.item)'), '=', DB::raw('TRIM(p.product_name)'))
            ->leftJoin('credit_note_records as r', DB::raw('DATE(r.date)'), '=', DB::raw('DATE(s.date)'))
            ->whereRaw('LOWER(TRIM(s.salesman)) = ?', [strtolower(trim($salesman))])
            ->selectRaw("
                LOWER(TRIM(s.destination)) as raw_city,
                SUM(s.amount - COALESCE(r.amount,0)) as sales
            ");

        // Include profit-related fields only if not Salesman
        if ($user->designation_id != 8) {
            $query->selectRaw("
                SUM(
                    (COALESCE(p.price,0)*s.qty + COALESCE(s.transport,0) + COALESCE(s.commission,0)) +
                    COALESCE((COALESCE(p.price,0)*r.qty + COALESCE(r.transport,0) + COALESCE(r.commission,0)),0)
                ) as cost,
                SUM(s.amount - COALESCE(r.amount,0)) - SUM(
                    (COALESCE(p.price,0)*s.qty + COALESCE(s.transport,0) + COALESCE(s.commission,0)) +
                    COALESCE((COALESCE(p.price,0)*r.qty + COALESCE(r.transport,0) + COALESCE(r.commission,0)),0)
                ) as profit
            ");
        }

        $query->groupBy(DB::raw('LOWER(TRIM(s.destination))'))
              ->orderByDesc('sales');

        if ($user->designation_id == 8) {
            $query->whereRaw('LOWER(TRIM(s.salesman)) = ?', [strtolower(trim($user->username))]);
        }

        if ($from && $to) {
            $from = max($from, $yearStart);
            $to   = min($to, $yearEnd);
            if ($from > $to) return response()->json([]);
            $query->whereBetween('s.date', [$from, $to]);
        } else {
            $query->whereBetween('s.date', [$yearStart, $yearEnd]);
        }

        $result = $query->get()->map(function ($row) use ($user) {
            $row->city = ucfirst(strtolower($row->raw_city));
            unset($row->raw_city);
            if ($user->designation_id != 8) {
                return $this->addProfitPercent($row);
            }
            return $row; // For Salesman, return as-is without profit_percent
        });

        return response()->json($result);
    }

    // =========================
    // 7. Product-wise
    // =========================
    public function productWise(Request $request)
    {
        $user = auth()->user();
        $year = DB::table('year_masters')->where('id', $user->year_id)->first();
        $yearStart = $year->opening_date;
        $yearEnd   = $year->closing_date;

        $from = $request->query('from_date');
        $to   = $request->query('to_date');

        // Check if selected dates are outside financial year
        if ($from && $to && ($from > $yearEnd || $to < $yearStart)) {
            return response()->json([
                'message' => 'No data found: selected date is outside your financial year.'
            ]);
        }

        $query = DB::table('invoice_records as s')
            ->leftJoin('product_master as p', DB::raw('TRIM(s.item)'), '=', DB::raw('TRIM(p.product_name)'))
            ->leftJoin('credit_note_records as r', DB::raw('DATE(r.date)'), '=', DB::raw('DATE(s.date)'))
            ->selectRaw("
                LOWER(TRIM(s.item)) as raw_product,
                SUM(s.amount - COALESCE(r.amount, 0)) as sales
            ");

        // Include profit-related fields only if not Salesman
        if ($user->designation_id != 8) {
            $query->selectRaw("
                SUM(
                    (COALESCE(p.price, 0) * s.qty + COALESCE(s.transport, 0) + COALESCE(s.commission, 0)) +
                    COALESCE((COALESCE(p.price, 0) * r.qty + COALESCE(r.transport, 0) + COALESCE(r.commission, 0)), 0)
                ) as cost,
                SUM(s.amount - COALESCE(r.amount, 0)) - SUM(
                    (COALESCE(p.price, 0) * s.qty + COALESCE(s.transport, 0) + COALESCE(s.commission, 0)) +
                    COALESCE((COALESCE(p.price, 0) * r.qty + COALESCE(r.transport, 0) + COALESCE(r.commission, 0)), 0)
                ) as profit
            ");
        }

        $query->groupBy(DB::raw('LOWER(TRIM(s.item))'))
              ->orderByDesc('sales');

        // Filter dates within financial year
        if ($from && $to) {
            $from = max($from, $yearStart);
            $to   = min($to, $yearEnd);
            $query->whereBetween('s.date', [$from, $to]);
        } else {
            $query->whereBetween('s.date', [$yearStart, $yearEnd]);
        }

        if ($user->designation_id == 8) {
            $query->whereRaw('LOWER(TRIM(s.salesman)) = ?', [strtolower(trim($user->username))]);
        }

        $result = $query->get()->map(function ($row) use ($user) {
            $row->product_name = ucfirst(strtolower($row->raw_product));
            unset($row->raw_product);
            if ($user->designation_id != 8) {
                return $this->addProfitPercent($row);
            }
            return $row; // For Salesman, return as-is without profit_percent
        });

        // Return message if no data found
        if ($result->isEmpty()) {
            return response()->json([
                'message' => 'No data found for selected range.'
            ]);
        }

        return response()->json($result);
    }

    // =========================
    // Totals
    // =========================
    public function totals(Request $request)
    {
        $user = auth()->user();
        $year = DB::table('year_masters')->where('id', $user->year_id)->first();
        $yearStart = $year->opening_date;
        $yearEnd   = $year->closing_date;

        $from = $request->query('from_date');
        $to   = $request->query('to_date');

        $query = DB::table('invoice_records as s')
            ->leftJoin('product_master as p', DB::raw('TRIM(s.item)'), '=', DB::raw('TRIM(p.product_name)'))
            ->leftJoin('credit_note_records as r', DB::raw('DATE(r.date)'), '=', DB::raw('DATE(s.date)'))
            ->selectRaw("
                SUM(s.amount - COALESCE(r.amount,0)) as sales
            ");

        // Include profit-related fields only if not Salesman
        if ($user->designation_id != 8) {
            $query->selectRaw("
                SUM(
                    (COALESCE(p.price,0)*s.qty + COALESCE(s.transport,0) + COALESCE(s.commission,0)) +
                    COALESCE((COALESCE(p.price,0)*r.qty + COALESCE(r.transport,0) + COALESCE(r.commission,0)),0)
                ) as cost,
                SUM(s.amount - COALESCE(r.amount,0)) - SUM(
                    (COALESCE(p.price,0)*s.qty + COALESCE(s.transport,0) + COALESCE(s.commission,0)) +
                    COALESCE((COALESCE(p.price,0)*r.qty + COALESCE(r.transport,0) + COALESCE(r.commission,0)),0)
                ) as profit
            ");
        }

        if ($user->designation_id == 8) {
            $query->whereRaw('LOWER(TRIM(s.salesman)) = ?', [strtolower(trim($user->username))]);
        }

        if ($from && $to) {
            $from = max($from, $yearStart);
            $to   = min($to, $yearEnd);
            if ($from > $to) return response()->json([
                'sales' => 0, 'cost' => 0, 'profit' => 0, 'profit_percent' => 0
            ]);
            $query->whereBetween('s.date', [$from, $to]);
        } else {
            $query->whereBetween('s.date', [$yearStart, $yearEnd]);
        }

        $row = $query->first();

        $sales  = $row->sales ?? 0;
        $cost   = $row->cost ?? 0;
        $profit = $row->profit ?? 0;

        return response()->json([
            'sales' => round($sales, 2),
            'cost' => $user->designation_id != 8 ? round($cost, 2) : 0,
            'profit' => $user->designation_id != 8 ? round($profit, 2) : 0,
            'profit_percent' => $user->designation_id != 8 && $sales > 0 ? round(($profit / $sales) * 100, 2) : 0,
        ]);
    }

    public function salesDetails(Request $request)
    {
        try {
            $user = auth()->user();
            $year = DB::table('year_masters')->where('id', $user->year_id)->first();
            $yearStart = $year->opening_date;
            $yearEnd = $year->closing_date;

            $from = $request->query('from_date');
            $to = $request->query('to_date');
            $city = $request->query('city');
            $salesman = $request->query('salesman');

            // Adjust date range to financial year
            $from = $from ? max($from, $yearStart) : $yearStart;
            $to = $to ? min($to, $yearEnd) : $yearEnd;

            if ($from > $to) {
                return response()->json([]);
            }

            $invoiceQuery = DB::table('invoice_records as s')
                ->leftJoin('product_master as p', DB::raw('TRIM(s.item)'), '=', DB::raw('TRIM(p.product_name)'))
                ->selectRaw("
                    s.id,
                    'Invoice' as type,
                    s.salesman,
                    s.customer,
                    s.item as product,
                    DATE(s.date) as date,
                    COALESCE(p.price, 0) * s.qty as basic_cost,
                    COALESCE(s.transport, 0) as transport,
                    COALESCE(s.commission, 0) as commission,
                    COALESCE(p.price, 0) * s.qty + COALESCE(s.transport, 0) + COALESCE(s.commission, 0) as net_amount,
                    s.amount - (COALESCE(p.price, 0) * s.qty + COALESCE(s.transport, 0) + COALESCE(s.commission, 0)) as profit_amount,
                    CASE
                        WHEN s.amount > 0
                        THEN ((s.amount - (COALESCE(p.price, 0) * s.qty + COALESCE(s.transport, 0) + COALESCE(s.commission, 0))) / s.amount * 100)
                        ELSE 0
                    END as profit_percentage,
                    COALESCE(s.tax_amount, 0) as gst_amount,
                    s.amount + COALESCE(s.tax_amount, 0) as grand_total
                ");

            $creditQuery = DB::table('credit_note_records as r')
                ->leftJoin('product_master as p', DB::raw('TRIM(r.item)'), '=', DB::raw('TRIM(p.product_name)'))
                ->selectRaw("
                    r.id,
                    'Credit Note' as type,
                    r.salesman,
                    r.customer,
                    r.item as product,
                    DATE(r.date) as date,
                    -COALESCE(p.price, 0) * r.qty as basic_cost,
                    -COALESCE(r.transport, 0) as transport,
                    -COALESCE(r.commission, 0) as commission,
                    -(COALESCE(p.price, 0) * r.qty + COALESCE(r.transport, 0) + COALESCE(r.commission, 0)) as net_amount,
                    -(r.amount - (COALESCE(p.price, 0) * r.qty + COALESCE(r.transport, 0) + COALESCE(r.commission, 0))) as profit_amount,
                    CASE
                        WHEN r.amount > 0
                        THEN -((r.amount - (COALESCE(p.price, 0) * r.qty + COALESCE(r.transport, 0) + COALESCE(r.commission, 0))) / r.amount * 100)
                        ELSE 0
                    END as profit_percentage,
                    -COALESCE(r.tax_amount, 0) as gst_amount,
                    -(r.amount + COALESCE(r.tax_amount, 0)) as grand_total
                ");

            if ($from && $to) {
                $invoiceQuery->whereBetween('s.date', [$from, $to]);
                $creditQuery->whereBetween('r.date', [$from, $to]);
            }

            if ($city) {
                $invoiceQuery->whereRaw('LOWER(TRIM(s.destination)) = ?', [strtolower($city)]);
                $creditQuery->whereRaw('LOWER(TRIM(r.destination)) = ?', [strtolower($city)]);
            }

            if ($salesman) {
                $invoiceQuery->whereRaw('LOWER(TRIM(s.salesman)) = ?', [strtolower($salesman)]);
                $creditQuery->whereRaw('LOWER(TRIM(r.salesman)) = ?', [strtolower($salesman)]);
            }

            if ($user->designation_id == 8) {
                $invoiceQuery->whereRaw('LOWER(TRIM(s.salesman)) = ?', [strtolower($user->username)]);
                $creditQuery->whereRaw('LOWER(TRIM(r.salesman)) = ?', [strtolower($user->username)]);
            }

            $records = $invoiceQuery->unionAll($creditQuery)->orderBy('date')->get();

            if ($user->designation_id == 8) {
                $records = $records->map(function ($row) {
                    $row->basic_cost = null;
                    $row->net_amount = null;
                    $row->profit_amount = null;
                    $row->profit_percentage = null;
                    $row->gst_amount = null;
                    $row->grand_total = null;
                    return $row;
                });
            }

            if ($records->isEmpty()) {
                return response()->json([], 200);
            }

            return response()->json($records);

        } catch (\Exception $e) {
            Log::error('SalesDetails error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'input' => $request->all()
            ]);
            return response()->json(['error' => 'Server error occurred'], 500);
        }
    }

    public function productDetails(Request $request)
    {
        try {
            $user = auth()->user();
            $year = DB::table('year_masters')->where('id', $user->year_id)->first();
            $yearStart = $year->opening_date;
            $yearEnd = $year->closing_date;

            $from = $request->query('from_date');
            $to = $request->query('to_date');
            $product = $request->query('product');

            // Adjust date range to financial year
            $from = $from ? max($from, $yearStart) : $yearStart;
            $to = $to ? min($to, $yearEnd) : $yearEnd;

            if ($from > $to) {
                return response()->json([]);
            }

            $invoiceQuery = DB::table('invoice_records as s')
                ->leftJoin('product_master as p', DB::raw('TRIM(s.item)'), '=', DB::raw('TRIM(p.product_name)'))
                ->selectRaw("
                    s.id,
                    'Invoice' as type,
                    s.salesman,
                    s.customer,
                    s.item as product,
                    DATE(s.date) as date,
                    COALESCE(p.price, 0) * s.qty as basic_cost,
                    COALESCE(s.transport, 0) as transport,
                    COALESCE(s.commission, 0) as commission,
                    COALESCE(p.price, 0) * s.qty + COALESCE(s.transport, 0) + COALESCE(s.commission, 0) as net_amount,
                    s.amount - (COALESCE(p.price, 0) * s.qty + COALESCE(s.transport, 0) + COALESCE(s.commission, 0)) as profit_amount,
                    CASE
                        WHEN s.amount > 0
                        THEN ((s.amount - (COALESCE(p.price, 0) * s.qty + COALESCE(s.transport, 0) + COALESCE(s.commission, 0))) / s.amount * 100)
                        ELSE 0
                    END as profit_percentage,
                    COALESCE(s.tax_amount, 0) as gst_amount,
                    s.amount + COALESCE(s.tax_amount, 0) as grand_total
                ");

            $creditQuery = DB::table('credit_note_records as r')
                ->leftJoin('product_master as p', DB::raw('TRIM(r.item)'), '=', DB::raw('TRIM(p.product_name)'))
                ->selectRaw("
                    r.id,
                    'Credit Note' as type,
                    r.salesman,
                    r.customer,
                    r.item as product,
                    DATE(r.date) as date,
                    -COALESCE(p.price, 0) * r.qty as basic_cost,
                    -COALESCE(r.transport, 0) as transport,
                    -COALESCE(r.commission, 0) as commission,
                    -(COALESCE(p.price, 0) * r.qty + COALESCE(r.transport, 0) + COALESCE(r.commission, 0)) as net_amount,
                    -(r.amount - (COALESCE(p.price, 0) * r.qty + COALESCE(r.transport, 0) + COALESCE(r.commission, 0))) as profit_amount,
                    CASE
                        WHEN r.amount > 0
                        THEN -((r.amount - (COALESCE(p.price, 0) * r.qty + COALESCE(r.transport, 0) + COALESCE(r.commission, 0))) / r.amount * 100)
                        ELSE 0
                    END as profit_percentage,
                    -COALESCE(r.tax_amount, 0) as gst_amount,
                    -(r.amount + COALESCE(r.tax_amount, 0)) as grand_total
                ");

            if ($from && $to) {
                $invoiceQuery->whereBetween('s.date', [$from, $to]);
                $creditQuery->whereBetween('r.date', [$from, $to]);
            }

            if ($product) {
                $invoiceQuery->whereRaw('LOWER(TRIM(s.item)) = ?', [strtolower(trim($product))]);
                $creditQuery->whereRaw('LOWER(TRIM(r.item)) = ?', [strtolower(trim($product))]);
            }

            if ($user->designation_id == 8) {
                $invoiceQuery->whereRaw('LOWER(TRIM(s.salesman)) = ?', [strtolower($user->username)]);
                $creditQuery->whereRaw('LOWER(TRIM(r.salesman)) = ?', [strtolower($user->username)]);
            }

            $records = $invoiceQuery->unionAll($creditQuery)->orderBy('date')->get();

            if ($user->designation_id == 8) {
                $records = $records->map(function ($row) {
                    $row->basic_cost = null;
                    $row->net_amount = null;
                    $row->profit_amount = null;
                    $row->profit_percentage = null;
                    $row->gst_amount = null;
                    $row->grand_total = null;
                    return $row;
                });
            }

            if ($records->isEmpty()) {
                return response()->json([], 200);
            }

            return response()->json($records);

        } catch (\Exception $e) {
            Log::error('ProductDetails error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'input' => $request->all()
            ]);
            return response()->json(['error' => 'Server error occurred'], 500);
        }
    }

    public function salesmanDetails(Request $request)
{
    try {
        $user = auth()->user();
        $year = DB::table('year_masters')->where('id', $user->year_id)->first();
        $yearStart = $year->opening_date;
        $yearEnd = $year->closing_date;

        $from = $request->query('from_date');
        $to = $request->query('to_date');
        $salesman = $request->query('salesman');

        // Adjust date range to financial year
        $from = $from ? max($from, $yearStart) : $yearStart;
        $to = $to ? min($to, $yearEnd) : $yearEnd;

        if ($from > $to) {
            return response()->json([]);
        }

        $query = DB::table('invoice_records as s')
            ->leftJoin('product_master as p', DB::raw('TRIM(s.item)'), '=', DB::raw('TRIM(p.product_name)'))
            ->leftJoin('credit_note_records as r', DB::raw('DATE(r.date)'), '=', DB::raw('DATE(s.date)'))
            ->selectRaw("
                LOWER(TRIM(s.salesman)) as raw_salesman,
                SUM(s.amount - COALESCE(r.amount, 0)) as sales
            ");

        // Include profit-related fields only if not Salesman
        if ($user->designation_id != 8) {
            $query->selectRaw("
                SUM(
                    (COALESCE(p.price, 0) * s.qty + COALESCE(s.transport, 0) + COALESCE(s.commission, 0)) +
                    COALESCE((COALESCE(p.price, 0) * r.qty + COALESCE(r.transport, 0) + COALESCE(r.commission, 0)), 0)
                ) as cost,
                SUM(s.amount - COALESCE(r.amount, 0)) - SUM(
                    (COALESCE(p.price, 0) * s.qty + COALESCE(s.transport, 0) + COALESCE(s.commission, 0)) +
                    COALESCE((COALESCE(p.price, 0) * r.qty + COALESCE(r.transport, 0) + COALESCE(r.commission, 0)), 0)
                ) as profit
            ");
        }

        $query->groupBy(DB::raw('LOWER(TRIM(s.salesman))'))
              ->orderByDesc('sales');

        if ($salesman) {
            $query->whereRaw('LOWER(TRIM(s.salesman)) = ?', [strtolower(trim($salesman))]);
        }

        if ($user->designation_id == 8) {
            $query->whereRaw('LOWER(TRIM(s.salesman)) = ?', [strtolower(trim($user->username))]);
        }

        if ($from && $to) {
            $query->whereBetween('s.date', [$from, $to]);
        } else {
            $query->whereBetween('s.date', [$yearStart, $yearEnd]);
        }

        $result = $query->get()->map(function ($row) use ($user) {
            // Map to frontend-expected field names
            $mapped = (object) [
                'salesman_name' => ucfirst(strtolower($row->raw_salesman)),
                'grand_total' => round($row->sales, 2),
                'profit_amount' => $user->designation_id != 8 ? round($row->profit ?? 0, 2) : null
            ];
            unset($row->raw_salesman);
            if ($user->designation_id != 8) {
                $row = $this->addProfitPercent($row);
                $mapped->profit_percent = $row->profit_percent;
            }
            return $mapped;
        });

        if ($result->isEmpty()) {
            return response()->json([], 200);
        }

        return response()->json($result);

    } catch (\Exception $e) {
        Log::error('SalesmanDetails error', [
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'input' => $request->all()
        ]);
        return response()->json(['error' => 'Server error occurred'], 500);
    }
}
public function cityDetails(Request $request)
{
    try {
        $user = auth()->user();
        $year = DB::table('year_masters')->where('id', $user->year_id)->first();
        $yearStart = $year->opening_date;
        $yearEnd = $year->closing_date;

        $from = $request->query('from_date');
        $to = $request->query('to_date');
        $city = $request->query('city');

        // Adjust date range to financial year
        $from = $from ? max($from, $yearStart) : $yearStart;
        $to = $to ? min($to, $yearEnd) : $yearEnd;

        if ($from > $to) {
            return response()->json([]);
        }

        $query = DB::table('invoice_records as s')
            ->leftJoin('product_master as p', DB::raw('TRIM(s.item)'), '=', DB::raw('TRIM(p.product_name)'))
            ->leftJoin('credit_note_records as r', DB::raw('DATE(r.date)'), '=', DB::raw('DATE(s.date)'))
            ->selectRaw("
                LOWER(TRIM(s.destination)) as raw_city,
                SUM(s.amount - COALESCE(r.amount, 0)) as sales
            ");

        // Include profit-related fields only if not Salesman
        if ($user->designation_id != 8) {
            $query->selectRaw("
                SUM(
                    (COALESCE(p.price, 0) * s.qty + COALESCE(s.transport, 0) + COALESCE(s.commission, 0)) +
                    COALESCE((COALESCE(p.price, 0) * r.qty + COALESCE(r.transport, 0) + COALESCE(r.commission, 0)), 0)
                ) as cost,
                SUM(s.amount - COALESCE(r.amount, 0)) - SUM(
                    (COALESCE(p.price, 0) * s.qty + COALESCE(s.transport, 0) + COALESCE(s.commission, 0)) +
                    COALESCE((COALESCE(p.price, 0) * r.qty + COALESCE(r.transport, 0) + COALESCE(r.commission, 0)), 0)
                ) as profit
            ");
        }

        $query->groupBy(DB::raw('LOWER(TRIM(s.destination))'))
              ->orderByDesc('sales');

        if ($city) {
            $query->whereRaw('LOWER(TRIM(s.destination)) = ?', [strtolower(trim($city))]);
        }

        if ($user->designation_id == 8) {
            $query->whereRaw('LOWER(TRIM(s.salesman)) = ?', [strtolower(trim($user->username))]);
        }

        if ($from && $to) {
            $query->whereBetween('s.date', [$from, $to]);
        } else {
            $query->whereBetween('s.date', [$yearStart, $yearEnd]);
        }

        $result = $query->get()->map(function ($row) use ($user) {
            // Map to frontend-expected field names
            $mapped = (object) [
                'city' => ucfirst(strtolower($row->raw_city)),
                'grand_total' => round($row->sales, 2),
                'profit_amount' => $user->designation_id != 8 ? round($row->profit ?? 0, 2) : null
            ];
            unset($row->raw_city);
            if ($user->designation_id != 8) {
                $row = $this->addProfitPercent($row);
                $mapped->profit_percent = $row->profit_percent;
            }
            return $mapped;
        });

        if ($result->isEmpty()) {
            return response()->json([], 200);
        }

        return response()->json($result);

    } catch (\Exception $e) {
        Log::error('CityDetails error', [
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
            'input' => $request->all()
        ]);
        return response()->json(['error' => 'Server error occurred'], 500);
    }
}
    // =========================
    // Helper
    // =========================
    private function addProfitPercent($row)
    {
        $row->profit_percent = $row->sales > 0
            ? round(($row->profit / $row->sales) * 100, 2)
            : 0;
        return $row;
    }
}