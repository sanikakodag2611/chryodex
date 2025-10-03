<?php
 
namespace App\Http\Controllers;

use App\Models\StateMaster;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class StateController extends Controller
{
    public function index()
    {
        $data=StateMaster::join(
            'country_masters','country_masters.id','=','state_masters.country_id'
        )
        ->select('state_masters.*','country_masters.country_name')->get();
        return  $data;
        // return response()->json(StateMaster::all());
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'state_name' => 'required|string|unique:state_masters,state_name',
            'state_abbr' => 'required|string|unique:state_masters,state_abbr',
            'state_ut'   => 'required|string|unique:state_masters,state_ut',
            'country_id' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        // Store record
        $state = StateMaster::create($validator->validated());

        return response()->json([
            'status' => true,
            'message' => 'State stored successfully',
            'data' => $state,
        ]);
    }
 
    public function show($id)
    {
       $state = StateMaster::findOrFail($id);
        return response()->json([
            'status' => true,
            'data' =>$state,
        ]);
    }
 
    public function update(Request $request, $id)
    {
       $state = StateMaster::findOrFail($id);
        $validated = $request->validate([
            'state_name' => 'required|string|unique:state_masters,state_name,'.$id,
            'state_abbr' => 'required|string|unique:state_masters,state_abbr,'.$id,
            'state_ut' => 'required|string|unique:state_masters,state_ut,'.$id,
            'country_id'=> 'required',
        ]);

       $state->update($validated);

        return response()->json([
            'status' => true,
            'message' => 'State updated successfully',
            'data' =>$state,
        ]);
    }
    public function destroy($id)
    {
       $state = StateMaster::findOrFail($id);
       $state->delete();

        return response()->json([
            'status' => true,
            'message' => 'State deleted successfully',
        ]);
    }
}

