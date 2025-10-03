<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DistrictMaster extends Model
{
    //
    protected $table = 'districtmasters';
    protected $fillable = [
        'district_name',
        'state_id',
        'company_id'
    ];
}
