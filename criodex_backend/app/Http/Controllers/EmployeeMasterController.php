<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\EmployeeMaster;
use App\Models\LoginMaster;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth;

class EmployeeMasterController extends Controller
{
    public function index()
    {
        return response()->json(EmployeeMaster::all());
    }
    // public function store(Request $request)
    // {
    
    //     $validated = $request->validate([
    //         'employee_name' => 'required|string',
    //         'email' => 'required|email|unique:employee_master,email',
    //         'username'=> 'required|string|unique:employee_master,username',
    //         'password' => 'required|min:6',
    //         'contact_no' => 'required|string|max:15|unique:employee_master,contact_no',
    //         'address' => 'nullable|string',
    //         'date_of_birth' => 'required|date',
    //         'gender' => 'required',
    //         'state_id' => 'required|exists:state_masters,state_id',
    //         'company_id' => 'required|exists:company_masters,id',
    //         'year_id' => 'required|exists:year_masters,id',
    //         'city' => 'required|string',
    //         'pan_card' => 'required|string|size:10|regex:/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/|unique:employee_master,pan_card',
    //         'designation_id' => 'required|exists:designation_masters,id',
    //         'department_id' => 'required|exists:department_masters,id',
    //         'status'=>'required|in:0,1',
    //     ]);

    //     //  $validated = $request->validate([
    //     //     'employee_name' => 'required|string',
    //     //     'email' => 'required|email|unique:employee_master,email',
    //     //     'username'=> 'required|string|unique:employee_master,username',
    //     //     'password' => 'required|min:6',
    //     //     'contact_no' => 'required|string|max:15|unique:employee_master,contact_no',
    //     //     'address' => 'nullable|string',
    //     //     'date_of_birth' => 'required|date',
    //     //     'gender' => 'required|in:Male,Female,Other',
    //     //     'state_id' => 'required|exists:state_masters,state_id',
    //     //     'city' => 'required|string',
    //     //     'pan_card' => 'required|string|size:10|regex:/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/|unique:employee_master,pan_card',
    //     //     'designation_id' => 'required|exists:designation_masters,id',
    //     //     'department_id' => 'required|exists:department_masters,id',
    //     //     'status'=>'required|in:0,1',
    //     // ]);

    //     //  $loggedInEmployee = Auth::LoginMaster();

    //     // $company_id = $loggedInEmployee->company_id;
    //     // $year_id =  $loggedInEmployee->year_id;

         

    //     // if (!$company_id || !$year_id) {
    //     //     // fallback to request only if not logged in (optional)
    //     //     $company_id = $request->input('company_id');
    //     //     $year_id = $request->input('year_id');
    //     // }
        

    //     // // Fail if still not present
    //     // if (!$company_id || !$year_id) {
    //     //     return response()->json([
    //     //         'status' => false,
    //     //         'message' => 'Missing company_id or year_id. Please login or provide them.'
    //     //     ], 400);
    //     // }

    //     // $validated['company_id'] = $company_id;
    //     // $validated['year_id'] = $year_id;

    //     $validated['password'] = Hash::make($validated['password']);

    //     $employee = EmployeeMaster::create($validated);

    //     LoginMaster::create([
    //         'employee_id' => $employee->id,
    //         'username'    => $employee->username,
    //         'password'    => $employee->password,
    //         'status'      => 1,
            
    //     ]);

    //     return response()->json([
    //         'status' => true,
    //         'message' => 'Employee and login created successfully',
    //         'login_info' => [
    //             'username' => $employee->username,
    //             'password' => '****** (hidden)',  
    //         ],
    //         'data' => $employee
    //     ]);
    // }
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'employee_name' => 'required|string',
            'email' => 'required|email|unique:employee_master,email',
            'username'=> 'required|string|unique:employee_master,username',
            'password' => 'required|min:6',
            'contact_no' => 'required|string|max:15|unique:employee_master,contact_no',
            'address' => 'nullable|string',
            'date_of_birth' => 'required|date',
            'gender' => 'required',
            'state_id' => 'required|exists:state_masters,id',
            'district_id'=> 'required|exists:districtmasters,id',
            'company_id' => 'required|exists:company_masters,id',
            'year_id' => 'required|exists:year_masters,id',
            'city' => 'required|string',
            'pan_card' => [
                'required',
                'string',
                'size:10',
                'regex:/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/',
                'unique:employee_master,pan_card'
            ],
            'designation_id' => 'required|exists:designation_masters,id',
            'department_id' => 'required|exists:department_masters,id',
            'status'=>'required|in:0,1',
        ]);

        // If validation fails, return JSON response
        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $validated = $validator->validated();
        $validated['password'] = Hash::make($validated['password']);

        $employee = EmployeeMaster::create($validated);

        LoginMaster::create([
            'employee_id' => $employee->id,
            'username'    => $employee->username,
            'password'    => $employee->password, // already hashed
            'status'      => 1,
            'company_id' => $employee->company_id,
            'year_id' => $employee->year_id,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Employee and login created successfully',
            'login_info' => [
                'username' => $employee->username,
                'password' => '****** (hidden)',
            ],
            'data' => $employee
        ]);
    }


    public function show($id)
    {
        $employee = EmployeeMaster::findOrFail($id);
        return response()->json([
            'status' => true,
            'data' => $employee
        ]);
    }

    // public function update(Request $request, $id)
    // {
    //     // $company_id = session('company_id');
    //     // $year_id = session('year_id');

    //     // if (!$company_id || !$year_id) {
    //     //     return response()->json([
    //     //         'status' => false,
    //     //         'message' => 'Session expired or not found. Please log in again.'
    //     //     ], 401);
    //     // }

    //     $employee = EmployeeMaster::findOrFail($id);

    //     $validated = $request->validate([
    //         'employee_name' => 'required|string',
    //         'email' => 'required|email|unique:employee_master,email,' . $id,
    //         'username'=> 'required|string|unique:employee_master,username,' . $id,
    //         'password' => 'required|min:6',
    //         'contact_no' => 'required|string|max:15|unique:employee_master,contact_no,' . $id,
    //         'address' => 'nullable|string',
    //         'date_of_birth' => 'required|date',
    //         'gender' => 'required|in:Male,Female,Other',
    //         'state_id' => 'required|exists:state_masters,id',
    //         'city' => 'required|string',
    //         'pan_card' => 'required|string|size:10|regex:/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/|unique:employee_master,pan_card,' . $id,
    //         'designation_id' => 'required|exists:designation_masters,id',
    //         'department_id' => 'required|exists:department_masters,id',
    //         'status' => 'required|in:0,1',
    //     ]);

    //     $employee->update($validated);

    //     LoginMaster::where('employee_id', $employee->id)->update([
    //         'username' => $employee->username,
    //         'password' => $employee->password,
    //         'status'   => 1,
    //         'company_id' => $company_id,
    //         'year_id' => $year_id,
    //     ]);

    //     return response()->json([
    //         'status' => true,
    //         'message' => 'Employee and login updated successfully',
    //         'login_info' => [
    //             'username' => $employee->username,
    //             'password' => '****** (hidden)',
    //         ],
    //         'data' => $employee
    //     ]);
    // }

    public function update(Request $request, $id)
    {
        // Optional: Fetch from session if needed
        // $company_id = session('company_id');
        // $year_id = session('year_id');

        // if (!$company_id || !$year_id) {
        //     return response()->json([
        //         'status' => false,
        //         'message' => 'Session expired or not found. Please log in again.'
        //     ], 401);
        // }

        $employee = EmployeeMaster::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'employee_name' => 'required|string',
            'email' => 'required|email|unique:employee_master,email,' . $id,
            'username'=> 'required|string|unique:employee_master,username,' . $id,
            'password' => 'required|min:6',
            'contact_no' => 'required|string|max:15|unique:employee_master,contact_no,' . $id,
            'address' => 'nullable|string',
            'date_of_birth' => 'required|date',
            'gender' => 'required',
            'state_id' => 'required|exists:state_masters,id', // Adjust column name if different
            'district_id'=> 'required|exists:districtmasters,id',
            'company_id' => 'required|exists:company_masters,id',
            'year_id' => 'required|exists:year_masters,id',
            'city' => 'required|string',
            'pan_card' => [
                'required',
                'string',
                'size:10',
                'regex:/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/',
                'unique:employee_master,pan_card,' . $id
            ],
            'designation_id' => 'required|exists:designation_masters,id',
            'department_id' => 'required|exists:department_masters,id',
            'status' => 'required|in:0,1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $validated = $validator->validated();

        // Hash password if provided
        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $employee->update($validated);

        LoginMaster::where('employee_id', $employee->id)->update([
            'username' => $employee->username,
            'password' => $employee->password, // hashed
            'status'   => 1,
            'company_id' => $employee->company_id,
            'year_id' => $employee->year_id,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Employee and login updated successfully',
            'login_info' => [
                'username' => $employee->username,
                'password' => '****** (hidden)',
            ],
            'data' => $employee
        ]);
    }


    public function destroy($id)
    {
        $employee = EmployeeMaster::findOrFail($id);
        $employee->delete();

        return response()->json([
            'status' => true,
            'message' => 'Employee deleted successfully'
        ]);
    }
}
