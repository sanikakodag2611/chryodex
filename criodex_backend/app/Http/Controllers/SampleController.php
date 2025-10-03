<?php

namespace App\Http\Controllers;
use App\Models\Sampledata;
use Illuminate\Http\Request;


class SampleController extends Controller
{
    public function index()
    {
        return response()->json(Sampledata::all());
    }

    // POST /api/sampledata
    public function store(Request $request)
    {
        $request->validate([
            'user_name' => 'required|string|max:255',
            'password' => 'required|string|min:6',
        ]);

        $data = new Sampledata();
        $data->user_name = $request->user_name;
        $data->password = $request->password; // hash password
        $data->save();

        return response()->json(['message' => 'User created successfully', 'data' => $data], 201);
    }

    // GET /api/sampledata/{id}
    public function show($id)
    {
        $data = Sampledata::find($id);

        if (!$data) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json($data);
    }

    // PUT /api/sampledata/{id}
    public function update(Request $request, $id)
    {
        $data = Sampledata::find($id);

        if (!$data) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $data->user_name = $request->user_name ?? $data->user_name;

        if ($request->password) {
            $data->password = Hash::make($request->password); // update with hashed password
        }

        $data->save();

        return response()->json(['message' => 'User updated successfully', 'data' => $data]);
    }

    // DELETE /api/sampledata/{id}
    public function destroy($id)
    {
        $data = Sampledata::find($id);

        if (!$data) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $data->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }


    public function store_user()
    {

    }
}
