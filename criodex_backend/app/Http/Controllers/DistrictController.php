<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DistrictMaster;
use Illuminate\Support\Facades\Validator;

class DistrictController extends Controller
{
    //
    public function index()
    { 
        return DistrictMaster::all();
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'district_name' => 'required|string|unique:districtmasters,district_name|max:255',
            'state_id' => 'required|integer|exists:state_masters,id',
            'company_id'=>'required',
        ]);

        if($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors(),
            ], 422); // Unprocessable Entity
        }

        $district = DistrictMaster::create($validator->validated());

        return response()->json([
            'status' => true,
            'data' => $district,
            'message' => 'District created successfully',
        ], 201);
    }

    
    public function show($id)
    {
        $district = DistrictMaster::find($id);

        if (!$district) {
            return response()->json([
                'status' => false,
                'message' => 'District not found',
            ], 404);
        }

        return response()->json([
            'status' => true,
            'data' => $district,
        ]);
    }

    
    public function update(Request $request, $id)
    {
        $district = DistrictMaster::find($id);

        if (!$district) {
            return response()->json([
                'status' => false,
                'message' => 'District not found',
            ], 404);
        }

        $validated = $request->validate([
            'district_name' => 'required|string|max:255|unique:districtmasters,district_name,'.$id,
            'state_id' => 'required|integer|exists:state_masters,id',
        ]);

        $district->update($validated);

        return response()->json([
            'status' => true,
            'data' => $district,
            'message' => 'District updated successfully',
        ]);
    }

    
    public function destroy($id)
    {
        $district = DistrictMaster::find($id);

        if (!$district) {
            return response()->json([
                'status' => false,
                'message' => 'District not found',
            ], 404);
        }

        $district->delete();

        return response()->json([
            'status' => true,
            'message' => 'District deleted successfully',
        ]);
    }


}
