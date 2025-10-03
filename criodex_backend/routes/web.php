<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SampledataController;

Route::get('/home', function () {
    return view('welcome');
});
