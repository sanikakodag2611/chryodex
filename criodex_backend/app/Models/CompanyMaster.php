<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class CompanyMaster extends Model
{
    use HasFactory;

    protected $table = 'company_masters';

    protected $fillable = [
        'company_name',
        'contact_person',
        'country_id',
        'state_id',
        'city',
        'company_address',
        'gstin_uin',
        'pan_no',
        'contact_no',
        'email',
        'website',
    ];

}
