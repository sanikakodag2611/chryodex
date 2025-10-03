<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable; // Instead of Model
use Laravel\Sanctum\HasApiTokens; // Sanctum trait
use Illuminate\Notifications\Notifiable;

class EmployeeMaster extends Model
{
    use HasApiTokens,Notifiable;

    protected $table = 'employee_master';

    protected $fillable = [
        'employee_name',
        'email',
        'username',
        'password',
        'contact_no',
        'address',
        'date_of_birth',
        'gender',
        'state_id',
        'district_id',
        'city',
        'pan_card',
        'designation_id',
        'department_id',
        'company_id',
        'year_id',
        'status',
    ];

    public function login()
    {
        return $this->hasOne(LoginMaster::class, 'employee_id');
    }

    public function company()
    {
        return $this->belongsTo(CompanyMaster::class, 'company_id');
    }

    public function year()
    {
        return $this->belongsTo(YearMaster::class, 'year_id');
    }
}
