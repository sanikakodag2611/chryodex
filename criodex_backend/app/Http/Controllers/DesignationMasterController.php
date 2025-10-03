<?php 

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DesignationMaster;

class DesignationMasterController extends Controller
{
   
    public function index()
    {
        return DesignationMaster::all();
    }


    public function store(Request $request)
    {
        $validated = $request->validate([
            'designation_name' => 'required|string|unique:designation_masters,designation_name',
            'designation_abbreviation' => 'required|string|unique:designation_masters,designation_abbreviation|max:10',
            'company_id'=>'required',
        ]);

        $designation = DesignationMaster::create($validated);

        return response()->json([
            'status' => true,
            'message' => 'Designation created successfully',
            'data' => $designation,
        ]);
    }

    public function show($id)
    {
        $designation = DesignationMaster::findOrFail($id);
        return response()->json(['status' => true, 'data' => $designation]);
    }

    public function update(Request $request, $id)
    {
        $designation = DesignationMaster::findOrFail($id);

        $validated = $request->validate([
            'designation_name' => 'required|string|unique:designation_masters,designation_name,' . $id,
            'designation_abbreviation' => 'required|string|unique:designation_masters,designation_abbreviation,' . $id . '|max:10',
        ]);

        $designation->update($validated);

        return response()->json([
            'status' => true,
            'message' => 'Designation updated successfully',
            'data' => $designation,
        ]);
    }

    public function destroy($id)
    {
        $designation = DesignationMaster::findOrFail($id);
        $designation->delete();

        return response()->json([
            'status' => true,
            'message' => 'Designation deleted successfully',
        ]);
    }
}
