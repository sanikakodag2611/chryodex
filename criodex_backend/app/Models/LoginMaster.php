<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class LoginMaster extends Authenticatable
{
    use HasApiTokens, Notifiable;
    protected $table = 'login_masters';
    protected $fillable = [
        'employee_id',
        'username',
        'password',
        'status',
        'company_id',
        'year_id',
    ];

    protected $hidden = [
        'password',
    ];

    public function employee()
    {
        return $this->belongsTo(EmployeeMaster::class, 'employee_id');
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
