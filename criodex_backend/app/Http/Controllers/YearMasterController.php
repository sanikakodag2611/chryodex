<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\YearMaster;
use Illuminate\Support\Facades\Log;

class YearMasterController extends Controller
{
    public function index()
    {
        Log::info('Fetching all year records');
        return response()->json(YearMaster::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'year_name' => 'required|string',
            'year_abbreviation' => 'required|string',
            'opening_date' => 'required|date',
            'closing_date' => 'required|date',
            'status' => 'required|boolean',
            'company_id'=>'required',
        ]);

        $year = YearMaster::create($request->all());

        Log::info('Year created', ['data' => $year]);

        return response()->json([
            'message' => 'Year created successfully',
            'data' => $year
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $year = YearMaster::findOrFail($id);
        $year->update($request->all());

        Log::info("Year updated", ['id' => $id, 'data' => $year]);

        return response()->json([
            'message' => 'Year updated successfully',
            'data' => $year
        ]);
    }

    public function destroy($id)
    {
        $year = YearMaster::findOrFail($id);
        $year->delete();

        Log::warning("Year deleted", ['id' => $id]);

        return response()->json(['message' => 'Year deleted successfully']);
    }
}
