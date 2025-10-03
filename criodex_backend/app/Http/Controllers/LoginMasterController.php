<?php

namespace App\Http\Controllers;

use App\Models\LoginMaster;
use Illuminate\Http\Request;
use App\Models\EmployeeMaster;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;

class LoginMasterController extends Controller
{ 
    public function login(Request $request)
    {
        // Validate input
        $validator = Validator::make($request->all(), [
            'username' => 'required|string',
            'password' => 'required|string',
            'company_id' => 'required|numeric',
            'year_id' => 'required|numeric',

        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $login = LoginMaster::where('username',$request->username)
                ->where('company_id', $request->company_id)
                ->where('year_id', $request->year_id)
                ->first();
        // Get login record
        // $login = LoginMaster::where('username', $request->username)->first();

        if (!$login || !Hash::check($request->password, $login->password)) {
            return response()->json([
                'status' => false,
                'message' => 'Invalid username or password'
            ], 401);
        }

        // Get related employee
        $employee = EmployeeMaster::find($login->employee_id);

        if (!$employee) {
            return response()->json([
                'status' => false,
                'message' => 'Employee not found'
            ], 404);
        }

        $token = $employee->createToken('auth-token')->plainTextToken;

        

        // Store session data
        // Session::put('login_id', $login->id);
        // Session::put('employee', $employee);
        // Session::put('company_id', $employee->company_id);
        // Session::put('year_id', $employee->year_id);

       

        return response()->json([
            'status' => true,
            'token' => $token,
            'employee'     => $employee, 
            'company_id'   => $employee->company_id,
            'year_id'      => $employee->year_id
        ]);
        
        // return response()->json([
        //     'status' => true,
        //     'message' => 'Login successful',
        //     'employee' => [
        //         'id' => Session::get('employee'),
        //         'username' => $login->username,
        //         'company_id' => Session::get('company_id'),
        //         'year_id' => Session::get('year_id'),
        //     ],
        // ]);

    }


    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        session()->flush();

        return response()->json([
            'message' => 'Logout successful'
        ]);
    }

}



 
    
