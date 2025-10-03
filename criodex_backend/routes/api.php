<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\chartcontroller;
use App\Http\Controllers\StateController;
use App\Http\Controllers\SampleController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\DistrictController;
use App\Http\Middleware\CheckCompanySession;
use App\Http\Controllers\CreditNoteController;
use App\Http\Controllers\YearMasterController;
use App\Http\Controllers\LoginMasterController;
use App\Http\Controllers\ProductChartController;
use App\Http\Controllers\CompanyMasterController;
use App\Http\Controllers\CountryMasterController;
use App\Http\Controllers\ProductMasterController;
use App\Http\Controllers\EmployeeMasterController;
use App\Http\Controllers\DepartmentMasterController;
use App\Http\Controllers\DesignationMasterController;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');



Route::get('/sampledata', [SampleController::class,'index']);
Route::post('/sampledata', [SampleController::class, 'store']);
Route::get('/sampledata/{id}', [SampleController::class, 'show']);
Route::put('/sampledata/{id}', [SampleController::class, 'update']);
Route::delete('/sampledata/{id}', [SampleController::class, 'destroy']);

//-----------------Login----------------------------------
Route::post('/login',[LoginMasterController::class,'login']);
Route::middleware('auth:sanctum')->post('/logout', [LoginMasterController::class, 'logout']);

//-------------------Company Master-------------------------------
Route::middleware('auth:sanctum')->group(function () {});
Route::get('/company',[CompanyMasterController::class,'index']);
Route::post('/company', [CompanyMasterController::class, 'create']);
Route::get('/company/{id}', [CompanyMasterController::class, 'show']);
Route::put('/company/{id}', [CompanyMasterController::class, 'update']);
Route::delete('/company/{id}', [CompanyMasterController::class, 'destroy']);
Route::get('/state_country_vise/{id}', [CompanyMasterController::class, 'state_country_vise']);

//---------------Year Master--------------------------------
Route::middleware('auth:sanctum')->group(function () {});
Route::get('/years', [YearMasterController::class, 'index']);
Route::post('/years', [YearMasterController::class, 'store']);
Route::put('/years/{id}', [YearMasterController::class, 'update']);
Route::delete('/years/{id}', [YearMasterController::class, 'destroy']);


//------------------Employee Master--------------------------
Route::get('/employee', [EmployeeMasterController::class, 'index']);
Route::post('/employee', [EmployeeMasterController::class, 'store']);
Route::get('/employee/{id}', [EmployeeMasterController::class, 'show']);
Route::put('/employee/{id}', [EmployeeMasterController::class, 'update']);
Route::delete('/employee/{id}', [EmployeeMasterController::class, 'destroy']);
Route::get('/district_state_vise',[EmployeeMasterController::class,'district_state_vise']);

//------------------Country-----------------------------------
Route::get('/countries', [CountryMasterController::class, 'index']);
Route::post('/countries', [CountryMasterController::class, 'store']);
Route::get('/countries/{id}', [CountryMasterController::class, 'show']);
Route::put('/countries/{id}', [CountryMasterController::class, 'update']);
Route::delete('/countries/{id}', [CountryMasterController::class, 'destroy']);

//--------------------State-------------------------------------
Route::get('/states', [StateController::class, 'index']);
Route::post('/states', [StateController::class, 'store']);
Route::get('/states/{id}', [StateController::class, 'show']);
Route::put('/states/{id}', [StateController::class, 'update']);
Route::delete('/states/{id}', [StateController::class, 'destroy']);

//--------------------Distrcit Master----------------------------
Route::get('/district', [DistrictController::class, 'index']);
Route::post('/district', [DistrictController::class, 'store']);
Route::get('/district/{id}', [DistrictController::class, 'show']);
Route::put('/district/{id}', [DistrictController::class, 'update']);
Route::delete('/district/{id}', [DistrictController::class, 'destroy']);

//----------------Department------------------------------------
Route::post('/departments', [DepartmentMasterController::class, 'store']);
Route::get('/departments', [DepartmentMasterController::class, 'index']);
Route::get('/departments/{id}', [DepartmentMasterController::class, 'show']);
Route::put('/departments/{id}', [DepartmentMasterController::class, 'update']);
Route::delete('/departments/{id}', [DepartmentMasterController::class, 'destroy']);

//---------------Designation-------------------------------------------
Route::post('/designation', [DesignationMasterController::class, 'store']);
Route::get('/designation', [DesignationMasterController::class, 'index']);
Route::get('/designation/{id}', [DesignationMasterController::class, 'show']);
Route::put('/designation/{id}', [DesignationMasterController::class, 'update']);
Route::delete('/designation/{id}', [DesignationMasterController::class, 'destroy']);

//----------------------------Product-----------------------------------------
Route::get('/products', [ProductMasterController::class, 'index']);       
Route::post('/products', [ProductMasterController::class, 'store']);     
Route::get('/products/{id}', [ProductMasterController::class, 'show']);   
Route::put('/products/{id}', [ProductMasterController::class, 'update']);  
Route::delete('/products/{id}', [ProductMasterController::class, 'destroy']);

//---------------------------Upload File--------------------------------------
Route::post('/upload-invoice', [InvoiceController::class, 'import']);
Route::get('/invoices', [InvoiceController::class, 'index']);
Route::post('/invoices/update-duplicates', [InvoiceController::class, 'updateDuplicates']);

Route::post('/upload-credit-note', [CreditNoteController::class, 'import']);
Route::get('/CreditNote', [CreditNoteController::class, 'index']);
Route::post('/credit-notes/update-duplicates', [CreditNoteController::class, 'updateDuplicates']);



//----------------------------Products Charts---------------------------------
Route::get('/profit-chart', [ProductChartController::class, 'profitReport']);





Route::middleware('auth:sanctum')->group(function () {
 
Route::get('/date-wise', [chartcontroller::class, 'dateWise']);
Route::get('/city-wise', [chartcontroller::class, 'cityWise']);
Route::get('/salesman-wise', [chartcontroller::class, 'salesmanWise']);
Route::get('/city-salesman', [chartcontroller::class, 'salesmenInCity']);
Route::get('/city-salesman-dates', [chartcontroller::class, 'salesmanDates']);
Route::get('/salesman-city', [chartcontroller::class, 'salesmanInCities']);
Route::get('/sales-details', [chartcontroller::class, 'salesDetails']);
Route::get('/product-details', [chartcontroller::class, 'productDetails']);
Route::get('/salesman-details', [chartcontroller::class, 'salesmanDetails']);
Route::get('/city-details', [chartcontroller::class, 'cityDetails']);
Route::get('/sales-totals', [chartcontroller::class, 'salesDetailsSummary']);
Route::get('/product-wise', [chartcontroller::class, 'productWise']);
Route::get('/totals', [chartcontroller::class, 'totals']);
});
 