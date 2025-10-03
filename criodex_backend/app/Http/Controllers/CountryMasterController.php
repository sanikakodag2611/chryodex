<?php

namespace App\Http\Controllers;

use App\Models\CountryMaster;
use Illuminate\Http\Request;

class CountryMasterController extends Controller
{
    public function index()
    {
        
        return response()->json(CountryMaster::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'country_name' => 'required|string|unique:country_masters,country_name',
            'country_abbr' => 'required|string|unique:country_masters,country_abbr',
            'country_code' => 'required|string|unique:country_masters,country_code',
            'status'=>'required|in:0,1',
        ]);

        $country = CountryMaster::create($validated);
        return response()->json($country );
    }

   
      
    public function show($id)
    {
       $country = CountryMaster::findOrFail($id);
        return response()->json([
            'status' => true,
            'data' =>$country,
        ]);
    }
 
   

    public function update(Request $request, $id)
    {
       $country = CountryMaster::findOrFail($id);

        $validated = $request->validate([
            'country_name' => 'required|string|unique:country_masters,country_name,'.$id,
            'country_abbr' => 'required|string|unique:country_masters,country_abbr,'. $id,
            'country_code' => 'required|string|unique:country_masters,country_code,'. $id,
            'status'=>'required|in:0,1',
        ]);

       $country->update($validated);

        return response()->json([
            'status' => true,
            'message' => 'Country updated successfully',
            'data' =>$country,
        ]);
    }
 
    public function destroy($id)
    {
       $country = CountryMaster::findOrFail($id);
       $country->delete();

        return response()->json([
            'status' => true,
            'message' => 'Country deleted successfully',
        ]);
    }
}
