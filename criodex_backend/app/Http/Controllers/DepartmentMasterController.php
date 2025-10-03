<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DepartmentMaster;

class DepartmentMasterController extends Controller
{ 
     
    public function index()
    {
        return DepartmentMaster::all();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'department_name' => 'required|string|unique:department_masters,department_name',
            'department_abbreviation' => 'required|string|unique:department_masters,department_abbreviation',
            'status'=>'required|in:0,1',
            'company_id'=>'required',
        ]);

        $department = DepartmentMaster::create($validated);
        return response()->json($department );
    }

   
      
    public function show($id)
    {
        $department = DepartmentMaster::findOrFail($id);
        return response()->json([
            'status' => true,
            'data' => $department,
        ]);
    }
 
   

    public function update(Request $request, $id)
    {
        $department = DepartmentMaster::findOrFail($id);

        $validated = $request->validate([
            'department_name' => 'required|string|unique:department_masters,department_name,' . $id,
            'department_abbreviation' => 'required|string|unique:department_masters,department_abbreviation,' . $id,
            'status'=>'required|in:0,1',
        ]);

        $department->update($validated);

        return response()->json([
            'status' => true,
            'message' => 'Department updated successfully',
            'data' => $department,
        ]);
    }
 
    public function destroy($id)
    {
        $department = DepartmentMaster::findOrFail($id);
        $department->delete();

        return response()->json([
            'status' => true,
            'message' => 'Department deleted successfully',
        ]);
    }
}
