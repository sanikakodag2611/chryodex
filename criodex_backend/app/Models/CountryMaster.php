<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CountryMaster extends Model
{
    protected $table = 'country_masters';  

    protected $fillable = [
        'country_name',
        'country_abbr',
        'country_code',
        'status',
    ];

    public function states()
    {
        return $this->hasMany(StateMaster::class, 'id');
    }

    
}
